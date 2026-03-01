import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
  merchantName?: string;
  category: string;
  available: boolean;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  selectedModifiers?: any[]; 
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
}

export interface MerchantCartSummary {
  merchantId: string;
  merchantName: string; // We might need to fetch this or store it in MenuItem
  totalItems: number;
  subtotal: number;
  items: CartItem[];
}

export interface CartContextType {
  cart: Cart | null;
  addToCart: (item: MenuItem, quantity: number, specialInstructions?: string, selectedModifiers?: any[]) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number; // Global total
  getCartItemCount: () => number; // Global count
  getMerchantCart: (merchantId: string) => MerchantCartSummary | null;
  getAllMerchantCarts: () => MerchantCartSummary[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: MenuItem; quantity: number; specialInstructions?: string; selectedModifiers?: any[] } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart | null };

function cartReducer(state: Cart | null, action: CartAction): Cart | null {
  const currentItems = state?.items || [];

  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity, specialInstructions, selectedModifiers } = action.payload;
      
      // Calculate price including modifiers
      let unitPrice = item.price;
      if (selectedModifiers) {
        selectedModifiers.forEach(mod => {
          unitPrice += (mod.price || 0);
        });
      }
      const itemTotalPrice = unitPrice * quantity;

      // Check if identical item exists (same id, options, modifiers)
      const existingItemIndex = currentItems.findIndex(
        cartItem => 
          cartItem.menuItem.id === item.id && 
          cartItem.specialInstructions === specialInstructions &&
          JSON.stringify(cartItem.selectedModifiers) === JSON.stringify(selectedModifiers)
      );
      
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = currentItems.map((cartItem, index) => {
          if (index === existingItemIndex) {
            const newQuantity = cartItem.quantity + quantity;
            return {
              ...cartItem,
              quantity: newQuantity,
              totalPrice: unitPrice * newQuantity,
            };
          }
          return cartItem;
        });
      } else {
        // Add new item
        const newCartItem: CartItem = {
          id: `${item.id}-${Date.now()}`,
          menuItem: item,
          quantity,
          specialInstructions,
          selectedModifiers,
          totalPrice: itemTotalPrice,
        };
        newItems = [...currentItems, newCartItem];
      }
      
      return { items: newItems };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = currentItems.filter(item => item.id !== action.payload.itemId);
      return { items: newItems };
    }
    
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        const newItems = currentItems.filter(item => item.id !== itemId);
        return { items: newItems };
      }
      
      const newItems = currentItems.map(item => {
        if (item.id === itemId) {
          // Recalculate price
          let unitPrice = item.menuItem.price;
          if (item.selectedModifiers) {
            item.selectedModifiers.forEach(mod => {
              unitPrice += (mod.price || 0);
            });
          }
          return {
            ...item,
            quantity,
            totalPrice: unitPrice * quantity,
          };
        }
        return item;
      });
      
      return { items: newItems };
    }
    
    case 'CLEAR_CART':
      return { items: [] };
    
    case 'LOAD_CART':
      return action.payload || { items: [] };
    
    default:
      return state || { items: [] };
  }
}

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedCart) {
          dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        if (cart) {
          await AsyncStorage.setItem('cart', JSON.stringify(cart));
        }
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };
    saveCart();
  }, [cart]);

  const addToCart = (item: MenuItem, quantity: number, specialInstructions?: string, selectedModifiers?: any[]) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity, specialInstructions, selectedModifiers } });
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return cart?.items.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
  };

  const getCartItemCount = () => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  const getMerchantCart = (merchantId: string): MerchantCartSummary | null => {
    if (!cart) return null;
    const merchantItems = cart.items.filter(item => String(item.menuItem.restaurantId) === String(merchantId));
    
    if (merchantItems.length === 0) return null;

    // Use the name from the first item if available
    const merchantName = merchantItems[0]?.menuItem.merchantName || 'Merchant';

    const subtotal = merchantItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalItems = merchantItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      merchantId,
      merchantName, // We might need to improve this
      totalItems,
      subtotal,
      items: merchantItems
    };
  };

  const getAllMerchantCarts = (): MerchantCartSummary[] => {
    if (!cart) return [];
    
    const groups: Record<string, CartItem[]> = {};
    
    cart.items.forEach(item => {
      const mId = String(item.menuItem.restaurantId);
      if (!groups[mId]) groups[mId] = [];
      groups[mId].push(item);
    });

    return Object.keys(groups).map(merchantId => {
      const items = groups[merchantId];
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      
      const merchantName = items[0]?.menuItem.merchantName || 'Merchant';
      
      return {
        merchantId,
        merchantName,
        totalItems,
        subtotal,
        items
      };
    });
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    getMerchantCart,
    getAllMerchantCarts
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

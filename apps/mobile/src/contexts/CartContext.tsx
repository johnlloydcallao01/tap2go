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
  category: string;
  available: boolean;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  restaurantId: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export interface CartContextType {
  cart: Cart | null;
  addToCart: (item: MenuItem, quantity: number, specialInstructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
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
  | { type: 'ADD_ITEM'; payload: { item: MenuItem; quantity: number; specialInstructions?: string } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart | null };

function cartReducer(state: Cart | null, action: CartAction): Cart | null {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity, specialInstructions } = action.payload;
      
      if (!state || state.restaurantId !== item.restaurantId) {
        // Create new cart or replace if different restaurant
        const newCartItem: CartItem = {
          id: `${item.id}-${Date.now()}`,
          menuItem: item,
          quantity,
          specialInstructions,
          totalPrice: item.price * quantity,
        };
        
        const subtotal = newCartItem.totalPrice;
        const deliveryFee = 5.99; // Default delivery fee
        const tax = subtotal * 0.08; // 8% tax
        
        return {
          items: [newCartItem],
          restaurantId: item.restaurantId,
          subtotal,
          deliveryFee,
          tax,
          total: subtotal + deliveryFee + tax,
        };
      }
      
      // Add to existing cart
      const existingItemIndex = state.items.findIndex(
        cartItem => cartItem.menuItem.id === item.id && cartItem.specialInstructions === specialInstructions
      );
      
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = state.items.map((cartItem, index) =>
          index === existingItemIndex
            ? {
                ...cartItem,
                quantity: cartItem.quantity + quantity,
                totalPrice: (cartItem.quantity + quantity) * cartItem.menuItem.price,
              }
            : cartItem
        );
      } else {
        // Add new item
        const newCartItem: CartItem = {
          id: `${item.id}-${Date.now()}`,
          menuItem: item,
          quantity,
          specialInstructions,
          totalPrice: item.price * quantity,
        };
        newItems = [...state.items, newCartItem];
      }
      
      const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.08;
      
      return {
        ...state,
        items: newItems,
        subtotal,
        tax,
        total: subtotal + state.deliveryFee + tax,
      };
    }
    
    case 'REMOVE_ITEM': {
      if (!state) return null;
      
      const newItems = state.items.filter(item => item.id !== action.payload.itemId);
      
      if (newItems.length === 0) {
        return null;
      }
      
      const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.08;
      
      return {
        ...state,
        items: newItems,
        subtotal,
        tax,
        total: subtotal + state.deliveryFee + tax,
      };
    }
    
    case 'UPDATE_QUANTITY': {
      if (!state) return null;
      
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { itemId } });
      }
      
      const newItems = state.items.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              totalPrice: item.menuItem.price * quantity,
            }
          : item
      );
      
      const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const tax = subtotal * 0.08;
      
      return {
        ...state,
        items: newItems,
        subtotal,
        tax,
        total: subtotal + state.deliveryFee + tax,
      };
    }
    
    case 'CLEAR_CART':
      return null;
    
    case 'LOAD_CART':
      return action.payload;
    
    default:
      return state;
  }
}

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, dispatch] = useReducer(cartReducer, null);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        }
      } catch (error) {
        console.error('Error loading cart from AsyncStorage:', error);
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
        } else {
          await AsyncStorage.removeItem('cart');
        }
      } catch (error) {
        console.error('Error saving cart to AsyncStorage:', error);
      }
    };

    saveCart();
  }, [cart]);

  const addToCart = (item: MenuItem, quantity: number, specialInstructions?: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { item, quantity, specialInstructions } });
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
    return cart?.total || 0;
  };

  const getCartItemCount = () => {
    return cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

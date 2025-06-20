'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Cart, CartItem, MenuItem, CartContextType } from '@/types';

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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
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

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Cart Slice - Enhanced version of your existing cart logic
 * Maintains compatibility with your current cart patterns
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem, MenuItem, Address, PaymentMethod } from '@/types';

// Cart state interface
export interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  // Enhanced features
  savedCarts: Cart[]; // Multiple saved carts
  recentlyRemoved: CartItem[]; // For undo functionality
  promoCode: string | null;
  promoDiscount: number;
  // Checkout state
  checkoutStep: 'cart' | 'address' | 'payment' | 'confirmation';
  deliveryAddress: Address | null;
  paymentMethod: PaymentMethod | null;
}

// Initial state
const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  savedCarts: [],
  recentlyRemoved: [],
  promoCode: null,
  promoDiscount: 0,
  checkoutStep: 'cart',
  deliveryAddress: null,
  paymentMethod: null,
};

// Async thunks
export const loadCartFromStorage = createAsyncThunk(
  'cart/loadFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        return JSON.parse(savedCart) as Cart;
      }
      return null;
    } catch {
      return rejectWithValue('Failed to load cart from storage');
    }
  }
);

export const saveCartToStorage = createAsyncThunk(
  'cart/saveToStorage',
  async (cart: Cart | null, { rejectWithValue }) => {
    try {
      if (cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
      } else {
        localStorage.removeItem('cart');
      }
      return cart;
    } catch {
      return rejectWithValue('Failed to save cart to storage');
    }
  }
);

export const validatePromoCode = createAsyncThunk(
  'cart/validatePromoCode',
  async ({ code, cartTotal }: { code: string; cartTotal: number }, { rejectWithValue }) => {
    try {
      // TODO: Implement promo code validation API call
      // For now, return mock validation
      const mockPromos: Record<string, number> = {
        'SAVE10': 0.1,
        'SAVE20': 0.2,
        'NEWUSER': 0.15,
      };
      
      const discount = mockPromos[code.toUpperCase()];
      if (discount) {
        return { code, discount, amount: cartTotal * discount };
      } else {
        throw new Error('Invalid promo code');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Promo code validation failed');
    }
  }
);

// Helper functions (same logic as your existing cart)
const calculateCartTotals = (items: CartItem[], deliveryFee: number = 5.99, promoDiscount: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.08; // 8% tax
  const discountAmount = subtotal * promoDiscount;
  const total = subtotal + deliveryFee + tax - discountAmount;
  
  return {
    subtotal,
    deliveryFee,
    tax,
    discountAmount,
    total,
  };
};

const createCartItem = (item: MenuItem, quantity: number, specialInstructions?: string): CartItem => {
  return {
    id: `${item.id}-${Date.now()}`,
    menuItem: item,
    quantity,
    specialInstructions,
    totalPrice: item.price * quantity,
  };
};

// Cart slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Core cart operations (matching your existing logic)
    addToCart: (state, action: PayloadAction<{ item: MenuItem; quantity: number; specialInstructions?: string }>) => {
      const { item, quantity, specialInstructions } = action.payload;
      
      if (!state.cart || state.cart.restaurantId !== item.restaurantId) {
        // Create new cart or replace if different restaurant
        const newCartItem = createCartItem(item, quantity, specialInstructions);
        const totals = calculateCartTotals([newCartItem], 5.99, state.promoDiscount);
        
        state.cart = {
          items: [newCartItem],
          restaurantId: item.restaurantId,
          ...totals,
        };
      } else {
        // Add to existing cart
        const existingItemIndex = state.cart.items.findIndex(
          cartItem => cartItem.menuItem.id === item.id && 
          cartItem.specialInstructions === specialInstructions
        );
        
        if (existingItemIndex >= 0) {
          // Update existing item
          state.cart.items[existingItemIndex].quantity += quantity;
          state.cart.items[existingItemIndex].totalPrice = 
            state.cart.items[existingItemIndex].menuItem.price * state.cart.items[existingItemIndex].quantity;
        } else {
          // Add new item
          const newCartItem = createCartItem(item, quantity, specialInstructions);
          state.cart.items.push(newCartItem);
        }
        
        // Recalculate totals
        const totals = calculateCartTotals(state.cart.items, state.cart.deliveryFee, state.promoDiscount);
        Object.assign(state.cart, totals);
      }
      
      state.error = null;
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      if (!state.cart) return;
      
      const itemId = action.payload;
      const itemIndex = state.cart.items.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        // Store for undo functionality
        const removedItem = state.cart.items[itemIndex];
        state.recentlyRemoved.unshift(removedItem);
        // Keep only last 5 removed items
        state.recentlyRemoved = state.recentlyRemoved.slice(0, 5);
        
        // Remove item
        state.cart.items.splice(itemIndex, 1);
        
        if (state.cart.items.length === 0) {
          state.cart = null;
          state.promoCode = null;
          state.promoDiscount = 0;
        } else {
          // Recalculate totals
          const totals = calculateCartTotals(state.cart.items, state.cart.deliveryFee, state.promoDiscount);
          Object.assign(state.cart, totals);
        }
      }
    },
    
    updateQuantity: (state, action: PayloadAction<{ itemId: string; quantity: number }>) => {
      if (!state.cart) return;
      
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cartSlice.caseReducers.removeFromCart(state, { type: 'cart/removeFromCart', payload: itemId });
        return;
      }
      
      const itemIndex = state.cart.items.findIndex(item => item.id === itemId);
      if (itemIndex >= 0) {
        state.cart.items[itemIndex].quantity = quantity;
        state.cart.items[itemIndex].totalPrice = 
          state.cart.items[itemIndex].menuItem.price * quantity;
        
        // Recalculate totals
        const totals = calculateCartTotals(state.cart.items, state.cart.deliveryFee, state.promoDiscount);
        Object.assign(state.cart, totals);
      }
    },
    
    clearCart: (state) => {
      if (state.cart) {
        // Save current cart to recently removed for potential recovery
        state.recentlyRemoved = [...state.cart.items];
      }
      state.cart = null;
      state.promoCode = null;
      state.promoDiscount = 0;
      state.checkoutStep = 'cart';
      state.deliveryAddress = null;
      state.paymentMethod = null;
    },
    
    // Enhanced features
    undoRemoveItem: (state, action: PayloadAction<number>) => {
      const index = action.payload || 0;
      if (state.recentlyRemoved[index]) {
        const itemToRestore = state.recentlyRemoved[index];
        state.recentlyRemoved.splice(index, 1);
        
        // Add back to cart
        cartSlice.caseReducers.addToCart(state, {
          type: 'cart/addToCart',
          payload: {
            item: itemToRestore.menuItem,
            quantity: itemToRestore.quantity,
            specialInstructions: itemToRestore.specialInstructions,
          },
        });
      }
    },
    
    applyPromoCode: (state, action: PayloadAction<{ code: string; discount: number }>) => {
      const { code, discount } = action.payload;
      state.promoCode = code;
      state.promoDiscount = discount;
      
      if (state.cart) {
        const totals = calculateCartTotals(state.cart.items, state.cart.deliveryFee, discount);
        Object.assign(state.cart, totals);
      }
    },
    
    removePromoCode: (state) => {
      state.promoCode = null;
      state.promoDiscount = 0;
      
      if (state.cart) {
        const totals = calculateCartTotals(state.cart.items, state.cart.deliveryFee, 0);
        Object.assign(state.cart, totals);
      }
    },
    
    // Checkout flow
    setCheckoutStep: (state, action: PayloadAction<CartState['checkoutStep']>) => {
      state.checkoutStep = action.payload;
    },
    
    setDeliveryAddress: (state, action: PayloadAction<Address>) => {
      state.deliveryAddress = action.payload;
    },

    setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.paymentMethod = action.payload;
    },
    
    // Save cart for later
    saveCurrentCart: (state, action: PayloadAction<string>) => {
      if (state.cart) {
        const savedCart = {
          ...state.cart,
          savedAt: new Date().toISOString(),
          name: action.payload,
        };
        state.savedCarts.push(savedCart as Cart);
      }
    },
    
    loadSavedCart: (state, action: PayloadAction<number>) => {
      const savedCart = state.savedCarts[action.payload];
      if (savedCart) {
        state.cart = { ...savedCart };
        // Remove saved timestamp and name
        delete (state.cart as Cart & { savedAt?: string; name?: string }).savedAt;
        delete (state.cart as Cart & { savedAt?: string; name?: string }).name;
      }
    },
    
    deleteSavedCart: (state, action: PayloadAction<number>) => {
      state.savedCarts.splice(action.payload, 1);
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  
  extraReducers: (builder) => {
    // Load from storage
    builder
      .addCase(loadCartFromStorage.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.loading = false;
      })
      .addCase(loadCartFromStorage.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
    
    // Save to storage
    builder
      .addCase(saveCartToStorage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(saveCartToStorage.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
    
    // Promo code validation
    builder
      .addCase(validatePromoCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validatePromoCode.fulfilled, (state, action) => {
        const { code, discount } = action.payload;
        state.promoCode = code;
        state.promoDiscount = discount;
        state.loading = false;
        
        if (state.cart) {
          const totals = calculateCartTotals(state.cart.items, state.cart.deliveryFee, discount);
          Object.assign(state.cart, totals);
        }
      })
      .addCase(validatePromoCode.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  undoRemoveItem,
  applyPromoCode,
  removePromoCode,
  setCheckoutStep,
  setDeliveryAddress,
  setPaymentMethod,
  saveCurrentCart,
  loadSavedCart,
  deleteSavedCart,
  setError,
  setLoading,
} = cartSlice.actions;

// Selectors
export const selectCart = (state: { cart: CartState }) => state.cart.cart;
export const selectCartItems = (state: { cart: CartState }) => state.cart.cart?.items || [];
export const selectCartTotal = (state: { cart: CartState }) => state.cart.cart?.total || 0;
export const selectCartItemCount = (state: { cart: CartState }) => 
  state.cart.cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
export const selectCartLoading = (state: { cart: CartState }) => state.cart.loading;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;
export const selectPromoCode = (state: { cart: CartState }) => state.cart.promoCode;
export const selectCheckoutStep = (state: { cart: CartState }) => state.cart.checkoutStep;

export default cartSlice;

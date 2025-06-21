/**
 * Vendor Slice - Vendor panel state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Restaurant, MenuItem, Order, VendorAnalytics } from '@/types';

export interface VendorState {
  restaurant: Restaurant | null;
  menu: MenuItem[];
  orders: Order[];
  analytics: VendorAnalytics | null;
  loading: boolean;
  error: string | null;
  menuEditMode: boolean;
  selectedOrders: string[];
}

const initialState: VendorState = {
  restaurant: null,
  menu: [],
  orders: [],
  analytics: null,
  loading: false,
  error: null,
  menuEditMode: false,
  selectedOrders: [],
};

const vendorSlice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    setRestaurant: (state, action: PayloadAction<Restaurant>) => {
      state.restaurant = action.payload;
    },
    setMenu: (state, action: PayloadAction<MenuItem[]>) => {
      state.menu = action.payload;
    },
    setMenuEditMode: (state, action: PayloadAction<boolean>) => {
      state.menuEditMode = action.payload;
    },
    setSelectedOrders: (state, action: PayloadAction<string[]>) => {
      state.selectedOrders = action.payload;
    },
  },
});

export const { setRestaurant, setMenu, setMenuEditMode, setSelectedOrders } = vendorSlice.actions;
export default vendorSlice;

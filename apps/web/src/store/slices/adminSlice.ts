/**
 * Admin Slice - Admin panel state management
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { User, VendorProfile } from '@/types';

interface AdminState {
  dashboardStats: {
    totalUsers: number;
    totalVendors: number;
    totalDrivers: number;
    totalOrders: number;
    totalRevenue: number;
    activeOrders: number;
    pendingVendors: number;
    pendingDrivers: number;
  };
  users: User[];
  vendors: VendorProfile[];
  drivers: User[]; // Will be replaced with Driver type when implemented
  loading: boolean;
  error: string | null;
  selectedItems: string[];
  bulkActions: boolean;
}

const initialState: AdminState = {
  dashboardStats: {
    totalUsers: 0,
    totalVendors: 0,
    totalDrivers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    pendingVendors: 0,
    pendingDrivers: 0,
  },
  users: [],
  vendors: [],
  drivers: [],
  loading: false,
  error: null,
  selectedItems: [],
  bulkActions: false,
};

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Implement API call
      return {
        totalUsers: 0,
        totalVendors: 0,
        totalDrivers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeOrders: 0,
        pendingVendors: 0,
        pendingDrivers: 0,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch dashboard stats');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setSelectedItems: (state, action: PayloadAction<string[]>) => {
      state.selectedItems = action.payload;
    },
    toggleBulkActions: (state) => {
      state.bulkActions = !state.bulkActions;
      if (!state.bulkActions) {
        state.selectedItems = [];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
        state.loading = false;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedItems, toggleBulkActions } = adminSlice.actions;
export default adminSlice;

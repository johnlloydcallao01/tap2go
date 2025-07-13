/**
 * Customers Slice - Customer management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Address } from '@/types';

export interface CustomerPreferences {
  dietaryRestrictions: string[];
  favoriteRestaurants: string[];
  defaultPaymentMethod?: string;
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  orderHistory: string[];
  preferences: CustomerPreferences;
  loyaltyPoints: number;
}

export interface CustomersState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  customers: [],
  loading: false,
  error: null,
};

interface FetchCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'loyaltyPoints' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params: FetchCustomersParams, { rejectWithValue }) => {
    try {
      // TODO: Implement API call
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch customers');
    }
  }
);

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
        state.loading = false;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default customersSlice;

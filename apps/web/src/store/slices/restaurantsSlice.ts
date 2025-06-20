/**
 * Restaurants Slice - Restaurant and menu management
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Restaurant, MenuItem } from '@/types';

interface RestaurantsState {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  menu: MenuItem[];
  loading: boolean;
  error: string | null;
  filters: {
    category?: string;
    cuisine?: string;
    priceRange?: [number, number];
    rating?: number;
    deliveryTime?: number;
    isOpen?: boolean;
  };
  searchQuery: string;
  sortBy: 'distance' | 'rating' | 'delivery_time' | 'price';
}

const initialState: RestaurantsState = {
  restaurants: [],
  currentRestaurant: null,
  menu: [],
  loading: false,
  error: null,
  filters: {},
  searchQuery: '',
  sortBy: 'distance',
};

interface FetchRestaurantsParams {
  location?: {
    lat: number;
    lng: number;
    radius?: number;
  };
  filters?: RestaurantsState['filters'];
  search?: string;
  sortBy?: RestaurantsState['sortBy'];
  page?: number;
  limit?: number;
}

export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async (params: FetchRestaurantsParams, { rejectWithValue }) => {
    try {
      // TODO: Implement API call
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch restaurants');
    }
  }
);

const restaurantsSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setCurrentRestaurant: (state, action: PayloadAction<Restaurant | null>) => {
      state.currentRestaurant = action.payload;
    },
    setFilters: (state, action: PayloadAction<RestaurantsState['filters']>) => {
      state.filters = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action: PayloadAction<RestaurantsState['sortBy']>) => {
      state.sortBy = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.restaurants = action.payload;
        state.loading = false;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentRestaurant, setFilters, setSearchQuery, setSortBy } = restaurantsSlice.actions;
export default restaurantsSlice;

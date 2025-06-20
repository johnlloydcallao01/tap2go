/**
 * Drivers Slice - Driver management and tracking
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'active' | 'suspended';
  isOnline: boolean;
  location: {
    lat: number;
    lng: number;
    address: string;
    lastUpdated: string;
  };
  vehicle: {
    type: 'motorcycle' | 'bicycle' | 'car';
    model: string;
    plateNumber: string;
  };
  rating: number;
  totalDeliveries: number;
  earnings: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
}

interface DriversState {
  drivers: Driver[];
  availableDrivers: Driver[];
  currentDriver: Driver | null;
  loading: boolean;
  error: string | null;
  realTimeTracking: boolean;
}

const initialState: DriversState = {
  drivers: [],
  availableDrivers: [],
  currentDriver: null,
  loading: false,
  error: null,
  realTimeTracking: false,
};

interface FetchDriversParams {
  status?: Driver['status'];
  isOnline?: boolean;
  location?: {
    lat: number;
    lng: number;
    radius: number; // in kilometers
  };
}

export const fetchDrivers = createAsyncThunk(
  'drivers/fetchDrivers',
  async (params: FetchDriversParams, { rejectWithValue }) => {
    try {
      // TODO: Implement API call
      return [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch drivers');
    }
  }
);

const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    updateDriverLocation: (state, action: PayloadAction<{ driverId: string; location: Driver['location'] }>) => {
      const { driverId, location } = action.payload;
      const driver = state.drivers.find(d => d.id === driverId);
      if (driver) {
        driver.location = location;
      }
    },
    setDriverOnlineStatus: (state, action: PayloadAction<{ driverId: string; isOnline: boolean }>) => {
      const { driverId, isOnline } = action.payload;
      const driver = state.drivers.find(d => d.id === driverId);
      if (driver) {
        driver.isOnline = isOnline;
      }
    },
    setRealTimeTracking: (state, action: PayloadAction<boolean>) => {
      state.realTimeTracking = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.drivers = action.payload;
        state.availableDrivers = action.payload.filter((d: Driver) => d.isOnline && d.status === 'active');
        state.loading = false;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateDriverLocation, setDriverOnlineStatus, setRealTimeTracking } = driversSlice.actions;
export default driversSlice;

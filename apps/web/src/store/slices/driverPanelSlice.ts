/**
 * Driver Panel Slice - Driver panel state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Order } from '@/types';

export interface DriverProfile extends User {
  role: 'driver';
  vehicle: {
    type: 'motorcycle' | 'bicycle' | 'car';
    model: string;
    plateNumber: string;
  };
  rating: number;
  totalDeliveries: number;
  status: 'pending' | 'approved' | 'active' | 'suspended';
}

export interface DriverPanelState {
  profile: DriverProfile | null;
  currentDelivery: Order | null;
  earnings: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  isOnline: boolean;
  location: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: DriverPanelState = {
  profile: null,
  currentDelivery: null,
  earnings: {
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  },
  isOnline: false,
  location: null,
  loading: false,
  error: null,
};

const driverPanelSlice = createSlice({
  name: 'driverPanel',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<DriverProfile>) => {
      state.profile = action.payload;
    },
    setCurrentDelivery: (state, action: PayloadAction<Order>) => {
      state.currentDelivery = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    updateLocation: (state, action: PayloadAction<DriverPanelState['location']>) => {
      state.location = action.payload;
    },
    updateEarnings: (state, action: PayloadAction<Partial<DriverPanelState['earnings']>>) => {
      state.earnings = { ...state.earnings, ...action.payload };
    },
  },
});

export const { setProfile, setCurrentDelivery, setOnlineStatus, updateLocation, updateEarnings } = driverPanelSlice.actions;
export default driverPanelSlice;

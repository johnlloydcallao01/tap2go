/**
 * Real-time Slice - Real-time updates and connections
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OrderUpdate {
  orderId: string;
  status: string;
  timestamp: number;
  message?: string;
}

export interface RealTimeState {
  connections: Record<string, boolean>;
  orderUpdates: Record<string, OrderUpdate>;
  driverLocations: Record<string, { lat: number; lng: number; timestamp: number }>;
  isConnected: boolean;
  lastHeartbeat: number;
}

const initialState: RealTimeState = {
  connections: {},
  orderUpdates: {},
  driverLocations: {},
  isConnected: false,
  lastHeartbeat: 0,
};

const realTimeSlice = createSlice({
  name: 'realTime',
  initialState,
  reducers: {
    setConnection: (state, action: PayloadAction<{ id: string; connected: boolean }>) => {
      const { id, connected } = action.payload;
      state.connections[id] = connected;
    },
    updateOrderRealTime: (state, action: PayloadAction<{ orderId: string; update: OrderUpdate }>) => {
      const { orderId, update } = action.payload;
      state.orderUpdates[orderId] = update;
    },
    updateDriverLocation: (state, action: PayloadAction<{ driverId: string; location: { lat: number; lng: number } }>) => {
      const { driverId, location } = action.payload;
      state.driverLocations[driverId] = {
        ...location,
        timestamp: Date.now(),
      };
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      state.lastHeartbeat = Date.now();
    },
  },
});

export const { setConnection, updateOrderRealTime, updateDriverLocation, setConnected } = realTimeSlice.actions;
export default realTimeSlice;

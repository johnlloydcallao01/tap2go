/**
 * Real-time Middleware - Handle Firebase real-time updates
 */

import { Middleware, AnyAction, MiddlewareAPI, Dispatch, UnknownAction } from '@reduxjs/toolkit';
import type { User } from '@/types';
import type { RootState } from '../index';

export const realTimeMiddleware: Middleware = (store) => (next) => (action) => {
  // Type assertion for action
  const typedAction = action as AnyAction;

  // Handle real-time connection setup
  if (typedAction.type === 'auth/setUser' && typedAction.payload) {
    // Set up real-time listeners when user logs in
    setupRealTimeListeners(store as MiddlewareAPI<Dispatch<UnknownAction>, RootState>, typedAction.payload);
  }

  // Handle real-time disconnection
  if (typedAction.type === 'auth/clearAuth') {
    // Clean up real-time listeners when user logs out
    cleanupRealTimeListeners();
  }

  return next(action);
};

let realTimeListeners: Array<() => void> = [];

function setupRealTimeListeners(store: MiddlewareAPI<Dispatch<UnknownAction>, RootState>, user: User) {
  // TODO: Set up Firebase real-time listeners based on user role
  console.log('Setting up real-time listeners for user:', user.id);

  // Example: Listen to order updates for vendors
  if (user.role === 'vendor') {
    // Set up vendor-specific listeners
  }

  // Example: Listen to delivery updates for drivers
  if (user.role === 'driver') {
    // Set up driver-specific listeners
  }

  // Example: Listen to order status for customers
  if (user.role === 'customer') {
    // Set up customer-specific listeners
  }
}

function cleanupRealTimeListeners() {
  realTimeListeners.forEach(unsubscribe => unsubscribe());
  realTimeListeners = [];
  console.log('Cleaned up real-time listeners');
}

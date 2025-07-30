/**
 * Tap2Go Redux Store Configuration
 * Enterprise-grade state management for FoodPanda-level complexity
 * 
 * Architecture:
 * - Respects existing Firebase/Auth patterns
 * - Integrates with existing service layer
 * - Supports multi-panel architecture (Admin, Vendor, Driver, Customer)
 * - Optimized for real-time updates and scalability
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Core slices
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import cartSlice from './slices/cartSlice';

// Business logic slices
import ordersSlice from './slices/ordersSlice';
import restaurantsSlice from './slices/restaurantsSlice';
import customersSlice from './slices/customersSlice';

// Advanced features
import realTimeSlice from './slices/realTimeSlice';
import analyticsSlice from './slices/analyticsSlice';
import notificationsSlice from './slices/notificationsSlice';

// Panel-specific slices
import adminSlice from './slices/adminSlice';
import vendorSlice from './slices/vendorSlice';

// CMS slice
import cmsReducer from './slices/cmsSliceSimple';

// API slice for RTK Query
import { apiSlice } from './api/apiSlice';

// Middleware
import { analyticsMiddleware } from './middleware/analyticsMiddleware';
import { realTimeMiddleware } from './middleware/realTimeMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import { serializationMiddleware } from './middleware/serializationMiddleware';

// Root reducer configuration
const rootReducer = combineReducers({
  // Core state
  auth: authSlice.reducer,
  ui: uiSlice.reducer,
  cart: cartSlice.reducer,
  
  // Business logic
  orders: ordersSlice.reducer,
  restaurants: restaurantsSlice.reducer,
  customers: customersSlice.reducer,
  
  // Advanced features
  realTime: realTimeSlice.reducer,
  analytics: analyticsSlice.reducer,
  notifications: notificationsSlice.reducer,
  
  // Panel-specific
  admin: adminSlice.reducer,
  vendor: vendorSlice.reducer,

  // CMS
  cms: cmsReducer,

  // API
  api: apiSlice.reducer,
});

// Persistence configuration
const persistConfig = {
  key: 'tap2go-root',
  version: 1,
  storage,
  // Only persist essential data for performance
  whitelist: ['cart', 'ui', 'auth'], // Don't persist real-time data
  blacklist: ['api', 'realTime', 'analytics'], // Exclude API cache and real-time data
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: process.env.NODE_ENV === 'development' ? false : {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        // In production, we can be more specific about what to ignore
        ignoredActionPaths: ['meta.arg', 'meta.baseQueryMeta'],
        ignoredPaths: ['meta.arg', 'meta.baseQueryMeta'],
      },
      // Enable immutability checks in development
      immutableCheck: process.env.NODE_ENV === 'development',
    });

    return middleware
      .concat(serializationMiddleware)
      .concat(apiSlice.middleware)
      .concat(analyticsMiddleware)
      .concat(realTimeMiddleware)
      .concat(errorMiddleware);
  },

  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV === 'development',
});

// Persistor for redux-persist
export const persistor = persistStore(store);

// Type definitions for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks (will be created in hooks file)
export type AppStore = typeof store;

// Export all state types for proper TypeScript inference
export type { AuthState } from './slices/authSlice';
export type { UIState, Notification, Modal } from './slices/uiSlice';
export type { CartState } from './slices/cartSlice';
export type { OrdersState, Order, OrderFilters } from './slices/ordersSlice';
export type { RestaurantsState } from './slices/restaurantsSlice';
export type { CustomersState, Customer, CustomerPreferences } from './slices/customersSlice';
export type { RealTimeState, OrderUpdate } from './slices/realTimeSlice';
export type { AnalyticsState, AnalyticsMetrics, AnalyticsReport } from './slices/analyticsSlice';
export type { NotificationsState, Notification as NotificationItem } from './slices/notificationsSlice';
export type { AdminState } from './slices/adminSlice';
export type { VendorState } from './slices/vendorSlice';

// Store setup listener for RTK Query
import { setupListeners } from '@reduxjs/toolkit/query';
setupListeners(store.dispatch);

// Export for use in components
export default store;

/**
 * Store Architecture Notes:
 * 
 * 1. **Scalability**: Each slice handles specific domain logic
 * 2. **Performance**: Selective persistence and memoized selectors
 * 3. **Real-time**: Dedicated middleware for Firebase real-time updates
 * 4. **Multi-panel**: Separate slices for different user roles
 * 5. **Analytics**: Built-in analytics tracking middleware
 * 6. **Error handling**: Centralized error management
 * 7. **API management**: RTK Query for all server communication
 * 8. **Persistence**: Smart persistence strategy for offline support
 */

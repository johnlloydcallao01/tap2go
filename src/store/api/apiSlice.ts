/**
 * API Slice - RTK Query configuration
 * Centralized API management for all Tap2Go endpoints
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Simple base query
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    headers.set('content-type', 'application/json');
    return headers;
  },
});

// Main API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'User',
    'Restaurant',
    'MenuItem',
    'Order',
    'Driver',
    'Customer',
    'Vendor',
    'Admin',
    'Analytics',
    'Notification',
  ],
  endpoints: (builder) => ({
    // Basic endpoints - will be expanded later
    getRestaurants: builder.query<unknown[], unknown>({
      query: () => '/restaurants',
      providesTags: ['Restaurant'],
    }),

    getOrders: builder.query<unknown[], unknown>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetRestaurantsQuery,
  useGetOrdersQuery,
} = apiSlice;

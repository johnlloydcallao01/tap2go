/**
 * RTK Query API Slice - Redux Toolkit Query configuration
 * Centralized API management with caching and state management
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base query with auth handling
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    headers.set('content-type', 'application/json');
    
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
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
    'Review',
    'Category',
  ],
  endpoints: (builder) => ({
    // Restaurant endpoints
    getRestaurants: builder.query<unknown[], { 
      search?: string; 
      cuisine?: string; 
      location?: string; 
    }>({
      query: (params) => ({
        url: '/restaurants',
        params,
      }),
      providesTags: ['Restaurant'],
    }),

    getRestaurant: builder.query<unknown, string>({
      query: (id) => `/restaurants/${id}`,
      providesTags: (result, error, id) => [{ type: 'Restaurant', id }],
    }),

    // Menu endpoints
    getMenuItems: builder.query<unknown[], string>({
      query: (restaurantId) => `/restaurants/${restaurantId}/menu`,
      providesTags: (result, error, restaurantId) => [
        { type: 'MenuItem', id: 'LIST' },
        { type: 'Restaurant', id: restaurantId },
      ],
    }),

    getMenuItem: builder.query<unknown, string>({
      query: (id) => `/menu-items/${id}`,
      providesTags: (result, error, id) => [{ type: 'MenuItem', id }],
    }),

    // Order endpoints
    getOrders: builder.query<unknown[], { status?: string; userId?: string }>({
      query: (params) => ({
        url: '/orders',
        params,
      }),
      providesTags: ['Order'],
    }),

    getOrder: builder.query<unknown, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    createOrder: builder.mutation<unknown, unknown>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),

    updateOrderStatus: builder.mutation<unknown, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),

    // User endpoints
    getUserProfile: builder.query<unknown, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),

    updateUserProfile: builder.mutation<unknown, unknown>({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Analytics endpoints
    getRestaurantAnalytics: builder.query<unknown, {
      restaurantId: string;
      period: string;
    }>({
      query: ({ restaurantId, period }: { restaurantId: string; period: string }) =>
        `/analytics/restaurant/${restaurantId}?period=${period}`,
      providesTags: ['Analytics'],
    }),

    // Notification endpoints
    getNotifications: builder.query<unknown[], void>({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),

    markNotificationRead: builder.mutation<unknown, string>({
      query: (id: string) => ({
        url: `/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetRestaurantsQuery,
  useGetRestaurantQuery,
  useGetMenuItemsQuery,
  useGetMenuItemQuery,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetRestaurantAnalyticsQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} = apiSlice;

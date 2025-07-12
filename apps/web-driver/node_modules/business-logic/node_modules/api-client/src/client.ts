/**
 * API Client - Centralized API management for all Tap2Go endpoints
 */

import axios from 'axios';

// Axios-based API client
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Typed API methods
export const api = {
  // Restaurant endpoints
  restaurants: {
    getAll: () => apiClient.get('/restaurants'),
    getById: (id: string) => apiClient.get(`/restaurants/${id}`),
    create: (data: unknown) => apiClient.post('/restaurants', data),
    update: (id: string, data: unknown) => apiClient.put(`/restaurants/${id}`, data),
    delete: (id: string) => apiClient.delete(`/restaurants/${id}`),
  },

  // Menu endpoints
  menu: {
    getByRestaurant: (restaurantId: string) => apiClient.get(`/restaurants/${restaurantId}/menu`),
    getItem: (itemId: string) => apiClient.get(`/menu-items/${itemId}`),
    createItem: (data: unknown) => apiClient.post('/menu-items', data),
    updateItem: (itemId: string, data: unknown) => apiClient.put(`/menu-items/${itemId}`, data),
    deleteItem: (itemId: string) => apiClient.delete(`/menu-items/${itemId}`),
  },

  // Order endpoints
  orders: {
    getAll: () => apiClient.get('/orders'),
    getById: (id: string) => apiClient.get(`/orders/${id}`),
    create: (data: unknown) => apiClient.post('/orders', data),
    update: (id: string, data: unknown) => apiClient.put(`/orders/${id}`, data),
    cancel: (id: string) => apiClient.post(`/orders/${id}/cancel`),
  },

  // User endpoints
  users: {
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (data: unknown) => apiClient.put('/users/profile', data),
    getOrders: () => apiClient.get('/users/orders'),
  },

  // Auth endpoints
  auth: {
    login: (credentials: unknown) => apiClient.post('/auth/login', credentials),
    register: (userData: unknown) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    refreshToken: () => apiClient.post('/auth/refresh'),
  },
};

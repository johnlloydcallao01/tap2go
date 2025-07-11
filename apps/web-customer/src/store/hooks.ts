/**
 * Typed Redux Hooks for Tap2Go
 * Enterprise-grade hooks with TypeScript support
 */

import { useDispatch, useSelector, useStore } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch, AppStore } from './index';

// Typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = () => useStore<AppStore>();

/**
 * Custom hooks for common patterns
 */

// Auth state hook
export const useAuthState = () => {
  return useAppSelector((state) => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    loading: state.auth.loading,
    error: state.auth.error,
    isInitialized: state.auth.isInitialized,
  }));
};

// Cart state hook
export const useCartState = () => {
  return useAppSelector((state) => ({
    cart: state.cart.cart,
    items: state.cart.cart?.items || [],
    total: state.cart.cart?.total || 0,
    itemCount: state.cart.cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
    restaurantId: state.cart.cart?.restaurantId,
    loading: state.cart.loading,
    error: state.cart.error,
  }));
};

// UI state hook
export const useUIState = () => {
  return useAppSelector((state) => ({
    theme: state.ui.theme,
    sidebarOpen: state.ui.sidebarOpen,
    loading: state.ui.globalLoading,
    notifications: state.ui.notifications,
    modals: state.ui.modals,
  }));
};

// Orders state hook
export const useOrdersState = () => {
  return useAppSelector((state) => ({
    orders: state.orders.orders,
    currentOrder: state.orders.currentOrder,
    loading: state.orders.loading,
    error: state.orders.error,
    filters: state.orders.filters,
  }));
};

// Real-time state hook
export const useRealTimeState = () => {
  return useAppSelector((state) => ({
    connections: state.realTime.connections,
    orderUpdates: state.realTime.orderUpdates,
    driverLocations: state.realTime.driverLocations,
    isConnected: state.realTime.isConnected,
  }));
};

// Admin panel state hook
export const useAdminState = () => {
  return useAppSelector((state) => ({
    stats: state.admin.dashboardStats,
    users: state.admin.users,
    vendors: state.admin.vendors,
    drivers: state.admin.drivers,
    loading: state.admin.loading,
    error: state.admin.error,
  }));
};

// Vendor panel state hook
export const useVendorState = () => {
  return useAppSelector((state) => ({
    restaurant: state.vendor.restaurant,
    menu: state.vendor.menu,
    orders: state.vendor.orders,
    analytics: state.vendor.analytics,
    loading: state.vendor.loading,
    error: state.vendor.error,
  }));
};

// Driver panel state hook
export const useDriverState = () => {
  return useAppSelector((state) => ({
    profile: state.driverPanel.profile,
    currentDelivery: state.driverPanel.currentDelivery,
    earnings: state.driverPanel.earnings,
    isOnline: state.driverPanel.isOnline,
    location: state.driverPanel.location,
    loading: state.driverPanel.loading,
    error: state.driverPanel.error,
  }));
};

// Notifications state hook
export const useNotificationsState = () => {
  return useAppSelector((state) => ({
    notifications: state.notifications.notifications,
    unreadCount: state.notifications.unreadCount,
    loading: state.notifications.loading,
    error: state.notifications.error,
  }));
};

// Analytics state hook
export const useAnalyticsState = () => {
  return useAppSelector((state) => ({
    metrics: state.analytics.metrics,
    reports: state.analytics.reports,
    loading: state.analytics.loading,
    error: state.analytics.error,
  }));
};

// CMS state hook
export const useCMSState = () => {
  return useAppSelector((state) => ({
    posts: state.cms.posts,
    pages: state.cms.pages,
    categories: state.cms.categories,
    tags: state.cms.tags,
    stats: state.cms.stats,
    loading: state.cms.loading,
    activeTab: state.cms.activeTab,
    viewMode: state.cms.viewMode,
    error: state.cms.error,
    lastUpdated: state.cms.lastUpdated,
    isLoading: state.cms.loading.global || state.cms.loading.posts || state.cms.loading.pages,
  }));
};

/**
 * Role-based hooks for different user types
 */

// Check if user has specific role
export const useUserRole = () => {
  const { user } = useAuthState();
  
  return {
    isAdmin: user?.role === 'admin',
    isVendor: user?.role === 'vendor',
    isDriver: user?.role === 'driver',
    isCustomer: user?.role === 'customer',
    role: user?.role,
  };
};

// Check if user has specific permissions
export const usePermissions = () => {
  const { user } = useAuthState();

  const hasPermission = (permission: string) => {
    if (!user) return false;
    // Add your permission logic here based on user role/permissions
    console.log('Checking permission:', permission);
    return true; // Placeholder
  };

  return { hasPermission };
};

/**
 * Performance hooks with memoization
 */

// Memoized restaurant selector
export const useRestaurantById = (restaurantId: string | undefined) => {
  return useAppSelector((state) => 
    restaurantId ? state.restaurants.restaurants.find(r => r.id === restaurantId) : undefined
  );
};

// Memoized order selector
export const useOrderById = (orderId: string | undefined) => {
  return useAppSelector((state) => 
    orderId ? state.orders.orders.find(o => o.id === orderId) : undefined
  );
};

// Memoized driver selector
export const useDriverById = (driverId: string | undefined) => {
  return useAppSelector((state) => 
    driverId ? state.drivers.drivers.find(d => d.id === driverId) : undefined
  );
};

const reduxHooks = {
  useAppDispatch,
  useAppSelector,
  useAppStore,
  useAuthState,
  useCartState,
  useUIState,
  useOrdersState,
  useRealTimeState,
  useAdminState,
  useVendorState,
  useDriverState,
  useNotificationsState,
  useAnalyticsState,
  useUserRole,
  usePermissions,
  useRestaurantById,
  useOrderById,
  useDriverById,
};

export default reduxHooks;

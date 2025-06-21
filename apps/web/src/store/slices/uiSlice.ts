/**
 * UI Slice - Global UI state management
 * Handles theme, modals, notifications, loading states, etc.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// UI state interfaces
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: string;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  createdAt: number;
}

export interface Modal {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  isOpen: boolean;
}

export interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Layout
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // Loading states
  globalLoading: boolean;
  pageLoading: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // Modals
  modals: Modal[];
  
  // Search
  searchQuery: string;
  searchResults: Array<{ id: string; type: string; title: string; description?: string }>;
  searchLoading: boolean;

  // Filters
  activeFilters: Record<string, unknown>;
  
  // Location
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  
  // App state
  isOnline: boolean;
  lastActivity: number;
  
  // Panel-specific UI state
  adminPanel: {
    activeTab: string;
    selectedItems: string[];
    bulkActions: boolean;
  };
  
  vendorPanel: {
    activeSection: string;
    menuEditMode: boolean;
    selectedOrders: string[];
  };
  
  driverPanel: {
    mapView: 'normal' | 'satellite' | 'terrain';
    showTraffic: boolean;
    autoAcceptOrders: boolean;
  };
  
  // Customer app
  customerApp: {
    viewMode: 'list' | 'grid' | 'map';
    sortBy: 'distance' | 'rating' | 'delivery_time' | 'price';
    showFilters: boolean;
  };
}

// Initial state
const initialState: UIState = {
  theme: 'light',
  sidebarOpen: false,
  mobileMenuOpen: false,
  globalLoading: false,
  pageLoading: false,
  notifications: [],
  modals: [],
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  activeFilters: {},
  currentLocation: null,
  isOnline: true,
  lastActivity: Date.now(),
  adminPanel: {
    activeTab: 'dashboard',
    selectedItems: [],
    bulkActions: false,
  },
  vendorPanel: {
    activeSection: 'dashboard',
    menuEditMode: false,
    selectedOrders: [],
  },
  driverPanel: {
    mapView: 'normal',
    showTraffic: true,
    autoAcceptOrders: false,
  },
  customerApp: {
    viewMode: 'list',
    sortBy: 'distance',
    showFilters: false,
  },
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload;
    },
    
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Layout
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    
    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.pageLoading = action.payload;
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      };
      state.notifications.unshift(notification);
      
      // Limit to 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10);
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modals
    openModal: (state, action: PayloadAction<{ type: string; props?: Record<string, unknown> }>) => {
      const { type, props } = action.payload;
      const modal: Modal = {
        id: `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        props,
        isOpen: true,
      };
      state.modals.push(modal);
    },
    
    closeModal: (state, action: PayloadAction<string>) => {
      const modalIndex = state.modals.findIndex(m => m.id === action.payload);
      if (modalIndex >= 0) {
        state.modals[modalIndex].isOpen = false;
      }
    },
    
    removeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(m => m.id !== action.payload);
    },
    
    closeAllModals: (state) => {
      state.modals.forEach(modal => {
        modal.isOpen = false;
      });
    },
    
    // Search
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    setSearchResults: (state, action: PayloadAction<Array<{ id: string; type: string; title: string; description?: string }>>) => {
      state.searchResults = action.payload;
    },
    
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.searchLoading = action.payload;
    },
    
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
      state.searchLoading = false;
    },
    
    // Filters
    setFilter: (state, action: PayloadAction<{ key: string; value: unknown }>) => {
      const { key, value } = action.payload;
      state.activeFilters[key] = value;
    },
    
    removeFilter: (state, action: PayloadAction<string>) => {
      delete state.activeFilters[action.payload];
    },
    
    clearFilters: (state) => {
      state.activeFilters = {};
    },
    
    // Location
    setCurrentLocation: (state, action: PayloadAction<UIState['currentLocation']>) => {
      state.currentLocation = action.payload;
    },
    
    // App state
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    },
    
    // Admin panel
    setAdminActiveTab: (state, action: PayloadAction<string>) => {
      state.adminPanel.activeTab = action.payload;
    },
    
    setAdminSelectedItems: (state, action: PayloadAction<string[]>) => {
      state.adminPanel.selectedItems = action.payload;
    },
    
    toggleAdminBulkActions: (state) => {
      state.adminPanel.bulkActions = !state.adminPanel.bulkActions;
      if (!state.adminPanel.bulkActions) {
        state.adminPanel.selectedItems = [];
      }
    },
    
    // Vendor panel
    setVendorActiveSection: (state, action: PayloadAction<string>) => {
      state.vendorPanel.activeSection = action.payload;
    },
    
    setVendorMenuEditMode: (state, action: PayloadAction<boolean>) => {
      state.vendorPanel.menuEditMode = action.payload;
    },
    
    setVendorSelectedOrders: (state, action: PayloadAction<string[]>) => {
      state.vendorPanel.selectedOrders = action.payload;
    },
    
    // Driver panel
    setDriverMapView: (state, action: PayloadAction<UIState['driverPanel']['mapView']>) => {
      state.driverPanel.mapView = action.payload;
    },
    
    toggleDriverTraffic: (state) => {
      state.driverPanel.showTraffic = !state.driverPanel.showTraffic;
    },
    
    setDriverAutoAccept: (state, action: PayloadAction<boolean>) => {
      state.driverPanel.autoAcceptOrders = action.payload;
    },
    
    // Customer app
    setCustomerViewMode: (state, action: PayloadAction<UIState['customerApp']['viewMode']>) => {
      state.customerApp.viewMode = action.payload;
    },
    
    setCustomerSortBy: (state, action: PayloadAction<UIState['customerApp']['sortBy']>) => {
      state.customerApp.sortBy = action.payload;
    },
    
    toggleCustomerFilters: (state) => {
      state.customerApp.showFilters = !state.customerApp.showFilters;
    },
    
    // Utility actions
    showSuccessNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const { title, message } = action.payload;
      uiSlice.caseReducers.addNotification(state, {
        type: 'ui/addNotification',
        payload: {
          type: 'success',
          title,
          message,
          duration: 5000,
        },
      });
    },
    
    showErrorNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const { title, message } = action.payload;
      uiSlice.caseReducers.addNotification(state, {
        type: 'ui/addNotification',
        payload: {
          type: 'error',
          title,
          message,
          duration: 8000,
        },
      });
    },
    
    showWarningNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const { title, message } = action.payload;
      uiSlice.caseReducers.addNotification(state, {
        type: 'ui/addNotification',
        payload: {
          type: 'warning',
          title,
          message,
          duration: 6000,
        },
      });
    },
    
    showInfoNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const { title, message } = action.payload;
      uiSlice.caseReducers.addNotification(state, {
        type: 'ui/addNotification',
        payload: {
          type: 'info',
          title,
          message,
          duration: 5000,
        },
      });
    },
  },
});

// Export actions
export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setMobileMenuOpen,
  toggleMobileMenu,
  setGlobalLoading,
  setPageLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  removeModal,
  closeAllModals,
  setSearchQuery,
  setSearchResults,
  setSearchLoading,
  clearSearch,
  setFilter,
  removeFilter,
  clearFilters,
  setCurrentLocation,
  setOnlineStatus,
  updateLastActivity,
  setAdminActiveTab,
  setAdminSelectedItems,
  toggleAdminBulkActions,
  setVendorActiveSection,
  setVendorMenuEditMode,
  setVendorSelectedOrders,
  setDriverMapView,
  toggleDriverTraffic,
  setDriverAutoAccept,
  setCustomerViewMode,
  setCustomerSortBy,
  toggleCustomerFilters,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
} = uiSlice.actions;

// Selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.globalLoading;
export const selectCurrentLocation = (state: { ui: UIState }) => state.ui.currentLocation;
export const selectIsOnline = (state: { ui: UIState }) => state.ui.isOnline;

export default uiSlice;

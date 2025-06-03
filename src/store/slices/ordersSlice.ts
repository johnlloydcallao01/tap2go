/**
 * Orders Slice - Comprehensive order management
 * Handles orders across all user roles (Customer, Vendor, Driver, Admin)
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Order interfaces
interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  driverId?: string;
  restaurantId: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  items: Array<{
    id: string;
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
    modifiers?: Array<{
      name: string;
      price: number;
    }>;
  }>;
  pricing: {
    subtotal: number;
    tax: number;
    deliveryFee: number;
    platformFee: number;
    discount: number;
    total: number;
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    instructions?: string;
  };
  paymentMethod: {
    type: 'card' | 'gcash' | 'grab_pay' | 'paymaya' | 'cash';
    details?: Record<string, unknown>;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  rating?: {
    food: number;
    delivery: number;
    overall: number;
    comment?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface OrderFilters {
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  restaurantId?: string;
  customerId?: string;
  driverId?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface OrdersState {
  // Orders data
  orders: Order[];
  currentOrder: Order | null;
  
  // Loading states
  loading: boolean;
  creating: boolean;
  updating: boolean;
  
  // Error handling
  error: string | null;
  
  // Filters and pagination
  filters: OrderFilters;
  sortBy: 'createdAt' | 'total' | 'status' | 'estimatedDeliveryTime';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  totalPages: number;
  totalCount: number;
  
  // Real-time updates
  liveUpdates: boolean;
  lastUpdate: number;
  
  // Role-specific views
  customerOrders: Order[];
  vendorOrders: Order[];
  driverOrders: Order[];
  adminOrders: Order[];
  
  // Statistics
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    pickedUp: number;
    delivered: number;
    cancelled: number;
    todayRevenue: number;
    averageOrderValue: number;
  };
}

// Initial state
const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  loading: false,
  creating: false,
  updating: false,
  error: null,
  filters: {},
  sortBy: 'createdAt',
  sortOrder: 'desc',
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  liveUpdates: true,
  lastUpdate: 0,
  customerOrders: [],
  vendorOrders: [],
  driverOrders: [],
  adminOrders: [],
  stats: {
    total: 0,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    pickedUp: 0,
    delivered: 0,
    cancelled: 0,
    todayRevenue: 0,
    averageOrderValue: 0,
  },
};

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ 
    filters, 
    page = 1, 
    limit = 20, 
    role 
  }: { 
    filters?: OrderFilters; 
    page?: number; 
    limit?: number; 
    role?: 'customer' | 'vendor' | 'driver' | 'admin';
  }, { rejectWithValue }) => {
    try {
      // TODO: Implement API call to fetch orders
      // This will integrate with your existing Firebase/API patterns
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, page, limit, role }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch orders');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: Partial<Order>, { rejectWithValue }) => {
    try {
      // TODO: Implement order creation API call
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ 
    orderId, 
    status, 
    note 
  }: { 
    orderId: string; 
    status: Order['status']; 
    note?: string; 
  }, { rejectWithValue }) => {
    try {
      // TODO: Implement status update API call
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update order status');
    }
  }
);

export const assignDriver = createAsyncThunk(
  'orders/assignDriver',
  async ({ orderId, driverId }: { orderId: string; driverId: string }, { rejectWithValue }) => {
    try {
      // TODO: Implement driver assignment API call
      const response = await fetch(`/api/orders/${orderId}/assign-driver`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign driver');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to assign driver');
    }
  }
);

export const rateOrder = createAsyncThunk(
  'orders/rateOrder',
  async ({ 
    orderId, 
    rating 
  }: { 
    orderId: string; 
    rating: Order['rating']; 
  }, { rejectWithValue }) => {
    try {
      // TODO: Implement rating API call
      const response = await fetch(`/api/orders/${orderId}/rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to rate order');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to rate order');
    }
  }
);

// Orders slice
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Real-time order updates
    updateOrderRealTime: (state, action: PayloadAction<Order>) => {
      const updatedOrder = action.payload;
      const index = state.orders.findIndex(order => order.id === updatedOrder.id);
      
      if (index >= 0) {
        state.orders[index] = updatedOrder;
      } else {
        state.orders.unshift(updatedOrder);
      }
      
      // Update role-specific arrays
      if (updatedOrder.customerId) {
        const customerIndex = state.customerOrders.findIndex(o => o.id === updatedOrder.id);
        if (customerIndex >= 0) {
          state.customerOrders[customerIndex] = updatedOrder;
        }
      }
      
      if (updatedOrder.vendorId) {
        const vendorIndex = state.vendorOrders.findIndex(o => o.id === updatedOrder.id);
        if (vendorIndex >= 0) {
          state.vendorOrders[vendorIndex] = updatedOrder;
        }
      }
      
      if (updatedOrder.driverId) {
        const driverIndex = state.driverOrders.findIndex(o => o.id === updatedOrder.id);
        if (driverIndex >= 0) {
          state.driverOrders[driverIndex] = updatedOrder;
        }
      }
      
      state.lastUpdate = Date.now();
    },
    
    // Set current order
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    
    // Filters
    setFilters: (state, action: PayloadAction<OrderFilters>) => {
      state.filters = action.payload;
      state.currentPage = 1; // Reset to first page when filters change
    },
    
    updateFilter: (state, action: PayloadAction<{ key: keyof OrderFilters; value: OrderFilters[keyof OrderFilters] }>) => {
      const { key, value } = action.payload;
      if (value !== undefined) {
        // Type assertion is safe here as we're using the correct key-value pair
        (state.filters as Record<string, OrderFilters[keyof OrderFilters]>)[key] = value;
      } else {
        delete state.filters[key];
      }
      state.currentPage = 1;
    },
    
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    
    // Sorting
    setSorting: (state, action: PayloadAction<{ sortBy: OrdersState['sortBy']; sortOrder: OrdersState['sortOrder'] }>) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
    
    // Pagination
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // Live updates
    setLiveUpdates: (state, action: PayloadAction<boolean>) => {
      state.liveUpdates = action.payload;
    },
    
    // Statistics
    updateStats: (state, action: PayloadAction<Partial<OrdersState['stats']>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setCreating: (state, action: PayloadAction<boolean>) => {
      state.creating = action.payload;
    },
    
    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.updating = action.payload;
    },
  },
  
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        const { orders, totalCount, totalPages, role } = action.payload;
        
        state.orders = orders;
        state.totalCount = totalCount;
        state.totalPages = totalPages;
        state.loading = false;
        
        // Update role-specific arrays
        if (role === 'customer') {
          state.customerOrders = orders;
        } else if (role === 'vendor') {
          state.vendorOrders = orders;
        } else if (role === 'driver') {
          state.driverOrders = orders;
        } else if (role === 'admin') {
          state.adminOrders = orders;
        }
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        const newOrder = action.payload;
        state.orders.unshift(newOrder);
        state.currentOrder = newOrder;
        state.creating = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      });
    
    // Update order status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        ordersSlice.caseReducers.updateOrderRealTime(state, { type: 'orders/updateOrderRealTime', payload: updatedOrder });
        state.updating = false;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });
    
    // Assign driver
    builder
      .addCase(assignDriver.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        ordersSlice.caseReducers.updateOrderRealTime(state, { type: 'orders/updateOrderRealTime', payload: updatedOrder });
      });
    
    // Rate order
    builder
      .addCase(rateOrder.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        ordersSlice.caseReducers.updateOrderRealTime(state, { type: 'orders/updateOrderRealTime', payload: updatedOrder });
      });
  },
});

// Export actions
export const {
  updateOrderRealTime,
  setCurrentOrder,
  setFilters,
  updateFilter,
  clearFilters,
  setSorting,
  setCurrentPage,
  setLiveUpdates,
  updateStats,
  setError,
  clearError,
  setLoading,
  setCreating,
  setUpdating,
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state: { orders: OrdersState }) => state.orders.orders;
export const selectCurrentOrder = (state: { orders: OrdersState }) => state.orders.currentOrder;
export const selectOrdersLoading = (state: { orders: OrdersState }) => state.orders.loading;
export const selectOrdersError = (state: { orders: OrdersState }) => state.orders.error;
export const selectOrderFilters = (state: { orders: OrdersState }) => state.orders.filters;
export const selectOrderStats = (state: { orders: OrdersState }) => state.orders.stats;

export default ordersSlice;

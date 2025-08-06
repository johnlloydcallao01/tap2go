/**
 * Server Action Types
 * 
 * TypeScript types for server actions and form handling.
 */

/**
 * Standard result type for server actions
 */
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  fieldErrors?: Record<string, string[]>;
}

/**
 * Form state for server actions with useFormState
 */
export interface FormState<T = unknown> extends ActionResult<T> {
  timestamp?: number;
}

/**
 * Authentication action types
 */
export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'vendor' | 'driver';
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
}

/**
 * Order action types
 */
export interface CreateOrderData {
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  deliveryAddress: string;
  paymentMethodId: string;
  specialInstructions?: string;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
  customizations?: string[];
  specialRequests?: string;
}

export interface UpdateOrderStatusData {
  orderId: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  updatedBy: string;
  notes?: string;
}

export interface CancelOrderData {
  orderId: string;
  cancelledBy: string;
  reason: string;
}

export interface RateOrderData {
  orderId: string;
  customerId: string;
  rating: number;
  review?: string;
}

/**
 * Restaurant action types
 */
export interface CreateRestaurantData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisine: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  deliveryFee: number;
  minimumOrder: number;
  deliveryTime: {
    min: number;
    max: number;
  };
  ownerId: string;
}

export interface UpdateRestaurantData {
  restaurantId: string;
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  cuisine?: string[];
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  deliveryFee?: number;
  minimumOrder?: number;
  deliveryTime?: {
    min: number;
    max: number;
  };
  isOpen?: boolean;
}

/**
 * Menu item action types
 */
export interface CreateMenuItemData {
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergens: string[];
  preparationTime: number;
}

export interface UpdateMenuItemData {
  menuItemId: string;
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  allergens?: string[];
  preparationTime?: number;
  available?: boolean;
}

/**
 * File upload action types
 */
export interface FileUploadData {
  file: File;
  folder?: string;
  publicId?: string;
  tags?: string[];
}

export interface FileUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Search action types
 */
export interface SearchQuery {
  query: string;
  filters?: {
    cuisine?: string[];
    priceRange?: string[];
    rating?: number;
    deliveryTime?: number;
    location?: {
      lat: number;
      lng: number;
      radius: number;
    };
  };
  sort?: 'relevance' | 'rating' | 'delivery_time' | 'price' | 'distance';
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Notification action types
 */
export interface SendNotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

/**
 * Analytics action types
 */
export interface TrackEventData {
  event: string;
  userId?: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

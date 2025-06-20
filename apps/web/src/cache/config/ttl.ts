/**
 * TTL (Time-To-Live) Configuration for Tap2Go Caching System
 * Based on enterprise caching blueprint and professional best practices
 */

// ===== CACHE TTL CONSTANTS (in seconds) =====

export const TTL = {
  // Browser/Client Caching (0-5ms)
  CLIENT: {
    STATIC_ASSETS: 365 * 24 * 60 * 60, // 1 year
    API_RESPONSES: 5 * 60, // 5 minutes
    USER_SESSION: 30 * 60, // 30 minutes
    SEARCH_RESULTS: 2 * 60, // 2 minutes
  },

  // CDN Caching (10-50ms)
  CDN: {
    STATIC_ASSETS: 365 * 24 * 60 * 60, // 1 year
    RESTAURANT_MENUS: 60 * 60, // 1 hour
    CATEGORY_PAGES: 30 * 60, // 30 minutes
    SEARCH_RESULTS: 5 * 60, // 5 minutes
    USER_PROFILES: 15 * 60, // 15 minutes
  },

  // Application-Level Caching (5-20ms)
  APP: {
    RESTAURANT_LISTINGS: 10 * 60, // 10 minutes
    MENU_ITEMS: 5 * 60, // 5 minutes
    ORDER_DETAILS: 1 * 60, // 1 minute
    USER_PROFILES: 30 * 60, // 30 minutes
    POPULAR_RESTAURANTS: 5 * 60, // 5 minutes
    COMPUTED_VALUES: 10 * 60, // 10 minutes
    API_RESPONSES: 5 * 60, // 5 minutes
  },

  // Distributed Cache (Redis) (20-100ms)
  REDIS: {
    USER_SESSIONS: 24 * 60 * 60, // 24 hours
    API_RESPONSES: 60 * 60, // 1 hour
    SEARCH_RESULTS: 30 * 60, // 30 minutes
    RESTAURANT_METADATA: 2 * 60 * 60, // 2 hours
    MENU_CACHE: 60 * 60, // 1 hour
    USER_PREFERENCES: 7 * 24 * 60 * 60, // 7 days
    CART_DATA: 2 * 60 * 60, // 2 hours
    ORDER_HISTORY: 30 * 24 * 60 * 60, // 30 days
    FAVORITES: 30 * 24 * 60 * 60, // 30 days (persistent)
  },

  // Database-Level Caching (100-500ms)
  DATABASE: {
    FIRESTORE_QUERIES: 5 * 60, // 5 minutes
    DOCUMENT_SNAPSHOTS: 2 * 60, // 2 minutes
    AGGREGATION_RESULTS: 10 * 60, // 10 minutes
    ELASTICSEARCH_RESULTS: 5 * 60, // 5 minutes
    ELASTICSEARCH_AGGREGATIONS: 10 * 60, // 10 minutes
    AUTOCOMPLETE_SUGGESTIONS: 60 * 60, // 1 hour
  },

  // Real-time Data (Short TTL)
  REALTIME: {
    ORDER_STATUS: 30, // 30 seconds
    DRIVER_LOCATION: 10, // 10 seconds
    LIVE_NOTIFICATIONS: 60, // 1 minute
    PAYMENT_STATUS: 30, // 30 seconds
  },

  // Analytics & Reporting (Longer TTL)
  ANALYTICS: {
    DAILY_REPORTS: 24 * 60 * 60, // 24 hours
    WEEKLY_REPORTS: 7 * 24 * 60 * 60, // 7 days
    MONTHLY_REPORTS: 30 * 24 * 60 * 60, // 30 days
    USER_BEHAVIOR: 60 * 60, // 1 hour
  },
} as const;

// ===== ENVIRONMENT-SPECIFIC OVERRIDES =====

export const getEnvironmentTTL = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  if (isDevelopment) {
    // Shorter TTLs for development
    return {
      ...TTL,
      REDIS: {
        ...TTL.REDIS,
        USER_SESSIONS: 60 * 60, // 1 hour instead of 24
        API_RESPONSES: 5 * 60, // 5 minutes instead of 1 hour
        SEARCH_RESULTS: 2 * 60, // 2 minutes instead of 30
      },
    };
  }

  if (isProduction) {
    // Production TTLs (use defaults)
    return TTL;
  }

  // Default to production settings
  return TTL;
};

// ===== CACHE KEY PATTERNS =====

export const CACHE_KEYS = {
  // User-related keys
  USER_SESSION: (userId: string) => `user:${userId}:session`,
  USER_PROFILE: (userId: string) => `user:${userId}:profile`,
  USER_PREFERENCES: (userId: string) => `user:${userId}:preferences`,
  USER_CART: (userId: string) => `user:${userId}:cart`,
  USER_FAVORITES: (userId: string) => `user:${userId}:favorites`,
  USER_ORDER_HISTORY: (userId: string) => `user:${userId}:orders`,

  // Restaurant-related keys
  RESTAURANT: (restaurantId: string) => `restaurant:${restaurantId}`,
  RESTAURANT_MENU: (restaurantId: string) => `restaurant:${restaurantId}:menu`,
  RESTAURANT_METADATA: (restaurantId: string) => `restaurant:${restaurantId}:meta`,
  POPULAR_RESTAURANTS: (region?: string) => `restaurants:popular${region ? `:${region}` : ''}`,
  RESTAURANT_SEARCH: (query: string, filters?: string) => `search:restaurants:${query}${filters ? `:${filters}` : ''}`,

  // Order-related keys
  ORDER: (orderId: string) => `order:${orderId}`,
  ORDER_STATUS: (orderId: string) => `order:${orderId}:status`,
  ACTIVE_ORDERS: (userId: string) => `user:${userId}:orders:active`,

  // Search-related keys
  SEARCH_RESULTS: (query: string, type: string) => `search:${type}:${query}`,
  AUTOCOMPLETE: (query: string, type: string) => `autocomplete:${type}:${query}`,

  // Analytics keys
  ANALYTICS: (type: string, period: string) => `analytics:${type}:${period}`,
  USER_BEHAVIOR: (userId: string, action: string) => `behavior:${userId}:${action}`,
} as const;

// ===== CACHE INVALIDATION PATTERNS =====

export const INVALIDATION_PATTERNS = {
  // When restaurant data changes
  RESTAURANT_UPDATE: (restaurantId: string) => [
    CACHE_KEYS.RESTAURANT(restaurantId),
    CACHE_KEYS.RESTAURANT_MENU(restaurantId),
    CACHE_KEYS.RESTAURANT_METADATA(restaurantId),
    `search:restaurants:*`, // Wildcard for all restaurant searches
    `restaurants:popular*`, // All popular restaurant lists
  ],

  // When menu changes
  MENU_UPDATE: (restaurantId: string) => [
    CACHE_KEYS.RESTAURANT_MENU(restaurantId),
    CACHE_KEYS.RESTAURANT(restaurantId),
    `search:menu:*`,
  ],

  // When user data changes
  USER_UPDATE: (userId: string) => [
    CACHE_KEYS.USER_PROFILE(userId),
    CACHE_KEYS.USER_PREFERENCES(userId),
    CACHE_KEYS.USER_SESSION(userId),
  ],

  // When order status changes
  ORDER_UPDATE: (orderId: string, userId: string) => [
    CACHE_KEYS.ORDER(orderId),
    CACHE_KEYS.ORDER_STATUS(orderId),
    CACHE_KEYS.ACTIVE_ORDERS(userId),
    CACHE_KEYS.USER_ORDER_HISTORY(userId),
  ],
} as const;

// ===== MEMORY ALLOCATION PERCENTAGES =====

export const MEMORY_ALLOCATION = {
  USER_SESSIONS: 0.30, // 30%
  RESTAURANT_DATA: 0.25, // 25%
  SEARCH_RESULTS: 0.20, // 20%
  API_RESPONSES: 0.15, // 15%
  BUFFER: 0.10, // 10% reserved for spikes
} as const;

// ===== EXPORT DEFAULT TTL CONFIGURATION =====

export default getEnvironmentTTL();

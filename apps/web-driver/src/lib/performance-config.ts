/**
 * Enterprise Performance Configuration
 * Centralized performance optimization settings
 */

import React from 'react';

// Cache configuration
export const CACHE_CONFIG = {
  // Static assets cache duration (1 year)
  STATIC_ASSETS: 31536000,
  
  // API response cache duration (5 minutes)
  API_RESPONSES: 300,
  
  // User session cache (1 hour)
  USER_SESSION: 3600,
  
  // Restaurant data cache (15 minutes)
  RESTAURANT_DATA: 900,
  
  // Menu items cache (10 minutes)
  MENU_ITEMS: 600,
  
  // Search results cache (5 minutes)
  SEARCH_RESULTS: 300,
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals targets
  LCP_TARGET: 2500, // Largest Contentful Paint (ms)
  FID_TARGET: 100,  // First Input Delay (ms)
  CLS_TARGET: 0.1,  // Cumulative Layout Shift
  
  // Custom metrics
  API_RESPONSE_TARGET: 500,    // API response time (ms)
  PAGE_LOAD_TARGET: 3000,      // Page load time (ms)
  BUNDLE_SIZE_TARGET: 250000,  // Bundle size (bytes)
} as const;

// Image optimization settings
export const IMAGE_CONFIG = {
  QUALITY: 85,
  FORMATS: ['webp', 'avif', 'jpeg'] as const,
  SIZES: {
    THUMBNAIL: { width: 150, height: 150 },
    SMALL: { width: 300, height: 300 },
    MEDIUM: { width: 600, height: 400 },
    LARGE: { width: 1200, height: 800 },
    HERO: { width: 1920, height: 1080 },
  },
  LAZY_LOADING: true,
  PLACEHOLDER: 'blur',
} as const;

// Bundle optimization
export const BUNDLE_CONFIG = {
  // Code splitting points
  SPLIT_POINTS: [
    'admin',
    'vendor',
    'driver',
    'customer',
    'auth',
    'payment',
    'maps',
  ],
  
  // Dynamic imports for heavy components
  DYNAMIC_IMPORTS: [
    'MapComponent',
    'PaymentForm',
    'ChatWidget',
    'AnalyticsDashboard',
    'ReportGenerator',
  ],
  
  // Preload critical resources
  PRELOAD_RESOURCES: [
    '/fonts/inter-var.woff2',
    '/images/logo.svg',
    '/api/user/profile',
  ],
} as const;

// Database optimization
export const DB_CONFIG = {
  // Connection pool settings
  POOL_MIN: 2,
  POOL_MAX: 10,
  POOL_IDLE_TIMEOUT: 30000,
  POOL_ACQUIRE_TIMEOUT: 60000,
  
  // Query optimization
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  PAGINATION_SIZE: 20,
  
  // Caching strategy
  CACHE_TTL: {
    USER_PROFILE: 3600,      // 1 hour
    RESTAURANT_LIST: 900,    // 15 minutes
    MENU_ITEMS: 600,         // 10 minutes
    ORDER_HISTORY: 300,      // 5 minutes
  },
} as const;

// API optimization
export const API_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    SKIP_SUCCESSFUL_REQUESTS: false,
  },
  
  // Request timeout
  TIMEOUT: 30000, // 30 seconds
  
  // Retry configuration
  RETRY: {
    ATTEMPTS: 3,
    DELAY: 1000,
    BACKOFF: 2,
  },
  
  // Compression
  COMPRESSION: {
    THRESHOLD: 1024, // Compress responses > 1KB
    LEVEL: 6,        // Compression level (1-9)
  },
} as const;

// Memory optimization
export const MEMORY_CONFIG = {
  // Garbage collection hints
  MAX_OLD_SPACE_SIZE: 4096, // 4GB
  
  // Cache limits
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB
  
  // Memory monitoring thresholds
  WARNING_THRESHOLD: 0.8,  // 80% memory usage
  CRITICAL_THRESHOLD: 0.9, // 90% memory usage
} as const;

// CDN configuration
export const CDN_CONFIG = {
  // Asset domains
  STATIC_DOMAIN: process.env.NEXT_PUBLIC_CDN_URL || '',
  IMAGE_DOMAIN: process.env.NEXT_PUBLIC_IMAGE_CDN || '',
  
  // Cache headers
  CACHE_HEADERS: {
    'Cache-Control': `public, max-age=${CACHE_CONFIG.STATIC_ASSETS}, immutable`,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  },
} as const;

// Monitoring configuration
export const MONITORING_CONFIG = {
  // Performance monitoring
  ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === 'production',
  
  // Metrics collection
  COLLECT_METRICS: {
    CORE_WEB_VITALS: true,
    API_PERFORMANCE: true,
    ERROR_TRACKING: true,
    USER_INTERACTIONS: true,
  },
  
  // Sampling rates
  SAMPLING_RATE: {
    PERFORMANCE: 0.1,  // 10% of sessions
    ERRORS: 1.0,       // 100% of errors
    TRACES: 0.01,      // 1% of traces
  },
} as const;

// Feature flags for performance optimizations
export const PERFORMANCE_FEATURES = {
  // Enable/disable optimizations
  ENABLE_SERVICE_WORKER: true,
  ENABLE_PREFETCHING: true,
  ENABLE_LAZY_LOADING: true,
  ENABLE_CODE_SPLITTING: true,
  ENABLE_COMPRESSION: true,
  ENABLE_CACHING: true,
  
  // Experimental features
  ENABLE_STREAMING_SSR: false,
  ENABLE_CONCURRENT_FEATURES: false,
  ENABLE_SELECTIVE_HYDRATION: false,
} as const;

// Environment-specific overrides
export const getPerformanceConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    // Development optimizations
    ...(isDevelopment && {
      CACHE_DURATION: 0, // Disable caching in development
      ENABLE_HOT_RELOAD: true,
      ENABLE_REACT_DEVTOOLS: true,
    }),
    
    // Production optimizations
    ...(isProduction && {
      ENABLE_MINIFICATION: true,
      ENABLE_TREE_SHAKING: true,
      ENABLE_DEAD_CODE_ELIMINATION: true,
      ENABLE_GZIP_COMPRESSION: true,
    }),
  };
};

// Performance utilities
export const performanceUtils = {
  // Measure performance
  measurePerformance: (name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  },
  
  // Debounce function
  debounce: <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
  
  // Throttle function
  throttle: <T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
  
  // Lazy load component
  lazyLoad: (importFn: () => Promise<{ default: React.ComponentType<unknown> }>) => {
    return React.lazy(importFn);
  },
};

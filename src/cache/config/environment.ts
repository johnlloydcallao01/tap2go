/**
 * Environment-Specific Cache Configuration for Tap2Go
 * Handles different settings for development, staging, and production
 */

// ===== ENVIRONMENT DETECTION =====

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_STAGING: process.env.VERCEL_ENV === 'preview',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

// ===== FEATURE FLAGS =====

export const CACHE_FEATURES = {
  REDIS_ENABLED: process.env.ENABLE_REDIS_CACHING === 'true',
  ANALYTICS_ENABLED: ENV.IS_PRODUCTION || ENV.IS_STAGING,
  DEBUG_LOGGING: ENV.IS_DEVELOPMENT,
  METRICS_COLLECTION: ENV.IS_PRODUCTION || ENV.IS_STAGING,
  CACHE_WARMING: ENV.IS_PRODUCTION,
  COMPRESSION_ENABLED: ENV.IS_PRODUCTION,
} as const;

// ===== ENVIRONMENT-SPECIFIC CONFIGURATIONS =====

interface CacheEnvironmentConfig {
  redis: {
    enabled: boolean;
    defaultTTL: number;
    maxRetries: number;
    requestTimeout: number;
    enableMetrics: boolean;
  };
  memory: {
    maxSize: string;
    evictionPolicy: string;
    enableCompression: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enablePerformanceLogs: boolean;
    enableErrorTracking: boolean;
  };
  warming: {
    enabled: boolean;
    intervalMinutes: number;
    popularDataPreload: boolean;
  };
  invalidation: {
    batchSize: number;
    delayMs: number;
    enableCascading: boolean;
  };
}

const developmentConfig: CacheEnvironmentConfig = {
  redis: {
    enabled: true,
    defaultTTL: 300, // 5 minutes
    maxRetries: 2,
    requestTimeout: 3000,
    enableMetrics: false,
  },
  memory: {
    maxSize: '50MB',
    evictionPolicy: 'allkeys-lru',
    enableCompression: false,
  },
  logging: {
    level: 'debug',
    enablePerformanceLogs: true,
    enableErrorTracking: true,
  },
  warming: {
    enabled: false,
    intervalMinutes: 60,
    popularDataPreload: false,
  },
  invalidation: {
    batchSize: 10,
    delayMs: 100,
    enableCascading: true,
  },
};

const stagingConfig: CacheEnvironmentConfig = {
  redis: {
    enabled: true,
    defaultTTL: 1800, // 30 minutes
    maxRetries: 3,
    requestTimeout: 5000,
    enableMetrics: true,
  },
  memory: {
    maxSize: '128MB',
    evictionPolicy: 'allkeys-lru',
    enableCompression: true,
  },
  logging: {
    level: 'info',
    enablePerformanceLogs: true,
    enableErrorTracking: true,
  },
  warming: {
    enabled: true,
    intervalMinutes: 30,
    popularDataPreload: true,
  },
  invalidation: {
    batchSize: 50,
    delayMs: 50,
    enableCascading: true,
  },
};

const productionConfig: CacheEnvironmentConfig = {
  redis: {
    enabled: true,
    defaultTTL: 3600, // 1 hour
    maxRetries: 5,
    requestTimeout: 10000,
    enableMetrics: true,
  },
  memory: {
    maxSize: '256MB',
    evictionPolicy: 'allkeys-lru',
    enableCompression: true,
  },
  logging: {
    level: 'warn',
    enablePerformanceLogs: false,
    enableErrorTracking: true,
  },
  warming: {
    enabled: true,
    intervalMinutes: 15,
    popularDataPreload: true,
  },
  invalidation: {
    batchSize: 100,
    delayMs: 25,
    enableCascading: true,
  },
};

const testConfig: CacheEnvironmentConfig = {
  redis: {
    enabled: false, // Use memory cache for tests
    defaultTTL: 60, // 1 minute
    maxRetries: 1,
    requestTimeout: 1000,
    enableMetrics: false,
  },
  memory: {
    maxSize: '10MB',
    evictionPolicy: 'allkeys-lru',
    enableCompression: false,
  },
  logging: {
    level: 'error',
    enablePerformanceLogs: false,
    enableErrorTracking: false,
  },
  warming: {
    enabled: false,
    intervalMinutes: 0,
    popularDataPreload: false,
  },
  invalidation: {
    batchSize: 5,
    delayMs: 0,
    enableCascading: false,
  },
};

// ===== CONFIGURATION SELECTOR =====

export function getCacheConfig(): CacheEnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV;
  const isStaging = process.env.VERCEL_ENV === 'preview';

  if (nodeEnv === 'development') {
    return developmentConfig;
  } else if (isStaging) {
    return stagingConfig;
  } else if (nodeEnv === 'production') {
    return productionConfig;
  } else if (nodeEnv === 'test') {
    return testConfig;
  } else {
    console.warn(`Unknown NODE_ENV: ${nodeEnv}, using development config`);
    return developmentConfig;
  }
}

// ===== PERFORMANCE THRESHOLDS =====

export const PERFORMANCE_THRESHOLDS = {
  // Response time thresholds (in milliseconds)
  CACHE_HIT_TARGET: ENV.IS_PRODUCTION ? 50 : 100,
  CACHE_MISS_TARGET: ENV.IS_PRODUCTION ? 200 : 500,
  
  // Hit rate thresholds (percentage)
  MIN_HIT_RATE: ENV.IS_PRODUCTION ? 90 : 80,
  TARGET_HIT_RATE: ENV.IS_PRODUCTION ? 95 : 85,
  
  // Memory usage thresholds (percentage)
  MEMORY_WARNING_THRESHOLD: 80,
  MEMORY_CRITICAL_THRESHOLD: 90,
  
  // Error rate thresholds (percentage)
  MAX_ERROR_RATE: ENV.IS_PRODUCTION ? 1 : 5,
} as const;

// ===== MONITORING CONFIGURATION =====

export const MONITORING = {
  METRICS_INTERVAL_MS: ENV.IS_PRODUCTION ? 60000 : 30000, // 1 min prod, 30s dev
  HEALTH_CHECK_INTERVAL_MS: ENV.IS_PRODUCTION ? 300000 : 60000, // 5 min prod, 1 min dev
  PERFORMANCE_SAMPLING_RATE: ENV.IS_PRODUCTION ? 0.1 : 1.0, // 10% prod, 100% dev
  
  ALERTS: {
    ENABLED: ENV.IS_PRODUCTION || ENV.IS_STAGING,
    HIT_RATE_THRESHOLD: PERFORMANCE_THRESHOLDS.MIN_HIT_RATE,
    ERROR_RATE_THRESHOLD: PERFORMANCE_THRESHOLDS.MAX_ERROR_RATE,
    RESPONSE_TIME_THRESHOLD: PERFORMANCE_THRESHOLDS.CACHE_MISS_TARGET,
  },
} as const;

// ===== CACHE WARMING CONFIGURATION =====

export const CACHE_WARMING = {
  ENABLED: getCacheConfig().warming.enabled,
  
  SCHEDULES: {
    POPULAR_RESTAURANTS: {
      interval: '*/30 * * * *', // Every 30 minutes
      enabled: ENV.IS_PRODUCTION,
    },
    TRENDING_MENU_ITEMS: {
      interval: '*/15 * * * *', // Every 15 minutes
      enabled: ENV.IS_PRODUCTION,
    },
    USER_PREFERENCES: {
      interval: '0 */2 * * *', // Every 2 hours
      enabled: ENV.IS_PRODUCTION || ENV.IS_STAGING,
    },
    SEARCH_SUGGESTIONS: {
      interval: '0 */6 * * *', // Every 6 hours
      enabled: ENV.IS_PRODUCTION,
    },
  },
  
  BATCH_SIZES: {
    RESTAURANTS: ENV.IS_PRODUCTION ? 100 : 10,
    MENU_ITEMS: ENV.IS_PRODUCTION ? 500 : 50,
    USERS: ENV.IS_PRODUCTION ? 1000 : 100,
  },
} as const;

// ===== SECURITY CONFIGURATION =====

export const SECURITY = {
  ENCRYPTION: {
    ENABLED: ENV.IS_PRODUCTION || ENV.IS_STAGING,
    ALGORITHM: 'aes-256-gcm',
    KEY_ROTATION_DAYS: 90,
  },
  
  ACCESS_CONTROL: {
    ENABLE_IP_WHITELIST: ENV.IS_PRODUCTION,
    ENABLE_RATE_LIMITING: true,
    MAX_REQUESTS_PER_MINUTE: ENV.IS_PRODUCTION ? 1000 : 100,
  },
  
  DATA_PRIVACY: {
    PII_ENCRYPTION: ENV.IS_PRODUCTION || ENV.IS_STAGING,
    AUTO_EXPIRE_PII_DAYS: 30,
    GDPR_COMPLIANCE: ENV.IS_PRODUCTION,
  },
} as const;

// ===== EXPORT CURRENT CONFIGURATION =====

export const currentConfig = getCacheConfig();

// ===== CONFIGURATION VALIDATION =====

export function validateCacheConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = getCacheConfig();

  // Validate Redis configuration
  if (config.redis.enabled && !process.env.UPSTASH_REDIS_REST_URL) {
    errors.push('Redis is enabled but UPSTASH_REDIS_REST_URL is not set');
  }

  if (config.redis.enabled && !process.env.UPSTASH_REDIS_REST_TOKEN) {
    errors.push('Redis is enabled but UPSTASH_REDIS_REST_TOKEN is not set');
  }

  // Validate TTL values
  if (config.redis.defaultTTL <= 0) {
    errors.push('Default TTL must be greater than 0');
  }

  // Validate timeout values
  if (config.redis.requestTimeout <= 0) {
    errors.push('Request timeout must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ===== EXPORT DEFAULT =====

export default currentConfig;

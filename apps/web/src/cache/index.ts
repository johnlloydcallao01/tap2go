/**
 * Tap2Go Enterprise Caching System - Main Export
 * Multi-layer caching with Redis, Memory, and Client-side storage
 */

// ===== CONFIGURATION EXPORTS =====
export { TTL, CACHE_KEYS, INVALIDATION_PATTERNS, getEnvironmentTTL } from './config/ttl';
export { redis, redisOps, checkRedisConnection, redisMetrics } from './config/redis';
export { currentConfig, getCacheConfig, validateCacheConfig, CACHE_FEATURES } from './config/environment';

// ===== SERVER-SIDE CACHE EXPORTS =====
export { tapGoCache, TapGoCache } from './server/redis';
export { tapGoMemoryCache, memoryCache, TapGoMemoryCache, MemoryCache } from './server/memory';

// ===== MIDDLEWARE EXPORTS =====
export {
  withCache,
  withRestaurantCache,
  withMenuCache,
  withSearchCache,
  withUserCache,
  withAnalyticsCache,
  invalidateCache,
  invalidateCacheByTags,
  warmCache,
  generateCacheKey,
  setCacheControlHeaders,
} from './server/middleware';

// ===== MAIN CACHE INTERFACE =====

import { tapGoCache } from './server/redis';
import { tapGoMemoryCache } from './server/memory';
import { CACHE_FEATURES } from './config/environment';

/**
 * Unified Cache Interface for Tap2Go
 * Automatically chooses between Redis and Memory cache based on configuration
 */
export class TapGoUnifiedCache {
  private primaryCache = tapGoCache;
  private fallbackCache = tapGoMemoryCache;

  // ===== CORE OPERATIONS =====

  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      // Try Redis first if enabled
      if (CACHE_FEATURES.REDIS_ENABLED) {
        const result = await this.primaryCache.get<T>(key);
        if (result !== null) return result;
      }

      // Fallback to memory cache
      return await this.fallbackCache.get<T>(key);
    } catch (error) {
      console.error('Unified cache GET error:', error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    try {
      const results = await Promise.allSettled([
        CACHE_FEATURES.REDIS_ENABLED ? this.primaryCache.set(key, value, ttlSeconds) : Promise.resolve(false),
        this.fallbackCache.set(key, value, ttlSeconds),
      ]);

      // Return true if at least one cache succeeded
      return results.some(result => result.status === 'fulfilled' && result.value === true);
    } catch (error) {
      console.error('Unified cache SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const results = await Promise.allSettled([
        CACHE_FEATURES.REDIS_ENABLED ? this.primaryCache.del(key) : Promise.resolve(false),
        this.fallbackCache.del(key),
      ]);

      // Return true if at least one cache succeeded
      return results.some(result => result.status === 'fulfilled' && result.value === true);
    } catch (error) {
      console.error('Unified cache DEL error:', error);
      return false;
    }
  }

  // ===== HIGH-LEVEL OPERATIONS =====

  // User operations
  async getUserSession(userId: string) {
    return this.get(`user:${userId}:session`);
  }

  async setUserSession(userId: string, sessionData: unknown, ttl?: number) {
    return this.set(`user:${userId}:session`, sessionData, ttl);
  }

  async getUserProfile(userId: string) {
    return this.get(`user:${userId}:profile`);
  }

  async setUserProfile(userId: string, profileData: unknown, ttl?: number) {
    return this.set(`user:${userId}:profile`, profileData, ttl);
  }

  // Restaurant operations
  async getRestaurant(restaurantId: string) {
    return this.get(`restaurant:${restaurantId}`);
  }

  async setRestaurant(restaurantId: string, restaurantData: unknown, ttl?: number) {
    return this.set(`restaurant:${restaurantId}`, restaurantData, ttl);
  }

  async getRestaurantMenu(restaurantId: string) {
    return this.get(`restaurant:${restaurantId}:menu`);
  }

  async setRestaurantMenu(restaurantId: string, menuData: unknown, ttl?: number) {
    return this.set(`restaurant:${restaurantId}:menu`, menuData, ttl);
  }

  // Search operations
  async getSearchResults(query: string, type: string = 'general') {
    return this.get(`search:${type}:${query}`);
  }

  async setSearchResults(query: string, results: unknown, type: string = 'general', ttl?: number) {
    return this.set(`search:${type}:${query}`, results, ttl);
  }

  // ===== BATCH OPERATIONS =====

  async mget<T = unknown>(keys: string[]): Promise<(T | null)[]> {
    try {
      // Try Redis first if enabled
      if (CACHE_FEATURES.REDIS_ENABLED) {
        const results = await this.primaryCache.mget<T>(keys);

        // If all results are found, return them
        if (results.every(result => result !== null)) {
          return results;
        }

        // Otherwise, fill missing values from memory cache
        const memoryResults = await this.fallbackCache.mget<T>(keys);
        return results.map((result, index) => result !== null ? result : memoryResults[index]);
      }

      // Fallback to memory cache only
      return await this.fallbackCache.mget<T>(keys);
    } catch (error) {
      console.error('Unified cache MGET error:', error);
      return keys.map(() => null);
    }
  }

  async mset(keyValuePairs: Record<string, unknown>, ttlSeconds?: number): Promise<boolean> {
    try {
      const results = await Promise.allSettled([
        CACHE_FEATURES.REDIS_ENABLED ? this.primaryCache.mset(keyValuePairs) : Promise.resolve(false),
        this.fallbackCache.mset(keyValuePairs, ttlSeconds),
      ]);

      return results.some(result => result.status === 'fulfilled' && result.value === true);
    } catch (error) {
      console.error('Unified cache MSET error:', error);
      return false;
    }
  }

  // ===== INVALIDATION OPERATIONS =====

  async invalidateUser(userId: string): Promise<void> {
    await Promise.allSettled([
      CACHE_FEATURES.REDIS_ENABLED ? this.primaryCache.invalidateUser(userId) : Promise.resolve(),
      this.del(`user:${userId}:session`),
      this.del(`user:${userId}:profile`),
      this.del(`user:${userId}:cart`),
      this.del(`user:${userId}:preferences`),
    ]);
  }

  async invalidateRestaurant(restaurantId: string): Promise<void> {
    await Promise.allSettled([
      CACHE_FEATURES.REDIS_ENABLED ? this.primaryCache.invalidateRestaurant(restaurantId) : Promise.resolve(),
      this.del(`restaurant:${restaurantId}`),
      this.del(`restaurant:${restaurantId}:menu`),
      this.del(`restaurant:${restaurantId}:metadata`),
    ]);
  }

  // ===== HEALTH CHECK =====

  async healthCheck() {
    const redisHealth = CACHE_FEATURES.REDIS_ENABLED ? await this.primaryCache.healthCheck() : null;
    const memoryHealth = this.fallbackCache.healthCheck();

    return {
      unified: {
        healthy: true,
        redisEnabled: CACHE_FEATURES.REDIS_ENABLED,
      },
      redis: redisHealth,
      memory: memoryHealth,
      environment: process.env.NODE_ENV,
      features: CACHE_FEATURES,
    };
  }
}

// ===== SINGLETON INSTANCE =====

export const cache = new TapGoUnifiedCache();

// ===== CONVENIENCE FUNCTIONS =====

/**
 * Quick cache get with automatic fallback
 */
export async function getCached<T = unknown>(key: string): Promise<T | null> {
  return cache.get<T>(key);
}

/**
 * Quick cache set with automatic distribution
 */
export async function setCached(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
  return cache.set(key, value, ttlSeconds);
}

/**
 * Quick cache delete with automatic distribution
 */
export async function deleteCached(key: string): Promise<boolean> {
  return cache.del(key);
}

/**
 * Cache with automatic key generation for API responses
 */
export async function cacheApiResponse<T = unknown>(
  keyParts: string[],
  fetcher: () => Promise<T>,
  ttlSeconds?: number
): Promise<T> {
  const key = `api:${keyParts.join(':')}`;

  // Try to get from cache first
  const cached = await cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const freshData = await fetcher();

  // Cache the result
  await cache.set(key, freshData, ttlSeconds);

  return freshData;
}

// ===== EXPORT DEFAULT =====

export default cache;

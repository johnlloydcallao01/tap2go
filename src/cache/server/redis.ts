/**
 * Server-Side Redis Cache Operations for Tap2Go
 * Enterprise-grade caching with intelligent invalidation and warming
 */

import { redisOps, redisMetrics } from '../config/redis';
import { TTL, CACHE_KEYS, INVALIDATION_PATTERNS } from '../config/ttl';
import { currentConfig, CACHE_FEATURES } from '../config/environment';

// ===== CACHE WRAPPER CLASS =====

export class TapGoCache {
  private enabled: boolean;
  private defaultTTL: number;

  constructor() {
    this.enabled = CACHE_FEATURES.REDIS_ENABLED && currentConfig.redis.enabled;
    this.defaultTTL = currentConfig.redis.defaultTTL;
  }

  // ===== CORE CACHE OPERATIONS =====

  async get<T = unknown>(key: string): Promise<T | null> {
    if (!this.enabled) return null;

    try {
      const startTime = Date.now();
      const result = await redisOps.get<T>(key);
      const duration = Date.now() - startTime;

      if (result !== null) {
        redisMetrics.recordHit();
        this.logPerformance('GET_HIT', key, duration);
      } else {
        redisMetrics.recordMiss();
        this.logPerformance('GET_MISS', key, duration);
      }

      return result;
    } catch (error) {
      redisMetrics.recordError();
      this.logError('GET', key, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const startTime = Date.now();
      const ttl = ttlSeconds || this.defaultTTL;
      const success = await redisOps.set(key, value, ttl);
      const duration = Date.now() - startTime;

      this.logPerformance('SET', key, duration);
      return success;
    } catch (error) {
      redisMetrics.recordError();
      this.logError('SET', key, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const startTime = Date.now();
      const success = await redisOps.del(key);
      const duration = Date.now() - startTime;

      this.logPerformance('DEL', key, duration);
      return success;
    } catch (error) {
      redisMetrics.recordError();
      this.logError('DEL', key, error);
      return false;
    }
  }

  // ===== HIGH-LEVEL CACHE OPERATIONS =====

  // User-related caching
  async getUserSession(userId: string) {
    return this.get(CACHE_KEYS.USER_SESSION(userId));
  }

  async setUserSession(userId: string, sessionData: unknown) {
    return this.set(CACHE_KEYS.USER_SESSION(userId), sessionData, TTL.REDIS.USER_SESSIONS);
  }

  async getUserProfile(userId: string) {
    return this.get(CACHE_KEYS.USER_PROFILE(userId));
  }

  async setUserProfile(userId: string, profileData: unknown) {
    return this.set(CACHE_KEYS.USER_PROFILE(userId), profileData, TTL.REDIS.USER_PREFERENCES);
  }

  async getUserCart(userId: string) {
    return this.get(CACHE_KEYS.USER_CART(userId));
  }

  async setUserCart(userId: string, cartData: unknown) {
    return this.set(CACHE_KEYS.USER_CART(userId), cartData, TTL.REDIS.CART_DATA);
  }

  // Restaurant-related caching
  async getRestaurant(restaurantId: string) {
    return this.get(CACHE_KEYS.RESTAURANT(restaurantId));
  }

  async setRestaurant(restaurantId: string, restaurantData: unknown) {
    return this.set(CACHE_KEYS.RESTAURANT(restaurantId), restaurantData, TTL.REDIS.RESTAURANT_METADATA);
  }

  async getRestaurantMenu(restaurantId: string) {
    return this.get(CACHE_KEYS.RESTAURANT_MENU(restaurantId));
  }

  async setRestaurantMenu(restaurantId: string, menuData: unknown) {
    return this.set(CACHE_KEYS.RESTAURANT_MENU(restaurantId), menuData, TTL.REDIS.MENU_CACHE);
  }

  async getPopularRestaurants(region?: string) {
    return this.get(CACHE_KEYS.POPULAR_RESTAURANTS(region));
  }

  async setPopularRestaurants(restaurants: unknown[], region?: string) {
    return this.set(CACHE_KEYS.POPULAR_RESTAURANTS(region), restaurants, TTL.APP.POPULAR_RESTAURANTS);
  }

  // Search-related caching
  async getSearchResults(query: string, type: string) {
    return this.get(CACHE_KEYS.SEARCH_RESULTS(query, type));
  }

  async setSearchResults(query: string, type: string, results: unknown) {
    return this.set(CACHE_KEYS.SEARCH_RESULTS(query, type), results, TTL.REDIS.SEARCH_RESULTS);
  }

  // Order-related caching
  async getOrder(orderId: string) {
    return this.get(CACHE_KEYS.ORDER(orderId));
  }

  async setOrder(orderId: string, orderData: unknown) {
    return this.set(CACHE_KEYS.ORDER(orderId), orderData, TTL.APP.ORDER_DETAILS);
  }

  async getOrderStatus(orderId: string) {
    return this.get(CACHE_KEYS.ORDER_STATUS(orderId));
  }

  async setOrderStatus(orderId: string, status: unknown) {
    return this.set(CACHE_KEYS.ORDER_STATUS(orderId), status, TTL.REALTIME.ORDER_STATUS);
  }

  // ===== CACHE INVALIDATION =====

  async invalidateUser(userId: string): Promise<void> {
    const keys = INVALIDATION_PATTERNS.USER_UPDATE(userId);
    await this.invalidateKeys(keys);
  }

  async invalidateRestaurant(restaurantId: string): Promise<void> {
    const keys = INVALIDATION_PATTERNS.RESTAURANT_UPDATE(restaurantId);
    await this.invalidateKeys(keys);
  }

  async invalidateOrder(orderId: string, userId: string): Promise<void> {
    const keys = INVALIDATION_PATTERNS.ORDER_UPDATE(orderId, userId);
    await this.invalidateKeys(keys);
  }

  async invalidateMenu(restaurantId: string): Promise<void> {
    const keys = INVALIDATION_PATTERNS.MENU_UPDATE(restaurantId);
    await this.invalidateKeys(keys);
  }

  private async invalidateKeys(keys: string[]): Promise<void> {
    if (!this.enabled) return;

    try {
      const promises = keys.map(key => {
        // Handle wildcard patterns (simplified for Upstash)
        if (key.includes('*')) {
          this.logDebug('Wildcard invalidation not fully supported', key);
          return Promise.resolve();
        }
        return this.del(key);
      });

      await Promise.all(promises);
      this.logDebug('Invalidated cache keys', keys);
    } catch (error) {
      this.logError('INVALIDATE', keys.join(', '), error);
    }
  }

  // ===== BATCH OPERATIONS =====

  async mget<T = unknown>(keys: string[]): Promise<(T | null)[]> {
    if (!this.enabled) return keys.map(() => null);

    try {
      const startTime = Date.now();
      const results = await redisOps.mget<T>(keys);
      const duration = Date.now() - startTime;

      // Count hits and misses
      results.forEach(result => {
        if (result !== null) {
          redisMetrics.recordHit();
        } else {
          redisMetrics.recordMiss();
        }
      });

      this.logPerformance('MGET', `${keys.length} keys`, duration);
      return results;
    } catch (error) {
      redisMetrics.recordError();
      this.logError('MGET', keys.join(', '), error);
      return keys.map(() => null);
    }
  }

  async mset(keyValuePairs: Record<string, unknown>): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const startTime = Date.now();
      const success = await redisOps.mset(keyValuePairs);
      const duration = Date.now() - startTime;

      this.logPerformance('MSET', `${Object.keys(keyValuePairs).length} keys`, duration);
      return success;
    } catch (error) {
      redisMetrics.recordError();
      this.logError('MSET', Object.keys(keyValuePairs).join(', '), error);
      return false;
    }
  }

  // ===== CACHE WARMING =====

  async warmPopularRestaurants(): Promise<void> {
    if (!this.enabled || !currentConfig.warming.enabled) return;

    try {
      this.logDebug('Starting popular restaurants cache warming');
      
      // This would typically fetch from your database
      // For now, we'll create a placeholder
      const popularRestaurants = await this.fetchPopularRestaurantsFromDB();
      
      if (popularRestaurants.length > 0) {
        await this.setPopularRestaurants(popularRestaurants);
        this.logDebug(`Warmed cache with ${popularRestaurants.length} popular restaurants`);
      }
    } catch (error) {
      this.logError('WARM_POPULAR_RESTAURANTS', 'warming', error);
    }
  }

  async warmUserPreferences(userId: string): Promise<void> {
    if (!this.enabled) return;

    try {
      // Fetch user preferences from database
      const preferences = await this.fetchUserPreferencesFromDB();

      if (preferences) {
        await this.setUserProfile(userId, preferences);
        this.logDebug(`Warmed cache for user ${userId} preferences`);
      }
    } catch (error) {
      this.logError('WARM_USER_PREFERENCES', userId, error);
    }
  }

  // ===== PLACEHOLDER DATABASE METHODS =====
  // These would be replaced with actual database calls

  private async fetchPopularRestaurantsFromDB(): Promise<unknown[]> {
    // Placeholder - replace with actual Firestore/Supabase query
    return [];
  }

  private async fetchUserPreferencesFromDB(): Promise<unknown | null> {
    // Placeholder - replace with actual database query
    return null;
  }

  // ===== LOGGING AND MONITORING =====

  private logPerformance(operation: string, key: string, duration: number): void {
    if (CACHE_FEATURES.DEBUG_LOGGING && currentConfig.logging.enablePerformanceLogs) {
      console.log(`[CACHE] ${operation} ${key} - ${duration}ms`);
    }
  }

  private logError(operation: string, key: string, error: unknown): void {
    if (currentConfig.logging.enableErrorTracking) {
      console.error(`[CACHE ERROR] ${operation} ${key}:`, error);
    }
  }

  private logDebug(message: string, data?: unknown): void {
    if (CACHE_FEATURES.DEBUG_LOGGING) {
      console.log(`[CACHE DEBUG] ${message}`, data || '');
    }
  }

  // ===== HEALTH CHECK =====

  async healthCheck(): Promise<{ healthy: boolean; metrics: unknown; config: unknown }> {
    const metrics = redisMetrics.getMetrics();

    return {
      healthy: this.enabled,
      metrics,
      config: {
        enabled: this.enabled,
        defaultTTL: this.defaultTTL,
        environment: process.env.NODE_ENV,
      },
    };
  }
}

// ===== SINGLETON INSTANCE =====

export const tapGoCache = new TapGoCache();

// ===== EXPORT DEFAULT =====

export default tapGoCache;

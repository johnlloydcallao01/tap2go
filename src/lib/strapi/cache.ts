/**
 * Strapi Caching Layer for Tap2Go CMS Integration
 * Provides intelligent caching for Strapi content with Redis support
 */

import { StrapiResponse } from './types';

// Cache configuration
export const CACHE_CONFIG = {
  // Cache TTL (Time To Live) in seconds
  TTL: {
    RESTAURANT_CONTENT: 3600,    // 1 hour
    MENU_CONTENT: 1800,          // 30 minutes
    BLOG_POSTS: 7200,            // 2 hours
    PROMOTIONS: 900,             // 15 minutes
    STATIC_PAGES: 86400,         // 24 hours
    HOMEPAGE_BANNERS: 3600,      // 1 hour
  },
  
  // Cache key prefixes
  PREFIXES: {
    RESTAURANT: 'strapi:restaurant:',
    MENU_CATEGORY: 'strapi:menu-category:',
    MENU_ITEM: 'strapi:menu-item:',
    BLOG_POST: 'strapi:blog-post:',
    PROMOTION: 'strapi:promotion:',
    STATIC_PAGE: 'strapi:static-page:',
    BANNER: 'strapi:banner:',
    SEARCH: 'strapi:search:',
  },
  
  // Cache invalidation patterns
  INVALIDATION_PATTERNS: {
    RESTAURANT_ALL: 'strapi:restaurant:*',
    MENU_ALL: 'strapi:menu-*',
    BLOG_ALL: 'strapi:blog-*',
    PROMOTION_ALL: 'strapi:promotion:*',
  }
};

/**
 * In-memory cache implementation (fallback when Redis is not available)
 */
class MemoryCache {
  private cache: Map<string, { data: any; expires: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  async set(key: string, data: any, ttl: number): Promise<void> {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { data, expires });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key));
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

/**
 * Redis cache implementation (for production)
 */
class RedisCache {
  private redis: any = null;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      if (process.env.REDIS_URL) {
        // Dynamically import Redis only if URL is provided
        const Redis = (await import('ioredis')).default;
        this.redis = new Redis(process.env.REDIS_URL);
        
        this.redis.on('error', (error: Error) => {
          console.error('Redis connection error:', error);
          this.redis = null;
        });
        
        this.redis.on('connect', () => {
          console.log('Redis connected successfully');
        });
      }
    } catch (error) {
      console.warn('Redis not available, falling back to memory cache:', error);
      this.redis = null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, data: any, ttl: number): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.redis) return;
    
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis delete pattern error:', error);
    }
  }

  async clear(): Promise<void> {
    if (!this.redis) return;
    
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }
}

/**
 * Unified cache manager that handles both Redis and memory cache
 */
export class StrapiCacheManager {
  private redisCache: RedisCache;
  private memoryCache: MemoryCache;
  private isEnabled: boolean;

  constructor() {
    this.redisCache = new RedisCache();
    this.memoryCache = new MemoryCache();
    this.isEnabled = process.env.ENABLE_CONTENT_CACHING !== 'false';
  }

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled) return null;

    // Try Redis first, fallback to memory cache
    let data = await this.redisCache.get<T>(key);
    if (data === null) {
      data = await this.memoryCache.get<T>(key);
    }
    
    return data;
  }

  /**
   * Set cached data
   */
  async set(key: string, data: any, ttl: number): Promise<void> {
    if (!this.isEnabled) return;

    // Set in both caches
    await Promise.all([
      this.redisCache.set(key, data, ttl),
      this.memoryCache.set(key, data, ttl)
    ]);
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    await Promise.all([
      this.redisCache.delete(key),
      this.memoryCache.delete(key)
    ]);
  }

  /**
   * Delete cached data by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    await Promise.all([
      this.redisCache.deletePattern(pattern),
      this.memoryCache.deletePattern(pattern)
    ]);
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    await Promise.all([
      this.redisCache.clear(),
      this.memoryCache.clear()
    ]);
  }

  /**
   * Cache restaurant content
   */
  async cacheRestaurantContent(restaurantId: string, data: any): Promise<void> {
    const key = `${CACHE_CONFIG.PREFIXES.RESTAURANT}${restaurantId}`;
    await this.set(key, data, CACHE_CONFIG.TTL.RESTAURANT_CONTENT);
  }

  /**
   * Get cached restaurant content
   */
  async getRestaurantContent(restaurantId: string): Promise<any | null> {
    const key = `${CACHE_CONFIG.PREFIXES.RESTAURANT}${restaurantId}`;
    return await this.get(key);
  }

  /**
   * Cache menu content
   */
  async cacheMenuContent(restaurantId: string, data: any): Promise<void> {
    const key = `${CACHE_CONFIG.PREFIXES.MENU_CATEGORY}${restaurantId}`;
    await this.set(key, data, CACHE_CONFIG.TTL.MENU_CONTENT);
  }

  /**
   * Get cached menu content
   */
  async getMenuContent(restaurantId: string): Promise<any | null> {
    const key = `${CACHE_CONFIG.PREFIXES.MENU_CATEGORY}${restaurantId}`;
    return await this.get(key);
  }

  /**
   * Cache blog posts
   */
  async cacheBlogPosts(params: string, data: any): Promise<void> {
    const key = `${CACHE_CONFIG.PREFIXES.BLOG_POST}list:${params}`;
    await this.set(key, data, CACHE_CONFIG.TTL.BLOG_POSTS);
  }

  /**
   * Cache single blog post
   */
  async cacheBlogPost(slug: string, data: any): Promise<void> {
    const key = `${CACHE_CONFIG.PREFIXES.BLOG_POST}${slug}`;
    await this.set(key, data, CACHE_CONFIG.TTL.BLOG_POSTS);
  }

  /**
   * Cache promotions
   */
  async cachePromotions(data: any): Promise<void> {
    const key = `${CACHE_CONFIG.PREFIXES.PROMOTION}active`;
    await this.set(key, data, CACHE_CONFIG.TTL.PROMOTIONS);
  }

  /**
   * Invalidate restaurant cache
   */
  async invalidateRestaurantCache(restaurantId?: string): Promise<void> {
    if (restaurantId) {
      await this.delete(`${CACHE_CONFIG.PREFIXES.RESTAURANT}${restaurantId}`);
    } else {
      await this.deletePattern(CACHE_CONFIG.INVALIDATION_PATTERNS.RESTAURANT_ALL);
    }
  }

  /**
   * Invalidate menu cache
   */
  async invalidateMenuCache(restaurantId?: string): Promise<void> {
    if (restaurantId) {
      await this.delete(`${CACHE_CONFIG.PREFIXES.MENU_CATEGORY}${restaurantId}`);
    } else {
      await this.deletePattern(CACHE_CONFIG.INVALIDATION_PATTERNS.MENU_ALL);
    }
  }

  /**
   * Invalidate blog cache
   */
  async invalidateBlogCache(): Promise<void> {
    await this.deletePattern(CACHE_CONFIG.INVALIDATION_PATTERNS.BLOG_ALL);
  }

  /**
   * Invalidate promotion cache
   */
  async invalidatePromotionCache(): Promise<void> {
    await this.deletePattern(CACHE_CONFIG.INVALIDATION_PATTERNS.PROMOTION_ALL);
  }
}

// Export singleton instance
export const strapiCache = new StrapiCacheManager();

// Export cache configuration for external use
export { CACHE_CONFIG };

// Export default cache manager
export default strapiCache;

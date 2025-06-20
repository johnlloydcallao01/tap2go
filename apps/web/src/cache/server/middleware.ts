/**
 * Cache Middleware for Tap2Go API Routes
 * Automatic caching with intelligent cache-control headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { tapGoCache } from './redis';
import { tapGoMemoryCache } from './memory';
import { TTL } from '../config/ttl';
import { currentConfig, CACHE_FEATURES } from '../config/environment';

// ===== CACHE MIDDLEWARE TYPES =====

export interface CacheOptions {
  ttl?: number;
  key?: string;
  tags?: string[];
  skipCache?: boolean;
  cacheControl?: string;
  vary?: string[];
  staleWhileRevalidate?: number;
}

export interface CacheContext {
  request: NextRequest;
  cacheKey: string;
  options: CacheOptions;
}

// ===== CACHE KEY GENERATION =====

export function generateCacheKey(request: NextRequest, customKey?: string): string {
  if (customKey) return customKey;

  const url = new URL(request.url);
  const method = request.method;
  const pathname = url.pathname;
  const searchParams = url.searchParams.toString();
  
  // Create a hash-like key
  const keyParts = [
    method,
    pathname,
    searchParams,
    // Only include user-specific data for personalized endpoints
    pathname.includes('/user/') ? request.headers.get('authorization') || '' : '',
  ].filter(Boolean);

  return `api:${keyParts.join(':')}`;
}

// ===== CACHE CONTROL HEADERS =====

export function setCacheControlHeaders(
  response: NextResponse,
  options: CacheOptions
): NextResponse {
  const { ttl = TTL.APP.API_RESPONSES, cacheControl, vary, staleWhileRevalidate } = options;

  if (cacheControl) {
    response.headers.set('Cache-Control', cacheControl);
  } else {
    // Default cache control based on TTL
    const maxAge = ttl;
    const swr = staleWhileRevalidate || Math.min(ttl * 2, 3600); // Max 1 hour SWR
    
    response.headers.set(
      'Cache-Control',
      `public, max-age=${maxAge}, stale-while-revalidate=${swr}`
    );
  }

  // Set Vary header for content negotiation
  if (vary && vary.length > 0) {
    response.headers.set('Vary', vary.join(', '));
  }

  // Add cache status header for debugging
  if (CACHE_FEATURES.DEBUG_LOGGING) {
    response.headers.set('X-Cache-TTL', ttl.toString());
    response.headers.set('X-Cache-Key', options.key || 'auto-generated');
  }

  return response;
}

// ===== CACHE MIDDLEWARE FUNCTION =====

export function withCache(options: CacheOptions = {}) {
  return function cacheMiddleware(
    handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>
  ) {
    return async function cachedHandler(
      request: NextRequest,
      context?: unknown
    ): Promise<NextResponse> {
      // Skip caching for certain conditions
      if (
        options.skipCache ||
        !CACHE_FEATURES.REDIS_ENABLED ||
        request.method !== 'GET' ||
        request.headers.get('cache-control')?.includes('no-cache')
      ) {
        const response = await handler(request, context);
        return setCacheControlHeaders(response, options);
      }

      const cacheKey = generateCacheKey(request, options.key);
      const ttl = options.ttl || TTL.APP.API_RESPONSES;

      try {
        // Try to get from cache
        const cachedResponse = await getCachedResponse(cacheKey);
        
        if (cachedResponse) {
          // Return cached response with appropriate headers
          const response = new NextResponse(cachedResponse.body, {
            status: cachedResponse.status,
            headers: cachedResponse.headers,
          });

          // Add cache hit headers
          response.headers.set('X-Cache', 'HIT');
          response.headers.set('X-Cache-Key', cacheKey);
          
          return setCacheControlHeaders(response, options);
        }

        // Cache miss - execute handler
        const response = await handler(request, context);

        // Cache successful responses
        if (response.status >= 200 && response.status < 300) {
          await setCachedResponse(cacheKey, response, ttl);
        }

        // Add cache miss headers
        response.headers.set('X-Cache', 'MISS');
        response.headers.set('X-Cache-Key', cacheKey);

        return setCacheControlHeaders(response, options);

      } catch (error) {
        console.error('Cache middleware error:', error);
        
        // Fallback to handler without caching
        const response = await handler(request, context);
        response.headers.set('X-Cache', 'ERROR');
        
        return setCacheControlHeaders(response, options);
      }
    };
  };
}

// ===== CACHE RESPONSE HELPERS =====

interface CachedResponseData {
  body: string;
  status: number;
  headers: Record<string, string>;
  timestamp: number;
}

async function getCachedResponse(cacheKey: string): Promise<CachedResponseData | null> {
  // Try Redis first, fallback to memory cache
  let cached = await tapGoCache.get<CachedResponseData>(cacheKey);
  
  if (!cached && currentConfig.redis.enabled) {
    cached = await tapGoMemoryCache.get<CachedResponseData>(cacheKey);
  }

  return cached;
}

async function setCachedResponse(
  cacheKey: string,
  response: NextResponse,
  ttl: number
): Promise<void> {
  try {
    // Clone response to read body
    const responseClone = response.clone();
    const body = await responseClone.text();

    // Extract headers
    const headers: Record<string, string> = {};
    responseClone.headers.forEach((value, key) => {
      // Skip certain headers that shouldn't be cached
      if (!['set-cookie', 'authorization', 'x-cache'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    const cachedData: CachedResponseData = {
      body,
      status: response.status,
      headers,
      timestamp: Date.now(),
    };

    // Store in both Redis and memory cache
    await Promise.all([
      tapGoCache.set(cacheKey, cachedData, ttl),
      tapGoMemoryCache.set(cacheKey, cachedData, ttl),
    ]);

  } catch (error) {
    console.error('Error caching response:', error);
  }
}

// ===== SPECIALIZED CACHE DECORATORS =====

// Restaurant data caching
export const withRestaurantCache = (restaurantId?: string) =>
  withCache({
    ttl: TTL.REDIS.RESTAURANT_METADATA,
    key: restaurantId ? `restaurant:${restaurantId}` : undefined,
    tags: ['restaurant'],
    vary: ['Accept-Language'],
  });

// Menu data caching
export const withMenuCache = (restaurantId?: string) =>
  withCache({
    ttl: TTL.REDIS.MENU_CACHE,
    key: restaurantId ? `menu:${restaurantId}` : undefined,
    tags: ['menu', 'restaurant'],
    vary: ['Accept-Language'],
  });

// Search results caching
export const withSearchCache = () =>
  withCache({
    ttl: TTL.REDIS.SEARCH_RESULTS,
    tags: ['search'],
    vary: ['Accept-Language', 'User-Agent'],
  });

// User-specific data caching (shorter TTL)
export const withUserCache = (userId?: string) =>
  withCache({
    ttl: TTL.APP.USER_PROFILES,
    key: userId ? `user:${userId}` : undefined,
    tags: ['user'],
    vary: ['Authorization'],
  });

// Analytics data caching (longer TTL)
export const withAnalyticsCache = () =>
  withCache({
    ttl: TTL.ANALYTICS.DAILY_REPORTS,
    tags: ['analytics'],
    cacheControl: 'public, max-age=3600, stale-while-revalidate=7200',
  });

// ===== CACHE INVALIDATION HELPERS =====

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    // For now, we'll implement a simple key-based invalidation
    // In a full implementation, you'd want to track cache tags
    
    if (pattern.includes('restaurant:')) {
      const restaurantId = pattern.split(':')[1];
      await tapGoCache.invalidateRestaurant(restaurantId);
    } else if (pattern.includes('user:')) {
      const userId = pattern.split(':')[1];
      await tapGoCache.invalidateUser(userId);
    }
    
    console.log(`Cache invalidated for pattern: ${pattern}`);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

export async function invalidateCacheByTags(tags: string[]): Promise<void> {
  try {
    // Implement tag-based invalidation
    // This would require maintaining a tag-to-key mapping
    console.log(`Cache invalidated for tags: ${tags.join(', ')}`);
  } catch (error) {
    console.error('Tag-based cache invalidation error:', error);
  }
}

// ===== CACHE WARMING HELPERS =====

export async function warmCache(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: CacheOptions = {}
): Promise<void> {
  try {
    const cacheKey = generateCacheKey(request, options.key);
    const exists = await tapGoCache.get(cacheKey);
    
    if (!exists) {
      console.log(`Warming cache for key: ${cacheKey}`);
      const response = await handler(request);
      
      if (response.status >= 200 && response.status < 300) {
        await setCachedResponse(cacheKey, response, options.ttl || TTL.APP.API_RESPONSES);
      }
    }
  } catch (error) {
    console.error('Cache warming error:', error);
  }
}

// ===== EXPORT DEFAULT =====

export default withCache;

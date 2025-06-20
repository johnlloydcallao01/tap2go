# 🚀 Tap2Go Enterprise Caching System

## Overview

A comprehensive multi-layer caching architecture implementing the enterprise-grade blueprint with Redis, Memory, and Client-side storage for optimal performance.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Cache  │    │  Application    │    │  Distributed    │
│   (0-5ms)       │ -> │  Cache (5-20ms) │ -> │  Cache (20-100ms)│
│                 │    │                 │    │                 │
│ • Service Worker│    │ • Memory Cache  │    │ • Redis/Upstash │
│ • IndexedDB     │    │ • RTK Query     │    │ • Multi-region  │
│ • LocalStorage  │    │ • Node.js Cache │    │ • Auto-scaling  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Directory Structure

```
src/cache/
├── config/
│   ├── ttl.ts              # TTL configurations for all cache layers
│   ├── redis.ts            # Upstash Redis client configuration
│   └── environment.ts      # Environment-specific settings
├── server/
│   ├── redis.ts            # Redis cache operations
│   ├── memory.ts           # In-memory cache fallback
│   └── middleware.ts       # API route caching middleware
├── client/                 # (Future: Client-side caching)
├── utils/                  # (Future: Cache utilities)
└── index.ts               # Main cache interface
```

## 🔧 Configuration

### Environment Variables

```bash
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Cache Features
ENABLE_REDIS_CACHING=true
REDIS_DEFAULT_TTL=3600
```

### TTL Configuration

The system uses intelligent TTL (Time-To-Live) settings based on data type:

- **Real-time data**: 10-30 seconds (order status, driver location)
- **User sessions**: 24 hours
- **Restaurant data**: 1-2 hours
- **Search results**: 5-30 minutes
- **Static content**: 1 year

## 🚀 Quick Start

### 1. Basic Usage

```typescript
import { cache } from '@/cache';

// Simple get/set operations
await cache.set('user:123:profile', userData, 3600);
const profile = await cache.get('user:123:profile');

// High-level operations
await cache.setUserSession('user123', sessionData);
const session = await cache.getUserSession('user123');
```

### 2. API Route Caching

```typescript
import { withCache } from '@/cache/server/middleware';

export const GET = withCache({
  ttl: 300, // 5 minutes
  tags: ['restaurant'],
})(async (request) => {
  // Your API logic here
  return NextResponse.json(data);
});
```

### 3. Specialized Cache Decorators

```typescript
import { withRestaurantCache, withSearchCache } from '@/cache';

// Restaurant data caching
export const GET = withRestaurantCache('restaurant-123')(handler);

// Search results caching
export const GET = withSearchCache()(handler);
```

## 🎯 Cache Strategies

### 1. Cache-Aside Pattern
```typescript
async function getRestaurant(id: string) {
  // Try cache first
  let restaurant = await cache.getRestaurant(id);
  
  if (!restaurant) {
    // Cache miss - fetch from database
    restaurant = await db.restaurants.findById(id);
    
    // Store in cache
    await cache.setRestaurant(id, restaurant);
  }
  
  return restaurant;
}
```

### 2. Write-Through Pattern
```typescript
async function updateRestaurant(id: string, data: any) {
  // Update database
  await db.restaurants.update(id, data);
  
  // Update cache
  await cache.setRestaurant(id, data);
  
  // Invalidate related caches
  await cache.invalidateRestaurant(id);
}
```

### 3. Cache Warming
```typescript
// Preload popular data
await cache.warmPopularRestaurants();
await cache.warmUserPreferences(userId);
```

## 🔄 Cache Invalidation

### Automatic Invalidation

The system automatically invalidates related caches when data changes:

```typescript
// When restaurant updates, invalidates:
// - restaurant:123
// - restaurant:123:menu
// - search:restaurants:*
// - restaurants:popular*
await cache.invalidateRestaurant('123');

// When user updates, invalidates:
// - user:123:session
// - user:123:profile
// - user:123:preferences
await cache.invalidateUser('123');
```

### Manual Invalidation

```typescript
// Invalidate specific keys
await cache.del('specific:cache:key');

// Invalidate by pattern (limited support in Upstash)
await invalidateCache('restaurant:*');

// Invalidate by tags
await invalidateCacheByTags(['restaurant', 'menu']);
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint

```
GET /api/cache/test
```

Returns comprehensive cache system status:
- Redis connection health
- Basic operations test
- Memory cache status
- Performance metrics

### Cache Metrics

```typescript
import { redisMetrics } from '@/cache';

const metrics = redisMetrics.getMetrics();
console.log(`Hit rate: ${metrics.hitRate}%`);
console.log(`Total operations: ${metrics.operations}`);
```

## 🛡️ Error Handling & Fallbacks

The system includes robust error handling:

1. **Redis Unavailable**: Automatically falls back to memory cache
2. **Memory Cache Full**: Uses LRU eviction policy
3. **Network Errors**: Graceful degradation with logging
4. **Invalid Data**: Automatic cleanup and re-fetch

## 🔧 Advanced Configuration

### Environment-Specific Settings

```typescript
// Development: Shorter TTLs, debug logging
// Staging: Balanced settings, metrics enabled
// Production: Optimized TTLs, monitoring enabled
```

### Memory Allocation

```typescript
// Configurable memory allocation percentages:
// - User Sessions: 30%
// - Restaurant Data: 25%
// - Search Results: 20%
// - API Responses: 15%
// - Buffer: 10%
```

## 🧪 Testing

### Test Cache Operations

```bash
# Test Redis connection
curl http://localhost:3001/api/cache/test

# Test cache invalidation
curl -X DELETE "http://localhost:3001/api/cache/test?userId=123"
curl -X DELETE "http://localhost:3001/api/cache/test?restaurantId=456"
```

### Unit Testing

```typescript
import { tapGoCache } from '@/cache';

describe('Cache Operations', () => {
  it('should store and retrieve data', async () => {
    await tapGoCache.set('test:key', { data: 'test' }, 60);
    const result = await tapGoCache.get('test:key');
    expect(result).toEqual({ data: 'test' });
  });
});
```

## 🚀 Performance Targets

- **Cache Hit Rate**: >95%
- **Response Time**: <50ms for cache hits
- **Memory Efficiency**: ~85% utilization
- **Error Rate**: <1% in production

## 🔮 Future Enhancements

1. **Client-Side Caching**: Service Worker + IndexedDB
2. **Cache Warming Jobs**: Background data preloading
3. **Advanced Analytics**: Cache performance dashboards
4. **Multi-Region**: Global cache distribution
5. **ML-Based Predictions**: Intelligent cache warming

## 📚 API Reference

### Core Methods

- `cache.get<T>(key: string): Promise<T | null>`
- `cache.set(key: string, value: any, ttl?: number): Promise<boolean>`
- `cache.del(key: string): Promise<boolean>`
- `cache.mget<T>(keys: string[]): Promise<(T | null)[]>`
- `cache.mset(pairs: Record<string, any>, ttl?: number): Promise<boolean>`

### High-Level Methods

- `cache.getUserSession(userId: string)`
- `cache.setUserSession(userId: string, data: any)`
- `cache.getRestaurant(restaurantId: string)`
- `cache.setRestaurant(restaurantId: string, data: any)`
- `cache.getSearchResults(query: string, type?: string)`
- `cache.setSearchResults(query: string, results: any, type?: string)`

### Invalidation Methods

- `cache.invalidateUser(userId: string)`
- `cache.invalidateRestaurant(restaurantId: string)`
- `cache.invalidateOrder(orderId: string, userId: string)`

## 🤝 Contributing

1. Follow the established patterns for new cache operations
2. Add appropriate TTL configurations in `config/ttl.ts`
3. Include error handling and fallbacks
4. Add tests for new functionality
5. Update documentation

---

**Built with ❤️ for Tap2Go Enterprise Performance**

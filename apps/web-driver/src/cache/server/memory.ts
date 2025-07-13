/**
 * In-Memory Cache for Tap2Go Server-Side Operations
 * Fallback cache when Redis is unavailable or for development
 */

import { TTL } from '../config/ttl';
import { currentConfig, CACHE_FEATURES } from '../config/environment';

// ===== CACHE ENTRY INTERFACE =====

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

// ===== LRU CACHE IMPLEMENTATION =====

export class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private defaultTTL: number;
  private enabled: boolean;

  // Metrics
  private hits = 0;
  private misses = 0;
  private evictions = 0;

  constructor(maxSize = 1000, defaultTTL = 3600) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.enabled = true;

    // Start cleanup interval
    this.startCleanupInterval();
  }

  // ===== CORE OPERATIONS =====

  get<T = unknown>(key: string): T | null {
    if (!this.enabled) return null;

    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.hits++;

    return entry.value as T;
  }

  set(key: string, value: unknown, ttlSeconds?: number): boolean {
    if (!this.enabled) return false;

    const ttl = (ttlSeconds || this.defaultTTL) * 1000; // Convert to milliseconds
    const now = Date.now();

    const entry: CacheEntry = {
      value,
      expiresAt: now + ttl,
      createdAt: now,
      accessCount: 0,
      lastAccessed: now,
    };

    // Check if we need to evict entries
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    return true;
  }

  del(key: string): boolean {
    if (!this.enabled) return false;
    return this.cache.delete(key);
  }

  has(key: string): boolean {
    if (!this.enabled) return false;
    
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // ===== BATCH OPERATIONS =====

  mget<T = unknown>(keys: string[]): (T | null)[] {
    return keys.map(key => this.get<T>(key));
  }

  mset(keyValuePairs: Record<string, unknown>, ttlSeconds?: number): boolean {
    if (!this.enabled) return false;

    try {
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        this.set(key, value, ttlSeconds);
      });
      return true;
    } catch (error) {
      console.error('Memory cache MSET error:', error);
      return false;
    }
  }

  // ===== LRU EVICTION =====

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.evictions++;
    }
  }

  // ===== CLEANUP AND MAINTENANCE =====

  private startCleanupInterval(): void {
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (CACHE_FEATURES.DEBUG_LOGGING && cleanedCount > 0) {
      console.log(`[MEMORY CACHE] Cleaned up ${cleanedCount} expired entries`);
    }
  }

  // ===== CACHE STATISTICS =====

  getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  private getMemoryUsage(): { entries: number; estimatedBytes: number } {
    let estimatedBytes = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation of memory usage
      estimatedBytes += key.length * 2; // String overhead
      estimatedBytes += JSON.stringify(entry.value).length * 2; // Value size
      estimatedBytes += 64; // Entry metadata overhead
    }

    return {
      entries: this.cache.size,
      estimatedBytes,
    };
  }

  // ===== CACHE MANAGEMENT =====

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  resize(newMaxSize: number): void {
    this.maxSize = newMaxSize;
    
    // Evict entries if current size exceeds new max
    while (this.cache.size > this.maxSize) {
      this.evictLRU();
    }
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  // ===== EXPORT KEYS =====

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // ===== HEALTH CHECK =====

  healthCheck() {
    const stats = this.getStats();
    const memoryUsageMB = stats.memoryUsage.estimatedBytes / (1024 * 1024);
    
    return {
      healthy: this.enabled,
      stats,
      warnings: [
        ...(stats.hitRate < 80 ? ['Low hit rate'] : []),
        ...(memoryUsageMB > 100 ? ['High memory usage'] : []),
        ...(stats.evictions > 1000 ? ['High eviction rate'] : []),
      ],
    };
  }
}

// ===== TAP2GO MEMORY CACHE WRAPPER =====

export class TapGoMemoryCache {
  private cache: MemoryCache;

  constructor() {
    // Configure based on environment
    const maxSize = currentConfig.memory.maxSize === '50MB' ? 5000 : 
                   currentConfig.memory.maxSize === '128MB' ? 12800 : 
                   currentConfig.memory.maxSize === '256MB' ? 25600 : 1000;

    this.cache = new MemoryCache(maxSize, currentConfig.redis.defaultTTL);
  }

  // ===== HIGH-LEVEL CACHE OPERATIONS =====

  // User operations
  async getUserSession(userId: string) {
    return this.cache.get(`user:${userId}:session`);
  }

  async setUserSession(userId: string, sessionData: unknown) {
    return this.cache.set(`user:${userId}:session`, sessionData, TTL.REDIS.USER_SESSIONS);
  }

  // Restaurant operations
  async getRestaurant(restaurantId: string) {
    return this.cache.get(`restaurant:${restaurantId}`);
  }

  async setRestaurant(restaurantId: string, restaurantData: unknown) {
    return this.cache.set(`restaurant:${restaurantId}`, restaurantData, TTL.REDIS.RESTAURANT_METADATA);
  }

  // Search operations
  async getSearchResults(query: string, type: string) {
    return this.cache.get(`search:${type}:${query}`);
  }

  async setSearchResults(query: string, type: string, results: unknown) {
    return this.cache.set(`search:${type}:${query}`, results, TTL.REDIS.SEARCH_RESULTS);
  }

  // Generic operations
  async get<T = unknown>(key: string): Promise<T | null> {
    return this.cache.get<T>(key);
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    return this.cache.set(key, value, ttlSeconds);
  }

  async del(key: string): Promise<boolean> {
    return this.cache.del(key);
  }

  async mget<T = unknown>(keys: string[]): Promise<(T | null)[]> {
    return this.cache.mget<T>(keys);
  }

  async mset(keyValuePairs: Record<string, unknown>, ttlSeconds?: number): Promise<boolean> {
    return this.cache.mset(keyValuePairs, ttlSeconds);
  }

  // ===== CACHE MANAGEMENT =====

  getStats() {
    return this.cache.getStats();
  }

  healthCheck() {
    return this.cache.healthCheck();
  }

  clear() {
    this.cache.clear();
  }
}

// ===== SINGLETON INSTANCES =====

export const memoryCache = new MemoryCache();
export const tapGoMemoryCache = new TapGoMemoryCache();

// ===== EXPORT DEFAULT =====

export default tapGoMemoryCache;

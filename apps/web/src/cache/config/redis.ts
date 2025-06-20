/**
 * Redis Configuration for Tap2Go Enterprise Caching
 * Upstash Redis with professional connection management
 */

import { Redis } from '@upstash/redis';

// ===== ENVIRONMENT VALIDATION =====

function getRequiredEnvVars() {
  return {
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  } as const;
}

function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const requiredEnvVars = getRequiredEnvVars();
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return {
    valid: missingVars.length === 0,
    missing: missingVars,
  };
}

// ===== REDIS CLIENT CONFIGURATION =====

function createRedisConfig() {
  const envVars = getRequiredEnvVars();

  if (!envVars.UPSTASH_REDIS_REST_URL || !envVars.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('⚠️ Upstash Redis environment variables not found, Redis will be disabled');
    return null;
  }

  return {
    url: envVars.UPSTASH_REDIS_REST_URL,
    token: envVars.UPSTASH_REDIS_REST_TOKEN,

    // Connection settings optimized for serverless
    retry: {
      retries: 3,
      retryDelayOnFailure: 100,
    },

    // Enable automatic JSON serialization
    automaticDeserialization: true,
  } as const;
}

export const redisConfig = createRedisConfig();

// ===== REDIS CLIENT INSTANCES =====

function createRedisClient(): Redis | null {
  try {
    // First, try using fromEnv() method as recommended by Upstash
    const validation = validateEnvironmentVariables();

    if (!validation.valid) {
      console.warn('⚠️ Redis environment variables missing:', validation.missing.join(', '));
      return null;
    }

    console.log('🔄 Creating Redis client using fromEnv()...');
    return Redis.fromEnv();

  } catch (error) {
    console.warn('⚠️ Failed to create Redis client from env, trying manual config:', error);

    // Fallback to manual configuration
    if (redisConfig) {
      try {
        console.log('🔄 Creating Redis client using manual config...');
        return new Redis(redisConfig);
      } catch (manualError) {
        console.error('❌ Failed to create Redis client with manual config:', manualError);
        return null;
      }
    }

    console.error('❌ No valid Redis configuration available');
    return null;
  }
}

// Create Redis clients with proper error handling
export const redis = createRedisClient();
export const sessionRedis = redisConfig ? new Redis(redisConfig) : null;
export const analyticsRedis = redisConfig ? new Redis(redisConfig) : null;

// ===== CONNECTION HEALTH CHECK =====

export async function checkRedisConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing Redis connection...');
    console.log('URL:', process.env.UPSTASH_REDIS_REST_URL ? 'Set' : 'Missing');
    console.log('Token:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set' : 'Missing');

    // Check if Redis client was created successfully
    if (!redis) {
      console.error('❌ Redis client is null - environment variables may be missing');
      return false;
    }

    const testKey = 'health-check';
    const testValue = Date.now().toString();

    console.log('📝 Testing Redis SET operation...');
    // Test write
    await redis.set(testKey, testValue, { ex: 10 }); // 10 second expiry
    console.log('✅ Redis SET successful');

    console.log('📖 Testing Redis GET operation...');
    // Test read
    const result = await redis.get(testKey);
    console.log('✅ Redis GET successful, result:', result);
    console.log('🔍 Expected value:', testValue);
    console.log('🔍 Actual value:', result);
    console.log('🔍 Types - Expected:', typeof testValue, 'Actual:', typeof result);

    console.log('🗑️ Testing Redis DEL operation...');
    // Test delete
    await redis.del(testKey);
    console.log('✅ Redis DEL successful');

    // Convert both to strings for comparison since Redis might return different types
    const isValid = String(result) === String(testValue);
    console.log('🎯 Connection test result:', isValid ? 'PASS' : 'FAIL');

    return isValid;
  } catch (error) {
    console.error('❌ Redis connection health check failed:', error);

    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return false;
  }
}

// ===== REDIS OPERATION HELPERS =====

export class RedisOperations {
  private client: Redis | null;

  constructor(client: Redis | null = redis) {
    this.client = client;
  }

  private isAvailable(): boolean {
    return this.client !== null;
  }

  // ===== BASIC OPERATIONS =====

  async get<T = unknown>(key: string): Promise<T | null> {
    if (!this.isAvailable()) return null;

    try {
      return await this.client!.get<T>(key);
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      if (ttlSeconds) {
        await this.client!.set(key, value, { ex: ttlSeconds });
      } else {
        await this.client!.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client!.del(key);
      return true;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  // ===== ADVANCED OPERATIONS =====

  async mget<T = unknown>(keys: string[]): Promise<(T | null)[]> {
    if (!this.isAvailable()) return keys.map(() => null);

    try {
      const results = await this.client!.mget(...keys);
      return results as (T | null)[];
    } catch (error) {
      console.error(`Redis MGET error for keys ${keys.join(', ')}:`, error);
      return keys.map(() => null);
    }
  }

  async mset(keyValuePairs: Record<string, unknown>): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      const pairsObject: Record<string, unknown> = {};
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pairsObject[key] = value;
      });
      await this.client!.mset(pairsObject);
      return true;
    } catch (error) {
      console.error('Redis MSET error:', error);
      return false;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client!.expire(key, ttlSeconds);
      return true;
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    if (!this.isAvailable()) return -1;

    try {
      return await this.client!.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  }

  // ===== PATTERN OPERATIONS =====

  async deletePattern(pattern: string): Promise<number> {
    try {
      // Note: Upstash Redis doesn't support SCAN, so we use a different approach
      // This is a simplified version - in production, you might want to track keys
      console.warn(`Pattern deletion not fully supported in Upstash Redis: ${pattern}`);
      return 0;
    } catch (error) {
      console.error(`Redis pattern delete error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  // ===== HASH OPERATIONS =====

  async hget<T = unknown>(key: string, field: string): Promise<T | null> {
    if (!this.isAvailable()) return null;

    try {
      return await this.client!.hget<T>(key, field);
    } catch (error) {
      console.error(`Redis HGET error for key ${key}, field ${field}:`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: unknown): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client!.hset(key, { [field]: value });
      return true;
    } catch (error) {
      console.error(`Redis HSET error for key ${key}, field ${field}:`, error);
      return false;
    }
  }

  async hgetall(key: string): Promise<Record<string, unknown> | null> {
    if (!this.isAvailable()) return null;

    try {
      const result = await this.client!.hgetall(key);
      return result as Record<string, unknown> | null;
    } catch (error) {
      console.error(`Redis HGETALL error for key ${key}:`, error);
      return null;
    }
  }

  // ===== LIST OPERATIONS =====

  async lpush(key: string, ...values: unknown[]): Promise<number> {
    if (!this.isAvailable()) return 0;

    try {
      return await this.client!.lpush(key, ...values);
    } catch (error) {
      console.error(`Redis LPUSH error for key ${key}:`, error);
      return 0;
    }
  }

  async lrange<T = unknown>(key: string, start: number, stop: number): Promise<T[]> {
    if (!this.isAvailable()) return [];

    try {
      return await this.client!.lrange<T>(key, start, stop);
    } catch (error) {
      console.error(`Redis LRANGE error for key ${key}:`, error);
      return [];
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await this.client!.ltrim(key, start, stop);
      return true;
    } catch (error) {
      console.error(`Redis LTRIM error for key ${key}:`, error);
      return false;
    }
  }
}

// ===== DEFAULT REDIS OPERATIONS INSTANCE =====

export const redisOps = new RedisOperations(redis);
export const sessionOps = new RedisOperations(sessionRedis);
export const analyticsOps = new RedisOperations(analyticsRedis);

// ===== REDIS METRICS =====

export interface RedisMetrics {
  hits: number;
  misses: number;
  errors: number;
  operations: number;
  hitRate: number;
}

class RedisMetricsCollector {
  private metrics: RedisMetrics = {
    hits: 0,
    misses: 0,
    errors: 0,
    operations: 0,
    hitRate: 0,
  };

  recordHit(): void {
    this.metrics.hits++;
    this.metrics.operations++;
    this.updateHitRate();
  }

  recordMiss(): void {
    this.metrics.misses++;
    this.metrics.operations++;
    this.updateHitRate();
  }

  recordError(): void {
    this.metrics.errors++;
    this.metrics.operations++;
  }

  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  getMetrics(): RedisMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      operations: 0,
      hitRate: 0,
    };
  }
}

export const redisMetrics = new RedisMetricsCollector();

// ===== EXPORT DEFAULT =====

export default redis;

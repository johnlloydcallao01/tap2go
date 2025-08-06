/**
 * Rate Limiting Middleware
 * 
 * Middleware for implementing rate limiting to prevent abuse and ensure fair usage.
 * In production, consider using Redis for distributed rate limiting.
 */

import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  message?: string;  // Custom error message
  skipSuccessfulRequests?: boolean;  // Don't count successful requests
  skipFailedRequests?: boolean;  // Don't count failed requests
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  successCount?: number;
  failedCount?: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  const ip = forwarded?.split(',')[0] || realIp || remoteAddr || 'unknown';
  
  // You might want to include user ID for authenticated requests
  const userId = request.headers.get('x-user-id');
  
  return userId ? `user:${userId}` : `ip:${ip}`;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number; error?: string } {
  cleanupExpiredEntries();
  
  const clientId = getClientId(request);
  const now = Date.now();
  const key = `rate_limit:${clientId}`;
  
  let entry = rateLimitStore.get(key);
  
  // Create new entry if doesn't exist or expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
      successCount: 0,
      failedCount: 0
    };
    rateLimitStore.set(key, entry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      error: config.message || 'Rate limit exceeded. Please try again later.'
    };
  }
  
  // Increment counter
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

/**
 * Update rate limit entry based on response status
 */
export function updateRateLimitEntry(
  request: NextRequest,
  config: RateLimitConfig,
  success: boolean
): void {
  if (!config.skipSuccessfulRequests && !config.skipFailedRequests) {
    return; // No need to update if we're counting all requests
  }
  
  const clientId = getClientId(request);
  const key = `rate_limit:${clientId}`;
  const entry = rateLimitStore.get(key);
  
  if (!entry) return;
  
  if (success && config.skipSuccessfulRequests) {
    entry.count = Math.max(0, entry.count - 1);
    entry.successCount = (entry.successCount || 0) + 1;
  } else if (!success && config.skipFailedRequests) {
    entry.count = Math.max(0, entry.count - 1);
    entry.failedCount = (entry.failedCount || 0) + 1;
  }
}

/**
 * Rate limiting middleware wrapper
 */
export function withRateLimit(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<Response>,
  config: RateLimitConfig
) {
  return async (request: NextRequest, ...args: unknown[]): Promise<Response> => {
    const rateLimitResult = checkRateLimit(request, config);
    
    if (!rateLimitResult.allowed) {
      return Response.json(
        { 
          error: rateLimitResult.error,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    try {
      const response = await handler(request, ...args);
      
      // Update rate limit based on response status
      const success = response.status >= 200 && response.status < 400;
      updateRateLimitEntry(request, config, success);
      
      // Add rate limit headers to response
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-RateLimit-Limit', config.maxRequests.toString());
      newHeaders.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      newHeaders.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
      
    } catch (error) {
      // Update rate limit for failed requests
      updateRateLimitEntry(request, config, false);
      throw error;
    }
  };
}

/**
 * Predefined rate limit configurations
 */
export const rateLimitConfigs = {
  // Strict rate limiting for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  
  // General API rate limiting
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many API requests. Please try again later.'
  },
  
  // File upload rate limiting
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 uploads per hour
    message: 'Too many file uploads. Please try again in an hour.'
  },
  
  // Search rate limiting
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
    message: 'Too many search requests. Please slow down.'
  },
  
  // Order creation rate limiting
  orders: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 orders per hour
    message: 'Too many orders created. Please try again later.'
  }
};

/**
 * Convenience functions for common rate limits
 */
export const withAuthRateLimit = (handler: (request: NextRequest, ...args: unknown[]) => Promise<Response>) =>
  withRateLimit(handler, rateLimitConfigs.auth);

export const withApiRateLimit = (handler: (request: NextRequest, ...args: unknown[]) => Promise<Response>) =>
  withRateLimit(handler, rateLimitConfigs.api);

export const withUploadRateLimit = (handler: (request: NextRequest, ...args: unknown[]) => Promise<Response>) =>
  withRateLimit(handler, rateLimitConfigs.upload);

export const withSearchRateLimit = (handler: (request: NextRequest, ...args: unknown[]) => Promise<Response>) =>
  withRateLimit(handler, rateLimitConfigs.search);

export const withOrderRateLimit = (handler: (request: NextRequest, ...args: unknown[]) => Promise<Response>) =>
  withRateLimit(handler, rateLimitConfigs.orders);

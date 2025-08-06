/**
 * Server Middleware Index
 * 
 * This file exports all middleware functions for the web application.
 * Middleware functions handle cross-cutting concerns like authentication,
 * logging, rate limiting, and request/response processing.
 */

// Export all middleware
export * from './auth-middleware';
export * from './cors-middleware';
export * from './logging-middleware';
export * from './rate-limit-middleware';
export * from './validation-middleware';
export * from './error-middleware';

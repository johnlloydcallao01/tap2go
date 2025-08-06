/**
 * Service Types
 * 
 * Common types used by service layer functions.
 */

/**
 * Standard service result type
 */
export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter parameters
 */
export interface FilterParams {
  [key: string]: unknown;
}

/**
 * Search parameters
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: FilterParams;
  sort?: SortParams;
}

/**
 * Service context (for logging, tracing, etc.)
 */
export interface ServiceContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  timestamp?: Date;
}

/**
 * Database operation result
 */
export interface DatabaseResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  affectedRows?: number;
  insertId?: string;
}

/**
 * File upload result
 */
export interface FileUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  folder?: string;
  tags?: string[];
}

/**
 * Email service result
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * SMS service result
 */
export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Payment service result
 */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  amount?: number;
  currency?: string;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  event: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

/**
 * Notification data
 */
export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, unknown>;
  channels?: ('email' | 'push' | 'sms' | 'in_app')[];
}

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[];
  namespace?: string;
}

/**
 * Rate limit options
 */
export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  identifier?: string;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: Record<string, {
    status: 'healthy' | 'unhealthy';
    message?: string;
    duration?: number;
  }>;
  timestamp: Date;
}

/**
 * Batch operation result
 */
export interface BatchResult<T = unknown> {
  success: boolean;
  results: Array<{
    success: boolean;
    data?: T;
    error?: string;
    index: number;
  }>;
  totalProcessed: number;
  totalSuccessful: number;
  totalFailed: number;
}

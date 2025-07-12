/**
 * Enterprise-grade API Error Handler
 * Provides secure error handling for API routes with proper logging
 */

import { NextResponse } from 'next/server';

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
  timestamp: string;
  requestId?: string;
}

export interface ErrorContext {
  endpoint: string;
  method: string;
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
}

/**
 * Sanitizes error details for client response
 * Removes sensitive information in production
 */
function sanitizeErrorDetails(error: unknown, isProduction: boolean): unknown {
  if (!isProduction) {
    return error;
  }

  // In production, only return safe error information
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return null;
}

/**
 * Logs error with proper context for monitoring
 */
function logError(error: unknown, context: ErrorContext, apiError: ApiError): void {
  const logData = {
    error: {
      code: apiError.code,
      message: apiError.message,
      statusCode: apiError.statusCode,
      stack: error instanceof Error ? error.stack : undefined,
    },
    context,
    timestamp: apiError.timestamp,
    severity: apiError.statusCode >= 500 ? 'error' : 'warning',
  };

  if (apiError.statusCode >= 500) {
    console.error('API Error:', JSON.stringify(logData, null, 2));
  } else {
    console.warn('API Warning:', JSON.stringify(logData, null, 2));
  }

  // TODO: Send to monitoring service (Sentry, DataDog, etc.)
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(error, { contexts: { api: logData } });
  // }
}

/**
 * Creates standardized API error response
 */
export function createApiError(
  error: unknown,
  context: ErrorContext,
  customMessage?: string,
  customCode?: string,
  customStatusCode?: number
): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  const timestamp = new Date().toISOString();
  
  let statusCode = customStatusCode || 500;
  let code = customCode || 'INTERNAL_SERVER_ERROR';
  let message = customMessage || 'An unexpected error occurred';

  // Handle specific error types
  if (error instanceof Error) {
    if (error.name === 'ValidationError') {
      statusCode = 400;
      code = 'VALIDATION_ERROR';
      message = 'Invalid request data';
    } else if (error.name === 'UnauthorizedError') {
      statusCode = 401;
      code = 'UNAUTHORIZED';
      message = 'Authentication required';
    } else if (error.name === 'ForbiddenError') {
      statusCode = 403;
      code = 'FORBIDDEN';
      message = 'Access denied';
    } else if (error.name === 'NotFoundError') {
      statusCode = 404;
      code = 'NOT_FOUND';
      message = 'Resource not found';
    }
  }

  const apiError: ApiError = {
    code,
    message,
    statusCode,
    details: sanitizeErrorDetails(error, isProduction),
    timestamp,
    requestId: context.requestId,
  };

  // Log the error
  logError(error, context, apiError);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: apiError.code,
        message: apiError.message,
        timestamp: apiError.timestamp,
        requestId: apiError.requestId,
        ...(apiError.details && typeof apiError.details === 'object' ? { details: apiError.details } : {}),
      },
    },
    { status: statusCode }
  );
}

/**
 * Validation error helper
 */
export function createValidationError(
  message: string,
  context: ErrorContext,
  validationDetails?: unknown
): NextResponse {
  // Log validation details in development for debugging
  if (process.env.NODE_ENV === 'development' && validationDetails) {
    console.warn('Validation error details:', validationDetails);
  }
  return createApiError(
    new Error(message),
    context,
    message,
    'VALIDATION_ERROR',
    400
  );
}

/**
 * Authentication error helper
 */
export function createAuthError(
  message: string,
  context: ErrorContext
): NextResponse {
  return createApiError(
    new Error(message),
    context,
    message,
    'UNAUTHORIZED',
    401
  );
}

/**
 * Rate limit error helper
 */
export function createRateLimitError(
  context: ErrorContext,
  retryAfter?: number
): NextResponse {
  const response = createApiError(
    new Error('Rate limit exceeded'),
    context,
    'Too many requests. Please try again later.',
    'RATE_LIMIT_EXCEEDED',
    429
  );

  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}

/**
 * Success response helper
 */
export function createSuccessResponse(
  data: unknown,
  message?: string,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Extract error context from request
 */
export function extractErrorContext(
  request: Request,
  endpoint: string
): ErrorContext {
  const url = new URL(request.url);

  // Log request URL in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.debug('Processing request:', url.pathname);
  }
  
  return {
    endpoint,
    method: request.method,
    requestId: crypto.randomUUID(),
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') || 
        'unknown',
  };
}

/**
 * Async error wrapper for API routes
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  endpoint: string
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      const request = args[0] as Request;
      const context = extractErrorContext(request, endpoint);
      return createApiError(error, context);
    }
  };
}

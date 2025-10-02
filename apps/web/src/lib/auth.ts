/**
 * @file apps/web/src/lib/auth.ts
 * @description PayloadCMS Authentication Service
 * Enterprise-grade authentication with HTTP-only cookies and 30-day sessions
 */

import type {
  User,
  AuthResponse,
  LoginCredentials,
  PayloadAuthResponse,
  PayloadErrorResponse,
  PayloadMeResponse,
  SessionInfo,
  AuthErrorDetails,
  AuthErrorType
} from '@/types/auth';

// ========================================
// CONFIGURATION
// ========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
const COLLECTION_SLUG = 'users'; // Authentication is on users collection, not customers

// Request configuration for cookie-based authentication
const REQUEST_CONFIG: RequestInit = {
  credentials: 'include', // Essential for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
};

// ========================================
// ERROR HANDLING UTILITIES
// ========================================

function createAuthError(type: AuthErrorType, message: string, field?: string): AuthErrorDetails {
  return {
    type,
    message,
    field,
    retryable: type === 'NETWORK_ERROR',
  };
}

function handleApiError(error: any): AuthErrorDetails {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createAuthError('NETWORK_ERROR', 'Network connection failed. Please check your internet connection.');
  }

  // PayloadCMS error response
  if (error.errors && Array.isArray(error.errors)) {
    const firstError = error.errors[0];
    if (firstError.message.toLowerCase().includes('invalid login credentials')) {
      return createAuthError('INVALID_CREDENTIALS', 'Invalid email or password.');
    }
    if (firstError.message.toLowerCase().includes('account locked')) {
      return createAuthError('ACCOUNT_LOCKED', 'Account is temporarily locked. Please try again later.');
    }
    return createAuthError('VALIDATION_ERROR', firstError.message, firstError.field);
  }

  // HTTP status errors
  if (error.status === 401) {
    return createAuthError('INVALID_CREDENTIALS', 'Invalid email or password.');
  }
  if (error.status === 423) {
    return createAuthError('ACCOUNT_LOCKED', 'Account is temporarily locked. Please try again later.');
  }
  if (error.status >= 500) {
    return createAuthError('NETWORK_ERROR', 'Server error. Please try again later.');
  }

  return createAuthError('UNKNOWN_ERROR', error.message || 'An unexpected error occurred.');
}

// ========================================
// API UTILITIES
// ========================================

async function makeAuthRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}/${COLLECTION_SLUG}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...REQUEST_CONFIG,
      ...options,
      headers: {
        ...REQUEST_CONFIG.headers,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw { ...data, status: response.status };
    }

    return data;
  } catch (error) {
    console.error(`Auth API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ========================================
// CORE AUTHENTICATION FUNCTIONS
// ========================================

// ========================================
// RETRY UTILITIES
// ========================================

interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 1.5,
  retryableErrors: ['id', 'network', 'timeout', 'server error', '500', '502', '503', '504']
};

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableError(error: any, retryableErrors: string[]): boolean {
  const errorMessage = (error?.message || '').toLowerCase();
  const errorString = JSON.stringify(error).toLowerCase();
  
  return retryableErrors.some(retryableError => 
    errorMessage.includes(retryableError) || errorString.includes(retryableError)
  );
}

async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt or if error is not retryable
      if (attempt === config.maxAttempts || !isRetryableError(error, config.retryableErrors)) {
        break;
      }
      
      const delay = config.delayMs * Math.pow(config.backoffMultiplier, attempt - 1);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Login user with email and password
 * Uses PayloadCMS cookie strategy for secure session management
 * Only allows users with 'customer' role to authenticate
 * Optimized for fast user experience with minimal retries
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  console.log('🔐 LOGIN ATTEMPT:', credentials.email);

  // Clear any existing auth state before login to prevent conflicts
  clearAuthState();

  try {
    const response = await withRetry(async () => {
      return await makeAuthRequest<PayloadAuthResponse>('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    }, {
      maxAttempts: 2, // Reduced from 3 to 2 for faster failure
      delayMs: 500,   // Reduced from 1000ms to 500ms
      retryableErrors: ['network', 'timeout', '500', '502', '503', '504'] // Removed 'id' and 'server error'
    });

    console.log('✅ LOGIN SUCCESS:', {
      email: response.user.email,
      role: response.user.role,
      id: response.user.id
    });

    // Check if user has customer role
    if (response.user.role !== 'customer') {
      throw new Error('Access denied. Only customers can access this application.');
    }

    // Store token for persistent authentication (30 days)
    if (response.token) {
      localStorage.setItem('grandline_auth_token', response.token);

      // Store expiration time (30 days from now)
      const expirationTime = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
      localStorage.setItem('grandline_auth_expires', expirationTime.toString());
      
      // Cache user data for instant authentication restoration
      localStorage.setItem('grandline_auth_user', JSON.stringify(response.user));
    }

    return {
      message: response.message,
      user: response.user,
      token: response.token,
      exp: response.exp,
    };
  } catch (error) {
    const authError = handleApiError(error);
    throw new Error(authError.message);
  }
}

/**
 * Logout current user
 * Clears stored token and HTTP-only cookies on the server
 */
export async function logout(): Promise<void> {
  try {
    // Clear stored token first
    clearAuthState();

    // Also try to logout from PayloadCMS server (best effort)
    await makeAuthRequest('/logout', {
      method: 'POST',
    });
  } catch (error) {
    // Log error but don't throw - logout should always succeed locally
    console.error('Logout error:', error);
  }
}

/**
 * Get current authenticated user
 * Validates session using HTTP-only cookies
 * Only returns user if they have 'customer' role
 * Optimized for fast response with minimal logging
 */
export async function getCurrentUser(): Promise<User | null> {
  // Check if we have a stored token
  const storedToken = localStorage.getItem('grandline_auth_token');
  const storedExpires = localStorage.getItem('grandline_auth_expires');

  if (!storedToken || !storedExpires) {
    return null;
  }

  // Check if token is expired
  const expirationTime = parseInt(storedExpires);
  if (Date.now() > expirationTime) {
    clearAuthState();
    return null;
  }

  try {
    // Use token-based authentication instead of cookies
    // Include depth parameter to fetch profilePicture with related Media data
    const response = await fetch(`${API_BASE_URL}/${COLLECTION_SLUG}/me?depth=2`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${storedToken}`, // PayloadCMS uses JWT prefix
      },
    });

    if (!response.ok) {
      clearAuthState();
      return null;
    }

    const data = await response.json();

    if (data.user && data.user.role === 'customer') {
      // Update cached user data with fresh data from server
      localStorage.setItem('grandline_auth_user', JSON.stringify(data.user));
      return data.user;
    } else {
      clearAuthState();
      return null;
    }
  } catch (error) {
    clearAuthState();
    return null;
  }
}

/**
 * Refresh user session with enterprise-grade error handling and token management
 * Extends session duration using PayloadCMS custom refresh endpoint
 * Only allows users with 'customer' role
 */
export async function refreshSession(): Promise<AuthResponse> {
  const startTime = Date.now();
  console.log('🔄 INITIATING TOKEN REFRESH...');

  try {
    // Check if we have a valid token to refresh
    const currentToken = localStorage.getItem('grandline_auth_token');
    if (!currentToken) {
      console.log('❌ REFRESH FAILED: No current token available');
      throw new Error('No authentication token available for refresh');
    }

    // Make refresh request to the new enterprise endpoint
    const response = await makeAuthRequest<PayloadAuthResponse>('/refresh-token', {
      method: 'POST',
    });

    console.log('📋 REFRESH RESPONSE RECEIVED:', {
      hasUser: !!response.user,
      hasToken: !!response.token,
      userRole: response.user?.role,
      responseTime: `${Date.now() - startTime}ms`
    });

    // Security validation: Check if user has customer role
    if (response.user.role !== 'customer') {
      console.log('❌ REFRESH DENIED: Invalid role', response.user.role);
      clearAuthState(); // Clear invalid session
      throw new Error('Access denied. Only customers can access this application.');
    }

    // Update localStorage with new token and expiration
    if (response.token) {
      console.log('💾 UPDATING STORED TOKEN...');
      localStorage.setItem('grandline_auth_token', response.token);
      
      // Update cached user data
      localStorage.setItem('grandline_auth_user', JSON.stringify(response.user));
      
      // Update expiration time (30 days from now)
      const expirationTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
      localStorage.setItem('grandline_auth_expires', expirationTime.toString());
      
      console.log('✅ TOKEN REFRESH SUCCESS:', {
        email: response.user.email,
        expiresAt: new Date(expirationTime).toISOString(),
        responseTime: `${Date.now() - startTime}ms`
      });
    } else {
      console.warn('⚠️ REFRESH WARNING: No token in response');
    }

    // Emit refresh success event
    emitAuthEvent('session_refreshed', {
      user: response.user,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    });

    return {
      message: response.message,
      user: response.user,
      token: response.token,
      exp: response.exp,
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
    
    console.error('❌ TOKEN REFRESH FAILED:', {
      error: errorMessage,
      responseTime: `${responseTime}ms`,
      hasStoredToken: !!localStorage.getItem('grandline_auth_token')
    });

    // Enhanced error handling with graceful degradation
    if (errorMessage.includes('Authentication required') || 
        errorMessage.includes('Invalid email or password') ||
        errorMessage.includes('Access denied')) {
      // These are authentication failures - clear state
      console.log('🧹 CLEARING AUTH STATE due to authentication failure');
      clearAuthState();
    } else if (errorMessage.includes('Network connection failed')) {
      // Network error - don't clear state, just throw error
      console.log('📡 NETWORK ERROR during refresh - keeping current state');
    } else {
      // Unknown error - log but check if we still have a valid token
      const hasValidToken = hasValidStoredToken();
      console.log('❓ UNKNOWN REFRESH ERROR - token still valid?', hasValidToken);
      
      if (!hasValidToken) {
        clearAuthState();
      }
    }

    // Emit refresh failure event
    emitAuthEvent('session_refresh_failed', {
      error: errorMessage,
      timestamp: new Date().toISOString(),
      responseTime
    });

    const authError = handleApiError(error);
    throw new Error(authError.message);
  }
}

// ========================================
// SESSION MANAGEMENT FUNCTIONS
// ========================================

/**
 * Check if user is currently authenticated
 * Quick validation without full user data
 */
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Check if we have a valid stored token (quick check)
 * Optimized for performance with minimal logging
 */
export function hasValidStoredToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const storedToken = localStorage.getItem('grandline_auth_token');
  const storedExpires = localStorage.getItem('grandline_auth_expires');

  if (!storedToken || !storedExpires) {
    return false;
  }

  const expirationTime = parseInt(storedExpires);
  return Date.now() < expirationTime;
}

/**
 * Get detailed session information
 * Includes expiration and user data
 */
export async function getSessionInfo(): Promise<SessionInfo> {
  try {
    const response = await makeAuthRequest<PayloadMeResponse>('/me');
    
    return {
      isValid: response.user !== null,
      user: response.user || undefined,
      expiresAt: response.exp ? new Date(response.exp * 1000) : undefined,
    };
  } catch (error) {
    return {
      isValid: false,
    };
  }
}

/**
 * Clear local authentication state
 * Clears stored tokens and dispatches logout event
 * Optimized for performance
 */
export function clearAuthState(): void {
  // Clear stored authentication tokens
  if (typeof window !== 'undefined') {
    localStorage.removeItem('grandline_auth_token');
    localStorage.removeItem('grandline_auth_expires');
    localStorage.removeItem('grandline_auth_user'); // Clear cached user data
    sessionStorage.removeItem('auth:redirectAfterLogin');

    // Dispatch custom event for auth state changes
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Check if session is expired based on exp timestamp
 */
export function isSessionExpired(exp?: number): boolean {
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}

/**
 * Get time until session expires
 */
export function getTimeUntilExpiry(exp?: number): number {
  if (!exp) return 0;
  return Math.max(0, exp * 1000 - Date.now());
}

/**
 * Format user display name
 */
export function getUserDisplayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.username) {
    return user.username;
  }
  return user.email;
}

// ========================================
// AUTHENTICATION EVENTS
// ========================================

/**
 * Emit authentication event
 */
export function emitAuthEvent(event: string, data?: any): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`auth:${event}`, { detail: data }));
  }
}

// ========================================
// SESSION MONITORING
// ========================================

/**
 * Start automatic session refresh
 * Refreshes session every 25 minutes to maintain 30-day persistence
 */
export function startSessionMonitoring(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes

  const intervalId = setInterval(async () => {
    try {
      const isAuth = await checkAuthStatus();
      if (isAuth) {
        await refreshSession();
        emitAuthEvent('session_refreshed_auto');
      }
    } catch (error) {
      console.error('Auto session refresh failed:', error);
      emitAuthEvent('session_refresh_failed', { error });
    }
  }, REFRESH_INTERVAL);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Monitor for session expiration
 */
export function monitorSessionExpiration(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  const intervalId = setInterval(async () => {
    try {
      const sessionInfo = await getSessionInfo();

      if (!sessionInfo.isValid) {
        emitAuthEvent('session_expired');
        clearInterval(intervalId);
      } else if (sessionInfo.expiresAt) {
        const timeUntilExpiry = sessionInfo.expiresAt.getTime() - Date.now();

        // Warn if session expires in less than 10 minutes
        if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
          emitAuthEvent('session_expiring_soon', {
            expiresAt: sessionInfo.expiresAt,
            timeUntilExpiry
          });
        }
      }
    } catch (error) {
      console.error('Session monitoring error:', error);
    }
  }, CHECK_INTERVAL);

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}

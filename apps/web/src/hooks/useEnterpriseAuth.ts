'use client';

/**
 * Enterprise Authentication Hook - DISABLED
 *
 * Authentication has been disabled for the public web app.
 * This hook is maintained for future use if authentication is needed.
 */

import { User } from '@/types';

// Placeholder interfaces for maintaining structure
interface UseEnterpriseAuthOptions {
  requireAuth?: boolean;
  allowedRoles?: User['role'][];
  redirectTo?: string;
  onUnauthorized?: () => void;
}

interface EnterpriseAuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: User['role']) => boolean;
  hasAnyRole: (roles: User['role'][]) => boolean;
  isAuthorized: boolean;
  authError: string | null;
  isInitialized: boolean;
}

/**
 * Placeholder authentication hook - authentication disabled
 */
export function useEnterpriseAuth(options: UseEnterpriseAuthOptions = {}): EnterpriseAuthState {
  console.warn('Authentication is disabled in the public web app');

  // Return placeholder state - no authentication
  const hasRole = (role: User['role']) => false;
  const hasAnyRole = (roles: User['role'][]) => false;

  return {
    user: null,
    loading: false,
    isAuthenticated: false,
    hasRole,
    hasAnyRole,
    isAuthorized: true, // Allow all access since auth is disabled
    authError: null,
    isInitialized: true
  };
}

// Placeholder hooks - authentication disabled
export function useRequireAuth(allowedRoles?: User['role'][]) {
  return useEnterpriseAuth({ requireAuth: false });
}

export function useRequireAdmin() {
  return useEnterpriseAuth({ requireAuth: false });
}

export function useRequireVendor() {
  return useEnterpriseAuth({ requireAuth: false });
}

export function useRequireCustomer() {
  return useEnterpriseAuth({ requireAuth: false });
}

export function useRequireDriver() {
  return useEnterpriseAuth({ requireAuth: false });
}

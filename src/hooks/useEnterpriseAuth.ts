'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { User, AuthContextType } from '@/types';

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
 * Enterprise-grade authentication hook with role-based access control
 * and proper loading states for professional applications
 */
export function useEnterpriseAuth(options: UseEnterpriseAuthOptions = {}): EnterpriseAuthState {
  const {
    requireAuth = false,
    allowedRoles = [],
    redirectTo,
    onUnauthorized
  } = options;

  const auth = useAuth() as AuthContextType & { authError?: string | null; isInitialized?: boolean };
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  const {
    user,
    loading,
    authError,
    isInitialized
  } = auth;

  // Computed auth states
  const isAuthenticated = !!user;
  const hasRole = (role: User['role']) => user?.role === role;
  const hasAnyRole = useCallback((roles: User['role'][]) => user ? roles.includes(user.role) : false, [user]);
  
  // Check if user is authorized based on requirements
  const isAuthorized = (() => {
    if (!requireAuth) return true;
    if (!isAuthenticated) return false;
    if (allowedRoles.length === 0) return true;
    return hasAnyRole(allowedRoles);
  })();

  // FAST LOADING: Handle redirects without blocking page render
  useEffect(() => {
    // Only redirect after hydration and when auth state is stable
    if (!isInitialized || hasRedirected) return;

    // Small delay to allow page to render first
    const redirectTimer = setTimeout(() => {
      if (requireAuth && !isAuthenticated) {
        setHasRedirected(true);
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push('/auth/signin');
        }
        return;
      }

      if (requireAuth && isAuthenticated && allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
        setHasRedirected(true);
        if (onUnauthorized) {
          onUnauthorized();
        } else if (redirectTo) {
          router.push(redirectTo);
        } else {
          // Redirect based on user role
          switch (user?.role) {
            case 'admin':
              router.push('/admin');
              break;
            case 'vendor':
              router.push('/vendor/dashboard');
              break;
            case 'driver':
              router.push('/driver/dashboard');
              break;
            default:
              router.push('/');
          }
        }
      }
    }, 100); // Small delay to allow page to render

    return () => clearTimeout(redirectTimer);
  }, [
    isInitialized,
    isAuthenticated,
    requireAuth,
    allowedRoles,
    user?.role,
    hasRedirected,
    redirectTo,
    onUnauthorized,
    router,
    hasAnyRole
  ]);

  return {
    user,
    loading,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAuthorized,
    authError: authError || null,
    isInitialized: isInitialized || false
  };
}

/**
 * Hook for pages that require authentication
 */
export function useRequireAuth(allowedRoles?: User['role'][]) {
  return useEnterpriseAuth({
    requireAuth: true,
    allowedRoles
  });
}

/**
 * Hook for admin-only pages
 */
export function useRequireAdmin() {
  return useEnterpriseAuth({
    requireAuth: true,
    allowedRoles: ['admin']
  });
}

/**
 * Hook for vendor-only pages
 */
export function useRequireVendor() {
  return useEnterpriseAuth({
    requireAuth: true,
    allowedRoles: ['vendor']
  });
}

/**
 * Hook for customer-only pages
 */
export function useRequireCustomer() {
  return useEnterpriseAuth({
    requireAuth: true,
    allowedRoles: ['customer']
  });
}

/**
 * Hook for driver-only pages
 */
export function useRequireDriver() {
  return useEnterpriseAuth({
    requireAuth: true,
    allowedRoles: ['driver']
  });
}

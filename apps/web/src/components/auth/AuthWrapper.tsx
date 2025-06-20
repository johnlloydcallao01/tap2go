'use client';

import React from 'react';
import Link from 'next/link';
import { useEnterpriseAuth } from '@/hooks/useEnterpriseAuth';
import { User } from '@/types';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: User['role'][];
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

/**
 * Enterprise-grade auth wrapper that prevents layout shifts
 * and provides consistent loading states across the application
 */
export default function AuthWrapper({
  children,
  requireAuth = false,
  allowedRoles = [],
  fallback,
  loadingComponent,
  unauthorizedComponent
}: AuthWrapperProps) {
  const {
    user,
    isAuthenticated,
    isAuthorized,
    authError
  } = useEnterpriseAuth({ requireAuth, allowedRoles });

  // FAST LOADING: Only show loading for critical auth errors
  if (authError) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">!</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-red-600 font-medium mb-2">Authentication Error</div>
            <div className="text-sm text-red-500 mb-4">{authError}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check authentication and authorization
  if (requireAuth && (!isAuthenticated || !isAuthorized)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (unauthorizedComponent) {
      return <>{unauthorizedComponent}</>;
    }

    // Default unauthorized component
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access this page.
            </p>
            <a
              href="/auth/signin"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      );
    }

    // User is authenticated but not authorized
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">!</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don&apos;t have permission to access this page.
            {allowedRoles.length > 0 && (
              <span className="block mt-2 text-sm">
                Required role{allowedRoles.length > 1 ? 's' : ''}: {allowedRoles.join(', ')}
              </span>
            )}
          </p>
          <div className="space-x-3">
            <Link
              href="/"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go Home
            </Link>
            {user?.role === 'admin' && (
              <a
                href="/admin"
                className="inline-block bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Admin Panel
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
}

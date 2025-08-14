'use client';

/**
 * Protected Route Component for Admin App
 * Ensures only authenticated admin users can access protected pages
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, isInitialized, authError } = useAdminAuth();

  useEffect(() => {
    // Only redirect after auth is initialized
    if (isInitialized && !user && !loading) {
      router.push('/login');
    }
  }, [user, loading, isInitialized, router]);

  // Show loading while checking auth state
  if (!isInitialized || loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an auth error
  if (authError && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Authentication Error
            </h2>
            <p className="text-red-700 mb-4">{authError}</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated
  if (!user) {
    return null;
  }

  // Render children if user is authenticated
  return <>{children}</>;
}

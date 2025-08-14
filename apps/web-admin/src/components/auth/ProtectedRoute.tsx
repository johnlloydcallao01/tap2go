'use client';

/**
 * Protected Route Component for Admin App
 * Ensures only authenticated admin users can access protected pages
 * Includes real-time user validation against CMS
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, isInitialized, authError, signOut } = useAdminAuth();
  const [initialLoad, setInitialLoad] = useState(true);

  // Silent background user validation against CMS
  useEffect(() => {
    const validateUserExists = async () => {
      if (!user || !isInitialized || loading) return;

      try {
        const token = localStorage.getItem('admin-token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Silent validation - no loading states shown to user
        const response = await fetch('/api/auth/validate-user', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          // User no longer exists, is inactive, or lost admin privileges
          const errorData = await response.json().catch(() => ({}));
          console.log('User validation failed:', errorData.error || 'Unknown error');
          await signOut();
          router.push('/login');
          return;
        }

        const data = await response.json();
        if (!data.valid) {
          // Additional check - user is not valid
          console.log('User validation failed - user is not valid');
          await signOut();
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('User validation error:', error);
        // On validation error, only log out if it's a critical error
        // Don't log out for network issues to avoid disrupting user experience
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn('Network error during validation - keeping user logged in');
          return;
        }
        await signOut();
        router.push('/login');
      }
    };

    // Only validate immediately on first load, not on every render
    if (initialLoad && user) {
      validateUserExists();
      setInitialLoad(false);
    }

    // Set up periodic validation every 2 minutes (less frequent, more professional)
    const validationInterval = setInterval(() => validateUserExists(), 120000);

    // Validate when user returns to the tab/window (silent)
    const handleWindowFocus = () => {
      validateUserExists();
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(validationInterval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [user, isInitialized, loading, router, signOut, initialLoad]);

  useEffect(() => {
    // Only redirect after auth is initialized
    if (isInitialized && !user && !loading) {
      router.push('/login');
    }
  }, [user, loading, isInitialized, router]);

  // Only show loading on initial authentication check, not for routine validations
  if (!isInitialized || (loading && initialLoad)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin portal...</p>
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

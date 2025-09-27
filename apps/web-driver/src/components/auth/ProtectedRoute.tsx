'use client';

/**
 * Protected Route Component for Driver App
 * Ensures only authenticated drivers can access protected pages
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);

  useEffect(() => {
    // TODO: Implement actual auth check
    // For now, simulate loading and redirect to auth
    const timer = setTimeout(() => {
      setLoading(false);
      // Simulate no user - redirect to auth
      router.push('/auth');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  // Show loading while checking auth state
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to auth (handled in useEffect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render children if user is authenticated
  return <>{children}</>;
}

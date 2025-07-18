'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDriverAuth } from '@tap2go/shared-auth';

export default function Home() {
  const router = useRouter();
  const { user, loading, isInitialized } = useDriverAuth();

  useEffect(() => {
    if (isInitialized && !loading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.replace('/dashboard');
      } else {
        // User is not authenticated, redirect to auth page
        router.replace('/auth');
      }
    }
  }, [user, loading, isInitialized, router]);

  // Show loading state while checking auth and redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isInitialized } = useAdminAuth();

  useEffect(() => {
    if (!isInitialized) return; // Wait for auth to initialize

    if (user) {
      // User is authenticated, redirect to dashboard
      router.push('/dashboard');
    } else {
      // User is not authenticated, redirect to login
      router.push('/login');
    }
  }, [user, isInitialized, router]);

  // Show loading while checking authentication or redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading admin portal...</p>
      </div>
    </div>
  );
}

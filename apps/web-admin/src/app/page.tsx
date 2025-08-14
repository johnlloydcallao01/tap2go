'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, isInitialized } = useAdminAuth();

  useEffect(() => {
    if (!isInitialized) return; // Wait for auth to initialize

    // Immediate redirect without showing loading
    if (user) {
      // User is authenticated, redirect to dashboard
      router.replace('/dashboard');
    } else {
      // User is not authenticated, redirect to login
      router.replace('/login');
    }
  }, [user, isInitialized, router]);

  // Minimal loading state - most users won't see this due to fast redirects
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // This should rarely be seen due to immediate redirects
  return null;
}

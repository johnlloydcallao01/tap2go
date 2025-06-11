'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VendorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to vendor dashboard
    router.replace('/vendor/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to vendor dashboard...</p>
      </div>
    </div>
  );
}

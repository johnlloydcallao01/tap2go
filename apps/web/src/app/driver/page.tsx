'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DriverPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/driver/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

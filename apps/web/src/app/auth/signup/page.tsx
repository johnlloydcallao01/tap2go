'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();

  // Redirect to home since authentication is disabled
  React.useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to home...</p>
        <p className="text-sm text-gray-500 mt-2">Authentication is disabled in the public app</p>
      </div>
    </div>
  );
}

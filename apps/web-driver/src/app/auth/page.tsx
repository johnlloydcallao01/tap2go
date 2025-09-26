'use client';

/**
 * Driver Authentication Page
 * Handles both login and signup with tab switching
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Check auth state
  useEffect(() => {
    // TODO: Implement actual auth check
    // For now, simulate loading and no user
    const timer = setTimeout(() => {
      setLoading(false);
      // If user exists, redirect to dashboard
      // if (user) router.push('/dashboard');
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render auth forms if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {authMode === 'login' ? (
        <LoginForm onSwitchToSignup={() => setAuthMode('signup')} />
      ) : (
        <SignupForm onSwitchToLogin={() => setAuthMode('login')} />
      )}
    </div>
  );
}

'use client';

/**
 * Driver Authentication Page
 * Handles both login and signup with tab switching
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDriverAuth } from '@tap2go/shared-auth';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const { user, loading, isInitialized } = useDriverAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && user) {
      router.push('/dashboard');
    }
  }, [user, isInitialized, router]);

  // Show loading while checking auth state
  if (!isInitialized || loading) {
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

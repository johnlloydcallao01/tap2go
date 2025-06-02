'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * FAST SSR-safe authentication hook that prevents hydration mismatches
 * and allows immediate page rendering without blocking
 */
export function useSSRSafeAuth() {
  const auth = useAuth() as any;
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark as hydrated after first render
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // FAST LOADING: Always return actual auth state, but mark hydration status
  return {
    user: isHydrated ? auth.user : null,
    loading: isHydrated ? auth.loading : false, // Don't show loading during SSR
    isAuthenticated: isHydrated ? !!auth.user : false,
    authError: isHydrated ? auth.authError : null,
    isInitialized: isHydrated ? auth.isInitialized : true, // Assume initialized for SSR
    isHydrated,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
    updateProfile: auth.updateProfile,
  };
}

/**
 * FAST Hook for components that need to show different content based on auth state
 * Optimized for immediate rendering without blocking
 */
export function useSSRSafeAuthState() {
  const { user, loading, isHydrated } = useSSRSafeAuth();

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isHydrated,
    // FAST LOADING: Allow content to show immediately
    canShowAuthContent: true, // Always allow content to show
    canShowUserContent: isHydrated && !!user,
    canShowGuestContent: isHydrated && !user,
    // For components that need to wait for auth resolution
    shouldWaitForAuth: !isHydrated || loading,
  };
}

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthContextType } from '@/types';

/**
 * PROFESSIONAL SSR-safe authentication hook that prevents layout shifts
 * and ensures consistent auth state across server and client
 */
export function useSSRSafeAuth() {
  const auth = useAuth() as AuthContextType & { authError?: string | null; isInitialized?: boolean };
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark as hydrated after first render
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // PROFESSIONAL: Return consistent state that prevents layout shifts
  return {
    user: isHydrated ? auth.user : null,
    loading: isHydrated ? auth.loading : true, // Show loading during SSR to prevent layout shifts
    isAuthenticated: isHydrated ? !!auth.user : false,
    authError: isHydrated ? auth.authError : null,
    isInitialized: isHydrated ? auth.isInitialized : false, // Don't assume initialized during SSR
    isHydrated,
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
    updateProfile: auth.updateProfile,
  };
}

/**
 * PROFESSIONAL Hook for components that need to show different content based on auth state
 * Prevents layout shifts by ensuring proper loading states
 */
export function useSSRSafeAuthState() {
  const { user, loading, isHydrated, isInitialized } = useSSRSafeAuth();

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isHydrated,
    isInitialized,
    // PROFESSIONAL: Only show content when auth state is properly resolved
    canShowAuthContent: isHydrated && isInitialized, // Only show when auth is resolved
    canShowUserContent: isHydrated && isInitialized && !!user,
    canShowGuestContent: isHydrated && isInitialized && !user,
    // For components that need to wait for auth resolution
    shouldWaitForAuth: !isHydrated || !isInitialized || loading,
  };
}

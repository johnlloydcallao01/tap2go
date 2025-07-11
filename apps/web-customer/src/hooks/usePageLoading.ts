'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Professional page loading hook like Facebook/YouTube
 * - Tracks route changes and initial loads
 * - Lightweight and non-blocking
 * - Maintains super fast performance
 */
export function usePageLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const pathname = usePathname();

  // Track initial page load - WAIT FOR AUTH RESOLUTION, NOT ARBITRARY TIMING
  useEffect(() => {
    if (isInitialLoad) {
      setIsLoading(true);
      // Don't set arbitrary timeout - let LoadingProvider control when to hide splash
      // based on actual auth state resolution
    }
  }, [isInitialLoad]);

  // Method to manually complete initial load (called by LoadingProvider)
  const completeInitialLoad = () => {
    setIsLoading(false);
    setIsInitialLoad(false);
  };

  // Track route changes - NO LOADING for route changes to maintain speed
  useEffect(() => {
    if (!isInitialLoad) {
      // No loading indicator for route changes - instant navigation
      // This maintains the lightning-fast feel
    }
  }, [pathname, isInitialLoad]);

  return {
    isLoading,
    isInitialLoad,
    pathname,
    completeInitialLoad
  };
}

/**
 * Hook for manual loading control
 */
export function useManualLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  const withLoading = async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    startLoading();
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading
  };
}

/**
 * Hook for auth-related loading states
 */
export function useAuthLoading() {
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const startAuthLoading = () => setIsAuthLoading(true);
  const stopAuthLoading = () => setIsAuthLoading(false);

  const withAuthLoading = async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    startAuthLoading();
    try {
      const result = await asyncFn();
      return result;
    } finally {
      // Small delay to show the loading state briefly
      setTimeout(stopAuthLoading, 200);
    }
  };

  return {
    isAuthLoading,
    startAuthLoading,
    stopAuthLoading,
    withAuthLoading
  };
}

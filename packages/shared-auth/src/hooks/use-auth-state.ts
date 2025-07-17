/**
 * Authentication State Hook
 * Provides common authentication state management utilities
 */

import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/auth-service';
import { AnyAuthUser, AuthError } from '../types/auth';

export interface UseAuthStateOptions {
  enablePersistence?: boolean;
  storageKey?: string;
}

export interface UseAuthStateReturn {
  user: AnyAuthUser | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
  setUser: (user: AnyAuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Hook for managing authentication state
 */
export function useAuthState(options: UseAuthStateOptions = {}): UseAuthStateReturn {
  const { enablePersistence = true, storageKey = 'tap2go-auth' } = options;

  const [user, setUser] = useState<AnyAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Persist auth state to localStorage
  useEffect(() => {
    if (!enablePersistence || typeof window === 'undefined') return;

    if (user) {
      localStorage.setItem(storageKey, 'true');
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [user, enablePersistence, storageKey]);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (!enablePersistence || typeof window === 'undefined') return;

    const hasStoredAuth = localStorage.getItem(storageKey);
    if (hasStoredAuth && !user && loading) {
      // Show optimistic loading state
      setLoading(true);
    }
  }, [enablePersistence, storageKey, user, loading]);

  return {
    user,
    loading,
    error,
    isInitialized,
    setUser,
    setLoading,
    setError,
    clearError,
  };
}

/**
 * Hook for handling authentication errors
 */
export function useAuthError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any) => {
    if (error && typeof error === 'object' && 'message' in error) {
      setError(error.message);
    } else if (typeof error === 'string') {
      setError(error);
    } else {
      setError('An unexpected error occurred');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError,
    handleError,
    clearError,
  };
}

/**
 * Hook for token refresh management
 */
export function useTokenRefresh(authService: AuthService, interval: number = 50 * 60 * 1000) {
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const startTokenRefresh = useCallback((firebaseUser: FirebaseUser) => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    const intervalId = setInterval(async () => {
      try {
        await authService.getIdToken(true);
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, interval);

    setRefreshInterval(intervalId);
  }, [authService, interval, refreshInterval]);

  const stopTokenRefresh = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [refreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTokenRefresh();
    };
  }, [stopTokenRefresh]);

  return {
    startTokenRefresh,
    stopTokenRefresh,
  };
}

/**
 * Hook for multi-tab authentication synchronization
 */
export function useMultiTabSync(eventName: string, onUserChange: (user: AnyAuthUser | null) => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAuthChange = (event: CustomEvent) => {
      const { user: newUser, timestamp } = event.detail;
      // Only update if this is a newer change (prevent loops)
      if (timestamp > Date.now() - 1000) {
        onUserChange(newUser);
      }
    };

    window.addEventListener(eventName, handleAuthChange as EventListener);

    return () => {
      window.removeEventListener(eventName, handleAuthChange as EventListener);
    };
  }, [eventName, onUserChange]);

  const broadcastAuthChange = useCallback((user: AnyAuthUser | null) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: { user, timestamp: Date.now() }
      }));
    }
  }, [eventName]);

  return {
    broadcastAuthChange,
  };
}

/**
 * Hook for optimistic authentication loading
 */
export function useOptimisticAuth(storageKey: string, user: AnyAuthUser | null, loading: boolean) {
  const [showOptimistic, setShowOptimistic] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show optimistic loading if we have stored auth but no user yet
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;

    const hasStoredAuth = localStorage.getItem(storageKey);
    if (hasStoredAuth && !user && loading) {
      setShowOptimistic(true);
    } else {
      setShowOptimistic(false);
    }
  }, [isHydrated, storageKey, user, loading]);

  return {
    showOptimistic,
    isHydrated,
  };
}

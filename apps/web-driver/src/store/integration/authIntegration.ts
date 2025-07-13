/**
 * Auth Integration - Connects Redux with existing AuthContext
 * Maintains compatibility while adding Redux benefits
 */

import { useEffect } from 'react';
import { useAppDispatch } from '../hooks';
import { 
  setUser, 
  setLoading, 
  setError, 
  setInitialized, 
  syncAuthState 
} from '../slices/authSlice';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to sync AuthContext with Redux store
 * Call this in your root layout or app component
 */
export function useAuthReduxSync() {
  const dispatch = useAppDispatch();
  const auth = useAuth() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    // Sync user state
    if (auth.user !== undefined) {
      dispatch(setUser(auth.user));
    }
  }, [auth.user, dispatch]);

  useEffect(() => {
    // Sync loading state
    dispatch(setLoading(auth.loading));
  }, [auth.loading, dispatch]);

  useEffect(() => {
    // Sync error state
    dispatch(setError(auth.authError || null));
  }, [auth.authError, dispatch]);

  useEffect(() => {
    // Sync initialized state
    if (auth.isInitialized !== undefined) {
      dispatch(setInitialized(auth.isInitialized));
    }
  }, [auth.isInitialized, dispatch]);

  // Listen for multi-tab auth changes (your existing pattern)
  useEffect(() => {
    const handleAuthChange = (event: CustomEvent) => {
      const { user, timestamp } = event.detail;
      dispatch(syncAuthState({ user, timestamp }));
    };

    window.addEventListener('tap2go-auth-change', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('tap2go-auth-change', handleAuthChange as EventListener);
    };
  }, [dispatch]);
}

/**
 * Helper to dispatch auth actions from AuthContext
 * Use this in your AuthContext to update Redux when needed
 */
export const authReduxActions = {
  setUser,
  setLoading,
  setError,
  setInitialized,
  syncAuthState,
};

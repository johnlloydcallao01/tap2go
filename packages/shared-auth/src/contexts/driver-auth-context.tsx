/**
 * Driver Authentication Context
 * Provides authentication state and operations specifically for driver users
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/auth-service';
import { UserDatabaseService } from '../services/user-database';
import {
  DriverUser,
  DriverAuthContextType,
  AuthProviderProps,
  AuthError,
} from '../types/auth';

const DriverAuthContext = createContext<DriverAuthContextType | undefined>(undefined);

// Constants for enterprise-grade auth management
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes
const AUTH_STORAGE_KEY = 'tap2go-driver-auth';

/**
 * Driver Authentication Provider
 * Manages authentication state specifically for driver users
 */
export function DriverAuthProvider({ children }: AuthProviderProps) {
  // Core state
  const [user, setUser] = useState<DriverUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Services - initialize once (client-side only)
  const authService = useRef<AuthService | null>(null);
  const userDbService = useRef<UserDatabaseService | null>(null);

  // Initialize services on client side only
  useEffect(() => {
    if (typeof window !== 'undefined' && !authService.current) {
      authService.current = new AuthService({
        role: 'driver',
        enableGoogleAuth: false,
        enableMultiTabSync: true,
        tokenRefreshInterval: TOKEN_REFRESH_INTERVAL,
      });
      userDbService.current = new UserDatabaseService();
    }
  }, []);

  // Refs for cleanup and token management
  const tokenRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const authStateUnsubscribe = useRef<(() => void) | null>(null);

  // SSR-safe optimistic auth state
  const [showOptimisticAuth, setShowOptimisticAuth] = useState(false);

  // Client-side hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Token refresh setup
  const setupTokenRefresh = useCallback((firebaseUser: FirebaseUser) => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
    }

    tokenRefreshInterval.current = setInterval(async () => {
      try {
        if (authService.current) {
          await authService.current.getIdToken(true);
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, TOKEN_REFRESH_INTERVAL);
  }, []);

  // Cleanup token refresh
  const cleanupTokenRefresh = useCallback(() => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
      tokenRefreshInterval.current = null;
    }
  }, []);

  // Multi-tab auth synchronization
  const broadcastAuthChange = useCallback((driverUser: DriverUser | null) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tap2go-driver-auth-change', {
        detail: { user: driverUser, timestamp: Date.now() }
      }));
    }
  }, []);

  // Set auth session with optimistic updates
  const setAuthSession = useCallback((hasUser: boolean) => {
    if (typeof window !== 'undefined') {
      if (hasUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  // Handle driver user data loading with role validation
  const handleDriverUserLoad = useCallback(async (firebaseUser: FirebaseUser): Promise<DriverUser | null> => {
    try {
      if (!userDbService.current) {
        throw new Error('Database service not initialized');
      }
      const driverUser = await userDbService.current.getDriverUser(firebaseUser.uid);

      if (!driverUser) {
        console.error('Driver user data not found');
        setAuthError('Driver account not found. Please contact support.');
        return null;
      }

      // Validate driver role
      if (driverUser.role !== 'driver') {
        console.error('User is not a driver:', driverUser.role);
        setAuthError('This app is for drivers only. Please use the correct app for your role.');
        return null;
      }

      // Update last login time in background
      if (userDbService.current) {
        userDbService.current.updateUserLastLogin(firebaseUser.uid).catch(console.error);
      }

      return driverUser;
    } catch (error) {
      console.error('Error loading driver user data:', error);
      setAuthError('Failed to load driver data. Please try again.');
      return null;
    }
  }, []);

  // Main auth state listener
  useEffect(() => {
    let mounted = true;

    if (!authService.current) {
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    const unsubscribe = authService.current.onAuthStateChanged(async (firebaseUser) => {
      if (!mounted) return;

      try {
        setAuthError(null);

        if (firebaseUser) {
          const driverUser = await handleDriverUserLoad(firebaseUser);

          if (mounted && driverUser) {
            setUser(driverUser);
            setAuthSession(true);
            setupTokenRefresh(firebaseUser);
            broadcastAuthChange(driverUser);
          } else if (mounted) {
            setUser(null);
            setAuthSession(false);
            cleanupTokenRefresh();
            broadcastAuthChange(null);
          }
        } else {
          if (mounted) {
            setUser(null);
            setAuthSession(false);
            cleanupTokenRefresh();
            broadcastAuthChange(null);
          }
        }
      } catch (error) {
        console.error('Driver auth state change error:', error);
        if (mounted) {
          setUser(null);
          setAuthError('Authentication error occurred');
          setAuthSession(false);
          cleanupTokenRefresh();
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
          // Only clear optimistic auth after real auth state is determined
          if (isHydrated) {
            setShowOptimisticAuth(false);
          }
        }
      }
    });

    authStateUnsubscribe.current = unsubscribe;

    return () => {
      mounted = false;
      unsubscribe();
      cleanupTokenRefresh();
    };
  }, [handleDriverUserLoad, setupTokenRefresh, cleanupTokenRefresh, broadcastAuthChange, setAuthSession, isHydrated]);

  // Driver sign in
  const signIn = async (email: string, password: string) => {
    if (!authService.current) {
      throw new Error('Authentication service not initialized');
    }
    setLoading(true);
    setAuthError(null);
    try {
      await authService.current.signIn(email, password);
      // Auth state change will handle the rest
    } catch (error) {
      setLoading(false);
      const authError = error as AuthError;
      setAuthError(authError.message);
      throw error;
    }
  };

  // Driver sign up
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    if (!authService.current || !userDbService.current) {
      throw new Error('Services not initialized');
    }
    setLoading(true);
    setAuthError(null);
    try {
      const firebaseUser = await authService.current.signUp(
        email,
        password,
        `${firstName} ${lastName}`
      );

      // Create driver user documents in Firestore
      await userDbService.current.createDriverUser(firebaseUser.uid, email, firstName, lastName);

      // Auth state change will handle the rest
    } catch (error) {
      setLoading(false);
      const authError = error as AuthError;
      setAuthError(authError.message);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    if (!authService.current) {
      throw new Error('Authentication service not initialized');
    }
    setLoading(true);
    try {
      await authService.current.signOut();
      // Auth state change will handle cleanup
    } catch (error) {
      setLoading(false);
      const authError = error as AuthError;
      setAuthError(authError.message);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    setAuthError(null);
  };

  // Multi-tab auth synchronization
  useEffect(() => {
    if (!isHydrated) return;

    const handleAuthChange = (event: CustomEvent) => {
      const { user: newUser, timestamp } = event.detail;
      // Only update if this is a newer change (prevent loops)
      if (timestamp > Date.now() - 1000) {
        setUser(newUser);
      }
    };

    window.addEventListener('tap2go-driver-auth-change', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('tap2go-driver-auth-change', handleAuthChange as EventListener);
    };
  }, [isHydrated]);

  // Optimistic auth loading for better UX
  useEffect(() => {
    if (!isHydrated) return;

    const hasStoredAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (hasStoredAuth && !user && loading) {
      setShowOptimisticAuth(true);
    }
  }, [isHydrated, user, loading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (authStateUnsubscribe.current) {
        authStateUnsubscribe.current();
      }
      cleanupTokenRefresh();
    };
  }, [cleanupTokenRefresh]);

  const value: DriverAuthContextType = {
    user,
    loading: loading || showOptimisticAuth,
    isInitialized,
    authError,
    signIn,
    signUp,
    signOut,
    clearError,
  };

  return (
    <DriverAuthContext.Provider value={value}>
      {children}
    </DriverAuthContext.Provider>
  );
}

/**
 * Hook to use driver authentication context
 */
export function useDriverAuth() {
  const context = useContext(DriverAuthContext);
  if (context === undefined) {
    throw new Error('useDriverAuth must be used within a DriverAuthProvider');
  }
  return context;
}

/**
 * Customer Authentication Context
 * Provides authentication state and operations specifically for customer users
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/auth-service';
// UserDatabaseService removed - use PayloadCMS collections instead
import {
  CustomerUser,
  CustomerAuthContextType,
  AuthProviderProps,
  AuthError,
} from '../types/auth';

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

// Constants for enterprise-grade auth management
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes
const AUTH_STORAGE_KEY = 'tap2go-customer-auth';

/**
 * Customer Authentication Provider
 * Manages authentication state specifically for customer users
 */
export function CustomerAuthProvider({ children }: AuthProviderProps) {
  // Core state
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Services - initialize once
  const authService = useRef<AuthService>(new AuthService({
    role: 'customer',
    enableGoogleAuth: true, // Enable Google auth for customers
    enableMultiTabSync: true,
    tokenRefreshInterval: TOKEN_REFRESH_INTERVAL,
  }));
  // userDbService removed - use PayloadCMS collections instead

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
        await authService.current!.getIdToken(true);
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
  const broadcastAuthChange = useCallback((customerUser: CustomerUser | null) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tap2go-customer-auth-change', {
        detail: { user: customerUser, timestamp: Date.now() }
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

  // Handle customer user data loading with role validation
  const handleCustomerUserLoad = useCallback(async (firebaseUser: FirebaseUser): Promise<CustomerUser | null> => {
    try {
      // TODO: Replace with PayloadCMS API call to get customer user data
      console.log('Customer user loading - implement PayloadCMS integration');

      // For now, return a basic customer user structure
      const userData = {
        id: firebaseUser.uid,
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: 'customer' as const,
        firstName: firebaseUser.displayName?.split(' ')[0] || '',
        lastName: firebaseUser.displayName?.split(' ')[1] || '',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create customer user object
      const customerUser: CustomerUser = {
        id: firebaseUser.uid,
        firebaseUid: firebaseUser.uid,
        email: userData.email,
        role: 'customer',
        name: firebaseUser.displayName || '',
        isActive: userData.isActive,
        isVerified: userData.isVerified,
        totalOrders: 0, // TODO: Get from customer profile
        totalSpent: 0, // TODO: Get from customer profile
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };

      // TODO: Update last login time via PayloadCMS API
      console.log('Update last login time - implement PayloadCMS integration');

      return customerUser;
    } catch (error) {
      console.error('Error loading customer user data:', error);
      setAuthError('Failed to load customer data. Please try again.');
      return null;
    }
  }, []);

  // Main auth state listener
  useEffect(() => {
    let mounted = true;

    const setupAuthListener = async () => {
      const unsubscribe = await authService.current!.onAuthStateChanged(async (firebaseUser) => {
      if (!mounted) return;

      try {
        setAuthError(null);

        if (firebaseUser) {
          const customerUser = await handleCustomerUserLoad(firebaseUser);

          if (mounted && customerUser) {
            setUser(customerUser);
            setAuthSession(true);
            setupTokenRefresh(firebaseUser);
            broadcastAuthChange(customerUser);
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
        console.error('Customer auth state change error:', error);
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
    };

    setupAuthListener().catch(console.error);
  }, [handleCustomerUserLoad, setupTokenRefresh, cleanupTokenRefresh, broadcastAuthChange, setAuthSession, isHydrated]);

  // Customer sign in
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await authService.current!.signIn(email, password);
      // Auth state change will handle the rest
    } catch (error) {
      setLoading(false);
      const authError = error as AuthError;
      setAuthError(authError.message);
      throw error;
    }
  };

  // Customer sign up
  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const firebaseUser = await authService.current!.signUp(email, password, name);

      // TODO: Create customer user via PayloadCMS API
      console.log('Create customer user - implement PayloadCMS integration');

      // Auth state change will handle the rest
    } catch (error) {
      setLoading(false);
      const authError = error as AuthError;
      setAuthError(authError.message);
      throw error;
    }
  };

  // Google sign in
  const signInWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const firebaseUser = await authService.current!.signInWithGoogle();

      // TODO: Check if user exists and create via PayloadCMS API
      console.log('Check/create Google user - implement PayloadCMS integration');

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
    setLoading(true);
    try {
      await authService.current!.signOut();
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

    window.addEventListener('tap2go-customer-auth-change', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('tap2go-customer-auth-change', handleAuthChange as EventListener);
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

  const value: CustomerAuthContextType = {
    user,
    loading: loading || showOptimisticAuth,
    isInitialized,
    authError,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearError,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

/**
 * Hook to use customer authentication context
 */
export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}

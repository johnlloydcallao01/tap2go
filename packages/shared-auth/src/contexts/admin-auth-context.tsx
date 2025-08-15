/**
 * Admin Authentication Context
 * Provides authentication state and operations specifically for admin users
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/auth-service';
// UserDatabaseService removed - use PayloadCMS collections instead
import {
  AdminUser,
  AdminAuthContextType,
  AuthProviderProps,
  AuthError,
} from '../types/auth';

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Constants for enterprise-grade auth management
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes
const AUTH_STORAGE_KEY = 'tap2go-admin-auth';

/**
 * Admin Authentication Provider
 * Manages authentication state specifically for admin users
 */
export function AdminAuthProvider({ children }: AuthProviderProps) {
  // Core state
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Services - initialize once (client-side only)
  const authService = useRef<AuthService | null>(null);
  // userDbService removed - use PayloadCMS collections instead

  // Initialize services on client side only
  useEffect(() => {
    if (typeof window !== 'undefined' && !authService.current) {
      authService.current = new AuthService({
        role: 'admin',
        enableGoogleAuth: false, // Admins use email/password only
        enableMultiTabSync: true,
        tokenRefreshInterval: TOKEN_REFRESH_INTERVAL,
      });
      // userDbService initialization removed - use PayloadCMS collections instead
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

  // Clear auth error
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Handle admin user loading from database
  const handleAdminUserLoad = useCallback(async (firebaseUser: FirebaseUser): Promise<AdminUser | null> => {
    try {
      // TODO: Replace with PayloadCMS API call to get admin user data
      console.log('Admin user loading - implement PayloadCMS integration');

      // For now, return a basic admin user structure
      const adminUser: AdminUser = {
        id: firebaseUser.uid,
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: 'admin',
        firstName: firebaseUser.displayName?.split(' ')[0] || '',
        lastName: firebaseUser.displayName?.split(' ')[1] || '',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: ['admin'], // Default admin permissions
      };

      return adminUser;
    } catch (error) {
      console.error('Error loading admin user:', error);
      setAuthError('Failed to load admin profile');
      return null;
    }
  }, []);

  // Multi-tab auth synchronization
  const broadcastAuthChange = useCallback((adminUser: AdminUser | null) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tap2go-admin-auth-change', {
        detail: { user: adminUser, timestamp: Date.now() }
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

  // Token refresh management
  const setupTokenRefresh = useCallback((firebaseUser: FirebaseUser) => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
    }

    tokenRefreshInterval.current = setInterval(async () => {
      try {
        await firebaseUser.getIdToken(true); // Force refresh
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, TOKEN_REFRESH_INTERVAL);
  }, []);

  const cleanupTokenRefresh = useCallback(() => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
      tokenRefreshInterval.current = null;
    }
  }, []);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    if (!authService.current) {
      throw new Error('Authentication service not initialized');
    }

    try {
      setAuthError(null);
      const firebaseUser = await authService.current.signIn(email, password);
      
      // Admin user loading will be handled by auth state listener
      // No need to manually set user here
    } catch (error: any) {
      const errorMessage = error?.message || 'Sign in failed';
      setAuthError(errorMessage);
      throw error;
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async (): Promise<void> => {
    if (!authService.current) return;

    try {
      setAuthError(null);
      await authService.current.signOut();
      // User state will be cleared by auth state listener
    } catch (error: any) {
      const errorMessage = error?.message || 'Sign out failed';
      setAuthError(errorMessage);
      throw error;
    }
  }, []);

  // Auth state listener setup
  useEffect(() => {
    if (!isHydrated || !authService.current) return;

    let mounted = true;

    const setupAuthListener = async () => {
      const unsubscribe = await authService.current!.onAuthStateChanged(async (firebaseUser) => {
        if (!mounted) return;

      try {
        setAuthError(null);

        if (firebaseUser) {
          const adminUser = await handleAdminUserLoad(firebaseUser);

          if (mounted && adminUser) {
            setUser(adminUser);
            setAuthSession(true);
            setupTokenRefresh(firebaseUser);
            broadcastAuthChange(adminUser);
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
        console.error('Admin auth state change error:', error);
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
        if (unsubscribe) {
          unsubscribe();
        }
        cleanupTokenRefresh();
      };
    };

    setupAuthListener().catch(console.error);
  }, [handleAdminUserLoad, setupTokenRefresh, cleanupTokenRefresh, broadcastAuthChange, setAuthSession, isHydrated]);

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

    window.addEventListener('tap2go-admin-auth-change', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('tap2go-admin-auth-change', handleAuthChange as EventListener);
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

  const value: AdminAuthContextType = {
    user,
    loading: loading || showOptimisticAuth,
    isInitialized,
    authError,
    signIn,
    signOut,
    clearError,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

/**
 * Hook to use admin authentication context
 */
export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

'use client';

/**
 * Professional Driver Authentication Context
 * Enterprise-grade authentication system specifically for driver users
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  getIdToken,
} from 'firebase/auth';
import { auth } from 'firebase-config';
import { DriverUser, DriverAuthContextType, AuthProviderProps } from '@/types/auth';
import {
  createDriverUser,
  getDriverUser,
  getDriverProfile,
  updateDriverLastLogin,
} from '../lib/database';

const AuthContext = createContext<DriverAuthContextType | undefined>(undefined);

// Constants for enterprise-grade auth management
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes
const AUTH_STATE_KEY = 'tap2go-driver-auth-state';

// Session management utilities
const getAuthSession = () => {
  if (typeof window === 'undefined') return { initialized: false };
  
  try {
    const session = sessionStorage.getItem(AUTH_STATE_KEY);
    return session ? JSON.parse(session) : { initialized: false };
  } catch {
    return { initialized: false };
  }
};

const setAuthSession = (initialized: boolean) => {
  if (typeof window === 'undefined') return;

  try {
    if (initialized) {
      sessionStorage.setItem(AUTH_STATE_KEY, JSON.stringify({
        initialized: true,
        timestamp: Date.now()
      }));
    } else {
      sessionStorage.removeItem(AUTH_STATE_KEY);
    }
  } catch (error) {
    console.error('Error setting auth session:', error);
  }
};

// Multi-tab synchronization for driver auth
const broadcastAuthChange = (user: DriverUser | null) => {
  if (typeof window === 'undefined') return;

  try {
    const event = new CustomEvent('tap2go-driver-auth-change', {
      detail: { user, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Error broadcasting auth change:', error);
  }
};

export function DriverAuthProvider({ children }: AuthProviderProps) {
  // Enterprise-grade state management
  const [user, setUser] = useState<DriverUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Refs for cleanup and token management
  const tokenRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const authStateUnsubscribe = useRef<(() => void) | null>(null);
  const tokenChangeUnsubscribe = useRef<(() => void) | null>(null);

  // SSR-safe optimistic auth state
  const [showOptimisticAuth, setShowOptimisticAuth] = useState(false);

  // Handle hydration and set optimistic state
  useEffect(() => {
    setIsHydrated(true);
    const session = getAuthSession();
    if (session.initialized) {
      setShowOptimisticAuth(true);
    }
  }, []);

  // Enterprise-grade token refresh
  const setupTokenRefresh = useCallback(async (firebaseUser: FirebaseUser) => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
    }

    tokenRefreshInterval.current = setInterval(async () => {
      try {
        await getIdToken(firebaseUser, true); // Force refresh
        console.log('Driver token refreshed successfully');
      } catch (error) {
        console.error('Driver token refresh failed:', error);
        setAuthError('Session expired. Please sign in again.');
      }
    }, TOKEN_REFRESH_INTERVAL);
  }, []);

  const cleanupTokenRefresh = useCallback(() => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
      tokenRefreshInterval.current = null;
    }
  }, []);

  // Handle driver user data loading with role validation
  const handleDriverUserLoad = useCallback(async (firebaseUser: FirebaseUser): Promise<DriverUser | null> => {
    try {
      const userData = await getDriverUser(firebaseUser.uid);
      const driverProfile = await getDriverProfile(firebaseUser.uid);

      if (!userData) {
        console.error('Driver user data not found');
        setAuthError('Driver account not found. Please contact support.');
        return null;
      }

      // Validate driver role
      if (userData.role !== 'driver') {
        console.error('User is not a driver:', userData.role);
        setAuthError('This app is for drivers only. Please use the correct app for your role.');
        return null;
      }

      // Check if driver is active
      if (!userData.isActive) {
        console.error('Driver account is inactive');
        setAuthError('Your driver account is inactive. Please contact support.');
        return null;
      }

      const driverUser: DriverUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName: driverProfile?.firstName,
        lastName: driverProfile?.lastName,
        role: 'driver',
        phone: userData.phoneNumber,
        profileImage: userData.profileImageUrl,
        isActive: userData.isActive,
        isVerified: userData.isVerified,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      };

      // Update last login time in background
      updateDriverLastLogin(firebaseUser.uid).catch(console.error);

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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
  }, [handleDriverUserLoad, setupTokenRefresh, cleanupTokenRefresh, isHydrated]);

  // Driver sign in
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Auth state change will handle the rest
    } catch (error) {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setAuthError(errorMessage);
      throw error;
    }
  };

  // Driver sign up
  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase Auth profile
      await updateFirebaseProfile(firebaseUser, { 
        displayName: `${firstName} ${lastName}` 
      });

      // Create driver user documents in Firestore
      await createDriverUser(firebaseUser.uid, email, firstName, lastName);

      // Auth state change will handle the rest
    } catch (error) {
      setLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      setAuthError(errorMessage);
      throw error;
    }
  };

  // Driver sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      cleanupTokenRefresh();
      await firebaseSignOut(auth);
      setAuthSession(false);
      broadcastAuthChange(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cleanupTokenRefresh]);

  // Clear error
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Multi-tab auth synchronization
  useEffect(() => {
    const handleAuthChange = (event: CustomEvent) => {
      const { user: syncedUser } = event.detail;
      setUser(syncedUser);
    };

    window.addEventListener('tap2go-driver-auth-change', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('tap2go-driver-auth-change', handleAuthChange as EventListener);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const currentAuthUnsubscribe = authStateUnsubscribe.current;
    const currentTokenUnsubscribe = tokenChangeUnsubscribe.current;

    return () => {
      cleanupTokenRefresh();
      if (currentAuthUnsubscribe) {
        currentAuthUnsubscribe();
      }
      if (currentTokenUnsubscribe) {
        currentTokenUnsubscribe();
      }
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useDriverAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useDriverAuth must be used within a DriverAuthProvider');
  }
  return context;
}

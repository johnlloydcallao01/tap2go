'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  onIdTokenChanged,
  getIdToken,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, AuthContextType } from '@/types';
import { createUser, getUser, updateUser, updateUserLastLogin } from '@/lib/database/users';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enterprise-grade auth state management
const AUTH_STATE_KEY = 'tap2go_auth_initialized';
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Secure session storage (httpOnly would be better, but this is client-side)
const getAuthSession = (): { initialized: boolean; timestamp: number } => {
  if (typeof window === 'undefined') return { initialized: false, timestamp: 0 };

  try {
    const session = sessionStorage.getItem(AUTH_STATE_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      // Check if session is still valid (not expired)
      if (Date.now() - parsed.timestamp < SESSION_TIMEOUT) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading auth session:', error);
  }

  return { initialized: false, timestamp: 0 };
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

// Multi-tab synchronization
const broadcastAuthChange = (user: User | null) => {
  if (typeof window === 'undefined') return;

  try {
    const event = new CustomEvent('tap2go-auth-change', {
      detail: { user, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Error broadcasting auth change:', error);
  }
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Enterprise-grade state management
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Refs for cleanup and token management
  const tokenRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const authStateUnsubscribe = useRef<(() => void) | null>(null);
  const tokenChangeUnsubscribe = useRef<(() => void) | null>(null);

  // SSR-safe optimistic auth state (only set after hydration)
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
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Token refresh failed:', error);
        setAuthError('Session expired. Please sign in again.');
      }
    }, TOKEN_REFRESH_INTERVAL);
  }, []);

  // Clean up intervals
  const cleanupTokenRefresh = useCallback(() => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
      tokenRefreshInterval.current = null;
    }
  }, []);

  // Handle user data loading
  const handleUserLoad = useCallback(async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      let userData = await getUser(firebaseUser.uid);

      // If user doesn't exist, create them (happens with social auth)
      if (!userData) {
        const providerData = firebaseUser.providerData[0];

        await createUser(firebaseUser.uid, {
          email: firebaseUser.email || '',
          role: 'customer', // Default role for social auth users
          isActive: true,
          isVerified: firebaseUser.emailVerified,
        });

        // Fetch the newly created user
        userData = await getUser(firebaseUser.uid);
      }

      if (userData) {
        const userObj: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          role: userData.role,
          phone: userData.phoneNumber,
          isActive: userData.isActive,
          isVerified: userData.isVerified,
          createdAt: userData.createdAt?.toDate(),
          updatedAt: userData.updatedAt?.toDate(),
        };

        // Update last login time in background
        updateUserLastLogin(firebaseUser.uid).catch(console.error);

        return userObj;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setAuthError('Failed to load user data');
    }
    return null;
  }, []);

  // Main auth state listener
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      try {
        setAuthError(null);

        if (firebaseUser) {
          const userObj = await handleUserLoad(firebaseUser);

          if (mounted && userObj) {
            setUser(userObj);
            setAuthSession(true);
            setupTokenRefresh(firebaseUser);
            broadcastAuthChange(userObj);
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
        console.error('Auth state change error:', error);
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
  }, [handleUserLoad, setupTokenRefresh, cleanupTokenRefresh, isHydrated]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: User['role']) => {
    setLoading(true);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase Auth profile
      await updateFirebaseProfile(firebaseUser, { displayName: name });

      // Create user document in Firestore using new database functions
      await createUser(firebaseUser.uid, {
        email,
        role,
        isActive: true,
        isVerified: false,
      });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Multi-tab auth synchronization
  useEffect(() => {
    const handleAuthChange = (event: CustomEvent) => {
      const { user: newUser, timestamp } = event.detail;
      // Only update if this is a newer change (prevent loops)
      if (timestamp > Date.now() - 1000) {
        setUser(newUser);
      }
    };

    window.addEventListener('tap2go-auth-change', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('tap2go-auth-change', handleAuthChange as EventListener);
    };
  }, []);

  // Enhanced sign out with proper cleanup
  // Google Sign-In
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Optional: Add scopes for additional permissions
      provider.addScope('profile');
      provider.addScope('email');

      // Use popup for better UX (can also use signInWithRedirect)
      await signInWithPopup(auth, provider);
      // Auth state change will be handled by onAuthStateChanged listener
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

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

  // Enhanced profile update
  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    try {
      await updateUser(user.id, {
        phoneNumber: data.phone,
        profileImageUrl: data.profileImage,
      });

      const updatedUser = { ...user, ...data, updatedAt: new Date() };
      setUser(updatedUser);
      broadcastAuthChange(updatedUser);
    } catch (error) {
      throw error;
    }
  }, [user]);

  // Enhanced context value with error state
  const value: AuthContextType & { authError: string | null; isInitialized: boolean } = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    authError,
    isInitialized,
  };

  // FAST LOADING: Never block the entire app - always render children
  // Let individual components handle their own auth states
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

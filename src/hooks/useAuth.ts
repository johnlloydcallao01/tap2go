/**
 * React Hook for Firebase Authentication
 * Handles user authentication state and operations
 */

import { useState, useEffect } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (email: string, password: string, displayName?: string) => Promise<User | null>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for Firebase Authentication
 */
export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState(prev => ({
        ...prev,
        user,
        loading: false,
      }));
    });

    return unsubscribe;
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      setState(prev => ({ ...prev, user, loading: false }));
      return user;
    } catch (error: unknown) {
      const authError = error as { message?: string };
      const errorMessage = authError.message || 'Failed to sign in';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string): Promise<User | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      setState(prev => ({ ...prev, user, loading: false }));
      return user;
    } catch (error: unknown) {
      const authError = error as { message?: string };
      const errorMessage = authError.message || 'Failed to create account';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await signOut(auth);
      setState(prev => ({ ...prev, user: null, loading: false }));
    } catch (error: unknown) {
      const authError = error as { message?: string };
      const errorMessage = authError.message || 'Failed to sign out';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
    }
  };

  // Clear error
  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    ...state,
    signIn,
    signUp,
    logout,
    clearError,
  };
};

export default useAuth;

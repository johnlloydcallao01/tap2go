/**
 * React Hook for Authentication
 * Handles user authentication state and operations without Firebase
 */

import { useState, useEffect } from 'react';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

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
 * Custom hook for Authentication (Non-Firebase)
 */
export const useAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Check for stored auth token or session
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Validate token with your backend API
          const response = await fetch('/api/auth/validate', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setState(prev => ({
              ...prev,
              user: userData.user,
              loading: false,
            }));
          } else {
            localStorage.removeItem('auth_token');
            setState(prev => ({ ...prev, loading: false }));
          }
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Auth state check failed:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    checkAuthState();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const { user, token } = data;
        
        localStorage.setItem('auth_token', token);
        setState(prev => ({ ...prev, user, loading: false }));
        return user;
      } else {
        const errorData = await response.json();
        setState(prev => ({ ...prev, loading: false, error: errorData.message || 'Failed to sign in' }));
        return null;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName?: string): Promise<User | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, displayName }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const { user, token } = data;
        
        localStorage.setItem('auth_token', token);
        setState(prev => ({ ...prev, user, loading: false }));
        return user;
      } else {
        const errorData = await response.json();
        setState(prev => ({ ...prev, loading: false, error: errorData.message || 'Failed to create account' }));
        return null;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return null;
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Call logout API endpoint
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      localStorage.removeItem('auth_token');
      setState(prev => ({ ...prev, user: null, loading: false }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
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

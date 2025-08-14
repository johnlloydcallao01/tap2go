/**
 * Admin Authentication Context
 * Provides authentication state and operations for admin users using CMS backend
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

// Admin User Type (from CMS)
interface AdminUser {
  id: number;
  email: string;
  role: 'admin' | 'driver' | 'vendor' | 'customer';
  firstName: string;
  lastName: string;
  phone?: string | null;
  isActive?: boolean | null;
  isVerified?: boolean | null;
}

// Admin Auth Context Type
interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isInitialized: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Admin Authentication Provider
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        const token = localStorage.getItem('admin-token');
        if (token) {
          // Quick token verification without showing loading
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            if (userData.user && userData.user.role === 'admin') {
              setUser(userData.user);
            } else {
              // User is not admin, clear token
              localStorage.removeItem('admin-token');
            }
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('admin-token');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('admin-token');
      } finally {
        setIsInitialized(true);
      }
    };

    // Initialize immediately without delay
    initializeAuth();
  }, []);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setAuthError(null);

    try {
      // Client-side validation
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      if (!email.trim()) {
        throw new Error('Please enter your email address');
      }

      if (!password.trim()) {
        throw new Error('Please enter your password');
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use specific error message from API
        throw new Error(data.error || 'Login failed. Please try again.');
      }

      // Additional client-side checks (redundant but safe)
      if (data.user.role !== 'admin') {
        throw new Error('Access denied. This account does not have administrator privileges.');
      }

      if (data.user.isActive === false) {
        throw new Error('Your account has been deactivated. Please contact an administrator.');
      }

      // Store token and user data
      localStorage.setItem('admin-token', data.token);
      setUser(data.user);
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setAuthError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async (): Promise<void> => {
    setLoading(true);
    setAuthError(null);

    try {
      // Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('admin-token');
      setUser(null);
      setLoading(false);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value: AdminAuthContextType = {
    user,
    loading,
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

// Re-export for backward compatibility
export { AdminAuthProvider as default };

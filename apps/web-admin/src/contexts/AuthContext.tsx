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
          // Verify token and get user data
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

    initializeAuth();
  }, []);

  // Sign in function
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setAuthError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Check if user has admin role
      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Check if user is active
      if (data.user.isActive === false) {
        throw new Error('Account is inactive. Please contact an administrator.');
      }

      // Store token and user data
      localStorage.setItem('admin-token', data.token);
      setUser(data.user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthError(errorMessage);
      throw error;
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

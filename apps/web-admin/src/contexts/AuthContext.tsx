/**
 * Admin Authentication Context - DISABLED
 * Authentication is disabled for the admin panel
 * This file provides a no-op auth context for free access
 */

'use client';

import React, { createContext, useContext } from 'react';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

// Admin Auth Context Type (simplified)
interface AdminAuthContextType {
  user: null;
  loading: false;
  isInitialized: true;
  authError: null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Create context
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// No-op AdminAuthProvider that allows free access
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const value: AdminAuthContextType = {
    user: null,
    loading: false,
    isInitialized: true,
    authError: null,
    signIn: async () => {
      console.warn('Authentication is disabled in the admin panel');
      // No-op - authentication is disabled
    },
    signOut: async () => {
      console.warn('Authentication is disabled in the admin panel');
      // No-op - authentication is disabled
    },
    clearError: () => {
      // No-op - no errors to clear
    },
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Hook to use admin auth context
export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

// Re-export for backward compatibility
export { AdminAuthProvider as default };

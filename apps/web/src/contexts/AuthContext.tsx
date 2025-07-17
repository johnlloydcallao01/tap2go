/**
 * Web Authentication Context - Using Shared Auth Package
 * This file now uses the shared authentication package for consistency across apps
 */

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

// Import from shared authentication package
import { CustomerAuthProvider, useCustomerAuth } from 'shared-auth';

// Re-export for backward compatibility with existing components
export { CustomerAuthProvider as AuthProvider };

// Create a wrapper hook that matches the existing interface
export function useAuth() {
  const customerAuth = useCustomerAuth();
  
  // Map the customer auth interface to the existing auth interface
  return {
    user: customerAuth.user,
    loading: customerAuth.loading,
    signIn: customerAuth.signIn,
    signUp: (email: string, password: string, name: string, role?: string) => {
      // For web app, we'll always create customers
      return customerAuth.signUp(email, password, name);
    },
    signInWithGoogle: customerAuth.signInWithGoogle,
    signOut: customerAuth.signOut,
    updateProfile: async (updates: { displayName?: string; photoURL?: string }) => {
      // This functionality would need to be implemented in the shared auth package
      console.warn('updateProfile not yet implemented in shared auth package');
    },
    authError: customerAuth.authError,
    isInitialized: customerAuth.isInitialized,
  };
}

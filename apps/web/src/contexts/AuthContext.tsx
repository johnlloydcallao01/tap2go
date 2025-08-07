/**
 * Web Authentication Context - DISABLED
 * Authentication is disabled for the public web app
 * This file is kept for future use when authentication might be needed
 */

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

// Placeholder AuthProvider that does nothing
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Placeholder hook that returns no user (public access)
export function useAuth() {
  return {
    user: null,
    loading: false,
    signIn: async () => {
      console.warn('Authentication is disabled in the public web app');
    },
    signUp: async () => {
      console.warn('Authentication is disabled in the public web app');
    },
    signInWithGoogle: async () => {
      console.warn('Authentication is disabled in the public web app');
    },
    signOut: async () => {
      console.warn('Authentication is disabled in the public web app');
    },
    updateProfile: async () => {
      console.warn('Authentication is disabled in the public web app');
    },
    authError: null,
    isInitialized: true,
  };
}

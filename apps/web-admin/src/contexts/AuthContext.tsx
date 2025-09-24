'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Demo user data
const DEMO_USER = {
  id: 'demo-admin',
  email: 'admin@demo.com',
  name: 'Demo Admin',
  role: 'admin'
};

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isInitialized: boolean;
  demoLogin: (email: string, password: string) => Promise<void>;
  demoLogout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true);
  const router = useRouter();

  // Demo login function (non-functional)
  const demoLogin = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Demo: Would authenticate user with:', { email, password });
      
      // Set demo user
      setUser(DEMO_USER);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Demo login error:', error);
      throw new Error('Demo mode - authentication disabled');
    } finally {
      setLoading(false);
    }
  };

  // Demo logout function (non-functional)
  const demoLogout = async (): Promise<void> => {
    setLoading(true);
    
    try {
      // Simulate logout delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Demo: Would log out user');
      
      // Clear demo user
      setUser(null);
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Demo logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize with demo user (always logged in for demo)
  useEffect(() => {
    setUser(DEMO_USER);
    setIsInitialized(true);
  }, []);

  const contextValue: AdminAuthContextType = {
    user,
    loading,
    isInitialized,
    demoLogin,
    demoLogout,
  };

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

// Export for backward compatibility
export { AdminAuthProvider as default };

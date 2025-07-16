/**
 * Authentication types for Driver App
 */

export interface DriverUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'driver';
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverAuthContextType {
  user: DriverUser | null;
  loading: boolean;
  isInitialized: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

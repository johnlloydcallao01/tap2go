/**
 * Shared Authentication Types
 * Comprehensive type definitions for Firebase authentication across all apps
 */

import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { User } from '@tap2go/shared-types';

// Extended user types for authentication
export interface AuthUser extends User {
  firebaseUid: string;
  lastLoginAt?: Date;
  fcmTokens?: string[];
  preferredLanguage?: string;
  timezone?: string;
}

// Driver-specific user type
export interface DriverUser extends AuthUser {
  role: 'driver';
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  status: 'pending_approval' | 'approved' | 'suspended' | 'rejected';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  vehicleType?: 'bicycle' | 'motorcycle' | 'car' | 'scooter';
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
    color?: string;
    insuranceExpiry?: Date;
  };
  totalDeliveries: number;
  totalEarnings: number;
  rating?: number;
  joinedAt: Date;
}

// Customer-specific user type
export interface CustomerUser extends AuthUser {
  role: 'customer';
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  addresses?: Array<{
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
  }>;
  paymentMethods?: Array<{
    id: string;
    type: 'card' | 'digital_wallet';
    last4?: string;
    brand?: string;
    isDefault: boolean;
  }>;
  totalOrders: number;
  totalSpent: number;
}

// Vendor-specific user type
export interface VendorUser extends AuthUser {
  role: 'vendor';
  businessName: string;
  businessLicense?: string;
  taxId?: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  commissionRate: number;
  totalEarnings: number;
  totalOrders: number;
}

// Admin-specific user type
export interface AdminUser extends AuthUser {
  role: 'admin';
  permissions: string[];
  department?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

// Union type for all user types
export type AnyAuthUser = DriverUser | CustomerUser | VendorUser | AdminUser;

// Authentication context types
export interface BaseAuthContextType<T extends AuthUser> {
  user: T | null;
  loading: boolean;
  isInitialized: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Driver-specific auth context
export interface DriverAuthContextType extends BaseAuthContextType<DriverUser> {
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
}

// Customer-specific auth context
export interface CustomerAuthContextType extends BaseAuthContextType<CustomerUser> {
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

// Vendor-specific auth context
export interface VendorAuthContextType extends BaseAuthContextType<VendorUser> {
  signUp: (email: string, password: string, businessName: string, contactName: string) => Promise<void>;
}

// Admin-specific auth context
export interface AdminAuthContextType extends BaseAuthContextType<AdminUser> {
  // Admin users are created by other admins, no signup
}

// Authentication service types
export interface AuthServiceConfig {
  role: User['role'];
  enableGoogleAuth?: boolean;
  enableMultiTabSync?: boolean;
  tokenRefreshInterval?: number;
}

// Database user data types (for Firestore)
export interface UserDocumentData {
  email: string;
  role: User['role'];
  isActive: boolean;
  isVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  fcmTokens?: string[];
  preferredLanguage?: string;
  timezone?: string;
}

export interface DriverDocumentData {
  userRef: string; // Reference to users/{uid}
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  status: 'pending_approval' | 'approved' | 'suspended' | 'rejected';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  vehicleType?: 'bicycle' | 'motorcycle' | 'car' | 'scooter';
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
    color?: string;
    insuranceExpiry?: Timestamp;
  };
  totalDeliveries: number;
  totalEarnings: number;
  rating?: number;
  joinedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Auth provider props
export interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth error types
export type AuthErrorCode = 
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/email-already-in-use'
  | 'auth/weak-password'
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/too-many-requests'
  | 'auth/network-request-failed'
  | 'auth/invalid-credential'
  | 'custom/role-mismatch'
  | 'custom/user-not-found'
  | 'custom/profile-not-found'
  | 'custom/account-not-approved';

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  originalError?: Error;
}

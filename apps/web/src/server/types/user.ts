/**
 * Server-side User Types
 * 
 * User-related types used by server-side code.
 * These may include additional fields not exposed to the client.
 */

/**
 * Base user interface for server-side operations
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'customer' | 'vendor' | 'driver' | 'admin';
  phone?: string;
  address?: Address;
  profileImage?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Server-only fields
  lastLoginAt?: Date;
  loginCount?: number;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
  twoFactorEnabled?: boolean;
  preferences?: UserPreferences;
  metadata?: Record<string, unknown>;
}

/**
 * Address interface
 */
export interface Address {
  id?: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault?: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
  privacy: {
    profileVisible: boolean;
    shareLocation: boolean;
    shareOrderHistory: boolean;
  };
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    allergens: string[];
  };
  language: string;
  currency: string;
  timezone: string;
}

/**
 * Customer-specific user type
 */
export interface CustomerUser extends User {
  role: 'customer';
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  favoriteRestaurants: string[];
  loyaltyPoints: number;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

/**
 * Vendor-specific user type
 */
export interface VendorUser extends User {
  role: 'vendor';
  businessName: string;
  businessLicense?: string;
  taxId?: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  commissionRate: number;
  totalEarnings: number;
  totalOrders: number;
  averageRating: number;
  restaurantIds: string[];
  bankAccount?: BankAccount;
  documents: VendorDocument[];
}

/**
 * Driver-specific user type
 */
export interface DriverUser extends User {
  role: 'driver';
  licenseNumber: string;
  vehicleInfo: VehicleInfo;
  status: 'pending' | 'approved' | 'active' | 'inactive' | 'suspended';
  isOnline: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  totalDeliveries: number;
  totalEarnings: number;
  averageRating: number;
  documents: DriverDocument[];
}

/**
 * Admin-specific user type
 */
export interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
  department?: string;
  lastActiveAt: Date;
  accessLevel: 'read' | 'write' | 'admin' | 'super_admin';
}

/**
 * Payment method interface
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'digital_wallet' | 'bank_account';
  provider: 'stripe' | 'paymongo' | 'gcash' | 'maya';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: Date;
}

/**
 * Bank account interface
 */
export interface BankAccount {
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  isVerified: boolean;
}

/**
 * Vehicle information
 */
export interface VehicleInfo {
  type: 'motorcycle' | 'car' | 'bicycle' | 'scooter';
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: Date;
  };
}

/**
 * Document interfaces
 */
export interface VendorDocument {
  id: string;
  type: 'business_license' | 'tax_certificate' | 'food_safety' | 'insurance';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

export interface DriverDocument {
  id: string;
  type: 'drivers_license' | 'vehicle_registration' | 'insurance' | 'background_check';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  expiryDate?: Date;
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
}

/**
 * User session information
 */
export interface UserSession {
  userId: string;
  sessionId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    device: string;
    os: string;
    browser: string;
  };
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

/**
 * User activity log
 */
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

/**
 * Vendor Types
 * 
 * TypeScript types for vendor-specific data and operations.
 */

/**
 * Vendor user interface (extends base User)
 */
export interface VendorUser {
  id: string;
  email: string;
  name: string;
  role: 'vendor';
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Vendor-specific fields
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
  
  // Business information
  businessType: 'individual' | 'partnership' | 'corporation' | 'llc';
  businessAddress?: Address;
  businessPhone?: string;
  businessEmail?: string;
  website?: string;
  
  // Performance metrics
  fulfillmentRate: number;
  averagePreparationTime: number;
  customerSatisfactionScore: number;
  
  // Subscription and features
  subscriptionPlan?: 'basic' | 'premium' | 'enterprise';
  features: VendorFeature[];
  
  // Settings and preferences
  notificationPreferences?: VendorNotificationPreferences;
  operationalSettings?: VendorOperationalSettings;
}

/**
 * Bank account information
 */
export interface BankAccount {
  id: string;
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'business';
  currency: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: Date;
  verifiedAt?: Date;
}

/**
 * Address interface
 */
export interface Address {
  id?: string;
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
 * Vendor document types
 */
export interface VendorDocument {
  id: string;
  type: 'business_license' | 'tax_certificate' | 'food_safety' | 'insurance' | 'identity' | 'bank_statement';
  url: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  expiryDate?: Date;
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
  rejectionReason?: string;
}

/**
 * Vendor features and capabilities
 */
export interface VendorFeature {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  category: 'operations' | 'marketing' | 'analytics' | 'integrations';
  tier: 'basic' | 'premium' | 'enterprise';
}

/**
 * Vendor notification preferences
 */
export interface VendorNotificationPreferences {
  email: {
    newOrders: boolean;
    orderUpdates: boolean;
    paymentNotifications: boolean;
    promotionalEmails: boolean;
    weeklyReports: boolean;
    monthlyStatements: boolean;
  };
  push: {
    newOrders: boolean;
    orderUpdates: boolean;
    customerMessages: boolean;
    systemAlerts: boolean;
  };
  sms: {
    urgentAlerts: boolean;
    orderConfirmations: boolean;
    paymentAlerts: boolean;
  };
}

/**
 * Vendor operational settings
 */
export interface VendorOperationalSettings {
  autoAcceptOrders: boolean;
  maxOrdersPerHour: number;
  preparationTimeBuffer: number; // in minutes
  minimumOrderValue: number;
  deliveryRadius: number; // in km
  acceptCashPayments: boolean;
  acceptCardPayments: boolean;
  acceptDigitalWallets: boolean;
  taxRate: number;
  serviceCharge: number;
  packagingFee: number;
}

/**
 * Vendor statistics
 */
export interface VendorStats {
  vendorId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  
  // Order stats
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  
  // Revenue stats
  totalRevenue: number;
  netRevenue: number;
  commissionPaid: number;
  refundsIssued: number;
  
  // Performance stats
  averageRating: number;
  totalRatings: number;
  fulfillmentRate: number;
  averagePreparationTime: number;
  
  // Customer stats
  uniqueCustomers: number;
  repeatCustomers: number;
  customerRetentionRate: number;
  
  // Menu stats
  topSellingItems: Array<{
    itemId: string;
    itemName: string;
    quantitySold: number;
    revenue: number;
  }>;
}

/**
 * Vendor payout information
 */
export interface VendorPayout {
  id: string;
  vendorId: string;
  amount: number;
  currency: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: 'bank_transfer' | 'digital_wallet' | 'check';
  transactionId?: string;
  processedAt?: Date;
  failureReason?: string;
  
  // Breakdown
  breakdown: {
    grossRevenue: number;
    commission: number;
    fees: number;
    adjustments: number;
    netAmount: number;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

/**
 * Vendor subscription
 */
export interface VendorSubscription {
  id: string;
  vendorId: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'suspended';
  startDate: Date;
  endDate?: Date;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  
  // Features included
  features: string[];
  limits: {
    maxRestaurants: number;
    maxMenuItems: number;
    maxOrders: number;
    analyticsRetention: number; // in days
  };
  
  // Payment information
  paymentMethod?: string;
  nextBillingDate?: Date;
  lastPaymentDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Vendor review and rating
 */
export interface VendorReview {
  id: string;
  vendorId: string;
  customerId: string;
  orderId: string;
  rating: number; // 1-5
  review?: string;
  
  // Review categories
  ratings: {
    food: number;
    service: number;
    delivery: number;
    value: number;
  };
  
  // Status and moderation
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  isVerified: boolean;
  moderatedBy?: string;
  moderationNotes?: string;
  
  // Response from vendor
  vendorResponse?: {
    message: string;
    respondedAt: Date;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  helpfulVotes: number;
  reportCount: number;
}

/**
 * Vendor compliance record
 */
export interface VendorCompliance {
  vendorId: string;
  
  // License and permits
  licenses: Array<{
    type: string;
    number: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate: Date;
    status: 'valid' | 'expired' | 'suspended';
  }>;
  
  // Health and safety
  healthInspections: Array<{
    date: Date;
    score: number;
    grade: string;
    inspector: string;
    violations: string[];
    correctionDeadline?: Date;
  }>;
  
  // Tax compliance
  taxStatus: 'compliant' | 'pending' | 'delinquent';
  lastTaxFiling?: Date;
  
  // Insurance
  insurancePolicies: Array<{
    type: 'general_liability' | 'product_liability' | 'workers_comp';
    provider: string;
    policyNumber: string;
    coverage: number;
    expiryDate: Date;
    status: 'active' | 'expired';
  }>;
  
  // Compliance score
  overallScore: number;
  lastUpdated: Date;
}

/**
 * Vendor training record
 */
export interface VendorTraining {
  id: string;
  vendorId: string;
  type: 'food_safety' | 'customer_service' | 'platform_usage' | 'compliance';
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  startedAt?: Date;
  completedAt?: Date;
  expiryDate?: Date;
  score?: number;
  certificateUrl?: string;
  isRequired: boolean;
  dueDate?: Date;
}

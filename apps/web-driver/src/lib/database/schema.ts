import { Timestamp } from 'firebase/firestore';

// ===== 1. USERS (Top-level) =====
export interface UserDocument {
  uid: string;
  email: string;
  phoneNumber?: string;
  role: 'admin' | 'vendor' | 'customer' | 'driver';
  profileImageUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  fcmTokens?: string[];
  preferredLanguage?: string;
  timezone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

// ===== 2. ADMINS (Top-level) =====
export interface AdminDocument {
  userRef: string; // path to users/{uid}
  employeeId: string;
  fullName: string;
  department: 'operations' | 'finance' | 'customer_support' | 'technical' | 'marketing';
  accessLevel: 'super_admin' | 'regional_admin' | 'support_agent' | 'analyst';
  permissions: string[]; // ["manage_vendors", "handle_disputes", "view_analytics"]
  assignedRegions?: string[];
  managerRef?: string; // path to admins/{managerId}
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 2.1 Admin Actions (Subcollection)
export interface AdminActionDocument {
  actionId: string;
  actionType: 'vendor_approval' | 'dispute_resolution' | 'system_config';
  targetRef: string; // path to affected document
  details: Record<string, unknown>; // action-specific data
  timestamp: Timestamp;
}

// ===== 3. VENDORS (Top-level) =====
export interface VendorDocument {
  userRef: string; // path to users/{uid}
  businessName: string;
  businessType: 'restaurant' | 'cafe' | 'bakery' | 'food_truck' | 'catering' | 'grocery' | 'other';
  businessLicense: string;
  taxId: string;
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'rejected';
  approvalDate?: Timestamp;
  approvedBy?: string; // admin reference
  rejectionReason?: string;
  commissionRate: number; // percentage (e.g., 15.5 for 15.5%)
  totalEarnings: number;
  totalOrders: number;
  averageRating: number;
  totalReviews: number;
  bankAccount: {
    accountNumber: string;
    routingNumber: string;
    accountHolderName: string;
    bankName: string;
  };
  businessAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contactInfo: {
    businessPhone: string;
    businessEmail: string;
    contactPersonName: string;
    contactPersonPhone?: string;
  };
  operatingHours: {
    [key: string]: { // monday, tuesday, etc.
      open: string;
      close: string;
      isClosed: boolean;
    };
  };
  deliverySettings: {
    deliveryRadius: number; // in kilometers
    minimumOrderValue: number;
    deliveryFee: number;
    estimatedDeliveryTime: string; // "30-45 min"
    acceptsScheduledOrders: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 3.1 Vendor Documents (Subcollection)
export interface VendorDocumentDocument {
  documentId: string;
  documentType: 'business_license' | 'tax_certificate' | 'food_permit' | 'insurance' | 'identity_proof';
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string; // admin reference
  reviewedAt?: Timestamp;
  rejectionReason?: string;
  expiryDate?: Timestamp;
  uploadedAt: Timestamp;
}

// 3.2 Vendor Analytics (Subcollection)
export interface VendorAnalyticsDocument {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string; // YYYY-MM-DD format
  totalOrders: number;
  totalRevenue: number;
  totalEarnings: number; // after commission
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  topSellingItems: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    revenue: number;
  }>;
  customerRatings: {
    average: number;
    total: number;
    breakdown: Record<number, number>; // rating -> count
  };
  createdAt: Timestamp;
}

// 3.3 Vendor Payouts (Subcollection)
export interface VendorPayoutDocument {
  payoutId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: 'bank_transfer' | 'paypal' | 'stripe';
  transactionId?: string;
  periodStart: Timestamp;
  periodEnd: Timestamp;
  ordersIncluded: string[]; // order IDs
  fees: {
    platformFee: number;
    processingFee: number;
    otherFees: number;
  };
  processedAt?: Timestamp;
  createdAt: Timestamp;
}

// ===== 4. CUSTOMERS (Top-level) =====
export interface CustomerDocument {
  userRef: string; // path to users/{uid}
  firstName: string;
  lastName: string;
  dateOfBirth?: Timestamp;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  preferredCuisines?: string[];
  dietaryRestrictions?: string[];
  allergies?: string[];
  marketingConsent: boolean;
  smsConsent: boolean;
  emailConsent: boolean;
  referralCode: string; // unique referral code
  referredBy?: string; // customer UID who referred
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastOrderAt?: Timestamp;
}

// 4.1 Customer Addresses (Subcollection)
export interface CustomerAddressDocument {
  addressId: string; // auto-generated
  label: string; // "Home", "Office", "Other"
  recipientName: string;
  recipientPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    apartmentNumber?: string;
    floor?: string;
    landmark?: string;
    deliveryInstructions?: string;
  };
  location: {
    latitude: number;
    longitude: number;
  }; // GeoPoint equivalent
  formattedAddress: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 4.2 Customer Payment Methods (Subcollection)
export interface CustomerPaymentMethodDocument {
  paymentMethodId: string; // auto-generated
  type: 'card' | 'wallet' | 'bank_account' | 'cod';
  provider: string; // "stripe", "paypal", "cash"
  last4?: string; // for cards
  cardBrand?: string; // "visa", "mastercard", etc.
  expiryMonth?: number;
  expiryYear?: number;
  walletProvider?: string; // "apple_pay", "google_pay"
  isDefault: boolean;
  isActive: boolean;
  createdAt: Timestamp;
}

// 4.3 Customer Favorites (Subcollection)
export interface CustomerFavoritesDocument {
  favoriteId: string; // auto-generated
  type: 'restaurant' | 'item';
  restaurantRef?: string; // path to restaurants/{restId}
  menuItemRef?: string; // path to restaurants/{restId}/menuItems/{itemId}
  createdAt: Timestamp;
}

// 4.4 Customer Cart (Subcollection)
export interface CustomerCartDocument {
  cartItemId: string; // auto-generated
  restaurantRef: string; // path to restaurants/{restId}
  menuItemRef: string; // path to menuItems/{itemId}
  quantity: number;
  specialInstructions?: string;
  selectedModifiers?: {
    groupId: string;
    selectedOptions: string[]; // optionIds
  }[];
  itemPrice: number; // snapshot at time of adding
  totalPrice: number; // including modifiers
  addedAt: Timestamp;
}

// ===== 5. DRIVERS (Top-level) =====
export interface DriverDocument {
  userRef: string; // path to users/{uid}
  firstName: string;
  lastName: string;
  dateOfBirth: Timestamp;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  nationalId: string;
  driverLicenseNumber: string;
  vehicleType: 'bicycle' | 'motorcycle' | 'car' | 'scooter';
  vehicleDetails: {
    make?: string;
    model?: string;
    year?: number;
    licensePlate: string;
    color: string;
    insuranceExpiry?: Timestamp;
  };
  status: 'pending_approval' | 'active' | 'suspended' | 'rejected' | 'inactive';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDocuments: {
    driverLicense: string; // URLs to uploaded docs
    vehicleRegistration: string;
    insurance: string;
    nationalId: string;
    profilePhoto: string;
    backgroundCheck?: string;
  };
  currentLocation?: {
    latitude: number;
    longitude: number;
  }; // GeoPoint equivalent
  isOnline: boolean;
  isAvailable: boolean; // can accept new orders
  deliveryRadius: number; // km
  avgRating?: number;
  totalDeliveries: number;
  totalEarnings: number;
  joinedAt: Timestamp;
  approvedBy?: string; // admin UID who approved
  approvedAt?: Timestamp;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
    swiftCode?: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActiveAt?: Timestamp;
}

// 5.1 Driver Earnings (Subcollection)
export interface DriverEarningsDocument {
  date: string; // YYYY-MM-DD format
  totalEarnings: number;
  deliveryFees: number;
  tips: number;
  bonuses: number;
  penalties: number; // late delivery penalties
  totalDeliveries: number;
  avgDeliveryTime: number;
  fuelCosts?: number; // driver-reported
}

// 5.2 Driver Reviews (Subcollection)
export interface DriverReviewDocument {
  reviewId: string; // auto-generated
  customerRef: string; // path to customers/{customerId}
  orderRef: string; // path to orders/{orderId}
  rating: number; // 1-5
  comment?: string;
  punctualityRating: number;
  politenessRating: number;
  conditionRating: number; // food condition upon delivery
  isVerifiedDelivery: boolean;
  createdAt: Timestamp;
}

// 5.3 Driver Delivery History (Subcollection)
export interface DriverDeliveryHistoryDocument {
  deliveryId: string; // auto-generated
  orderRef: string; // path to orders/{orderId}
  restaurantRef: string;
  customerRef: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
  }; // GeoPoint equivalent
  deliveryLocation: {
    latitude: number;
    longitude: number;
  }; // GeoPoint equivalent
  distance: number; // km
  estimatedTime: number; // minutes
  actualTime: number; // minutes
  status: 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
  earnings: number;
  tips: number;
  deliveredAt?: Timestamp;
}

// ===== 6. ORDERS (Top-level) =====
export interface OrderDocument {
  orderNumber: string; // user-friendly order number
  customerRef: string; // path to customers/{customerId}
  restaurantRef: string; // path to restaurants/{restId}
  vendorRef: string; // path to vendors/{vendorUid}
  driverRef?: string; // path to drivers/{driverId}

  // Order Status Management
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'restaurant' | 'admin' | 'system';

  // Items and Pricing
  items: {
    menuItemRef: string;
    name: string; // snapshot for order history
    quantity: number;
    unitPrice: number;
    selectedModifiers?: {
      groupId: string;
      groupName: string;
      selectedOptions: {
        optionId: string;
        name: string;
        priceAdjustment: number;
      }[];
    }[];
    specialInstructions?: string;
    totalPrice: number;
  }[];

  // Pricing Breakdown
  subtotal: number;
  taxes: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  tip?: number;
  totalAmount: number;

  // Applied Promotions
  appliedPromotions?: {
    promoId: string;
    promoTitle: string;
    discountAmount: number;
  }[];

  // Delivery Information
  deliveryAddress: {
    recipientName: string;
    recipientPhone: string;
    formattedAddress: string;
    location: {
      latitude: number;
      longitude: number;
    }; // GeoPoint equivalent
    deliveryInstructions?: string;
  };
  estimatedDeliveryTime: Timestamp;
  actualDeliveryTime?: Timestamp;
  deliveryMethod: 'delivery' | 'pickup';

  // Payment Information
  paymentMethodRef?: string; // path to paymentMethods/{paymentMethodId}
  paymentProvider: string;
  paymentTransactionId?: string;

  // Tracking and Communication
  preparationTime: number; // estimated minutes
  trackingUpdates: {
    status: string;
    timestamp: Timestamp;
    message?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  }[];

  // Special Instructions and Notes
  customerNotes?: string;
  restaurantNotes?: string;
  driverNotes?: string;

  // Timestamps
  placedAt: Timestamp;
  confirmedAt?: Timestamp;
  readyAt?: Timestamp;
  pickedUpAt?: Timestamp;
  deliveredAt?: Timestamp;
  cancelledAt?: Timestamp;

  // Ratings and Reviews
  customerRating?: number;
  driverRating?: number;
  restaurantRating?: number;
  reviewSubmitted: boolean;

  // Commission and Earnings
  platformCommission: number;
  restaurantEarnings: number;
  driverEarnings?: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== 7. PLATFORM CONFIG (Top-level) =====
export interface PlatformConfigDocument {
  // Commission Rates
  defaultCommissionRates: {
    restaurant: number; // percentage
    delivery: number;
    payment_processing: number;
  };

  // Delivery Settings
  deliverySettings: {
    maxDeliveryRadius: number; // km
    avgDeliveryTime: number; // minutes
    peakHoursMultiplier: number;
    minimumOrderValue: number;
  };

  // Platform Features
  features: {
    liveTracking: boolean;
    scheduleOrders: boolean;
    loyaltyProgram: boolean;
    multiplePaymentMethods: boolean;
    promotionsEnabled: boolean;
  };

  // Operational Hours
  platformOperatingHours: {
    monday: { open: string; close: string }[];
    tuesday: { open: string; close: string }[];
    wednesday: { open: string; close: string }[];
    thursday: { open: string; close: string }[];
    friday: { open: string; close: string }[];
    saturday: { open: string; close: string }[];
    sunday: { open: string; close: string }[];
  };

  // Supported Regions
  supportedRegions: string[];
  supportedCurrencies: string[];
  supportedLanguages: string[];

  // App Configuration
  mobileAppConfig: {
    minimumVersion: string;
    forceUpdate: boolean;
    maintenanceMode: boolean;
    maintenanceMessage?: string;
  };

  // Notification Settings
  notificationTemplates: {
    orderConfirmed: { title: string; body: string };
    orderReady: { title: string; body: string };
    orderDelivered: { title: string; body: string };
    orderCancelled: { title: string; body: string };
    driverAssigned: { title: string; body: string };
    orderPicked: { title: string; body: string };
    promotionAvailable: { title: string; body: string };
    loyaltyReward: { title: string; body: string };
    paymentFailed: { title: string; body: string };
    restaurantClosed: { title: string; body: string };
  };

  updatedAt: Timestamp;
  updatedBy: string;
}

// ===== 8. NOTIFICATIONS (Top-level) =====
export interface NotificationDocument {
  id?: string; // document ID
  recipientRef: string; // path to user document
  recipientRole: 'admin' | 'vendor' | 'driver' | 'customer';
  type: 'order_update' | 'promotional' | 'system' | 'payment' | 'rating_request';
  title: string;
  message: string;
  data?: Record<string, unknown>; // additional payload data
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deliveryMethod: string[]; // ["push", "email", "sms"]
  sentAt?: Timestamp;
  readAt?: Timestamp;
  createdAt: Timestamp;
}

// ===== 9. DISPUTES (Top-level) =====
export interface DisputeDocument {
  orderRef: string; // path to orders/{orderId}
  customerRef: string; // path to customers/{customerId}
  restaurantRef?: string; // path to restaurants/{restId}
  driverRef?: string; // path to drivers/{driverId}
  type: 'order_issue' | 'payment_issue' | 'delivery_issue' | 'quality_issue' | 'service_issue';
  description: string;
  attachments?: string[]; // URLs to uploaded evidence
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string; // admin UID
  resolution?: {
    action: string; // "refund", "reorder", "credit"
    amount?: number;
    notes: string;
    resolvedBy: string; // admin UID
    resolvedAt: Timestamp;
  };
  customerSatisfied?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== 10. ANALYTICS (Top-level) =====
export interface AnalyticsDocument {
  period: 'daily' | 'weekly' | 'monthly';
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  newCustomers: number;
  activeDrivers: number;
  activeRestaurants: number;
  avgOrderValue: number;
  avgDeliveryTime: number;
  topPerformingRestaurants: {
    restaurantId: string;
    name: string;
    orders: number;
    revenue: number;
    rating: number;
  }[];
  topPerformingDrivers: {
    driverId: string;
    name: string;
    deliveries: number;
    earnings: number;
    rating: number;
    avgDeliveryTime: number;
  }[];
  popularCuisines: {
    cuisine: string;
    orders: number;
    percentage: number;
  }[];
  peakHours: {
    hour: string;
    orders: number;
    percentage: number;
  }[];
  conversionRate: number;
  customerRetentionRate: number;
  driverUtilizationRate: number;
  platformCommissionEarned: number;
  generatedAt: Timestamp;
  generatedBy?: string;
}
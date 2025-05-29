// Firebase Firestore Collection Definitions
// This file defines all collection paths and document structures

export const COLLECTIONS = {
  // Top-level collections (only implemented ones)
  USERS: 'users',
  ADMINS: 'admins',
  VENDORS: 'vendors',
  CUSTOMERS: 'customers',
  DRIVERS: 'drivers',
  RESTAURANTS: 'restaurants',
  ORDERS: 'orders',
  PLATFORM_CONFIG: 'platformConfig',
  NOTIFICATIONS: 'notifications',
  DISPUTES: 'disputes',
  ANALYTICS: 'analytics',
  CATEGORIES: 'categories',
  SYSTEM_CONFIG: 'systemConfig',
  SYSTEM: '_system',

  // Subcollections (only implemented ones)
  ADMIN_ACTIONS: 'adminActions',

  // Vendor subcollections
  VENDOR_DOCUMENTS: 'documents',
  VENDOR_PAYOUTS: 'payouts',
  MODIFIER_GROUPS: 'modifierGroups',
  MASTER_MENU_ITEMS: 'masterMenuItems',
  MASTER_MENU_ASSIGNMENTS: 'masterMenuAssignments',
  VENDOR_AUDIT_LOGS: 'auditLogs',
  VENDOR_ANALYTICS: 'analytics',

  // Restaurant subcollections
  MENU_CATEGORIES: 'menuCategories',
  MENU_ITEMS: 'menuItems',
  RESTAURANT_PROMOTIONS: 'promotions',
  RESTAURANT_REVIEWS: 'reviews',

  // Customer subcollections
  CUSTOMER_ADDRESSES: 'addresses',
  CUSTOMER_PAYMENT_METHODS: 'paymentMethods',
  CUSTOMER_FAVORITES: 'favorites',
  CUSTOMER_CART: 'cart',

  // Driver subcollections
  DRIVER_EARNINGS: 'earnings',
  DRIVER_REVIEWS: 'reviews',
  DRIVER_DELIVERY_HISTORY: 'deliveryHistory'
} as const;

// Document ID generators
export const generateDocId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 11);
};

export const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Collection path helpers
export const getCollectionPath = (collection: keyof typeof COLLECTIONS) => {
  return COLLECTIONS[collection];
};

export const getSubcollectionPath = (
  parentCollection: keyof typeof COLLECTIONS,
  parentDocId: string,
  subcollection: keyof typeof COLLECTIONS
) => {
  return `${COLLECTIONS[parentCollection]}/${parentDocId}/${COLLECTIONS[subcollection]}`;
};

// Document reference helpers
export const getUserRef = (uid: string) => `users/${uid}`;
export const getAdminRef = (uid: string) => `admins/${uid}`;
export const getVendorRef = (uid: string) => `vendors/${uid}`;
export const getCustomerRef = (uid: string) => `customers/${uid}`;
export const getDriverRef = (uid: string) => `drivers/${uid}`;
export const getRestaurantRef = (restaurantId: string) => `restaurants/${restaurantId}`;
export const getOrderRef = (orderId: string) => `orders/${orderId}`;
export const getPlatformConfigRef = () => `platformConfig/config`;
export const getNotificationRef = (notificationId: string) => `notifications/${notificationId}`;
export const getDisputeRef = (disputeId: string) => `disputes/${disputeId}`;
export const getAnalyticsRef = (analyticsId: string) => `analytics/${analyticsId}`;

// Validation helpers (only implemented roles)
export const isValidRole = (role: string): role is 'admin' | 'vendor' | 'customer' | 'driver' => {
  return ['admin', 'vendor', 'customer', 'driver'].includes(role);
};



export const isValidPaymentStatus = (status: string) => {
  return ['pending', 'paid', 'failed', 'refunded'].includes(status);
};

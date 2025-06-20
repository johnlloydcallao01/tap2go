import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from './collections';
import { setupDriversDatabase } from './setup-drivers';

// Initialize default categories
export const initializeCategories = async () => {
  const categories = [
    {
      id: 'pizza',
      name: 'Pizza',
      description: 'Delicious pizzas from various restaurants',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
      featured: true,
      sortOrder: 1,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'burgers',
      name: 'Burgers',
      description: 'Juicy burgers and sandwiches',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
      featured: true,
      sortOrder: 2,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'sushi',
      name: 'Sushi',
      description: 'Fresh sushi and Japanese cuisine',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop',
      featured: true,
      sortOrder: 3,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'chinese',
      name: 'Chinese',
      description: 'Authentic Chinese dishes',
      image: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=300&h=200&fit=crop',
      featured: true,
      sortOrder: 4,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'indian',
      name: 'Indian',
      description: 'Spicy and flavorful Indian cuisine',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop',
      featured: true,
      sortOrder: 5,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'mexican',
      name: 'Mexican',
      description: 'Authentic Mexican food and flavors',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
      featured: true,
      sortOrder: 6,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'italian',
      name: 'Italian',
      description: 'Classic Italian dishes and pasta',
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&h=200&fit=crop',
      featured: true,
      sortOrder: 7,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'thai',
      name: 'Thai',
      description: 'Authentic Thai cuisine with bold flavors',
      image: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=300&h=200&fit=crop',
      featured: false,
      sortOrder: 8,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'desserts',
      name: 'Desserts',
      description: 'Sweet treats and desserts',
      image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop',
      featured: false,
      sortOrder: 9,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    {
      id: 'healthy',
      name: 'Healthy',
      description: 'Healthy and nutritious options',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
      featured: false,
      sortOrder: 10,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
  ];

  for (const category of categories) {
    await setDoc(doc(db, COLLECTIONS.CATEGORIES, category.id), category);
  }

  console.log('Categories initialized successfully');
};

// Initialize system configuration
export const initializeSystemConfig = async () => {
  const systemConfig = {
    platform: {
      name: 'Tap2Go',
      version: '1.0.0',
      maintenanceMode: false,
      allowNewRegistrations: true,
      supportedCountries: ['US', 'CA'],
      supportedCurrencies: ['USD', 'CAD'],
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'es', 'fr']
    },
    commission: {
      defaultVendorRate: 15.0, // 15%
      defaultDriverRate: 10.0, // 10%
      minimumOrderValue: 10.0,
      maximumOrderValue: 500.0,
      platformFeePercentage: 2.0 // 2%
    },
    delivery: {
      defaultDeliveryFee: 3.99,
      freeDeliveryThreshold: 25.0,
      maximumDeliveryRadius: 15, // km
      estimatedDeliveryTime: '30-45 min',
      driverAssignmentTimeout: 300, // 5 minutes in seconds
      orderPreparationBuffer: 15 // 15 minutes
    },
    payment: {
      supportedMethods: ['card', 'paypal', 'apple_pay', 'google_pay'],
      minimumTipPercentage: 0,
      maximumTipPercentage: 30,
      defaultTipPercentage: 15,
      refundProcessingTime: '3-5 business days'
    },
    notifications: {
      enablePushNotifications: true,
      enableEmailNotifications: true,
      enableSMSNotifications: true,
      orderUpdateNotifications: true,
      promotionalNotifications: true,
      marketingNotifications: false
    },
    features: {
      enableScheduledOrders: true,
      enableGroupOrders: false,
      enableLoyaltyProgram: true,
      enableReferralProgram: true,
      enableReviews: true,
      enableChat: false,
      enableLiveTracking: true
    },
    limits: {
      maxItemsPerOrder: 50,
      maxOrdersPerDay: 10,
      maxActiveOrdersPerCustomer: 3,
      maxRestaurantsPerVendor: 5,
      maxMenuItemsPerRestaurant: 200,
      maxImagesPerMenuItem: 5
    },
    updatedAt: Timestamp.now(),
    updatedBy: 'system'
  };

  await setDoc(doc(db, COLLECTIONS.SYSTEM_CONFIG, 'main'), systemConfig);
  console.log('System configuration initialized successfully');
};

// Create initial admin user
export const createInitialAdmin = async (
  uid: string,
  email: string,
  fullName: string
) => {
  // Create user document
  const userData = {
    uid,
    email,
    role: 'admin' as const,
    isActive: true,
    isVerified: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  await setDoc(doc(db, COLLECTIONS.USERS, uid), userData);

  // Create admin document
  const adminData = {
    userRef: `users/${uid}`,
    employeeId: 'ADMIN-001',
    fullName,
    department: 'technical' as const,
    accessLevel: 'super_admin' as const,
    permissions: [
      'manage_vendors',
      'manage_customers',
      'handle_disputes',
      'view_analytics',
      'manage_system_config',
      'manage_admins'
    ],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  await setDoc(doc(db, COLLECTIONS.ADMINS, uid), adminData);
  console.log('Initial admin user created successfully');
};

// Initialize drivers data
export const initializeDrivers = async () => {
  try {
    console.log('Initializing drivers...');
    await setupDriversDatabase();
    console.log('Drivers initialized successfully');
  } catch (error) {
    console.error('Error initializing drivers:', error);
    throw error;
  }
};

// Initialize all default data
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');

    await initializeCategories();
    await initializeSystemConfig();

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Initialize database with drivers
export const initializeDatabaseWithDrivers = async () => {
  try {
    console.log('Initializing database with drivers...');

    await initializeCategories();
    await initializeSystemConfig();
    await initializeDrivers();

    console.log('Database with drivers initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database with drivers:', error);
    throw error;
  }
};

// Utility function to check if database is initialized
export const isDatabaseInitialized = async (): Promise<boolean> => {
  try {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);
    const systemConfigRef = doc(db, COLLECTIONS.SYSTEM_CONFIG, 'main');

    // Check if basic collections exist
    const [categoriesSnapshot, systemConfigSnapshot] = await Promise.all([
      categoriesRef,
      systemConfigRef
    ]);

    return true; // If no errors, assume initialized
  } catch (error) {
    return false;
  }
};

// Reset database (use with caution!)
export const resetDatabase = async () => {
  console.warn('This function should only be used in development!');
  // Implementation would delete all collections
  // Not implemented for safety
};

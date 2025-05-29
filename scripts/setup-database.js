#!/usr/bin/env node

/**
 * Database Setup Script for Tap2Go
 * 
 * This script initializes the Firestore database with:
 * - Default categories
 * - System configuration
 * 
 * Usage: node scripts/setup-database.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, Timestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6ALvnN6aX0DMVhePhkUow9VrPauBCqgQ",
  authDomain: "tap2go-kuucn.firebaseapp.com",
  projectId: "tap2go-kuucn",
  storageBucket: "tap2go-kuucn.firebasestorage.app",
  messagingSenderId: "828629511294",
  appId: "1:828629511294:web:fae32760ca3c3afcb87c2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize default categories
async function initializeCategories() {
  console.log('📊 Initializing categories...');
  
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
    await setDoc(doc(db, 'categories', category.id), category);
    console.log(`✅ Created category: ${category.name}`);
  }

  console.log('✅ Categories initialized successfully\n');
}

// Initialize system configuration
async function initializeSystemConfig() {
  console.log('⚙️ Initializing system configuration...');
  
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

  await setDoc(doc(db, 'systemConfig', 'main'), systemConfig);
  console.log('✅ System configuration initialized successfully\n');
}

// Main setup function
async function setupDatabase() {
  try {
    console.log('🚀 Starting Tap2Go database setup...\n');

    await initializeCategories();
    await initializeSystemConfig();

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ Categories collection initialized (10 categories)');
    console.log('- ✅ System configuration created');

    console.log('\n🔧 Next Steps:');
    console.log('1. Check your Firebase Console to see the new collections');
    console.log('2. Start your application: npm run dev');
    console.log('3. Test user registration and login');
    console.log('4. The app will now use real Firestore data!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();

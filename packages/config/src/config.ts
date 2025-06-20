/**
 * Application Configuration
 * Centralized configuration management for all environments
 */

// Environment validation
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

// Validate required environment variables
const validateEnv = () => {
  const missing = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
};

// Run validation in development
if (process.env.NODE_ENV === 'development') {
  validateEnv();
}

// Main configuration object
export const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000, // 30 seconds
  },

  // Firebase Configuration
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },

  // App Configuration
  app: {
    name: 'Tap2Go',
    version: '1.0.0',
    description: 'Food Delivery Platform',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Business Configuration
  business: {
    defaultCommissionRate: 15, // 15%
    defaultDeliveryFee: 2.99,
    minimumOrderAmount: 10,
    maxDeliveryDistance: 10, // km
    averageDeliverySpeed: 30, // km/h
    preparationTimeBuffer: 5, // minutes
  },

  // Payment Configuration
  payment: {
    currency: 'USD',
    taxRate: 0.08, // 8%
    serviceFeeRate: 0.02, // 2%
    stripePubKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },

  // Maps Configuration
  maps: {
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    defaultCenter: {
      lat: 40.7128,
      lng: -74.0060, // New York City
    },
    defaultZoom: 12,
  },

  // Storage Configuration
  storage: {
    cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },

  // Feature Flags
  features: {
    enableChat: true,
    enableReviews: true,
    enableLoyaltyProgram: false,
    enableMultiplePaymentMethods: true,
    enableRealTimeTracking: true,
  },
} as const;

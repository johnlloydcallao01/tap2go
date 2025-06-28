/**
 * Environment Configuration for Mobile App
 * This file loads environment variables from .env.local during development
 * and from EAS Build environment during production builds
 */

import {
  // Firebase Configuration
  NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  FIREBASE_ADMIN_PROJECT_ID,
  FIREBASE_ADMIN_PRIVATE_KEY,
  FIREBASE_ADMIN_CLIENT_EMAIL,

  // Google Maps
  NEXT_PUBLIC_MAPS_FRONTEND_KEY,
  MAPS_BACKEND_KEY,

  // Bonsai Elasticsearch
  BONSAI_HOST,
  BONSAI_USERNAME,
  BONSAI_PASSWORD,

  // Cloudinary
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_WEBHOOK_SECRET,

  // PayMongo
  PAYMONGO_PUBLIC_KEY_LIVE,
  PAYMONGO_SECRET_KEY_LIVE,
  NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE,

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  ENABLE_SUPABASE_CMS,

  // Upstash Redis
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  ENABLE_REDIS_CACHING,
  REDIS_DEFAULT_TTL,

  // Resend Email
  RESEND_API_KEY,
  NEXT_PUBLIC_RESEND_FROM_EMAIL,
  ENABLE_EMAIL_NOTIFICATIONS,
  EMAIL_FROM_NAME,
  EMAIL_REPLY_TO,

  // Google AI Studio
  GOOGLE_AI_API_KEY,
  ENABLE_AI_FEATURES,
  AI_MODEL_DEFAULT,

  // Expo Configuration
  EXPO_BETA,
  EXPO_USE_FAST_RESOLVER,
  EXPO_CACHE_CERTIFICATES,
} from '@env';

// Environment detection
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;

// Firebase Configuration
export const firebaseConfig = {
  apiKey: NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: NEXT_PUBLIC_FIREBASE_APP_ID,
  vapidKey: NEXT_PUBLIC_FIREBASE_VAPID_KEY,
};

// Firebase Admin Configuration
export const firebaseAdminConfig = {
  projectId: FIREBASE_ADMIN_PROJECT_ID,
  privateKey: FIREBASE_ADMIN_PRIVATE_KEY,
  clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
};

// Google Maps Configuration
export const mapsConfig = {
  frontendKey: NEXT_PUBLIC_MAPS_FRONTEND_KEY,
  backendKey: MAPS_BACKEND_KEY,
};

// Bonsai Elasticsearch Configuration
export const searchConfig = {
  host: BONSAI_HOST,
  username: BONSAI_USERNAME,
  password: BONSAI_PASSWORD,
};

// Cloudinary Configuration
export const cloudinaryConfig = {
  cloudName: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: CLOUDINARY_API_KEY,
  apiSecret: CLOUDINARY_API_SECRET,
  webhookSecret: CLOUDINARY_WEBHOOK_SECRET,
};

// Payment Configuration
export const paymentConfig = {
  paymongoPublicKey: PAYMONGO_PUBLIC_KEY_LIVE,
  paymongoSecretKey: PAYMONGO_SECRET_KEY_LIVE,
  paymongoPublicKeyLive: NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE,
};

// Supabase Configuration
export const supabaseConfig = {
  url: NEXT_PUBLIC_SUPABASE_URL,
  anonKey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
  cmsEnabled: ENABLE_SUPABASE_CMS === 'true',
};

// Redis Configuration
export const redisConfig = {
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
  enabled: ENABLE_REDIS_CACHING === 'true',
  defaultTTL: parseInt(REDIS_DEFAULT_TTL || '3600'),
};

// Email Configuration
export const emailConfig = {
  resendApiKey: RESEND_API_KEY,
  fromEmail: NEXT_PUBLIC_RESEND_FROM_EMAIL,
  enabled: ENABLE_EMAIL_NOTIFICATIONS === 'true',
  fromName: EMAIL_FROM_NAME,
  replyTo: EMAIL_REPLY_TO,
};

// AI Configuration
export const aiConfig = {
  googleApiKey: GOOGLE_AI_API_KEY,
  enabled: ENABLE_AI_FEATURES === 'true',
  defaultModel: AI_MODEL_DEFAULT,
};

// Expo Configuration
export const expoConfig = {
  beta: EXPO_BETA === 'true',
  fastResolver: EXPO_USE_FAST_RESOLVER === 'true',
  cacheCertificates: EXPO_CACHE_CERTIFICATES === 'true',
};

// Validation function
export const validateEnvironment = () => {
  const requiredVars = {
    'Firebase API Key': firebaseConfig.apiKey,
    'Firebase Project ID': firebaseConfig.projectId,
    'Google Maps Frontend Key': mapsConfig.frontendKey,
  };

  const missing = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    if (isDevelopment) {
      console.error('Please check your .env.local file in apps/mobile-customer/');
    } else {
      console.error('Please check your EAS Build environment variables');
    }
    return false;
  }

  return true;
};

// Log environment status (development only)
if (isDevelopment) {
  console.log('🔧 Environment Configuration Loaded:');
  console.log('  Firebase Project:', firebaseConfig.projectId || 'NOT SET');
  console.log('  Google Maps:', mapsConfig.frontendKey ? 'CONFIGURED' : 'NOT SET');
  console.log('  Cloudinary:', cloudinaryConfig.cloudName || 'NOT SET');
  console.log('  Supabase:', supabaseConfig.url ? 'CONFIGURED' : 'NOT SET');
  console.log('  Redis Caching:', redisConfig.enabled ? 'ENABLED' : 'DISABLED');
  console.log('  Email Service:', emailConfig.enabled ? 'ENABLED' : 'DISABLED');
  console.log('  AI Features:', aiConfig.enabled ? 'ENABLED' : 'DISABLED');
  console.log('  Environment:', isDevelopment ? 'Development' : 'Production');
}

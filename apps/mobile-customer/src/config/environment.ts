/**
 * Environment Configuration for Mobile App
 * This file loads environment variables from .env.local during development
 * and from EAS Build environment during production builds
 */

// Check if we're in EAS Build environment
const isEASBuild = process.env.EAS_BUILD === 'true' || process.env.CI === 'true';

// Import environment variables conditionally
let envVars: any = {};

if (!isEASBuild) {
  // Local development - import from @env (react-native-dotenv)
  try {
    envVars = require('@env');
  } catch (error) {
    console.warn('Failed to load @env, falling back to process.env');
    envVars = {};
  }
}

// Helper function to get environment variable
const getEnvVar = (key: string): string => {
  if (isEASBuild) {
    // EAS Build - use process.env directly
    return process.env[key] || '';
  } else {
    // Local development - use imported variables or fallback to process.env
    return envVars[key] || process.env[key] || '';
  }
};

// Environment detection
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;

// Firebase Configuration
export const firebaseConfig = {
  apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
  vapidKey: getEnvVar('NEXT_PUBLIC_FIREBASE_VAPID_KEY'),
};

// Firebase Admin Configuration
export const firebaseAdminConfig = {
  projectId: getEnvVar('FIREBASE_ADMIN_PROJECT_ID'),
  privateKey: getEnvVar('FIREBASE_ADMIN_PRIVATE_KEY'),
  clientEmail: getEnvVar('FIREBASE_ADMIN_CLIENT_EMAIL'),
};

// Google Maps Configuration
export const mapsConfig = {
  frontendKey: getEnvVar('NEXT_PUBLIC_MAPS_FRONTEND_KEY'),
  backendKey: getEnvVar('MAPS_BACKEND_KEY'),
};

// Bonsai Elasticsearch Configuration
export const searchConfig = {
  host: getEnvVar('BONSAI_HOST'),
  username: getEnvVar('BONSAI_USERNAME'),
  password: getEnvVar('BONSAI_PASSWORD'),
};

// Cloudinary Configuration
export const cloudinaryConfig = {
  cloudName: getEnvVar('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
  apiKey: getEnvVar('CLOUDINARY_API_KEY'),
  apiSecret: getEnvVar('CLOUDINARY_API_SECRET'),
  webhookSecret: getEnvVar('CLOUDINARY_WEBHOOK_SECRET'),
};

// Payment Configuration
export const paymentConfig = {
  paymongoPublicKey: getEnvVar('PAYMONGO_PUBLIC_KEY_LIVE'),
  paymongoSecretKey: getEnvVar('PAYMONGO_SECRET_KEY_LIVE'),
  paymongoPublicKeyLive: getEnvVar('NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE'),
};

// Supabase Configuration
export const supabaseConfig = {
  url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  cmsEnabled: getEnvVar('ENABLE_SUPABASE_CMS') === 'true',
};

// Redis Configuration
export const redisConfig = {
  url: getEnvVar('UPSTASH_REDIS_REST_URL'),
  token: getEnvVar('UPSTASH_REDIS_REST_TOKEN'),
  enabled: getEnvVar('ENABLE_REDIS_CACHING') === 'true',
  defaultTTL: parseInt(getEnvVar('REDIS_DEFAULT_TTL') || '3600'),
};

// Email Configuration
export const emailConfig = {
  resendApiKey: getEnvVar('RESEND_API_KEY'),
  fromEmail: getEnvVar('NEXT_PUBLIC_RESEND_FROM_EMAIL'),
  enabled: getEnvVar('ENABLE_EMAIL_NOTIFICATIONS') === 'true',
  fromName: getEnvVar('EMAIL_FROM_NAME'),
  replyTo: getEnvVar('EMAIL_REPLY_TO'),
};

// AI Configuration
export const aiConfig = {
  googleApiKey: getEnvVar('GOOGLE_AI_API_KEY'),
  enabled: getEnvVar('ENABLE_AI_FEATURES') === 'true',
  defaultModel: getEnvVar('AI_MODEL_DEFAULT'),
};

// Expo Configuration
export const expoConfig = {
  beta: getEnvVar('EXPO_BETA') === 'true',
  fastResolver: getEnvVar('EXPO_USE_FAST_RESOLVER') === 'true',
  cacheCertificates: getEnvVar('EXPO_CACHE_CERTIFICATES') === 'true',
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

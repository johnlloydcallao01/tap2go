/**
 * Environment Configuration for Mobile App
 * Uses process.env for all environment variables
 * Works in both local development and EAS Build
 */

// In production builds, environment variables should be inlined by Metro bundler
// If they're not accessible via process.env, we need to use direct references
// This is a workaround for React Native production build environment variable access

// Direct environment variable references for production builds
// These will be replaced by Metro bundler during build time
const ENV_VARS = {
  // Firebase Configuration
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_VAPID_KEY: process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY,

  // Note: Firebase Admin SDK is NOT used in mobile apps - only in server-side web app

  // Supabase Configuration
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  EXPO_PUBLIC_ENABLE_SUPABASE_CMS: process.env.EXPO_PUBLIC_ENABLE_SUPABASE_CMS,

  // Maps Configuration
  EXPO_PUBLIC_MAPS_FRONTEND_KEY: process.env.EXPO_PUBLIC_MAPS_FRONTEND_KEY,
  EXPO_PUBLIC_MAPS_BACKEND_KEY: process.env.EXPO_PUBLIC_MAPS_BACKEND_KEY,

  // Cloudinary Configuration
  EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  EXPO_PUBLIC_CLOUDINARY_API_KEY: process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY,
  EXPO_PUBLIC_CLOUDINARY_API_SECRET: process.env.EXPO_PUBLIC_CLOUDINARY_API_SECRET,

  // PayMongo Configuration
  EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE: process.env.EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE,
  EXPO_PUBLIC_PAYMONGO_SECRET_KEY_LIVE: process.env.EXPO_PUBLIC_PAYMONGO_SECRET_KEY_LIVE,

  // Redis Configuration
  EXPO_PUBLIC_UPSTASH_REDIS_REST_URL: process.env.EXPO_PUBLIC_UPSTASH_REDIS_REST_URL,
  EXPO_PUBLIC_UPSTASH_REDIS_REST_TOKEN: process.env.EXPO_PUBLIC_UPSTASH_REDIS_REST_TOKEN,
  EXPO_PUBLIC_ENABLE_REDIS_CACHING: process.env.EXPO_PUBLIC_ENABLE_REDIS_CACHING,
  EXPO_PUBLIC_REDIS_DEFAULT_TTL: process.env.EXPO_PUBLIC_REDIS_DEFAULT_TTL,

  // Email Configuration
  EXPO_PUBLIC_RESEND_FROM_EMAIL: process.env.EXPO_PUBLIC_RESEND_FROM_EMAIL,
  EXPO_PUBLIC_RESEND_API_KEY: process.env.EXPO_PUBLIC_RESEND_API_KEY,
  EXPO_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS,
  EXPO_PUBLIC_EMAIL_FROM_NAME: process.env.EXPO_PUBLIC_EMAIL_FROM_NAME,
  EXPO_PUBLIC_EMAIL_REPLY_TO: process.env.EXPO_PUBLIC_EMAIL_REPLY_TO,

  // AI Configuration
  EXPO_PUBLIC_GOOGLE_AI_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_AI_API_KEY,
  EXPO_PUBLIC_ENABLE_AI_FEATURES: process.env.EXPO_PUBLIC_ENABLE_AI_FEATURES,
  EXPO_PUBLIC_AI_MODEL_DEFAULT: process.env.EXPO_PUBLIC_AI_MODEL_DEFAULT,

  // Bonsai Configuration
  EXPO_PUBLIC_BONSAI_HOST: process.env.EXPO_PUBLIC_BONSAI_HOST,
  EXPO_PUBLIC_BONSAI_USERNAME: process.env.EXPO_PUBLIC_BONSAI_USERNAME,
  EXPO_PUBLIC_BONSAI_PASSWORD: process.env.EXPO_PUBLIC_BONSAI_PASSWORD,
} as const;

// Helper function to get environment variable with safe fallback
const getEnvVar = (key: string): string => {
  try {
    // First, try to get from the pre-defined ENV_VARS object (for production builds)
    if (key in ENV_VARS) {
      const value = ENV_VARS[key as keyof typeof ENV_VARS];
      if (value) {
        // Debug logging for critical variables
        if (key.includes('FIREBASE') || key.includes('SUPABASE') || key.includes('MAPS') || key.includes('RESEND') || key.includes('BONSAI')) {
          console.log(`🔧 getEnvVar(${key}): ✅ Found via ENV_VARS (${value.substring(0, 20)}...)`);
        }
        return value;
      }
    }

    // Fallback: try process.env (for development and some build configurations)
    let value = '';
    if (typeof process !== 'undefined' && process.env) {
      value = process.env[key] || '';
    }

    // Debug logging for critical variables
    if (key.includes('FIREBASE') || key.includes('SUPABASE') || key.includes('MAPS') || key.includes('RESEND') || key.includes('BONSAI')) {
      console.log(`🔧 getEnvVar(${key}): ${value ? `✅ Found via process.env (${value.substring(0, 20)}...)` : '❌ Empty/Missing'}`);

      // Additional debugging for production builds
      if (!value) {
        console.log(`🔧 Debug info for ${key}:`);
        console.log(`  - ENV_VARS[${key}]: ${key in ENV_VARS ? (ENV_VARS[key as keyof typeof ENV_VARS] ? 'SET' : 'EMPTY') : 'NOT_FOUND'}`);
        console.log(`  - typeof process: ${typeof process}`);
        console.log(`  - process.env exists: ${typeof process !== 'undefined' && !!process.env}`);

        // Log all available EXPO_PUBLIC_ variables for debugging
        if (typeof process !== 'undefined' && process.env) {
          const expoVars = Object.keys(process.env).filter(k => k.startsWith('EXPO_PUBLIC_'));
          console.log(`  - Available EXPO_PUBLIC_ vars: ${expoVars.length} found`);
          expoVars.slice(0, 5).forEach(k => {
            console.log(`    ${k}: ${process.env[k] ? 'SET' : 'EMPTY'}`);
          });
        }
      }
    }

    return value;
  } catch (error) {
    console.warn(`Failed to access environment variable ${key}:`, error);
    return '';
  }
};

// Environment detection with safe fallback
export const isDevelopment = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
export const isProduction = !isDevelopment;

// Comprehensive environment debugging function
export const debugEnvironmentVariables = () => {
  console.log('🔧 === ENVIRONMENT DEBUGGING ===');
  console.log(`🔧 Environment: ${isDevelopment ? 'Development' : 'Production'}`);
  console.log(`🔧 __DEV__: ${typeof __DEV__ !== 'undefined' ? __DEV__ : 'undefined'}`);
  console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);

  // Check ENV_VARS object (production build compatibility)
  console.log('🔧 ENV_VARS object status:');
  Object.entries(ENV_VARS).forEach(([key, value]) => {
    console.log(`  ${key}: ${value ? `✅ SET (${value.substring(0, 20)}...)` : '❌ EMPTY'}`);
  });

  // Check process.env availability
  console.log(`🔧 typeof process: ${typeof process}`);
  console.log(`🔧 process.env exists: ${typeof process !== 'undefined' && !!process.env}`);

  if (typeof process !== 'undefined' && process.env) {
    // Count total environment variables
    const totalVars = Object.keys(process.env).length;
    console.log(`🔧 Total environment variables: ${totalVars}`);

    // Check EXPO_PUBLIC_ variables specifically
    const expoPublicVars = Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC_'));
    console.log(`🔧 EXPO_PUBLIC_ variables found: ${expoPublicVars.length}`);

    // Log critical variables from process.env
    const criticalVars = [
      'EXPO_PUBLIC_FIREBASE_API_KEY',
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
      'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      'EXPO_PUBLIC_MAPS_FRONTEND_KEY',
      'EXPO_PUBLIC_RESEND_FROM_EMAIL',
      'EXPO_PUBLIC_BONSAI_HOST',
      'EXPO_PUBLIC_BONSAI_USERNAME',
      'EXPO_PUBLIC_BONSAI_PASSWORD'
    ];

    console.log('🔧 Critical variables status (process.env):');
    criticalVars.forEach(varName => {
      const value = process.env[varName];
      console.log(`  ${varName}: ${value ? `✅ SET (${value.substring(0, 20)}...)` : '❌ MISSING'}`);
    });

    // Log first few EXPO_PUBLIC_ variables for debugging
    console.log('🔧 Sample EXPO_PUBLIC_ variables (process.env):');
    expoPublicVars.slice(0, 10).forEach(varName => {
      const value = process.env[varName];
      console.log(`  ${varName}: ${value ? `SET (${value.substring(0, 20)}...)` : 'EMPTY'}`);
    });
  } else {
    console.error('🚨 process.env is not available!');
  }

  console.log('🔧 === END ENVIRONMENT DEBUGGING ===');
};

// Firebase Configuration
export const firebaseConfig = {
  apiKey: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY') || getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN') || getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID') || getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET') || getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') || getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID') || getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
  vapidKey: getEnvVar('EXPO_PUBLIC_FIREBASE_VAPID_KEY') || getEnvVar('NEXT_PUBLIC_FIREBASE_VAPID_KEY'),
};

// Note: Firebase Admin SDK is NOT used in mobile apps
// Admin functionality is handled by server-side API calls to the web app
// Mobile apps only use the regular Firebase client SDK (configured above)

// Google Maps Configuration
export const mapsConfig = {
  frontendKey: getEnvVar('EXPO_PUBLIC_MAPS_FRONTEND_KEY') || getEnvVar('NEXT_PUBLIC_MAPS_FRONTEND_KEY'),
  backendKey: getEnvVar('EXPO_PUBLIC_MAPS_BACKEND_KEY') || getEnvVar('MAPS_BACKEND_KEY'),
};

// Bonsai Elasticsearch Configuration
export const searchConfig = {
  host: getEnvVar('EXPO_PUBLIC_BONSAI_HOST') || getEnvVar('BONSAI_HOST'),
  username: getEnvVar('EXPO_PUBLIC_BONSAI_USERNAME') || getEnvVar('BONSAI_USERNAME'),
  password: getEnvVar('EXPO_PUBLIC_BONSAI_PASSWORD') || getEnvVar('BONSAI_PASSWORD'),
};

// Cloudinary Configuration
export const cloudinaryConfig = {
  cloudName: getEnvVar('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME') || getEnvVar('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'),
  apiKey: getEnvVar('EXPO_PUBLIC_CLOUDINARY_API_KEY') || getEnvVar('CLOUDINARY_API_KEY'),
  apiSecret: getEnvVar('EXPO_PUBLIC_CLOUDINARY_API_SECRET') || getEnvVar('CLOUDINARY_API_SECRET'),
  webhookSecret: getEnvVar('EXPO_PUBLIC_CLOUDINARY_WEBHOOK_SECRET') || getEnvVar('CLOUDINARY_WEBHOOK_SECRET'),
};

// Payment Configuration
export const paymentConfig = {
  paymongoPublicKey: getEnvVar('EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE') || getEnvVar('PAYMONGO_PUBLIC_KEY_LIVE'),
  paymongoSecretKey: getEnvVar('EXPO_PUBLIC_PAYMONGO_SECRET_KEY_LIVE') || getEnvVar('PAYMONGO_SECRET_KEY_LIVE'),
  paymongoPublicKeyLive: getEnvVar('EXPO_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE') || getEnvVar('NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE'),
};

// Supabase Configuration
export const supabaseConfig = {
  url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL') || getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY') || getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  serviceRoleKey: getEnvVar('EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY') || getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  cmsEnabled: (getEnvVar('EXPO_PUBLIC_ENABLE_SUPABASE_CMS') || getEnvVar('ENABLE_SUPABASE_CMS')) === 'true',
};

// Redis Configuration
export const redisConfig = {
  url: getEnvVar('EXPO_PUBLIC_UPSTASH_REDIS_REST_URL') || getEnvVar('UPSTASH_REDIS_REST_URL'),
  token: getEnvVar('EXPO_PUBLIC_UPSTASH_REDIS_REST_TOKEN') || getEnvVar('UPSTASH_REDIS_REST_TOKEN'),
  enabled: (getEnvVar('EXPO_PUBLIC_ENABLE_REDIS_CACHING') || getEnvVar('ENABLE_REDIS_CACHING')) === 'true',
  defaultTTL: parseInt((getEnvVar('EXPO_PUBLIC_REDIS_DEFAULT_TTL') || getEnvVar('REDIS_DEFAULT_TTL')) || '3600'),
};

// Email Configuration
export const emailConfig = {
  resendApiKey: getEnvVar('EXPO_PUBLIC_RESEND_API_KEY') || getEnvVar('RESEND_API_KEY'),
  fromEmail: getEnvVar('EXPO_PUBLIC_RESEND_FROM_EMAIL') || getEnvVar('NEXT_PUBLIC_RESEND_FROM_EMAIL'),
  enabled: (getEnvVar('EXPO_PUBLIC_ENABLE_EMAIL_NOTIFICATIONS') || getEnvVar('ENABLE_EMAIL_NOTIFICATIONS')) === 'true',
  fromName: getEnvVar('EXPO_PUBLIC_EMAIL_FROM_NAME') || getEnvVar('EMAIL_FROM_NAME'),
  replyTo: getEnvVar('EXPO_PUBLIC_EMAIL_REPLY_TO') || getEnvVar('EMAIL_REPLY_TO'),
};

// AI Configuration
export const aiConfig = {
  googleApiKey: getEnvVar('EXPO_PUBLIC_GOOGLE_AI_API_KEY') || getEnvVar('GOOGLE_AI_API_KEY'),
  enabled: (getEnvVar('EXPO_PUBLIC_ENABLE_AI_FEATURES') || getEnvVar('ENABLE_AI_FEATURES')) === 'true',
  defaultModel: getEnvVar('EXPO_PUBLIC_AI_MODEL_DEFAULT') || getEnvVar('AI_MODEL_DEFAULT'),
};

// Expo Configuration
export const expoConfig = {
  beta: getEnvVar('EXPO_BETA') === 'true',
  fastResolver: getEnvVar('EXPO_USE_FAST_RESOLVER') === 'true',
  cacheCertificates: getEnvVar('EXPO_CACHE_CERTIFICATES') === 'true',
};

// Environment validation function with detailed results
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  try {
    console.log('🔧 Starting environment validation...');

    // Debug: Log all process.env variables that start with EXPO_PUBLIC_
    console.log('🔧 Available EXPO_PUBLIC_ variables:');
    Object.keys(process.env).filter(key => key.startsWith('EXPO_PUBLIC_')).forEach(key => {
      const value = process.env[key];
      console.log(`  ${key}: ${value ? `✅ Set (${value.substring(0, 20)}...)` : '❌ Empty'}`);
    });

    // Safely check critical configuration objects with null checks
    const requiredVars = {
      'Firebase API Key': firebaseConfig?.apiKey || '',
      'Firebase Project ID': firebaseConfig?.projectId || '',
      'Firebase Auth Domain': firebaseConfig?.authDomain || '',
      'Supabase URL': supabaseConfig?.url || '',
      'Supabase Anon Key': supabaseConfig?.anonKey || '',
      'Google Maps Frontend Key': mapsConfig?.frontendKey || '',
    };

    console.log('🔧 Checking required configuration values:');
    Object.entries(requiredVars).forEach(([name, value]) => {
      if (!value) {
        console.error(`❌ ${name}: Missing or empty`);
        errors.push(`Missing ${name}: Configuration value is empty or undefined`);
      } else {
        console.log(`✅ ${name}: Present (${value.substring(0, 20)}...)`);
      }
    });

    // Log all available environment variables for debugging
    console.log('🔍 Available environment variables:');
    const allEnvVars = Object.keys(process.env).filter(key =>
      key.startsWith('EXPO_PUBLIC_') ||
      key.startsWith('NEXT_PUBLIC_') ||
      key.includes('FIREBASE') ||
      key.includes('SUPABASE') ||
      key.includes('MAPS') ||
      key.includes('CLOUDINARY')
    ).sort();

    allEnvVars.forEach(key => {
      const value = process.env[key];
      console.log(`  ${key}: ${value ? `✅ Set (${value.substring(0, 30)}...)` : '❌ Empty'}`);
    });

    // Additional debugging info with safe property access
    console.log('🔧 Configuration Objects:');
    console.log('  firebaseConfig:', {
      apiKey: firebaseConfig?.apiKey ? '✅ Set' : '❌ Missing',
      projectId: firebaseConfig?.projectId ? '✅ Set' : '❌ Missing',
      authDomain: firebaseConfig?.authDomain ? '✅ Set' : '❌ Missing'
    });
    console.log('  supabaseConfig:', {
      url: supabaseConfig?.url ? '✅ Set' : '❌ Missing',
      anonKey: supabaseConfig?.anonKey ? '✅ Set' : '❌ Missing'
    });

    if (errors.length > 0) {
      console.error('❌ Environment validation failed:', errors);
      if (isDevelopment) {
        console.error('Please check your .env.local file in apps/mobile-customer/');
      } else {
        console.error('Please check your EAS Build environment variables');
      }
    }

  } catch (error) {
    console.error('🚨 CRITICAL: Environment validation crashed:', error);
    errors.push(`Environment validation crashed: ${error.message || 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Log environment status (development only) with safe property access
if (isDevelopment) {
  try {
    console.log('🔧 Environment Configuration Loaded:');
    console.log('  Firebase Project:', firebaseConfig?.projectId || 'NOT SET');
    console.log('  Google Maps:', mapsConfig?.frontendKey ? 'CONFIGURED' : 'NOT SET');
    console.log('  Cloudinary:', cloudinaryConfig?.cloudName || 'NOT SET');
    console.log('  Supabase:', supabaseConfig?.url ? 'CONFIGURED' : 'NOT SET');
    console.log('  Redis Caching:', redisConfig?.enabled ? 'ENABLED' : 'DISABLED');
    console.log('  Email Service:', emailConfig?.enabled ? 'ENABLED' : 'DISABLED');
    console.log('  AI Features:', aiConfig?.enabled ? 'ENABLED' : 'DISABLED');
    console.log('  Environment:', isDevelopment ? 'Development' : 'Production');
  } catch (error) {
    console.error('🚨 Error logging environment status:', error);
  }
}

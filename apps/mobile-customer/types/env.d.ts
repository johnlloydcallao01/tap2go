declare module '@env' {
  // Firebase Configuration
  export const NEXT_PUBLIC_FIREBASE_API_KEY: string;
  export const NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  export const NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  export const NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  export const NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  export const NEXT_PUBLIC_FIREBASE_APP_ID: string;
  export const NEXT_PUBLIC_FIREBASE_VAPID_KEY: string;

  // Firebase Admin SDK
  export const FIREBASE_ADMIN_PROJECT_ID: string;
  export const FIREBASE_ADMIN_PRIVATE_KEY: string;
  export const FIREBASE_ADMIN_CLIENT_EMAIL: string;

  // Google Maps API Keys
  export const NEXT_PUBLIC_MAPS_FRONTEND_KEY: string;
  export const MAPS_BACKEND_KEY: string;

  // Bonsai Elasticsearch
  export const BONSAI_HOST: string;
  export const BONSAI_USERNAME: string;
  export const BONSAI_PASSWORD: string;

  // Cloudinary Configuration
  export const NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
  export const CLOUDINARY_API_KEY: string;
  export const CLOUDINARY_API_SECRET: string;
  export const CLOUDINARY_WEBHOOK_SECRET: string;

  // PayMongo Payment Gateway
  export const PAYMONGO_PUBLIC_KEY_LIVE: string;
  export const PAYMONGO_SECRET_KEY_LIVE: string;
  export const NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY_LIVE: string;

  // Supabase Configuration
  export const NEXT_PUBLIC_SUPABASE_URL: string;
  export const NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  export const SUPABASE_SERVICE_ROLE_KEY: string;
  export const ENABLE_SUPABASE_CMS: string;

  // Upstash Redis
  export const UPSTASH_REDIS_REST_URL: string;
  export const UPSTASH_REDIS_REST_TOKEN: string;
  export const ENABLE_REDIS_CACHING: string;
  export const REDIS_DEFAULT_TTL: string;

  // Resend Email Service
  export const RESEND_API_KEY: string;
  export const NEXT_PUBLIC_RESEND_FROM_EMAIL: string;
  export const ENABLE_EMAIL_NOTIFICATIONS: string;
  export const EMAIL_FROM_NAME: string;
  export const EMAIL_REPLY_TO: string;

  // Google AI Studio (Gemini)
  export const GOOGLE_AI_API_KEY: string;
  export const ENABLE_AI_FEATURES: string;
  export const AI_MODEL_DEFAULT: string;

  // Expo CLI Configuration
  export const EXPO_BETA: string;
  export const EXPO_USE_FAST_RESOLVER: string;
  export const EXPO_CACHE_CERTIFICATES: string;
}

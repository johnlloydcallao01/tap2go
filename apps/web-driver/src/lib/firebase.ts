// Firebase SDK imports with Vercel build compatibility
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

// Lazy-loaded Firebase configuration to avoid build-time errors
function getFirebaseConfig() {
  // Validate environment variables
  const requiredEnvVars = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  // Check for missing environment variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    // During build time or in Vercel environment, provide fallback values to prevent build failures
    if (process.env.NODE_ENV === 'production' || process.env.CI || process.env.VERCEL) {
      console.warn(`Missing Firebase environment variables during build: ${missingVars.join(', ')}`);
      return {
        apiKey: 'build-time-placeholder',
        authDomain: 'build-time-placeholder.firebaseapp.com',
        projectId: 'build-time-placeholder',
        storageBucket: 'build-time-placeholder.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:placeholder'
      };
    }
    throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
  }

  return requiredEnvVars;
}

// Professional Firebase initialization with Vercel build compatibility
function initializeFirebaseServices() {
  try {
    const requiredEnvVars = getFirebaseConfig();

    // Firebase configuration
    const firebaseConfig = {
      apiKey: requiredEnvVars.apiKey as string,
      authDomain: requiredEnvVars.authDomain as string,
      projectId: requiredEnvVars.projectId as string,
      storageBucket: requiredEnvVars.storageBucket as string,
      messagingSenderId: requiredEnvVars.messagingSenderId as string,
      appId: requiredEnvVars.appId as string
    };

    // Initialize Firebase app
    const firebaseApp = initializeApp(firebaseConfig);

    // Initialize Firebase services
    const firebaseAuth = getAuth(firebaseApp);
    const firebaseDb = getFirestore(firebaseApp);
    const firebaseStorage = getStorage(firebaseApp);

    return {
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      storage: firebaseStorage
    };
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    return { app: null, auth: null, db: null, storage: null };
  }
}

// Initialize services once
const firebaseServices = initializeFirebaseServices();

// Export Firebase services with null safety
export const auth = firebaseServices.auth;
export const db = firebaseServices.db;
export const storage = firebaseServices.storage;
export const app = firebaseServices.app;

// Initialize Firebase Cloud Messaging (only in browser environment)
let messaging: unknown = null;

// FCM initialization function
export const initializeMessaging = async () => {
  if (typeof window !== 'undefined') {
    try {
      const supported = await isSupported();
      if (supported) {
        messaging = getMessaging(app);
        console.log('Firebase Cloud Messaging initialized successfully');
        return messaging;
      } else {
        console.warn('Firebase Cloud Messaging is not supported in this browser');
        return null;
      }
    } catch (error) {
      console.error('Error initializing Firebase Cloud Messaging:', error);
      return null;
    }
  }
  return null;
};

// Get messaging instance
export const getMessagingInstance = () => messaging;

export { messaging };

export default app;

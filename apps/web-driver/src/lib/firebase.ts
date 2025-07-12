// Simple Firebase SDK imports for Vercel compatibility
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

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

// Simple Firebase initialization for Vercel compatibility
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

    // Initialize Firebase app (check if already initialized)
    const existingApps = getApps();
    const firebaseApp = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);

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

// Firebase messaging removed for Vercel build compatibility

export default app;

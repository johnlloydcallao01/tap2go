// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";
import { debugFirebaseInit } from "./debug-wrapper";

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
  throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey!,
  authDomain: requiredEnvVars.authDomain!,
  projectId: requiredEnvVars.projectId!,
  storageBucket: requiredEnvVars.storageBucket!,
  messagingSenderId: requiredEnvVars.messagingSenderId!,
  appId: requiredEnvVars.appId!
};

// SSR-safe Firebase initialization
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

/**
 * Initialize Firebase services in a SSR-safe way
 * This function ensures Firebase is only initialized on the client side
 */
function initializeFirebase() {
  // Only initialize on client side
  if (typeof window === 'undefined') {
    return;
  }

  // Check if already initialized
  if (app && auth && db && storage) {
    return;
  }

  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Firebase services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    // Reset all services to null on failure
    app = null;
    auth = null;
    db = null;
    storage = null;
    throw error; // Re-throw the error so callers know initialization failed
  }
}

/**
 * Get Firebase Auth instance (SSR-safe)
 */
export function getFirebaseAuth() {
  // Ensure we're on the client side
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth can only be accessed on the client side');
  }

  try {
    initializeFirebase();
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw new Error('Firebase initialization failed. Please check your configuration.');
  }

  if (!auth) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  return auth;
}

/**
 * Get Firestore instance (SSR-safe)
 */
export function getFirebaseDb() {
  // Ensure we're on the client side
  if (typeof window === 'undefined') {
    throw new Error('Firebase Firestore can only be accessed on the client side');
  }

  try {
    initializeFirebase();
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw new Error('Firebase initialization failed. Please check your configuration.');
  }

  if (!db) {
    throw new Error('Firebase Firestore is not initialized. Please check your Firebase configuration.');
  }

  // Debug the database instance before returning it
  return debugFirebaseInit(db, 'getFirebaseDb');
}

/**
 * Get Firebase Storage instance (SSR-safe)
 */
export function getFirebaseStorage() {
  initializeFirebase();
  if (!storage) {
    throw new Error('Firebase Storage is not initialized. Make sure you are on the client side.');
  }
  return storage;
}

// Legacy exports for backward compatibility - these will be null during SSR
export { auth, db, storage };

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

export { messaging, firebaseConfig };

export default app;

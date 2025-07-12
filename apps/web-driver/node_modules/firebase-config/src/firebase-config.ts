// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

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
  apiKey: requiredEnvVars.apiKey as string,
  authDomain: requiredEnvVars.authDomain as string,
  projectId: requiredEnvVars.projectId as string,
  storageBucket: requiredEnvVars.storageBucket as string,
  messagingSenderId: requiredEnvVars.messagingSenderId as string,
  appId: requiredEnvVars.appId as string
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

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

// Firebase Admin configuration (server-side only)
let adminApp: any = null;
let adminDb: any = null;
let adminAuth: any = null;

// Initialize Firebase Admin safely (only on server-side)
if (typeof window === 'undefined') {
  try {
    const { initializeApp: initializeAdminApp, getApps, cert } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');
    const { getAuth } = require('firebase-admin/auth');

    // Check if already initialized
    if (getApps().length === 0) {
      // Get environment variables
      const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

      if (projectId && privateKey && clientEmail) {
        // Process private key
        let processedPrivateKey = privateKey;
        processedPrivateKey = processedPrivateKey.replace(/^["']|["']$/g, '');
        processedPrivateKey = processedPrivateKey.replace(/\\n/g, '\n');

        // Create service account configuration
        const serviceAccount = {
          type: "service_account",
          project_id: projectId,
          private_key: processedPrivateKey,
          client_email: clientEmail,
        };

        // Initialize Firebase Admin
        adminApp = initializeAdminApp({
          credential: cert(serviceAccount),
          projectId: projectId,
        });

        // Initialize services
        adminDb = getFirestore(adminApp);
        adminAuth = getAuth(adminApp);

        console.log('Firebase Admin initialized successfully in firebase-config');
      } else {
        console.warn('Firebase Admin environment variables not found in firebase-config');
      }
    } else {
      adminApp = getApps()[0];
      adminDb = getFirestore(adminApp);
      adminAuth = getAuth(adminApp);
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin in firebase-config:', error);
  }
}

// Export admin services
export { adminDb, adminAuth, adminApp };

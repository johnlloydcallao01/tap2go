import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin SDK configuration - Only 3 variables needed!
const firebaseAdminConfig: ServiceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
  // Critical: Replace escaped newlines with actual newlines
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
} as ServiceAccount;

// Initialize Firebase Admin (only once)
let adminApp;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(firebaseAdminConfig),
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  }, 'admin');
} else {
  adminApp = getApps().find(app => app.name === 'admin') || getApps()[0];
}

// Initialize Firebase Admin services
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);

export default adminApp;

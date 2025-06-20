import { initializeApp, getApps, cert, ServiceAccount, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

// Firebase Admin configuration with safe initialization
let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

// Initialize Firebase Admin safely
function initializeFirebaseAdmin() {
  try {
    // Check if already initialized
    if (getApps().length > 0) {
      adminApp = getApps().find(app => app.name === 'admin') || getApps()[0];
      adminDb = getFirestore(adminApp);
      adminAuth = getAuth(adminApp);
      return;
    }

    // Get environment variables
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

    // Validate required environment variables
    if (!projectId || !privateKey || !clientEmail) {
      console.warn('Firebase Admin environment variables not found. Admin features will be disabled.');
      return;
    }

    // Process private key
    let processedPrivateKey = privateKey;
    // Remove quotes if present
    processedPrivateKey = processedPrivateKey.replace(/^["']|["']$/g, '');
    // Replace escaped newlines with actual newlines
    processedPrivateKey = processedPrivateKey.replace(/\\n/g, '\n');

    // Create service account configuration
    const serviceAccount: ServiceAccount = {
      type: "service_account",
      project_id: projectId,
      private_key: processedPrivateKey,
      client_email: clientEmail,
    } as ServiceAccount;

    // Initialize Firebase Admin
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId,
    }, 'admin');

    // Initialize services
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    adminApp = null;
    adminDb = null;
    adminAuth = null;
  }
}

// Initialize on module load
initializeFirebaseAdmin();

// Export services
export { adminDb, adminAuth };

// Export db as alias for compatibility
export const db = adminDb;

export default adminApp;

// Firebase configuration for the Tap2Go application
export * from './firebase-config';

// Export SSR-safe functions for Firebase Auth, Storage, and Messaging
// Firestore exports removed - use PayloadCMS with PostgreSQL/Supabase instead
export { getFirebaseAuth, getFirebaseStorage } from './firebase-config';

// Keep only Firebase Auth and Messaging exports for authentication and push notifications
export {
  // Auth types and functions are still available through ./firebase-config
  // Messaging types and functions are still available through ./firebase-config
  // Firestore functions removed - use PayloadCMS collections instead
} from 'firebase/auth';

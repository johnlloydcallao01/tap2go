// Firebase configuration for the Tap2Go application
export * from './firebase-config';

// Export SSR-safe functions
export { getFirebaseAuth, getFirebaseDb, getFirebaseStorage } from './firebase-config';

// Export ALL Firebase Firestore functions to ensure single SDK instance
export {
  // Document and Collection references
  collection,
  doc,

  // Document operations
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,

  // Query operations
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAt,
  startAfter,
  endAt,
  endBefore,

  // Batch operations
  writeBatch,

  // Utilities
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,

  // Types
  Timestamp,
  type Firestore,
  type QueryDocumentSnapshot,
  type DocumentData,
  type WhereFilterOp,
  type Query,
  type CollectionReference,
  type DocumentReference,
  type QuerySnapshot,
  type DocumentSnapshot,
} from 'firebase/firestore';

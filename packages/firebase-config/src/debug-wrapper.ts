/**
 * Professional Firebase Debugging Wrapper
 * Because Firebase error messages are absolute garbage
 */

import { 
  collection as firebaseCollection, 
  doc as firebaseDoc,
  Firestore 
} from 'firebase/firestore';

/**
 * Enhanced collection function with proper debugging
 */
export function collection(firestore: any, path: string, ...pathSegments: string[]) {
  // Professional debugging - let's see what we're actually getting
  console.group('🔥 Firebase Collection Debug');
  console.log('📍 Called from:', new Error().stack?.split('\n')[2]?.trim());
  console.log('🔍 Arguments received:');
  console.log('  - firestore:', {
    type: typeof firestore,
    value: firestore,
    isNull: firestore === null,
    isUndefined: firestore === undefined,
    constructor: firestore?.constructor?.name,
    hasApp: !!firestore?.app,
    hasType: !!firestore?.type,
  });
  console.log('  - path:', path);
  console.log('  - pathSegments:', pathSegments);
  
  // Check if firestore is actually a Firestore instance
  if (!firestore) {
    console.error('❌ FIREBASE ERROR: firestore parameter is null or undefined!');
    console.error('💡 This usually means Firebase wasn\'t initialized properly');
    console.groupEnd();
    throw new Error(`Firebase collection() called with ${firestore === null ? 'null' : 'undefined'} firestore instance. Check Firebase initialization!`);
  }
  
  if (typeof firestore !== 'object') {
    console.error('❌ FIREBASE ERROR: firestore parameter is not an object!');
    console.error('💡 Expected Firestore instance, got:', typeof firestore);
    console.groupEnd();
    throw new Error(`Firebase collection() called with invalid firestore type: ${typeof firestore}. Expected Firestore instance!`);
  }
  
  // Check if it has the expected Firestore properties
  if (!firestore.app && !firestore._delegate) {
    console.error('❌ FIREBASE ERROR: firestore parameter doesn\'t look like a Firestore instance!');
    console.error('💡 Missing expected properties (app or _delegate)');
    console.groupEnd();
    throw new Error('Firebase collection() called with invalid firestore instance. Missing expected Firestore properties!');
  }
  
  console.log('✅ Firestore instance looks valid, calling original collection()');
  console.groupEnd();
  
  try {
    return firebaseCollection(firestore, path, ...pathSegments);
  } catch (error) {
    console.error('❌ FIREBASE COLLECTION ERROR:', error);
    console.error('🔍 Debug info:', {
      firestore: firestore,
      path: path,
      pathSegments: pathSegments,
      firestoreType: typeof firestore,
      firestoreConstructor: firestore?.constructor?.name,
    });
    throw error;
  }
}

/**
 * Enhanced doc function with proper debugging
 */
export function doc(firestore: any, path: string, ...pathSegments: string[]) {
  // Professional debugging
  console.group('🔥 Firebase Doc Debug');
  console.log('📍 Called from:', new Error().stack?.split('\n')[2]?.trim());
  console.log('🔍 Arguments received:');
  console.log('  - firestore:', {
    type: typeof firestore,
    value: firestore,
    isNull: firestore === null,
    isUndefined: firestore === undefined,
    constructor: firestore?.constructor?.name,
  });
  console.log('  - path:', path);
  console.log('  - pathSegments:', pathSegments);
  
  if (!firestore) {
    console.error('❌ FIREBASE ERROR: firestore parameter is null or undefined!');
    console.groupEnd();
    throw new Error(`Firebase doc() called with ${firestore === null ? 'null' : 'undefined'} firestore instance. Check Firebase initialization!`);
  }
  
  console.log('✅ Firestore instance looks valid, calling original doc()');
  console.groupEnd();
  
  try {
    return firebaseDoc(firestore, path, ...pathSegments);
  } catch (error) {
    console.error('❌ FIREBASE DOC ERROR:', error);
    console.error('🔍 Debug info:', {
      firestore: firestore,
      path: path,
      pathSegments: pathSegments,
    });
    throw error;
  }
}

/**
 * Debug Firebase initialization
 */
export function debugFirebaseInit(db: any, context: string = 'unknown') {
  console.group(`🔥 Firebase Init Debug - ${context}`);
  console.log('🔍 Database instance:', {
    type: typeof db,
    value: db,
    isNull: db === null,
    isUndefined: db === undefined,
    constructor: db?.constructor?.name,
    hasApp: !!db?.app,
    hasType: !!db?.type,
    stringValue: String(db),
  });
  
  if (db && typeof db === 'object') {
    console.log('🔍 Database properties:', Object.keys(db));
  }
  
  console.groupEnd();
  return db;
}

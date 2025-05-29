import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from './collections';
import { UserDocument, AdminDocument, AdminActionDocument } from './schema';

// ===== USER OPERATIONS =====

export const createUser = async (
  uid: string, 
  userData: Omit<UserDocument, 'uid' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>
): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  
  const userDoc: UserDocument = {
    uid,
    ...userData,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(userRef, userDoc);
};

export const getUser = async (uid: string): Promise<UserDocument | null> => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserDocument;
  }
  
  return null;
};

export const updateUser = async (
  uid: string, 
  updates: Partial<Omit<UserDocument, 'uid' | 'createdAt'>>
): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const updateUserLastLogin = async (uid: string): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  
  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const addFCMToken = async (uid: string, token: string): Promise<void> => {
  const user = await getUser(uid);
  if (!user) throw new Error('User not found');
  
  const currentTokens = user.fcmTokens || [];
  if (!currentTokens.includes(token)) {
    await updateUser(uid, {
      fcmTokens: [...currentTokens, token]
    });
  }
};

export const removeFCMToken = async (uid: string, token: string): Promise<void> => {
  const user = await getUser(uid);
  if (!user) throw new Error('User not found');
  
  const currentTokens = user.fcmTokens || [];
  await updateUser(uid, {
    fcmTokens: currentTokens.filter(t => t !== token)
  });
};

export const getUsersByRole = async (role: UserDocument['role']): Promise<UserDocument[]> => {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const q = query(usersRef, where('role', '==', role));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as UserDocument);
};

export const searchUsersByEmail = async (email: string): Promise<UserDocument[]> => {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as UserDocument);
};

// ===== ADMIN OPERATIONS =====

export const createAdmin = async (
  uid: string,
  adminData: Omit<AdminDocument, 'createdAt' | 'updatedAt'>
): Promise<void> => {
  const adminRef = doc(db, COLLECTIONS.ADMINS, uid);
  
  const adminDoc: AdminDocument = {
    ...adminData,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(adminRef, adminDoc);
};

export const getAdmin = async (uid: string): Promise<AdminDocument | null> => {
  const adminRef = doc(db, COLLECTIONS.ADMINS, uid);
  const adminSnap = await getDoc(adminRef);
  
  if (adminSnap.exists()) {
    return adminSnap.data() as AdminDocument;
  }
  
  return null;
};

export const updateAdmin = async (
  uid: string,
  updates: Partial<Omit<AdminDocument, 'createdAt'>>
): Promise<void> => {
  const adminRef = doc(db, COLLECTIONS.ADMINS, uid);
  
  await updateDoc(adminRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const getAdminsByDepartment = async (
  department: AdminDocument['department']
): Promise<AdminDocument[]> => {
  const adminsRef = collection(db, COLLECTIONS.ADMINS);
  const q = query(adminsRef, where('department', '==', department));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as AdminDocument);
};

export const getAdminsByAccessLevel = async (
  accessLevel: AdminDocument['accessLevel']
): Promise<AdminDocument[]> => {
  const adminsRef = collection(db, COLLECTIONS.ADMINS);
  const q = query(adminsRef, where('accessLevel', '==', accessLevel));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as AdminDocument);
};

// ===== ADMIN ACTIONS OPERATIONS =====

export const createAdminAction = async (
  adminUid: string,
  actionData: Omit<AdminActionDocument, 'actionId' | 'timestamp'>
): Promise<string> => {
  const actionsRef = collection(db, COLLECTIONS.ADMINS, adminUid, COLLECTIONS.ADMIN_ACTIONS);
  
  const actionDoc: Omit<AdminActionDocument, 'actionId'> = {
    ...actionData,
    timestamp: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(actionsRef, actionDoc);
  
  // Update the document with its own ID
  await updateDoc(docRef, { actionId: docRef.id });
  
  return docRef.id;
};

export const getAdminActions = async (
  adminUid: string,
  actionType?: AdminActionDocument['actionType']
): Promise<AdminActionDocument[]> => {
  const actionsRef = collection(db, COLLECTIONS.ADMINS, adminUid, COLLECTIONS.ADMIN_ACTIONS);
  
  let q = query(actionsRef);
  if (actionType) {
    q = query(actionsRef, where('actionType', '==', actionType));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as AdminActionDocument);
};

// ===== UTILITY FUNCTIONS =====

export const checkUserExists = async (uid: string): Promise<boolean> => {
  const user = await getUser(uid);
  return user !== null;
};

export const checkAdminExists = async (uid: string): Promise<boolean> => {
  const admin = await getAdmin(uid);
  return admin !== null;
};

export const isUserActive = async (uid: string): Promise<boolean> => {
  const user = await getUser(uid);
  return user?.isActive === true;
};

export const isUserVerified = async (uid: string): Promise<boolean> => {
  const user = await getUser(uid);
  return user?.isVerified === true;
};

export const hasAdminPermission = async (
  adminUid: string, 
  permission: string
): Promise<boolean> => {
  const admin = await getAdmin(adminUid);
  return admin?.permissions.includes(permission) === true;
};

// ===== BATCH OPERATIONS =====

export const createUserWithRole = async (
  uid: string,
  email: string,
  role: UserDocument['role'],
  additionalData: Partial<UserDocument> = {}
): Promise<void> => {
  const userData: Omit<UserDocument, 'uid' | 'createdAt' | 'updatedAt' | 'lastLoginAt'> = {
    email,
    role,
    isActive: true,
    isVerified: false,
    ...additionalData,
  };

  await createUser(uid, userData);
};

export const promoteUserToAdmin = async (
  uid: string,
  adminData: Omit<AdminDocument, 'userRef' | 'createdAt' | 'updatedAt'>
): Promise<void> => {
  // Update user role
  await updateUser(uid, { role: 'admin' });
  
  // Create admin document
  await createAdmin(uid, {
    ...adminData,
    userRef: `users/${uid}`,
  });
};

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Order interface for type safety
interface OrderData {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  pricing?: {
    total: number;
  };
  customerId: string;
  [key: string]: unknown;
}

// Admin-specific user operations with elevated privileges

export interface AdminUserDocument {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'customer' | 'vendor' | 'driver' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  profile: {
    avatar?: string;
    dateOfBirth?: Date;
    preferences: {
      notifications: boolean;
      marketing: boolean;
    };
  };
  addresses: Array<{
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    isDefault: boolean;
  }>;
  orderHistory: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Admin function to get all users with pagination
export const adminGetUsers = async (
  limit: number = 50, 
  startAfter?: string,
  role?: string,
  status?: string
): Promise<{ users: AdminUserDocument[]; hasMore: boolean }> => {
  let query = adminDb.collection('users').orderBy('createdAt', 'desc');

  if (role) {
    query = query.where('role', '==', role);
  }

  if (status) {
    query = query.where('status', '==', status);
  }

  if (startAfter) {
    const startAfterDoc = await adminDb.collection('users').doc(startAfter).get();
    query = query.startAfter(startAfterDoc);
  }

  const snapshot = await query.limit(limit + 1).get();
  const users = snapshot.docs.slice(0, limit).map((doc) => ({
    uid: doc.id,
    ...doc.data()
  } as AdminUserDocument));

  return {
    users,
    hasMore: snapshot.docs.length > limit
  };
};

// Admin function to suspend a user
export const adminSuspendUser = async (userUid: string, adminUid: string, reason: string): Promise<void> => {
  const userRef = adminDb.collection('users').doc(userUid);
  
  await userRef.update({
    status: 'suspended',
    suspendedAt: FieldValue.serverTimestamp(),
    suspendedBy: adminUid,
    suspensionReason: reason,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Disable the user account in Firebase Auth
  await adminAuth.updateUser(userUid, { disabled: true });
};

// Admin function to ban a user
export const adminBanUser = async (userUid: string, adminUid: string, reason: string): Promise<void> => {
  const userRef = adminDb.collection('users').doc(userUid);
  
  await userRef.update({
    status: 'banned',
    bannedAt: FieldValue.serverTimestamp(),
    bannedBy: adminUid,
    banReason: reason,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Disable the user account in Firebase Auth
  await adminAuth.updateUser(userUid, { disabled: true });
};

// Admin function to reactivate a user
export const adminReactivateUser = async (userUid: string, adminUid: string): Promise<void> => {
  const userRef = adminDb.collection('users').doc(userUid);
  
  await userRef.update({
    status: 'active',
    reactivatedAt: FieldValue.serverTimestamp(),
    reactivatedBy: adminUid,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Enable the user account in Firebase Auth
  await adminAuth.updateUser(userUid, { disabled: false });
};

// Admin function to update user role
export const adminUpdateUserRole = async (userUid: string, newRole: string, adminUid: string): Promise<void> => {
  const userRef = adminDb.collection('users').doc(userUid);
  
  await userRef.update({
    role: newRole,
    roleUpdatedBy: adminUid,
    roleUpdatedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update custom claims
  await adminAuth.setCustomUserClaims(userUid, { role: newRole });
};

// Admin function to get user analytics
export const adminGetUserAnalytics = async (): Promise<{
  total: number;
  byRole: {
    customers: number;
    vendors: number;
    drivers: number;
    admins: number;
  };
  byStatus: {
    active: number;
    suspended: number;
    banned: number;
  };
}> => {
  const usersRef = adminDb.collection('users');
  
  const [
    totalSnapshot,
    customersSnapshot,
    vendorsSnapshot,
    driversSnapshot,
    adminsSnapshot,
    activeSnapshot,
    suspendedSnapshot
  ] = await Promise.all([
    usersRef.get(),
    usersRef.where('role', '==', 'customer').get(),
    usersRef.where('role', '==', 'vendor').get(),
    usersRef.where('role', '==', 'driver').get(),
    usersRef.where('role', '==', 'admin').get(),
    usersRef.where('status', '==', 'active').get(),
    usersRef.where('status', '==', 'suspended').get(),
  ]);

  return {
    total: totalSnapshot.size,
    byRole: {
      customers: customersSnapshot.size,
      vendors: vendorsSnapshot.size,
      drivers: driversSnapshot.size,
      admins: adminsSnapshot.size
    },
    byStatus: {
      active: activeSnapshot.size,
      suspended: suspendedSnapshot.size,
      banned: totalSnapshot.size - activeSnapshot.size - suspendedSnapshot.size
    }
  };
};

// Admin function to search users
export const adminSearchUsers = async (searchTerm: string, limit: number = 20): Promise<AdminUserDocument[]> => {
  // Note: This is a basic implementation. For production, consider using Algolia or similar
  const usersSnapshot = await adminDb.collection('users')
    .where('email', '>=', searchTerm.toLowerCase())
    .where('email', '<=', searchTerm.toLowerCase() + '\uf8ff')
    .limit(limit)
    .get();

  return usersSnapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data()
  } as AdminUserDocument));
};

// Admin function to get user details with order history
export const adminGetUserDetails = async (userUid: string): Promise<{
  user: { uid: string; [key: string]: unknown };
  orderHistory: {
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    recentOrders: OrderData[];
  };
}> => {
  const [userDoc, ordersSnapshot] = await Promise.all([
    adminDb.collection('users').doc(userUid).get(),
    adminDb.collection('orders').where('customerId', '==', userUid).orderBy('createdAt', 'desc').get()
  ]);

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const orders: OrderData[] = ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  } as OrderData));
  const totalSpent = orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
  const completedOrders = orders.filter(order => order.status === 'delivered');

  return {
    user: { uid: userDoc.id, ...userDoc.data() },
    orderHistory: {
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalSpent,
      averageOrderValue: completedOrders.length > 0 ? totalSpent / completedOrders.length : 0,
      recentOrders: orders.slice(0, 10)
    }
  };
};

// Admin function to create admin user
export const adminCreateAdminUser = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string,
  createdByAdminUid: string
): Promise<string> => {
  // Create user in Firebase Auth
  const userRecord = await adminAuth.createUser({
    email,
    password,
    emailVerified: true,
  });

  // Set admin custom claims
  await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'admin' });

  // Create user document in Firestore
  await adminDb.collection('users').doc(userRecord.uid).set({
    email,
    firstName,
    lastName,
    role: 'admin',
    status: 'active',
    profile: {
      preferences: {
        notifications: true,
        marketing: false
      }
    },
    addresses: [],
    orderHistory: {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: createdByAdminUid
  });

  return userRecord.uid;
};

// Admin function for bulk user operations
export const adminBulkUpdateUsers = async (userUids: string[], updates: Record<string, unknown>): Promise<void> => {
  const batch = adminDb.batch();
  
  userUids.forEach(uid => {
    const userRef = adminDb.collection('users').doc(uid);
    batch.update(userRef, {
      ...updates,
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
};

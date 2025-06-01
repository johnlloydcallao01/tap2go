import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Order interface for type safety
interface OrderDocument {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  driverEarnings?: number;
  vendorId: string;
  customerId: string;
  driverId?: string;
  total?: number;
  createdAt: Date;
  [key: string]: unknown;
}

// Admin-specific driver operations with elevated privileges

export interface AdminDriverDocument {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  vehicleType: 'motorcycle' | 'bicycle' | 'car';
  licenseNumber: string;
  vehicleRegistration: string;
  documents: {
    license: string;
    registration: string;
    insurance: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  earnings: {
    total: number;
    pending: number;
    paid: number;
  };
  ratings: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

// Admin function to approve a driver
export const adminApproveDriver = async (driverUid: string, adminUid: string): Promise<void> => {
  const driverRef = adminDb.collection('drivers').doc(driverUid);
  
  await driverRef.update({
    status: 'approved',
    approvedAt: FieldValue.serverTimestamp(),
    approvedBy: adminUid,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Set custom claims for the driver
  await adminAuth.setCustomUserClaims(driverUid, { 
    role: 'driver',
    status: 'approved' 
  });
};

// Admin function to reject a driver
export const adminRejectDriver = async (driverUid: string, adminUid: string, reason?: string): Promise<void> => {
  const driverRef = adminDb.collection('drivers').doc(driverUid);
  
  await driverRef.update({
    status: 'rejected',
    rejectedAt: FieldValue.serverTimestamp(),
    rejectedBy: adminUid,
    rejectionReason: reason || 'Application rejected',
    updatedAt: FieldValue.serverTimestamp(),
  });
};

// Admin function to suspend a driver
export const adminSuspendDriver = async (driverUid: string, adminUid: string, reason?: string): Promise<void> => {
  const driverRef = adminDb.collection('drivers').doc(driverUid);
  
  await driverRef.update({
    status: 'suspended',
    suspendedAt: FieldValue.serverTimestamp(),
    suspendedBy: adminUid,
    suspensionReason: reason || 'Driver suspended',
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update custom claims
  await adminAuth.setCustomUserClaims(driverUid, { 
    role: 'driver',
    status: 'suspended' 
  });
};

// Admin function to get driver financial data
export const adminGetDriverFinancials = async (driverUid: string): Promise<{
  driver: { id: string; [key: string]: unknown };
  financials: {
    totalEarnings: number;
    completedOrders: number;
    averageEarningsPerOrder: number;
    orders: OrderDocument[];
  };
}> => {
  const driverRef = adminDb.collection('drivers').doc(driverUid);
  const ordersRef = adminDb.collection('orders').where('driverId', '==', driverUid);
  
  const [driverDoc, ordersSnapshot] = await Promise.all([
    driverRef.get(),
    ordersRef.get()
  ]);

  if (!driverDoc.exists) {
    throw new Error('Driver not found');
  }

  const orders: OrderDocument[] = ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  } as OrderDocument));
  const totalEarnings = orders.reduce((sum, order) => sum + (order.driverEarnings || 0), 0);
  const completedOrders = orders.filter(order => order.status === 'delivered').length;

  return {
    driver: { id: driverDoc.id, ...driverDoc.data() },
    financials: {
      totalEarnings,
      completedOrders,
      averageEarningsPerOrder: completedOrders > 0 ? totalEarnings / completedOrders : 0,
      orders: orders
    }
  };
};

// Admin function to get all pending drivers
export const adminGetPendingDrivers = async (): Promise<AdminDriverDocument[]> => {
  const snapshot = await adminDb.collection('drivers')
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data()
  } as AdminDriverDocument));
};

// Admin function to get driver analytics
export const adminGetDriverAnalytics = async (): Promise<{
  total: number;
  pending: number;
  approved: number;
  suspended: number;
  rejectedCount: number;
}> => {
  const driversRef = adminDb.collection('drivers');
  
  const [totalSnapshot, pendingSnapshot, approvedSnapshot, suspendedSnapshot] = await Promise.all([
    driversRef.get(),
    driversRef.where('status', '==', 'pending').get(),
    driversRef.where('status', '==', 'approved').get(),
    driversRef.where('status', '==', 'suspended').get(),
  ]);

  return {
    total: totalSnapshot.size,
    pending: pendingSnapshot.size,
    approved: approvedSnapshot.size,
    suspended: suspendedSnapshot.size,
    rejectedCount: totalSnapshot.size - pendingSnapshot.size - approvedSnapshot.size - suspendedSnapshot.size
  };
};

// Admin function for bulk operations
export const adminBulkUpdateDrivers = async (driverUids: string[], updates: Partial<AdminDriverDocument>): Promise<void> => {
  const batch = adminDb.batch();
  
  driverUids.forEach(uid => {
    const driverRef = adminDb.collection('drivers').doc(uid);
    batch.update(driverRef, {
      ...updates,
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
};

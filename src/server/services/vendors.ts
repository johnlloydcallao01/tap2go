import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Order interface for type safety
interface OrderData {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  vendorEarnings?: number;
  platformCommission?: number;
  total?: number;
  vendorId: string;
  customerId: string;
  driverId?: string;
  [key: string]: any;
}

// Admin-specific vendor operations with elevated privileges

export interface AdminVendorDocument {
  uid: string;
  email: string;
  businessName: string;
  ownerName: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  businessType: 'restaurant' | 'grocery' | 'pharmacy' | 'other';
  documents: {
    businessLicense: string;
    foodLicense: string;
    taxId: string;
  };
  revenue: {
    total: number;
    pending: number;
    paid: number;
    commission: number;
  };
  ratings: {
    average: number;
    count: number;
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

// Admin function to approve a vendor
export const adminApproveVendor = async (vendorUid: string, adminUid: string): Promise<void> => {
  const vendorRef = adminDb.collection('vendors').doc(vendorUid);
  
  await vendorRef.update({
    status: 'approved',
    approvedAt: FieldValue.serverTimestamp(),
    approvedBy: adminUid,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Set custom claims for the vendor
  await adminAuth.setCustomUserClaims(vendorUid, { 
    role: 'vendor',
    status: 'approved' 
  });
};

// Admin function to reject a vendor
export const adminRejectVendor = async (vendorUid: string, adminUid: string, reason?: string): Promise<void> => {
  const vendorRef = adminDb.collection('vendors').doc(vendorUid);
  
  await vendorRef.update({
    status: 'rejected',
    rejectedAt: FieldValue.serverTimestamp(),
    rejectedBy: adminUid,
    rejectionReason: reason || 'Application rejected',
    updatedAt: FieldValue.serverTimestamp(),
  });
};

// Admin function to suspend a vendor
export const adminSuspendVendor = async (vendorUid: string, adminUid: string, reason?: string): Promise<void> => {
  const vendorRef = adminDb.collection('vendors').doc(vendorUid);
  
  await vendorRef.update({
    status: 'suspended',
    suspendedAt: FieldValue.serverTimestamp(),
    suspendedBy: adminUid,
    suspensionReason: reason || 'Vendor suspended',
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Update custom claims
  await adminAuth.setCustomUserClaims(vendorUid, { 
    role: 'vendor',
    status: 'suspended' 
  });
};

// Admin function to get vendor financial data
export const adminGetVendorFinancials = async (vendorUid: string): Promise<any> => {
  const vendorRef = adminDb.collection('vendors').doc(vendorUid);
  const ordersRef = adminDb.collection('orders').where('vendorId', '==', vendorUid);
  
  const [vendorDoc, ordersSnapshot] = await Promise.all([
    vendorRef.get(),
    ordersRef.get()
  ]);

  if (!vendorDoc.exists) {
    throw new Error('Vendor not found');
  }

  const orders: OrderData[] = ordersSnapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data()
  } as OrderData));
  const totalRevenue = orders.reduce((sum, order) => sum + (order.vendorEarnings || 0), 0);
  const totalCommission = orders.reduce((sum, order) => sum + (order.platformCommission || 0), 0);
  const completedOrders = orders.filter(order => order.status === 'delivered').length;

  return {
    vendor: { id: vendorDoc.id, ...vendorDoc.data() },
    financials: {
      totalRevenue,
      totalCommission,
      netEarnings: totalRevenue - totalCommission,
      completedOrders,
      averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0,
      orders: orders
    }
  };
};

// Admin function to calculate platform commission
export const adminCalculatePlatformRevenue = async (): Promise<any> => {
  const ordersSnapshot = await adminDb.collection('orders')
    .where('status', '==', 'delivered')
    .get();

  const orders: OrderData[] = ordersSnapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data()
  } as OrderData));

  const totalCommission = orders.reduce((sum, order) => sum + (order.platformCommission || 0), 0);
  const totalOrderValue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;

  return {
    totalCommission,
    totalOrderValue,
    totalOrders,
    averageCommissionRate: totalOrderValue > 0 ? (totalCommission / totalOrderValue) * 100 : 0,
    averageOrderValue: totalOrders > 0 ? totalOrderValue / totalOrders : 0
  };
};

// Admin function to get all pending vendors
export const adminGetPendingVendors = async (): Promise<AdminVendorDocument[]> => {
  const snapshot = await adminDb.collection('vendors')
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc: any) => ({
    uid: doc.id,
    ...doc.data()
  } as AdminVendorDocument));
};

// Admin function to get vendor analytics
export const adminGetVendorAnalytics = async (): Promise<any> => {
  const vendorsRef = adminDb.collection('vendors');
  
  const [totalSnapshot, pendingSnapshot, approvedSnapshot, suspendedSnapshot] = await Promise.all([
    vendorsRef.get(),
    vendorsRef.where('status', '==', 'pending').get(),
    vendorsRef.where('status', '==', 'approved').get(),
    vendorsRef.where('status', '==', 'suspended').get(),
  ]);

  return {
    total: totalSnapshot.size,
    pending: pendingSnapshot.size,
    approved: approvedSnapshot.size,
    suspended: suspendedSnapshot.size,
    rejectedCount: totalSnapshot.size - pendingSnapshot.size - approvedSnapshot.size - suspendedSnapshot.size
  };
};

// Admin function to update vendor commission rate
export const adminUpdateVendorCommission = async (vendorUid: string, commissionRate: number): Promise<void> => {
  const vendorRef = adminDb.collection('vendors').doc(vendorUid);
  
  await vendorRef.update({
    commissionRate: commissionRate,
    updatedAt: FieldValue.serverTimestamp(),
  });
};

// Admin function for bulk vendor operations
export const adminBulkUpdateVendors = async (vendorUids: string[], updates: Partial<AdminVendorDocument>): Promise<void> => {
  const batch = adminDb.batch();
  
  vendorUids.forEach(uid => {
    const vendorRef = adminDb.collection('vendors').doc(uid);
    batch.update(vendorRef, {
      ...updates,
      updatedAt: FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
};

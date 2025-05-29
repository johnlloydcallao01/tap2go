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
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from './collections';
import {
  VendorDocument,
  VendorDocumentDocument,
  VendorAnalyticsDocument,
  VendorPayoutDocument
} from './schema';

// ===== VENDOR OPERATIONS =====

export const createVendor = async (
  uid: string,
  vendorData: Omit<VendorDocument, 'createdAt' | 'updatedAt'>
): Promise<void> => {
  const vendorRef = doc(db, COLLECTIONS.VENDORS, uid);

  const vendorDoc: VendorDocument = {
    ...vendorData,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(vendorRef, vendorDoc);
};

export const getVendor = async (uid: string): Promise<VendorDocument | null> => {
  const vendorRef = doc(db, COLLECTIONS.VENDORS, uid);
  const vendorSnap = await getDoc(vendorRef);

  if (vendorSnap.exists()) {
    return vendorSnap.data() as unknown as VendorDocument;
  }

  return null;
};

export const updateVendor = async (
  uid: string,
  updates: Partial<Omit<VendorDocument, 'createdAt'>>
): Promise<void> => {
  const vendorRef = doc(db, COLLECTIONS.VENDORS, uid);

  await updateDoc(vendorRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const approveVendor = async (
  vendorUid: string,
  approvedBy: string
): Promise<void> => {
  await updateVendor(vendorUid, {
    status: 'approved',
    approvalDate: serverTimestamp() as Timestamp,
    approvedBy,
  });
};

export const rejectVendor = async (
  vendorUid: string,
  rejectionReason: string
): Promise<void> => {
  await updateVendor(vendorUid, {
    status: 'rejected',
    rejectionReason,
  });
};

export const suspendVendor = async (
  vendorUid: string,
  reason: string
): Promise<void> => {
  await updateVendor(vendorUid, {
    status: 'suspended',
    rejectionReason: reason,
  });
};

export const getVendorsByStatus = async (
  status: VendorDocument['status']
): Promise<VendorDocument[]> => {
  const vendorsRef = collection(db, COLLECTIONS.VENDORS);
  const q = query(vendorsRef, where('status', '==', status));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    uid: doc.id
  })) as unknown as VendorDocument[];
};

export const getPendingVendors = async (): Promise<VendorDocument[]> => {
  return getVendorsByStatus('pending');
};

export const getActiveVendors = async (): Promise<VendorDocument[]> => {
  return getVendorsByStatus('active');
};

export const getTopVendorsByRating = async (limitCount = 10): Promise<VendorDocument[]> => {
  const vendorsRef = collection(db, COLLECTIONS.VENDORS);
  const q = query(
    vendorsRef,
    where('status', '==', 'active'),
    orderBy('averageRating', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    uid: doc.id
  })) as unknown as VendorDocument[];
};

export const getTopVendorsByOrders = async (limitCount = 10): Promise<VendorDocument[]> => {
  const vendorsRef = collection(db, COLLECTIONS.VENDORS);
  const q = query(
    vendorsRef,
    where('status', '==', 'active'),
    orderBy('totalOrders', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    uid: doc.id
  })) as unknown as VendorDocument[];
};

// ===== VENDOR DOCUMENTS OPERATIONS =====

export const uploadVendorDocument = async (
  vendorUid: string,
  documentData: Omit<VendorDocumentDocument, 'documentId' | 'uploadedAt'>
): Promise<string> => {
  const documentsRef = collection(db, COLLECTIONS.VENDORS, vendorUid, COLLECTIONS.VENDOR_DOCUMENTS);

  const documentDoc: Omit<VendorDocumentDocument, 'documentId'> = {
    ...documentData,
    uploadedAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(documentsRef, documentDoc);

  // Update the document with its own ID
  await updateDoc(docRef, { documentId: docRef.id });

  return docRef.id;
};

export const getVendorDocuments = async (
  vendorUid: string,
  documentType?: VendorDocumentDocument['documentType']
): Promise<VendorDocumentDocument[]> => {
  const documentsRef = collection(db, COLLECTIONS.VENDORS, vendorUid, COLLECTIONS.VENDOR_DOCUMENTS);

  let q = query(documentsRef);
  if (documentType) {
    q = query(documentsRef, where('documentType', '==', documentType));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as unknown as VendorDocumentDocument);
};

export const approveVendorDocument = async (
  vendorUid: string,
  documentId: string,
  reviewedBy: string
): Promise<void> => {
  const documentRef = doc(db, COLLECTIONS.VENDORS, vendorUid, COLLECTIONS.VENDOR_DOCUMENTS, documentId);

  await updateDoc(documentRef, {
    status: 'approved',
    reviewedBy,
    reviewedAt: serverTimestamp(),
  });
};

export const rejectVendorDocument = async (
  vendorUid: string,
  documentId: string,
  reviewedBy: string,
  rejectionReason: string
): Promise<void> => {
  const documentRef = doc(db, COLLECTIONS.VENDORS, vendorUid, COLLECTIONS.VENDOR_DOCUMENTS, documentId);

  await updateDoc(documentRef, {
    status: 'rejected',
    reviewedBy,
    reviewedAt: serverTimestamp(),
    rejectionReason,
  });
};

// ===== VENDOR ANALYTICS OPERATIONS =====

export const createVendorAnalytics = async (
  vendorUid: string,
  analyticsData: Omit<VendorAnalyticsDocument, 'createdAt'>
): Promise<string> => {
  const analyticsRef = collection(db, COLLECTIONS.VENDORS, vendorUid, COLLECTIONS.VENDOR_ANALYTICS);

  const analyticsDoc: VendorAnalyticsDocument = {
    ...analyticsData,
    createdAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(analyticsRef, analyticsDoc);
  return docRef.id;
};

export const getVendorAnalytics = async (
  vendorUid: string,
  period: VendorAnalyticsDocument['period'],
  startDate?: string,
  endDate?: string
): Promise<VendorAnalyticsDocument[]> => {
  const analyticsRef = collection(db, COLLECTIONS.VENDORS, vendorUid, COLLECTIONS.VENDOR_ANALYTICS);

  let q = query(analyticsRef, where('period', '==', period));

  if (startDate && endDate) {
    q = query(q, where('date', '>=', startDate), where('date', '<=', endDate));
  }

  q = query(q, orderBy('date', 'desc'));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as unknown as VendorAnalyticsDocument);
};

export const getLatestVendorAnalytics = async (
  vendorUid: string,
  period: VendorAnalyticsDocument['period']
): Promise<VendorAnalyticsDocument | null> => {
  const analyticsRef = collection(db, COLLECTIONS.VENDORS, vendorUid, COLLECTIONS.VENDOR_ANALYTICS);

  const q = query(
    analyticsRef,
    where('period', '==', period),
    orderBy('date', 'desc'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  return querySnapshot.docs[0].data() as unknown as VendorAnalyticsDocument;
};

// ===== VENDOR PAYOUTS OPERATIONS =====

export const createVendorPayout = async (
  vendorUid: string,
  payoutData: Omit<VendorPayoutDocument, 'payoutId' | 'createdAt'>
): Promise<string> => {
  const payoutsRef = collection(db, COLLECTIONS.VENDORS, vendorUid, COLLECTIONS.VENDOR_PAYOUTS);

  const payoutDoc: Omit<VendorPayoutDocument, 'payoutId'> = {
    ...payoutData,
    createdAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(payoutsRef, payoutDoc);

  // Update the document with its own ID
  await updateDoc(docRef, { payoutId: docRef.id });

  return docRef.id;
};

export const getVendorPayouts = async (
  vendorUid: string,
  status?: VendorPayoutDocument['status']
): Promise<VendorPayoutDocument[]> => {
  const payoutsRef = collection(db, COLLECTIONS.VENDORS, vendorUid, COLLECTIONS.VENDOR_PAYOUTS);

  let q = query(payoutsRef, orderBy('createdAt', 'desc'));
  if (status) {
    q = query(payoutsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as unknown as VendorPayoutDocument);
};

export const updatePayoutStatus = async (
  vendorUid: string,
  payoutId: string,
  status: VendorPayoutDocument['status'],
  transactionId?: string
): Promise<void> => {
  const payoutRef = doc(db, COLLECTIONS.VENDORS, vendorUid, COLLECTIONS.VENDOR_PAYOUTS, payoutId);

  const updates: any = { status };

  if (transactionId) {
    updates.transactionId = transactionId;
  }

  if (status === 'completed') {
    updates.processedAt = serverTimestamp();
  }

  await updateDoc(payoutRef, updates);
};

// ===== UTILITY FUNCTIONS =====

export const updateVendorStats = async (
  vendorUid: string,
  orderValue: number,
  rating?: number
): Promise<void> => {
  const vendor = await getVendor(vendorUid);
  if (!vendor) throw new Error('Vendor not found');

  const updates: Partial<VendorDocument> = {
    totalOrders: vendor.totalOrders + 1,
    totalEarnings: vendor.totalEarnings + orderValue,
  };

  if (rating) {
    const newTotalReviews = vendor.totalReviews + 1;
    const newAverageRating =
      (vendor.averageRating * vendor.totalReviews + rating) / newTotalReviews;

    updates.averageRating = newAverageRating;
    updates.totalReviews = newTotalReviews;
  }

  await updateVendor(vendorUid, updates);
};

export const isVendorActive = async (vendorUid: string): Promise<boolean> => {
  const vendor = await getVendor(vendorUid);
  return vendor?.status === 'active';
};

export const getVendorCommissionRate = async (vendorUid: string): Promise<number> => {
  const vendor = await getVendor(vendorUid);
  return vendor?.commissionRate || 15; // Default 15%
};

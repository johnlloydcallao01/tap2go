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
  DriverDocument,
  DriverEarningsDocument,
  DriverReviewDocument,
  DriverDeliveryHistoryDocument
} from './schema';

// ===== DRIVER OPERATIONS =====

export const createDriver = async (
  uid: string,
  driverData: Omit<DriverDocument, 'createdAt' | 'updatedAt'>
): Promise<void> => {
  const driverRef = doc(db, COLLECTIONS.DRIVERS, uid);
  
  const driverDoc: DriverDocument = {
    ...driverData,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(driverRef, driverDoc);
};

export const getDriver = async (uid: string): Promise<DriverDocument | null> => {
  const driverRef = doc(db, COLLECTIONS.DRIVERS, uid);
  const driverSnap = await getDoc(driverRef);
  
  if (driverSnap.exists()) {
    return driverSnap.data() as DriverDocument;
  }
  return null;
};

export const updateDriver = async (
  uid: string,
  updates: Partial<DriverDocument>
): Promise<void> => {
  const driverRef = doc(db, COLLECTIONS.DRIVERS, uid);
  await updateDoc(driverRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const approveDriver = async (
  driverUid: string,
  approvedBy: string
): Promise<void> => {
  await updateDriver(driverUid, {
    status: 'active',
    verificationStatus: 'verified',
    approvedBy,
    approvedAt: serverTimestamp() as Timestamp,
  });
};

export const rejectDriver = async (
  driverUid: string,
  rejectionReason: string
): Promise<void> => {
  await updateDriver(driverUid, {
    status: 'rejected',
    verificationStatus: 'rejected',
  });
};

export const suspendDriver = async (
  driverUid: string,
  reason: string
): Promise<void> => {
  await updateDriver(driverUid, {
    status: 'suspended',
  });
};

export const getDriversByStatus = async (
  status: DriverDocument['status']
): Promise<DriverDocument[]> => {
  const driversRef = collection(db, COLLECTIONS.DRIVERS);
  const q = query(driversRef, where('status', '==', status));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    uid: doc.id
  })) as DriverDocument[];
};

export const getPendingDrivers = async (): Promise<DriverDocument[]> => {
  return getDriversByStatus('pending_approval');
};

export const getActiveDrivers = async (): Promise<DriverDocument[]> => {
  return getDriversByStatus('active');
};

export const getAvailableDrivers = async (): Promise<DriverDocument[]> => {
  const driversRef = collection(db, COLLECTIONS.DRIVERS);
  const q = query(
    driversRef,
    where('status', '==', 'active'),
    where('isOnline', '==', true),
    where('isAvailable', '==', true)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    uid: doc.id
  })) as DriverDocument[];
};

export const getTopDriversByRating = async (limitCount = 10): Promise<DriverDocument[]> => {
  const driversRef = collection(db, COLLECTIONS.DRIVERS);
  const q = query(
    driversRef,
    where('status', '==', 'active'),
    orderBy('avgRating', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    uid: doc.id
  })) as DriverDocument[];
};

export const updateDriverLocation = async (
  driverUid: string,
  location: { latitude: number; longitude: number }
): Promise<void> => {
  await updateDriver(driverUid, {
    currentLocation: location,
    lastActiveAt: serverTimestamp() as Timestamp,
  });
};

export const setDriverOnlineStatus = async (
  driverUid: string,
  isOnline: boolean
): Promise<void> => {
  await updateDriver(driverUid, {
    isOnline,
    lastActiveAt: serverTimestamp() as Timestamp,
  });
};

export const setDriverAvailability = async (
  driverUid: string,
  isAvailable: boolean
): Promise<void> => {
  await updateDriver(driverUid, {
    isAvailable,
    lastActiveAt: serverTimestamp() as Timestamp,
  });
};

// ===== DRIVER EARNINGS OPERATIONS =====

export const addDriverEarnings = async (
  driverUid: string,
  earningsData: Omit<DriverEarningsDocument, 'date'>
): Promise<void> => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const earningsRef = doc(db, COLLECTIONS.DRIVERS, driverUid, COLLECTIONS.DRIVER_EARNINGS, today);
  
  await setDoc(earningsRef, {
    ...earningsData,
    date: today,
  });
};

export const getDriverEarnings = async (
  driverUid: string,
  date: string
): Promise<DriverEarningsDocument | null> => {
  const earningsRef = doc(db, COLLECTIONS.DRIVERS, driverUid, COLLECTIONS.DRIVER_EARNINGS, date);
  const earningsSnap = await getDoc(earningsRef);
  
  if (earningsSnap.exists()) {
    return earningsSnap.data() as DriverEarningsDocument;
  }
  return null;
};

export const getDriverEarningsHistory = async (
  driverUid: string,
  limitCount = 30
): Promise<DriverEarningsDocument[]> => {
  const earningsRef = collection(db, COLLECTIONS.DRIVERS, driverUid, COLLECTIONS.DRIVER_EARNINGS);
  const q = query(earningsRef, orderBy('date', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as DriverEarningsDocument);
};

// ===== DRIVER REVIEWS OPERATIONS =====

export const addDriverReview = async (
  driverUid: string,
  reviewData: Omit<DriverReviewDocument, 'reviewId' | 'createdAt'>
): Promise<string> => {
  const reviewsRef = collection(db, COLLECTIONS.DRIVERS, driverUid, COLLECTIONS.DRIVER_REVIEWS);
  
  const reviewDoc = await addDoc(reviewsRef, {
    ...reviewData,
    reviewId: '', // Will be set to doc.id after creation
    createdAt: serverTimestamp(),
  });

  // Update the reviewId with the actual document ID
  await updateDoc(reviewDoc, { reviewId: reviewDoc.id });
  
  return reviewDoc.id;
};

export const getDriverReviews = async (
  driverUid: string,
  limitCount = 50
): Promise<DriverReviewDocument[]> => {
  const reviewsRef = collection(db, COLLECTIONS.DRIVERS, driverUid, COLLECTIONS.DRIVER_REVIEWS);
  const q = query(reviewsRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as DriverReviewDocument);
};

// ===== DRIVER DELIVERY HISTORY OPERATIONS =====

export const addDriverDelivery = async (
  driverUid: string,
  deliveryData: Omit<DriverDeliveryHistoryDocument, 'deliveryId'>
): Promise<string> => {
  const deliveryRef = collection(db, COLLECTIONS.DRIVERS, driverUid, COLLECTIONS.DRIVER_DELIVERY_HISTORY);
  
  const deliveryDoc = await addDoc(deliveryRef, {
    ...deliveryData,
    deliveryId: '', // Will be set to doc.id after creation
  });

  // Update the deliveryId with the actual document ID
  await updateDoc(deliveryDoc, { deliveryId: deliveryDoc.id });
  
  return deliveryDoc.id;
};

export const getDriverDeliveryHistory = async (
  driverUid: string,
  limitCount = 100
): Promise<DriverDeliveryHistoryDocument[]> => {
  const deliveryRef = collection(db, COLLECTIONS.DRIVERS, driverUid, COLLECTIONS.DRIVER_DELIVERY_HISTORY);
  const q = query(deliveryRef, orderBy('deliveredAt', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as DriverDeliveryHistoryDocument);
};

export const updateDeliveryStatus = async (
  driverUid: string,
  deliveryId: string,
  status: DriverDeliveryHistoryDocument['status'],
  deliveredAt?: Timestamp
): Promise<void> => {
  const deliveryRef = doc(db, COLLECTIONS.DRIVERS, driverUid, COLLECTIONS.DRIVER_DELIVERY_HISTORY, deliveryId);
  
  const updates: any = { status };
  if (deliveredAt) {
    updates.deliveredAt = deliveredAt;
  }
  
  await updateDoc(deliveryRef, updates);
};

// ===== UTILITY FUNCTIONS =====

export const checkDriverExists = async (uid: string): Promise<boolean> => {
  const driver = await getDriver(uid);
  return driver !== null;
};

export const getDriverStats = async (driverUid: string) => {
  const driver = await getDriver(driverUid);
  if (!driver) return null;

  const today = new Date().toISOString().split('T')[0];
  const todayEarnings = await getDriverEarnings(driverUid, today);
  const recentReviews = await getDriverReviews(driverUid, 10);

  return {
    totalDeliveries: driver.totalDeliveries,
    totalEarnings: driver.totalEarnings,
    avgRating: driver.avgRating || 0,
    todayEarnings: todayEarnings?.totalEarnings || 0,
    recentReviews: recentReviews.length,
    isOnline: driver.isOnline,
    isAvailable: driver.isAvailable,
  };
};

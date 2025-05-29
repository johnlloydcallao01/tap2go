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
import { OrderDocument } from './schema';

// ===== ORDER OPERATIONS =====

export const createOrder = async (
  orderData: Omit<OrderDocument, 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);

  const orderDoc: OrderDocument = {
    ...orderData,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(ordersRef, orderDoc);
  return docRef.id;
};

export const getOrder = async (orderId: string): Promise<OrderDocument | null> => {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  const orderSnap = await getDoc(orderRef);

  if (orderSnap.exists()) {
    return { ...orderSnap.data(), id: orderSnap.id } as unknown as OrderDocument;
  }
  return null;
};

export const updateOrder = async (
  orderId: string,
  updates: Partial<OrderDocument>
): Promise<void> => {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await updateDoc(orderRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderDocument['status'],
  additionalData?: Partial<OrderDocument>
): Promise<void> => {
  const updates: Partial<OrderDocument> = {
    status,
    ...additionalData,
  };

  // Add timestamp based on status
  switch (status) {
    case 'confirmed':
      updates.confirmedAt = serverTimestamp() as Timestamp;
      break;
    case 'ready_for_pickup':
      updates.readyAt = serverTimestamp() as Timestamp;
      break;
    case 'picked_up':
      updates.pickedUpAt = serverTimestamp() as Timestamp;
      break;
    case 'delivered':
      updates.deliveredAt = serverTimestamp() as Timestamp;
      break;
    case 'cancelled':
      updates.cancelledAt = serverTimestamp() as Timestamp;
      break;
  }

  await updateOrder(orderId, updates);
};

export const addTrackingUpdate = async (
  orderId: string,
  trackingUpdate: {
    status: string;
    message?: string;
    location?: { latitude: number; longitude: number };
  }
): Promise<void> => {
  const order = await getOrder(orderId);
  if (!order) throw new Error('Order not found');

  const newTrackingUpdate = {
    ...trackingUpdate,
    timestamp: serverTimestamp() as Timestamp,
  };

  const updatedTrackingUpdates = [...order.trackingUpdates, newTrackingUpdate];

  await updateOrder(orderId, {
    trackingUpdates: updatedTrackingUpdates,
  });
};

export const assignDriverToOrder = async (
  orderId: string,
  driverUid: string
): Promise<void> => {
  await updateOrder(orderId, {
    driverRef: `drivers/${driverUid}`,
  });

  // Add tracking update
  await addTrackingUpdate(orderId, {
    status: 'driver_assigned',
    message: 'Driver has been assigned to your order',
  });
};

export const cancelOrder = async (
  orderId: string,
  cancelledBy: OrderDocument['cancelledBy'],
  cancellationReason: string
): Promise<void> => {
  await updateOrderStatus(orderId, 'cancelled', {
    cancelledBy,
    cancellationReason,
  });

  // Add tracking update
  await addTrackingUpdate(orderId, {
    status: 'cancelled',
    message: `Order cancelled by ${cancelledBy}: ${cancellationReason}`,
  });
};

// ===== ORDER QUERIES =====

export const getOrdersByCustomer = async (
  customerUid: string,
  limitCount = 50
): Promise<OrderDocument[]> => {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(
    ordersRef,
    where('customerRef', '==', `customers/${customerUid}`),
    orderBy('placedAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as OrderDocument[];
};

export const getOrdersByRestaurant = async (
  restaurantId: string,
  limitCount = 50
): Promise<OrderDocument[]> => {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(
    ordersRef,
    where('restaurantRef', '==', `restaurants/${restaurantId}`),
    orderBy('placedAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as OrderDocument[];
};

export const getOrdersByDriver = async (
  driverUid: string,
  limitCount = 50
): Promise<OrderDocument[]> => {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(
    ordersRef,
    where('driverRef', '==', `drivers/${driverUid}`),
    orderBy('placedAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as OrderDocument[];
};

export const getOrdersByStatus = async (
  status: OrderDocument['status'],
  limitCount = 100
): Promise<OrderDocument[]> => {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(
    ordersRef,
    where('status', '==', status),
    orderBy('placedAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as OrderDocument[];
};

export const getPendingOrders = async (): Promise<OrderDocument[]> => {
  return getOrdersByStatus('pending');
};

export const getActiveOrders = async (): Promise<OrderDocument[]> => {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(
    ordersRef,
    where('status', 'in', ['confirmed', 'preparing', 'ready_for_pickup', 'picked_up']),
    orderBy('placedAt', 'desc'),
    limit(100)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as OrderDocument[];
};

export const getOrdersByVendor = async (
  vendorUid: string,
  limitCount = 50
): Promise<OrderDocument[]> => {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(
    ordersRef,
    where('vendorRef', '==', `vendors/${vendorUid}`),
    orderBy('placedAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as OrderDocument[];
};

// ===== ORDER ANALYTICS =====

export const getOrderStats = async (orderId: string) => {
  const order = await getOrder(orderId);
  if (!order) return null;

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: order.totalAmount,
    itemCount: order.items.length,
    deliveryMethod: order.deliveryMethod,
    placedAt: order.placedAt,
    estimatedDeliveryTime: order.estimatedDeliveryTime,
    actualDeliveryTime: order.actualDeliveryTime,
    preparationTime: order.preparationTime,
    trackingUpdatesCount: order.trackingUpdates.length,
    hasRatings: !!(order.customerRating || order.driverRating || order.restaurantRating),
    reviewSubmitted: order.reviewSubmitted,
  };
};

// ===== UTILITY FUNCTIONS =====

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp.slice(-6)}${random}`;
};

export const calculateOrderTotal = (
  subtotal: number,
  taxes: number,
  deliveryFee: number,
  serviceFee: number,
  discount: number,
  tip: number = 0
): number => {
  return subtotal + taxes + deliveryFee + serviceFee - discount + tip;
};

export const checkOrderExists = async (orderId: string): Promise<boolean> => {
  const order = await getOrder(orderId);
  return order !== null;
};

export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: OrderDocument['paymentStatus'],
  paymentTransactionId?: string
): Promise<void> => {
  const updates: Partial<OrderDocument> = { paymentStatus };

  if (paymentTransactionId) {
    updates.paymentTransactionId = paymentTransactionId;
  }

  await updateOrder(orderId, updates);
};

export const addOrderRating = async (
  orderId: string,
  ratings: {
    customerRating?: number;
    driverRating?: number;
    restaurantRating?: number;
  }
): Promise<void> => {
  await updateOrder(orderId, {
    ...ratings,
    reviewSubmitted: true,
  });
};

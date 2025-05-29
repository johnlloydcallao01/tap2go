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
import { NotificationDocument } from './schema';

// ===== NOTIFICATION OPERATIONS =====

export const createNotification = async (
  notificationData: Omit<NotificationDocument, 'createdAt'>
): Promise<string> => {
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
  
  const notificationDoc: NotificationDocument = {
    ...notificationData,
    createdAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(notificationsRef, notificationDoc);
  return docRef.id;
};

export const getNotification = async (notificationId: string): Promise<NotificationDocument | null> => {
  const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
  const notificationSnap = await getDoc(notificationRef);
  
  if (notificationSnap.exists()) {
    return { ...notificationSnap.data(), id: notificationSnap.id } as NotificationDocument;
  }
  return null;
};

export const updateNotification = async (
  notificationId: string,
  updates: Partial<NotificationDocument>
): Promise<void> => {
  const notificationRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
  await updateDoc(notificationRef, updates);
};

export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  await updateNotification(notificationId, {
    isRead: true,
    readAt: serverTimestamp() as Timestamp,
  });
};

export const markNotificationAsUnread = async (
  notificationId: string
): Promise<void> => {
  await updateNotification(notificationId, {
    isRead: false,
    readAt: null,
  });
};

export const markNotificationAsSent = async (
  notificationId: string
): Promise<void> => {
  await updateNotification(notificationId, {
    sentAt: serverTimestamp() as Timestamp,
  });
};

// ===== NOTIFICATION QUERIES =====

export const getNotificationsByUser = async (
  userUid: string,
  limitCount = 50
): Promise<NotificationDocument[]> => {
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
  const q = query(
    notificationsRef,
    where('recipientRef', '==', `users/${userUid}`),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as NotificationDocument[];
};

export const getUnreadNotificationsByUser = async (
  userUid: string,
  limitCount = 50
): Promise<NotificationDocument[]> => {
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
  const q = query(
    notificationsRef,
    where('recipientRef', '==', `users/${userUid}`),
    where('isRead', '==', false),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as NotificationDocument[];
};

export const getNotificationsByRole = async (
  role: NotificationDocument['recipientRole'],
  limitCount = 100
): Promise<NotificationDocument[]> => {
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
  const q = query(
    notificationsRef,
    where('recipientRole', '==', role),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as NotificationDocument[];
};

export const getNotificationsByType = async (
  type: NotificationDocument['type'],
  limitCount = 100
): Promise<NotificationDocument[]> => {
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
  const q = query(
    notificationsRef,
    where('type', '==', type),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as NotificationDocument[];
};

export const getNotificationsByPriority = async (
  priority: NotificationDocument['priority'],
  limitCount = 100
): Promise<NotificationDocument[]> => {
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
  const q = query(
    notificationsRef,
    where('priority', '==', priority),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as NotificationDocument[];
};

export const getUrgentNotifications = async (): Promise<NotificationDocument[]> => {
  return getNotificationsByPriority('urgent');
};

export const getUnsentNotifications = async (): Promise<NotificationDocument[]> => {
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
  const q = query(
    notificationsRef,
    where('sentAt', '==', null),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as NotificationDocument[];
};

// ===== NOTIFICATION ANALYTICS =====

export const getUnreadCount = async (userUid: string): Promise<number> => {
  const unreadNotifications = await getUnreadNotificationsByUser(userUid);
  return unreadNotifications.length;
};

export const getNotificationStats = async (userUid: string) => {
  const allNotifications = await getNotificationsByUser(userUid);
  const unreadNotifications = allNotifications.filter(n => !n.isRead);
  
  const statsByType = allNotifications.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statsByPriority = allNotifications.reduce((acc, notification) => {
    acc[notification.priority] = (acc[notification.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: allNotifications.length,
    unread: unreadNotifications.length,
    read: allNotifications.length - unreadNotifications.length,
    byType: statsByType,
    byPriority: statsByPriority,
  };
};

// ===== BULK OPERATIONS =====

export const markAllAsRead = async (userUid: string): Promise<void> => {
  const unreadNotifications = await getUnreadNotificationsByUser(userUid);
  
  const updatePromises = unreadNotifications.map(notification => 
    markNotificationAsRead(notification.id!)
  );
  
  await Promise.all(updatePromises);
};

export const markMultipleAsRead = async (notificationIds: string[]): Promise<void> => {
  const updatePromises = notificationIds.map(id => markNotificationAsRead(id));
  await Promise.all(updatePromises);
};

// ===== NOTIFICATION CREATION HELPERS =====

export const createOrderUpdateNotification = async (
  recipientUid: string,
  recipientRole: NotificationDocument['recipientRole'],
  title: string,
  message: string,
  orderData: Record<string, any>,
  priority: NotificationDocument['priority'] = 'medium'
): Promise<string> => {
  return createNotification({
    recipientRef: `users/${recipientUid}`,
    recipientRole,
    type: 'order_update',
    title,
    message,
    data: orderData,
    isRead: false,
    priority,
    deliveryMethod: ['push', 'email'],
  });
};

export const createPromotionalNotification = async (
  recipientUid: string,
  title: string,
  message: string,
  promoData: Record<string, any>
): Promise<string> => {
  return createNotification({
    recipientRef: `users/${recipientUid}`,
    recipientRole: 'customer',
    type: 'promotional',
    title,
    message,
    data: promoData,
    isRead: false,
    priority: 'low',
    deliveryMethod: ['push', 'email'],
  });
};

export const createSystemNotification = async (
  recipientUid: string,
  title: string,
  message: string,
  systemData: Record<string, any>,
  priority: NotificationDocument['priority'] = 'medium'
): Promise<string> => {
  return createNotification({
    recipientRef: `users/${recipientUid}`,
    recipientRole: 'admin',
    type: 'system',
    title,
    message,
    data: systemData,
    isRead: false,
    priority,
    deliveryMethod: ['push', 'email'],
  });
};

export const createPaymentNotification = async (
  recipientUid: string,
  recipientRole: NotificationDocument['recipientRole'],
  title: string,
  message: string,
  paymentData: Record<string, any>
): Promise<string> => {
  return createNotification({
    recipientRef: `users/${recipientUid}`,
    recipientRole,
    type: 'payment',
    title,
    message,
    data: paymentData,
    isRead: false,
    priority: 'urgent',
    deliveryMethod: ['push', 'email', 'sms'],
  });
};

export const createRatingRequestNotification = async (
  recipientUid: string,
  title: string,
  message: string,
  orderData: Record<string, any>
): Promise<string> => {
  return createNotification({
    recipientRef: `users/${recipientUid}`,
    recipientRole: 'customer',
    type: 'rating_request',
    title,
    message,
    data: orderData,
    isRead: false,
    priority: 'low',
    deliveryMethod: ['push'],
  });
};

// ===== UTILITY FUNCTIONS =====

export const checkNotificationExists = async (notificationId: string): Promise<boolean> => {
  const notification = await getNotification(notificationId);
  return notification !== null;
};

export const getNotificationsByDeliveryMethod = async (
  deliveryMethod: string,
  limitCount = 100
): Promise<NotificationDocument[]> => {
  const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
  const q = query(
    notificationsRef,
    where('deliveryMethod', 'array-contains', deliveryMethod),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as NotificationDocument[];
};

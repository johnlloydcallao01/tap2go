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
import { DisputeDocument } from './schema';

// ===== DISPUTE OPERATIONS =====

export const createDispute = async (
  disputeData: Omit<DisputeDocument, 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const disputesRef = collection(db, COLLECTIONS.DISPUTES);

  const disputeDoc: DisputeDocument = {
    ...disputeData,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(disputesRef, disputeDoc);
  return docRef.id;
};

export const getDispute = async (disputeId: string): Promise<DisputeDocument | null> => {
  const disputeRef = doc(db, COLLECTIONS.DISPUTES, disputeId);
  const disputeSnap = await getDoc(disputeRef);

  if (disputeSnap.exists()) {
    return { ...disputeSnap.data(), id: disputeSnap.id } as unknown as DisputeDocument;
  }
  return null;
};

export const updateDispute = async (
  disputeId: string,
  updates: Partial<DisputeDocument>
): Promise<void> => {
  const disputeRef = doc(db, COLLECTIONS.DISPUTES, disputeId);
  await updateDoc(disputeRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const updateDisputeStatus = async (
  disputeId: string,
  status: DisputeDocument['status']
): Promise<void> => {
  await updateDispute(disputeId, { status });
};

export const assignDisputeToAdmin = async (
  disputeId: string,
  adminUid: string
): Promise<void> => {
  await updateDispute(disputeId, {
    assignedTo: adminUid,
    status: 'investigating'
  });
};

export const resolveDispute = async (
  disputeId: string,
  resolution: DisputeDocument['resolution'],
  customerSatisfied?: boolean
): Promise<void> => {
  if (!resolution) throw new Error('Resolution data is required');

  const resolutionWithTimestamp = {
    ...resolution,
    resolvedAt: serverTimestamp() as Timestamp
  };

  const updates: Partial<DisputeDocument> = {
    resolution: resolutionWithTimestamp,
    status: 'resolved'
  };

  if (customerSatisfied !== undefined) {
    updates.customerSatisfied = customerSatisfied;
  }

  await updateDispute(disputeId, updates);
};

export const closeDispute = async (
  disputeId: string,
  customerSatisfied?: boolean
): Promise<void> => {
  const updates: Partial<DisputeDocument> = {
    status: 'closed'
  };

  if (customerSatisfied !== undefined) {
    updates.customerSatisfied = customerSatisfied;
  }

  await updateDispute(disputeId, updates);
};

export const addAttachmentToDispute = async (
  disputeId: string,
  attachmentUrl: string
): Promise<void> => {
  const dispute = await getDispute(disputeId);
  if (!dispute) throw new Error('Dispute not found');

  const updatedAttachments = [...(dispute.attachments || []), attachmentUrl];
  await updateDispute(disputeId, { attachments: updatedAttachments });
};

// ===== DISPUTE QUERIES =====

export const getDisputesByCustomer = async (
  customerUid: string,
  limitCount = 50
): Promise<DisputeDocument[]> => {
  const disputesRef = collection(db, COLLECTIONS.DISPUTES);
  const q = query(
    disputesRef,
    where('customerRef', '==', `customers/${customerUid}`),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as DisputeDocument[];
};

export const getDisputesByOrder = async (
  orderId: string
): Promise<DisputeDocument[]> => {
  const disputesRef = collection(db, COLLECTIONS.DISPUTES);
  const q = query(
    disputesRef,
    where('orderRef', '==', `orders/${orderId}`),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as DisputeDocument[];
};

export const getDisputesByStatus = async (
  status: DisputeDocument['status'],
  limitCount = 100
): Promise<DisputeDocument[]> => {
  const disputesRef = collection(db, COLLECTIONS.DISPUTES);
  const q = query(
    disputesRef,
    where('status', '==', status),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as DisputeDocument[];
};

export const getDisputesByType = async (
  type: DisputeDocument['type'],
  limitCount = 100
): Promise<DisputeDocument[]> => {
  const disputesRef = collection(db, COLLECTIONS.DISPUTES);
  const q = query(
    disputesRef,
    where('type', '==', type),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as DisputeDocument[];
};

export const getDisputesByPriority = async (
  priority: DisputeDocument['priority'],
  limitCount = 100
): Promise<DisputeDocument[]> => {
  const disputesRef = collection(db, COLLECTIONS.DISPUTES);
  const q = query(
    disputesRef,
    where('priority', '==', priority),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as DisputeDocument[];
};

export const getDisputesByAdmin = async (
  adminUid: string,
  limitCount = 100
): Promise<DisputeDocument[]> => {
  const disputesRef = collection(db, COLLECTIONS.DISPUTES);
  const q = query(
    disputesRef,
    where('assignedTo', '==', adminUid),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as DisputeDocument[];
};

export const getOpenDisputes = async (): Promise<DisputeDocument[]> => {
  return getDisputesByStatus('open');
};

export const getUrgentDisputes = async (): Promise<DisputeDocument[]> => {
  return getDisputesByPriority('urgent');
};

export const getUnassignedDisputes = async (): Promise<DisputeDocument[]> => {
  const disputesRef = collection(db, COLLECTIONS.DISPUTES);
  const q = query(
    disputesRef,
    where('assignedTo', '==', null),
    where('status', 'in', ['open', 'investigating']),
    orderBy('createdAt', 'desc'),
    limit(100)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as DisputeDocument[];
};

// ===== DISPUTE ANALYTICS =====

export const getDisputeStats = async () => {
  const disputesRef = collection(db, COLLECTIONS.DISPUTES);
  const querySnapshot = await getDocs(disputesRef);

  const disputes = querySnapshot.docs.map(doc => doc.data()) as unknown as DisputeDocument[];

  const statsByStatus = disputes.reduce((acc, dispute) => {
    acc[dispute.status] = (acc[dispute.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statsByType = disputes.reduce((acc, dispute) => {
    acc[dispute.type] = (acc[dispute.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statsByPriority = disputes.reduce((acc, dispute) => {
    acc[dispute.priority] = (acc[dispute.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const resolvedDisputes = disputes.filter(d => d.status === 'resolved');
  const satisfiedCustomers = resolvedDisputes.filter(d => d.customerSatisfied === true).length;
  const satisfactionRate = resolvedDisputes.length > 0 ? (satisfiedCustomers / resolvedDisputes.length) * 100 : 0;

  return {
    total: disputes.length,
    byStatus: statsByStatus,
    byType: statsByType,
    byPriority: statsByPriority,
    satisfactionRate: Math.round(satisfactionRate * 100) / 100,
    resolvedCount: resolvedDisputes.length,
    satisfiedCount: satisfiedCustomers
  };
};

export const getDisputesByRestaurant = async (
  restaurantId: string,
  limitCount = 50
): Promise<DisputeDocument[]> => {
  const disputesRef = collection(db, COLLECTIONS.DISPUTES);
  const q = query(
    disputesRef,
    where('restaurantRef', '==', `restaurants/${restaurantId}`),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as DisputeDocument[];
};

export const getDisputesByDriver = async (
  driverUid: string,
  limitCount = 50
): Promise<DisputeDocument[]> => {
  const disputesRef = collection(db, COLLECTIONS.DISPUTES);
  const q = query(
    disputesRef,
    where('driverRef', '==', `drivers/${driverUid}`),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as unknown as DisputeDocument[];
};

// ===== UTILITY FUNCTIONS =====

export const checkDisputeExists = async (disputeId: string): Promise<boolean> => {
  const dispute = await getDispute(disputeId);
  return dispute !== null;
};

export const getDisputeResolutionActions = (): string[] => {
  return ['refund', 'reorder', 'credit', 'no_action', 'partial_refund'];
};

export const isDisputeResolved = (dispute: DisputeDocument): boolean => {
  return dispute.status === 'resolved' || dispute.status === 'closed';
};

export const canResolveDispute = (dispute: DisputeDocument): boolean => {
  return dispute.status === 'investigating' || dispute.status === 'open';
};

export const getDisputeAge = (dispute: DisputeDocument): number => {
  const now = new Date();
  const created = dispute.createdAt.toDate();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)); // days
};

export const updateCustomerSatisfaction = async (
  disputeId: string,
  satisfied: boolean
): Promise<void> => {
  await updateDispute(disputeId, { customerSatisfied: satisfied });
};

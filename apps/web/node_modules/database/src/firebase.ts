/**
 * Database utilities for Firestore operations
 * Centralized database operations for all collections
 */

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
  serverTimestamp,
  deleteDoc,
  writeBatch,
  increment
} from 'firebase/firestore';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  RESTAURANTS: 'restaurants',
  MENU_ITEMS: 'menuItems',
  ORDERS: 'orders',
  DRIVERS: 'drivers',
  CUSTOMERS: 'customers',
  VENDORS: 'vendors',
  ADMINS: 'admins',
  NOTIFICATIONS: 'notifications',
  REVIEWS: 'reviews',
  CATEGORIES: 'categories',
  ANALYTICS: 'analytics',
} as const;

// Generic database utilities
export const dbUtils = {
  /**
   * Creates a new document in a collection
   */
  async create<T>(
    db: any,
    collectionName: string,
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const collectionRef = collection(db, collectionName);
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collectionRef, docData);
    return docRef.id;
  },

  /**
   * Gets a document by ID
   */
  async getById<T>(
    db: any,
    collectionName: string,
    id: string
  ): Promise<T | null> {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as T;
    }
    return null;
  },

  /**
   * Updates a document
   */
  async update<T>(
    db: any,
    collectionName: string,
    id: string,
    updates: Partial<T>
  ): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Deletes a document
   */
  async delete(
    db: any,
    collectionName: string,
    id: string
  ): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  },

  /**
   * Gets all documents from a collection with optional filtering
   */
  async getAll<T>(
    db: any,
    collectionName: string,
    options?: {
      where?: { field: string; operator: any; value: any }[];
      orderBy?: { field: string; direction: 'asc' | 'desc' };
      limit?: number;
    }
  ): Promise<T[]> {
    let q = collection(db, collectionName);
    let queryRef: any = q;

    if (options?.where) {
      for (const condition of options.where) {
        queryRef = query(queryRef, where(condition.field, condition.operator, condition.value));
      }
    }

    if (options?.orderBy) {
      queryRef = query(queryRef, orderBy(options.orderBy.field, options.orderBy.direction));
    }

    if (options?.limit) {
      queryRef = query(queryRef, limit(options.limit));
    }

    const querySnapshot = await getDocs(queryRef);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as T[];
  },
};

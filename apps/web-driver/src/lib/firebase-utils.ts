/**
 * Enterprise Firebase Utilities
 * Provides safe wrappers for Firebase operations with null checks
 */

import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  CollectionReference,
  QueryConstraint,
  WhereFilterOp,
  DocumentReference,
  Query,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Custom error for Firebase not initialized
export class FirebaseNotInitializedError extends Error {
  constructor(operation: string) {
    super(`Firebase not initialized. Cannot perform ${operation} operation.`);
    this.name = 'FirebaseNotInitializedError';
  }
}

// Safe Firebase operations with null checks
export class SafeFirebase {
  private static ensureDb(): Firestore {
    if (!db) {
      throw new FirebaseNotInitializedError('database');
    }
    return db;
  }

  // Safe collection reference
  static collection(path: string, ...pathSegments: string[]): CollectionReference<DocumentData> {
    const firestore = this.ensureDb();
    return collection(firestore, path, ...pathSegments);
  }

  // Safe document reference
  static doc(path: string, ...pathSegments: string[]): DocumentReference<DocumentData> {
    const firestore = this.ensureDb();
    return doc(firestore, path, ...pathSegments);
  }

  // Safe get documents
  static async getDocs(query: Query<DocumentData> | CollectionReference<DocumentData>): Promise<QuerySnapshot<DocumentData>> {
    this.ensureDb(); // Ensure Firebase is initialized
    return getDocs(query);
  }

  // Safe get document
  static async getDoc(docRef: DocumentReference<DocumentData>): Promise<DocumentSnapshot<DocumentData>> {
    this.ensureDb(); // Ensure Firebase is initialized
    return getDoc(docRef);
  }

  // Safe set document
  static async setDoc(docRef: DocumentReference<DocumentData>, data: DocumentData): Promise<void> {
    this.ensureDb(); // Ensure Firebase is initialized
    return setDoc(docRef, data);
  }

  // Safe add document
  static async addDoc(collectionRef: CollectionReference<DocumentData>, data: DocumentData): Promise<DocumentReference<DocumentData>> {
    this.ensureDb(); // Ensure Firebase is initialized
    return addDoc(collectionRef, data);
  }

  // Safe update document
  static async updateDoc(docRef: DocumentReference<DocumentData>, data: Partial<DocumentData>): Promise<void> {
    this.ensureDb(); // Ensure Firebase is initialized
    return updateDoc(docRef, data);
  }

  // Safe delete document
  static async deleteDoc(docRef: DocumentReference<DocumentData>): Promise<void> {
    this.ensureDb(); // Ensure Firebase is initialized
    return deleteDoc(docRef);
  }

  // Safe query builder
  static query(
    queryRef: Query<DocumentData> | CollectionReference<DocumentData>,
    ...queryConstraints: QueryConstraint[]
  ): Query<DocumentData> {
    this.ensureDb(); // Ensure Firebase is initialized
    return query(queryRef, ...queryConstraints);
  }

  // Safe where clause
  static where(fieldPath: string, opStr: WhereFilterOp, value: unknown) {
    return where(fieldPath, opStr, value);
  }

  // Safe order by clause
  static orderBy(fieldPath: string, directionStr?: 'asc' | 'desc') {
    return orderBy(fieldPath, directionStr);
  }

  // Safe limit clause
  static limit(limitCount: number) {
    return limit(limitCount);
  }

  // Utility methods for common operations
  static async getCollectionData(collectionPath: string): Promise<DocumentData[]> {
    try {
      const collectionRef = this.collection(collectionPath);
      const snapshot = await this.getDocs(collectionRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      if (error instanceof FirebaseNotInitializedError) {
        console.warn(`Firebase not initialized. Cannot fetch ${collectionPath} data.`);
        return [];
      }
      throw error;
    }
  }

  static async getDocumentData(documentPath: string): Promise<DocumentData | null> {
    try {
      const docRef = this.doc(documentPath);
      const docSnap = await this.getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
      return null;
    } catch (error) {
      if (error instanceof FirebaseNotInitializedError) {
        console.warn(`Firebase not initialized. Cannot fetch document ${documentPath}.`);
        return null;
      }
      throw error;
    }
  }

  static async addDocumentData(collectionPath: string, data: DocumentData): Promise<string | null> {
    try {
      const collectionRef = this.collection(collectionPath);
      const docRef = await this.addDoc(collectionRef, data);
      return docRef.id;
    } catch (error) {
      if (error instanceof FirebaseNotInitializedError) {
        console.warn(`Firebase not initialized. Cannot add document to ${collectionPath}.`);
        return null;
      }
      throw error;
    }
  }

  static async updateDocumentData(documentPath: string, data: Partial<DocumentData>): Promise<boolean> {
    try {
      const docRef = this.doc(documentPath);
      await this.updateDoc(docRef, data);
      return true;
    } catch (error) {
      if (error instanceof FirebaseNotInitializedError) {
        console.warn(`Firebase not initialized. Cannot update document ${documentPath}.`);
        return false;
      }
      throw error;
    }
  }

  static async deleteDocumentData(documentPath: string): Promise<boolean> {
    try {
      const docRef = this.doc(documentPath);
      await this.deleteDoc(docRef);
      return true;
    } catch (error) {
      if (error instanceof FirebaseNotInitializedError) {
        console.warn(`Firebase not initialized. Cannot delete document ${documentPath}.`);
        return false;
      }
      throw error;
    }
  }

  // Query with filters
  static async queryCollection(
    collectionPath: string,
    filters: Array<{ field: string; operator: WhereFilterOp; value: unknown }> = [],
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'asc',
    limitCount?: number
  ): Promise<DocumentData[]> {
    try {
      let collectionRef: Query<DocumentData> | CollectionReference<DocumentData> = this.collection(collectionPath);

      // Apply filters
      for (const filter of filters) {
        collectionRef = this.query(collectionRef, this.where(filter.field, filter.operator, filter.value));
      }

      // Apply ordering
      if (orderByField) {
        collectionRef = this.query(collectionRef, this.orderBy(orderByField, orderDirection));
      }

      // Apply limit
      if (limitCount) {
        collectionRef = this.query(collectionRef, this.limit(limitCount));
      }

      const snapshot = await this.getDocs(collectionRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      if (error instanceof FirebaseNotInitializedError) {
        console.warn(`Firebase not initialized. Cannot query ${collectionPath}.`);
        return [];
      }
      throw error;
    }
  }

  // Check if Firebase is available
  static isAvailable(): boolean {
    return db !== null;
  }

  // Get Firebase status
  static getStatus(): { available: boolean; message: string } {
    if (db) {
      return { available: true, message: 'Firebase is initialized and ready' };
    }
    return { available: false, message: 'Firebase is not initialized' };
  }
}

// Export for convenience
export const {
  collection: safeCollection,
  doc: safeDoc,
  getDocs: safeGetDocs,
  getDoc: safeGetDoc,
  addDoc: safeAddDoc,
  updateDoc: safeUpdateDoc,
  deleteDoc: safeDeleteDoc,
  query: safeQuery,
  where: safeWhere,
  orderBy: safeOrderBy,
  limit: safeLimit,
  getCollectionData,
  getDocumentData,
  addDocumentData,
  updateDocumentData,
  deleteDocumentData,
  queryCollection,
  isAvailable: isFirebaseAvailable,
  getStatus: getFirebaseStatus
} = SafeFirebase;

export default SafeFirebase;

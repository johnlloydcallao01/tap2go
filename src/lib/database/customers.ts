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
  deleteDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from './collections';
import {
  CustomerDocument,
  CustomerAddressDocument,
  CustomerPaymentMethodDocument,
  CustomerFavoritesDocument,
  CustomerCartDocument
} from './schema';

// ===== CUSTOMER OPERATIONS =====

export const createCustomer = async (
  uid: string,
  customerData: Omit<CustomerDocument, 'createdAt' | 'updatedAt'>
): Promise<void> => {
  const customerRef = doc(db, COLLECTIONS.CUSTOMERS, uid);

  const customerDoc: CustomerDocument = {
    ...customerData,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(customerRef, customerDoc);
};

export const getCustomer = async (uid: string): Promise<CustomerDocument | null> => {
  const customerRef = doc(db, COLLECTIONS.CUSTOMERS, uid);
  const customerSnap = await getDoc(customerRef);

  if (customerSnap.exists()) {
    return customerSnap.data() as CustomerDocument;
  }
  return null;
};

export const updateCustomer = async (
  uid: string,
  updates: Partial<Omit<CustomerDocument, 'uid' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const customerRef = doc(db, COLLECTIONS.CUSTOMERS, uid);

  await updateDoc(customerRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// ===== CUSTOMER ADDRESS OPERATIONS =====

export const addCustomerAddress = async (
  customerUid: string,
  addressData: Omit<CustomerAddressDocument, 'addressId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const addressesRef = collection(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_ADDRESSES);

  const addressDoc: Omit<CustomerAddressDocument, 'addressId'> = {
    ...addressData,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(addressesRef, addressDoc);

  // Update the document with its own ID
  await updateDoc(docRef, { addressId: docRef.id });

  return docRef.id;
};

export const getCustomerAddresses = async (customerUid: string): Promise<CustomerAddressDocument[]> => {
  const addressesRef = collection(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_ADDRESSES);
  const q = query(addressesRef, where('isActive', '==', true), orderBy('isDefault', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as CustomerAddressDocument);
};

export const updateCustomerAddress = async (
  customerUid: string,
  addressId: string,
  updates: Partial<Omit<CustomerAddressDocument, 'addressId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const addressRef = doc(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_ADDRESSES, addressId);

  await updateDoc(addressRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteCustomerAddress = async (customerUid: string, addressId: string): Promise<void> => {
  const addressRef = doc(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_ADDRESSES, addressId);
  await updateDoc(addressRef, { isActive: false, updatedAt: serverTimestamp() });
};

// ===== CUSTOMER PAYMENT METHODS OPERATIONS =====

export const addCustomerPaymentMethod = async (
  customerUid: string,
  paymentData: Omit<CustomerPaymentMethodDocument, 'paymentMethodId' | 'createdAt'>
): Promise<string> => {
  const paymentMethodsRef = collection(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_PAYMENT_METHODS);

  const paymentDoc: Omit<CustomerPaymentMethodDocument, 'paymentMethodId'> = {
    ...paymentData,
    createdAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(paymentMethodsRef, paymentDoc);

  // Update the document with its own ID
  await updateDoc(docRef, { paymentMethodId: docRef.id });

  return docRef.id;
};

export const getCustomerPaymentMethods = async (customerUid: string): Promise<CustomerPaymentMethodDocument[]> => {
  const paymentMethodsRef = collection(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_PAYMENT_METHODS);
  const q = query(paymentMethodsRef, where('isActive', '==', true), orderBy('isDefault', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as CustomerPaymentMethodDocument);
};

// ===== CUSTOMER FAVORITES OPERATIONS =====

export const addCustomerFavorite = async (
  customerUid: string,
  favoriteData: Omit<CustomerFavoritesDocument, 'favoriteId' | 'createdAt'>
): Promise<string> => {
  const favoritesRef = collection(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_FAVORITES);

  const favoriteDoc: Omit<CustomerFavoritesDocument, 'favoriteId'> = {
    ...favoriteData,
    createdAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(favoritesRef, favoriteDoc);

  // Update the document with its own ID
  await updateDoc(docRef, { favoriteId: docRef.id });

  return docRef.id;
};

export const getCustomerFavorites = async (customerUid: string): Promise<CustomerFavoritesDocument[]> => {
  const favoritesRef = collection(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_FAVORITES);
  const q = query(favoritesRef, orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as CustomerFavoritesDocument);
};

export const removeCustomerFavorite = async (customerUid: string, favoriteId: string): Promise<void> => {
  const favoriteRef = doc(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_FAVORITES, favoriteId);
  await deleteDoc(favoriteRef);
};

// ===== CUSTOMER CART OPERATIONS =====

export const addToCart = async (
  customerUid: string,
  cartData: Omit<CustomerCartDocument, 'cartItemId' | 'addedAt'>
): Promise<string> => {
  const cartRef = collection(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_CART);

  const cartDoc: Omit<CustomerCartDocument, 'cartItemId'> = {
    ...cartData,
    addedAt: serverTimestamp() as Timestamp,
  };

  const docRef = await addDoc(cartRef, cartDoc);

  // Update the document with its own ID
  await updateDoc(docRef, { cartItemId: docRef.id });

  return docRef.id;
};

export const getCustomerCart = async (customerUid: string): Promise<CustomerCartDocument[]> => {
  const cartRef = collection(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_CART);
  const q = query(cartRef, orderBy('addedAt', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as CustomerCartDocument);
};

export const updateCartItem = async (
  customerUid: string,
  cartItemId: string,
  updates: Partial<Omit<CustomerCartDocument, 'cartItemId' | 'addedAt'>>
): Promise<void> => {
  const cartItemRef = doc(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_CART, cartItemId);
  await updateDoc(cartItemRef, updates);
};

export const removeFromCart = async (customerUid: string, cartItemId: string): Promise<void> => {
  const cartItemRef = doc(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_CART, cartItemId);
  await deleteDoc(cartItemRef);
};

export const clearCart = async (customerUid: string): Promise<void> => {
  const cartRef = collection(db, COLLECTIONS.CUSTOMERS, customerUid, COLLECTIONS.CUSTOMER_CART);
  const snapshot = await getDocs(cartRef);

  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// ===== UTILITY FUNCTIONS =====

export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const updateLoyaltyPoints = async (customerUid: string, pointsToAdd: number): Promise<void> => {
  const customer = await getCustomer(customerUid);
  if (!customer) return;

  const newPoints = customer.loyaltyPoints + pointsToAdd;
  let newTier = customer.loyaltyTier;

  // Update tier based on points
  if (newPoints >= 10000) newTier = 'platinum';
  else if (newPoints >= 5000) newTier = 'gold';
  else if (newPoints >= 1000) newTier = 'silver';
  else newTier = 'bronze';

  await updateCustomer(customerUid, {
    loyaltyPoints: newPoints,
    loyaltyTier: newTier
  });
};

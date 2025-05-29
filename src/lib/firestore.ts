import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Restaurant, MenuItem, Order, Review, Category } from '@/types';

// Restaurant operations
export const getRestaurants = async (limitCount = 20, lastDoc?: DocumentSnapshot) => {
  let q = query(
    collection(db, 'restaurants'),
    orderBy('featured', 'desc'),
    orderBy('rating', 'desc'),
    limit(limitCount)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const restaurants = snapshot.docs.map(doc => {
    const data = doc.data();
    // Transform database fields to match TypeScript interface
    return {
      id: doc.id,
      name: data.outletName || data.name || '',
      description: data.description || '',
      image: data.coverImageUrl || data.image || '',
      coverImage: data.coverImageUrl || data.image || '',
      cuisine: data.cuisineTags || data.cuisine || [],
      address: data.address || {},
      phone: data.outletPhone || data.phone || '',
      email: data.email || '',
      ownerId: data.vendorRef || data.ownerId || '',
      rating: data.avgRating || data.rating || 0,
      reviewCount: data.totalReviews || data.reviewCount || 0,
      deliveryTime: data.estimatedDeliveryRange || data.deliveryTime || 'N/A',
      deliveryFee: data.deliveryFees?.base || data.deliveryFee || 0,
      minimumOrder: data.minOrderValue || data.minimumOrder || 0,
      isOpen: data.isAcceptingOrders !== undefined ? data.isAcceptingOrders : (data.isOpen !== undefined ? data.isOpen : true),
      openingHours: data.operatingHours || data.openingHours || {},
      featured: data.featured || false,
      status: data.platformStatus || data.status || 'active',
      commissionRate: data.commissionRate || 15,
      totalOrders: data.totalOrders || 0,
      totalRevenue: data.totalRevenue || 0,
      averagePreparationTime: data.preparationTime?.average || data.averagePreparationTime || 20,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date()
    };
  }) as Restaurant[];

  return {
    restaurants,
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === limitCount,
  };
};

export const getRestaurantById = async (id: string): Promise<Restaurant | null> => {
  const docRef = doc(db, 'restaurants', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Transform database fields to match TypeScript interface
    return {
      id: docSnap.id,
      name: data.outletName || data.name || '',
      description: data.description || '',
      image: data.coverImageUrl || data.image || '',
      coverImage: data.coverImageUrl || data.image || '',
      cuisine: data.cuisineTags || data.cuisine || [],
      address: data.address || {},
      phone: data.outletPhone || data.phone || '',
      email: data.email || '',
      ownerId: data.vendorRef || data.ownerId || '',
      rating: data.avgRating || data.rating || 0,
      reviewCount: data.totalReviews || data.reviewCount || 0,
      deliveryTime: data.estimatedDeliveryRange || data.deliveryTime || 'N/A',
      deliveryFee: data.deliveryFees?.base || data.deliveryFee || 0,
      minimumOrder: data.minOrderValue || data.minimumOrder || 0,
      isOpen: data.isAcceptingOrders !== undefined ? data.isAcceptingOrders : (data.isOpen !== undefined ? data.isOpen : true),
      openingHours: data.operatingHours || data.openingHours || {},
      featured: data.featured || false,
      status: data.platformStatus || data.status || 'active',
      commissionRate: data.commissionRate || 15,
      totalOrders: data.totalOrders || 0,
      totalRevenue: data.totalRevenue || 0,
      averagePreparationTime: data.preparationTime?.average || data.averagePreparationTime || 20,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date()
    } as Restaurant;
  }

  return null;
};

export const searchRestaurants = async (searchTerm: string, cuisine?: string) => {
  let q = query(collection(db, 'restaurants'));

  if (cuisine) {
    q = query(q, where('cuisine', 'array-contains', cuisine));
  }

  const snapshot = await getDocs(q);
  const restaurants = snapshot.docs.map(doc => {
    const data = doc.data();
    // Transform database fields to match TypeScript interface
    return {
      id: doc.id,
      name: data.outletName || data.name || '',
      description: data.description || '',
      image: data.coverImageUrl || data.image || '',
      coverImage: data.coverImageUrl || data.image || '',
      cuisine: data.cuisineTags || data.cuisine || [],
      address: data.address || {},
      phone: data.outletPhone || data.phone || '',
      email: data.email || '',
      ownerId: data.vendorRef || data.ownerId || '',
      rating: data.avgRating || data.rating || 0,
      reviewCount: data.totalReviews || data.reviewCount || 0,
      deliveryTime: data.estimatedDeliveryRange || data.deliveryTime || 'N/A',
      deliveryFee: data.deliveryFees?.base || data.deliveryFee || 0,
      minimumOrder: data.minOrderValue || data.minimumOrder || 0,
      isOpen: data.isAcceptingOrders !== undefined ? data.isAcceptingOrders : (data.isOpen !== undefined ? data.isOpen : true),
      openingHours: data.operatingHours || data.openingHours || {},
      featured: data.featured || false,
      status: data.platformStatus || data.status || 'active',
      commissionRate: data.commissionRate || 15,
      totalOrders: data.totalOrders || 0,
      totalRevenue: data.totalRevenue || 0,
      averagePreparationTime: data.preparationTime?.average || data.averagePreparationTime || 20,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date()
    };
  }) as Restaurant[];

  // Filter by search term (client-side for now)
  if (searchTerm) {
    return restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  return restaurants;
};

// Menu operations
export const getMenuItems = async (restaurantId: string): Promise<MenuItem[]> => {
  const q = query(
    collection(db, 'menuItems'),
    where('restaurantId', '==', restaurantId),
    where('available', '==', true),
    orderBy('category'),
    orderBy('name')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as MenuItem[];
};

export const getMenuItemById = async (id: string): Promise<MenuItem | null> => {
  const docRef = doc(db, 'menuItems', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as MenuItem;
  }

  return null;
};

// Order operations
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return docRef.id;
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const docRef = doc(db, 'orders', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate(),
      actualDeliveryTime: data.actualDeliveryTime?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Order;
  }

  return null;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(
    collection(db, 'orders'),
    where('customerId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    estimatedDeliveryTime: doc.data().estimatedDeliveryTime?.toDate(),
    actualDeliveryTime: doc.data().actualDeliveryTime?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Order[];
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  const docRef = doc(db, 'orders', orderId);
  await updateDoc(docRef, {
    status,
    updatedAt: new Date(),
  });
};

// Review operations
export const getRestaurantReviews = async (restaurantId: string): Promise<Review[]> => {
  const q = query(
    collection(db, 'reviews'),
    where('restaurantId', '==', restaurantId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Review[];
};

export const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...reviewData,
    createdAt: new Date(),
  });

  return docRef.id;
};

// Category operations
export const getCategories = async (): Promise<Category[]> => {
  const q = query(
    collection(db, 'categories'),
    orderBy('featured', 'desc'),
    orderBy('name')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Category[];
};

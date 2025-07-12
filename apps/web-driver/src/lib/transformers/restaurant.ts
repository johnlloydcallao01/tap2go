import { Restaurant } from '@/types';
import { DocumentData } from 'firebase/firestore';

/**
 * Single source of truth for transforming Firestore restaurant data
 * to the Restaurant interface. This ensures consistency across all pages.
 */
export const transformRestaurantData = (doc: { id: string; data: () => DocumentData }): Restaurant => {
  const data = doc.data();
  
  return {
    id: doc.id,
    name: data.outletName || data.name || '',
    description: data.description || '',
    image: data.coverImageUrl || data.image || '/api/placeholder/300/200',
    coverImage: data.coverImageUrl || data.image || '',
    cuisine: data.cuisineTags || data.cuisine || [],
    address: data.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    phone: data.outletPhone || data.phone || '',
    email: data.email || '',
    ownerId: data.vendorRef || data.ownerId || '',
    rating: data.avgRating || data.rating || 0,
    reviewCount: data.totalReviews || data.reviewCount || 0, // CRITICAL: Check totalReviews first!
    deliveryTime: data.estimatedDeliveryRange || data.deliveryTime || 'N/A',
    deliveryFee: data.deliveryFees?.base || data.deliveryFee || 0,
    minimumOrder: data.minOrderValue || data.minimumOrder || 0,
    isOpen: data.isAcceptingOrders !== undefined ? data.isAcceptingOrders : (data.isOpen !== undefined ? data.isOpen : true),
    openingHours: data.operatingHours || data.openingHours || {
      monday: { open: '09:00', close: '22:00', isClosed: false },
      tuesday: { open: '09:00', close: '22:00', isClosed: false },
      wednesday: { open: '09:00', close: '22:00', isClosed: false },
      thursday: { open: '09:00', close: '22:00', isClosed: false },
      friday: { open: '09:00', close: '22:00', isClosed: false },
      saturday: { open: '09:00', close: '22:00', isClosed: false },
      sunday: { open: '09:00', close: '22:00', isClosed: false }
    },
    featured: data.featured || false,
    status: data.platformStatus || data.status || 'active',
    commissionRate: data.commissionRate || 15,
    totalOrders: data.totalOrders || 0,
    totalRevenue: data.totalRevenue || 0,
    averagePreparationTime: data.preparationTime?.average || data.averagePreparationTime || 20,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date()
  };
};

/**
 * Transform multiple restaurant documents
 */
export const transformRestaurantsData = (docs: { id: string; data: () => DocumentData }[]): Restaurant[] => {
  return docs.map(transformRestaurantData);
};

// Sync Firestore data to Bonsai Elasticsearch
// This service keeps your search index up-to-date with your database

import { bonsaiClient, INDICES, initializeBonsaiIndices } from '@/lib/bonsai';
import { getRestaurants } from '@/lib/firestore';
import { Restaurant } from '@/types';

// Transform Firestore restaurant data for Elasticsearch
const transformRestaurantForSearch = (restaurant: Restaurant) => {
  return {
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    cuisine: Array.isArray(restaurant.cuisine) ? restaurant.cuisine : [restaurant.cuisine],
    rating: restaurant.rating || 0,
    reviewCount: restaurant.reviewCount || 0,
    deliveryTime: restaurant.deliveryTime,
    deliveryFee: restaurant.deliveryFee || 0,
    minimumOrder: restaurant.minimumOrder || 0,
    isOpen: restaurant.isOpen ?? true,
    featured: restaurant.featured ?? false,
    
    // Extract location if available
    location: restaurant.address?.coordinates ? {
      lat: restaurant.address.coordinates.lat,
      lon: restaurant.address.coordinates.lng
    } : null,
    
    // Address information
    address: {
      street: restaurant.address?.street || '',
      city: restaurant.address?.city || '',
      state: restaurant.address?.state || '',
      zipCode: restaurant.address?.zipCode || '',
      country: restaurant.address?.country || 'Philippines'
    },
    
    // Operating hours (if available)
    operatingHours: restaurant.openingHours || {},
    
    // Timestamps (convert Firestore timestamps to ISO strings)
    createdAt: restaurant.createdAt instanceof Date
      ? restaurant.createdAt.toISOString()
      : (typeof restaurant.createdAt === 'object' && restaurant.createdAt && 'toDate' in restaurant.createdAt
          ? (restaurant.createdAt as any).toDate().toISOString()
          : new Date().toISOString()),
    updatedAt: restaurant.updatedAt instanceof Date
      ? restaurant.updatedAt.toISOString()
      : (typeof restaurant.updatedAt === 'object' && restaurant.updatedAt && 'toDate' in restaurant.updatedAt
          ? (restaurant.updatedAt as any).toDate().toISOString()
          : new Date().toISOString()),
    
    // Search suggestions (for auto-complete)
    suggest: {
      input: [
        restaurant.name,
        ...(Array.isArray(restaurant.cuisine) ? restaurant.cuisine : [restaurant.cuisine])
      ].filter(Boolean)
    }
  };
};

// Sync single restaurant to Bonsai
export const syncRestaurantToBonsai = async (restaurant: Restaurant): Promise<boolean> => {
  try {
    const transformedData = transformRestaurantForSearch(restaurant);
    
    await bonsaiClient.index({
      index: INDICES.RESTAURANTS,
      id: restaurant.id,
      body: transformedData
    });
    
    console.log(`✅ Synced restaurant: ${restaurant.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to sync restaurant ${restaurant.name}:`, error);
    return false;
  }
};

// Bulk sync all restaurants from Firestore to Bonsai
export const syncAllRestaurantsToBonsai = async (): Promise<{
  success: number;
  failed: number;
  total: number;
}> => {
  try {
    console.log('🔄 Starting bulk sync from Firestore to Bonsai...');
    
    // Initialize indices if they don't exist
    await initializeBonsaiIndices();
    
    // Get all restaurants from Firestore using a simpler query
    // Use collection() directly to avoid complex ordering that requires indices
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');

    const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
    const restaurants = restaurantsSnapshot.docs.map(doc => {
      const data = doc.data();
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
        minimumOrder: data.minimumOrderValue || data.minimumOrder || 0,
        isOpen: data.isOpen ?? true,
        featured: data.featured ?? false,
        openingHours: data.operatingHours || data.openingHours || {},
        status: data.status || 'active',
        commissionRate: data.commissionRate || 0,
        totalOrders: data.totalOrders || 0,
        averageOrderValue: data.averageOrderValue || 0,
        totalRevenue: data.totalRevenue || 0,
        averagePreparationTime: data.averagePreparationTime || 30,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date()
      } as Restaurant;
    });
    console.log(`📊 Found ${restaurants.length} restaurants in Firestore`);
    
    if (restaurants.length === 0) {
      console.log('ℹ️ No restaurants found in Firestore');
      return { success: 0, failed: 0, total: 0 };
    }
    
    // Prepare bulk operations
    const bulkOperations: any[] = [];
    
    restaurants.forEach(restaurant => {
      const transformedData = transformRestaurantForSearch(restaurant);
      
      // Add index operation
      bulkOperations.push({
        index: {
          _index: INDICES.RESTAURANTS,
          _id: restaurant.id
        }
      });
      
      // Add document data
      bulkOperations.push(transformedData);
    });
    
    // Execute bulk operation
    console.log('📤 Executing bulk index operation...');
    const response = await bonsaiClient.bulk({
      body: bulkOperations,
      refresh: true // Make documents immediately searchable
    });
    
    // Count successes and failures
    let success = 0;
    let failed = 0;
    
    if (response.body.items) {
      response.body.items.forEach((item: any) => {
        if (item.index && item.index.error) {
          failed++;
          console.error('❌ Bulk index error:', item.index.error);
        } else {
          success++;
        }
      });
    }
    
    console.log(`✅ Bulk sync completed: ${success} success, ${failed} failed`);
    
    return {
      success,
      failed,
      total: restaurants.length
    };
    
  } catch (error) {
    console.error('❌ Bulk sync failed:', error);
    throw error;
  }
};

// Delete restaurant from Bonsai
export const deleteRestaurantFromBonsai = async (restaurantId: string): Promise<boolean> => {
  try {
    await bonsaiClient.delete({
      index: INDICES.RESTAURANTS,
      id: restaurantId
    });
    
    console.log(`🗑️ Deleted restaurant from search index: ${restaurantId}`);
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'meta' in error && (error as any).meta?.statusCode === 404) {
      console.log(`ℹ️ Restaurant not found in search index: ${restaurantId}`);
      return true; // Not an error if it doesn't exist
    }
    console.error(`❌ Failed to delete restaurant ${restaurantId}:`, error);
    return false;
  }
};

// Check sync status
export const checkSyncStatus = async (): Promise<{
  firestoreCount: number;
  bonsaiCount: number;
  inSync: boolean;
}> => {
  try {
    // Get Firestore count
    const { restaurants } = await getRestaurants(1);
    const firestoreCount = restaurants.length; // This is approximate
    
    // Get Bonsai count
    const countResponse = await bonsaiClient.count({
      index: INDICES.RESTAURANTS
    });
    const bonsaiCount = countResponse.body.count;
    
    const inSync = Math.abs(firestoreCount - bonsaiCount) <= 1; // Allow small difference
    
    return {
      firestoreCount,
      bonsaiCount,
      inSync
    };
  } catch (error) {
    console.error('Error checking sync status:', error);
    throw error;
  }
};

// Clear all data from Bonsai (useful for testing)
export const clearBonsaiIndex = async (): Promise<boolean> => {
  try {
    await bonsaiClient.deleteByQuery({
      index: INDICES.RESTAURANTS,
      body: {
        query: {
          match_all: {}
        }
      }
    });
    
    console.log('🧹 Cleared all restaurants from Bonsai index');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear Bonsai index:', error);
    return false;
  }
};

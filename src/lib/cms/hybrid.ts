/**
 * Hybrid Data Resolver for Tap2Go
 * Combines Firebase operational data with Strapi content data
 */

import { collection, doc, getDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { cms } from './index';

// Type definitions for Strapi data structures
interface StrapiImageData {
  data?: {
    attributes?: {
      url: string;
    };
  };
}

interface StrapiGalleryData {
  data?: Array<{
    attributes: {
      url: string;
    };
  }>;
}

interface StrapiImagesData {
  data?: Array<{
    attributes: {
      url: string;
    };
  }>;
}

// Types for hybrid data structures
export interface HybridRestaurant {
  // Firebase operational data
  id: string;
  name: string;
  isOpen: boolean;
  rating: number;
  totalOrders: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  
  // Strapi content data
  content?: {
    story?: string;
    longDescription?: string;
    heroImage?: string;
    gallery?: string[];
    awards?: Record<string, unknown>[];
    certifications?: Record<string, unknown>[];
    specialFeatures?: Record<string, unknown>[];
    socialMedia?: Record<string, unknown>;
    seo?: Record<string, unknown>;
  };
  
  // Metadata
  source: 'hybrid';
  lastUpdated: string;
  hasRichContent: boolean;
}

export interface HybridMenuItem {
  // Firebase operational data
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  available: boolean;
  category: string;
  image?: string;
  preparationTime?: number;
  
  // Strapi content data
  content?: {
    detailedDescription?: string;
    images?: string[];
    ingredients?: Record<string, unknown>[];
    allergens?: Record<string, unknown>[];
    nutritionalInfo?: Record<string, unknown>;
    preparationSteps?: string[];
    chefNotes?: string;
    tags?: Record<string, unknown>[];
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    spiceLevel?: string;
  };
  
  // Metadata
  source: 'hybrid';
  hasRichContent: boolean;
}

export interface HybridMenuCategory {
  // Firebase operational data
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  
  // Strapi content data
  content?: {
    detailedDescription?: string;
    image?: string;
  };
  
  // Enhanced menu items
  items: HybridMenuItem[];
  
  // Metadata
  source: 'hybrid';
  hasRichContent: boolean;
}

/**
 * Hybrid Data Resolver Class
 * Merges Firebase operational data with Strapi content data
 */
export class HybridDataResolver {
  // Simple in-memory cache for hybrid data
  private cache = new Map<string, { data: unknown; expires: number }>();

  /**
   * Get complete restaurant data (Firebase + Strapi)
   */
  async getRestaurantComplete(restaurantId: string): Promise<HybridRestaurant | null> {
    try {
      // Check cache first
      const cacheKey = `hybrid:restaurant:${restaurantId}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() < cached.expires) {
        return cached.data as HybridRestaurant;
      }

      // Get operational data from Firebase
      const operationalData = await this.getFirebaseRestaurant(restaurantId);
      if (!operationalData) {
        return null;
      }

      // Get content data from Strapi
      const contentData = await cms.getRestaurantContent(restaurantId);

      // Merge data
      const hybridRestaurant: HybridRestaurant = {
        ...(operationalData as unknown as HybridRestaurant),
        content: contentData ? this.transformRestaurantContent(contentData as unknown as Record<string, unknown>) : undefined,
        source: 'hybrid',
        lastUpdated: new Date().toISOString(),
        hasRichContent: !!contentData
      };

      // Cache the result for 15 minutes
      this.cache.set(cacheKey, {
        data: hybridRestaurant,
        expires: Date.now() + (15 * 60 * 1000)
      });

      return hybridRestaurant;
    } catch (error) {
      console.error('Error getting complete restaurant data:', error);
      return null;
    }
  }

  /**
   * Get complete menu data (Firebase + Strapi)
   */
  async getMenuComplete(restaurantId: string): Promise<HybridMenuCategory[]> {
    try {
      // Check cache first
      const cacheKey = `hybrid:menu:${restaurantId}`;
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return cached.data as HybridMenuCategory[];
      }

      // Get operational menu data from Firebase
      const operationalCategories = await this.getFirebaseMenuCategories(restaurantId);
      const operationalItems = await this.getFirebaseMenuItems(restaurantId);

      // Get content data from Strapi
      const contentCategories = await cms.getMenuCategories(restaurantId);

      // Merge categories with content
      const hybridCategories: HybridMenuCategory[] = await Promise.all(operationalCategories.map(async category => {
        const contentCategory = contentCategories.find(c => 
          c.attributes.firebaseId === category.id
        );

        // Get items for this category
        const categoryItems = operationalItems.filter(item => item.category === category.id);

        return {
          ...(category as unknown as HybridMenuCategory),
          content: contentCategory ? this.transformCategoryContent(contentCategory as unknown as Record<string, unknown>) : undefined,
          items: await Promise.all(categoryItems.map(item => this.createHybridMenuItem(item, restaurantId))),
          source: 'hybrid',
          hasRichContent: !!contentCategory
        };
      }));

      // Cache the result for 30 minutes
      this.cache.set(cacheKey, {
        data: hybridCategories,
        expires: Date.now() + (30 * 60 * 1000)
      });

      return hybridCategories;
    } catch (error) {
      console.error('Error getting complete menu data:', error);
      return [];
    }
  }

  /**
   * Get hybrid menu item with content
   */
  async getMenuItemComplete(restaurantId: string, itemId: string): Promise<HybridMenuItem | null> {
    try {
      // Get operational data from Firebase
      const operationalItem = await this.getFirebaseMenuItem(restaurantId, itemId);
      if (!operationalItem) {
        return null;
      }

      // Get content data from Strapi
      const contentItem = await cms.getMenuItemContent(itemId);

      return this.createHybridMenuItem(operationalItem, restaurantId, contentItem as unknown as Record<string, unknown> | undefined);
    } catch (error) {
      console.error('Error getting complete menu item data:', error);
      return null;
    }
  }

  /**
   * Search restaurants with content
   */
  async searchRestaurantsWithContent(): Promise<HybridRestaurant[]> {
    try {
      // Get restaurants from Firebase (this would include search logic)
      const firebaseRestaurants = await this.searchFirebaseRestaurants();

      // Enhance with content data
      const hybridRestaurants = await Promise.all(
        firebaseRestaurants.map(async (restaurant) => {
          const contentData = await cms.getRestaurantContent(String(restaurant.id));

          return {
            ...(restaurant as unknown as HybridRestaurant),
            content: contentData ? this.transformRestaurantContent(contentData as unknown as Record<string, unknown>) : undefined,
            source: 'hybrid' as const,
            lastUpdated: new Date().toISOString(),
            hasRichContent: !!contentData
          };
        })
      );

      return hybridRestaurants;
    } catch (error) {
      console.error('Error searching restaurants with content:', error);
      return [];
    }
  }

  /**
   * Get Firebase restaurant data
   */
  private async getFirebaseRestaurant(restaurantId: string): Promise<Record<string, unknown> | null> {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const restaurantSnap = await getDoc(restaurantRef);
      
      if (!restaurantSnap.exists()) {
        return null;
      }

      return {
        id: restaurantSnap.id,
        ...restaurantSnap.data()
      };
    } catch (error) {
      console.error('Error fetching Firebase restaurant:', error);
      return null;
    }
  }

  /**
   * Get Firebase menu categories
   */
  private async getFirebaseMenuCategories(restaurantId: string): Promise<Record<string, unknown>[]> {
    try {
      const categoriesRef = collection(db, `restaurants/${restaurantId}/menuCategories`);
      const categoriesQuery = query(categoriesRef, orderBy('sortOrder', 'asc'));
      const categoriesSnap = await getDocs(categoriesQuery);

      return categoriesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching Firebase menu categories:', error);
      return [];
    }
  }

  /**
   * Get Firebase menu items
   */
  private async getFirebaseMenuItems(restaurantId: string): Promise<Record<string, unknown>[]> {
    try {
      const itemsRef = collection(db, `restaurants/${restaurantId}/menuItems`);
      const itemsSnap = await getDocs(itemsRef);

      return itemsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching Firebase menu items:', error);
      return [];
    }
  }

  /**
   * Get single Firebase menu item
   */
  private async getFirebaseMenuItem(restaurantId: string, itemId: string): Promise<Record<string, unknown> | null> {
    try {
      const itemRef = doc(db, `restaurants/${restaurantId}/menuItems`, itemId);
      const itemSnap = await getDoc(itemRef);
      
      if (!itemSnap.exists()) {
        return null;
      }

      return {
        id: itemSnap.id,
        ...itemSnap.data()
      };
    } catch (error) {
      console.error('Error fetching Firebase menu item:', error);
      return null;
    }
  }

  /**
   * Search Firebase restaurants (placeholder implementation)
   */
  private async searchFirebaseRestaurants(): Promise<Record<string, unknown>[]> {
    try {
      // This would implement actual search logic
      // For now, return a simple query
      const restaurantsRef = collection(db, 'restaurants');
      const restaurantsQuery = query(restaurantsRef, limit(20));
      const restaurantsSnap = await getDocs(restaurantsQuery);

      return restaurantsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error searching Firebase restaurants:', error);
      return [];
    }
  }

  /**
   * Transform Strapi restaurant content for hybrid structure
   */
  private transformRestaurantContent(contentData: Record<string, unknown>): Record<string, unknown> {
    const attributes = contentData.attributes as Record<string, unknown>;
    return {
      story: attributes?.story,
      longDescription: attributes?.longDescription,
      heroImage: (attributes?.heroImage as StrapiImageData)?.data?.attributes?.url,
      gallery: (attributes?.gallery as StrapiGalleryData)?.data?.map((img: { attributes: { url: string } }) => img.attributes.url) || [],
      awards: attributes?.awards || [],
      certifications: attributes?.certifications || [],
      specialFeatures: attributes?.specialFeatures || [],
      socialMedia: attributes?.socialMedia,
      seo: attributes?.seo
    };
  }

  /**
   * Transform Strapi category content for hybrid structure
   */
  private transformCategoryContent(contentData: Record<string, unknown>): Record<string, unknown> {
    const attributes = contentData.attributes as Record<string, unknown>;
    return {
      detailedDescription: attributes?.description,
      image: (attributes?.image as StrapiImageData)?.data?.attributes?.url
    };
  }

  /**
   * Create hybrid menu item
   */
  private async createHybridMenuItem(operationalItem: Record<string, unknown>, restaurantId: string, contentItem?: Record<string, unknown>): Promise<HybridMenuItem> {
    // If content item not provided, try to fetch it
    if (!contentItem) {
      const fetchedContent = await cms.getMenuItemContent(String(operationalItem.id));
      contentItem = fetchedContent as unknown as Record<string, unknown> | undefined;
    }

    return {
      ...(operationalItem as unknown as HybridMenuItem),
      content: contentItem ? this.transformMenuItemContent(contentItem) : undefined,
      source: 'hybrid',
      hasRichContent: !!contentItem
    };
  }

  /**
   * Transform Strapi menu item content for hybrid structure
   */
  private transformMenuItemContent(contentData: Record<string, unknown>): Record<string, unknown> {
    const attributes = contentData.attributes as Record<string, unknown>;
    return {
      detailedDescription: attributes?.detailedDescription,
      images: (attributes?.images as StrapiImagesData)?.data?.map((img: { attributes: { url: string } }) => img.attributes.url) || [],
      ingredients: attributes?.ingredients || [],
      allergens: attributes?.allergens || [],
      nutritionalInfo: attributes?.nutritionalInfo,
      preparationSteps: attributes?.preparationSteps || [],
      chefNotes: attributes?.chefNotes,
      tags: attributes?.tags || [],
      isVegetarian: attributes?.isVegetarian,
      isVegan: attributes?.isVegan,
      isGlutenFree: attributes?.isGlutenFree,
      spiceLevel: attributes?.spiceLevel
    };
  }
}

// Export singleton instance
export const hybridResolver = new HybridDataResolver();

// Export default resolver
export default hybridResolver;

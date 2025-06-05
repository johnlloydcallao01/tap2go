/**
 * Hybrid Data Resolver for Tap2Go
 * Combines Firebase operational data with Strapi content data
 */

import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { cms } from './index';
import { strapiCache } from '../strapi/cache';

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
    awards?: any[];
    certifications?: any[];
    specialFeatures?: any[];
    socialMedia?: any;
    seo?: any;
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
    ingredients?: any[];
    allergens?: any[];
    nutritionalInfo?: any;
    preparationSteps?: string[];
    chefNotes?: string;
    tags?: any[];
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
  private cache = strapiCache;

  /**
   * Get complete restaurant data (Firebase + Strapi)
   */
  async getRestaurantComplete(restaurantId: string): Promise<HybridRestaurant | null> {
    try {
      // Check cache first
      const cacheKey = `hybrid:restaurant:${restaurantId}`;
      const cached = await this.cache.get<HybridRestaurant>(cacheKey);
      if (cached) {
        return cached;
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
        ...operationalData,
        content: contentData ? this.transformRestaurantContent(contentData) : undefined,
        source: 'hybrid',
        lastUpdated: new Date().toISOString(),
        hasRichContent: !!contentData
      };

      // Cache the result for 15 minutes
      await this.cache.set(cacheKey, hybridRestaurant, 900);

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
      const cached = await this.cache.get<HybridMenuCategory[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Get operational menu data from Firebase
      const operationalCategories = await this.getFirebaseMenuCategories(restaurantId);
      const operationalItems = await this.getFirebaseMenuItems(restaurantId);

      // Get content data from Strapi
      const contentCategories = await cms.getMenuCategories(restaurantId);

      // Merge categories with content
      const hybridCategories: HybridMenuCategory[] = operationalCategories.map(category => {
        const contentCategory = contentCategories.find(c => 
          c.attributes.firebaseId === category.id
        );

        // Get items for this category
        const categoryItems = operationalItems.filter(item => item.category === category.id);

        return {
          ...category,
          content: contentCategory ? this.transformCategoryContent(contentCategory) : undefined,
          items: categoryItems.map(item => this.createHybridMenuItem(item, restaurantId)),
          source: 'hybrid',
          hasRichContent: !!contentCategory
        };
      });

      // Cache the result for 30 minutes
      await this.cache.set(cacheKey, hybridCategories, 1800);

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

      return this.createHybridMenuItem(operationalItem, restaurantId, contentItem);
    } catch (error) {
      console.error('Error getting complete menu item data:', error);
      return null;
    }
  }

  /**
   * Search restaurants with content
   */
  async searchRestaurantsWithContent(searchQuery: string, location?: { lat: number; lng: number }): Promise<HybridRestaurant[]> {
    try {
      // Get restaurants from Firebase (this would include search logic)
      const firebaseRestaurants = await this.searchFirebaseRestaurants(searchQuery, location);

      // Enhance with content data
      const hybridRestaurants = await Promise.all(
        firebaseRestaurants.map(async (restaurant) => {
          const contentData = await cms.getRestaurantContent(restaurant.id);
          
          return {
            ...restaurant,
            content: contentData ? this.transformRestaurantContent(contentData) : undefined,
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
  private async getFirebaseRestaurant(restaurantId: string): Promise<any | null> {
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
  private async getFirebaseMenuCategories(restaurantId: string): Promise<any[]> {
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
  private async getFirebaseMenuItems(restaurantId: string): Promise<any[]> {
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
  private async getFirebaseMenuItem(restaurantId: string, itemId: string): Promise<any | null> {
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
  private async searchFirebaseRestaurants(searchQuery: string, location?: { lat: number; lng: number }): Promise<any[]> {
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
  private transformRestaurantContent(contentData: any): any {
    return {
      story: contentData.attributes.story,
      longDescription: contentData.attributes.longDescription,
      heroImage: contentData.attributes.heroImage?.data?.attributes?.url,
      gallery: contentData.attributes.gallery?.data?.map((img: any) => img.attributes.url) || [],
      awards: contentData.attributes.awards || [],
      certifications: contentData.attributes.certifications || [],
      specialFeatures: contentData.attributes.specialFeatures || [],
      socialMedia: contentData.attributes.socialMedia,
      seo: contentData.attributes.seo
    };
  }

  /**
   * Transform Strapi category content for hybrid structure
   */
  private transformCategoryContent(contentData: any): any {
    return {
      detailedDescription: contentData.attributes.description,
      image: contentData.attributes.image?.data?.attributes?.url
    };
  }

  /**
   * Create hybrid menu item
   */
  private async createHybridMenuItem(operationalItem: any, restaurantId: string, contentItem?: any): Promise<HybridMenuItem> {
    // If content item not provided, try to fetch it
    if (!contentItem) {
      contentItem = await cms.getMenuItemContent(operationalItem.id);
    }

    return {
      ...operationalItem,
      content: contentItem ? this.transformMenuItemContent(contentItem) : undefined,
      source: 'hybrid',
      hasRichContent: !!contentItem
    };
  }

  /**
   * Transform Strapi menu item content for hybrid structure
   */
  private transformMenuItemContent(contentData: any): any {
    return {
      detailedDescription: contentData.attributes.detailedDescription,
      images: contentData.attributes.images?.data?.map((img: any) => img.attributes.url) || [],
      ingredients: contentData.attributes.ingredients || [],
      allergens: contentData.attributes.allergens || [],
      nutritionalInfo: contentData.attributes.nutritionalInfo,
      preparationSteps: contentData.attributes.preparationSteps || [],
      chefNotes: contentData.attributes.chefNotes,
      tags: contentData.attributes.tags || [],
      isVegetarian: contentData.attributes.isVegetarian,
      isVegan: contentData.attributes.isVegan,
      isGlutenFree: contentData.attributes.isGlutenFree,
      spiceLevel: contentData.attributes.spiceLevel
    };
  }
}

// Export singleton instance
export const hybridResolver = new HybridDataResolver();

// Export default resolver
export default hybridResolver;

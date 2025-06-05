/**
 * CMS Abstraction Layer for Tap2Go
 * Provides a unified interface for content management operations
 */

import { strapiClient } from '../strapi/client';
import { strapiCache } from '../strapi/cache';
import {
  RestaurantContent,
  MenuCategoryContent,
  MenuItemContent,
  PromotionContent,
  BlogPost,
  StaticPage,
  HomepageBanner,
  StrapiQueryParams
} from '../strapi/types';

/**
 * CMS Interface - defines the contract for content management operations
 */
export interface CMSInterface {
  // Restaurant content operations
  getRestaurantContent(firebaseId: string): Promise<RestaurantContent | null>;
  getRestaurantBySlug(slug: string): Promise<RestaurantContent | null>;
  createRestaurantContent(data: Partial<RestaurantContent>): Promise<RestaurantContent>;
  updateRestaurantContent(id: number, data: Partial<RestaurantContent>): Promise<RestaurantContent>;
  
  // Menu content operations
  getMenuCategories(restaurantFirebaseId: string): Promise<MenuCategoryContent[]>;
  getMenuItems(categoryFirebaseId: string): Promise<MenuItemContent[]>;
  getMenuItemContent(firebaseId: string): Promise<MenuItemContent | null>;
  
  // Promotion operations
  getActivePromotions(): Promise<PromotionContent[]>;
  getPromotionsByRestaurant(restaurantFirebaseId: string): Promise<PromotionContent[]>;
  
  // Blog operations
  getBlogPosts(params?: StrapiQueryParams): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | null>;
  getFeaturedBlogPosts(): Promise<BlogPost[]>;
  
  // Static page operations
  getStaticPage(slug: string): Promise<StaticPage | null>;
  getNavigationPages(): Promise<StaticPage[]>;
  
  // Homepage content
  getHomepageBanners(): Promise<HomepageBanner[]>;
  
  // Search operations
  searchContent(query: string, contentTypes?: string[]): Promise<any[]>;
  
  // Cache operations
  invalidateCache(type: string, id?: string): Promise<void>;
}

/**
 * Strapi CMS Implementation
 */
export class StrapiCMS implements CMSInterface {
  private client = strapiClient;
  private cache = strapiCache;

  /**
   * Get restaurant content by Firebase ID
   */
  async getRestaurantContent(firebaseId: string): Promise<RestaurantContent | null> {
    try {
      // Check cache first
      const cached = await this.cache.getRestaurantContent(firebaseId);
      if (cached) {
        return cached;
      }

      // Fetch from Strapi
      const response = await this.client.get<RestaurantContent[]>('/restaurant-contents', {
        filters: {
          firebaseId: { $eq: firebaseId }
        },
        populate: [
          'heroImage',
          'gallery',
          'awards',
          'awards.image',
          'certifications',
          'certifications.certificateImage',
          'specialFeatures',
          'socialMedia',
          'seo',
          'seo.metaImage'
        ]
      });

      const restaurant = response.data[0] || null;
      
      // Cache the result
      if (restaurant) {
        await this.cache.cacheRestaurantContent(firebaseId, restaurant);
      }

      return restaurant;
    } catch (error) {
      console.error('Error fetching restaurant content:', error);
      return null;
    }
  }

  /**
   * Get restaurant content by slug
   */
  async getRestaurantBySlug(slug: string): Promise<RestaurantContent | null> {
    try {
      const response = await this.client.get<RestaurantContent[]>('/restaurant-contents', {
        filters: {
          slug: { $eq: slug }
        },
        populate: '*'
      });

      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching restaurant by slug:', error);
      return null;
    }
  }

  /**
   * Create restaurant content
   */
  async createRestaurantContent(data: Partial<RestaurantContent>): Promise<RestaurantContent> {
    try {
      const response = await this.client.post<RestaurantContent>('/restaurant-contents', data);
      
      // Invalidate cache
      if (data.attributes?.firebaseId) {
        await this.cache.invalidateRestaurantCache(data.attributes.firebaseId);
      }

      return response.data;
    } catch (error) {
      console.error('Error creating restaurant content:', error);
      throw error;
    }
  }

  /**
   * Update restaurant content
   */
  async updateRestaurantContent(id: number, data: Partial<RestaurantContent>): Promise<RestaurantContent> {
    try {
      const response = await this.client.put<RestaurantContent>(`/restaurant-contents/${id}`, data);
      
      // Invalidate cache
      if (data.attributes?.firebaseId) {
        await this.cache.invalidateRestaurantCache(data.attributes.firebaseId);
      }

      return response.data;
    } catch (error) {
      console.error('Error updating restaurant content:', error);
      throw error;
    }
  }

  /**
   * Get menu categories for a restaurant
   */
  async getMenuCategories(restaurantFirebaseId: string): Promise<MenuCategoryContent[]> {
    try {
      // Check cache first
      const cached = await this.cache.getMenuContent(restaurantFirebaseId);
      if (cached) {
        return cached;
      }

      const response = await this.client.get<MenuCategoryContent[]>('/menu-category-contents', {
        filters: {
          restaurant: {
            firebaseId: { $eq: restaurantFirebaseId }
          }
        },
        populate: ['image', 'restaurant'],
        sort: ['sortOrder:asc']
      });

      const categories = response.data;
      
      // Cache the result
      await this.cache.cacheMenuContent(restaurantFirebaseId, categories);

      return categories;
    } catch (error) {
      console.error('Error fetching menu categories:', error);
      return [];
    }
  }

  /**
   * Get menu items for a category
   */
  async getMenuItems(categoryFirebaseId: string): Promise<MenuItemContent[]> {
    try {
      const response = await this.client.get<MenuItemContent[]>('/menu-item-contents', {
        filters: {
          category: {
            firebaseId: { $eq: categoryFirebaseId }
          }
        },
        populate: [
          'images',
          'ingredients',
          'allergens',
          'nutritionalInfo',
          'tags',
          'category',
          'restaurant',
          'seo'
        ]
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }
  }

  /**
   * Get menu item content by Firebase ID
   */
  async getMenuItemContent(firebaseId: string): Promise<MenuItemContent | null> {
    try {
      const response = await this.client.get<MenuItemContent[]>('/menu-item-contents', {
        filters: {
          firebaseId: { $eq: firebaseId }
        },
        populate: '*'
      });

      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching menu item content:', error);
      return null;
    }
  }

  /**
   * Get active promotions
   */
  async getActivePromotions(): Promise<PromotionContent[]> {
    try {
      const response = await this.client.get<PromotionContent[]>('/promotion-contents', {
        filters: {
          isActive: { $eq: true },
          validFrom: { $lte: new Date().toISOString() },
          validUntil: { $gte: new Date().toISOString() }
        },
        populate: [
          'image',
          'bannerImage',
          'restaurants',
          'categories',
          'menuItems'
        ],
        sort: ['createdAt:desc']
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      return [];
    }
  }

  /**
   * Get promotions for a specific restaurant
   */
  async getPromotionsByRestaurant(restaurantFirebaseId: string): Promise<PromotionContent[]> {
    try {
      const response = await this.client.get<PromotionContent[]>('/promotion-contents', {
        filters: {
          isActive: { $eq: true },
          restaurants: {
            firebaseId: { $eq: restaurantFirebaseId }
          }
        },
        populate: ['image', 'bannerImage']
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant promotions:', error);
      return [];
    }
  }

  /**
   * Get blog posts
   */
  async getBlogPosts(params?: StrapiQueryParams): Promise<BlogPost[]> {
    try {
      const defaultParams: StrapiQueryParams = {
        filters: {
          isPublished: { $eq: true }
        },
        populate: [
          'featuredImage',
          'author',
          'author.avatar',
          'categories',
          'tags',
          'relatedRestaurants'
        ],
        sort: ['publishedAt:desc'],
        ...params
      };

      const response = await this.client.get<BlogPost[]>('/blog-posts', defaultParams);
      return response.data;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  }

  /**
   * Get single blog post by slug
   */
  async getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
      const response = await this.client.get<BlogPost[]>('/blog-posts', {
        filters: {
          slug: { $eq: slug },
          isPublished: { $eq: true }
        },
        populate: '*'
      });

      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  }

  /**
   * Get featured blog posts
   */
  async getFeaturedBlogPosts(): Promise<BlogPost[]> {
    try {
      const response = await this.client.get<BlogPost[]>('/blog-posts', {
        filters: {
          isPublished: { $eq: true },
          isFeatured: { $eq: true }
        },
        populate: ['featuredImage', 'author', 'categories'],
        sort: ['publishedAt:desc'],
        pagination: { limit: 6 }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching featured blog posts:', error);
      return [];
    }
  }

  /**
   * Get static page by slug
   */
  async getStaticPage(slug: string): Promise<StaticPage | null> {
    try {
      const response = await this.client.get<StaticPage[]>('/static-pages', {
        filters: {
          slug: { $eq: slug },
          isPublished: { $eq: true }
        },
        populate: ['seo']
      });

      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching static page:', error);
      return null;
    }
  }

  /**
   * Get navigation pages
   */
  async getNavigationPages(): Promise<StaticPage[]> {
    try {
      const response = await this.client.get<StaticPage[]>('/static-pages', {
        filters: {
          isPublished: { $eq: true },
          showInNavigation: { $eq: true }
        },
        sort: ['navigationOrder:asc']
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching navigation pages:', error);
      return [];
    }
  }

  /**
   * Get homepage banners
   */
  async getHomepageBanners(): Promise<HomepageBanner[]> {
    try {
      const response = await this.client.get<HomepageBanner[]>('/homepage-banners', {
        filters: {
          isActive: { $eq: true },
          $or: [
            { startDate: { $null: true } },
            { startDate: { $lte: new Date().toISOString() } }
          ],
          $and: [
            {
              $or: [
                { endDate: { $null: true } },
                { endDate: { $gte: new Date().toISOString() } }
              ]
            }
          ]
        },
        populate: ['image', 'mobileImage'],
        sort: ['sortOrder:asc']
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching homepage banners:', error);
      return [];
    }
  }

  /**
   * Search content across multiple content types
   */
  async searchContent(query: string, contentTypes?: string[]): Promise<any[]> {
    try {
      // This would require implementing search functionality in Strapi
      // For now, return empty array
      console.warn('Search functionality not yet implemented');
      return [];
    } catch (error) {
      console.error('Error searching content:', error);
      return [];
    }
  }

  /**
   * Invalidate cache
   */
  async invalidateCache(type: string, id?: string): Promise<void> {
    try {
      switch (type) {
        case 'restaurant':
          await this.cache.invalidateRestaurantCache(id);
          break;
        case 'menu':
          await this.cache.invalidateMenuCache(id);
          break;
        case 'blog':
          await this.cache.invalidateBlogCache();
          break;
        case 'promotion':
          await this.cache.invalidatePromotionCache();
          break;
        default:
          console.warn(`Unknown cache type: ${type}`);
      }
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }
}

// Export singleton instance
export const cms = new StrapiCMS();

// Export CMS interface for dependency injection
export { CMSInterface };

// Export default CMS instance
export default cms;

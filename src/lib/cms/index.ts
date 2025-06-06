/**
 * CMS Abstraction Layer for Tap2Go
 * Provides a unified interface for content management operations using custom CMS
 */

import { neonClient } from '../neon/client';
import {
  RestaurantContentOps,
  MenuCategoryOps,
  MenuItemOps,
  BlogPostOps,
  PromotionOps
} from '../neon/operations';

interface CMSQueryParams {
  filters?: Record<string, unknown>;
  sort?: string[];
  pagination?: {
    limit?: number;
    offset?: number;
  };
}

interface RestaurantContent {
  id: number;
  attributes: Record<string, unknown>;
}

interface MenuCategoryContent {
  id: number;
  attributes: Record<string, unknown>;
}

interface MenuItemContent {
  id: number;
  attributes: Record<string, unknown>;
}

interface PromotionContent {
  id: number;
  attributes: Record<string, unknown>;
}

interface BlogPost {
  id: number;
  attributes: Record<string, unknown>;
}

interface StaticPage {
  id: number;
  attributes: Record<string, unknown>;
}

interface HomepageBanner {
  id: number;
  attributes: Record<string, unknown>;
}

/**
 * CMS Interface - defines the contract for content management operations
 */
interface CMSInterface {
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
  getBlogPosts(params?: CMSQueryParams): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | null>;
  getFeaturedBlogPosts(): Promise<BlogPost[]>;
  
  // Static page operations
  getStaticPage(slug: string): Promise<StaticPage | null>;
  getNavigationPages(): Promise<StaticPage[]>;
  
  // Homepage content
  getHomepageBanners(): Promise<HomepageBanner[]>;
  
  // Search operations
  searchContent(query: string, contentTypes?: string[]): Promise<Record<string, unknown>[]>;
  
  // Cache operations
  invalidateCache(type: string, id?: string): Promise<void>;
}

/**
 * Custom CMS Implementation using Neon PostgreSQL
 */
export class CustomCMS implements CMSInterface {
  private client = neonClient;

  /**
   * Get restaurant content by Firebase ID
   */
  async getRestaurantContent(firebaseId: string): Promise<RestaurantContent | null> {
    try {
      const result = await RestaurantContentOps.getByFirebaseId(firebaseId);
      if (!result) return null;

      return {
        id: result.id!,
        attributes: {
          firebaseId: result.firebase_id,
          slug: result.slug,
          story: result.story,
          longDescription: result.long_description,
          heroImage: result.hero_image_url,
          gallery: result.gallery_images,
          awards: result.awards,
          certifications: result.certifications,
          specialFeatures: result.special_features,
          socialMedia: result.social_media,
          seo: result.seo_data,
          isPublished: result.is_published,
          publishedAt: result.published_at,
          createdAt: result.created_at,
          updatedAt: result.updated_at
        }
      };
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
      const result = await RestaurantContentOps.getBySlug(slug);
      if (!result) return null;

      return {
        id: result.id!,
        attributes: {
          firebaseId: result.firebase_id,
          slug: result.slug,
          story: result.story,
          longDescription: result.long_description,
          heroImage: result.hero_image_url,
          gallery: result.gallery_images,
          awards: result.awards,
          certifications: result.certifications,
          specialFeatures: result.special_features,
          socialMedia: result.social_media,
          seo: result.seo_data
        }
      };
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
      const attributes = data.attributes as Record<string, unknown>;
      const result = await RestaurantContentOps.create({
        firebase_id: String(attributes?.firebaseId || ''),
        slug: String(attributes?.slug || ''),
        story: attributes?.story as string | undefined,
        long_description: attributes?.longDescription as string | undefined,
        hero_image_url: attributes?.heroImage as string | undefined,
        gallery_images: attributes?.gallery as Record<string, unknown>[] | undefined,
        awards: attributes?.awards as Record<string, unknown>[] | undefined,
        certifications: attributes?.certifications as Record<string, unknown>[] | undefined,
        special_features: attributes?.specialFeatures as Record<string, unknown>[] | undefined,
        social_media: attributes?.socialMedia as Record<string, unknown> | undefined,
        seo_data: attributes?.seo as Record<string, unknown> | undefined,
        is_published: Boolean(attributes?.isPublished || false)
      });

      return {
        id: result.id!,
        attributes: {
          firebaseId: result.firebase_id,
          slug: result.slug,
          story: result.story,
          longDescription: result.long_description,
          heroImage: result.hero_image_url,
          gallery: result.gallery_images,
          awards: result.awards,
          certifications: result.certifications,
          specialFeatures: result.special_features,
          socialMedia: result.social_media,
          seo: result.seo_data,
          isPublished: result.is_published,
          publishedAt: result.published_at,
          createdAt: result.created_at,
          updatedAt: result.updated_at
        }
      };
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
      const attributes = data.attributes as Record<string, unknown>;
      const result = await RestaurantContentOps.update(id, {
        slug: attributes?.slug as string | undefined,
        story: attributes?.story as string | undefined,
        long_description: attributes?.longDescription as string | undefined,
        hero_image_url: attributes?.heroImage as string | undefined,
        gallery_images: attributes?.gallery as Record<string, unknown>[] | undefined,
        awards: attributes?.awards as Record<string, unknown>[] | undefined,
        certifications: attributes?.certifications as Record<string, unknown>[] | undefined,
        special_features: attributes?.specialFeatures as Record<string, unknown>[] | undefined,
        social_media: attributes?.socialMedia as Record<string, unknown> | undefined,
        seo_data: attributes?.seo as Record<string, unknown> | undefined,
        is_published: attributes?.isPublished as boolean | undefined
      });

      return {
        id: result.id!,
        attributes: {
          firebaseId: result.firebase_id,
          slug: result.slug,
          story: result.story,
          longDescription: result.long_description,
          heroImage: result.hero_image_url,
          gallery: result.gallery_images,
          awards: result.awards,
          certifications: result.certifications,
          specialFeatures: result.special_features,
          socialMedia: result.social_media,
          seo: result.seo_data,
          isPublished: result.is_published,
          publishedAt: result.published_at,
          createdAt: result.created_at,
          updatedAt: result.updated_at
        }
      };
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
      const results = await MenuCategoryOps.getByRestaurant(restaurantFirebaseId);
      return results.map(result => ({
        id: result.id!,
        attributes: {
          restaurantFirebaseId: result.restaurant_firebase_id,
          slug: result.slug,
          description: result.description,
          longDescription: result.long_description,
          image: result.image_url,
          seo: result.seo_data
        }
      }));
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
      const results = await MenuItemOps.getByCategory(categoryFirebaseId);
      return results.map(result => ({
        id: result.id!,
        attributes: {
          categoryFirebaseId: result.category_firebase_id,
          restaurantFirebaseId: result.restaurant_firebase_id,
          slug: result.slug,
          description: result.description,
          longDescription: result.detailed_description,
          images: result.images,
          ingredients: result.ingredients,
          allergens: result.allergens,
          nutritionalInfo: result.nutritional_info,
          preparationSteps: result.preparation_steps,
          chefNotes: result.chef_notes,
          tags: result.tags,
          seo: result.seo_data
        }
      }));
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
      const result = await MenuItemOps.getByFirebaseId(firebaseId);
      if (!result) return null;

      return {
        id: result.id!,
        attributes: {
          categoryFirebaseId: result.category_firebase_id,
          restaurantFirebaseId: result.restaurant_firebase_id,
          slug: result.slug,
          description: result.description,
          longDescription: result.detailed_description,
          images: result.images,
          ingredients: result.ingredients,
          allergens: result.allergens,
          nutritionalInfo: result.nutritional_info,
          preparationSteps: result.preparation_steps,
          chefNotes: result.chef_notes,
          tags: result.tags,
          seo: result.seo_data
        }
      };
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
      const results = await PromotionOps.getActive();
      return results.map(result => ({
        id: result.id!,
        attributes: {
          title: result.title,
          description: result.description,
          longDescription: result.long_description,
          discountType: result.discount_type,
          discountValue: result.discount_value,
          validFrom: result.valid_from,
          validUntil: result.valid_until,
          isActive: result.is_active,
          image: result.image_url,
          bannerImage: result.banner_image_url,
          targetRestaurants: result.target_restaurants,
          targetCategories: result.target_categories,
          targetMenuItems: result.target_menu_items,
          seo: result.seo_data
        }
      }));
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
      const results = await PromotionOps.getByRestaurant(restaurantFirebaseId);
      return results.map(result => ({
        id: result.id!,
        attributes: {
          title: result.title,
          description: result.description,
          longDescription: result.long_description,
          discountType: result.discount_type,
          discountValue: result.discount_value,
          validFrom: result.valid_from,
          validUntil: result.valid_until,
          isActive: result.is_active,
          image: result.image_url,
          bannerImage: result.banner_image_url,
          targetRestaurants: result.target_restaurants,
          targetCategories: result.target_categories,
          targetMenuItems: result.target_menu_items,
          seo: result.seo_data
        }
      }));
    } catch (error) {
      console.error('Error fetching restaurant promotions:', error);
      return [];
    }
  }

  /**
   * Get blog posts
   */
  async getBlogPosts(params?: CMSQueryParams): Promise<BlogPost[]> {
    try {
      const limit = params?.pagination?.limit || 10;
      const offset = params?.pagination?.offset || 0;

      const results = await BlogPostOps.listPublished(limit, offset);
      return results.map(result => ({
        id: result.id!,
        attributes: {
          title: result.title,
          slug: result.slug,
          content: result.content,
          excerpt: result.excerpt,
          featuredImage: result.featured_image_url,
          authorName: result.author_name,
          authorBio: result.author_bio,
          authorAvatar: result.author_avatar_url,
          categories: result.categories,
          tags: result.tags,
          relatedRestaurants: result.related_restaurants,
          readingTime: result.reading_time,
          isPublished: result.is_published,
          isFeatured: result.is_featured,
          seo: result.seo_data,
          publishedAt: result.published_at,
          createdAt: result.created_at,
          updatedAt: result.updated_at
        }
      }));
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
      const result = await BlogPostOps.getBySlug(slug);
      if (!result) return null;

      return {
        id: result.id!,
        attributes: {
          title: result.title,
          slug: result.slug,
          content: result.content,
          excerpt: result.excerpt,
          featuredImage: result.featured_image_url,
          authorName: result.author_name,
          authorBio: result.author_bio,
          authorAvatar: result.author_avatar_url,
          categories: result.categories,
          tags: result.tags,
          relatedRestaurants: result.related_restaurants,
          readingTime: result.reading_time,
          isPublished: result.is_published,
          isFeatured: result.is_featured,
          seo: result.seo_data,
          publishedAt: result.published_at,
          createdAt: result.created_at,
          updatedAt: result.updated_at
        }
      };
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
      const results = await BlogPostOps.getFeatured(6);
      return results.map(result => ({
        id: result.id!,
        attributes: {
          title: result.title,
          slug: result.slug,
          content: result.content,
          excerpt: result.excerpt,
          featuredImage: result.featured_image_url,
          authorName: result.author_name,
          authorBio: result.author_bio,
          authorAvatar: result.author_avatar_url,
          categories: result.categories,
          tags: result.tags,
          relatedRestaurants: result.related_restaurants,
          readingTime: result.reading_time,
          isPublished: result.is_published,
          isFeatured: result.is_featured,
          seo: result.seo_data,
          publishedAt: result.published_at,
          createdAt: result.created_at,
          updatedAt: result.updated_at
        }
      }));
    } catch (error) {
      console.error('Error fetching featured blog posts:', error);
      return [];
    }
  }

  /**
   * Get static page by slug
   */
  async getStaticPage(): Promise<StaticPage | null> {
    // Static pages not implemented in custom CMS yet
    console.warn('Static pages not yet implemented in custom CMS');
    return null;
  }

  /**
   * Get navigation pages
   */
  async getNavigationPages(): Promise<StaticPage[]> {
    // Navigation pages not implemented in custom CMS yet
    console.warn('Navigation pages not yet implemented in custom CMS');
    return [];
  }

  /**
   * Get homepage banners
   */
  async getHomepageBanners(): Promise<HomepageBanner[]> {
    // Homepage banners not implemented in custom CMS yet
    console.warn('Homepage banners not yet implemented in custom CMS');
    return [];
  }

  /**
   * Search content across multiple content types
   */
  async searchContent(): Promise<Record<string, unknown>[]> {
    // Search functionality not implemented in custom CMS yet
    console.warn('Search functionality not yet implemented in custom CMS');
    return [];
  }

  /**
   * Invalidate cache
   */
  async invalidateCache(type: string): Promise<void> {
    // Cache invalidation not implemented in custom CMS yet
    console.warn(`Cache invalidation for ${type} not yet implemented in custom CMS`);
  }
}

// Export singleton instance
export const cms = new CustomCMS();

// Export CMS interface for dependency injection
export type { CMSInterface };

// Export default CMS instance
export default cms;

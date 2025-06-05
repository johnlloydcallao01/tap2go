/**
 * Neon Database Operations for Tap2Go CMS
 * CRUD operations for CMS content using direct PostgreSQL queries
 */

import { neonClient } from './client';

// Types for database operations
export interface RestaurantContentRow {
  id?: number;
  firebase_id: string;
  slug: string;
  story?: string;
  long_description?: string;
  hero_image_url?: string;
  gallery_images?: any[];
  awards?: any[];
  certifications?: any[];
  special_features?: any[];
  social_media?: any;
  seo_data?: any;
  is_published?: boolean;
  published_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface MenuCategoryRow {
  id?: number;
  firebase_id: string;
  restaurant_firebase_id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface MenuItemRow {
  id?: number;
  firebase_id: string;
  category_firebase_id: string;
  restaurant_firebase_id: string;
  name: string;
  detailed_description?: string;
  short_description?: string;
  images?: any[];
  ingredients?: any[];
  allergens?: any[];
  nutritional_info?: any;
  preparation_steps?: any[];
  chef_notes?: string;
  tags?: any[];
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  spice_level?: string;
  preparation_time?: number;
  seo_data?: any;
  is_published?: boolean;
  published_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface BlogPostRow {
  id?: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  author_name?: string;
  author_bio?: string;
  author_avatar_url?: string;
  categories?: any[];
  tags?: any[];
  related_restaurants?: any[];
  reading_time?: number;
  is_published?: boolean;
  is_featured?: boolean;
  seo_data?: any;
  published_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface PromotionRow {
  id?: number;
  title: string;
  description: string;
  short_description?: string;
  image_url?: string;
  banner_image_url?: string;
  promotion_type: string;
  discount_type?: string;
  discount_value?: number;
  minimum_order_value?: number;
  valid_from: Date;
  valid_until: Date;
  is_active?: boolean;
  target_restaurants?: any[];
  target_categories?: any[];
  target_menu_items?: any[];
  max_usage_per_user?: number;
  total_usage_limit?: number;
  current_usage_count?: number;
  promo_code?: string;
  terms?: string;
  seo_data?: any;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Restaurant Content Operations
 */
export class RestaurantContentOps {
  /**
   * Create restaurant content
   */
  static async create(data: Omit<RestaurantContentRow, 'id' | 'created_at' | 'updated_at'>): Promise<RestaurantContentRow> {
    const sql = `
      INSERT INTO restaurant_contents (
        firebase_id, slug, story, long_description, hero_image_url,
        gallery_images, awards, certifications, special_features,
        social_media, seo_data, is_published, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const params = [
      data.firebase_id,
      data.slug,
      data.story,
      data.long_description,
      data.hero_image_url,
      JSON.stringify(data.gallery_images || []),
      JSON.stringify(data.awards || []),
      JSON.stringify(data.certifications || []),
      JSON.stringify(data.special_features || []),
      JSON.stringify(data.social_media || {}),
      JSON.stringify(data.seo_data || {}),
      data.is_published || false,
      data.published_at
    ];

    const result = await neonClient.queryOne<RestaurantContentRow>(sql, params);
    return result!;
  }

  /**
   * Get restaurant content by Firebase ID
   */
  static async getByFirebaseId(firebaseId: string): Promise<RestaurantContentRow | null> {
    const sql = 'SELECT * FROM restaurant_contents WHERE firebase_id = $1';
    return await neonClient.queryOne<RestaurantContentRow>(sql, [firebaseId]);
  }

  /**
   * Get restaurant content by slug
   */
  static async getBySlug(slug: string): Promise<RestaurantContentRow | null> {
    const sql = 'SELECT * FROM restaurant_contents WHERE slug = $1';
    return await neonClient.queryOne<RestaurantContentRow>(sql, [slug]);
  }

  /**
   * Update restaurant content
   */
  static async update(id: number, data: Partial<RestaurantContentRow>): Promise<RestaurantContentRow> {
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        if (key === 'gallery_images' || key === 'awards' || key === 'certifications' || 
            key === 'special_features' || key === 'social_media' || key === 'seo_data') {
          updateFields.push(`${key} = $${paramIndex}`);
          params.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = $${paramIndex}`);
          params.push(value);
        }
        paramIndex++;
      }
    });

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    const sql = `
      UPDATE restaurant_contents 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await neonClient.queryOne<RestaurantContentRow>(sql, params);
    return result!;
  }

  /**
   * Delete restaurant content
   */
  static async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM restaurant_contents WHERE id = $1';
    await neonClient.query(sql, [id]);
    return true;
  }

  /**
   * List all restaurant contents
   */
  static async list(limit: number = 50, offset: number = 0): Promise<RestaurantContentRow[]> {
    const sql = `
      SELECT * FROM restaurant_contents 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    return await neonClient.query<RestaurantContentRow>(sql, [limit, offset]);
  }
}

/**
 * Menu Category Operations
 */
export class MenuCategoryOps {
  /**
   * Create menu category
   */
  static async create(data: Omit<MenuCategoryRow, 'id' | 'created_at' | 'updated_at'>): Promise<MenuCategoryRow> {
    const sql = `
      INSERT INTO menu_categories (
        firebase_id, restaurant_firebase_id, name, description,
        image_url, sort_order, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const params = [
      data.firebase_id,
      data.restaurant_firebase_id,
      data.name,
      data.description,
      data.image_url,
      data.sort_order || 0,
      data.is_active !== false
    ];

    const result = await neonClient.queryOne<MenuCategoryRow>(sql, params);
    return result!;
  }

  /**
   * Get categories by restaurant Firebase ID
   */
  static async getByRestaurant(restaurantFirebaseId: string): Promise<MenuCategoryRow[]> {
    const sql = `
      SELECT * FROM menu_categories 
      WHERE restaurant_firebase_id = $1 AND is_active = true
      ORDER BY sort_order ASC, name ASC
    `;
    return await neonClient.query<MenuCategoryRow>(sql, [restaurantFirebaseId]);
  }

  /**
   * Get category by Firebase ID
   */
  static async getByFirebaseId(firebaseId: string): Promise<MenuCategoryRow | null> {
    const sql = 'SELECT * FROM menu_categories WHERE firebase_id = $1';
    return await neonClient.queryOne<MenuCategoryRow>(sql, [firebaseId]);
  }

  /**
   * Update menu category
   */
  static async update(id: number, data: Partial<MenuCategoryRow>): Promise<MenuCategoryRow> {
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    });

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    const sql = `
      UPDATE menu_categories 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await neonClient.queryOne<MenuCategoryRow>(sql, params);
    return result!;
  }
}

/**
 * Menu Item Operations
 */
export class MenuItemOps {
  /**
   * Create menu item
   */
  static async create(data: Omit<MenuItemRow, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItemRow> {
    const sql = `
      INSERT INTO menu_items (
        firebase_id, category_firebase_id, restaurant_firebase_id, name,
        detailed_description, short_description, images, ingredients,
        allergens, nutritional_info, preparation_steps, chef_notes,
        tags, is_vegetarian, is_vegan, is_gluten_free, spice_level,
        preparation_time, seo_data, is_published, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const params = [
      data.firebase_id,
      data.category_firebase_id,
      data.restaurant_firebase_id,
      data.name,
      data.detailed_description,
      data.short_description,
      JSON.stringify(data.images || []),
      JSON.stringify(data.ingredients || []),
      JSON.stringify(data.allergens || []),
      JSON.stringify(data.nutritional_info || {}),
      JSON.stringify(data.preparation_steps || []),
      data.chef_notes,
      JSON.stringify(data.tags || []),
      data.is_vegetarian || false,
      data.is_vegan || false,
      data.is_gluten_free || false,
      data.spice_level,
      data.preparation_time,
      JSON.stringify(data.seo_data || {}),
      data.is_published || false,
      data.published_at
    ];

    const result = await neonClient.queryOne<MenuItemRow>(sql, params);
    return result!;
  }

  /**
   * Get menu items by category
   */
  static async getByCategory(categoryFirebaseId: string): Promise<MenuItemRow[]> {
    const sql = `
      SELECT * FROM menu_items 
      WHERE category_firebase_id = $1 AND is_published = true
      ORDER BY name ASC
    `;
    return await neonClient.query<MenuItemRow>(sql, [categoryFirebaseId]);
  }

  /**
   * Get menu item by Firebase ID
   */
  static async getByFirebaseId(firebaseId: string): Promise<MenuItemRow | null> {
    const sql = 'SELECT * FROM menu_items WHERE firebase_id = $1';
    return await neonClient.queryOne<MenuItemRow>(sql, [firebaseId]);
  }

  /**
   * Get menu items by restaurant
   */
  static async getByRestaurant(restaurantFirebaseId: string): Promise<MenuItemRow[]> {
    const sql = `
      SELECT * FROM menu_items 
      WHERE restaurant_firebase_id = $1 AND is_published = true
      ORDER BY name ASC
    `;
    return await neonClient.query<MenuItemRow>(sql, [restaurantFirebaseId]);
  }
}

/**
 * Blog Post Operations
 */
export class BlogPostOps {
  /**
   * Create blog post
   */
  static async create(data: Omit<BlogPostRow, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPostRow> {
    const sql = `
      INSERT INTO blog_posts (
        title, slug, content, excerpt, featured_image_url,
        author_name, author_bio, author_avatar_url, categories,
        tags, related_restaurants, reading_time, is_published,
        is_featured, seo_data, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const params = [
      data.title,
      data.slug,
      data.content,
      data.excerpt,
      data.featured_image_url,
      data.author_name,
      data.author_bio,
      data.author_avatar_url,
      JSON.stringify(data.categories || []),
      JSON.stringify(data.tags || []),
      JSON.stringify(data.related_restaurants || []),
      data.reading_time,
      data.is_published || false,
      data.is_featured || false,
      JSON.stringify(data.seo_data || {}),
      data.published_at
    ];

    const result = await neonClient.queryOne<BlogPostRow>(sql, params);
    return result!;
  }

  /**
   * Get blog post by slug
   */
  static async getBySlug(slug: string): Promise<BlogPostRow | null> {
    const sql = 'SELECT * FROM blog_posts WHERE slug = $1 AND is_published = true';
    return await neonClient.queryOne<BlogPostRow>(sql, [slug]);
  }

  /**
   * List published blog posts
   */
  static async listPublished(limit: number = 10, offset: number = 0): Promise<BlogPostRow[]> {
    const sql = `
      SELECT * FROM blog_posts 
      WHERE is_published = true 
      ORDER BY published_at DESC, created_at DESC
      LIMIT $1 OFFSET $2
    `;
    return await neonClient.query<BlogPostRow>(sql, [limit, offset]);
  }

  /**
   * Get featured blog posts
   */
  static async getFeatured(limit: number = 6): Promise<BlogPostRow[]> {
    const sql = `
      SELECT * FROM blog_posts 
      WHERE is_published = true AND is_featured = true
      ORDER BY published_at DESC, created_at DESC
      LIMIT $1
    `;
    return await neonClient.query<BlogPostRow>(sql, [limit]);
  }
}

/**
 * Promotion Operations
 */
export class PromotionOps {
  /**
   * Create promotion
   */
  static async create(data: Omit<PromotionRow, 'id' | 'created_at' | 'updated_at'>): Promise<PromotionRow> {
    const sql = `
      INSERT INTO promotions (
        title, description, short_description, image_url, banner_image_url,
        promotion_type, discount_type, discount_value, minimum_order_value,
        valid_from, valid_until, is_active, target_restaurants,
        target_categories, target_menu_items, max_usage_per_user,
        total_usage_limit, current_usage_count, promo_code, terms, seo_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const params = [
      data.title,
      data.description,
      data.short_description,
      data.image_url,
      data.banner_image_url,
      data.promotion_type,
      data.discount_type,
      data.discount_value,
      data.minimum_order_value,
      data.valid_from,
      data.valid_until,
      data.is_active !== false,
      JSON.stringify(data.target_restaurants || []),
      JSON.stringify(data.target_categories || []),
      JSON.stringify(data.target_menu_items || []),
      data.max_usage_per_user,
      data.total_usage_limit,
      data.current_usage_count || 0,
      data.promo_code,
      data.terms,
      JSON.stringify(data.seo_data || {})
    ];

    const result = await neonClient.queryOne<PromotionRow>(sql, params);
    return result!;
  }

  /**
   * Get active promotions
   */
  static async getActive(): Promise<PromotionRow[]> {
    const sql = `
      SELECT * FROM promotions 
      WHERE is_active = true 
        AND valid_from <= NOW() 
        AND valid_until >= NOW()
      ORDER BY created_at DESC
    `;
    return await neonClient.query<PromotionRow>(sql);
  }

  /**
   * Get promotions by restaurant
   */
  static async getByRestaurant(restaurantFirebaseId: string): Promise<PromotionRow[]> {
    const sql = `
      SELECT * FROM promotions 
      WHERE is_active = true 
        AND valid_from <= NOW() 
        AND valid_until >= NOW()
        AND (
          target_restaurants = '[]' 
          OR target_restaurants::jsonb ? $1
        )
      ORDER BY created_at DESC
    `;
    return await neonClient.query<PromotionRow>(sql, [restaurantFirebaseId]);
  }
}

// Export all operations
export {
  RestaurantContentOps,
  MenuCategoryOps,
  MenuItemOps,
  BlogPostOps,
  PromotionOps
};

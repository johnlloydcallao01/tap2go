/**
 * Database Operations for Tap2Go
 * High-level business logic operations using the custom database client
 *
 * Note: This file handles CMS operations using Direct SQL
 * Business logic operations (Users, Orders, Restaurants) are handled by Firestore
 */

import { db } from './hybrid-client';

// Define types for our blog post operations
export interface BlogPost {
  id: number;
  uuid?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  author_name?: string;
  author_email?: string;
  featured_image_url?: string;
  categories?: string[];
  tags?: string[];
  is_featured?: boolean;
  is_sticky?: boolean;
  view_count?: number;
  reading_time?: number;
  published_at?: Date | null;
  scheduled_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

// ===== CMS OPERATIONS (DIRECT SQL) =====
// Only BlogPost operations are handled by Direct SQL
// All business logic operations are handled by Firestore

export class BlogPostOperations {
  /**
   * Create a new blog post
   */
  static async createBlogPost(postData: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    status?: string;
    authorId?: string;
    authorName?: string;
    authorEmail?: string;
    featuredImageUrl?: string;
    categories?: Record<string, unknown>[];
    tags?: Record<string, unknown>[];
    seoTitle?: string;
    seoDescription?: string;
  }) {
    const result = await db.sql(`
      INSERT INTO blog_posts (
        title, slug, content, excerpt, status,
        author_id, author_name, author_email, featured_image_url,
        categories, tags, seo_title, seo_description,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
      ) RETURNING *
    `, [
      postData.title,
      postData.slug,
      postData.content,
      postData.excerpt || '',
      postData.status || 'draft',
      postData.authorId || null,
      postData.authorName || 'Admin',
      postData.authorEmail || '',
      postData.featuredImageUrl || '',
      JSON.stringify(postData.categories || []),
      JSON.stringify(postData.tags || []),
      postData.seoTitle || '',
      postData.seoDescription || ''
    ]);

    return result[0] as unknown as BlogPost;
  }

  /**
   * Get blog post by ID
   */
  static async getBlogPostById(postId: number) {
    const result = await db.sql(`
      SELECT * FROM blog_posts WHERE id = $1 AND deleted_at IS NULL
    `, [postId]);

    return (result[0] as unknown as BlogPost) || null;
  }

  /**
   * Get blog post by slug
   */
  static async getBlogPostBySlug(slug: string) {
    const result = await db.sql(`
      SELECT * FROM blog_posts WHERE slug = $1 AND deleted_at IS NULL
    `, [slug]);

    return (result[0] as unknown as BlogPost) || null;
  }

  /**
   * Update blog post
   */
  static async updateBlogPost(postId: number, updateData: Partial<BlogPost>) {
    const updateFields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        const dbField = key === 'authorName' ? 'author_name' :
                       key === 'authorEmail' ? 'author_email' :
                       key === 'featuredImageUrl' ? 'featured_image_url' :
                       key === 'isFeatured' ? 'is_featured' :
                       key === 'isSticky' ? 'is_sticky' :
                       key === 'viewCount' ? 'view_count' :
                       key === 'readingTime' ? 'reading_time' :
                       key === 'publishedAt' ? 'published_at' :
                       key === 'scheduledAt' ? 'scheduled_at' :
                       key === 'deletedAt' ? 'deleted_at' :
                       key === 'seoTitle' ? 'seo_title' :
                       key === 'seoDescription' ? 'seo_description' :
                       key;

        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(Array.isArray(value) ? JSON.stringify(value) : value);
        paramIndex++;
      }
    });

    updateFields.push(`updated_at = NOW()`);
    values.push(postId);

    const result = await db.sql(`
      UPDATE blog_posts
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    return result[0] as unknown as BlogPost;
  }

  /**
   * Delete blog post (soft delete)
   */
  static async deleteBlogPost(postId: number) {
    const result = await db.sql(`
      UPDATE blog_posts
      SET deleted_at = NOW(), updated_at = NOW(), status = 'trash'
      WHERE id = $1
      RETURNING *
    `, [postId]);

    return result[0] as unknown as BlogPost;
  }
  /**
   * Get published blog posts with pagination
   */
  static async getPublishedPosts(params: {
    limit?: number;
    offset?: number;
    category?: string;
    tag?: string;
  } = {}) {
    const { limit = 10, offset = 0, category, tag } = params;

    let whereClause = 'WHERE status = $1 AND deleted_at IS NULL AND published_at <= NOW()';
    const queryParams: unknown[] = ['published', limit, offset];
    let paramIndex = 4;

    if (category) {
      whereClause += ` AND categories @> $${paramIndex}`;
      queryParams.push(JSON.stringify([category]));
      paramIndex++;
    }

    if (tag) {
      whereClause += ` AND tags @> $${paramIndex}`;
      queryParams.push(JSON.stringify([tag]));
      paramIndex++;
    }

    const result = await db.sql(`
      SELECT * FROM blog_posts
      ${whereClause}
      ORDER BY published_at DESC
      LIMIT $2 OFFSET $3
    `, queryParams);

    return result as unknown as BlogPost[];
  }

  /**
   * Get all blog posts for admin (including drafts)
   */
  static async getAllPosts(params: {
    limit?: number;
    offset?: number;
    status?: string;
  } = {}) {
    const { limit = 10, offset = 0, status } = params;

    let whereClause = 'WHERE deleted_at IS NULL';
    const queryParams: unknown[] = [limit, offset];
    let paramIndex = 3;

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    const result = await db.sql(`
      SELECT * FROM blog_posts
      ${whereClause}
      ORDER BY updated_at DESC
      LIMIT $1 OFFSET $2
    `, queryParams);

    return result as unknown as BlogPost[];
  }

  /**
   * Search blog posts
   */
  static async searchPosts(query: string, limit: number = 10) {
    const result = await db.sql(`
      SELECT * FROM blog_posts
      WHERE deleted_at IS NULL
        AND status = 'published'
        AND (
          title ILIKE $1
          OR content ILIKE $1
          OR excerpt ILIKE $1
        )
      ORDER BY published_at DESC
      LIMIT $2
    `, [`%${query}%`, limit]);

    return result as unknown as BlogPost[];
  }
}

// ===== FIRESTORE OPERATIONS PLACEHOLDER =====
// Note: All business logic operations (Users, Orders, Restaurants, etc.)
// should be implemented using Firebase SDK directly, not Prisma
// This file only handles CMS content stored in PostgreSQL

export class RestaurantOperations {
  /**
   * Placeholder for Firestore restaurant operations
   * All restaurant operations should use Firebase SDK directly
   */
  static async createRestaurant(_restaurantData: Record<string, unknown>) {
    throw new Error('Restaurant operations should use Firebase SDK directly. This is a placeholder.');
  }

  static async updateRestaurant(_restaurantId: string, _updateData: Record<string, unknown>) {
    throw new Error('Restaurant operations should use Firebase SDK directly. This is a placeholder.');
  }

  static async getRestaurantById(_restaurantId: string) {
    throw new Error('Restaurant operations should use Firebase SDK directly. This is a placeholder.');
  }

  static async searchRestaurants(_searchParams: Record<string, unknown>) {
    throw new Error('Restaurant operations should use Firebase SDK directly. This is a placeholder.');
  }

  static async getRestaurantWithMenu(_restaurantId: string) {
    throw new Error('Restaurant operations should use Firebase SDK directly. This is a placeholder.');
  }

  static async getPopularRestaurants(_limit?: number, _offset?: number) {
    throw new Error('Restaurant operations should use Firebase SDK directly. This is a placeholder.');
  }

  static async updateRestaurantRating(_restaurantId: string) {
    throw new Error('Restaurant operations should use Firebase SDK directly. This is a placeholder.');
  }

  static async getRestaurantAnalytics(_restaurantId: string, _days?: number) {
    throw new Error('Restaurant operations should use Firebase SDK directly. This is a placeholder.');
  }
}

// ===== PLACEHOLDER OPERATIONS FOR FIRESTORE =====
// These are placeholders - actual implementations should use Firebase SDK

export class UserOperations {
  static async createUser() {
    throw new Error('User operations should use Firebase SDK directly. This is a placeholder.');
  }
}

export class MenuOperations {
  static async createMenuCategory() {
    throw new Error('Menu operations should use Firebase SDK directly. This is a placeholder.');
  }
}

export class OrderOperations {
  static async createOrder() {
    throw new Error('Order operations should use Firebase SDK directly. This is a placeholder.');
  }
}

// All operations are already exported individually above

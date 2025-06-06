/**
 * Blog Operations for Tap2Go
 * CRUD operations for blog posts using Neon PostgreSQL
 */

import { neon } from '@neondatabase/serverless';

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL!);

// Types for blog operations
export interface BlogPost {
  id?: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  author_name?: string;
  author_bio?: string;
  author_avatar_url?: string;
  categories?: string[];
  tags?: string[];
  related_restaurants?: string[];
  reading_time?: number;
  is_published?: boolean;
  is_featured?: boolean;
  seo_data?: Record<string, unknown>;
  published_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateBlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  author_name?: string;
  author_bio?: string;
  author_avatar_url?: string;
  categories?: string[];
  tags?: string[];
  related_restaurants?: string[];
  reading_time?: number;
  is_published?: boolean;
  is_featured?: boolean;
  seo_data?: Record<string, unknown>;
}

/**
 * Blog Post Operations
 */
export class BlogOperations {
  /**
   * Create a new blog post
   */
  static async create(data: CreateBlogPostData): Promise<BlogPost> {
    const result = await sql`
      INSERT INTO blog_posts (
        title, slug, content, excerpt, featured_image_url,
        author_name, author_bio, author_avatar_url,
        categories, tags, related_restaurants, reading_time,
        is_published, is_featured, seo_data,
        published_at
      ) VALUES (
        ${data.title}, ${data.slug}, ${data.content}, ${data.excerpt}, ${data.featured_image_url},
        ${data.author_name}, ${data.author_bio}, ${data.author_avatar_url},
        ${JSON.stringify(data.categories || [])}, ${JSON.stringify(data.tags || [])},
        ${JSON.stringify(data.related_restaurants || [])}, ${data.reading_time},
        ${data.is_published || false}, ${data.is_featured || false}, ${JSON.stringify(data.seo_data || {})},
        ${data.is_published ? sql`NOW()` : null}
      )
      RETURNING *
    `;

    return result[0] as BlogPost;
  }

  /**
   * Get all blog posts with optional filters
   */
  static async getAll(options: {
    published?: boolean;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<BlogPost[]> {
    const { published, featured, limit = 10, offset = 0 } = options;
    
    let query = sql`
      SELECT * FROM blog_posts
      WHERE 1=1
    `;
    
    if (published !== undefined) {
      query = sql`${query} AND is_published = ${published}`;
    }
    
    if (featured !== undefined) {
      query = sql`${query} AND is_featured = ${featured}`;
    }
    
    query = sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return await query as BlogPost[];
  }

  /**
   * Get a blog post by slug
   */
  static async getBySlug(slug: string): Promise<BlogPost | null> {
    const result = await sql`
      SELECT * FROM blog_posts 
      WHERE slug = ${slug}
      LIMIT 1
    `;
    
    return result.length > 0 ? result[0] as BlogPost : null;
  }

  /**
   * Get a blog post by ID
   */
  static async getById(id: number): Promise<BlogPost | null> {
    const result = await sql`
      SELECT * FROM blog_posts 
      WHERE id = ${id}
      LIMIT 1
    `;
    
    return result.length > 0 ? result[0] as BlogPost : null;
  }

  /**
   * Update a blog post
   */
  static async update(id: number, data: Partial<CreateBlogPostData>): Promise<BlogPost | null> {
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'categories' || key === 'tags' || key === 'related_restaurants' || key === 'seo_data') {
          updateFields.push(`${key} = $${updateValues.length + 1}`);
          updateValues.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = $${updateValues.length + 1}`);
          updateValues.push(value);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return await BlogOperations.getById(id);
    }
    
    // Add updated_at
    updateFields.push(`updated_at = NOW()`);
    
    // If publishing, set published_at
    if (data.is_published === true) {
      updateFields.push(`published_at = NOW()`);
    }
    
    const query = `
      UPDATE blog_posts 
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length + 1}
      RETURNING *
    `;
    
    const result = await sql.query(query, [...updateValues, id]);
    return result.length > 0 ? result[0] as BlogPost : null;
  }

  /**
   * Delete a blog post
   */
  static async delete(id: number): Promise<boolean> {
    const result = await sql`
      DELETE FROM blog_posts 
      WHERE id = ${id}
      RETURNING id
    `;
    
    return result.length > 0;
  }

  /**
   * Search blog posts
   */
  static async search(query: string, options: {
    published?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<BlogPost[]> {
    const { published = true, limit = 10, offset = 0 } = options;
    
    const searchQuery = `%${query}%`;
    
    const result = await sql`
      SELECT * FROM blog_posts
      WHERE (
        title ILIKE ${searchQuery} OR
        content ILIKE ${searchQuery} OR
        excerpt ILIKE ${searchQuery}
      )
      AND is_published = ${published}
      ORDER BY 
        CASE 
          WHEN title ILIKE ${searchQuery} THEN 1
          WHEN excerpt ILIKE ${searchQuery} THEN 2
          ELSE 3
        END,
        created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return result as BlogPost[];
  }

  /**
   * Get blog posts by category
   */
  static async getByCategory(category: string, options: {
    published?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<BlogPost[]> {
    const { published = true, limit = 10, offset = 0 } = options;
    
    const result = await sql`
      SELECT * FROM blog_posts
      WHERE categories @> ${JSON.stringify([category])}
      AND is_published = ${published}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return result as BlogPost[];
  }

  /**
   * Get blog posts by tag
   */
  static async getByTag(tag: string, options: {
    published?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<BlogPost[]> {
    const { published = true, limit = 10, offset = 0 } = options;
    
    const result = await sql`
      SELECT * FROM blog_posts
      WHERE tags @> ${JSON.stringify([tag])}
      AND is_published = ${published}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return result as BlogPost[];
  }

  /**
   * Get featured blog posts
   */
  static async getFeatured(limit: number = 5): Promise<BlogPost[]> {
    const result = await sql`
      SELECT * FROM blog_posts
      WHERE is_featured = true AND is_published = true
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    
    return result as BlogPost[];
  }

  /**
   * Get blog statistics
   */
  static async getStats(): Promise<{
    total: number;
    published: number;
    featured: number;
    drafts: number;
  }> {
    const result = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_published = true) as published,
        COUNT(*) FILTER (WHERE is_featured = true) as featured,
        COUNT(*) FILTER (WHERE is_published = false) as drafts
      FROM blog_posts
    `;
    
    return result[0] as {
      total: number;
      published: number;
      featured: number;
      drafts: number;
    };
  }
}

export default BlogOperations;

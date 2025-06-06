/**
 * Database Operations for Tap2Go
 * High-level business logic operations using the hybrid database client
 *
 * Note: This file handles CMS operations using Prisma (BlogPost model)
 * Business logic operations (Users, Orders, Restaurants) are handled by Firestore
 */

import { db } from './hybrid-client';
import type { BlogPost, Prisma } from '@prisma/client';

// ===== CMS OPERATIONS (PRISMA) =====
// Only BlogPost operations are handled by Prisma
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
    return db.orm.blogPost.create({
      data: {
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        excerpt: postData.excerpt,
        status: postData.status || 'draft',
        authorId: postData.authorId,
        authorName: postData.authorName,
        authorEmail: postData.authorEmail,
        featuredImageUrl: postData.featuredImageUrl,
        categories: (postData.categories || []) as Prisma.InputJsonValue,
        tags: (postData.tags || []) as Prisma.InputJsonValue,
        seoTitle: postData.seoTitle,
        seoDescription: postData.seoDescription,
      }
    });
  }

  /**
   * Get blog post by ID
   */
  static async getBlogPostById(postId: number) {
    return db.orm.blogPost.findUnique({
      where: { id: postId }
    });
  }

  /**
   * Get blog post by slug
   */
  static async getBlogPostBySlug(slug: string) {
    return db.orm.blogPost.findUnique({
      where: { slug }
    });
  }

  /**
   * Update blog post
   */
  static async updateBlogPost(postId: number, updateData: Partial<BlogPost>) {
    // Remove fields that shouldn't be updated directly
    const { id, createdAt, updatedAt, parentId, ...cleanData } = updateData;

    // Convert any null values to undefined for Prisma
    const prismaData = Object.fromEntries(
      Object.entries(cleanData).map(([key, value]) => [key, value === null ? undefined : value])
    );

    return db.orm.blogPost.update({
      where: { id: postId },
      data: {
        ...prismaData,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Delete blog post (soft delete)
   */
  static async deleteBlogPost(postId: number) {
    return db.orm.blogPost.update({
      where: { id: postId },
      data: {
        deletedAt: new Date(),
        status: 'trash'
      }
    });
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

    const where: Record<string, unknown> = {
      status: 'published',
      deletedAt: null,
      publishedAt: {
        lte: new Date()
      }
    };

    if (category) {
      where.categories = {
        array_contains: category
      };
    }

    if (tag) {
      where.tags = {
        array_contains: tag
      };
    }

    return db.orm.blogPost.findMany({
      where,
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit,
      skip: offset
    });
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

    const where: Record<string, unknown> = {
      deletedAt: null
    };

    if (status) {
      where.status = status;
    }

    return db.orm.blogPost.findMany({
      where,
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit,
      skip: offset
    });
  }

  /**
   * Search blog posts
   */
  static async searchPosts(query: string, limit: number = 10) {
    return db.orm.blogPost.findMany({
      where: {
        AND: [
          { deletedAt: null },
          { status: 'published' },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
              { excerpt: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit
    });
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

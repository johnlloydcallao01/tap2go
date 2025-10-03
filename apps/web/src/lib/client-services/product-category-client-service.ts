"use client";

import type { ProductCategory } from '@/types/product-category';
import { dataCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/data-cache';

export type { ProductCategory };

export interface ProductCategoriesResponse {
  docs: ProductCategory[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductCategoryServiceOptions {
  isActive?: boolean;
  limit?: number;
  page?: number;
}

export class ProductCategoryClientService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
  
  /**
   * Fetch product categories from CMS (Client-side) with caching
   * Uses NEXT_PUBLIC_PAYLOAD_API_KEY for client-side access
   */
  static async getProductCategories(options: ProductCategoryServiceOptions = {}): Promise<ProductCategory[]> {
    const {
      isActive = true,
      limit = 20,
      page = 1
    } = options;

    // Create cache key based on options
    const cacheKey = `${CACHE_KEYS.PRODUCT_CATEGORIES}-${JSON.stringify({ isActive, limit, page })}`;
    
    // Check cache first
    const cachedData = dataCache.get<ProductCategory[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Build query parameters
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });

      // Add isActive filter if specified
      if (isActive !== undefined) {
        params.append('where[isActive][equals]', isActive.toString());
      }

      // Add API key authentication using client-side key
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      }

      const response = await fetch(`${ProductCategoryClientService.API_BASE}/product-categories?${params}&depth=2`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product categories: ${response.status}`);
      }
      
      const data: ProductCategoriesResponse = await response.json();
      const categories = data.docs || [];
      
      // Cache the result
      dataCache.set(cacheKey, categories, CACHE_TTL.PRODUCT_CATEGORIES);
      
      return categories;
    } catch (error) {
      console.error('Error fetching product categories:', error);
      return []; // Graceful fallback
    }
  }

  /**
   * Fetch individual product category by ID from CMS (Client-side) with caching
   */
  static async getProductCategoryById(id: string): Promise<ProductCategory | null> {
    const cacheKey = `${CACHE_KEYS.PRODUCT_CATEGORIES}-${id}`;
    
    // Check cache first
    const cachedData = dataCache.get<ProductCategory>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key authentication using client-side key
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      }

      const response = await fetch(`${ProductCategoryClientService.API_BASE}/product-categories/${id}?depth=3`, {
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Category not found
        }
        throw new Error(`Failed to fetch product category: ${response.status}`);
      }
      
      const category: ProductCategory = await response.json();
      
      // Cache the result
      dataCache.set(cacheKey, category, CACHE_TTL.PRODUCT_CATEGORIES);
      
      return category;
    } catch (error) {
      console.error('Error fetching product category by ID:', error);
      return null; // Graceful fallback
    }
  }

  /**
   * Clear product categories cache
   */
  static clearCache(): void {
    // Clear all product category related cache entries
    const stats = dataCache.getStats();
    stats.keys.forEach(key => {
      if (key.startsWith(CACHE_KEYS.PRODUCT_CATEGORIES)) {
        dataCache.delete(key);
      }
    });
  }
}

// Export convenience functions
export const getProductCategoriesClient = ProductCategoryClientService.getProductCategories;
export const getProductCategoryByIdClient = ProductCategoryClientService.getProductCategoryById;
export const clearProductCategoriesCache = ProductCategoryClientService.clearCache;
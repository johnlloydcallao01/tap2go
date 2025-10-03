"use client";

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  media?: {
    icon?: {
      id: number;
      url: string;
      cloudinaryURL?: string;
      alt?: string;
    };
  };
}

export interface ProductCategoryResponse {
  docs: ProductCategory[];
  totalDocs: number;
  limit: number;
  page: number;
}

export class ProductCategoryClientService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
  
  /**
   * Fetch product categories from CMS (Client-side)
   * Uses NEXT_PUBLIC_PAYLOAD_API_KEY for client-side access
   */
  static async getProductCategories(limit: number = 50): Promise<ProductCategory[]> {
    try {
      // Build headers with API key authentication
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      }

      const response = await fetch(`${ProductCategoryClientService.API_BASE}/product-categories?limit=${limit}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product categories: ${response.status}`);
      }
      
      const data: ProductCategoryResponse = await response.json();
      return data.docs || [];
    } catch (error) {
      console.error('Error fetching product categories:', error);
      return []; // Graceful fallback
    }
  }
}

// Export convenience function
export const getProductCategoriesClient = ProductCategoryClientService.getProductCategories;
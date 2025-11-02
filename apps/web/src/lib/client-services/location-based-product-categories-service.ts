"use client";

import { dataCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/data-cache';

// Location-based product category type (matching the API response structure)
export interface LocationBasedProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: string | null;
  categoryLevel: number;
  categoryPath: string;
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  media: {
    icon?: {
      id: string;
      url: string;
      cloudinaryURL?: string;
      filename: string;
      mimeType: string;
      filesize: number;
      width?: number;
      height?: number;
      alt?: string;
    };
    bannerImage?: {
      id: string;
      url: string;
      cloudinaryURL?: string;
      filename: string;
      mimeType: string;
      filesize: number;
      width?: number;
      height?: number;
      alt?: string;
    };
    thumbnailImage?: {
      id: string;
      url: string;
      cloudinaryURL?: string;
      filename: string;
      mimeType: string;
      filesize: number;
      width?: number;
      height?: number;
      alt?: string;
    };
  };
  styling: {
    colorTheme: string;
    backgroundColor: string;
    textColor: string;
    gradientColors: string[];
  };
  attributes: {
    categoryType: string;
    dietaryTags: string[];
    ageRestriction?: number;
    requiresPrescription: boolean;
  };
  businessRules: {
    allowsCustomization: boolean;
    requiresSpecialHandling: boolean;
    hasExpirationDates: boolean;
    requiresRefrigeration: boolean;
    maxDeliveryTimeHours: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl?: string;
  };
  metrics: {
    totalProducts: number;
    totalOrders: number;
    averageRating: number;
    popularityScore: number;
    viewCount: number;
  };
  promotions: {
    isPromotional: boolean;
    promotionalText?: string;
    discountPercentage?: number;
    promotionStartDate?: string;
    promotionEndDate?: string;
  };
  availability: {
    availableHours: {
      monday: { start: string; end: string; isOpen: boolean };
      tuesday: { start: string; end: string; isOpen: boolean };
      wednesday: { start: string; end: string; isOpen: boolean };
      thursday: { start: string; end: string; isOpen: boolean };
      friday: { start: string; end: string; isOpen: boolean };
      saturday: { start: string; end: string; isOpen: boolean };
      sunday: { start: string; end: string; isOpen: boolean };
    };
    seasonalAvailability: string[];
    regionRestrictions: string[];
  };
  updatedAt: string;
  createdAt: string;
  productCount: number;
  merchantCount: number;
}

// API Response structure for location-based product categories
export interface LocationBasedProductCategoriesResponse {
  success: boolean;
  data: {
    customer: {
      id: string;
      user: string;
    };
    address: {
      id: string;
      formatted_address: string;
      latitude: number;
      longitude: number;
    };
    categories: LocationBasedProductCategory[];
    productCount: number;
    merchantCount: number;
    totalCategories: number;
    merchantsAnalyzed: number;
    searchRadius: number;
  };
  timestamp: string;
  requestId: string;
  responseTime: number;
}

export interface LocationBasedProductCategoriesServiceOptions {
  customerId: string;
  sortBy?: 'name' | 'popularity' | 'productCount';
  limit?: number;
  includeInactive?: boolean;
}

export class LocationBasedProductCategoriesService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
  
  /**
   * Fetch location-based product categories from CMS (Client-side) with caching
   * Uses NEXT_PUBLIC_PAYLOAD_API_KEY for client-side access
   */
  static async getLocationBasedProductCategories(options: LocationBasedProductCategoriesServiceOptions): Promise<LocationBasedProductCategory[]> {
    const { customerId, sortBy = 'name', limit = 20, includeInactive = false } = options;

    console.log('🛒 Starting location-based product categories fetch with options:', { customerId, sortBy, limit, includeInactive });

    if (!customerId) {
      console.warn('❌ Customer ID is required for location-based product categories');
      return [];
    }

    // Create cache key based on options
    const cacheKey = `${CACHE_KEYS.PRODUCT_CATEGORIES}-location-${customerId}-${sortBy}-${limit}-${includeInactive}`;
    
    // Check cache first
    const cachedData = dataCache.get<LocationBasedProductCategory[]>(cacheKey);
    if (cachedData) {
      console.log('🎯 Using cached product categories data:', cachedData.length, 'categories');
      return cachedData;
    }

    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Build query parameters
      const params = new URLSearchParams({
        customerId: customerId.toString(),
      });

      if (sortBy) {
        params.append('sortBy', sortBy);
      }

      if (limit) {
        params.append('limit', limit.toString());
      }

      if (includeInactive) {
        params.append('includeInactive', includeInactive.toString());
      }

      // Add API key authentication using client-side key
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
        console.log('🔑 API key configured for request');
      } else {
        console.error('❌ NEXT_PUBLIC_PAYLOAD_API_KEY not found in environment');
      }

      const url = `${LocationBasedProductCategoriesService.API_BASE}/merchant/location-based-product-categories?${params}`;
      console.log('🌐 Making request to:', url);

      const response = await fetch(url, {
        headers,
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to fetch location-based product categories: ${response.status}`);
      }
      
      const data: LocationBasedProductCategoriesResponse = await response.json();
      console.log('📊 API Response:', { 
        success: data.success, 
        categoryCount: data.data?.categories?.length || 0,
        customerFound: !!data.data?.customer,
        addressFound: !!data.data?.address,
        totalCategories: data.data?.totalCategories,
        merchantsAnalyzed: data.data?.merchantsAnalyzed
      });
      
      if (!data.success || !data.data?.categories) {
        console.warn('❌ Invalid response format for location-based product categories');
        return [];
      }
      
      const categories = data.data.categories || [];
      console.log('✅ Successfully fetched', categories.length, 'location-based product categories');
      
      // Cache the result
      dataCache.set(cacheKey, categories, CACHE_TTL.PRODUCT_CATEGORIES);
      
      return categories;
    } catch (error) {
      console.error('❌ Error fetching location-based product categories:', error);
      return []; // Graceful fallback
    }
  }

  /**
   * Get customer ID from current user session
   * This integrates with the authentication system to get the customer ID
   */
  static async getCurrentCustomerId(): Promise<string | null> {
    try {
      // Check if we have a cached customer ID
      const cachedCustomerId = dataCache.get<string>('current-customer-id');
      if (cachedCustomerId) {
        console.log('🎯 Using cached customer ID:', cachedCustomerId);
        return cachedCustomerId;
      }

      // Get current user from localStorage (where auth context stores it)
      const userDataStr = typeof window !== 'undefined' ? localStorage.getItem('grandline_auth_user') : null;
      if (!userDataStr) {
        console.log('❌ No user data found in localStorage');
        return null;
      }

      let userData;
      try {
        userData = JSON.parse(userDataStr);
        console.log('👤 User data found:', { id: userData?.id, email: userData?.email, role: userData?.role });
      } catch (parseError) {
        console.error('❌ Failed to parse user data from localStorage:', parseError);
        return null;
      }

      const userId = userData?.id;
      if (!userId) {
        console.log('❌ No user ID found in user data');
        return null;
      }

      console.log('🔍 Looking up customer ID for user ID:', userId);
      // Get customer ID from user ID using the same pattern as other services
      const customerId = await this.getCustomerIdFromUserId(userId);
      
      if (customerId) {
        console.log('✅ Found customer ID:', customerId);
        // Cache the customer ID for future use
        dataCache.set('current-customer-id', customerId, CACHE_TTL.PRODUCT_CATEGORIES);
      } else {
        console.log('❌ No customer ID found for user ID:', userId);
      }
      
      return customerId;
    } catch (error) {
      console.error('❌ Error getting current customer ID:', error);
      return null;
    }
  }

  /**
   * Get customer ID from user ID
   * Uses the same pattern as other services
   */
  private static async getCustomerIdFromUserId(userId: string | number): Promise<string | null> {
    try {
      console.log('🔍 Querying CMS for customer with user ID:', userId);
      
      // Use proper authentication headers for PayloadCMS API
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `users API-Key ${process.env.NEXT_PUBLIC_PAYLOAD_API_KEY}`,
      };

      const url = `${this.API_BASE}/customers?where[user][equals]=${userId}&limit=1`;
      console.log('🌐 Making request to:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        console.error('❌ Failed to fetch customer by user ID:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        return null;
      }

      const data = await response.json();
      console.log('📊 Customer query response:', { 
        docsCount: data.docs?.length || 0, 
        totalDocs: data.totalDocs,
        hasNextPage: data.hasNextPage 
      });
      
      if (data.docs && data.docs.length > 0) {
        const customerId = data.docs[0].id;
        console.log('✅ Customer found with ID:', customerId);
        return customerId;
      }
      
      console.log('❌ No customer found for user ID:', userId);
      return null;
    } catch (error) {
      console.error('❌ Error getting customer ID from user ID:', error);
      return null;
    }
  }

  /**
   * Clear location-based product categories cache
   */
  static clearCache(customerId?: string): void {
    if (customerId) {
      // Clear specific customer's cache
      const stats = dataCache.getStats();
      stats.keys.forEach(key => {
        if (key.includes(`location-${customerId}`)) {
          dataCache.delete(key);
        }
      });
    } else {
      // Clear all location-based product categories cache entries
      const stats = dataCache.getStats();
      stats.keys.forEach(key => {
        if (key.includes('location-') && key.includes('categories')) {
          dataCache.delete(key);
        }
      });
    }
  }
}

// Export convenience functions
export const getLocationBasedProductCategories = LocationBasedProductCategoriesService.getLocationBasedProductCategories;
export const getCurrentCustomerId = LocationBasedProductCategoriesService.getCurrentCustomerId;
export const clearLocationBasedProductCategoriesCache = LocationBasedProductCategoriesService.clearCache;
"use client";

import type { Merchant } from '@/types/merchant';
import { dataCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/data-cache';

// Extended merchant type with location data (matching API response)
export interface LocationBasedMerchant extends Omit<Merchant, 'operationalStatus'> {
  distance: number;
  distanceKm: number;
  isWithinDeliveryRadius: boolean;
  estimatedDeliveryTime: string;
  operationalStatus: string;
  // Optional fields that may be present from the API or inferred
  activeAddressId?: string | number | null;
  activeFormattedAddress?: string | null;
  merchant_latitude?: number | null;
  merchant_longitude?: number | null;
}

// API Response structure for location-based merchants
export interface LocationBasedMerchantsResponse {
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
    merchants: LocationBasedMerchant[];
    totalCount: number;
  };
}

export interface LocationBasedMerchantServiceOptions {
  customerId: string;
  limit?: number;
  categoryId?: string;
}

export class LocationBasedMerchantService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
  
  /**
   * Fetch location-based merchants from CMS (Client-side) with caching
   * Uses NEXT_PUBLIC_PAYLOAD_API_KEY for client-side access
   */
  static async getLocationBasedMerchants(options: LocationBasedMerchantServiceOptions): Promise<LocationBasedMerchant[]> {
    const { customerId, limit = 10, categoryId } = options;

    if (!customerId) {
      console.warn('❌ Customer ID is required for location-based merchants');
      return [];
    }

    // Create cache key based on options
    const cacheKey = `${CACHE_KEYS.MERCHANTS}-location-${customerId}-${limit}-${categoryId || 'all'}`;
    
    // Check cache first
    const cachedData = dataCache.get<LocationBasedMerchant[]>(cacheKey);
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
        customerId: customerId.toString(),
      });

      if (limit) {
        params.append('limit', limit.toString());
      }

      if (categoryId) {
        params.append('categoryId', categoryId.toString());
      }

      // Add API key authentication using client-side key
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      } else {
        console.error('❌ NEXT_PUBLIC_PAYLOAD_API_KEY not found in environment');
      }

      const url = `${LocationBasedMerchantService.API_BASE}/merchant/location-based-display?${params}`;

      const response = await fetch(url, {
        headers,
      });
      
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to fetch location-based merchants: ${response.status}`);
      }
      
      const data: LocationBasedMerchantsResponse = await response.json();
      
      if (!data.success || !data.data?.merchants) {
        console.warn('❌ Invalid response format for location-based merchants');
        return [];
      }
      
      const merchants = data.data.merchants || [];
      
      // Cache the result
      dataCache.set(cacheKey, merchants, CACHE_TTL.MERCHANTS);
      
      return merchants;
    } catch (error) {
      console.error('❌ Error fetching location-based merchants:', error);
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
        return cachedCustomerId;
      }

      // Get current user from localStorage (where auth context stores it)
      const userDataStr = typeof window !== 'undefined' ? localStorage.getItem('grandline_auth_user') : null;
      if (!userDataStr) {
        return null;
      }

      let userData;
      try {
        userData = JSON.parse(userDataStr);
      } catch (parseError) {
        console.error('❌ Failed to parse user data from localStorage:', parseError);
        return null;
      }

      const userId = userData?.id;
      if (!userId) {
        return null;
      }

      // Get customer ID from user ID using the same pattern as address-service
      const customerId = await LocationBasedMerchantService.getCustomerIdFromUserId(userId);
      
      if (customerId) {
        // Cache the customer ID for future use
        dataCache.set('current-customer-id', customerId, CACHE_TTL.MERCHANTS);
      } else {
      }
      
      return customerId;
    } catch (error) {
      console.error('❌ Error getting current customer ID:', error);
      return null;
    }
  }

  /**
   * Get customer ID from user ID
   * Uses the same pattern as address-service.ts
   */
  private static async getCustomerIdFromUserId(userId: string | number): Promise<string | null> {
    try {
      
      // Use proper authentication headers for PayloadCMS API
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `users API-Key ${process.env.NEXT_PUBLIC_PAYLOAD_API_KEY}`,
      };

      const url = `${this.API_BASE}/customers?where[user][equals]=${userId}&limit=1`;

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });


      if (!response.ok) {
        console.error('❌ Failed to fetch customer by user ID:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        return null;
      }

      const data = await response.json();
      
      if (data.docs && data.docs.length > 0) {
        const customerId = data.docs[0].id;
        return customerId;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting customer ID from user ID:', error);
      return null;
    }
  }

  /**
   * Clear location-based merchants cache
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
      // Clear all location-based merchant cache entries
      const stats = dataCache.getStats();
      stats.keys.forEach(key => {
        if (key.includes('location-')) {
          dataCache.delete(key);
        }
      });
    }
  }
}

// Export convenience functions
export const getLocationBasedMerchants = LocationBasedMerchantService.getLocationBasedMerchants;
export const getCurrentCustomerId = LocationBasedMerchantService.getCurrentCustomerId;
export const clearLocationBasedMerchantsCache = LocationBasedMerchantService.clearCache;

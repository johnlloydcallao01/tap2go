
import type { Merchant, MerchantsResponse } from '../types/merchant';
import { dataCache, CACHE_KEYS, CACHE_TTL } from '../cache/data-cache';

export interface MerchantServiceOptions {
  isActive?: boolean;
  limit?: number;
  page?: number;
}

export class MerchantClientService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
  
  /**
   * Fetch merchants from CMS (Client-side) with caching
   * Uses NEXT_PUBLIC_PAYLOAD_API_KEY for client-side access
   */
  static async getMerchants(options: MerchantServiceOptions = {}): Promise<Merchant[]> {
    const {
      isActive = true,
      limit = 8,
      page = 1
    } = options;

    // Create cache key based on options
    const cacheKey = `${CACHE_KEYS.MERCHANTS}-${JSON.stringify({ isActive, limit, page })}`;
    
    // Check cache first
    const cachedData = dataCache.get<Merchant[]>(cacheKey);
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

      const response = await fetch(`${MerchantClientService.API_BASE}/merchants?${params}&depth=2`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch merchants: ${response.status}`);
      }
      
      const data: MerchantsResponse = await response.json();
      const merchants = data.docs || [];
      
      // Cache the result
      dataCache.set(cacheKey, merchants, CACHE_TTL.MERCHANTS);
      
      return merchants;
    } catch (error) {
      console.error('Error fetching merchants:', error);
      return []; // Graceful fallback
    }
  }

  /**
   * Fetch individual merchant by ID from CMS (Client-side) with caching
   */
  static async getMerchantById(id: string): Promise<Merchant | null> {
    const cacheKey = CACHE_KEYS.MERCHANTS_BY_ID(id);
    
    // Check cache first
    const cachedData = dataCache.get<Merchant>(cacheKey);
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

      const response = await fetch(`${MerchantClientService.API_BASE}/merchants/${id}?depth=3`, {
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Merchant not found
        }
        throw new Error(`Failed to fetch merchant: ${response.status}`);
      }
      
      const merchant: Merchant = await response.json();
      
      // Cache the result
      dataCache.set(cacheKey, merchant, CACHE_TTL.MERCHANT_DETAILS);
      
      return merchant;
    } catch (error) {
      console.error('Error fetching merchant by ID:', error);
      return null; // Graceful fallback
    }
  }

  /**
   * Get merchant count for pagination/display purposes (Client-side) with caching
   */
  static async getMerchantCount(isActive: boolean = true): Promise<number> {
    const cacheKey = `${CACHE_KEYS.MERCHANTS}-count-${isActive}`;
    
    // Check cache first
    const cachedData = dataCache.get<number>(cacheKey);
    if (cachedData !== null) {
      return cachedData;
    }

    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      const params = new URLSearchParams({
        limit: '1', // Minimal fetch for count
        page: '1',
      });

      // Add isActive filter if specified
      if (isActive !== undefined) {
        params.append('where[isActive][equals]', isActive.toString());
      }

      // Add API key authentication using client-side key
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY || process.env.EXPO_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      }

      const response = await fetch(`${MerchantClientService.API_BASE}/merchants?${params}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch merchant count: ${response.status}`);
      }
      
      const data: MerchantsResponse = await response.json();
      const count = data.totalDocs || 0;
      
      // Cache the result
      dataCache.set(cacheKey, count, CACHE_TTL.MERCHANTS);
      
      return count;
    } catch (error) {
      console.error('Error fetching merchant count:', error);
      return 0;
    }
  }

  /**
   * Clear merchants cache
   */
  static clearCache(): void {
    // Clear all merchant related cache entries
    const stats = dataCache.getStats();
    stats.keys.forEach(key => {
      if (key.startsWith(CACHE_KEYS.MERCHANTS) || key.startsWith('merchant-')) {
        dataCache.delete(key);
      }
    });
  }
}

// Export convenience functions
export const getMerchantsClient = MerchantClientService.getMerchants;
export const getMerchantByIdClient = MerchantClientService.getMerchantById;
export const getMerchantCountClient = MerchantClientService.getMerchantCount;
export const clearMerchantsCache = MerchantClientService.clearCache;

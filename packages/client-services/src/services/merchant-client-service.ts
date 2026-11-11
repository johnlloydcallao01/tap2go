
import type { Merchant, MerchantsResponse, MerchantMenuData } from '../types/merchant';
import { dataCache, CACHE_KEYS, CACHE_TTL } from '../cache/data-cache';

export interface MerchantServiceOptions {
  isActive?: boolean;
  limit?: number;
  page?: number;
}

export class MerchantClientService {
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
  
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
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY || process.env.EXPO_PUBLIC_PAYLOAD_API_KEY;
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
  static async getMerchantById(
    id: string,
    signal?: AbortSignal,
    forceRefresh = false,
  ): Promise<Merchant | null> {
    const cacheKey = CACHE_KEYS.MERCHANTS_BY_ID(id);
    
    // Check cache first
    const cachedData = forceRefresh ? null : dataCache.get<Merchant>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const fetchMerchant = async (): Promise<Merchant | null> => {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add API key authentication using client-side key
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY || process.env.EXPO_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `users API-Key ${apiKey}`;
      }

      const params = new URLSearchParams({ merchantId: id });
      if (forceRefresh) params.set('refresh', 'true');
      const response = await fetch(`${MerchantClientService.API_BASE}/merchant/view?${params}`, {
        headers,
        signal,
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Merchant not found
        }
        throw new Error(`Failed to fetch merchant: ${response.status}`);
      }
      
      const result = await response.json();
      const merchant = result?.data as Merchant | null;
      
      // Cache the result
      if (!signal?.aborted && merchant) {
        dataCache.set(cacheKey, merchant, CACHE_TTL.MERCHANT_DETAILS);
      }
      
      return merchant;
    }

    return signal ? fetchMerchant() : dataCache.dedupe(cacheKey, fetchMerchant);
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
   * Fetch merchant menu (products and categories)
   * Replicates logic from apps/web/src/components/merchant/MerchantProductsClient.tsx
   */
  static async getMerchantMenu(
    merchantId: string,
    page: number = 1,
    limit: number = 48,
    signal?: AbortSignal,
    forceRefresh = false,
  ): Promise<MerchantMenuData> {
    const cacheKey = `${CACHE_KEYS.MERCHANTS}-menu-${merchantId}-${page}-${limit}`;
    const cached = forceRefresh ? null : dataCache.get<MerchantMenuData>(cacheKey);
    if (cached) return cached;

    const fetchMenu = async (): Promise<MerchantMenuData> => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY || process.env.EXPO_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`;

      const params = new URLSearchParams({
        merchantId,
        page: String(page),
        limit: String(limit),
      });
      if (forceRefresh) params.set('refresh', 'true');
      const url = `${MerchantClientService.API_BASE}/merchant/menu?${params.toString()}`;
      const res = await fetch(url, { headers, signal });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Failed to fetch merchant menu: ${res.status}`);
      }

      const response = await res.json();
      if (!response?.success || !response.data) {
        throw new Error(response?.error || 'Invalid merchant menu response');
      }
      const result = response.data as MerchantMenuData;
      if (!signal?.aborted) {
        dataCache.set(cacheKey, result, CACHE_TTL.MERCHANTS);
      }
      return result;
    }

    return signal ? fetchMenu() : dataCache.dedupe(cacheKey, fetchMenu);
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

  static clearMerchantDataCache(merchantId: string): void {
    dataCache.delete(CACHE_KEYS.MERCHANTS_BY_ID(merchantId));
    const menuPrefix = `${CACHE_KEYS.MERCHANTS}-menu-${merchantId}-`;
    dataCache.getStats().keys
      .filter((key) => key.startsWith(menuPrefix))
      .forEach((key) => dataCache.delete(key));
  }
}

// Export convenience functions
export const getMerchantsClient = MerchantClientService.getMerchants;
export const getMerchantByIdClient = MerchantClientService.getMerchantById;
export const getMerchantCountClient = MerchantClientService.getMerchantCount;
export const getMerchantMenuClient = MerchantClientService.getMerchantMenu;
export const clearMerchantsCache = MerchantClientService.clearCache;
export const clearMerchantDataCache = MerchantClientService.clearMerchantDataCache;

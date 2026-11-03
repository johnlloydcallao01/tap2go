
import type { Merchant, MerchantsResponse, MerchantMenuData, MerchantProductDisplay, MerchantCategoryDisplay } from '../types/merchant';
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
  static async getMerchantById(id: string, signal?: AbortSignal): Promise<Merchant | null> {
    const cacheKey = CACHE_KEYS.MERCHANTS_BY_ID(id);
    
    // Check cache first
    const cachedData = dataCache.get<Merchant>(cacheKey);
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

      const response = await fetch(`${MerchantClientService.API_BASE}/merchants/${encodeURIComponent(id)}?depth=3`, {
        headers,
        signal,
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Merchant not found
        }
        throw new Error(`Failed to fetch merchant: ${response.status}`);
      }
      
      const merchant: Merchant = await response.json();
      
      // Cache the result
      if (!signal?.aborted) {
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
  ): Promise<MerchantMenuData> {
    const cacheKey = `${CACHE_KEYS.MERCHANTS}-menu-${merchantId}-${page}-${limit}`;
    const cached = dataCache.get<MerchantMenuData>(cacheKey);
    if (cached) return cached;

    const fetchMenu = async (): Promise<MerchantMenuData> => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY || process.env.EXPO_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`;

      const params = new URLSearchParams({
        'where[merchant_id][equals]': merchantId,
        'where[is_active][equals]': 'true',
        'where[is_available][equals]': 'true',
        depth: '2',
        limit: String(limit),
        page: String(page),
      });
      const url = `${MerchantClientService.API_BASE}/merchant-products?${params.toString()}`;
      
      const res = await fetch(url, { headers, signal });
      if (!res.ok) throw new Error(String(res.status));
      
      const data = await res.json();
      const docs: any[] = (data?.docs || []).filter((mp: any) => mp?.product_id?.catalogVisibility !== "hidden");
      
      const categoryMap = new Map<number | string, any>();
      const products: MerchantProductDisplay[] = docs.map((mp) => {
        const product = mp?.product_id || null;
        const primaryImage = product?.media?.primaryImage || null;
        const imageUrl = primaryImage?.cloudinaryURL || primaryImage?.url || primaryImage?.thumbnailURL || null;
        
        const rawCats = Array.isArray(product?.categories) ? product.categories : [];
        const categoryIds: (number | string)[] = [];
        
        rawCats.forEach((c: any) => {
          const id = (typeof c === "number" || typeof c === "string") ? c : c?.id;
          if (id) {
            categoryIds.push(id);
            if (typeof c === "object" && c) {
              const icon = c?.media?.icon || null;
              categoryMap.set(id, { id, name: c?.name, slug: c?.slug, media: { icon } });
            }
          }
        });

        return {
          id: product?.id ?? mp?.id,
          merchantProductId: mp?.id,
          name: product?.name ?? "",
          productType: product?.productType ?? "simple",
          basePrice: product?.basePrice ?? null,
          compareAtPrice: product?.compareAtPrice ?? null,
          shortDescription: product?.shortDescription ?? "",
          imageUrl,
          categoryIds,
          hasRequiredModifiers: false, // Will be populated below
        };
      });

      const productIds = products.map(p => p.id).filter(Boolean);
      const collectedIds = new Set<number | string>();
      products.forEach((p) => (p.categoryIds || []).forEach((cid) => collectedIds.add(cid)));
      const ids = Array.from(collectedIds);

      const modifierQuery = productIds.length > 0
        ? (async () => {
            const modParams = new URLSearchParams();
            modParams.append('where[product_id][in]', productIds.join(','));
            modParams.append('where[or][0][is_required][equals]', 'true');
            modParams.append('where[or][1][min_selections][greater_than]', '0');
            modParams.append('limit', '500');
            modParams.append('depth', '0');

            try {
              const modRes = await fetch(
                `${MerchantClientService.API_BASE}/modifier-groups?${modParams.toString()}`,
                { headers, signal },
              );
              if (!modRes.ok) throw new Error(`Modifier groups request failed: ${modRes.status}`);
              const modData = await modRes.json();
              const requiredProductIds = new Set<string | number>();

              (modData.docs || []).forEach((group: any) => {
                const productId = typeof group.product_id === 'object' ? group.product_id?.id : group.product_id;
                if (productId) requiredProductIds.add(productId);
              });

              products.forEach((product) => {
                product.hasRequiredModifiers = requiredProductIds.has(product.id);
              });
            } catch (error) {
              if (signal?.aborted) throw error;
              console.error('Error fetching modifier groups:', error);
            }
          })()
        : Promise.resolve();

      const categoriesQuery = ids.length > 0
        ? (async (): Promise<MerchantCategoryDisplay[]> => {
            const catParams = new URLSearchParams({
              'where[id][in]': ids.join(','),
              limit: String(ids.length),
              depth: '1',
              pagination: 'false',
            });
            try {
              const catRes = await fetch(
                `${MerchantClientService.API_BASE}/product-categories?${catParams.toString()}`,
                { headers, signal },
              );
              if (!catRes.ok) throw new Error(`Product categories request failed: ${catRes.status}`);
              const catData = await catRes.json();
              const byId = new Map<number | string, MerchantCategoryDisplay>();

              (Array.isArray(catData?.docs) ? catData.docs : []).forEach((category: any) => {
                if (category?.id) {
                  byId.set(category.id, {
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    media: { icon: category?.media?.icon },
                  });
                }
              });

              return ids
                .map((id) => byId.get(id) || categoryMap.get(id))
                .filter((category): category is MerchantCategoryDisplay => !!(category && category.id));
            } catch (error) {
              if (signal?.aborted) throw error;
              console.error('Error fetching product categories:', error);
              return ids
                .map((id) => categoryMap.get(id))
                .filter((category): category is MerchantCategoryDisplay => !!(category && category.id));
            }
          })()
        : Promise.resolve([]);

      const [, categories] = await Promise.all([modifierQuery, categoriesQuery]);
      const result: MerchantMenuData = { 
        products, 
        categories,
        pagination: {
          totalDocs: data.totalDocs,
          limit: data.limit,
          page: data.page,
          totalPages: data.totalPages,
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage
        }
      };
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

import { dataCache, CACHE_KEYS, CACHE_TTL } from '../cache/data-cache';
import type { MerchantProductDisplay } from '../types/merchant';

export interface RecommendedProduct extends MerchantProductDisplay {
  merchantId: string | number;
  merchantName: string;
  distanceKm?: number | null;
  isWithinDeliveryRadius?: boolean;
  estimatedDeliveryTime?: string | null;
}

export interface MarketplaceProductCategory {
  id: number | string;
  name: string;
  slug: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const UNCATEGORIZED_PRODUCT_CATEGORY_ID = 'uncategorized';

export function isUncategorizedId(value: number | string | null | undefined): boolean {
  return value != null && String(value).toLowerCase() === UNCATEGORIZED_PRODUCT_CATEGORY_ID;
}

export interface EligibleMerchantGate {
  id: number | string;
  distanceKm?: number | null;
  isWithinDeliveryRadius?: boolean;
  estimatedDeliveryTime?: string | null;
}

export interface MarketplaceProductsOptions {
  limit?: number;
  customerId?: string | null;
  /**
   * Proven-pattern gate (copies Newly Updated: derive from the already
   * loaded Nearby merchants, zero extra location fetch).
   * REQUIRED on home: no eligible merchants → [] (same as merchant
   * categories early-[] when no IDs, and hooks enabled !!customerId).
   */
  eligibleMerchants?: EligibleMerchantGate[] | null;
}

function getApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env as Record<string, string | undefined>).EXPO_PUBLIC_API_URL ||
    'https://cms.tap2goph.com/api'
  );
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey =
    process.env.NEXT_PUBLIC_PAYLOAD_API_KEY ||
    (process.env as Record<string, string | undefined>).EXPO_PUBLIC_PAYLOAD_API_KEY;
  if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`;
  return headers;
}

function getMediaUrl(media: unknown): string | null {
  if (!media || typeof media !== 'object') return null;
  const m = media as Record<string, unknown>;
  return (
    (typeof m.cloudinaryURL === 'string' && m.cloudinaryURL) ||
    (typeof m.url === 'string' && m.url) ||
    (typeof m.thumbnailURL === 'string' && m.thumbnailURL) ||
    null
  );
}

function interleaveByMerchant<T>(items: T[], merchantIdOf: (item: T) => string): T[] {
  const groups = new Map<string, T[]>();
  const order: string[] = [];
  for (const item of items) {
    const key = merchantIdOf(item);
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(item);
  }
  const out: T[] = [];
  let round = 0;
  let placed = true;
  while (placed) {
    placed = false;
    for (const key of order) {
      const group = groups.get(key)!;
      if (round < group.length) {
        out.push(group[round]);
        placed = true;
      }
    }
    round++;
  }
  return out;
}

export class MarketplaceProductService {
  /**
   * Fetch active product categories (the `product-categories` collection —
   * the true product taxonomy, distinct from `merchant-categories`).
   * Same principle as web `HomeMarketplaceProducts` + merchant menu.
   */
  static async getProductCategories(
    options: { limit?: number } = {},
  ): Promise<MarketplaceProductCategory[]> {
    const { limit = 30 } = options;
    const cacheKey = `${CACHE_KEYS.PRODUCT_CATEGORIES}-marketplace-${limit}-all`;
    const cached = dataCache.get<MarketplaceProductCategory[]>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        limit: String(limit),
        depth: '1',
        sort: 'displayOrder',
      });
      params.append('where[isActive][equals]', 'true');

      const res = await fetch(`${getApiBase()}/product-categories?${params.toString()}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`product-categories: ${res.status}`);
      const data = await res.json();
      const docs: unknown[] = Array.isArray(data?.docs) ? data.docs : [];
      const cats: MarketplaceProductCategory[] = docs.map((d) => {
        const c = d as Record<string, unknown>;
        return {
          id: (c.id as number | string) ?? '',
          name: String(c.name ?? ''),
          slug: String(c.slug ?? ''),
          displayOrder: typeof c.displayOrder === 'number' ? c.displayOrder : 0,
          isActive: c.isActive !== false,
        };
      });
      dataCache.set(cacheKey, cats, CACHE_TTL.PRODUCT_CATEGORIES);
      return cats;
    } catch (err) {
      console.error('Error fetching marketplace product categories:', err);
      return [];
    }
  }

  /**
   * Scoped product fetch — copies the proven merchant-menu pattern
   * (`merchant-client-service.ts:194`):
   * `GET merchant-products?where[merchant_id][in]=<eligibleIds>&limit=<small>&depth=2`
   * instead of the global `limit=400 depth=2` waterfall.
   *
   * Location gate (hard rule, copies Nearby/Newly Updated): `customerId`
   * REQUIRED and `eligibleMerchants` (the already-loaded Nearby set)
   * REQUIRED. No customer or no eligible merchants → [] — never the
   * global pool. Zero extra location fetch (copies Newly Updated: derive
   * with zero network — `LocationBasedMerchants.tsx:155-162`).
   */
  static async getMarketplaceProducts(
    options: MarketplaceProductsOptions = {},
  ): Promise<RecommendedProduct[]> {
    const { limit = 48, customerId = null, eligibleMerchants = null } = options;
    const eligibleIds = (eligibleMerchants ?? []).map((m) => String(m.id)).filter(Boolean);
    // Cache key includes limit (copies MERCHANT_KEYS.list customerId,
    // categoryId, limit — `useLocationBasedMerchants.ts:6-7,27`).
    const idsHash = eligibleIds.slice().sort().join(',');
    const cacheKey = `${CACHE_KEYS.MERCHANTS}-marketplace-products-${customerId ?? 'guest'}-${limit}-${idsHash}`;
    const cached = dataCache.get<RecommendedProduct[]>(cacheKey);
    if (cached) return cached;

    // Singleflight (copies `location-based-merchant-service.ts:80`).
    return dataCache.dedupe<RecommendedProduct[]>(cacheKey, async () => {
      try {
        // HARD RULE (copies hooks enabled !!customerId + categories
        // early-[] when no IDs): no customer or no eligible set → [].
        if (!customerId) return [];
        if (eligibleIds.length === 0) return [];

        const nearbyIds = new Set(eligibleIds);
        const distanceByMerchant = new Map<
          string,
          { distanceKm: number | null; isWithinDeliveryRadius: boolean; estimatedDeliveryTime: string | null }
        >();
        for (const m of eligibleMerchants ?? []) {
          const mm = m as unknown as Record<string, unknown>;
          distanceByMerchant.set(String(m.id), {
            distanceKm: typeof mm.distanceKm === 'number' ? (mm.distanceKm as number) : null,
            isWithinDeliveryRadius: (mm.isWithinDeliveryRadius as boolean) !== false,
            estimatedDeliveryTime:
              typeof mm.estimatedDeliveryTime === 'string' ? (mm.estimatedDeliveryTime as string) : null,
          });
        }

        // Scoped single query (copies merchant-menu `:194`): server filters
        // by eligible merchant IDs. Full pool, no per-merchant cap and no
        // cut: the rail must show ALL valid products of the eligible
        // merchants. Caps and cuts silently drop eligible products.
        const FETCH_WINDOW = 500;
        const params = new URLSearchParams({
          limit: String(FETCH_WINDOW),
          depth: '2',
          sort: '-updatedAt',
        });
        params.append('where[merchant_id][in]', eligibleIds.join(','));
        params.append('where[is_active][equals]', 'true');
        params.append('where[is_available][equals]', 'true');

        const res = await fetch(`${getApiBase()}/merchant-products?${params.toString()}`, {
          headers: getHeaders(),
        });
        if (!res.ok) throw new Error(`merchant-products: ${res.status}`);
        const data = await res.json();
        const docs: unknown[] = Array.isArray(data?.docs) ? data.docs : [];

        const mapDoc = (raw: unknown): RecommendedProduct | null => {
          const mp = raw as Record<string, unknown>;
          const product = (mp.product_id as Record<string, unknown> | null) || null;
          const merchant = (mp.merchant_id as Record<string, unknown> | null) || null;
          if (!product || typeof product !== 'object') return null;

          // Skip inactive / hidden catalogue items (same as merchant menu).
          if (product.isActive === false) return null;
          const visibility = product.catalogVisibility as string | undefined;
          if (visibility === 'hidden') return null;

          const mId =
            (merchant?.id as number | string | undefined) ?? (mp.merchant_id as number | string);
          if (mId == null) return null;

          // Location gate: drop every product whose merchant is not qualified.
          if (!nearbyIds.has(String(mId))) return null;
          const geo = distanceByMerchant.get(String(mId));

          const name = String(product.name ?? '');
          if (!name) return null;

          const primaryImage =
            (product.media as Record<string, unknown> | undefined)?.primaryImage ?? null;
          const imageUrl = getMediaUrl(primaryImage);

          const outletName =
            merchant && typeof merchant.outletName === 'string' && merchant.outletName
              ? (merchant.outletName as string)
              : 'Merchant';

          const rawCats = Array.isArray(product.categories) ? (product.categories as unknown[]) : [];
          const categoryIds: (number | string)[] = [];
          for (const c of rawCats) {
            if (typeof c === 'number' || typeof c === 'string') {
              categoryIds.push(c);
            } else if (c && typeof c === 'object') {
              const co = c as Record<string, unknown>;
              if (co.id != null) categoryIds.push(co.id as number | string);
            }
          }

          return {
            id: (product.id as number | string | undefined) ?? (mp.id as number | string),
            merchantProductId: (mp.id as number | string) ?? '',
            merchantId: mId as number | string,
            merchantName: outletName,
            name,
            productType: String(product.productType ?? 'simple'),
            basePrice: typeof product.basePrice === 'number' ? (product.basePrice as number) : null,
            compareAtPrice:
              typeof product.compareAtPrice === 'number' ? (product.compareAtPrice as number) : null,
            shortDescription: (product.shortDescription as string | null) ?? null,
            imageUrl,
            categoryIds,
            hasRequiredModifiers: false,
            distanceKm: geo?.distanceKm ?? null,
            isWithinDeliveryRadius: geo ? geo.isWithinDeliveryRadius : undefined,
            estimatedDeliveryTime: geo?.estimatedDeliveryTime ?? null,
          };
        };

        const out: RecommendedProduct[] = [];

        // Full pool, no cap and no cut: every valid doc collected.
        // Caps and cuts silently drop eligible products — never do that again.
        for (const raw of docs) {
          const mapped = mapDoc(raw);
          if (!mapped) continue;
          out.push(mapped);
        }

        // Mix owners round-robin by merchant (kills first-merchant bias).
        // Deterministic: merchant first-seen order decides rotation,
        // in-merchant order kept. Capped at the 40-item discovery ceiling —
        // the client pages through all 40 with Show More, then end-state.
        const MAX_POOL = 40;
        const finalOut = interleaveByMerchant(out, (p) => String(p.merchantId)).slice(
          0,
          MAX_POOL,
        );
        dataCache.set(cacheKey, finalOut, CACHE_TTL.MERCHANTS);
        return finalOut;
      } catch (err) {
        console.error('Error fetching marketplace products:', err);
        return [];
      }
    });
  }

  /**
   * Scoped categories fetch — copies the proven merchant-categories
   * (`location-based-merchant-service.ts:171-175`) + merchant-menu
   * (`merchant-client-service.ts:280`) pattern:
   * `GET product-categories?where[id][in]=<collectedIds>&limit=ids.length&depth=1`
   * instead of the global `limit=30` fetch. Empty IDs → [] (copies `:163`).
   */
  static async getProductCategoriesByIds(
    ids: (number | string)[],
  ): Promise<MarketplaceProductCategory[]> {
    const unique = Array.from(new Set(ids.map(String))).filter(Boolean);
    if (unique.length === 0) return [];
    const sorted = unique.slice().sort();
    const cacheKey = `${CACHE_KEYS.PRODUCT_CATEGORIES}-marketplace-byids-${sorted.join(',')}`;
    const cached = dataCache.get<MarketplaceProductCategory[]>(cacheKey);
    if (cached) return cached;

    return dataCache.dedupe<MarketplaceProductCategory[]>(cacheKey, async () => {
      try {
        const params = new URLSearchParams({
          limit: String(sorted.length),
          depth: '1',
        });
        params.append('where[id][in]', sorted.join(','));
        const res = await fetch(`${getApiBase()}/product-categories?${params.toString()}`, {
          headers: getHeaders(),
        });
        if (!res.ok) throw new Error(`product-categories: ${res.status}`);
        const data = await res.json();
        const docs: unknown[] = Array.isArray(data?.docs) ? data.docs : [];
        const cats: MarketplaceProductCategory[] = docs.map((d) => {
          const c = d as Record<string, unknown>;
          return {
            id: (c.id as number | string) ?? '',
            name: String(c.name ?? ''),
            slug: String(c.slug ?? ''),
            displayOrder: typeof c.displayOrder === 'number' ? c.displayOrder : 0,
            isActive: c.isActive !== false,
          };
        });
        dataCache.set(cacheKey, cats, CACHE_TTL.PRODUCT_CATEGORIES);
        return cats;
      } catch (err) {
        console.error('Error fetching marketplace product categories by ids:', err);
        return [];
      }
    });
  }

  static clearCache(): void {
    const stats = dataCache.getStats();
    stats.keys.forEach((key) => {
      if (key.includes('marketplace-products') || key.startsWith(CACHE_KEYS.PRODUCT_CATEGORIES)) {
        dataCache.delete(key);
      }
    });
  }
}

export const getMarketplaceProducts = MarketplaceProductService.getMarketplaceProducts;
export const getMarketplaceProductCategories = MarketplaceProductService.getProductCategories;
export const getMarketplaceProductCategoriesByIds = MarketplaceProductService.getProductCategoriesByIds;
export const clearMarketplaceProductsCache = MarketplaceProductService.clearCache;

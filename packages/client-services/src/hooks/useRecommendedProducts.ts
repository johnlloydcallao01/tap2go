import { useQuery } from '@tanstack/react-query';
import {
  MarketplaceProductService,
  type EligibleMerchantGate,
} from '../services/marketplace-product-service';

// Copies MERCHANT_KEYS shape: limit + scope in key so pools never poison
// each other (`useLocationBasedMerchants.ts:6-7,25-27`).
export const RECOMMENDED_KEYS = {
  all: ['recommended-products'] as const,
  list: (customerId: string, limit?: number, idsHash?: string) =>
    [...RECOMMENDED_KEYS.all, 'list', customerId, limit, idsHash ?? 'no-merchants'] as const,
};

interface RecommendedProductsOptions {
  /** Gate the fetch (e.g. hidden when merchant-category filter active). Default true. */
  enabled?: boolean;
  /** Override TanStack staleTime (ms). Defaults to the shared client default. */
  staleTime?: number;
  /**
   * Eligible merchants — pass the already-loaded Nearby set (copies Newly
   * Updated derive-with-zero-fetch). REQUIRED: empty → no fetch.
   */
  eligibleMerchants?: EligibleMerchantGate[] | null;
}

export function useRecommendedProducts(
  customerId?: string | null,
  limit: number = 12,
  options?: RecommendedProductsOptions,
) {
  const eligibleMerchants = options?.eligibleMerchants ?? null;
  const idsHash = (eligibleMerchants ?? [])
    .map((m) => String(m.id))
    .sort()
    .join(',');
  // Copies Nearby enabled gate (`useLocationBasedMerchants.ts:23`):
  // gated + no eligible set → no fetch (like categories early-[]).
  const enabled =
    (options?.enabled ?? true) && !!customerId && (eligibleMerchants?.length ?? 0) > 0;
  return useQuery({
    queryKey: RECOMMENDED_KEYS.list(customerId || '', limit, idsHash),
    queryFn: async () => {
      if (!customerId) return [];
      return MarketplaceProductService.getMarketplaceProducts({
        customerId,
        limit,
        eligibleMerchants,
      });
    },
    enabled,
    ...(options?.staleTime !== undefined ? { staleTime: options.staleTime } : {}),
  });
}

export const MARKETPLACE_CATEGORY_KEYS = {
  all: ['marketplace-product-categories'] as const,
  list: (limit?: number) => [...MARKETPLACE_CATEGORY_KEYS.all, 'list', limit] as const,
  byIds: (idsHash?: string) =>
    [...MARKETPLACE_CATEGORY_KEYS.all, 'by-ids', idsHash ?? 'none'] as const,
};

export function useMarketplaceProductCategories(limit: number = 30) {
  return useQuery({
    queryKey: MARKETPLACE_CATEGORY_KEYS.list(limit),
    queryFn: () => MarketplaceProductService.getProductCategories({ limit }),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Scoped categories (copies merchant-menu `:280` + merchant-categories
 * `:171-175`): fetch only `where[id][in]=collectedIds`. Empty → disabled.
 */
export function useMarketplaceProductCategoriesByIds(ids: (number | string)[]) {
  const unique = Array.from(new Set(ids.map(String))).filter(Boolean).sort();
  const idsHash = unique.join(',');
  return useQuery({
    queryKey: MARKETPLACE_CATEGORY_KEYS.byIds(idsHash),
    queryFn: () => MarketplaceProductService.getProductCategoriesByIds(unique),
    staleTime: 1000 * 60 * 10,
    enabled: unique.length > 0,
  });
}

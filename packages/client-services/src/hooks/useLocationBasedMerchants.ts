import { useQuery } from '@tanstack/react-query';
import { LocationBasedMerchantService } from '../services/location-based-merchant-service';

export const MERCHANT_KEYS = {
  all: ['merchants'] as const,
  list: (customerId: string, categoryId?: string | null, limit?: number) =>
    [...MERCHANT_KEYS.all, 'list', customerId, categoryId, limit] as const,
};

interface LocationMerchantsOptions {
  /** Gate the fetch (e.g. only when a modal is visible). Default true. */
  enabled?: boolean;
  /** Override TanStack staleTime (ms). Defaults to the shared client default. */
  staleTime?: number;
}

export function useLocationBasedMerchants(
  customerId?: string,
  categoryId?: string | null,
  limit: number = 20,
  options?: LocationMerchantsOptions
) {
  const enabled = (options?.enabled ?? true) && !!customerId;
  return useQuery({
    // limit is part of the key: limit=20 and limit=9999 payloads must never
    // share cache entries (previously poisoned each other).
    queryKey: MERCHANT_KEYS.list(customerId || '', categoryId, limit),
    queryFn: async () => {
      if (!customerId) return [];
      return LocationBasedMerchantService.getLocationBasedMerchants({
        customerId,
        limit,
        categoryId: categoryId || undefined,
      });
    },
    enabled,
    ...(options?.staleTime !== undefined ? { staleTime: options.staleTime } : {}),
  });
}

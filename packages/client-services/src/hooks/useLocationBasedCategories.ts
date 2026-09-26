import { useQuery } from '@tanstack/react-query';
import { LocationBasedMerchantService } from '../services/location-based-merchant-service';

export const CATEGORY_KEYS = {
  all: ['categories'] as const,
  list: (customerId: string, includeInactive?: boolean, limit?: number) =>
    [...CATEGORY_KEYS.all, 'list', customerId, includeInactive, limit] as const,
};

interface LocationCategoriesOptions {
  /** Gate the fetch (e.g. only when a modal is visible). Default true. */
  enabled?: boolean;
  /** Override TanStack staleTime (ms). Defaults to the shared client default. */
  staleTime?: number;
}

export function useLocationBasedCategories(
  customerId?: string,
  includeInactive: boolean = false,
  limit: number = 20,
  options?: LocationCategoriesOptions
) {
  const enabled = (options?.enabled ?? true) && !!customerId;
  return useQuery({
    // includeInactive + limit are part of the key: different params must
    // never share cache entries.
    queryKey: CATEGORY_KEYS.list(customerId || '', includeInactive, limit),
    queryFn: async () => {
      if (!customerId) return [];
      return LocationBasedMerchantService.getLocationBasedMerchantCategories({
        customerId,
        includeInactive,
        limit,
      });
    },
    enabled,
    ...(options?.staleTime !== undefined ? { staleTime: options.staleTime } : {}),
  });
}

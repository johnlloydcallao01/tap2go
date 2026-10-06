import { useQuery } from '@tanstack/react-query';
import { HomeOverviewService } from '../services/home-overview-service';

export const HOME_OVERVIEW_KEYS = {
  all: ['home-overview'] as const,
  detail: (customerId: string, limit?: number, categoryId?: string | null) =>
    [...HOME_OVERVIEW_KEYS.all, 'detail', customerId, limit, categoryId ?? 'all'] as const,
};

interface HomeOverviewOptions {
  /** Gate the fetch. Default true. */
  enabled?: boolean;
  /** Override TanStack staleTime (ms). Defaults to the shared client default. */
  staleTime?: number;
}

/**
 * Single BFF query for the customer home screen (docs/BFF-pattern.md):
 * one endpoint returns nearby + newly-updated + categories + recommended.
 * Thin frontend — no raw collection stitching on home.
 */
export function useHomeOverview(
  customerId?: string | null,
  limit: number = 20,
  categoryId?: string | null,
  options?: HomeOverviewOptions,
) {
  const enabled = (options?.enabled ?? true) && !!customerId;
  return useQuery({
    queryKey: HOME_OVERVIEW_KEYS.detail(customerId || '', limit, categoryId),
    queryFn: async () => {
      if (!customerId) return null;
      return HomeOverviewService.getHomeOverview({
        customerId,
        limit,
        categoryId: categoryId || null,
      });
    },
    enabled,
    // Match the service memory-cache TTL (5 min): background revalidations
    // resolve from memory instead of churning (copies Nearby caller).
    ...(options?.staleTime !== undefined ? { staleTime: options.staleTime } : {}),
  });
}

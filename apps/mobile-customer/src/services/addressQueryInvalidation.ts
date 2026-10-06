import type { QueryClient } from '@tanstack/react-query';
import {
  dataCache,
  ADDRESS_KEYS,
  MERCHANT_KEYS,
  CATEGORY_KEYS,
  MERCHANT_ADDRESS_KEYS,
  RECOMMENDED_KEYS,
  MARKETPLACE_CATEGORY_KEYS,
  HOME_OVERVIEW_KEYS,
} from '@encreasl/client-services';

/**
 * Invalidate every query that depends on the user's active address.
 *
 * Used after an address is edited/saved so the header's `useActiveAddress`
 * and the location-based merchants/categories/merchant-address sections
 * refetch immediately instead of waiting for a manual pull-to-refresh.
 *
 * `resetQueries` evicts the cached data right away, making active consumers
 * show their loading state and re-fetch fresh data — matching the behaviour
 * FoodPanda shows when an address changes.
 */
export async function invalidateAddressDependentQueries(
  queryClient: QueryClient,
): Promise<void> {
  dataCache.clear();

  await Promise.all([
    queryClient.resetQueries({ queryKey: ADDRESS_KEYS.all }),
    queryClient.resetQueries({ queryKey: MERCHANT_KEYS.all }),
    queryClient.resetQueries({ queryKey: CATEGORY_KEYS.all }),
    queryClient.resetQueries({ queryKey: MERCHANT_ADDRESS_KEYS.all }),
    // Recommended pool is location-gated too — without this it stays stale
    // after an address change (HomeScreen pull-to-refresh already resets it).
    queryClient.resetQueries({ queryKey: RECOMMENDED_KEYS.all }),
    queryClient.resetQueries({ queryKey: MARKETPLACE_CATEGORY_KEYS.all }),
    // Home BFF overview (single endpoint drives home sections).
    queryClient.resetQueries({ queryKey: HOME_OVERVIEW_KEYS.all }),
  ]);
}
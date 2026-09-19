import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@encreasl/client-services';
import { getServerToken } from '@/app/actions/auth';
import { ClientOnly } from '@/components/ClientOnly';
import { MerchantZonesPageContent, MerchantZonesSkeleton } from './content';

/**
 * Server wrapper: prefetches the zone list (`limit=100`) + unfiltered
 * overview so cold open paints real map + rows on the first client commit
 * instead of fetch-after-mount. ClientOnly gate preserved (Google Maps +
 * terra-draw stay client-only, identical skeleton); zone/search filters stay
 * fully client-side. Empty dehydrated cache falls back to client fetch.
 * All fed endpoints are already HIT-cached server-side (§18). See
 * performance.md §4b item 3.
 */
export default async function MerchantZonesPage() {
  const queryClient = new QueryClient();
  try {
    const token = await getServerToken();
    if (token) {
      const base = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '');
      const [zonesRes, overviewRes] = await Promise.all([
        fetch(`${base}/api/admin/business-zones?limit=100`, {
          headers: { Authorization: `JWT ${token}` },
          next: { revalidate: 30 },
        }),
        fetch(`${base}/api/admin/business-zones/overview`, {
          headers: { Authorization: `JWT ${token}` },
          next: { revalidate: 30 },
        }),
      ]);
      if (zonesRes.ok) {
        queryClient.setQueryData(QUERY_KEYS.adminBusinessZones('limit=100'), await zonesRes.json());
      }
      if (overviewRes.ok) {
        queryClient.setQueryData(QUERY_KEYS.adminBusinessZoneOverview(), await overviewRes.json());
      }
    }
  } catch {
    // cold path falls back to client fetch
  }
  return (
    <ClientOnly fallback={<MerchantZonesSkeleton />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MerchantZonesPageContent />
      </HydrationBoundary>
    </ClientOnly>
  );
}
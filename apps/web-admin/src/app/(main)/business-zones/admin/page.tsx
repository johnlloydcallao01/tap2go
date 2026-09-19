import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@encreasl/client-services';
import { getServerToken } from '@/app/actions/auth';
import { ClientOnly } from '@/components/ClientOnly';
import { AdminBusinessZonesPageContent, AdminBusinessZonesSkeleton } from './content';

// Default list query — must match the qs AdminBusinessZonesPageContent builds
// for page=1&limit=10&sort=-createdAt with no search (URLSearchParams order:
// page, limit, sort).
const DEFAULT_QS = 'page=1&limit=10&sort=-createdAt';

/**
 * Server wrapper: prefetches the default first page + the unfiltered overview
 * so cold open paints real rows + map on the first client commit instead of
 * fetch-after-mount. ClientOnly gate preserved (Google Maps + terra-draw stay
 * client-only, identical skeleton); search/filter/sort/pagination stay fully
 * client-side. On auth/fetch failure the dehydrated cache is simply empty and
 * the client fetches as before. See performance.md §4b item 3.
 */
export default async function AdminBusinessZonesPage() {
  const queryClient = new QueryClient();
  try {
    const token = await getServerToken();
    if (token) {
      const base = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '');
      const [listRes, overviewRes] = await Promise.all([
        fetch(`${base}/api/admin/business-zones?${DEFAULT_QS}`, {
          headers: { Authorization: `JWT ${token}` },
          next: { revalidate: 30 },
        }),
        fetch(`${base}/api/admin/business-zones/overview`, {
          headers: { Authorization: `JWT ${token}` },
          next: { revalidate: 30 },
        }),
      ]);
      if (listRes.ok) {
        queryClient.setQueryData(QUERY_KEYS.adminBusinessZones(DEFAULT_QS), await listRes.json());
      }
      if (overviewRes.ok) {
        queryClient.setQueryData(QUERY_KEYS.adminBusinessZoneOverview(), await overviewRes.json());
      }
    }
  } catch {
    // cold path falls back to client fetch
  }
  return (
    <ClientOnly fallback={<AdminBusinessZonesSkeleton />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AdminBusinessZonesPageContent />
      </HydrationBoundary>
    </ClientOnly>
  );
}
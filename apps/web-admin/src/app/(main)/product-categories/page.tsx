import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@encreasl/client-services';
import { getServerToken } from '@/app/actions/auth';
import { ClientOnly } from '@/components/ClientOnly';
import { ProductCategoriesPageContent, ProductCategoriesSkeleton } from './content';

// Default list query — must match the qs ProductCategoriesPageContent builds for
// page=1&limit=10&sort=displayOrder with no search/filters
// (URLSearchParams order: page, limit, sort).
const DEFAULT_QS = 'page=1&limit=10&sort=displayOrder';

/**
 * Server wrapper: prefetches the default first page so cold open paints
 * real rows on the first client commit instead of fetch-after-mount.
 * ClientOnly gate preserved (identical skeleton server + first paint, no #441);
 * search/filters/pagination stay fully client-side. On auth/fetch failure the
 * dehydrated cache is simply empty and the client fetches as before.
 * See performance.md §4b item 3.
 */
export default async function ProductCategoriesPage() {
  const queryClient = new QueryClient();
  try {
    const token = await getServerToken();
    if (token) {
      const base = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '');
      const res = await fetch(`${base}/api/admin/product-categories?${DEFAULT_QS}`, {
        headers: { Authorization: `JWT ${token}` },
        next: { revalidate: 30 },
      });
      if (res.ok) {
        queryClient.setQueryData(QUERY_KEYS.adminProductCategories(DEFAULT_QS), await res.json());
      }
    }
  } catch {
    // cold path falls back to client fetch
  }
  return (
    <ClientOnly fallback={<ProductCategoriesSkeleton />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductCategoriesPageContent />
      </HydrationBoundary>
    </ClientOnly>
  );
}

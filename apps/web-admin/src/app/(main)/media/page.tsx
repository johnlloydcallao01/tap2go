import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@encreasl/client-services';
import { getServerToken } from '@/app/actions/auth';
import { ClientOnly } from '@/components/ClientOnly';
import { MediaLibraryPageContent, MediaLibrarySkeleton } from './content';

// Default list query — must match the qs MediaLibraryPageContent builds for
// page=1&limit=24 with no search/type (URLSearchParams order: page, limit).
const DEFAULT_QS = 'page=1&limit=24';

/**
 * Server wrapper: prefetches the default first page of the media library into
 * the dehydrated `QUERY_KEYS.adminMediaLibrary(DEFAULT_QS)` cache so cold open
 * paints real grid + tiles on the first client commit instead of
 * fetch-after-mount. The CMS GET is already global-key + gate-inside HIT-cached
 * (§20), and library list keys are platform-wide per qs so the wrapper passes
 * the cookie the client would otherwise send. Empty-cache/auth-failure falls
 * back to the client's direct fetch. ClientOnly gate preserved — XHR upload and
 * TZ-sensitive formats stay client-only; search/filter/pagination stay CSR.
 */
export default async function MediaLibraryPage() {
  const queryClient = new QueryClient();
  try {
    const token = await getServerToken();
    if (token) {
      const base = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '');
      const res = await fetch(`${base}/api/media/library?${DEFAULT_QS}`, {
        headers: { Authorization: `JWT ${token}` },
        next: { revalidate: 30 },
      });
      if (res.ok) {
        queryClient.setQueryData(QUERY_KEYS.adminMediaLibrary(DEFAULT_QS), await res.json());
      }
    }
  } catch {
    // cold path falls back to client fetch
  }
  return (
    <ClientOnly fallback={<MediaLibrarySkeleton />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MediaLibraryPageContent />
      </HydrationBoundary>
    </ClientOnly>
  );
}
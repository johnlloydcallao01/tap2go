import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@encreasl/client-services';
import { getServerToken } from '@/app/actions/auth';
import { ClientOnly } from '@/components/ClientOnly';
import { ProfileInner, ProfileSkeleton } from './content';

/**
 * Server wrapper: prefetches the signed-in admin's profile into the dehydrated
 * `QUERY_KEYS.adminProfile()` cache so cold open paints real header + tabs on
 * the first client commit instead of round-tripping the server action after
 * auth resolves. The CMS GET is already gate-inside + HIT-cached (§19). Profile
 * is per-user data, so the wrapper only prefetches for the same cookie the
 * client would use; empty-cache/auth-failure falls back to the client's
 * `getProfileData` server action. ClientOnly gate preserved — ?tab= routing and
 * TZ-sensitive dates/relative-times stay client-only.
 */
export default async function ProfilePage() {
  const queryClient = new QueryClient();
  try {
    const token = await getServerToken();
    if (token) {
      const base = (process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api').replace(/\/+$/, '');
      const res = await fetch(`${base}/api/admin/profile`, {
        headers: { Authorization: `JWT ${token}` },
        next: { revalidate: 30 },
      });
      if (res.ok) {
        queryClient.setQueryData(QUERY_KEYS.adminProfile(), await res.json());
      }
    }
  } catch {
    // cold path falls back to client server action
  }
  return (
    <ClientOnly fallback={<ProfileSkeleton />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProfileInner />
      </HydrationBoundary>
    </ClientOnly>
  );
}
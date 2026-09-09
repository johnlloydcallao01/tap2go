'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@encreasl/client-services';
import { getProfileData } from '@/app/actions/profile';

/**
 * Signed-in admin profile query — 3-min instant-back.
 * Wraps the profile server action (backed by the Redis-cached
 * CMS /api/admin/profile aggregation endpoint).
 * Only runs once auth is resolved.
 */
export function useProfile(enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.adminProfile(),
    queryFn: () => getProfileData(),
    enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
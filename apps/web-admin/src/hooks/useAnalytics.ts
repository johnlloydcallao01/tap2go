'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@encreasl/client-services';
import type { AnalyticsData } from '@/lib/analytics-types';

async function fetchAnalytics(qs: string, signal?: AbortSignal): Promise<AnalyticsData> {
  const res = await fetch(`/api/analytics?${qs}`, { signal });
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json() as Promise<AnalyticsData>;
}

/**
 * Analytics query — same 3-min instant-back philosophy as overview.
 * qs encodes range + search + filters, so each combination caches separately.
 * placeholderData keeps the previous slice visible while the new one loads
 * (no focus loss, no full skeleton on filter change).
 */
export function useAnalytics(qs: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminAnalytics(qs),
    queryFn: ({ signal }) => fetchAnalytics(qs, signal),
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

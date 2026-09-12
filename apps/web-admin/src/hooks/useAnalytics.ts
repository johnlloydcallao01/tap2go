'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, SHARED_QUERY_DEFAULTS } from '@encreasl/client-services';
import type {
  AnalyticsChartsGroup,
  AnalyticsData,
  AnalyticsSummaryGroup,
  AnalyticsTopsGroup,
} from '@/lib/analytics-types';

async function fetchAnalytics(qs: string, signal?: AbortSignal): Promise<AnalyticsData> {
  const res = await fetch(`/api/analytics?${qs}`, { signal });
  if (!res.ok) throw new Error('Failed to load analytics');
  return res.json() as Promise<AnalyticsData>;
}

async function fetchAnalyticsSummary(qs: string, signal?: AbortSignal): Promise<AnalyticsSummaryGroup> {
  const res = await fetch(`/api/analytics/summary?${qs}`, { signal });
  if (!res.ok) throw new Error('Failed to load analytics summary');
  return res.json() as Promise<AnalyticsSummaryGroup>;
}

async function fetchAnalyticsCharts(qs: string, signal?: AbortSignal): Promise<AnalyticsChartsGroup> {
  const res = await fetch(`/api/analytics/charts?${qs}`, { signal });
  if (!res.ok) throw new Error('Failed to load analytics charts');
  return res.json() as Promise<AnalyticsChartsGroup>;
}

async function fetchAnalyticsTops(qs: string, signal?: AbortSignal): Promise<AnalyticsTopsGroup> {
  const res = await fetch(`/api/analytics/tops?${qs}`, { signal });
  if (!res.ok) throw new Error('Failed to load analytics tops');
  return res.json() as Promise<AnalyticsTopsGroup>;
}

/**
 * Analytics query — same 3-min instant-back philosophy as overview.
 * qs encodes range + search + filters, so each combination caches separately.
 * placeholderData keeps the previous slice visible while the new one loads
 * (no focus loss, no full skeleton on filter change).
 *
 * @deprecated Prefer the split hooks below (useAnalyticsSummary,
 * useAnalyticsCharts, useAnalyticsTops) which fetch in parallel and render
 * progressively. Kept for backward compatibility.
 */
export function useAnalytics(qs: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminAnalytics(qs),
    queryFn: ({ signal }) => fetchAnalytics(qs, signal),
    placeholderData: keepPreviousData,
    ...SHARED_QUERY_DEFAULTS,
  });
}

/**
 * Split analytics queries — one React Query per group sharing the same
 * analytics/ directory. Mounted together they fetch in parallel with the same
 * qs (range + search + filters); each section renders as soon as its own
 * group resolves. keepPreviousData preserves the filter-change UX per group.
 */
export function useAnalyticsSummary(qs: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminAnalyticsSummary(qs),
    queryFn: ({ signal }) => fetchAnalyticsSummary(qs, signal),
    placeholderData: keepPreviousData,
    ...SHARED_QUERY_DEFAULTS,
  });
}

export function useAnalyticsCharts(qs: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminAnalyticsCharts(qs),
    queryFn: ({ signal }) => fetchAnalyticsCharts(qs, signal),
    placeholderData: keepPreviousData,
    ...SHARED_QUERY_DEFAULTS,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnalyticsTops(qs: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminAnalyticsTops(qs),
    queryFn: ({ signal }) => fetchAnalyticsTops(qs, signal),
    placeholderData: keepPreviousData,
    ...SHARED_QUERY_DEFAULTS,
    staleTime: 60 * 1000,
  });
}

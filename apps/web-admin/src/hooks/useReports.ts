'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, SHARED_QUERY_DEFAULTS } from '@encreasl/client-services';
import type {
  ReportsCatalogGroup,
  ReportsData,
  ReportsFinancialGroup,
  ReportsSummaryGroup,
} from '@/lib/reports-types';

async function fetchReports(range: string, signal?: AbortSignal): Promise<ReportsData> {
  const res = await fetch(`/api/reports?range=${range}`, { signal });
  if (!res.ok) throw new Error('Failed to load reports');
  return res.json() as Promise<ReportsData>;
}

async function fetchReportsSummary(range: string, signal?: AbortSignal): Promise<ReportsSummaryGroup> {
  const res = await fetch(`/api/reports/summary?range=${range}`, { signal });
  if (!res.ok) throw new Error('Failed to load reports summary');
  return res.json() as Promise<ReportsSummaryGroup>;
}

async function fetchReportsFinancial(range: string, signal?: AbortSignal): Promise<ReportsFinancialGroup> {
  const res = await fetch(`/api/reports/financial?range=${range}`, { signal });
  if (!res.ok) throw new Error('Failed to load reports financial');
  return res.json() as Promise<ReportsFinancialGroup>;
}

async function fetchReportsCatalog(range: string, signal?: AbortSignal): Promise<ReportsCatalogGroup> {
  const res = await fetch(`/api/reports/catalog?range=${range}`, { signal });
  if (!res.ok) throw new Error('Failed to load reports catalog');
  return res.json() as Promise<ReportsCatalogGroup>;
}

/**
 * Reports query — 3-min instant-back.
 * Range changes keep previous slice via placeholderData while refetching.
 *
 * @deprecated Prefer the split hooks below (useReportsSummary,
 * useReportsFinancial, useReportsCatalog) which fetch in parallel and render
 * progressively. Kept for backward compatibility.
 */
export function useReports(range: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminReports(range),
    queryFn: ({ signal }) => fetchReports(range, signal),
    placeholderData: keepPreviousData,
    ...SHARED_QUERY_DEFAULTS,
  });
}

/**
 * Split reports queries — one React Query per group sharing the same
 * reports/ directory. Mounted together they fetch in parallel with the same
 * range; each section renders as soon as its own group resolves.
 * keepPreviousData preserves the range-switch UX per group.
 */
export function useReportsSummary(range: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminReportsSummary(range),
    queryFn: ({ signal }) => fetchReportsSummary(range, signal),
    placeholderData: keepPreviousData,
    ...SHARED_QUERY_DEFAULTS,
    staleTime: 60 * 1000,
  });
}

export function useReportsFinancial(range: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminReportsFinancial(range),
    queryFn: ({ signal }) => fetchReportsFinancial(range, signal),
    placeholderData: keepPreviousData,
    ...SHARED_QUERY_DEFAULTS,
    staleTime: 2 * 60 * 1000,
  });
}

export function useReportsCatalog(range: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminReportsCatalog(range),
    queryFn: ({ signal }) => fetchReportsCatalog(range, signal),
    placeholderData: keepPreviousData,
    ...SHARED_QUERY_DEFAULTS,
    staleTime: 5 * 60 * 1000,
  });
}

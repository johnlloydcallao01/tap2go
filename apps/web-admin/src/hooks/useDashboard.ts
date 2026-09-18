'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, SHARED_QUERY_DEFAULTS } from '@encreasl/client-services';
import type {
  DashboardData,
  DashboardMetrics,
  DailyMetric,
  OrderStatusCount,
  TopMerchant,
  TopVendor,
  RecentOrder,
} from '@/lib/dashboard-types';

export interface DashboardMetricsGroup {
  metrics: DashboardMetrics;
}

export interface DashboardChartsGroup {
  revenueChart: DailyMetric[];
  orderStatusChart: OrderStatusCount[];
  topMerchants: TopMerchant[];
}

export interface DashboardTablesGroup {
  topVendors: TopVendor[];
  recentOrders: RecentOrder[];
}

export type DashboardOverview = DashboardMetricsGroup & DashboardChartsGroup & DashboardTablesGroup;

async function fetchDashboardOverview(signal?: AbortSignal): Promise<DashboardOverview> {
  const res = await fetch('/api/dashboard/overview', { signal });
  if (!res.ok) throw new Error('Failed to load dashboard overview');
  return res.json() as Promise<DashboardOverview>;
}

async function fetchDashboard(signal?: AbortSignal): Promise<DashboardData> {
  const res = await fetch('/api/dashboard', { signal });
  if (!res.ok) throw new Error('Failed to load dashboard');
  return res.json() as Promise<DashboardData>;
}

async function fetchDashboardMetrics(signal?: AbortSignal): Promise<DashboardMetricsGroup> {
  const res = await fetch('/api/dashboard/metrics', { signal });
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return res.json() as Promise<DashboardMetricsGroup>;
}

async function fetchDashboardCharts(signal?: AbortSignal): Promise<DashboardChartsGroup> {
  const res = await fetch('/api/dashboard/charts', { signal });
  if (!res.ok) throw new Error('Failed to load dashboard charts');
  return res.json() as Promise<DashboardChartsGroup>;
}

async function fetchDashboardTables(signal?: AbortSignal): Promise<DashboardTablesGroup> {
  const res = await fetch('/api/dashboard/tables', { signal });
  if (!res.ok) throw new Error('Failed to load dashboard tables');
  return res.json() as Promise<DashboardTablesGroup>;
}

/**
 * Dashboard overview query — 3-min instant-back.
 * Cached data renders instantly on back-nav (no skeleton);
 * background refetch only when stale. Reduces CMS + 6x payload.find hits.
 *
 * @deprecated Prefer the split hooks below (useDashboardMetrics,
 * useDashboardCharts, useDashboardTables) which fetch in parallel and render
 * progressively. Kept for backward compatibility.
 */
export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.adminDashboard,
    queryFn: ({ signal }) => fetchDashboard(signal),
    ...SHARED_QUERY_DEFAULTS,
  });
}

/**
 * Split overview queries — one React Query per group sharing the same
 * dashboard/ directory. Mounted together they fetch in parallel; each widget
 * renders as soon as its own group resolves (no whole-page waterfall).
 * Freshest data (tables) revalidates fastest; charts cache longest.
 */
export function useDashboardMetrics() {
  return useQuery({
    queryKey: QUERY_KEYS.adminDashboardMetrics,
    queryFn: ({ signal }) => fetchDashboardMetrics(signal),
    ...SHARED_QUERY_DEFAULTS,
    staleTime: 60 * 1000,
  });
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: QUERY_KEYS.adminDashboardCharts,
    queryFn: ({ signal }) => fetchDashboardCharts(signal),
    ...SHARED_QUERY_DEFAULTS,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDashboardTables() {
  return useQuery({
    queryKey: QUERY_KEYS.adminDashboardTables,
    queryFn: ({ signal }) => fetchDashboardTables(signal),
    ...SHARED_QUERY_DEFAULTS,
    staleTime: 30 * 1000,
  });
}

/**
 * Deduped overview query — single BFF call replacing 3-way fan-out.
 * 1 browser fetch -> 1 BFF -> 1 CMS overview (counts + SQL aggregates).
 * Preferred for /dashboard/overview cold loads.
 */
export function useDashboardOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.adminDashboardOverview,
    queryFn: ({ signal }) => fetchDashboardOverview(signal),
    ...SHARED_QUERY_DEFAULTS,
    staleTime: 30 * 1000,
  });
}

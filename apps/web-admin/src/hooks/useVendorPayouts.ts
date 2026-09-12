'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, SHARED_QUERY_DEFAULTS } from '@encreasl/client-services';

export type PayoutRow = {
  vendorId: string;
  businessName: string;
  legalName: string;
  businessType: string;
  verificationStatus: string;
  isActive: boolean;
  logo: { id: number; url: string | null } | null;
  totalMerchants: number;
  averageRating: number;
  orders: number;
  gross: number;
  platformFees: number;
  deliveryFees: number;
  net: number;
  refunded: number;
  avgOrder: number;
  avgNet: number;
};

export type Summary = {
  totalGross: number;
  totalNet: number;
  totalPlatformFees: number;
  totalDeliveryFees: number;
  totalRefunded: number;
  totalOrders: number;
  totalVendors: number;
  activeVendors: number;
  avgPayout: number;
  avgOrder: number;
};

export type PayoutResponse = {
  meta: { range: string; days: number; generatedAt: string; periodStart: string | null; periodEnd: string };
  summary: Summary;
  vendorPayouts: { rows: PayoutRow[]; count: number };
  daily: { date: string; gross: number; net: number; orders: number }[];
  verificationBreakdown: Record<string, number>;
};

export type PayoutsSummaryGroup = Pick<PayoutResponse, 'meta' | 'summary' | 'verificationBreakdown'>;
export type PayoutsRowsGroup = Pick<PayoutResponse, 'vendorPayouts'>;
export type PayoutsDailyGroup = Pick<PayoutResponse, 'daily'>;

async function fetchVendorPayouts(qs: string, signal?: AbortSignal): Promise<PayoutResponse> {
  const res = await fetch(`/api/vendors/payouts?${qs}`, { signal });
  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      throw new Error(j.error || 'Failed to load vendor payouts');
    } catch {
      throw new Error(text || 'Failed to load vendor payouts');
    }
  }
  return res.json() as Promise<PayoutResponse>;
}

/**
 * Vendor Payouts query — 3-min instant-back for cached ranges.
 * Range / filter switches must show the skeleton screen while fetching
 * (no placeholderData), so 7d/30d/90d/1y/all stay consistent with first load.
 *
 * @deprecated Prefer the split hooks below (usePayoutsSummary,
 * usePayoutsRows, usePayoutsDaily) which fetch in parallel and render
 * progressively. Kept for backward compatibility.
 */
export function useVendorPayouts(qs: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminVendorPayouts(qs),
    queryFn: ({ signal }) => fetchVendorPayouts(qs, signal),
    ...SHARED_QUERY_DEFAULTS,
  });
}

async function fetchPayoutsGroup<T>(group: 'summary' | 'rows' | 'daily', qs: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`/api/vendors/payouts/${group}?${qs}`, { signal });
  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      throw new Error(j.error || `Failed to load payouts ${group}`);
    } catch {
      throw new Error(text || `Failed to load payouts ${group}`);
    }
  }
  return res.json() as Promise<T>;
}

/**
 * Split payouts queries — one React Query per group sharing the same
 * payouts/ directory. Mounted together they fetch in parallel with the same
 * qs; each section renders as soon as its own group resolves. Like the
 * monolith hook, no placeholderData — range/filter switches skeleton.
 */
export function usePayoutsSummary(qs: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminVendorPayoutsSummary(qs),
    queryFn: ({ signal }) => fetchPayoutsGroup<PayoutsSummaryGroup>('summary', qs, signal),
    ...SHARED_QUERY_DEFAULTS,
    staleTime: 60 * 1000,
  });
}

export function usePayoutsRows(qs: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminVendorPayoutsRows(qs),
    queryFn: ({ signal }) => fetchPayoutsGroup<PayoutsRowsGroup>('rows', qs, signal),
    ...SHARED_QUERY_DEFAULTS,
    staleTime: 2 * 60 * 1000,
  });
}

export function usePayoutsDaily(qs: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminVendorPayoutsDaily(qs),
    queryFn: ({ signal }) => fetchPayoutsGroup<PayoutsDailyGroup>('daily', qs, signal),
    ...SHARED_QUERY_DEFAULTS,
    staleTime: 5 * 60 * 1000,
  });
}

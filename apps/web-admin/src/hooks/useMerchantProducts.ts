'use client';

import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, SHARED_QUERY_DEFAULTS } from '@encreasl/client-services';

export type MerchantProductLite = {
  merchantProductId: number;
  merchantId: number;
  product: { id: number; name: string; slug: string; sku: string | null; productType: string; basePrice: number | null; primaryImage: { id: number; url: string | null; thumbUrl?: string | null } | null } | null;
  price_override: number | null;
  stock_quantity: number | null;
  is_active: boolean;
  is_available: boolean;
  createdAt: string;
};

export type MerchantBrief = {
  id: number;
  outletName: string;
  outletCode: string;
  isActive: boolean;
  isAcceptingOrders: boolean;
  operationalStatus: string;
  vendor: { id: number; businessName: string; legalName: string; businessType: string; verificationStatus: string; isActive: boolean; logo: { id: number; url: string | null; thumbUrl?: string | null } | null } | null;
  media: { thumbnail: { id: number; url: string | null; thumbUrl?: string | null } | null };
  totalProducts: number;
  totalProductsFiltered: number;
  products: MerchantProductLite[];
};

export type MerchantProductPagination = {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type MerchantProductStats = {
  totalMerchants: number;
  totalVendors: number;
  totalMerchantProducts: number;
  activeMerchants: number;
  filteredMerchants: number;
  totalProducts: number;
};

export type MerchantProductAssignment = {
  merchantProductId: number;
  product: {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    productType: string;
    approvalStatus: string;
    basePrice: number | null;
    primaryImage: { id: number; url: string | null; thumbUrl?: string | null } | null;
  } | null;
  vendor: { id: number; businessName: string } | null;
  merchant: { id: number; outletName: string; outletCode: string } | null;
  priceOverride: number | null;
  stockQuantity: number | null;
  isActive: boolean;
  isAvailable: boolean;
};

export type MerchantProductsResponse = {
  view?: 'all';
  merchants?: MerchantBrief[];
  docs?: MerchantProductAssignment[];
  pagination: MerchantProductPagination | null;
  stats: MerchantProductStats | null;
  allViewStats?: {
    totalAssignments: number;
    activeAssignments: number;
    filteredAssignments: number;
  };
};

async function fetchMerchantProducts(qs: string, signal?: AbortSignal): Promise<MerchantProductsResponse> {
  const res = await fetch(`/api/merchant-products?${qs}`, { signal, cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      throw new Error(j.error || 'Failed to load merchant products');
    } catch {
      throw new Error(text || 'Failed to load merchant products');
    }
  }
  return res.json() as Promise<MerchantProductsResponse>;
}

/**
 * Merchant-encapsulated catalog query: outlet pages, outlet details, and the
 * all-merchant assignments view. Query key encodes page, limit, search, and filters.
 */
export function useMerchantProducts(qs: string) {
  const view = new URLSearchParams(qs).get('view') ?? 'merchant';
  return useQuery({
    queryKey: QUERY_KEYS.adminMerchantProducts(qs),
    queryFn: ({ signal }) => fetchMerchantProducts(qs, signal),
    placeholderData: (previousData, previousQuery) => {
      const previousParams = typeof previousQuery?.queryKey[2] === 'string'
        ? new URLSearchParams(previousQuery.queryKey[2])
        : null;
      const previousView = previousParams?.get('view') ?? 'merchant';
      return previousView === view ? previousData : undefined;
    },
    ...SHARED_QUERY_DEFAULTS,
  });
}
'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@encreasl/client-services';

export type AttributeDoc = {
  id: number;
  name: string;
  slug: string;
  type: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AttributePagination = {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type AttributeStats = {
  total: number;
  totalAll: number;
  filteredTotal: number;
  typeBreakdown: Record<string, number>;
  activeCount: number;
  inactiveCount: number;
};

export type CatalogAttributesResponse = {
  docs: AttributeDoc[];
  pagination: AttributePagination | null;
  stats: AttributeStats | null;
};

async function fetchCatalogAttributes(qs: string, signal?: AbortSignal): Promise<CatalogAttributesResponse> {
  const res = await fetch(`/api/catalog/attributes?${qs}`, { signal });
  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      throw new Error(j.error || 'Failed to load attributes');
    } catch {
      throw new Error(text || 'Failed to load attributes');
    }
  }
  return res.json() as Promise<CatalogAttributesResponse>;
}

/**
 * Catalog attributes list query — 3-min instant-back.
 * Query key encodes page, limit, sort, search, and filters.
 */
export function useCatalogAttributes(qs: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminCatalogAttributes(qs),
    queryFn: ({ signal }) => fetchCatalogAttributes(qs, signal),
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@encreasl/client-services';

export type BusinessZoneDoc = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  boundary: any | null;
  boundary_geometry: any | null;
  isActive: boolean;
  disabledReason: string | null;
  displayOrder: number;
  timezone: string;
  merchantCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type MerchantZoneDoc = {
  id: number;
  outletName: string;
  outletCode: string;
  vendor: { id: number; businessName: string; logo?: { id: number; url: string | null } | null } | null;
  media?: { thumbnail?: { id: number; url: string | null } | null; storeFrontImage?: { id: number; url: string | null } | null } | null;
  businessZone: { id: number; name: string; isActive: boolean } | null;
  businessZoneId: number | null;
  isActive: boolean;
  isAcceptingOrders: boolean;
  operationalStatus: string;
  merchant_latitude: number | null;
  merchant_longitude: number | null;
  service_area: any | null;
  delivery_radius_meters: number | null;
  timezone: string;
};

export type BusinessZonePagination = {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type BusinessZoneStats = {
  totalZones: number;
  activeZones: number;
  inactiveZones: number;
  totalMerchants: number;
  assignedMerchants: number;
  unassignedMerchants: number;
  merchantCountByZone: Record<string, number>;
};

export type BusinessZonesResponse = {
  docs: BusinessZoneDoc[];
  pagination: BusinessZonePagination | null;
  stats: BusinessZoneStats | null;
};

export type BusinessZoneOverviewResponse = {
  zones: BusinessZoneDoc[];
  merchantZones: MerchantZoneDoc[];
  stats: BusinessZoneStats | null;
};

async function fetchBusinessZones(qs: string, signal?: AbortSignal): Promise<BusinessZonesResponse> {
  const res = await fetch(`/api/business-zones?${qs}`, { signal });
  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      throw new Error(j.error || 'Failed to load business zones');
    } catch {
      throw new Error(text || 'Failed to load business zones');
    }
  }
  return res.json() as Promise<BusinessZonesResponse>;
}

async function fetchBusinessZoneOverview(qs: string, signal?: AbortSignal): Promise<BusinessZoneOverviewResponse> {
  const res = await fetch(`/api/business-zones/overview${qs ? `?${qs}` : ''}`, { signal });
  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text);
      throw new Error(j.error || 'Failed to load overview');
    } catch {
      throw new Error(text || 'Failed to load overview');
    }
  }
  return res.json() as Promise<BusinessZoneOverviewResponse>;
}

/**
 * Business zones list query — 3-min instant-back.
 * Query key encodes page, limit, sort, search, and filters.
 */
export function useBusinessZones(qs: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminBusinessZones(qs),
    queryFn: ({ signal }) => fetchBusinessZones(qs, signal),
    placeholderData: keepPreviousData,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Business zones overview (zones + merchant-zones) — 3-min instant-back.
 * Powers the map layer; cached independently from the list.
 * Pass optional query string (e.g. `zoneId=1`) for zone-filtered views.
 */
export function useBusinessZoneOverview(qs = '') {
  return useQuery({
    queryKey: QUERY_KEYS.adminBusinessZoneOverview(qs),
    queryFn: ({ signal }) => fetchBusinessZoneOverview(qs, signal),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
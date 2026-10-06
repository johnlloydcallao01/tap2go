import { dataCache, CACHE_KEYS, CACHE_TTL } from '../cache/data-cache';
import type { MerchantCategoryDisplay } from '../types/merchant';
import type { LocationBasedMerchant } from './location-based-merchant-service';
import type { RecommendedProduct } from './marketplace-product-service';

/**
 * BFF consumer for the mobile customer home screen (docs/BFF-pattern.md).
 *
 * The page calls ONE aggregation endpoint —
 * `GET {API_BASE}/customer/home-overview?customerId=&limit=[&categoryId=]` —
 * and renders the prepared sections. No raw collection stitching on home.
 *
 * BFF shapes are mapped back onto the existing client types
 * (`LocationBasedMerchant`, `MerchantCategoryDisplay`, `RecommendedProduct`)
 * so cards render unchanged.
 */

export interface HomeOverview {
  customer: { id: number; activeAddressId: number } | null;
  address: { id: number; latitude: number; longitude: number } | null;
  nearbyMerchants: LocationBasedMerchant[];
  newlyUpdatedMerchants: HomeMerchantWithAddress[];
  hasMoreNearby: boolean;
  hasMoreNewlyUpdated: boolean;
  categories: MerchantCategoryDisplay[];
  recommendedProducts: RecommendedProduct[];
  recommendedCategories: MerchantCategoryDisplay[];
  recommendedHasOrphans: boolean;
  filteredMerchants: HomeMerchantWithAddress[];
  totalCount: number;
}

export interface HomeMerchantWithAddress extends LocationBasedMerchant {
  activeAddressName: string | null;
}

export interface HomeOverviewOptions {
  customerId: string;
  limit?: number;
  categoryId?: string | null;
}

function getApiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env as Record<string, string | undefined>).EXPO_PUBLIC_API_URL ||
    'https://cms.tap2goph.com/api'
  );
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey =
    process.env.NEXT_PUBLIC_PAYLOAD_API_KEY ||
    (process.env as Record<string, string | undefined>).EXPO_PUBLIC_PAYLOAD_API_KEY;
  if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`;
  return headers;
}

interface BffMedia {
  cloudinaryURL?: string | null;
  url?: string | null;
  thumbnailURL?: string | null;
}

function toMerchant(raw: Record<string, unknown>): HomeMerchantWithAddress {
  const vendor = (raw.vendor as Record<string, unknown> | null) || null;
  const vendorLogo = (vendor?.logo as Record<string, unknown> | null) || null;
  const media = (raw.media as Record<string, unknown> | null) || null;
  const thumb = (media?.thumbnail as Record<string, unknown> | null) || null;
  const metrics = (raw.metrics as Record<string, unknown> | undefined) || undefined;
  const asMedia = (m: Record<string, unknown> | null): BffMedia | null =>
    m
      ? {
          cloudinaryURL: (m.cloudinaryURL as string | undefined) ?? null,
          url: (m.url as string | undefined) ?? null,
          thumbnailURL: (m.thumbnailURL as string | undefined) ?? null,
        }
      : null;
  const rawCats = raw.merchant_categories;
  return {
    id: String((raw.id as number | string | undefined) ?? ''),
    outletName: String(raw.outletName ?? 'Merchant'),
    vendor: vendor
      ? {
          id: (vendor.id as number | undefined) ?? 0,
          businessName: typeof vendor.businessName === 'string' ? (vendor.businessName as string) : null,
          logo: asMedia(vendorLogo) as never,
        }
      : null,
    media: { thumbnail: asMedia(thumb) as never, storeFrontImage: null },
    metrics: metrics
      ? {
          averageRating: typeof metrics.averageRating === 'number' ? (metrics.averageRating as number) : null,
          totalOrders: typeof metrics.totalOrders === 'number' ? (metrics.totalOrders as number) : null,
        }
      : null,
    contactInfo: null,
    isActive: (raw.isActive as boolean | null) ?? true,
    isAcceptingOrders: null,
    operationalStatus: (raw.operationalStatus as string | undefined) ?? 'open',
    deliverySettings: null,
    description: null,
    updatedAt: (raw.updatedAt as string | null) ?? null,
    createdAt: (raw.createdAt as string | null) ?? null,
    distance: typeof raw.distance === 'number' ? (raw.distance as number) : 0,
    distanceKm: typeof raw.distanceKm === 'number' ? (raw.distanceKm as number) : 0,
    isWithinDeliveryRadius: (raw.isWithinDeliveryRadius as boolean) === true,
    estimatedDeliveryTime:
      raw.estimatedDeliveryTime != null ? String(raw.estimatedDeliveryTime) : '',
    activeAddressId: null,
    activeFormattedAddress:
      typeof raw.activeAddressName === 'string' ? (raw.activeAddressName as string) : null,
    activeAddressName: typeof raw.activeAddressName === 'string' ? (raw.activeAddressName as string) : null,
  } as unknown as HomeMerchantWithAddress;
}

function toMerchantCategory(raw: Record<string, unknown>): MerchantCategoryDisplay {
  const media = (raw.media as Record<string, unknown> | undefined) || undefined;
  const icon = (media?.icon as Record<string, unknown> | null) || null;
  return {
    id: (raw.id as number | string) ?? '',
    name: String(raw.name ?? ''),
    slug: String(raw.slug ?? ''),
    media: {
      icon: icon
        ? {
            cloudinaryURL: (icon.cloudinaryURL as string | undefined) ?? null,
            url: (icon.url as string | undefined) ?? null,
            thumbnailURL: (icon.thumbnailURL as string | undefined) ?? null,
          }
        : null,
    },
  } as MerchantCategoryDisplay;
}

function toProduct(
  raw: Record<string, unknown>,
  distanceByMerchant: Map<string, { distanceKm: number | null; within: boolean; eta: string | null }>,
): RecommendedProduct {
  const mId = String((raw.merchantId as number | string | undefined) ?? '');
  const geo = distanceByMerchant.get(mId);
  const rawCats = (raw.categoryIds as unknown[]) || [];
  return {
    id: (raw.id as number | string) ?? '',
    merchantProductId: (raw.merchantProductId as number | string) ?? '',
    merchantId: (raw.merchantId as number | string) ?? '',
    merchantName: String(raw.merchantName ?? 'Merchant'),
    name: String(raw.name ?? ''),
    productType: String(raw.productType ?? 'simple'),
    basePrice: typeof raw.basePrice === 'number' ? (raw.basePrice as number) : null,
    compareAtPrice: typeof raw.compareAtPrice === 'number' ? (raw.compareAtPrice as number) : null,
    shortDescription: (raw.shortDescription as string | null) ?? null,
    imageUrl: (raw.imageUrl as string | null) ?? null,
    categoryIds: rawCats as (number | string)[],
    hasRequiredModifiers: false,
    distanceKm: geo?.distanceKm ?? (typeof raw.distanceKm === 'number' ? (raw.distanceKm as number) : null),
    isWithinDeliveryRadius: geo ? geo.within : undefined,
    estimatedDeliveryTime: geo?.eta ?? null,
  } as RecommendedProduct;
}

export class HomeOverviewService {
  static async getHomeOverview(options: HomeOverviewOptions): Promise<HomeOverview | null> {
    const { customerId, limit = 20, categoryId = null } = options;
    if (!customerId) return null;

    const cacheKey = `${CACHE_KEYS.MERCHANTS}-home-overview-${customerId}-${limit}-${categoryId || 'all'}`;
    const cached = dataCache.get<HomeOverview>(cacheKey);
    if (cached) return cached;

    // Singleflight (copies location-based-merchant-service).
    return dataCache.dedupe<HomeOverview | null>(cacheKey, async () => {
      try {
        const params = new URLSearchParams({
          customerId: customerId.toString(),
          limit: String(limit),
        });
        if (categoryId) params.append('categoryId', categoryId.toString());

        const url = `${getApiBase()}/customer/home-overview?${params.toString()}`;
        const response = await fetch(url, {
          headers: getHeaders(),
          credentials: 'omit',
        });
        if (!response.ok) throw new Error(`home-overview: ${response.status}`);
        const json = await response.json();
        if (!json?.success || !json?.data) return null;
        const data = json.data as Record<string, unknown>;

        const merchants = ((data.nearbyMerchants as unknown[]) || []).map((m) =>
          toMerchant(m as Record<string, unknown>),
        );
        const newly = ((data.newlyUpdatedMerchants as unknown[]) || []).map((m) =>
          toMerchant(m as Record<string, unknown>),
        );
        const filtered = ((data.filteredMerchants as unknown[]) || []).map((m) =>
          toMerchant(m as Record<string, unknown>),
        );
        const categories = ((data.categories as unknown[]) || []).map((c) =>
          toMerchantCategory(c as Record<string, unknown>),
        );
        const rec = (data.recommended as Record<string, unknown> | undefined) || undefined;
        const distanceByMerchant = new Map<
          string,
          { distanceKm: number | null; within: boolean; eta: string | null }
        >();
        for (const m of [...merchants, ...newly, ...filtered]) {
          distanceByMerchant.set(String(m.id), {
            distanceKm: typeof m.distanceKm === 'number' ? m.distanceKm : null,
            within: m.isWithinDeliveryRadius !== false,
            eta: typeof m.estimatedDeliveryTime === 'string' ? m.estimatedDeliveryTime : null,
          });
        }
        const products = (((rec?.products as unknown[]) || []) as Record<string, unknown>[]).map((p) =>
          toProduct(p, distanceByMerchant),
        );
        const productCategories = (((rec?.productCategories as unknown[]) || []) as Record<string, unknown>[]).map(
          (c) => toMerchantCategory(c),
        );

        const overview: HomeOverview = {
          customer: (data.customer as HomeOverview['customer']) ?? null,
          address: (data.address as HomeOverview['address']) ?? null,
          nearbyMerchants: merchants as LocationBasedMerchant[],
          newlyUpdatedMerchants: newly,
          hasMoreNearby: (data.hasMoreNearby as boolean) === true,
          hasMoreNewlyUpdated: (data.hasMoreNewlyUpdated as boolean) === true,
          categories,
          recommendedProducts: products,
          recommendedCategories: productCategories,
          recommendedHasOrphans: (rec?.hasOrphans as boolean) === true,
          filteredMerchants: filtered,
          totalCount: typeof data.totalCount === 'number' ? (data.totalCount as number) : 0,
        };
        dataCache.set(cacheKey, overview, CACHE_TTL.MERCHANTS);
        return overview;
      } catch (err) {
        console.error('Error fetching home overview:', err);
        return null;
      }
    });
  }

  static clearCache(): void {
    const stats = dataCache.getStats();
    stats.keys.forEach((key) => {
      if (key.includes('home-overview')) dataCache.delete(key);
    });
  }
}

export const getHomeOverview = HomeOverviewService.getHomeOverview;
export const clearHomeOverviewCache = HomeOverviewService.clearCache;

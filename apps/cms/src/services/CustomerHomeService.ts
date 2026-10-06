import type { Payload } from 'payload'
import { MerchantLocationService } from './MerchantLocationService'

export interface CustomerHomeRequest {
  customerId: number
  limit?: number
  categoryId?: string
}

export interface HomeMerchant {
  id: number | string
  outletName: string
  outletCode?: string | null
  vendor: {
    id: number | string | null
    businessName: string | null
    logo: { cloudinaryURL?: string | null; url?: string | null; thumbnailURL?: string | null } | null
  } | null
  media: {
    thumbnail: { cloudinaryURL?: string | null; url?: string | null; thumbnailURL?: string | null } | null
  } | null
  metrics: { averageRating: number | null; totalOrders: number | null } | null
  distance: number | null
  distanceKm: number | null
  isWithinDeliveryRadius: boolean
  estimatedDeliveryTime: string | null
  merchant_categories: (number | string)[]
  activeAddressName: string | null
  updatedAt?: string | null
  createdAt?: string | null
}

export interface HomeCategory {
  id: number | string
  name: string
  slug: string
  media?: { icon?: { cloudinaryURL?: string | null; url?: string | null } | null } | null
}

export interface HomeProduct {
  id: number | string
  merchantProductId: number | string
  merchantId: number | string
  merchantName: string
  name: string
  productType: string
  basePrice: number | null
  compareAtPrice: number | null
  shortDescription: string | null
  imageUrl: string | null
  categoryIds: (number | string)[]
  hasRequiredModifiers: boolean
  distanceKm: number | null
  isWithinDeliveryRadius?: boolean
  estimatedDeliveryTime: string | null
}

export interface CustomerHomeResponse {
  customer: { id: number; activeAddressId: number }
  address: { id: number; latitude: number; longitude: number }
  nearbyMerchants: HomeMerchant[]
  newlyUpdatedMerchants: HomeMerchant[]
  hasMoreNearby: boolean
  hasMoreNewlyUpdated: boolean
  categories: HomeCategory[]
  recommended: {
    products: HomeProduct[]
    productCategories: HomeCategory[]
    hasOrphans: boolean
  }
  filteredMerchants: HomeMerchant[]
  totalCount: number
}

function mediaUrl(media: unknown): string | null {
  if (!media || typeof media !== 'object') return null
  const m = media as Record<string, unknown>
  return (
    (typeof m.cloudinaryURL === 'string' && m.cloudinaryURL) ||
    (typeof m.cloudinary_url === 'string' && m.cloudinary_url) ||
    (typeof m.url === 'string' && m.url) ||
    (typeof m.thumbnailURL === 'string' && m.thumbnailURL) ||
    (typeof m.thumbnail_url === 'string' && m.thumbnail_url) ||
    null
  )
}

function toSlug(name: string | null | undefined): string {
  const base = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return base || 'item'
}

/**
 * Round-robin interleave by merchant owner (kills first-merchant bias):
 * take the 1st product of each merchant, then the 2nd of each, and so on.
 * Merchant first-seen order (= `-updatedAt` recency) decides rotation order,
 * and within a merchant the server order is preserved. Deterministic.
 */
function interleaveByMerchant<T>(items: T[], merchantIdOf: (item: T) => string): T[] {
  const groups = new Map<string, T[]>()
  const order: string[] = []
  for (const item of items) {
    const key = merchantIdOf(item)
    if (!groups.has(key)) {
      groups.set(key, [])
      order.push(key)
    }
    groups.get(key)!.push(item)
  }
  const out: T[] = []
  let round = 0
  let placed = true
  while (placed) {
    placed = false
    for (const key of order) {
      const group = groups.get(key)!
      if (round < group.length) {
        out.push(group[round])
        placed = true
      }
    }
    round++
  }
  return out
}

/**
 * CustomerHomeService — BFF aggregation builder for the mobile customer
 * home screen (docs/BFF-pattern.md).
 *
 * Owns: customer → active address → eligible merchants (PostGIS),
 * merchant categories, scoped merchant-products + product categories, and
 * per-merchant address names — so the app makes ONE request instead of
 * stitching ~7 raw collection fetches client-side.
 */
export class CustomerHomeService {
  private payload: Payload
  private merchantLocationService: MerchantLocationService

  constructor(payload: Payload) {
    this.payload = payload
    this.merchantLocationService = new MerchantLocationService(payload)
  }

  async buildCustomerHomeOverview(request: CustomerHomeRequest): Promise<CustomerHomeResponse> {
    const { customerId, limit = 20, categoryId } = request
    const safeLimit = Math.min(Math.max(limit || 20, 1), 50)

    // Step 1: customer → active address → eligible merchants (PostGIS, ≤50).
    const location = await this.merchantLocationService.getMerchantsForLocationDisplay({
      customerId,
      categoryId: categoryId || undefined,
    })
    const rawMerchants = (location.merchants || []) as unknown as Record<string, unknown>[]

    // Step 2: eligible set (client Nearby uses limit=20 → first 20).
    const eligible = rawMerchants.slice(0, safeLimit)
    const eligibleIds = eligible
      .map((m) => m.id as number | string)
      .filter((id) => id !== null && id !== undefined)

    // Step 3: merchant categories for the eligible set (scoped, like the
    // client merchant-categories?where[id][in] pattern — never global).
    const merchantCategoryIds = Array.from(
      new Set(
        eligible.flatMap((m) => {
          const cats = m.merchant_categories
          return Array.isArray(cats) ? cats.filter((c) => typeof c === 'number' || typeof c === 'string') : []
        }),
      ),
    )
    let categories: HomeCategory[] = []
    if (merchantCategoryIds.length > 0) {
      const catsRes = await this.payload.find({
        collection: 'merchant-categories',
        where: {
          and: [{ id: { in: merchantCategoryIds } }, { isActive: { equals: true } }],
        },
        limit: merchantCategoryIds.length,
        // depth:1 populates the top-level `icon` upload (schema has NO
        // `media` wrapper — `MerchantCategories.ts` field `icon`). depth:0
        // leaves a numeric ID, which renders as the gray placeholder.
        depth: 1,
      })
      categories = ((catsRes.docs || []) as unknown as Record<string, unknown>[]).map((c) => {
        const rawIcon = c.icon as Record<string, unknown> | number | null | undefined
        const icon = rawIcon && typeof rawIcon === 'object' ? rawIcon : null
        return {
          id: (c.id as number | string) ?? '',
          name: String(c.name ?? ''),
          slug: String(c.slug ?? toSlug(String(c.name ?? ''))),
          media: {
            icon: icon
              ? {
                  cloudinaryURL:
                    (icon.cloudinaryURL as string | undefined) ??
                    (icon.cloudinary_url as string | undefined) ??
                    null,
                  url: (icon.url as string | undefined) ?? null,
                }
              : null,
          },
        }
      })
    }

    // Step 4: scoped merchant-products for the eligible set (copies the
    // merchant-menu pattern: where[merchant_id][in] + active/available).
    // Skipped entirely in filtered mode (client hides Recommended then).
    let products: HomeProduct[] = []
    let productCategories: HomeCategory[] = []
    let hasOrphans = false
    if (!categoryId && eligibleIds.length > 0) {
      const distanceByMerchant = new Map<string, { distanceKm: number | null; within: boolean; eta: string | null }>()
      for (const m of eligible) {
        distanceByMerchant.set(String(m.id), {
          distanceKm: typeof m.distanceKm === 'number' ? (m.distanceKm as number) : null,
          within: (m.isWithinDeliveryRadius as boolean) !== false,
          eta:
            typeof m.estimatedDeliveryTime === 'string'
              ? (m.estimatedDeliveryTime as string)
              : m.estimatedDeliveryTime != null
                ? String(m.estimatedDeliveryTime)
                : null,
        })
      }
      // Full pool, no per-merchant cap and no pool cut: the rail must show
      // ALL valid products of the eligible merchants (mixed below). Caps and
      // cuts here silently drop eligible products — never do that again.
      const mpRes = await this.payload.find({
        collection: 'merchant-products',
        where: {
          and: [
            { merchant_id: { in: eligibleIds } },
            { is_active: { equals: true } },
            { is_available: { equals: true } },
          ],
        },
        sort: '-updatedAt',
        depth: 2,
        limit: 500,
      })
      const docs = (mpRes.docs || []) as unknown as Record<string, unknown>[]
      const catMap = new Map<string, HomeCategory>()
      const collected: HomeProduct[] = []
      for (const raw of docs) {
        const mp = raw as Record<string, unknown>
        const product = (mp.product_id as Record<string, unknown> | null) || null
        const merchant = (mp.merchant_id as Record<string, unknown> | null) || null
        if (!product || typeof product !== 'object') continue
        if (product.isActive === false) continue
        if ((product.catalogVisibility as string | undefined) === 'hidden') continue
        const mId = (merchant?.id as number | string | undefined) ?? (mp.merchant_id as number | string)
        if (mId == null) continue
        const name = String(product.name ?? '')
        if (!name) continue
        const rawCats = Array.isArray(product.categories) ? (product.categories as unknown[]) : []
        const categoryIds: (number | string)[] = []
        for (const c of rawCats) {
          if (typeof c === 'number' || typeof c === 'string') {
            categoryIds.push(c)
          } else if (c && typeof c === 'object') {
            const co = c as Record<string, unknown>
            if (co.id != null) {
              categoryIds.push(co.id as number | string)
              if (!catMap.has(String(co.id))) {
                catMap.set(String(co.id), {
                  id: co.id as number | string,
                  name: String(co.name ?? ''),
                  slug: String(co.slug ?? toSlug(String(co.name ?? ''))),
                })
              }
            }
          }
        }
        const geo = distanceByMerchant.get(String(mId))
        const outletName =
          merchant && typeof merchant.outletName === 'string' && merchant.outletName
            ? (merchant.outletName as string)
            : 'Merchant'
        const primaryImage =
          (product.media as Record<string, unknown> | undefined)?.primaryImage ?? null
        const priceOverride = typeof mp.price_override === 'number' ? (mp.price_override as number) : null
        const basePrice = typeof product.basePrice === 'number' ? (product.basePrice as number) : null
        collected.push({
          id: (product.id as number | string | undefined) ?? (mp.id as number | string),
          merchantProductId: (mp.id as number | string) ?? '',
          merchantId: mId as number | string,
          merchantName: outletName,
          name,
          productType: String(product.productType ?? 'simple'),
          basePrice: priceOverride ?? basePrice,
          compareAtPrice:
            typeof product.compareAtPrice === 'number' ? (product.compareAtPrice as number) : null,
          shortDescription: (product.shortDescription as string | null) ?? null,
          imageUrl: mediaUrl(primaryImage),
          categoryIds,
          hasRequiredModifiers: false,
          distanceKm: geo?.distanceKm ?? null,
          isWithinDeliveryRadius: geo ? geo.within : undefined,
          estimatedDeliveryTime: geo?.eta ?? null,
        })
      }
      // Mix owners round-robin by merchant (kills first-merchant bias),
      // capped at the 40-item discovery ceiling. The client pages through
      // all 40 with Show More, then shows the end-of-list state.
      const MAX_POOL = 40
      products.push(
        ...interleaveByMerchant(collected, (p) => String(p.merchantId)).slice(0, MAX_POOL),
      )
      productCategories = Array.from(catMap.values())
      hasOrphans = products.some((p) => !p.categoryIds || p.categoryIds.length === 0)
    }

    // Step 5: page-ready merchant slices (backend owns sort/filter).
    const toHomeMerchant = (m: Record<string, unknown>): HomeMerchant => {
      const vendor = (m.vendor as Record<string, unknown> | null) || null
      const vendorLogo = (vendor?.logo as Record<string, unknown> | null) || null
      const media = (m.media as Record<string, unknown> | null) || null
      const thumb = (media?.thumbnail as Record<string, unknown> | null) || null
      const metrics = (m.metrics as Record<string, unknown> | undefined) || undefined
      const rawCats = m.merchant_categories
      return {
        id: (m.id as number | string) ?? '',
        outletName: String(m.outletName ?? 'Merchant'),
        outletCode: (m.outletCode as string | null) ?? null,
        vendor: vendor
          ? {
              id: (vendor.id as number | string | null) ?? null,
              businessName: typeof vendor.businessName === 'string' ? (vendor.businessName as string) : null,
              logo: vendorLogo
                ? {
                    cloudinaryURL: (vendorLogo.cloudinaryURL as string | undefined) ?? (vendorLogo.cloudinary_url as string | undefined) ?? null,
                    url: (vendorLogo.url as string | undefined) ?? null,
                    thumbnailURL: (vendorLogo.thumbnailURL as string | undefined) ?? (vendorLogo.thumbnail_url as string | undefined) ?? null,
                  }
                : null,
            }
          : null,
        media: {
          thumbnail: thumb
            ? {
                cloudinaryURL: (thumb.cloudinaryURL as string | undefined) ?? (thumb.cloudinary_url as string | undefined) ?? null,
                url: (thumb.url as string | undefined) ?? null,
                thumbnailURL: (thumb.thumbnailURL as string | undefined) ?? (thumb.thumbnail_url as string | undefined) ?? null,
              }
            : null,
        },
        metrics: metrics
          ? {
              averageRating: typeof metrics.averageRating === 'number' ? (metrics.averageRating as number) : null,
              totalOrders: typeof metrics.totalOrders === 'number' ? (metrics.totalOrders as number) : null,
            }
          : {
              averageRating: typeof m.average_rating === 'number' ? (m.average_rating as number) : null,
              totalOrders: typeof m.total_orders === 'number' ? (m.total_orders as number) : null,
            },
        distance: typeof m.distanceMeters === 'number' ? (m.distanceMeters as number) : null,
        distanceKm: typeof m.distanceKm === 'number' ? (m.distanceKm as number) : null,
        isWithinDeliveryRadius: (m.isWithinDeliveryRadius as boolean) === true,
        estimatedDeliveryTime: m.estimatedDeliveryTime != null ? String(m.estimatedDeliveryTime) : null,
        merchant_categories: Array.isArray(rawCats)
          ? (rawCats as unknown[]).filter((c): c is number | string => typeof c === 'number' || typeof c === 'string')
          : [],
        activeAddressName: null,
        updatedAt: (m.updatedAt as string | null) ?? null,
        createdAt: (m.createdAt as string | null) ?? null,
      }
    }

    const mapped = eligible.map(toHomeMerchant)
    const nearbyMerchants = mapped.slice(0, 8)
    const newlyUpdatedMerchants = categoryId
      ? []
      : mapped
          .slice()
          .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')))
          .slice(0, 8)
    const filteredMerchants = categoryId ? mapped : []

    // Step 6: embed per-merchant address names (eliminates client N+1).
    const addressTargets = Array.from(
      new Map([...nearbyMerchants, ...newlyUpdatedMerchants, ...filteredMerchants].map((m) => [String(m.id), m])).values(),
    )
    await Promise.all(
      addressTargets.map(async (m) => {
        try {
          const full = await this.payload.findByID({
            collection: 'merchants',
            id: Number(m.id),
            depth: 1,
          })
          const active = (full as unknown as Record<string, unknown>)?.activeAddress as
            | Record<string, unknown>
            | null
          if (active && typeof active === 'object' && typeof active.formatted_address === 'string') {
            m.activeAddressName = active.formatted_address as string
          }
        } catch {
          m.activeAddressName = null
        }
      }),
    )

    return {
      customer: location.customer,
      address: location.address,
      nearbyMerchants,
      newlyUpdatedMerchants,
      hasMoreNearby: eligible.length > 8,
      hasMoreNewlyUpdated: eligible.length > 8,
      categories: categories.slice(0, 20),
      recommended: { products, productCategories, hasOrphans },
      filteredMerchants,
      totalCount: location.totalCount,
    }
  }
}

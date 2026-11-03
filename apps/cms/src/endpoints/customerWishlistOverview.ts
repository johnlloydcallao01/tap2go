import type { PayloadRequest } from 'payload'
import type { Merchant } from '../payload-types'
import crypto from 'crypto'
import { getOrBuildDashboard } from '../utils/dashboardCache'

type WishlistOverview = {
  docs: Array<{
    id: number | string
    merchant: Merchant
    createdAt?: string
  }>
  totalDocs: number
}

function relationId(value: unknown): string | number | null {
  if (typeof value === 'string' || typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' || typeof id === 'number') return id
  }
  return null
}

export async function customerWishlistOverviewHandler(req: PayloadRequest) {
  const startedAt = Date.now()
  const requestedId = req.headers.get('x-request-id')
  const requestId =
    requestedId && /^[a-zA-Z0-9_-]{1,64}$/.test(requestedId)
      ? requestedId
      : crypto.randomUUID()

  const respond = (body: unknown, status: number, cacheStatus?: string) =>
    Response.json(body, {
      status,
      headers: {
        'Cache-Control': 'private, no-store',
        ...(cacheStatus ? { 'X-Customer-Wishlist-Cache': cacheStatus } : {}),
      },
    })

  if (!req.user || (req.user.role !== 'service' && req.user.role !== 'admin')) {
    return respond({ success: false, error: 'Access denied', requestId }, 401)
  }

  const query = req.query as { customerId?: string; refresh?: string } | undefined
  const customerIdValue =
    query?.customerId ??
    (req.url ? new URL(req.url).searchParams.get('customerId') ?? undefined : undefined)
  const customerId = Number(customerIdValue)
  if (!Number.isSafeInteger(customerId) || customerId <= 0) {
    return respond({ success: false, error: 'A valid customerId is required', requestId }, 400)
  }

  const cacheKey = `customer:wishlist-overview:v1:${customerId}`
  const forceRefresh =
    query?.refresh === 'true' ||
    (req.url ? new URL(req.url).searchParams.get('refresh') === 'true' : false)

  try {
    const { data, status } = await getOrBuildDashboard<WishlistOverview>(
      cacheKey,
      60,
      async () => {
        const wishlistResult = await req.payload.find({
          collection: 'wishlists',
          where: { user: { equals: customerId } },
          sort: '-createdAt',
          depth: 0,
          limit: 200,
          pagination: false,
          overrideAccess: true,
          select: {
            id: true,
            itemType: true,
            merchant: true,
            createdAt: true,
          },
        })

        const wishlistDocs = wishlistResult.docs
        const merchantIds = Array.from(
          new Set(
            wishlistDocs
              .filter((doc) => doc.itemType === 'merchant' || doc.itemType == null)
              .map((doc) => relationId(doc.merchant))
              .filter((id): id is string | number => id !== null),
          ),
        )

        if (merchantIds.length === 0) {
          return { docs: [], totalDocs: 0 }
        }

        const merchantResult = await req.payload.find({
          collection: 'merchants',
          where: { id: { in: merchantIds } },
          limit: merchantIds.length,
          pagination: false,
          depth: 2,
          overrideAccess: true,
          context: { skipStoreHours: true },
          select: {
            id: true,
            outletName: true,
            vendor: true,
            media: { thumbnail: true },
            metrics: { averageRating: true, totalOrders: true },
            activeAddress: true,
            isActive: true,
            isAcceptingOrders: true,
            operationalStatus: true,
          },
        })

        const merchantsById = new Map(
          merchantResult.docs.map((merchant) => [String(merchant.id), merchant]),
        )
        const docs = wishlistDocs.flatMap((doc) => {
          if (doc.itemType !== 'merchant' && doc.itemType != null) return []
          const merchantId = relationId(doc.merchant)
          const merchant = merchantId == null ? undefined : merchantsById.get(String(merchantId))
          if (!merchant) return []
          return [{
            id: doc.id,
            merchant,
            ...(typeof doc.createdAt === 'string' ? { createdAt: doc.createdAt } : {}),
          }]
        })

        return { docs, totalDocs: docs.length }
      },
      { bypassCache: forceRefresh, awaitRedisWrite: false },
    )

    console.info('[customer-wishlist-overview] timing', {
      requestId,
      userId: customerId,
      cacheStatus: status,
      itemCount: data.docs.length,
      durationMs: Date.now() - startedAt,
    })

    return respond({ success: true, ...data, requestId }, 200, status)
  } catch (error) {
    console.error('[customer-wishlist-overview] request failed', {
      requestId,
      durationMs: Date.now() - startedAt,
      error,
    })
    return respond({ success: false, error: 'Failed to load wishlist', requestId }, 500)
  }
}

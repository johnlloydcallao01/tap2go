/**
 * @file apps/cms/src/app/api/admin/order-items/route.ts
 * @description BFF aggregation endpoint for web-admin order-items page (enterprise-grade).
 * Follows docs/BFF-pattern.md: backend owns context resolution, joins, filtering, pagination,
 * and sanitization with overrideAccess:true. Frontend is thin consumer.
 *
 * GET /api/admin/order-items?page=1&limit=10&search=&order=1,2&product=1,2&merchant_product=1,2&sort=-createdAt
 *     -> { docs, pagination, stats, meta }
 * Access: admin-only via authenticateAdmin (JWT Bearer/JWT or payload-token cookie)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { sql, type SQL } from 'drizzle-orm'

function optionalString(v: unknown): string | null {
  return typeof v === 'string' ? v.trim() || null : null
}
function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}
function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}
function sanitizeMediaRef(value: unknown): { id: number; url: string | null; filename: string | null } | null {
  if (!value || typeof value !== 'object') return null
  const src = value as Record<string, unknown>
  const id = Number(src.id)
  if (Number.isNaN(id)) return null
  const url =
    typeof src.cloudinaryURL === 'string' ? src.cloudinaryURL : typeof src.url === 'string' ? src.url : null
  return { id, url, filename: typeof src.filename === 'string' ? src.filename : null }
}

function sanitizeMerchantBrief(value: unknown): Record<string, any> | null {
  if (value == null) return null
  if (typeof value !== 'object') {
    const id = Number(value)
    if (Number.isNaN(id)) return null
    return { id, outletName: `Outlet #${id}`, outletCode: '', isActive: null, vendor: null }
  }
  const m = value as Record<string, any>
  const id = Number(m.id)
  if (Number.isNaN(id)) return null
  const rawVendor = m.vendor
  let vendor: Record<string, any> | null = null
  if (rawVendor && typeof rawVendor === 'object') {
    const v = rawVendor as Record<string, any>
    const vid = Number(v.id)
    if (!Number.isNaN(vid)) {
      vendor = { id: vid, businessName: str(v.businessName, ''), logo: sanitizeMediaRef(v.logo) }
    }
  } else if (rawVendor != null) {
    const vid = Number(rawVendor)
    if (!Number.isNaN(vid)) vendor = { id: vid, businessName: '', logo: null }
  }
  return {
    id,
    outletName: str(m.outletName, `Outlet #${id}`),
    outletCode: str(m.outletCode, ''),
    isActive: typeof m.isActive === 'boolean' ? m.isActive : null,
    vendor,
  }
}

function sanitizeOrderBrief(value: unknown): Record<string, any> | null {
  if (value == null) return null
  if (typeof value !== 'object') {
    const id = Number(value)
    if (Number.isNaN(id)) return null
    return { id, status: null, placed_at: null, merchant: null }
  }
  const o = value as Record<string, any>
  const id = Number(o.id)
  if (Number.isNaN(id)) return null
  return {
    id,
    status: optionalString(o.status) ?? str(o.status, 'pending'),
    placed_at: o.placed_at ? String(o.placed_at) : null,
    merchant: o.merchant ? sanitizeMerchantBrief(o.merchant) : null,
  }
}

function sanitizeProductBrief(value: unknown): Record<string, any> | null {
  if (value == null) return null
  if (typeof value !== 'object') {
    const id = Number(value)
    if (Number.isNaN(id)) return null
    return { id, name: `Product #${id}`, slug: '', sku: null, productType: null, basePrice: null, primaryImage: null }
  }
  const p = value as Record<string, any>
  const id = Number(p.id)
  if (Number.isNaN(id)) return null
  const mediaGroup = p.media as Record<string, any> | undefined
  const primaryImage = mediaGroup?.primaryImage ? sanitizeMediaRef(mediaGroup.primaryImage) : null
  return {
    id,
    name: str(p.name, `Product #${id}`),
    slug: str(p.slug, ''),
    sku: optionalString(p.sku),
    productType: optionalString(p.productType),
    basePrice: p.basePrice != null ? num(p.basePrice, 0) : null,
    primaryImage,
  }
}

function sanitizeMerchantProductBrief(value: unknown): Record<string, any> | null {
  if (value == null) return null
  if (typeof value !== 'object') {
    const id = Number(value)
    if (Number.isNaN(id)) return null
    return { id, display_title: `MerchantProduct #${id}`, price_override: null, stock_quantity: null, is_active: null, is_available: null, merchant: null, product: null }
  }
  const mp = value as Record<string, any>
  const id = Number(mp.id)
  if (Number.isNaN(id)) return null
  const merchantRaw = mp.merchant_id ?? mp.merchant
  const productRaw = mp.product_id ?? mp.product
  return {
    id,
    display_title: optionalString(mp.display_title) ?? `MerchantProduct #${id}`,
    price_override: mp.price_override != null ? num(mp.price_override, 0) : null,
    stock_quantity: mp.stock_quantity != null ? num(mp.stock_quantity, 0) : null,
    is_active: typeof mp.is_active === 'boolean' ? mp.is_active : typeof mp.isActive === 'boolean' ? mp.isActive : null,
    is_available: typeof mp.is_available === 'boolean' ? mp.is_available : null,
    merchant: merchantRaw ? sanitizeMerchantBrief(merchantRaw) : null,
    product: productRaw ? sanitizeProductBrief(productRaw) : null,
  }
}

function sanitizeOrderItemDoc(raw: Record<string, any>): Record<string, any> {
  return {
    id: raw.id,
    order: sanitizeOrderBrief(raw.order),
    product: sanitizeProductBrief(raw.product),
    merchant_product: sanitizeMerchantProductBrief(raw.merchant_product),
    product_name_snapshot: str(raw.product_name_snapshot, ''),
    price_at_purchase: num(raw.price_at_purchase, 0),
    quantity: num(raw.quantity, 0),
    options_snapshot: raw.options_snapshot ?? null,
    total_price: num(raw.total_price, 0),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  }
}

function parseCsv(value: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}
function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 })
}

const ALLOWED_SORT = new Set([
  '-createdAt',
  'createdAt',
  '-updatedAt',
  'updatedAt',
  '-price_at_purchase',
  'price_at_purchase',
  '-quantity',
  'quantity',
  '-total_price',
  'total_price',
  'product_name_snapshot',
  '-product_name_snapshot',
])

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const cacheQuery = Array.from(searchParams.entries())
      .filter(([key]) => key !== '_t')
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&') || 'page=1&limit=20'
    const cacheKey = `admin:order-items:v1:${cacheQuery}`
    const { data, status } = await getOrBuildDashboard(cacheKey, 60, () =>
      withAdminRequestSlot(() => buildOrderItemsList(payload, searchParams)),
    )
    return NextResponse.json(data, { headers: { 'X-OrderItems-Cache': status } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load order items'
    console.error('[admin/order-items] GET error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

type Rows = { rows: Array<Record<string, unknown>> }

async function oiRows(payload: Payload, query: string | SQL): Promise<Array<Record<string, unknown>>> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as Rows
  return Array.isArray(result?.rows) ? result.rows : []
}

async function buildOrderItemsList(payload: Payload, searchParams: URLSearchParams) {
  try {

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10))
    const search = searchParams.get('search')?.trim() || ''
    let sort = searchParams.get('sort') || '-createdAt'
    if (!ALLOWED_SORT.has(sort)) sort = '-createdAt'

    const orderCsv = parseCsv(searchParams.get('order'))
    const productCsv = parseCsv(searchParams.get('product'))
    const merchantProductCsv = parseCsv(searchParams.get('merchant_product'))

    const where: Record<string, any> = {}
    const and: any[] = []

    if (search) {
      const isNumeric = /^\d+$/.test(search)
      if (isNumeric) {
        const numericId = Number(search)
        and.push({
          or: [{ id: { equals: numericId } }, { product_name_snapshot: { contains: search } }],
        })
      } else {
        and.push({
          or: [{ product_name_snapshot: { contains: search } }],
        })
      }
    }

    if (orderCsv.length) {
      const filtered = orderCsv.map((v) => Number(v)).filter((n) => Number.isFinite(n) && !Number.isNaN(n))
      if (filtered.length) where.order = { in: filtered }
    }
    if (productCsv.length) {
      const filtered = productCsv.map((v) => Number(v)).filter((n) => Number.isFinite(n) && !Number.isNaN(n))
      if (filtered.length) where.product = { in: filtered }
    }
    if (merchantProductCsv.length) {
      const filtered = merchantProductCsv.map((v) => Number(v)).filter((n) => Number.isFinite(n) && !Number.isNaN(n))
      if (filtered.length) where.merchant_product = { in: filtered }
    }

    const finalWhere = and.length ? { and: [...and, where] } : where

    // Paginated display (correct, bounded ≤100) + SQL stats (no 2000-doc hydration).
    const [paginated, statRows] = await Promise.all([
      payload.find({
        collection: 'order-items',
        where: Object.keys(finalWhere).length ? (finalWhere as any) : undefined,
        page,
        limit,
        sort,
        depth: 2,
        overrideAccess: true,
      }),
      oiRows(payload, sql`SELECT COUNT(*)::int AS total,
        COALESCE(SUM(total_price::numeric),0) AS revenue,
        COALESCE(SUM(quantity::numeric),0) AS qty,
        COUNT(DISTINCT order_id)::int AS orders,
        COUNT(DISTINCT product_id)::int AS products,
        COUNT(*) FILTER (WHERE options_snapshot IS NOT NULL AND options_snapshot::text NOT IN ('null','[]','{}'))::int AS mods FROM order_items`),
    ])

    const docs = (paginated.docs as unknown as Record<string, any>[]).map((d) => sanitizeOrderItemDoc(d))

    // stats aggregation from SQL (global; avgQuantity divisor fixed to totalAll)
    const stats = statRows[0] ?? {}
    const totalAll = Number(stats.total ?? 0)
    const filteredTotal = typeof paginated.totalDocs === 'number' ? paginated.totalDocs : docs.length

    const totalRevenue = Number(stats.revenue ?? 0)
    const totalQuantity = Number(stats.qty ?? 0)

    const avgUnitPrice = totalQuantity > 0 ? totalRevenue / totalQuantity : 0
    const avgQuantity = totalAll > 0 ? totalQuantity / totalAll : 0

    const responseBody = {
      docs,
      pagination: {
        page: paginated.page,
        limit: paginated.limit,
        totalDocs: paginated.totalDocs,
        totalPages: paginated.totalPages,
        hasNextPage: paginated.hasNextPage,
        hasPrevPage: paginated.hasPrevPage,
      },
      stats: {
        totalAll,
        filteredTotal,
        totalRevenue,
        totalQuantity,
        avgUnitPrice,
        avgQuantity,
        uniqueOrders: Number(stats.orders ?? 0),
        uniqueProducts: Number(stats.products ?? 0),
        withModifiersCount: Number(stats.mods ?? 0),
      },
      meta: { generatedAt: new Date().toISOString(), sort, search },
    }
    return responseBody
  } catch (err: unknown) {
    console.error('[admin/order-items] list build error:', err)
    throw err
  }
}

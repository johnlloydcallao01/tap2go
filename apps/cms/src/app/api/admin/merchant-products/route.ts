/**
 * @file apps/cms/src/app/api/admin/merchant-products/route.ts
 * @description BFF for /products page — merchant-encapsulated catalog (Merchants → Products).
 * GET  /api/admin/merchant-products?page=1&limit=10&search=&isActive=&merchant=<id>
 * POST /api/admin/merchant-products — create merchant product (assign product to merchant)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard, bustProductsCache } from '@/utils/dashboardCache'
import { sql, type SQL } from 'drizzle-orm'

function sanitizeMediaRef(v: unknown): { id: number; url: string | null; thumbUrl: string | null } | null {
  if (!v || typeof v !== 'object') return null
  const s = v as Record<string, unknown>
  const id = Number(s.id); if (Number.isNaN(id)) return null
  const url = typeof s.cloudinaryURL === 'string' ? s.cloudinaryURL : typeof s.url === 'string' ? s.url : null
  return { id, url, thumbUrl: thumbUrl(url, 80) }
}

/**
 * Marketplace 80px thumbnail variant. Cloudinary fetch URLs transform via
 * `/upload/w_80,q_auto,f_auto/`; anything else (null, non-cloudinary,
 * already-transformed) passes through so callers always have a safe src.
 * See performance.md §17.
 */
function thumbUrl(url: string | null, w = 80): string | null {
  if (!url) return null
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  if (url.includes('q_auto')) return url
  return url.replace('/upload/', `/upload/w_${w},q_auto,f_auto/`)
}
function sanitizeVendorBrief(v: unknown) {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, any>
  const id = Number(o.id); if (Number.isNaN(id)) return null
  return { id, businessName: String(o.businessName || ''), legalName: String(o.legalName || ''), businessType: String(o.businessType || 'other'), verificationStatus: String(o.verificationStatus || 'pending'), isActive: !!o.isActive, logo: sanitizeMediaRef(o.logo) }
}
function badRequest(m: string, d?: unknown) { return NextResponse.json({ error: m, details: d }, { status: 400 }) }

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
      .join('&') || 'page=1&limit=10'
    const cacheKey = `admin:merchant-products:v1:${cacheQuery}`
    const { data, status } = await getOrBuildDashboard(cacheKey, 60, () =>
      withAdminRequestSlot(() => buildMerchantProductsView(payload, searchParams)),
    )
    return NextResponse.json(data, { headers: { 'X-MerchantProducts-Cache': status } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load merchant products'
    console.error('[admin/merchant-products] GET error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

type Rows = { rows: Array<Record<string, unknown>> }

async function mpRows(payload: Payload, query: string | SQL): Promise<Array<Record<string, unknown>>> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as Rows
  return Array.isArray(result?.rows) ? result.rows : []
}

function escLike(s: string): string {
  return s.replace(/[\\%_]/g, (m) => `\\${m}`)
}

type MerchantProductStats = {
  totalVendors: number
  totalMerchants: number
  totalMerchantProducts: number
  activeMerchants: number
}

/**
 * Global stats rollup — unfiltered platform totals shared by every list qs.
 * Cached 300s (own key); writes bust via bustProductsCache (prefix
 * admin:merchant-products:). Filtered totals still come from matchCount.
 * See performance.md §16.
 */
async function getMerchantProductStats(payload: Payload): Promise<MerchantProductStats> {
  const { data } = await getOrBuildDashboard<MerchantProductStats>(
    'admin:merchant-products:stats:v1',
    300,
    async () => {
      const [v, m, mp, am] = await Promise.all([
        payload.count({ collection: 'vendors', overrideAccess: true }),
        payload.count({ collection: 'merchants', overrideAccess: true, context: { skipStoreHours: true } }),
        payload.count({ collection: 'merchant-products', overrideAccess: true }),
        payload.count({ collection: 'merchants', where: { isActive: { equals: true } }, overrideAccess: true, context: { skipStoreHours: true } }),
      ])
      return {
        totalVendors: v.totalDocs || 0,
        totalMerchants: m.totalDocs || 0,
        totalMerchantProducts: mp.totalDocs || 0,
        activeMerchants: am.totalDocs || 0,
      }
    },
  )
  return data
}

type MpHydration = {
  merchantFilter: number
  search: string
  like: string | null
  productTypeFilter: string
  isActiveFilter: boolean | null
  stats: MerchantProductStats
}

type MpListCtx = {
  page: number
  limit: number
  like: string | null
  isActiveFilter: boolean | null
  stats: MerchantProductStats
}

async function buildMerchantDetail(payload: Payload, ctx: MpHydration) {
  const { merchantFilter, like, productTypeFilter, isActiveFilter, stats } = ctx

  const mpConds: SQL[] = [sql`mp.merchant_id_id = ${merchantFilter}`]
  if (like) mpConds.push(sql`(p.name ILIKE ${like} OR p.slug ILIKE ${like} OR p.sku ILIKE ${like})`)
  if (productTypeFilter) mpConds.push(sql`LOWER(p.product_type::text) = ${productTypeFilter}`)
  if (isActiveFilter !== null) mpConds.push(isActiveFilter ? sql`mp.is_active = true` : sql`mp.is_active = false`)
  let mpWhere: SQL = mpConds[0]
  for (let i = 1; i < mpConds.length; i++) mpWhere = sql`${mpWhere} AND ${mpConds[i]}`
  const fromClause = sql`FROM merchant_products mp LEFT JOIN products p ON p.id = mp.product_id_id WHERE ${mpWhere}`

  let merchantDoc: any = null
  try {
    merchantDoc = await payload.findByID({ collection: 'merchants', id: merchantFilter, depth: 2, overrideAccess: true, context: { skipStoreHours: true } })
  } catch { merchantDoc = null }

  const emptyPagination = { page: 1, limit: 10, totalDocs: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }
  const statsPayload = {
    totalMerchants: stats.totalMerchants || 0,
    totalVendors: stats.totalVendors || 0,
    totalMerchantProducts: stats.totalMerchantProducts || 0,
    activeMerchants: stats.activeMerchants || 0,
    filteredMerchants: merchantDoc ? 1 : 0,
    totalProducts: stats.totalMerchantProducts || 0,
  }

  if (!merchantDoc) {
    return {
      merchants: [],
      pagination: emptyPagination,
      stats: statsPayload,
      meta: { generatedAt: new Date().toISOString(), search: ctx.search, merchantId: String(merchantFilter) },
    }
  }

  // Page the merchant's products in SQL (bounded) then hydrate the page only
  // — replaces full-catalog hydration + in-memory sort/slice.
  const idRows = await mpRows(payload, sql`SELECT mp.id AS id ${fromClause} ORDER BY mp.id ASC LIMIT 500`)
  const mpIds = idRows.map((r) => Number(r.id)).filter((n) => Number.isFinite(n))

  const [mpRes, pRes] = await Promise.all([
    mpIds.length
      ? payload.find({ collection: 'merchant-products', where: { id: { in: mpIds } }, limit: mpIds.length, depth: 0, overrideAccess: true, pagination: false, context: { skipEffectiveModifierPreview: true } })
      : Promise.resolve({ docs: [] }),
    mpIds.length
      ? mpRows(payload, sql`SELECT DISTINCT p.id AS id FROM products p JOIN merchant_products mp ON mp.product_id_id = p.id WHERE mp.id IN (${sql.join(mpIds.map((n) => sql`${n}`), sql`, `)}) LIMIT 1000`)
          .then(async (pIdRows) => {
            const pIds = pIdRows.map((r) => Number(r.id)).filter((n: number) => Number.isFinite(n))
            if (!pIds.length) return { docs: [] }
            return payload.find({ collection: 'products', where: { id: { in: pIds } }, limit: pIds.length, depth: 1, overrideAccess: true, pagination: false, select: { id: true, name: true, slug: true, sku: true, productType: true, basePrice: true, media: true } } as any)
          })
      : Promise.resolve({ docs: [] }),
  ])

  const productMap = new Map<string, any>()
  ;(pRes.docs as any[] | undefined || []).forEach((p: any) => productMap.set(String(p.id), p))

  const products = (mpRes.docs as any[] | undefined || []).map((mp: any) => {
    const raw = mp.product_id ?? mp.product
    const productId = raw && typeof raw === 'object' ? String((raw as any).id ?? '') : String(raw ?? '')
    const product = productId ? productMap.get(productId) : null
    return {
      merchantProductId: Number(mp.id),
      merchantId: Number(merchantFilter),
      product: product ? {
        id: Number(product.id),
        name: String(product.name || ''),
        slug: String(product.slug || ''),
        sku: product.sku ? String(product.sku) : null,
        productType: String(product.productType || 'simple'),
        basePrice: product.basePrice != null ? Number(product.basePrice) : null,
        primaryImage: sanitizeMediaRef((product.media as any)?.primaryImage),
      } : null,
      price_override: mp.price_override != null ? Number(mp.price_override) : null,
      stock_quantity: mp.stock_quantity != null ? Number(mp.stock_quantity) : null,
      is_active: typeof mp.is_active === 'boolean' ? mp.is_active : typeof mp.isActive === 'boolean' ? mp.isActive : true,
      is_available: typeof mp.is_available === 'boolean' ? mp.is_available : true,
      createdAt: String(mp.createdAt || ''),
    }
  })

  const group = {
    id: Number(merchantDoc.id),
    outletName: String(merchantDoc.outletName || ''),
    outletCode: String(merchantDoc.outletCode || ''),
    isActive: typeof merchantDoc.isActive === 'boolean' ? merchantDoc.isActive : true,
    isAcceptingOrders: typeof merchantDoc.isAcceptingOrders === 'boolean' ? merchantDoc.isAcceptingOrders : true,
    operationalStatus: String(merchantDoc.operationalStatus || 'open'),
    vendor: sanitizeVendorBrief(merchantDoc.vendor),
    media: { thumbnail: sanitizeMediaRef((merchantDoc.media as any)?.thumbnail) },
    totalProducts: products.length,
    totalProductsFiltered: products.length,
    products,
  }

  return {
    merchants: [group],
    pagination: { page: 1, limit: 1, totalDocs: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    stats: statsPayload,
    meta: { generatedAt: new Date().toISOString(), search: ctx.search, merchantId: String(merchantFilter) },
  }
}

async function buildMerchantLanding(payload: Payload, ctx: MpListCtx) {
  const { page, limit, like, isActiveFilter, stats } = ctx

  const meConds: SQL[] = []
  if (like) {
    meConds.push(sql`(m.outlet_name ILIKE ${like} OR m.outlet_code ILIKE ${like} OR EXISTS (SELECT 1 FROM merchant_products mp JOIN products p ON p.id = mp.product_id_id WHERE mp.merchant_id_id = m.id AND (p.name ILIKE ${like} OR p.slug ILIKE ${like} OR p.sku ILIKE ${like})))`)
  }
  if (isActiveFilter !== null) meConds.push(isActiveFilter ? sql`m.is_active = true` : sql`m.is_active = false`)
  let meWhere: SQL = sql`1=1`
  if (meConds.length) {
    meWhere = meConds[0]
    for (let i = 1; i < meConds.length; i++) meWhere = sql`${meWhere} AND ${meConds[i]}`
  }

  const unfiltered = !like && isActiveFilter === null
  const offset = (page - 1) * limit
  const idRows = await mpRows(payload, sql`SELECT m.id AS id FROM merchants m WHERE ${meWhere} ORDER BY m.outlet_name LIMIT ${limit} OFFSET ${offset}`)
  let totalDocs: number
  if (unfiltered) {
    totalDocs = stats.totalMerchants || 0
  } else {
    const cRows = await mpRows(payload, sql`SELECT COUNT(*)::int AS c FROM merchants m WHERE ${meWhere}`)
    totalDocs = Number(cRows[0]?.c ?? 0)
  }
  const pageIds = idRows.map((r) => Number(r.id)).filter((n) => Number.isFinite(n))

  // Page merchants + their product counts in parallel. Merchants are projected
  // (no heavy blobs) and skip the expensive store-hours afterRead — the list
  // never renders live hours. Single GROUP BY replaces per-merchant N+1 counts.
  const [mRes, countRows] = await Promise.all([
    pageIds.length
      ? payload.find({ collection: 'merchants', where: { id: { in: pageIds } }, limit: pageIds.length, depth: 2, overrideAccess: true, pagination: false, context: { skipStoreHours: true }, select: { outletName: true, outletCode: true, isActive: true, isAcceptingOrders: true, operationalStatus: true, media: true, vendor: true, createdAt: true } } as any)
      : Promise.resolve({ docs: [] }),
    pageIds.length
      ? mpRows(payload, sql`SELECT mp.merchant_id_id AS mid, COUNT(*)::int AS c FROM merchant_products mp WHERE mp.merchant_id_id IN (${sql.join(pageIds.map((n: number) => sql`${n}`), sql`, `)}) GROUP BY mp.merchant_id_id`)
      : Promise.resolve([]),
  ])
  const countMap = new Map<string, number>()
  for (const r of countRows) countMap.set(String(r.mid), Number(r.c ?? 0))

  const merchants = (mRes.docs as any[] | undefined || []).map((m: any) => {
    const merchantId = String(m.id)
    const productCount = countMap.get(merchantId) ?? 0
    return {
      id: Number(m.id),
      outletName: String(m.outletName || ''),
      outletCode: String(m.outletCode || ''),
      isActive: typeof m.isActive === 'boolean' ? m.isActive : true,
      isAcceptingOrders: typeof m.isAcceptingOrders === 'boolean' ? m.isAcceptingOrders : true,
      operationalStatus: String(m.operationalStatus || 'open'),
      vendor: sanitizeVendorBrief(m.vendor),
      media: { thumbnail: sanitizeMediaRef((m.media as any)?.thumbnail) },
      totalProducts: productCount,
      totalProductsFiltered: productCount,
      products: [],
    }
  })
  // SQL already orders by outlet_name; keep a stable sort for the count-merged list.
  merchants.sort((a: any, b: any) => String(a.outletName || '').localeCompare(String(b.outletName || '')))

  const totalPages = Math.max(1, Math.ceil(totalDocs / limit))

  return {
    merchants,
    pagination: {
      page,
      limit,
      totalDocs,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    stats: {
      totalMerchants: stats.totalMerchants || 0,
      totalVendors: stats.totalVendors || 0,
      totalMerchantProducts: stats.totalMerchantProducts || 0,
      activeMerchants: stats.activeMerchants || 0,
      filteredMerchants: totalDocs,
      totalProducts: stats.totalMerchantProducts || 0,
    },
    meta: { generatedAt: new Date().toISOString(), search: ctx.like ? (ctx.like || '').replace(/%/g, '') : '', merchantId: null },
  }
}

async function buildMerchantProductsView(payload: Payload, searchParams: URLSearchParams) {
  try {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10))
    const searchRaw = searchParams.get('search')?.trim() || ''
    const search = searchRaw.toLowerCase()
    const merchantFilter = searchParams.get('merchant') ? Number(searchParams.get('merchant')) : null
    const productTypeFilter = searchParams.get('productType')?.trim().toLowerCase() || ''
    const isActiveParam = searchParams.get('isActive')
    const isActiveFilter = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : null
    const stats = await getMerchantProductStats(payload)

    if (merchantFilter && !Number.isNaN(merchantFilter)) {
      return buildMerchantDetail(payload, { merchantFilter, search, like: search ? `%${escLike(search)}%` : null, productTypeFilter, isActiveFilter, stats })
    }
    return buildMerchantLanding(payload, { page, limit, like: search ? `%${escLike(search)}%` : null, isActiveFilter, stats })
  } catch (err: unknown) {
    console.error('[admin/merchant-products] list build error:', err)
    throw err
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })
    let body: Record<string, any>
    try { body = await request.json() } catch { return badRequest('Invalid JSON body') }

    const merchantId = body.merchant_id != null ? Number(body.merchant_id) : body.merchant != null ? Number(body.merchant) : body.merchantId != null ? Number(body.merchantId) : NaN
    const productId = body.product_id != null ? Number(body.product_id) : body.product != null ? Number(body.product) : body.productId != null ? Number(body.productId) : NaN
    if (!merchantId || Number.isNaN(merchantId)) return badRequest('merchant_id is required')
    if (!productId || Number.isNaN(productId)) return badRequest('product_id is required')

    // Verify merchant and product exist
    try {
      await payload.findByID({ collection: 'merchants', id: merchantId, depth: 0, overrideAccess: true })
    } catch { return badRequest('merchant not found') }
    try {
      await payload.findByID({ collection: 'products', id: productId, depth: 0, overrideAccess: true })
    } catch { return badRequest('product not found') }

    // Check duplicate
    const existing = await payload.find({
      collection: 'merchant-products',
      where: { and: [{ merchant_id: { equals: merchantId } }, { product_id: { equals: productId } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs.length) return NextResponse.json({ error: 'Merchant product already exists for this merchant and product', code: 'DUPLICATE' }, { status: 409 })

    const price_override = body.price_override != null && body.price_override !== '' ? Number(body.price_override) : body.priceOverride != null ? Number(body.priceOverride) : null
    if (price_override !== null && (Number.isNaN(price_override) || price_override < 0)) return badRequest('price_override must be >= 0')
    const stock_quantity = body.stock_quantity != null && body.stock_quantity !== '' ? Number(body.stock_quantity) : null
    if (stock_quantity !== null && (Number.isNaN(stock_quantity) || stock_quantity < 0)) return badRequest('stock_quantity must be >= 0')
    const is_active = typeof body.is_active === 'boolean' ? body.is_active : typeof body.isActive === 'boolean' ? body.isActive : true
    const is_available = typeof body.is_available === 'boolean' ? body.is_available : typeof body.isAvailable === 'boolean' ? body.isAvailable : true
    const isActive = typeof body.is_active === 'boolean' ? body.is_active : true // alias

    const data: Record<string, any> = {
      merchant_id: merchantId,
      product_id: productId,
      price_override: price_override ?? undefined,
      stock_quantity: stock_quantity ?? undefined,
      is_active: is_active,
      is_available: is_available,
      isActive: isActive,
    }

    let created: Record<string, any>
    try {
      created = await payload.create({ collection: 'merchant-products', data: data as any, depth: 2, overrideAccess: true }) as unknown as Record<string, any>
    } catch (e: any) {
      const msg = e?.message || 'Failed to create merchant product'
      return NextResponse.json({ error: msg, details: e?.data || e?.errors }, { status: 400 })
    }
    // Bust list cache (all admins / query variants) so the new merchant product shows immediately
    await bustProductsCache()
    return NextResponse.json({ success: true, message: 'Merchant product created successfully', doc: created }, { status: 201 })
  } catch (err: any) {
    console.error('[admin/merchant-products] POST error:', err)
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 })
  }
}
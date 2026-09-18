/**
 * @file apps/cms/src/app/api/admin/merchant-products/route.ts
 * @description BFF for /products page — vendor-encapsulated merchant products (FoodPanda style).
 * GET  /api/admin/merchant-products?page=1&limit=10&search=&vendor=&productType=&isActive=
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
  return { id, businessName: String(o.businessName || ''), verificationStatus: String(o.verificationStatus || 'pending'), businessType: String(o.businessType || 'other') }
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
 * admin:merchant-products:). Filtered totals still come from matchTotal.
 * See performance.md §16.
 */
async function getMerchantProductStats(payload: Payload): Promise<MerchantProductStats> {
  const { data } = await getOrBuildDashboard<MerchantProductStats>(
    'admin:merchant-products:stats:v1',
    300,
    async () => {
      const [v, m, mp, am] = await Promise.all([
        payload.count({ collection: 'vendors', overrideAccess: true }),
        payload.count({ collection: 'merchants', overrideAccess: true }),
        payload.count({ collection: 'merchant-products', overrideAccess: true }),
        payload.count({ collection: 'merchants', where: { isActive: { equals: true } }, overrideAccess: true }),
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

async function buildMerchantProductsView(payload: Payload, searchParams: URLSearchParams) {
  try {

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10))
    const search = searchParams.get('search')?.trim().toLowerCase() || ''
    const vendorFilter = searchParams.get('vendor') ? Number(searchParams.get('vendor')) : null
    const merchantFilter = searchParams.get('merchant') ? Number(searchParams.get('merchant')) : null
    const productTypeFilter = searchParams.get('productType')?.trim().toLowerCase() || ''
    const isActiveParam = searchParams.get('isActive')
    const isActiveFilter = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : null

    const isUnfiltered = !search && !vendorFilter && !merchantFilter && !productTypeFilter && isActiveFilter === null
    let totalVendorsCount: number | null = null
    let totalMerchantsCount: number | null = null
    let totalMerchantProductsCount: number | null = null
    let activeMerchantsCount: number | null = null
    let vendorsRes: any
    let merchantsRes: any
    let merchantProductsRes: any
    let productsRes: any
    const vendorProductCounts = new Map<string, number>()

    if (isUnfiltered) {
      // The landing page only displays vendor summaries. Page vendors in SQL first,
      // then load relations for those vendors instead of the entire catalog.
      vendorsRes = await payload.find({
        collection: 'vendors', page, limit, sort: 'businessName', depth: 1,
        overrideAccess: true,
      } as any)
      const vendorIds = (vendorsRes.docs || []).map((vendor: any) => vendor.id)
      const [stats, scopedMerchants, mpCountRows] = await Promise.all([
        getMerchantProductStats(payload),
        vendorIds.length
          ? payload.find({ collection: 'merchants', where: { vendor: { in: vendorIds } }, limit: 2000, depth: 0, overrideAccess: true, pagination: false } as any)
          : Promise.resolve({ docs: [] }),
        // Single GROUP BY replaces per-vendor N+1 limit:1 finds.
        vendorIds.length
          ? mpRows(payload, sql`SELECT m.vendor_id::text AS vid, COUNT(mp.id)::int AS c FROM merchant_products mp JOIN merchants m ON m.id = mp.merchant_id_id WHERE m.vendor_id IN (${sql.join(vendorIds.map((v: number) => sql`${v}`), sql`, `)}) GROUP BY m.vendor_id`)
          : Promise.resolve([]),
      ])
      totalVendorsCount = stats.totalVendors || 0
      totalMerchantsCount = stats.totalMerchants || 0
      totalMerchantProductsCount = stats.totalMerchantProducts || 0
      activeMerchantsCount = stats.activeMerchants || 0
      merchantsRes = scopedMerchants
      for (const r of mpCountRows) vendorProductCounts.set(String(r.vid), Number(r.c ?? 0))
      for (const v of (vendorsRes.docs || [])) {
        if (!vendorProductCounts.has(String((v as any).id))) vendorProductCounts.set(String((v as any).id), 0)
      }
      merchantProductsRes = { docs: [] }
      productsRes = { docs: [] }
    } else {
      // Filtered searches: resolve matching vendor ids in SQL (bounded),
      // page them in SQL, then hydrate only the page — replaces 11k-doc
      // hydration + in-memory sort/slice. Semantics preserved: vendor hay
      // match OR product/merchant match, productType/isActive on mps.
      const vConds: SQL[] = []
      if (vendorFilter && !Number.isNaN(vendorFilter)) vConds.push(sql`v.id = ${vendorFilter}`)
      if (search || productTypeFilter || isActiveFilter !== null || merchantFilter) {
        const mpConds: SQL[] = []
        if (merchantFilter && !Number.isNaN(merchantFilter)) mpConds.push(sql`m.id = ${merchantFilter}`)
        if (search) {
          const like = `%${escLike(search)}%`
          mpConds.push(sql`(p.name ILIKE ${like} OR p.slug ILIKE ${like} OR p.sku ILIKE ${like} OR m.outlet_name ILIKE ${like} OR m.outlet_code ILIKE ${like})`)
        }
        if (productTypeFilter) mpConds.push(sql`LOWER(p.product_type::text) = ${productTypeFilter}`)
        if (isActiveFilter !== null) mpConds.push(isActiveFilter ? sql`mp.is_active = true` : sql`mp.is_active = false`)
        let mpWhere: SQL = mpConds[0]
        for (let i = 1; i < mpConds.length; i++) mpWhere = sql`${mpWhere} AND ${mpConds[i]}`
        const vendorHay = search ? sql` OR v.business_name ILIKE ${`%${escLike(search)}%`} OR v.legal_name ILIKE ${`%${escLike(search)}%`}` : sql``
        vConds.push(sql`(EXISTS (SELECT 1 FROM merchants m JOIN merchant_products mp ON mp.merchant_id_id = m.id LEFT JOIN products p ON p.id = mp.product_id_id WHERE m.vendor_id = v.id AND ${mpWhere})${vendorHay})`)
      }
      let matchWhere: SQL = sql`1=1`
      if (vConds.length) {
        matchWhere = vConds[0]
        for (let i = 1; i < vConds.length; i++) matchWhere = sql`${matchWhere} AND ${vConds[i]}`
      }
      const totalRows = await mpRows(payload, sql`SELECT COUNT(DISTINCT v.id)::int AS c FROM vendors v WHERE ${matchWhere}`)
      const matchTotal = Number(totalRows[0]?.c ?? 0)
      const offset = (page - 1) * limit
      const idRows = await mpRows(
        payload,
        sql`SELECT DISTINCT v.id AS id, v.business_name AS bname FROM vendors v WHERE ${matchWhere} ORDER BY v.business_name LIMIT ${limit} OFFSET ${offset}`,
      )
      const pageIds = idRows.map((r) => Number(r.id)).filter((n) => Number.isFinite(n))
      // Phase 1: page vendors + their merchants (bounded by page) + facet
      // rollups over the SAME matched-vendor set (marketplace left-rail counts).
      const [vRes, mRes, btFacetRows, vsFacetRows] = await Promise.all([
        pageIds.length
          ? payload.find({ collection: 'vendors', where: { id: { in: pageIds } }, limit: pageIds.length, depth: 1, overrideAccess: true, pagination: false } as any)
          : Promise.resolve({ docs: [] }),
        pageIds.length
          ? payload.find({ collection: 'merchants', where: { vendor: { in: pageIds } }, limit: 2000, depth: 0, overrideAccess: true, pagination: false } as any)
          : Promise.resolve({ docs: [] }),
        mpRows(payload, sql`SELECT COALESCE(LOWER(v.business_type::text),'other') AS s, COUNT(DISTINCT v.id)::int AS c FROM vendors v WHERE ${matchWhere} GROUP BY 1 ORDER BY 1`),
        mpRows(payload, sql`SELECT COALESCE(LOWER(v.verification_status::text),'pending') AS s, COUNT(DISTINCT v.id)::int AS c FROM vendors v WHERE ${matchWhere} GROUP BY 1 ORDER BY 1`),
      ])
      const pageMerchantIds = (mRes.docs as any[]).map((m: any) => Number(m.id)).filter((n: number) => Number.isFinite(n))
      // Phase 2: merchant-products + products for page merchants only.
      const [mpRes2, pRes2] = await Promise.all([
        pageMerchantIds.length
          ? payload.find({ collection: 'merchant-products', where: { merchant_id: { in: pageMerchantIds } }, limit: 5000, depth: 0, overrideAccess: true, pagination: false, context: { skipEffectiveModifierPreview: true } } as any)
          : Promise.resolve({ docs: [] }),
        pageMerchantIds.length
          ? mpRows(payload, sql`SELECT DISTINCT p.id AS id FROM products p JOIN merchant_products mp ON mp.product_id_id = p.id WHERE mp.merchant_id_id IN (${sql.join(pageMerchantIds.map((n: number) => sql`${n}`), sql`, `)}) LIMIT 2000`)
            .then(async (pIdRows) => {
              const pIds = pIdRows.map((r) => Number(r.id)).filter((n: number) => Number.isFinite(n))
              if (!pIds.length) return { docs: [] }
              return payload.find({ collection: 'products', where: { id: { in: pIds } }, limit: pIds.length, depth: 1, overrideAccess: true, pagination: false } as any)
            })
          : Promise.resolve({ docs: [] }),
      ])
      vendorsRes = vRes
      merchantsRes = mRes
      merchantProductsRes = mpRes2
      productsRes = pRes2
      // Stash matched total + facets for response assembly below.
      ;(vendorsRes as { __matchTotal?: number }).__matchTotal = matchTotal
      ;(vendorsRes as { __facets?: { businessType: Array<{ value: string; count: number }>; verificationStatus: Array<{ value: string; count: number }> } }).__facets = {
        businessType: btFacetRows.map((r) => ({ value: String(r.s ?? 'other'), count: Number(r.c ?? 0) })),
        verificationStatus: vsFacetRows.map((r) => ({ value: String(r.s ?? 'pending'), count: Number(r.c ?? 0) })),
      }
    }

    const vendorsDocs = (vendorsRes.docs as any[]) || []
    const merchantsDocs = (merchantsRes.docs as any[]) || []
    const merchantProductsDocs = (merchantProductsRes.docs as any[]) || []
    const productsDocs = (productsRes.docs as any[]) || []

    const vendorMap = new Map<string, any>()
    vendorsDocs.forEach((v: any) => vendorMap.set(String(v.id), v))
    const merchantMap = new Map<string, any>()
    merchantsDocs.forEach((m: any) => merchantMap.set(String(m.id), m))
    const productMap = new Map<string, any>()
    productsDocs.forEach((p: any) => productMap.set(String(p.id), p))

    // Build merchant -> vendor lookup
    const merchantToVendor = new Map<string, string>()
    const merchantsByVendor = new Map<string, any[]>()
    merchantsDocs.forEach((m: any) => {
      const vRaw = m.vendor
      const vId = vRaw && typeof vRaw === 'object' ? String((vRaw as any).id ?? '') : String(vRaw ?? '')
      if (vId) {
        merchantToVendor.set(String(m.id), vId)
        const vendorMerchants = merchantsByVendor.get(vId) || []
        vendorMerchants.push(m)
        merchantsByVendor.set(vId, vendorMerchants)
      }
    })
    const productsByMerchant = new Map<string, any[]>()
    merchantProductsDocs.forEach((mp: any) => {
      const raw = mp.merchant_id ?? mp.merchant
      const merchantId = raw && typeof raw === 'object' ? String(raw.id ?? '') : String(raw ?? '')
      if (!merchantId) return
      const merchantProducts = productsByMerchant.get(merchantId) || []
      merchantProducts.push(mp)
      productsByMerchant.set(merchantId, merchantProducts)
    })

    // Vendor matching already resolved in SQL (bounded page + matchTotal).
    // Per-mp search/productType/isActive filtering still applies below in grouping.
    const vendorsForPage = vendorsDocs
    // SQL orders by business_name; keep stable sort for unfiltered in-memory path parity.
    if (isUnfiltered) {
      vendorsForPage.sort((a: any, b: any) => String(a.businessName || '').localeCompare(String(b.businessName || '')))
    }

    const matchedTotal = (vendorsRes as { __matchTotal?: number }).__matchTotal
    const totalVendors = isUnfiltered ? (totalVendorsCount || 0) : (matchedTotal ?? vendorsForPage.length)
    const totalPages = Math.max(1, Math.ceil(totalVendors / limit))
    const pagedVendors = vendorsForPage

    // Correct grouping: rebuild resultVendors properly
    const finalVendors = pagedVendors.map((vendor: any) => {
      const vendorId = String(vendor.id)
      const vendorMerchants = (merchantsByVendor.get(vendorId) || []).filter((m: any) => !merchantFilter || Number(m.id) === merchantFilter)
      if (isUnfiltered) {
        const totalProducts = vendorProductCounts.get(vendorId) || 0
        return {
          vendor: {
            id: Number(vendor.id),
            businessName: String(vendor.businessName || ''),
            legalName: String(vendor.legalName || ''),
            businessType: String(vendor.businessType || 'other'),
            verificationStatus: String(vendor.verificationStatus || 'pending'),
            isActive: !!vendor.isActive,
            logo: sanitizeMediaRef(vendor.logo),
          },
          merchants: [],
          totalMerchants: vendorMerchants.length,
          totalProducts,
          totalProductsFiltered: totalProducts,
        }
      }
      const merchantsWithProducts = vendorMerchants.map((merchant: any) => {
        const merchantId = String(merchant.id)
        let mps = productsByMerchant.get(merchantId) || []
        if (search) {
          const lower = search.toLowerCase()
          mps = mps.filter((mp: any) => {
            const productId = ( ()=>{ const raw=(mp as any).product_id ?? (mp as any).product; return raw && typeof raw==="object" ? String((raw as any).id ?? "") : String(raw ?? "") })()
            const product = productId ? productMap.get(productId) : null
            const hay = product ? `${product.name || ''} ${product.slug || ''} ${product.sku || ''}`.toLowerCase() : ''
            return hay.includes(lower)
          })
        }
        if (productTypeFilter) {
          mps = mps.filter((mp: any) => {
            const productId = ( ()=>{ const raw=(mp as any).product_id ?? (mp as any).product; return raw && typeof raw==="object" ? String((raw as any).id ?? "") : String(raw ?? "") })()
            const product = productId ? productMap.get(productId) : null
            return product && String(product.productType || '').toLowerCase() === productTypeFilter
          })
        }
        if (isActiveFilter !== null) {
          mps = mps.filter((mp: any) => {
            const val = typeof mp.is_active === 'boolean' ? mp.is_active : typeof mp.isActive === 'boolean' ? mp.isActive : true
            return val === isActiveFilter
          })
        }
        const products = mps.map((mp: any) => {
          const productId = ( ()=>{ const raw=(mp as any).product_id ?? (mp as any).product; return raw && typeof raw==="object" ? String((raw as any).id ?? "") : String(raw ?? "") })()
          const product = productId ? productMap.get(productId) : null
          const prodMedia = product ? sanitizeMediaRef((product.media as any)?.primaryImage) : null
          return {
            merchantProductId: Number(mp.id),
            merchantId: Number(merchantId),
            product: product ? {
              id: Number(product.id),
              name: String(product.name || ''),
              slug: String(product.slug || ''),
              sku: product.sku ? String(product.sku) : null,
              productType: String(product.productType || 'simple'),
              basePrice: product.basePrice != null ? Number(product.basePrice) : null,
              primaryImage: prodMedia,
            } : null,
            price_override: mp.price_override != null ? Number(mp.price_override) : null,
            stock_quantity: mp.stock_quantity != null ? Number(mp.stock_quantity) : null,
            is_active: typeof mp.is_active === 'boolean' ? mp.is_active : typeof mp.isActive === 'boolean' ? mp.isActive : true,
            is_available: typeof mp.is_available === 'boolean' ? mp.is_available : true,
            createdAt: String(mp.createdAt || ''),
          }
        })
        return {
          merchant: {
            id: Number(merchant.id),
            outletName: String(merchant.outletName || ''),
            outletCode: String(merchant.outletCode || ''),
            isActive: !!merchant.isActive,
            isAcceptingOrders: !!merchant.isAcceptingOrders,
            operationalStatus: String(merchant.operationalStatus || 'open'),
          },
          products,
        }
      })

      // Filter out merchants with no products after search filter (to keep vendor visible only if has matching products)
      const filteredMerchants = merchantsWithProducts.filter(m => m.products.length > 0)
      // If search filters products, and vendor has no matching products, vendor will have empty merchantsWithProducts, we keep vendor but with empty (so it will show 0 products)
      const totalProductsForVendor = merchantsWithProducts.reduce((sum, m) => sum + m.products.length, 0)
      const totalProductsFiltered = filteredMerchants.reduce((sum, m) => sum + m.products.length, 0)

      return {
        vendor: {
          id: Number(vendor.id),
          businessName: String(vendor.businessName || ''),
          legalName: String(vendor.legalName || ''),
          businessType: String(vendor.businessType || 'other'),
          verificationStatus: String(vendor.verificationStatus || 'pending'),
          isActive: !!vendor.isActive,
          logo: sanitizeMediaRef(vendor.logo),
        },
        merchants: search || productTypeFilter || isActiveFilter !== null ? filteredMerchants : merchantsWithProducts,
        totalMerchants: vendorMerchants.length,
        totalProducts: totalProductsForVendor,
        totalProductsFiltered,
      }
    })

    // Stats (exact global rollup; filtered branch falls back to rollup, never bounded docs).
    const rollup = await getMerchantProductStats(payload)
    const totalVendorsAll = totalVendorsCount ?? rollup.totalVendors
    const totalMerchantsAll = totalMerchantsCount ?? rollup.totalMerchants
    const totalMerchantProductsAll = totalMerchantProductsCount ?? rollup.totalMerchantProducts
    const activeMerchantsAll = activeMerchantsCount ?? rollup.activeMerchants

    const responseBody = {
      vendors: finalVendors,
      pagination: {
        page,
        limit,
        totalDocs: totalVendors,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      stats: {
        totalVendors: totalVendorsAll,
        totalMerchants: totalMerchantsAll,
        totalMerchantProducts: totalMerchantProductsAll,
        activeMerchants: activeMerchantsAll,
        filteredVendors: totalVendors,
        totalProducts: totalMerchantProductsAll,
      },
      // Marketplace facet counts over the matched-vendor set (additive;
      // absent on unfiltered loads). See performance.md §17.
      facets: ((vendorsRes as { __facets?: { businessType: Array<{ value: string; count: number }>; verificationStatus: Array<{ value: string; count: number }> } }).__facets ?? { businessType: [], verificationStatus: [] }),
      meta: { generatedAt: new Date().toISOString(), search, vendorFilter: vendorFilter ? String(vendorFilter) : null },
    }

    return responseBody
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

/**
 * @file apps/cms/src/app/api/admin/merchants/route.ts
 * @description BFF aggregation for web-admin /merchants — enterprise outlet management.
 * Backend owns: vendor join, address/category joins, search/filter, pagination, stats, sanitization with overrideAccess.
 * GET  /api/admin/merchants?page=1&limit=10&search=&isActive=true&operationalStatus=open&vendor=<id> etc
 * POST /api/admin/merchants — create outlet (admin-only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard, bustMerchantsCache } from '@/utils/dashboardCache'
import { validateStoreHoursFields } from '@/utils/storeHours'
import { sql, type SQL } from 'drizzle-orm'

function optionalString(v: unknown): string | null { return typeof v === 'string' ? v.trim() || null : null }
function str(v: unknown, fb = ''): string { return typeof v === 'string' ? v : fb }
function num(v: unknown, fb = 0): number { if (typeof v === 'number' && Number.isFinite(v)) return v; if (typeof v === 'string'){ const n=Number(v); return Number.isFinite(n)?n:fb } return fb }
function parseCsv(s: string | null): string[] { if(!s) return []; return s.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean) }
function badRequest(m: string, d?: unknown){ return NextResponse.json({ error: m, details: d }, { status: 400 }) }

function sanitizeMediaRef(v: unknown): { id:number; url:string|null } | null {
  if(!v || typeof v!=='object') return null
  const s=v as Record<string, unknown>
  const id=Number(s.id); if(Number.isNaN(id)) return null
  const url= typeof s.cloudinaryURL==='string'?s.cloudinaryURL : typeof s.url==='string'?s.url:null
  return { id, url }
}
function sanitizeVendorBrief(v: unknown){
  if(!v || typeof v!=='object') return null
  const o=v as Record<string, any>
  const id=Number(o.id); if(Number.isNaN(id)) return null
  return { id, businessName: str(o.businessName,''), verificationStatus: str(o.verificationStatus,'pending'), businessType: str(o.businessType,'other'), isActive: !!o.isActive, logo: sanitizeMediaRef(o.logo) }
}
function sanitizeMerchantDoc(raw: Record<string, any>): Record<string, any> {
  const vendorVal = raw.vendor
  const vendor = sanitizeVendorBrief(vendorVal)
  const mediaThumb = sanitizeMediaRef((raw.media as any)?.thumbnail)
  const mediaFront = sanitizeMediaRef((raw.media as any)?.storeFrontImage)
  const cats = Array.isArray(raw.merchant_categories) ? raw.merchant_categories.map((c:any)=> typeof c==='object'? { id: Number(c.id), name: str(c.name) } : { id: Number(c), name: String(c) }) : []
  // NOTE: no getStoreHoursStatus here — up to 11520 isStoreOpen loops per doc.
  // The list table never renders isOpenNow/storeHoursStatus/nextOpeningAt
  // (see web-admin merchants/page.tsx + useMerchants MerchantDoc type);
  // detail GET [id] computes them for the single doc. See performance.md §10/§15.
  const addr = raw.activeAddress && typeof raw.activeAddress==='object' ? { id: Number((raw.activeAddress as any).id), formatted_address: str((raw.activeAddress as any).formatted_address) } : raw.activeAddress ? { id: Number(raw.activeAddress), formatted_address: '' } : null
  return {
    id: raw.id,
    outletName: str(raw.outletName,''),
    outletCode: str(raw.outletCode,''),
    vendor,
    vendorId: vendor?.id ?? (typeof raw.vendor === 'number' || typeof raw.vendor === 'string' ? Number(raw.vendor) : null),
    contactInfo: raw.contactInfo ?? null,
    isActive: typeof raw.isActive==='boolean'?raw.isActive:true,
    isAcceptingOrders: typeof raw.isAcceptingOrders==='boolean'?raw.isAcceptingOrders:true,
    operationalStatus: str(raw.operationalStatus,'open'),
    operatingHours: raw.operatingHours ?? null,
    deliverySettings: raw.deliverySettings ?? null,
    description: optionalString(raw.description),
    tags: raw.tags ?? null,
    merchant_categories: cats,
    activeAddress: addr,
    merchant_latitude: raw.merchant_latitude ?? null,
    merchant_longitude: raw.merchant_longitude ?? null,
    delivery_radius_meters: raw.delivery_radius_meters ?? raw.deliverySettings?.deliveryFee ?? null,
    timezone: str(raw.timezone,'Asia/Manila'),
    is_currently_delivering: typeof raw.is_currently_delivering==='boolean'?raw.is_currently_delivering:true,
    avg_delivery_time_minutes: raw.avg_delivery_time_minutes ?? null,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    media: { thumbnail: mediaThumb, storeFrontImage: mediaFront },
  }
}

const OPERATIONAL_STATUSES = new Set(['open','closed','busy','temp_closed','maintenance'])

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const cacheQuery = Array.from(searchParams.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&') || 'page=1&limit=10&sort=-createdAt'
    const cacheKey = `admin:merchants:v1:${cacheQuery}`
    const { data, status } = await getOrBuildDashboard(cacheKey, 60, () =>
      withAdminRequestSlot(() => buildMerchantsList(payload, searchParams)),
    )
    return NextResponse.json(data, { headers: { 'X-Merchants-Cache': status } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load merchants'
    console.error('[admin/merchants] GET error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

type Rows = { rows: Array<Record<string, unknown>> }

async function mRows(payload: Payload, query: string | SQL): Promise<Array<Record<string, unknown>>> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as Rows
  return Array.isArray(result?.rows) ? result.rows : []
}

function escLike(s: string): string {
  return s.replace(/[\\%_]/g, (m) => `\\${m}`)
}

const skipCtx = { skipStoreHours: true } as const

type MerchantStats = {
  totalMerchants: number
  totalVendors: number
  activeMerchants: number
  acceptingOrders: number
  activeVendors: number
  operationalBreakdown: Record<string, number>
}

/**
 * Global stats rollup — unfiltered platform totals shared by every list qs.
 * Cached 300s (own key) so per-qs list MISSes don't recount; writes bust via
 * bustMerchantsCache (prefix admin:merchants:). Filtered totals still come
 * from paginated.totalDocs (exact). See performance.md §15.
 */
async function getMerchantStats(payload: Payload): Promise<MerchantStats> {
  const { data } = await getOrBuildDashboard<MerchantStats>(
    'admin:merchants:stats:v1',
    300,
    async () => {
      const [mTotal, mActive, mAccepting, opRows, vTotal, vActive] = await Promise.all([
        payload.count({ collection: 'merchants', overrideAccess: true, context: skipCtx }),
        payload.count({ collection: 'merchants', where: { isActive: { equals: true } }, overrideAccess: true, context: skipCtx }),
        payload.count({ collection: 'merchants', where: { isAcceptingOrders: { equals: true } }, overrideAccess: true, context: skipCtx }),
        mRows(payload, sql`SELECT operational_status::text AS s, COUNT(*)::int AS c FROM merchants GROUP BY 1`),
        payload.count({ collection: 'vendors', overrideAccess: true, context: skipCtx }),
        payload.count({ collection: 'vendors', where: { isActive: { equals: true } }, overrideAccess: true, context: skipCtx }),
      ])
      const operationalBreakdown: Record<string, number> = {}
      for (const s of OPERATIONAL_STATUSES) operationalBreakdown[s] = 0
      for (const r of opRows) operationalBreakdown[String(r.s ?? '')] = Number(r.c ?? 0)
      return {
        totalMerchants: mTotal.totalDocs || 0,
        totalVendors: vTotal.totalDocs || 0,
        activeMerchants: mActive.totalDocs || 0,
        acceptingOrders: mAccepting.totalDocs || 0,
        activeVendors: vActive.totalDocs || 0,
        operationalBreakdown,
      }
    },
  )
  return data
}

async function buildMerchantsList(payload: Payload, searchParams: URLSearchParams) {
  try {

    const page = Math.max(1, parseInt(searchParams.get('page')||'1',10)||1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit')||'10',10)||10))
    const search = searchParams.get('search')?.trim() || ''
    const sort = searchParams.get('sort') || '-createdAt'
    const isActiveParam = searchParams.get('isActive')
    const isActiveFilter = isActiveParam==='true'?true:isActiveParam==='false'?false:null
    const isAcceptingParam = searchParams.get('isAcceptingOrders')
    const isAcceptingFilter = isAcceptingParam==='true'?true:isAcceptingParam==='false'?false:null
    const operationalCsv = parseCsv(searchParams.get('operationalStatus'))
    const vendorParam = searchParams.get('vendor')
    const vendorIdFilter = vendorParam ? Number(vendorParam) : null
    const verificationCsv = parseCsv(searchParams.get('verificationStatus'))
    const businessTypeCsv = parseCsv(searchParams.get('businessType'))

    // Build where for direct merchant fields
    const where: Record<string, any> = {}
    const and: any[] = []
    if(search){
      and.push({ or: [
        { outletName: { contains: search } },
        { outletCode: { contains: search } },
        { 'contactInfo.email': { contains: search } },
        { 'contactInfo.phone': { contains: search } },
        { 'contactInfo.managerName': { contains: search } },
      ]})
    }
    if(isActiveFilter!==null) where.isActive = { equals: isActiveFilter }
    if(isAcceptingFilter!==null) where.isAcceptingOrders = { equals: isAcceptingFilter }
    if (operationalCsv.length) {
      const filtered = operationalCsv.filter((v) => OPERATIONAL_STATUSES.has(v))
      if (filtered.length) where.operationalStatus = { in: filtered }
    }
    if(vendorIdFilter && !Number.isNaN(vendorIdFilter)) where.vendor = { equals: vendorIdFilter }

    const finalWhere = and.length ? { and: [...and, where] } : where

    // Vendor-side filters resolved in SQL (bounded 500) and pushed into
    // the merchant query as vendor IN — replaces vendors 2000 hydration +
    // JS post-filter that broke pagination counts.
    let vendorConstrainedIds: number[] | null = null
    if (verificationCsv.length || businessTypeCsv.length) {
      const vConds: SQL[] = []
      if (verificationCsv.length) {
        vConds.push(sql`LOWER(verification_status::text) IN (${sql.join(
          verificationCsv.map((v) => sql`${v}`),
          sql`, `,
        )})`)
      }
      if (businessTypeCsv.length) {
        vConds.push(sql`LOWER(business_type::text) IN (${sql.join(
          businessTypeCsv.map((v) => sql`${v}`),
          sql`, `,
        )})`)
      }
      let vWhere: SQL = vConds[0]
      for (let i = 1; i < vConds.length; i++) vWhere = sql`${vWhere} AND ${vConds[i]}`
      const vRows = await mRows(payload, sql`SELECT id FROM vendors WHERE ${vWhere} LIMIT 500`)
      vendorConstrainedIds = vRows.map((r) => Number(r.id)).filter((n) => Number.isFinite(n))
    }
    // Vendor businessName search resolved in SQL (bounded 200) and OR-ed
    // with direct outletName/outletCode/contact matches — replaces the
    // merchants 5000 depth:2 + in-memory sort/slice fallback.
    let vendorSearchIds: number[] = []
    if (search) {
      const like = `%${escLike(search)}%`
      const sRows = await mRows(
        payload,
        sql`SELECT id FROM vendors WHERE business_name ILIKE ${like} OR legal_name ILIKE ${like} LIMIT 200`,
      )
      vendorSearchIds = sRows.map((r) => Number(r.id)).filter((n) => Number.isFinite(n))
    }
    // Emptiness is an explicit flag — never a Where property, never read off
    // a possibly-undefined object. `undefined` where = match-all (Payload canonical).
    // Order matters: OR the vendor-name matches with direct matches first,
    // then AND the verification/businessType vendor constraint over the union.
    let isEmpty = false
    let effectiveWhere: Record<string, unknown> | undefined =
      Object.keys(finalWhere).length ? (finalWhere as Record<string, unknown>) : undefined
    if (search && vendorSearchIds.length) {
      const vendorMatch = { vendor: { in: vendorSearchIds } }
      effectiveWhere = effectiveWhere ? { or: [effectiveWhere, vendorMatch] } : vendorMatch
    }
    if (vendorConstrainedIds !== null) {
      if (!vendorConstrainedIds.length) {
        isEmpty = true
      } else {
        const vendorClause = { vendor: { in: vendorConstrainedIds } }
        effectiveWhere = effectiveWhere ? { and: [effectiveWhere, vendorClause] } : vendorClause
      }
    }
    if (isEmpty) {
      const stats = await getMerchantStats(payload)
      return {
        docs: [],
        pagination: { page, limit, totalDocs: 0, totalPages: 0, hasNextPage: false, hasPrevPage: page > 1 },
        stats: {
          totalMerchants: stats.totalMerchants,
          totalVendors: stats.totalVendors,
          activeMerchants: stats.activeMerchants,
          acceptingOrders: stats.acceptingOrders,
          activeVendors: stats.activeVendors,
          operationalBreakdown: stats.operationalBreakdown,
          filteredCount: 0,
        },
        meta: { generatedAt: new Date().toISOString(), sort, search },
      }
    }
    // Paginated list + shared stats rollup in parallel.
    // depth:2 populates vendor.logo/media in the same trip (previously a second
    // vendors IN-pageIds find); select: drops unread heavy blobs (operatingHours,
    // specialHours, delivery_hours, geometries, coordinates, interior/menu images).
    // Stats come from the global TTL-300 rollup (one builder for all qs).
    // See performance.md §10/§15. select: keys are top-level collection fields.
    const [paginated, stats] = await Promise.all([
      payload.find({
        collection: 'merchants',
        where: effectiveWhere as never,
        page,
        limit,
        sort,
        depth: 2,
        overrideAccess: true,
        context: skipCtx,
        select: {
          outletName: true,
          outletCode: true,
          createdAt: true,
          updatedAt: true,
          timezone: true,
          vendor: true,
          contactInfo: true,
          isActive: true,
          isAcceptingOrders: true,
          operationalStatus: true,
          merchant_categories: true,
          activeAddress: true,
          media: true,
          description: true,
          tags: true,
          deliverySettings: true,
          merchant_latitude: true,
          merchant_longitude: true,
          delivery_radius_meters: true,
          is_currently_delivering: true,
          avg_delivery_time_minutes: true,
        },
      }),
      getMerchantStats(payload),
    ])

    const docsRaw = paginated.docs as unknown as Record<string, any>[]

    const docs = docsRaw.map(sanitizeMerchantDoc)

    // Stats from the shared rollup (global totals); filteredTotal stays exact per qs.
    const totalMerchants = stats.totalMerchants || 0
    const activeCount = stats.activeMerchants || 0
    const acceptingCount = stats.acceptingOrders || 0
    const operationalBreakdown = stats.operationalBreakdown
    const totalVendors = stats.totalVendors || 0
    const activeVendors = stats.activeVendors || 0

    const response = {
      docs,
      pagination: {
        page: (paginated as any).page || page,
        limit: (paginated as any).limit || limit,
        totalDocs: (paginated as any).totalDocs ?? docs.length,
        totalPages: (paginated as any).totalPages ?? 1,
        hasNextPage: (paginated as any).hasNextPage ?? false,
        hasPrevPage: (paginated as any).hasPrevPage ?? false,
      },
      stats: {
        totalMerchants,
        totalVendors,
        activeMerchants: activeCount,
        acceptingOrders: acceptingCount,
        activeVendors,
        operationalBreakdown,
        filteredCount: (paginated as any).totalDocs ?? docs.length,
      },
      meta: { generatedAt: new Date().toISOString(), sort, search }
    }
    return response
  } catch (err: unknown) {
    console.error('[admin/merchants] list build error:', err)
    throw err
  }
}

export async function POST(request: NextRequest){
  try{
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if(!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })
    let body: Record<string, any>
    try{ body = await request.json() } catch { return badRequest('Invalid JSON body') }
    try { Object.assign(body, validateStoreHoursFields(body)) } catch (error) { return badRequest(error instanceof Error ? error.message : 'Invalid store hours') }

    const vendorRaw = body.vendor
    const vendorId = typeof vendorRaw === 'number' ? vendorRaw : typeof vendorRaw === 'string' ? Number(vendorRaw) : Number(body.vendorId)
    if(!vendorId || Number.isNaN(vendorId)) return badRequest('vendor is required (vendor user organization id)')
    // Verify vendor exists
    try{
      await payload.findByID({ collection: 'vendors', id: vendorId, depth: 0, overrideAccess: true }) as any
    }catch{ return badRequest('vendor not found') }

    const outletName = typeof body.outletName === 'string' ? body.outletName.trim() : ''
    if(!outletName || outletName.length<2) return badRequest('outletName is required (min 2 chars)')
    let outletCode = typeof body.outletCode === 'string' ? body.outletCode.trim() : ''
    if(!outletCode){
      const sanitized = outletName.replace(/[^a-zA-Z0-9]/g,'').toUpperCase().slice(0,12) || 'OUTLET'
      outletCode = `${sanitized}-${Date.now().toString().slice(-6)}`
    }
    const timezone = typeof body.timezone === 'string' && body.timezone.trim() ? body.timezone.trim() : 'Asia/Manila'
    try{ Intl.DateTimeFormat(undefined, { timeZone: timezone }) }catch{ return badRequest('timezone must be a valid IANA identifier (e.g. Asia/Manila)') }

    const isActive = typeof body.isActive === 'boolean' ? body.isActive : true
    const isAcceptingOrders = typeof body.isAcceptingOrders === 'boolean' ? body.isAcceptingOrders : true
    const operationalStatusRaw = typeof body.operationalStatus === 'string' ? body.operationalStatus.trim().toLowerCase() : 'open'
    const operationalStatus = OPERATIONAL_STATUSES.has(operationalStatusRaw) ? operationalStatusRaw : 'open'

    const contactInfo = body.contactInfo ?? null
    if(contactInfo && typeof contactInfo !== 'object') return badRequest('contactInfo must be an object')
    if(contactInfo && contactInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(contactInfo.email).trim())) return badRequest('contactInfo.email must be valid')

    const description = typeof body.description === 'string' ? body.description.trim() || null : null
    const tags = body.tags ?? null
    const merchant_categories = Array.isArray(body.merchant_categories) ? body.merchant_categories.map((v:any)=> Number(v)).filter((n:number)=>!Number.isNaN(n)) : Array.isArray(body.merchantCategories) ? body.merchantCategories.map((v:any)=> Number(v)).filter((n:number)=>!Number.isNaN(n)) : null
    const activeAddress = body.activeAddress != null && body.activeAddress !== '' ? Number(body.activeAddress) : null
    if(activeAddress !== null && Number.isNaN(activeAddress)) return badRequest('activeAddress must be numeric id or null')

    const operatingHours = body.operatingHours ?? null
    const specialHours = body.specialHours ?? null
    const deliverySettings = body.deliverySettings ?? null
    const delivery_hours = body.delivery_hours ?? body.deliveryHours ?? null
    const merchant_latitude = body.merchant_latitude != null ? Number(body.merchant_latitude) : null
    const merchant_longitude = body.merchant_longitude != null ? Number(body.merchant_longitude) : null
    if(merchant_latitude !== null && (Number.isNaN(merchant_latitude) || merchant_latitude < -90 || merchant_latitude > 90)) return badRequest('merchant_latitude must be between -90 and 90')
    if(merchant_longitude !== null && (Number.isNaN(merchant_longitude) || merchant_longitude < -180 || merchant_longitude > 180)) return badRequest('merchant_longitude must be between -180 and 180')

    const delivery_radius_meters = body.delivery_radius_meters != null ? Number(body.delivery_radius_meters) : body.deliveryRadiusMeters != null ? Number(body.deliveryRadiusMeters) : 5000
    const max_delivery_radius_meters = body.max_delivery_radius_meters != null ? Number(body.max_delivery_radius_meters) : 10000
    const min_order_amount = body.min_order_amount != null ? Number(body.min_order_amount) : null
    const delivery_fee_base = body.delivery_fee_base != null ? Number(body.delivery_fee_base) : null
    const delivery_fee_per_km = body.delivery_fee_per_km != null ? Number(body.delivery_fee_per_km) : null
    const free_delivery_threshold = body.free_delivery_threshold != null ? Number(body.free_delivery_threshold) : null
    const is_currently_delivering = typeof body.is_currently_delivering === 'boolean' ? body.is_currently_delivering : typeof body.isCurrentlyDelivering === 'boolean' ? body.isCurrentlyDelivering : true
    const avg_delivery_time_minutes = body.avg_delivery_time_minutes != null ? Number(body.avg_delivery_time_minutes) : null
    const delivery_success_rate = body.delivery_success_rate != null ? Number(body.delivery_success_rate) : null
    if(delivery_success_rate !== null && (Number.isNaN(delivery_success_rate) || delivery_success_rate < 0 || delivery_success_rate > 1)) return badRequest('delivery_success_rate must be between 0 and 1')

    const media: Record<string, any> = {}
    if(body.media?.thumbnail != null && body.media.thumbnail !== '') media.thumbnail = Number(body.media.thumbnail)
    else if(body.thumbnail != null && body.thumbnail !== '') media.thumbnail = Number(body.thumbnail)
    if(body.media?.storeFrontImage != null && body.media.storeFrontImage !== '') media.storeFrontImage = Number(body.media.storeFrontImage)
    else if(body.storeFrontImage != null && body.storeFrontImage !== '') media.storeFrontImage = Number(body.storeFrontImage)

    const data: Record<string, any> = {
      vendor: vendorId,
      outletName,
      outletCode,
      contactInfo: contactInfo ?? undefined,
      isActive,
      isAcceptingOrders,
      operationalStatus,
      operatingHours: operatingHours ?? undefined,
      specialHours: specialHours ?? undefined,
      deliverySettings: deliverySettings ?? undefined,
      description: description ?? undefined,
      tags: tags ?? undefined,
      merchant_categories: merchant_categories ?? undefined,
      activeAddress: activeAddress ?? undefined,
      merchant_latitude: merchant_latitude ?? undefined,
      merchant_longitude: merchant_longitude ?? undefined,
      delivery_radius_meters: delivery_radius_meters ?? undefined,
      max_delivery_radius_meters: max_delivery_radius_meters ?? undefined,
      min_order_amount: min_order_amount ?? undefined,
      delivery_fee_base: delivery_fee_base ?? undefined,
      delivery_fee_per_km: delivery_fee_per_km ?? undefined,
      free_delivery_threshold: free_delivery_threshold ?? undefined,
      is_currently_delivering,
      avg_delivery_time_minutes: avg_delivery_time_minutes ?? undefined,
      delivery_success_rate: delivery_success_rate ?? undefined,
      timezone,
      delivery_hours: delivery_hours ?? undefined,
    }
    if(Object.keys(media).length) data.media = media

    let created: Record<string, any>
    try{
      created = await payload.create({ collection: 'merchants', data: data as any, depth: 2, overrideAccess: true }) as unknown as Record<string, any>
    }catch(e:any){
      const msg=e?.message||'Failed to create merchant'
      const lower=String(msg).toLowerCase()
      if(lower.includes('unique')||lower.includes('duplicate')) return NextResponse.json({ error: 'Duplicate outletCode: already exists', details: msg }, { status: 409 })
      return NextResponse.json({ error: msg, details: e?.data||e?.errors }, { status: 400 })
    }
    const sanitized = sanitizeMerchantDoc(created)
    // Bust list cache (all admins / query variants) so the new outlet shows immediately
    await bustMerchantsCache()
    return NextResponse.json({ success: true, message: 'Merchant created successfully', doc: sanitized }, { status: 201 })
  }catch(err:any){
    console.error('[admin/merchants] POST error:', err)
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 })
  }
}

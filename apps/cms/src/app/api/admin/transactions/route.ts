/**
 * @file apps/cms/src/app/api/admin/transactions/route.ts
 * @description BFF aggregation endpoint for web-admin transactions page (enterprise-grade).
 * Follows docs/BFF-pattern.md: backend owns context resolution, joins, filtering, pagination,
 * and sanitization with overrideAccess:true. Frontend is thin consumer.
 *
 * GET /api/admin/transactions?page=1&limit=20&search=&status=paid,pending&payment_method=card,gcash&currency=PHP&sort=-paid_at
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
      vendor = {
        id: vid,
        businessName: str(v.businessName, ''),
        logo: sanitizeMediaRef(v.logo),
      }
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

function sanitizeCustomerBrief(value: unknown): Record<string, any> | null {
  if (value == null) return null
  if (typeof value !== 'object') {
    const id = Number(value)
    if (Number.isNaN(id)) return null
    return { id, email: '', user: null }
  }
  const c = value as Record<string, any>
  const id = Number(c.id)
  if (Number.isNaN(id)) return null
  const rawUser = c.user
  let user: Record<string, any> | null = null
  if (rawUser && typeof rawUser === 'object') {
    const u = rawUser as Record<string, any>
    const uid = Number(u.id)
    if (!Number.isNaN(uid)) {
      user = {
        id: uid,
        email: str(u.email, str(c.email, '')),
        firstName: str(u.firstName, ''),
        lastName: str(u.lastName, ''),
        phone: optionalString(u.phone),
      }
    }
  } else if (rawUser != null) {
    const uid = Number(rawUser)
    if (!Number.isNaN(uid)) user = { id: uid, email: str(c.email, ''), firstName: '', lastName: '', phone: null }
  }
  return {
    id,
    email: str(c.email, user ? str((user as any).email, '') : ''),
    user,
  }
}

function sanitizeOrderBrief(value: unknown): Record<string, any> | null {
  if (value == null) return null
  if (typeof value !== 'object') {
    const id = Number(value)
    if (Number.isNaN(id)) return null
    return { id, status: '', total: 0, subtotal: 0, placed_at: null, fulfillment_type: '', merchant: null, customer: null }
  }
  const o = value as Record<string, any>
  const id = Number(o.id)
  if (Number.isNaN(id)) return null
  return {
    id,
    status: str(o.status, 'pending'),
    total: num(o.total, 0),
    subtotal: num(o.subtotal, 0),
    delivery_fee: num(o.delivery_fee, 0),
    platform_fee: num(o.platform_fee, 0),
    fulfillment_type: str(o.fulfillment_type, ''),
    placed_at: o.placed_at ? String(o.placed_at) : null,
    lalamove_order_id: optionalString(o.lalamove_order_id),
    delivery_status: str(o.delivery_status, 'none'),
    merchant: sanitizeMerchantBrief(o.merchant),
    customer: sanitizeCustomerBrief(o.customer),
    createdAt: String(o.createdAt ?? ''),
    updatedAt: String(o.updatedAt ?? ''),
  }
}

function sanitizeTransactionDoc(raw: Record<string, any>): Record<string, any> {
  const status = str(raw.status, 'pending').toLowerCase()
  return {
    id: raw.id,
    payment_intent_id: optionalString(raw.payment_intent_id),
    payment_method: optionalString(raw.payment_method),
    amount: num(raw.amount, 0),
    currency: str(raw.currency, 'PHP') || 'PHP',
    status,
    paid_at: raw.paid_at ? String(raw.paid_at) : null,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    order: sanitizeOrderBrief(raw.order),
    isPaid: status === 'paid',
  }
}

function parseCsv(value: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}
// ID extraction that treats null/undefined/'' as missing — Number(null) and
// Number('') are both 0, which would fabricate an id-0 lookup and change the
// sanitize fallback (null → brief) for guest/null relations.
function numId(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = typeof value === 'object' ? Number((value as Record<string, any>).id) : Number(value)
  return Number.isFinite(n) ? n : null
}
function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 })
}

const STATUS_SET = new Set(['pending', 'paid', 'failed', 'refunded'])
const ALLOWED_SORT = new Set([
  '-paid_at',
  'paid_at',
  '-createdAt',
  'createdAt',
  '-updatedAt',
  'updatedAt',
  '-amount',
  'amount',
  'status',
  '-status',
  'payment_method',
  '-payment_method',
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
    const cacheKey = `admin:transactions:v1:${cacheQuery}`
    const { data, status } = await getOrBuildDashboard(cacheKey, 60, () =>
      withAdminRequestSlot(() => buildTransactionsList(payload, searchParams)),
    )
    return NextResponse.json(data, { headers: { 'X-Transactions-Cache': status } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load transactions'
    console.error('[admin/transactions] GET error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

type Rows = { rows: Array<Record<string, unknown>> }

async function tRows(payload: Payload, query: string | SQL): Promise<Array<Record<string, unknown>>> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as Rows
  return Array.isArray(result?.rows) ? result.rows : []
}

type TransactionStats = {
  totalAll: number
  statusBreakdown: Record<string, number>
  paymentMethodBreakdown: Record<string, number>
  totalRevenue: number
  totalRefunded: number
  totalFailed: number
  totalPendingAmount: number
  netRevenue: number
  avgTransactionAmount: number
  paidCount: number
  pendingCount: number
  failedCount: number
  refundedCount: number
}

/**
 * Global stats rollup — unfiltered platform totals shared by every list qs.
 * Cached 300s (own key); writes bust via bustTransactionsCache (prefix
 * admin:transactions:). Filtered totals still come from
 * paginated.totalDocs (exact). See performance.md §4b item 5.
 */
async function getTransactionStats(payload: Payload): Promise<TransactionStats> {
  const { data } = await getOrBuildDashboard<TransactionStats>(
    'admin:transactions:stats:v1',
    300,
    async () => {
      const [statRows, statusRows, pmRows] = await Promise.all([
        tRows(payload, sql`SELECT COUNT(*)::int AS total,
          COALESCE(SUM(amount::numeric) FILTER (WHERE status='paid'),0) AS revenue,
          COALESCE(SUM(amount::numeric) FILTER (WHERE status='refunded'),0) AS refunded,
          COALESCE(SUM(amount::numeric) FILTER (WHERE status='failed'),0) AS failed,
          COALESCE(SUM(amount::numeric) FILTER (WHERE status='pending'),0) AS pending_amt,
          COUNT(*) FILTER (WHERE status='paid')::int AS paid_n,
          COUNT(*) FILTER (WHERE status='pending')::int AS pending_n,
          COUNT(*) FILTER (WHERE status='failed')::int AS failed_n,
          COUNT(*) FILTER (WHERE status='refunded')::int AS refunded_n FROM transactions`),
        tRows(payload, sql`SELECT status::text AS s, COUNT(*)::int AS c FROM transactions GROUP BY status`),
        tRows(payload, sql`SELECT COALESCE(NULLIF(TRIM(LOWER(payment_method::text)),''),'unknown') AS s, COUNT(*)::int AS c FROM transactions GROUP BY 1`),
      ])
      const stats = statRows[0] ?? {}
      const statusBreakdown: Record<string, number> = { pending: 0, paid: 0, failed: 0, refunded: 0 }
      for (const r of statusRows) {
        const st = String(r.s || 'pending').toLowerCase()
        statusBreakdown[st] = (statusBreakdown[st] || 0) + Number(r.c ?? 0)
      }
      const paymentMethodBreakdown: Record<string, number> = {}
      for (const r of pmRows) {
        const pm = String(r.s || 'unknown').toLowerCase() || 'unknown'
        paymentMethodBreakdown[pm] = (paymentMethodBreakdown[pm] || 0) + Number(r.c ?? 0)
      }
      const totalRevenue = Number(stats.revenue ?? 0)
      const totalRefunded = Number(stats.refunded ?? 0)
      const paidCount = Number(stats.paid_n ?? 0)
      return {
        totalAll: Number(stats.total ?? 0),
        statusBreakdown,
        paymentMethodBreakdown,
        totalRevenue,
        totalRefunded,
        totalFailed: Number(stats.failed ?? 0),
        totalPendingAmount: Number(stats.pending_amt ?? 0),
        netRevenue: totalRevenue - totalRefunded,
        avgTransactionAmount: paidCount > 0 ? totalRevenue / paidCount : 0,
        paidCount,
        pendingCount: Number(stats.pending_n ?? 0),
        failedCount: Number(stats.failed_n ?? 0),
        refundedCount: Number(stats.refunded_n ?? 0),
      }
    },
  )
  return data
}

async function buildTransactionsList(payload: Payload, searchParams: URLSearchParams) {
  try {

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20))
    const search = searchParams.get('search')?.trim() || ''
    let sort = searchParams.get('sort') || '-paid_at'
    if (!ALLOWED_SORT.has(sort)) sort = '-paid_at'

    const statusCsv = parseCsv(searchParams.get('status'))
    const paymentMethodCsv = parseCsv(searchParams.get('payment_method'))
    const currencyParam = searchParams.get('currency')?.trim() || ''

    const where: Record<string, any> = {}
    const and: any[] = []

    if (search) {
      const isNumeric = /^\d+$/.test(search)
      if (isNumeric) {
        const numericId = Number(search)
        const numericAmount = Number(search)
        const amountClause = Number.isFinite(numericAmount) ? { amount: { equals: numericAmount } } : null
        const orClauses: any[] = [
          { id: { equals: numericId } },
          { payment_intent_id: { contains: search } },
          { order: { equals: numericId } },
        ]
        if (amountClause) orClauses.push(amountClause)
        and.push({ or: orClauses })
      } else {
        and.push({
          or: [{ payment_intent_id: { contains: search } }],
        })
      }
    }

    if (statusCsv.length) {
      const filtered = statusCsv.filter((v) => STATUS_SET.has(v))
      if (filtered.length) where.status = { in: filtered }
    }
    if (paymentMethodCsv.length) {
      // open filter: allow any lowercased value, already normalized via parseCsv
      where.payment_method = { in: paymentMethodCsv }
    }
    if (currencyParam) {
      where.currency = { equals: currencyParam.toUpperCase() }
    }

    const finalWhere = and.length ? { and: [...and, where] } : where

    // Phase 1: page transactions (bounded ≤100). depth:1 populates the order
    // doc with merchant/customer as IDs — every top-level transaction field
    // is consumed by sanitize, so no select: trim applies here. skipStoreHours
    // guards the merchant afterRead loop on any populated merchant.
    const [paginated, stats] = await Promise.all([
      payload.find({
        collection: 'transactions',
        where: Object.keys(finalWhere).length ? finalWhere : undefined,
        page,
        limit,
        sort,
        depth: 1,
        overrideAccess: true,
        context: { skipStoreHours: true },
      }),
      getTransactionStats(payload),
    ])

    const txnDocs = (paginated.docs as unknown as Record<string, any>[]) || []
    const orderIds = Array.from(new Set(
      txnDocs
        .map((t) => numId(t.order))
        .filter((n): n is number => n !== null),
    ))

    // Phase 2: page orders (depth:0, projected scalars — drops priority_fee,
    // discount_total, coupon_code, notes, delivery_service_type and friends).
    const orderDocs = orderIds.length
      ? ((await payload.find({ collection: 'orders', where: { id: { in: orderIds } }, limit: orderIds.length, depth: 0, overrideAccess: true, pagination: false, context: { skipStoreHours: true }, select: { status: true, total: true, subtotal: true, delivery_fee: true, platform_fee: true, fulfillment_type: true, placed_at: true, lalamove_order_id: true, delivery_status: true, merchant: true, customer: true, createdAt: true, updatedAt: true } } as any)).docs as Record<string, any>[]) || []
      : []
    const orderMap = new Map<string, Record<string, any>>()
    for (const o of orderDocs) orderMap.set(String(o.id), o)

    const merchantIds = Array.from(new Set(
      orderDocs
        .map((o) => numId(o.merchant))
        .filter((n): n is number => n !== null),
    ))
    const customerIds = Array.from(new Set(
      orderDocs
        .map((o) => numId(o.customer))
        .filter((n): n is number => n !== null),
    ))

    // Phase 3: page merchants + customers, both projected. Merchants skip the
    // expensive store-hours afterRead — the table renders only outletName,
    // outletCode, isActive + vendor brief.
    const [merchantRes, customerRes] = await Promise.all([
      merchantIds.length
        ? payload.find({ collection: 'merchants', where: { id: { in: merchantIds } }, limit: merchantIds.length, depth: 0, overrideAccess: true, pagination: false, context: { skipStoreHours: true }, select: { outletName: true, outletCode: true, isActive: true, vendor: true } } as any)
        : Promise.resolve({ docs: [] }),
      customerIds.length
        ? payload.find({ collection: 'customers', where: { id: { in: customerIds } }, limit: customerIds.length, depth: 0, overrideAccess: true, pagination: false, select: { email: true, user: true } } as any)
        : Promise.resolve({ docs: [] }),
    ])
    const merchantMap = new Map<string, Record<string, any>>()
    for (const m of ((merchantRes as any).docs as Record<string, any>[]) || []) merchantMap.set(String(m.id), m)
    const customerMap = new Map<string, Record<string, any>>()
    for (const c of ((customerRes as any).docs as Record<string, any>[]) || []) customerMap.set(String(c.id), c)

    const vendorIds = Array.from(new Set(
      Array.from(merchantMap.values())
        .map((m) => numId(m.vendor))
        .filter((n): n is number => n !== null),
    ))
    const userIds = Array.from(new Set(
      Array.from(customerMap.values())
        .map((c) => numId(c.user))
        .filter((n): n is number => n !== null),
    ))

    // Phase 4: vendor briefs (depth:1 populates logo) + user names. This also
    // fixes silently-dead UI: at depth:2 vendor/user stayed IDs, so vendor
    // names and customer names never rendered on the list — now populated.
    const [vendorRes, userRes] = await Promise.all([
      vendorIds.length
        ? payload.find({ collection: 'vendors', where: { id: { in: vendorIds } }, limit: vendorIds.length, depth: 1, overrideAccess: true, pagination: false, select: { businessName: true, logo: true } } as any)
        : Promise.resolve({ docs: [] }),
      userIds.length
        ? payload.find({ collection: 'users', where: { id: { in: userIds } }, limit: userIds.length, depth: 0, overrideAccess: true, pagination: false, select: { email: true, firstName: true, lastName: true, phone: true } } as any)
        : Promise.resolve({ docs: [] }),
    ])
    const vendorMap = new Map<string, Record<string, any>>()
    for (const v of ((vendorRes as any).docs as Record<string, any>[]) || []) vendorMap.set(String(v.id), v)
    const userMap = new Map<string, Record<string, any>>()
    for (const u of ((userRes as any).docs as Record<string, any>[]) || []) userMap.set(String(u.id), u)

    const docs = txnDocs.map((t) => {
      const rawOrder = t.order
      const orderId = rawOrder && typeof rawOrder === 'object' ? String((rawOrder as any).id ?? '') : String(rawOrder ?? '')
      const orderDoc = orderId ? orderMap.get(orderId) : null
      let enrichedOrder: Record<string, any> | null = null
      if (orderDoc) {
        const merchantId = numId(orderDoc.merchant)
        const customerId = numId(orderDoc.customer)
        const merchantDoc = merchantId !== null ? merchantMap.get(String(merchantId)) : null
        const customerDoc = customerId !== null ? customerMap.get(String(customerId)) : null
        const vendorId = merchantDoc ? numId(merchantDoc.vendor) : null
        const userId = customerDoc ? numId(customerDoc.user) : null
        enrichedOrder = {
          ...orderDoc,
          merchant: merchantDoc
            ? { ...merchantDoc, vendor: vendorId !== null ? (vendorMap.get(String(vendorId)) ?? vendorId) : null }
            : merchantId,
          customer: customerDoc
            ? { ...customerDoc, user: userId !== null ? (userMap.get(String(userId)) ?? userId) : null }
            : customerId,
        }
      }
      return sanitizeTransactionDoc({ ...t, order: enrichedOrder ?? rawOrder ?? null })
    })

    const filteredTotal = typeof paginated.totalDocs === 'number' ? paginated.totalDocs : docs.length

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
        ...stats,
        filteredTotal,
      },
      meta: { generatedAt: new Date().toISOString(), sort, search },
    }
    return responseBody
  } catch (err: unknown) {
    console.error('[admin/transactions] list build error:', err)
    throw err
  }
}

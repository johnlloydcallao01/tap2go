import type { Payload } from 'payload'
import { sql, type SQL } from 'drizzle-orm'
import { getNum, getStr, parsePayoutsParams } from './payoutsShared'

type Rows = { rows: Array<Record<string, unknown>> }

async function pRows(payload: Payload, query: string | SQL): Promise<Array<Record<string, unknown>>> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as Rows
  return Array.isArray(result?.rows) ? result.rows : []
}

function escLike(s: string): string {
  return s.replace(/[\\%_]/g, (m) => `\\${m}`)
}

/** Global normalized key: no admin.id, range aliases + sorted filters + lowercase search. */
export function buildPayoutsNormalizedKey(searchParams: URLSearchParams): string {
  const raw = (searchParams.get('range') || '30d').toLowerCase()
  const range =
    raw === '1y' || raw === '365d' || raw === '12m'
      ? '1y'
      : raw === 'all' || raw === '0'
        ? 'all'
        : /^\d+$/.test(raw)
          ? `${raw}d`
          : raw.endsWith('d') && !isNaN(parseInt(raw, 10))
            ? raw
            : '30d'
  const normCsv = (k: string) =>
    (searchParams.get(k) || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .sort()
      .join(',')
  const isActive = searchParams.get('isActive') ?? ''
  const parts: Array<[string, string]> = [
    ['range', range],
    ['search', (searchParams.get('search') || '').trim().toLowerCase()],
    ['verificationStatus', normCsv('verificationStatus')],
    ['businessType', normCsv('businessType')],
    ['isActive', isActive === 'true' ? 'true' : isActive === 'false' ? 'false' : ''],
  ]
  return parts.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
}

export async function buildPayoutsOverview(payload: Payload, searchParams: URLSearchParams) {
  const p = parsePayoutsParams(searchParams)
  const nowISO = p.now.toISOString()
  const startISO = p.periodStart ? p.periodStart.toISOString() : null

  // Vendor filter WHERE (on v.*), parameterized via sql template.
  const vConds: SQL[] = []
  if (p.verificationFilter.length) {
    vConds.push(sql`LOWER(v.verification_status::text) IN (${sql.join(
      p.verificationFilter.map((v) => sql`${v}`),
      sql`, `,
    )})`)
  }
  if (p.businessTypeFilter.length) {
    vConds.push(sql`LOWER(v.business_type::text) IN (${sql.join(
      p.businessTypeFilter.map((v) => sql`${v}`),
      sql`, `,
    )})`)
  }
  if (p.isActiveFilter !== null) {
    vConds.push(p.isActiveFilter ? sql`v.is_active = true` : sql`v.is_active = false`)
  }
  if (p.search) {
    const like = `%${escLike(p.search)}%`
    vConds.push(sql`(v.business_name ILIKE ${like} OR v.legal_name ILIKE ${like} OR v.business_registration_number ILIKE ${like} OR v.primary_contact_email ILIKE ${like})`)
  }
  let vWhere: SQL = sql`1=1`
  for (const c of vConds) vWhere = sql`${vWhere} AND ${c}`

  const paidWindow: SQL = startISO
    ? sql`t.status='paid' AND t.paid_at >= ${startISO} AND t.paid_at <= ${nowISO}`
    : sql`t.status='paid'`
  const refWindow: SQL = startISO
    ? sql`t.status='refunded' AND t.created_at >= ${startISO} AND t.created_at <= ${nowISO}`
    : sql`t.status='refunded'`

  // Single aggregation: all filtered vendors (zero-payout included) + live merchant counts.
  const aggRows = await pRows(
    payload,
    sql`SELECT v.id::text AS vid, v.business_name AS bname, v.legal_name AS lname,
      COALESCE(v.business_type::text,'other') AS btype, COALESCE(v.verification_status::text,'pending') AS vstatus,
      COALESCE(v.is_active,false) AS active, v.logo_id::text AS logo_id, med.url AS logo_url,
      COALESCE(v.total_merchants::numeric,0) AS stored_merchants, COALESCE(v.average_rating::numeric,0) AS avg_rating,
      COUNT(DISTINCT m.id)::int AS merchants_live,
      COUNT(t.id)::int AS orders, COALESCE(SUM(t.amount::numeric),0) AS gross,
      COALESCE(SUM(o.platform_fee::numeric),0) AS pfees, COALESCE(SUM(o.delivery_fee::numeric),0) AS dfees,
      COALESCE(SUM(GREATEST(0, t.amount::numeric - COALESCE(o.platform_fee::numeric,0) - COALESCE(o.delivery_fee::numeric,0))),0) AS net,
      COALESCE(SUM(CASE WHEN r.id IS NOT NULL THEN r.amount::numeric ELSE 0 END),0) AS refunded
      FROM vendors v
      LEFT JOIN media med ON med.id = v.logo_id
      LEFT JOIN merchants m ON m.vendor_id = v.id
      LEFT JOIN orders o ON o.merchant_id = m.id
      LEFT JOIN transactions t ON t.order_id = o.id AND ${paidWindow}
      LEFT JOIN transactions r ON r.order_id = o.id AND ${refWindow}
      WHERE ${vWhere}
      GROUP BY v.id, v.business_name, v.legal_name, v.business_type, v.verification_status, v.is_active, v.logo_id, med.url, v.total_merchants, v.average_rating
      ORDER BY COALESCE(SUM(GREATEST(0, t.amount::numeric - COALESCE(o.platform_fee::numeric,0) - COALESCE(o.delivery_fee::numeric,0))),0) DESC, COALESCE(SUM(t.amount::numeric),0) DESC`,
  )

  // NOTE: refunded double-counts when an order has multiple paid tx (r joins per paid row).
  // Correct with a separate per-vendor refunded query (refunded tx join vendors directly).
  const refRows = await pRows(
    payload,
    sql`SELECT v.id::text AS vid, COALESCE(SUM(t.amount::numeric),0) AS refunded
      FROM transactions t JOIN orders o ON o.id = t.order_id
      JOIN merchants m ON m.id = o.merchant_id JOIN vendors v ON v.id = m.vendor_id
      WHERE ${refWindow} GROUP BY v.id`,
  )
  const refMap = new Map(refRows.map((r) => [getStr(r.vid), getNum(r.refunded)]))

  const dailyRows = await pRows(
    payload,
    sql`SELECT date_trunc('day', t.paid_at)::date::text AS day,
      COALESCE(SUM(t.amount::numeric),0) AS gross,
      COALESCE(SUM(GREATEST(0, t.amount::numeric - COALESCE(o.platform_fee::numeric,0) - COALESCE(o.delivery_fee::numeric,0))),0) AS net,
      COUNT(*)::int AS orders
      FROM transactions t JOIN orders o ON o.id = t.order_id
      JOIN merchants m ON m.id = o.merchant_id JOIN vendors v ON v.id = m.vendor_id
      WHERE ${paidWindow} AND ${vWhere} GROUP BY 1 ORDER BY 1`,
  )

  const verRows = await pRows(
    payload,
    sql`SELECT COALESCE(LOWER(verification_status::text),'pending') AS s, COUNT(*)::int AS c FROM vendors WHERE ${vWhere} GROUP BY 1`,
  )

  // Global merchant live counts already in agg (merchants_live). Vendor logo from media join.
  const rows = aggRows.map((r) => {
    const vid = getStr(r.vid)
    const logoId = r.logo_id != null && String(r.logo_id) !== '' ? Number(r.logo_id) : NaN
    return {
      vendorId: vid,
      businessName: getStr(r.bname),
      legalName: getStr(r.lname),
      businessType: getStr(r.btype, 'other'),
      verificationStatus: getStr(r.vstatus, 'pending'),
      isActive: !!r.active,
      logo: !Number.isNaN(logoId) ? { id: logoId, url: typeof r.logo_url === 'string' ? (r.logo_url as string) : null } : null,
      totalMerchants: getNum(r.merchants_live),
      averageRating: getNum(r.avg_rating),
      orders: getNum(r.orders),
      gross: getNum(r.gross),
      platformFees: getNum(r.pfees),
      deliveryFees: getNum(r.dfees),
      net: getNum(r.net),
      refunded: refMap.get(vid) ?? getNum(r.refunded),
      avgOrder: getNum(r.orders) ? getNum(r.gross) / getNum(r.orders) : 0,
      avgNet: getNum(r.orders) ? getNum(r.net) / getNum(r.orders) : 0,
    }
  })
  rows.sort((a, b) => b.net - a.net || b.gross - a.gross)

  const summary = {
    totalGross: rows.reduce((s, r) => s + r.gross, 0),
    totalNet: rows.reduce((s, r) => s + r.net, 0),
    totalPlatformFees: rows.reduce((s, r) => s + r.platformFees, 0),
    totalDeliveryFees: rows.reduce((s, r) => s + r.deliveryFees, 0),
    totalRefunded: rows.reduce((s, r) => s + r.refunded, 0),
    totalOrders: rows.reduce((s, r) => s + r.orders, 0),
    totalVendors: rows.length,
    activeVendors: rows.filter((r) => r.isActive).length,
    avgPayout: rows.length ? rows.reduce((s, r) => s + r.net, 0) / rows.length : 0,
    avgOrder: rows.reduce((s, r) => s + r.orders, 0) ? rows.reduce((s, r) => s + r.gross, 0) / rows.reduce((s, r) => s + r.orders, 0) : 0,
  }
  const verificationBreakdown: Record<string, number> = { pending: 0, verified: 0, rejected: 0, suspended: 0 }
  for (const r of verRows) verificationBreakdown[getStr(r.s, 'pending')] = getNum(r.c)

  return {
    meta: {
      range: p.label,
      days: p.days,
      generatedAt: nowISO,
      periodStart: startISO,
      periodEnd: nowISO,
    },
    summary,
    vendorPayouts: { rows, count: rows.length },
    daily: dailyRows.map((r) => ({ date: String(r.day).slice(0, 10), gross: getNum(r.gross), net: getNum(r.net), orders: getNum(r.orders) })),
    verificationBreakdown,
  }
}

export type PayoutsOverview = Awaited<ReturnType<typeof buildPayoutsOverview>>

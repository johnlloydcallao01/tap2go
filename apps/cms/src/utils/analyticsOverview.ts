import type { Payload } from 'payload'
import { sql, type SQL } from 'drizzle-orm'
import {
  getNum,
  getStr,
  parseAnalyticsParams,
  parseCsvParam,
  pctChange,
  type AnalyticsParams,
} from './analyticsShared'

type Rows = { rows: Array<Record<string, unknown>> }

async function aRows(payload: Payload, query: string | SQL): Promise<Array<Record<string, unknown>>> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as Rows
  return Array.isArray(result?.rows) ? result.rows : []
}

const ACTX = { skipStoreHours: true } as const

function escLike(s: string): string {
  return s.replace(/[\\%_]/g, (m) => `\\${m}`)
}

/** Global normalized key: no admin.id, range aliases + sorted CSV + lowercase q. */
export function buildAnalyticsNormalizedKey(searchParams: URLSearchParams): string {
  const get = (k: string) => searchParams.get(k) ?? ''
  const rawRange = (get('range') || '30d').toLowerCase()
  const range =
    rawRange === '1y' || rawRange === '365d' || rawRange === '12m'
      ? '1y'
      : rawRange === 'all' || rawRange === '0'
        ? 'all'
        : /^\d+$/.test(rawRange)
          ? `${rawRange}d`
          : rawRange.endsWith('d') && !isNaN(parseInt(rawRange, 10))
            ? rawRange
            : '30d'
  const normCsv = (k: string) =>
    get(k)
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .sort()
      .join(',')
  const parts: Array<[string, string]> = [
    ['range', range],
    ['q', get('q').trim().toLowerCase()],
    ['status', normCsv('status')],
    ['fulfillment', normCsv('fulfillment')],
    ['businessType', normCsv('businessType')],
    ['paymentMethod', normCsv('paymentMethod')],
    ['vendorStatus', normCsv('vendorStatus')],
    ['deliveryStatus', normCsv('deliveryStatus')],
  ]
  return parts.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
}

export function getAnalyticsParams(searchParams: URLSearchParams): AnalyticsParams {
  return parseAnalyticsParams(searchParams)
}

function inList(lowerCol: SQL, values: string[]): SQL | null {
  if (!values.length) return null
  return sql`${lowerCol} IN (${sql.join(
    values.map((v) => sql`${v}`),
    sql`, `,
  )})`
}

function orderDateFilter(alias: string, startISO: string | null, endISO: string, endExclusive: boolean): SQL | null {
  if (!startISO) return null
  if (endExclusive) return sql`${sql.raw(alias)}.created_at >= ${startISO} AND ${sql.raw(alias)}.created_at < ${endISO}`
  return sql`${sql.raw(alias)}.created_at >= ${startISO} AND ${sql.raw(alias)}.created_at <= ${endISO}`
}

/** Shared filtered-orders WHERE (date + status/fulfillment/delivery + vendor joins + q). */
function filteredOrdersWhere(
  p: AnalyticsParams,
  period: 'current' | 'prev' | 'all',
  nowISO: string,
): { joins: SQL; where: SQL | null; qJoinNeeded: boolean } {
  const joins = sql`LEFT JOIN merchants m ON m.id = o.merchant_id LEFT JOIN vendors v ON v.id = m.vendor_id`
  const conds: SQL[] = []

  if (period === 'current' && p.periodStart) {
    conds.push(sql`o.created_at >= ${p.periodStart.toISOString()} AND o.created_at <= ${nowISO}`)
  } else if (period === 'prev' && p.prevPeriodStart && p.prevPeriodEnd) {
    conds.push(sql`o.created_at >= ${p.prevPeriodStart.toISOString()} AND o.created_at < ${p.prevPeriodEnd.toISOString()}`)
  }

  const s = inList(sql`LOWER(o.status::text)`, p.statusFilter)
  if (s) conds.push(s)
  const f = inList(sql`LOWER(o.fulfillment_type::text)`, p.fulfillmentFilter)
  if (f) conds.push(f)
  const d = inList(sql`LOWER(o.delivery_status::text)`, p.deliveryStatusFilter)
  if (d) conds.push(d)
  if (p.businessTypeFilter.length) {
    conds.push(sql`COALESCE(LOWER(v.business_type::text),'unknown') IN (${sql.join(
      p.businessTypeFilter.map((v) => sql`${v}`),
      sql`, `,
    )})`)
  }
  if (p.vendorStatusFilter.length) {
    conds.push(sql`COALESCE(LOWER(v.verification_status::text),'unknown') IN (${sql.join(
      p.vendorStatusFilter.map((v) => sql`${v}`),
      sql`, `,
    )})`)
  }
  if (p.q) {
    const like = `%${escLike(p.q)}%`
    conds.push(sql`(
      o.id::text ILIKE ${like} OR
      m.outlet_name ILIKE ${like} OR
      v.business_name ILIKE ${like} OR
      EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_name_snapshot ILIKE ${like})
    )`)
  }

  if (!conds.length) return { joins, where: null, qJoinNeeded: Boolean(p.q) }
  let where: SQL = conds[0]
  for (let i = 1; i < conds.length; i++) where = sql`${where} AND ${conds[i]}`
  return { joins, where, qJoinNeeded: Boolean(p.q) }
}

function txDateFilter(alias: string, col: 'paid_at' | 'created_at', startISO: string | null, endISO: string, endExclusive: boolean): SQL | null {
  if (!startISO) return null
  const c = sql.raw(`${alias}.${col}`)
  if (endExclusive) return sql`${c} >= ${startISO} AND ${c} < ${endISO}`
  return sql`${c} >= ${startISO} AND ${c} <= ${endISO}`
}

export async function buildAnalyticsOverview(payload: Payload, searchParams: URLSearchParams) {
  const p = parseAnalyticsParams(searchParams)
  const nowISO = p.now.toISOString()
  const label = p.label
  const days = p.days

  const cur = filteredOrdersWhere(p, 'current', nowISO)
  const prev = filteredOrdersWhere(p, 'prev', nowISO)
  const orderJoins: SQL = sql`LEFT JOIN merchants m ON m.id = o.merchant_id LEFT JOIN vendors v ON v.id = m.vendor_id`
  const curWhere = cur.where ? sql`WHERE ${cur.where}` : sql``
  const prevWhere = prev.where ? sql`WHERE ${prev.where}` : sql``

  const payIn = p.paymentMethodFilter.length
    ? sql`AND LOWER(t.payment_method::text) IN (${sql.join(
        p.paymentMethodFilter.map((v) => sql`${v}`),
        sql`, `,
      )})`
    : sql``

  // ---- Filtered revenue/orders (verified hub): transactions JOIN filtered orders ----
  const revCurRows = await aRows(
    payload,
    sql`SELECT COALESCE(SUM(t.amount::numeric),0) AS revenue, COUNT(DISTINCT o.id)::int AS orders, COUNT(t.id)::int AS txns
      FROM transactions t JOIN orders o ON o.id = t.order_id ${orderJoins}
      WHERE t.status='paid' ${p.periodStart ? sql`AND t.paid_at >= ${p.periodStart.toISOString()} AND t.paid_at <= ${nowISO}` : sql``}
      ${payIn}
      ${cur.where ? sql`AND (${cur.where})` : sql``}`,
  )
  const revPrevRows = await aRows(
    payload,
    sql`SELECT COALESCE(SUM(t.amount::numeric),0) AS revenue, COUNT(DISTINCT o.id)::int AS orders
      FROM transactions t JOIN orders o ON o.id = t.order_id ${orderJoins}
      WHERE t.status='paid' ${p.prevPeriodStart && p.prevPeriodEnd ? sql`AND t.paid_at >= ${p.prevPeriodStart.toISOString()} AND t.paid_at < ${p.prevPeriodEnd.toISOString()}` : sql`AND 1=0`}
      ${payIn}
      ${prev.where ? sql`AND (${prev.where})` : sql``}`,
  )
  const ordCurRows = await aRows(
    payload,
    sql`SELECT COUNT(*)::int AS orders FROM orders o ${orderJoins} ${curWhere}`,
  )
  const ordPrevRows = await aRows(
    payload,
    sql`SELECT COUNT(*)::int AS orders FROM orders o ${orderJoins} ${prevWhere}`,
  )

  const totalRevenueCurrent = getNum(revCurRows[0]?.revenue)
  const totalRevenuePrev = getNum(revPrevRows[0]?.revenue)
  const totalOrdersCurrent = getNum(ordCurRows[0]?.orders)
  const totalOrdersPrev = getNum(ordPrevRows[0]?.orders)
  const aovCurrent = totalOrdersCurrent > 0 ? totalRevenueCurrent / totalOrdersCurrent : 0
  const aovPrev = totalOrdersPrev > 0 ? totalRevenuePrev / totalOrdersPrev : 0

  // ---- Global counts (unfiltered by qs, date only where applicable) ----
  const [vendorsCount, customersCount, activeMerchantsCount, ordersAllTime, wishlistCount, paidAllTime] = await Promise.all([
    payload.count({ collection: 'vendors', overrideAccess: true, context: ACTX }),
    payload.count({ collection: 'customers', overrideAccess: true, context: ACTX }),
    payload.count({ collection: 'merchants', where: { isActive: { equals: true } }, overrideAccess: true, context: ACTX }),
    payload.count({ collection: 'orders', overrideAccess: true, context: ACTX }),
    payload.count({ collection: 'wishlists', overrideAccess: true, context: ACTX }),
    aRows(payload, sql`SELECT COALESCE(SUM(amount::numeric),0) AS revenue FROM transactions WHERE status='paid'`),
  ])
  const newCustCur = p.periodStart
    ? await aRows(payload, sql`SELECT COUNT(*)::int AS c FROM customers WHERE created_at >= ${p.periodStart.toISOString()} AND created_at <= ${nowISO}`)
    : [{ c: customersCount.totalDocs }]
  const newCustPrev =
    p.prevPeriodStart && p.prevPeriodEnd
      ? await aRows(payload, sql`SELECT COUNT(*)::int AS c FROM customers WHERE created_at >= ${p.prevPeriodStart.toISOString()} AND created_at < ${p.prevPeriodEnd.toISOString()}`)
      : [{ c: 0 }]
  const refundedCur = await aRows(
    payload,
    sql`SELECT COUNT(*)::int AS c FROM transactions WHERE status='refunded' ${p.periodStart ? sql`AND created_at >= ${p.periodStart.toISOString()} AND created_at <= ${nowISO}` : sql``}`,
  )
  const failedCur = await aRows(
    payload,
    sql`SELECT COUNT(*)::int AS c FROM transactions WHERE status='failed' ${p.periodStart ? sql`AND created_at >= ${p.periodStart.toISOString()} AND created_at <= ${nowISO}` : sql``}`,
  )
  const ratingRows = await aRows(
    payload,
    sql`SELECT COALESCE(AVG(merchant_rating::numeric),0) AS avg, COUNT(*)::int AS c FROM reviews ${p.periodStart ? sql`WHERE created_at >= ${p.periodStart.toISOString()} AND created_at <= ${nowISO}` : sql``}`,
  )

  const kpis = {
    totalRevenue: totalRevenueCurrent,
    totalOrders: totalOrdersCurrent,
    aov: aovCurrent,
    activeMerchants: activeMerchantsCount.totalDocs,
    totalVendors: vendorsCount.totalDocs,
    totalCustomers: customersCount.totalDocs,
    newCustomers: getNum((newCustCur[0] as Record<string, unknown>)?.c),
    paidTransactions: getNum(revCurRows[0]?.txns),
    refundedTransactions: getNum(refundedCur[0]?.c),
    failedTransactions: getNum(failedCur[0]?.c),
    wishlistCount: wishlistCount.totalDocs,
    avgRating: getNum(ratingRows[0]?.avg),
    revenueChange: pctChange(totalRevenueCurrent, totalRevenuePrev),
    ordersChange: pctChange(totalOrdersCurrent, totalOrdersPrev),
    aovChange: pctChange(aovCurrent, aovPrev),
    customersChange: pctChange(getNum((newCustCur[0] as Record<string, unknown>)?.c), getNum((newCustPrev[0] as Record<string, unknown>)?.c)),
    totalRevenueAllTime: getNum(paidAllTime[0]?.revenue),
    totalOrdersAllTime: ordersAllTime.totalDocs,
  }

  // ---- Funnel (global + date, like summary) ----
  const cartByStatus = await aRows(payload, sql`SELECT status::text AS status, COUNT(*)::int AS count FROM cart_items GROUP BY status`)
  const cartCurByStatus = await aRows(
    payload,
    sql`SELECT status::text AS status, COUNT(*)::int AS count FROM cart_items ${p.periodStart ? sql`WHERE created_at >= ${p.periodStart.toISOString()} AND created_at <= ${nowISO}` : sql``} GROUP BY status`,
  )
  const cartTotals = await aRows(
    payload,
    sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='abandoned')::int AS abandoned ${p.periodStart ? sql`, COUNT(*) FILTER (WHERE created_at >= ${p.periodStart.toISOString()} AND created_at <= ${nowISO})::int AS cur` : sql`, 0 AS cur`} FROM cart_items`,
  )
  const funnel = {
    cartByStatus: cartByStatus.map((r) => ({ status: getStr(r.status, 'unknown'), count: getNum(r.count) })),
    cartCurrentByStatus: cartCurByStatus.map((r) => ({ status: getStr(r.status, 'unknown'), count: getNum(r.count) })),
    abandonmentRate: getNum(cartTotals[0]?.total) ? (getNum(cartTotals[0]?.abandoned) / getNum(cartTotals[0]?.total)) * 100 : 0,
    totalCarts: getNum(cartTotals[0]?.total),
    totalCartsCurrent: getNum(cartTotals[0]?.cur),
  }

  // ---- Charts: unfiltered revenue trend (preserve monolith semantics) ----
  let revenueTrend: Array<{ date: string; revenue: number; orders: number; aov: number }>
  if (days === 0 || days >= 90) {
    const tRows = await aRows(
      payload,
      sql`SELECT to_char(date_trunc('month', paid_at),'YYYY-MM') AS m, COALESCE(SUM(amount::numeric),0) AS revenue, COUNT(*)::int AS txns FROM transactions WHERE status='paid' GROUP BY 1 ORDER BY 1 DESC LIMIT 12`,
    )
    const oRows = await aRows(
      payload,
      sql`SELECT to_char(date_trunc('month', created_at),'YYYY-MM') AS m, COUNT(*)::int AS orders FROM orders GROUP BY 1 ORDER BY 1 DESC LIMIT 12`,
    )
    const oMap = new Map(oRows.map((r) => [String(r.m), getNum(r.orders)]))
    const { formatMonthShort } = await import('./analyticsShared')
    revenueTrend = tRows
      .slice()
      .reverse()
      .map((r) => {
        const m = String(r.m)
        const revenue = getNum(r.revenue)
        const orders = oMap.get(m) ?? 0
        return { date: formatMonthShort(`${m}-01`), revenue, orders, aov: orders ? revenue / orders : 0 }
      })
  } else {
    const tRows = await aRows(
      payload,
      sql`SELECT date_trunc('day', paid_at)::date::text AS day, COALESCE(SUM(amount::numeric),0) AS revenue FROM transactions WHERE status='paid' ${p.periodStart ? sql`AND paid_at >= ${p.periodStart.toISOString()} AND paid_at <= ${nowISO}` : sql``} GROUP BY 1`,
    )
    const oRows = await aRows(
      payload,
      sql`SELECT date_trunc('day', created_at)::date::text AS day, COUNT(*)::int AS orders FROM orders ${p.periodStart ? sql`WHERE created_at >= ${p.periodStart.toISOString()} AND created_at <= ${nowISO}` : sql``} GROUP BY 1`,
    )
    const tMap = new Map(tRows.map((r) => [String(r.day).slice(0, 10), getNum(r.revenue)]))
    const oMap = new Map(oRows.map((r) => [String(r.day).slice(0, 10), getNum(r.orders)]))
    const { daysAgoDateStr, formatDateShort } = await import('./analyticsShared')
    revenueTrend = []
    for (let i = days - 1; i >= 0; i--) {
      const dateStr = daysAgoDateStr(i)
      const revenue = tMap.get(dateStr) ?? 0
      const orders = oMap.get(dateStr) ?? 0
      revenueTrend.push({ date: formatDateShort(dateStr), revenue, orders, aov: orders ? revenue / orders : 0 })
    }
  }

  // ---- Filtered breakdowns ----
  const statusRows = await aRows(payload, sql`SELECT o.status::text AS status, COUNT(*)::int AS count FROM orders o ${orderJoins} ${curWhere} GROUP BY o.status`)
  const fulfillRows = await aRows(payload, sql`SELECT o.fulfillment_type::text AS type, COUNT(*)::int AS count FROM orders o ${orderJoins} ${curWhere} GROUP BY o.fulfillment_type`)
  const delRows = await aRows(payload, sql`SELECT o.delivery_status::text AS status, COUNT(*)::int AS count FROM orders o ${orderJoins} ${curWhere} GROUP BY o.delivery_status`)
  const bookRows = await aRows(
    payload,
    sql`SELECT b.status::text AS status, COUNT(*)::int AS count FROM delivery_bookings b JOIN orders o ON o.id = b.order_id ${p.periodStart ? sql`WHERE o.created_at >= ${p.periodStart.toISOString()} AND o.created_at <= ${nowISO}` : sql``} GROUP BY b.status`,
  )
  const payRows = await aRows(
    payload,
    sql`SELECT t.payment_method::text AS method, COUNT(*)::int AS count FROM transactions t ${p.periodStart ? sql`WHERE t.created_at >= ${p.periodStart.toISOString()} AND t.created_at <= ${nowISO}` : sql``} GROUP BY t.payment_method`,
  )
  const txStatusRows = await aRows(
    payload,
    sql`SELECT t.status::text AS status, COUNT(*)::int AS count FROM transactions t ${p.periodStart ? sql`WHERE t.created_at >= ${p.periodStart.toISOString()} AND t.created_at <= ${nowISO}` : sql``} GROUP BY t.status`,
  )
  const bizRows = await aRows(
    payload,
    sql`SELECT COALESCE(v.business_type::text,'unknown') AS business_type, COALESCE(SUM(t.amount::numeric),0) AS revenue, COUNT(DISTINCT o.id)::int AS orders
      FROM transactions t JOIN orders o ON o.id = t.order_id LEFT JOIN merchants m ON m.id = o.merchant_id LEFT JOIN vendors v ON v.id = m.vendor_id
      WHERE t.status='paid' ${p.periodStart ? sql`AND t.paid_at >= ${p.periodStart.toISOString()} AND t.paid_at <= ${nowISO}` : sql``} ${payIn} ${cur.where ? sql`AND (${cur.where})` : sql``}
      GROUP BY v.business_type`,
  )
  const catRows = await aRows(
    payload,
    sql`SELECT COALESCE(pc.name,'uncategorized') AS category, COALESCE(SUM(oi.total_price::numeric),0) AS revenue, COALESCE(SUM(oi.quantity::numeric),0) AS quantity
      FROM transactions t JOIN orders o ON o.id = t.order_id LEFT JOIN merchants m ON m.id = o.merchant_id LEFT JOIN vendors v ON v.id = m.vendor_id
      JOIN order_items oi ON oi.order_id = o.id LEFT JOIN products p ON p.id = oi.product_id
      LEFT JOIN products_rels pr ON pr.parent_id = p.id AND pr.path = 'categories' LEFT JOIN prod_categories pc ON pc.id = pr."prod_categories_id"
      WHERE t.status='paid' ${p.periodStart ? sql`AND t.paid_at >= ${p.periodStart.toISOString()} AND t.paid_at <= ${nowISO}` : sql``} ${payIn} ${cur.where ? sql`AND (${cur.where})` : sql``}
      GROUP BY pc.name ORDER BY SUM(oi.total_price::numeric) DESC LIMIT 8`,
  )
  const hourRows = await aRows(
    payload,
    sql`SELECT EXTRACT(HOUR FROM o.created_at)::int AS hour, COUNT(*)::int AS orders, COALESCE(SUM(vrev.revenue),0) AS revenue FROM orders o ${orderJoins}
      LEFT JOIN (SELECT o2.id AS oid, COALESCE(SUM(t2.amount::numeric),0) AS revenue FROM transactions t2 JOIN orders o2 ON o2.id = t2.order_id WHERE t2.status='paid' ${p.periodStart ? sql`AND t2.paid_at >= ${p.periodStart.toISOString()} AND t2.paid_at <= ${nowISO}` : sql``} ${payIn} GROUP BY o2.id) vrev ON vrev.oid = o.id
      ${curWhere} GROUP BY 1 ORDER BY 1`,
  )
  const wdRows = await aRows(
    payload,
    sql`SELECT EXTRACT(DOW FROM o.created_at)::int AS dow, COUNT(*)::int AS orders, COALESCE(SUM(vrev.revenue),0) AS revenue FROM orders o ${orderJoins}
      LEFT JOIN (SELECT o2.id AS oid, COALESCE(SUM(t2.amount::numeric),0) AS revenue FROM transactions t2 JOIN orders o2 ON o2.id = t2.order_id WHERE t2.status='paid' ${p.periodStart ? sql`AND t2.paid_at >= ${p.periodStart.toISOString()} AND t2.paid_at <= ${nowISO}` : sql``} ${payIn} GROUP BY o2.id) vrev ON vrev.oid = o.id
      ${curWhere} GROUP BY 1 ORDER BY 1`,
  )
  const driverRows = await aRows(payload, sql`SELECT status::text AS status, COUNT(*)::int AS count FROM drivers GROUP BY status`)
  const verRows = await aRows(payload, sql`SELECT verification_status::text AS status, COUNT(*)::int AS count FROM vendors GROUP BY verification_status`)

  const hourlyDistribution = Array.from({ length: 24 }, (_, h) => ({ hour: h, orders: 0, revenue: 0 }))
  for (const r of hourRows) {
    const h = getNum(r.hour)
    if (h >= 0 && h < 24) hourlyDistribution[h] = { hour: h, orders: getNum(r.orders), revenue: getNum(r.revenue) }
  }
  const wdLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekdayDistribution = Array.from({ length: 7 }, (_, i) => ({ day: wdLabels[i], orders: 0, revenue: 0 }))
  for (const r of wdRows) {
    const d = getNum(r.dow)
    if (d >= 0 && d < 7) weekdayDistribution[d] = { day: wdLabels[d], orders: getNum(r.orders), revenue: getNum(r.revenue) }
  }

  // ---- Tops (verified filtered) ----
  const prodRows = await aRows(
    payload,
    sql`SELECT COALESCE(NULLIF(oi.product_name_snapshot,''), p.name, 'Unknown') AS name, COALESCE(SUM(oi.total_price::numeric),0) AS revenue, COALESCE(SUM(oi.quantity::numeric),0) AS quantity, COUNT(*)::int AS orders
      FROM transactions t JOIN orders o ON o.id = t.order_id ${orderJoins}
      JOIN order_items oi ON oi.order_id = o.id LEFT JOIN products p ON p.id = oi.product_id
      WHERE t.status='paid' ${p.periodStart ? sql`AND t.paid_at >= ${p.periodStart.toISOString()} AND t.paid_at <= ${nowISO}` : sql``} ${payIn} ${cur.where ? sql`AND (${cur.where})` : sql``}
      GROUP BY 1 ORDER BY SUM(oi.total_price::numeric) DESC LIMIT 10`,
  )
  const merchRows = await aRows(
    payload,
    sql`SELECT o.merchant_id::text AS id, m.outlet_name AS name, COUNT(DISTINCT o.id)::int AS orders, COALESCE(SUM(t.amount::numeric),0) AS revenue
      FROM transactions t JOIN orders o ON o.id = t.order_id LEFT JOIN merchants m ON m.id = o.merchant_id LEFT JOIN vendors v ON v.id = m.vendor_id
      WHERE t.status='paid' ${p.periodStart ? sql`AND t.paid_at >= ${p.periodStart.toISOString()} AND t.paid_at <= ${nowISO}` : sql``} ${payIn} ${cur.where ? sql`AND (${cur.where})` : sql``}
      GROUP BY o.merchant_id, m.outlet_name ORDER BY SUM(t.amount::numeric) DESC LIMIT 10`,
  )
  const vendRows = await aRows(
    payload,
    sql`SELECT v.id::text AS id, v.business_name AS business_name, COUNT(DISTINCT o.id)::int AS orders, COALESCE(SUM(t.amount::numeric),0) AS revenue, v.total_merchants AS total_merchants, v.average_rating AS average_rating, v.verification_status::text AS verification_status
      FROM transactions t JOIN orders o ON o.id = t.order_id LEFT JOIN merchants m ON m.id = o.merchant_id LEFT JOIN vendors v ON v.id = m.vendor_id
      WHERE t.status='paid' ${p.periodStart ? sql`AND t.paid_at >= ${p.periodStart.toISOString()} AND t.paid_at <= ${nowISO}` : sql``} ${payIn} ${cur.where ? sql`AND (${cur.where})` : sql``}
      GROUP BY v.id, v.business_name, v.total_merchants, v.average_rating, v.verification_status HAVING COUNT(DISTINCT o.id) > 0 ORDER BY SUM(t.amount::numeric) DESC LIMIT 10`,
  )
  const rateRows = await aRows(
    payload,
    sql`SELECT ROUND(merchant_rating::numeric)::int AS rating, COUNT(*)::int AS count FROM reviews ${p.periodStart ? sql`WHERE created_at >= ${p.periodStart.toISOString()} AND created_at <= ${nowISO}` : sql``} GROUP BY 1`,
  )
  const ratingMap = new Map(rateRows.map((r) => [getNum(r.rating), getNum(r.count)]))

  const summary = {
    meta: { range: label, days, generatedAt: nowISO, totalOrdersAllTime: ordersAllTime.totalDocs },
    kpis,
    funnel,
  }
  const charts = {
    revenueTrend,
    orderStatusBreakdown: statusRows.map((r) => ({ status: getStr(r.status, 'unknown'), count: getNum(r.count) })),
    fulfillmentMix: fulfillRows.map((r) => ({ type: getStr(r.type, 'unknown'), count: getNum(r.count) })),
    deliveryStatusBreakdown: delRows.map((r) => ({ status: getStr(r.status, 'unknown'), count: getNum(r.count) })),
    bookingStatusBreakdown: bookRows.map((r) => ({ status: getStr(r.status, 'unknown'), count: getNum(r.count) })),
    paymentMethodBreakdown: payRows.map((r) => ({ method: getStr(r.method, 'unknown'), count: getNum(r.count) })),
    transactionStatusBreakdown: txStatusRows.map((r) => ({ status: getStr(r.status, 'unknown'), count: getNum(r.count) })),
    revenueByBusinessType: bizRows.map((r) => ({ businessType: getStr(r.business_type, 'other'), revenue: getNum(r.revenue), orders: getNum(r.orders) })),
    revenueByCategory: catRows.map((r) => ({ category: getStr(r.category, 'uncategorized'), revenue: getNum(r.revenue), quantity: getNum(r.quantity) })),
    hourlyDistribution,
    weekdayDistribution,
    vendorVerificationBreakdown: verRows.map((r) => ({ status: getStr(r.status, 'unknown'), count: getNum(r.count) })),
    driverStatusBreakdown: driverRows.map((r) => ({ status: getStr(r.status, 'unknown'), count: getNum(r.count) })),
  }
  const tops = {
    topProducts: prodRows.map((r, i) => ({ id: `${getStr(r.name, 'Unknown')}-${i}`, name: getStr(r.name, 'Unknown'), revenue: getNum(r.revenue), quantity: getNum(r.quantity), orders: getNum(r.orders) })),
    topMerchants: merchRows.map((r) => ({ id: getStr(r.id), name: getStr(r.name, `Merchant #${getStr(r.id)}`), orders: getNum(r.orders), revenue: getNum(r.revenue), rating: 0 })),
    topVendors: vendRows.map((r) => ({
      id: getStr(r.id),
      businessName: getStr(r.business_name),
      orders: getNum(r.orders),
      revenue: getNum(r.revenue),
      totalMerchants: getNum(r.total_merchants),
      averageRating: getNum(r.average_rating),
      verificationStatus: getStr(r.verification_status, 'unknown'),
    })),
    ratingDistribution: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: ratingMap.get(rating) ?? 0 })),
  }

  return { summary, charts, tops, params: { range: label, days } }
}

export type AnalyticsOverview = Awaited<ReturnType<typeof buildAnalyticsOverview>>

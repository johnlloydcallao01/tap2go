import type { Payload } from 'payload'
import { sql, type SQL } from 'drizzle-orm'
import { getNum, getStr, parseReportsParams } from './reportsShared'

type Rows = { rows: Array<Record<string, unknown>> }

async function rRows(payload: Payload, query: string | SQL): Promise<Array<Record<string, unknown>>> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as Rows
  return Array.isArray(result?.rows) ? result.rows : []
}

const RCTX = { skipStoreHours: true } as const

/** Global normalized key: no admin.id, range only (reports ignore other params). */
export function buildReportsNormalizedKey(searchParams: URLSearchParams): string {
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
  return `range=${range}`
}

export async function buildReportsOverview(payload: Payload, searchParams: URLSearchParams) {
  const params = parseReportsParams(searchParams)
  const { days, label, now, periodStart } = params
  const nowISO = now.toISOString()
  const startISO = periodStart ? periodStart.toISOString() : null
  const inWindow = (col: string) =>
    startISO ? sql`${sql.raw(col)} >= ${startISO} AND ${sql.raw(col)} <= ${nowISO}` : sql`1=1`

  // ---- Global counts (all time, fixes limit:2000 truncation) ----
  const [vendorsCount, merchantsCount, ordersCount, txCount] = await Promise.all([
    payload.count({ collection: 'vendors', overrideAccess: true, context: RCTX }),
    payload.count({ collection: 'merchants', overrideAccess: true, context: RCTX }),
    payload.count({ collection: 'orders', overrideAccess: true, context: RCTX }),
    payload.count({ collection: 'transactions', overrideAccess: true, context: RCTX }),
  ])

  // ---- Summary (date windows, SQL) ----
  const revRows = await rRows(
    payload,
    sql`SELECT COALESCE(SUM(amount::numeric) FILTER (WHERE status='paid' AND ${inWindow('paid_at')}),0) AS revenue,
      COALESCE(SUM(amount::numeric) FILTER (WHERE status='refunded' AND ${inWindow('created_at')}),0) AS refunded,
      COUNT(*) FILTER (WHERE status='paid' AND ${inWindow('paid_at')})::int AS paid_n,
      COUNT(*) FILTER (WHERE status='refunded' AND ${inWindow('created_at')})::int AS refunded_n,
      COUNT(*) FILTER (WHERE status='failed' AND ${inWindow('created_at')})::int AS failed_n,
      COALESCE(SUM(amount::numeric) FILTER (WHERE status='paid'),0) AS revenue_all
      FROM transactions`,
  )
  const ordRows = await rRows(
    payload,
    sql`SELECT COUNT(*) FILTER (WHERE ${inWindow('created_at')})::int AS orders, MIN(created_at)::text AS oldest FROM orders`,
  )
  const discRows = await rRows(
    payload,
    sql`SELECT COALESCE(SUM(amount_off::numeric) FILTER (WHERE ${inWindow('created_at')}),0) AS off,
      COALESCE(SUM(vendor_share::numeric) FILTER (WHERE ${inWindow('created_at')}),0) AS vshare FROM order_discounts`,
  )
  const activeRows = await rRows(
    payload,
    sql`SELECT (SELECT COUNT(*)::int FROM vendors WHERE is_active = true) AS av,
      (SELECT COUNT(*)::int FROM merchants WHERE is_active = true) AS am`,
  )

  const totalRevenue = getNum(revRows[0]?.revenue)
  const totalRefunded = getNum(revRows[0]?.refunded)
  const totalOrders = getNum(ordRows[0]?.orders)
  const periodStartIso = startISO ?? (ordRows[0]?.oldest ? String(ordRows[0]?.oldest) : nowISO)
  const summary = {
    totalRevenue,
    totalRefunded,
    netRevenue: totalRevenue - totalRefunded,
    totalDiscounts: getNum(discRows[0]?.off),
    vendorFundedDiscounts: getNum(discRows[0]?.vshare),
    totalOrders,
    avgOrder: totalOrders ? totalRevenue / totalOrders : 0,
    totalVendors: vendorsCount.totalDocs,
    activeVendors: getNum(activeRows[0]?.av),
    totalMerchants: merchantsCount.totalDocs,
    activeMerchants: getNum(activeRows[0]?.am),
    failedCount: getNum(revRows[0]?.failed_n),
    refundedCount: getNum(revRows[0]?.refunded_n),
    paidCount: getNum(revRows[0]?.paid_n),
  }
  const meta = {
    range: label,
    periodLabel: days === 0 ? 'All time' : `${days}d`,
    days,
    generatedAt: nowISO,
    periodStart: periodStartIso,
    periodEnd: nowISO,
    totalDocs: {
      vendors: vendorsCount.totalDocs,
      merchants: merchantsCount.totalDocs,
      orders: ordersCount.totalDocs,
      transactions: txCount.totalDocs,
    },
  }

  // ---- Financial: 200-row reconciliation + vendor payouts + refunds ----
  const finRows = await rRows(
    payload,
    sql`SELECT t.id::text AS tid, o.id::text AS oid, COALESCE(t.paid_at::text, t.created_at::text) AS date,
      COALESCE(m.outlet_name, 'N/A') AS merchant, COALESCE(v.business_name, 'N/A') AS vendor,
      t.amount AS amount, COALESCE(o.platform_fee::numeric,0) AS pfee, COALESCE(o.delivery_fee::numeric,0) AS dfee,
      COALESCE(d.off,0) AS discount, COALESCE(d.code,'') AS code, t.status::text AS status,
      COALESCE(t.payment_method,'unknown') AS pm, COALESCE(o.total::numeric, t.amount::numeric) AS gross
      FROM transactions t JOIN orders o ON o.id = t.order_id
      LEFT JOIN merchants m ON m.id = o.merchant_id LEFT JOIN vendors v ON v.id = m.vendor_id
      LEFT JOIN (SELECT order_id, SUM(amount_off::numeric) AS off, MAX(code) AS code FROM order_discounts GROUP BY order_id) d ON d.order_id = o.id
      WHERE t.status='paid' AND ${inWindow('t.paid_at')} ORDER BY t.paid_at DESC LIMIT 200`,
  )
  const financialRows = finRows.map((r) => ({
    transactionId: getStr(r.tid),
    orderId: getStr(r.oid, '—'),
    date: getStr(r.date),
    merchant: getStr(r.merchant, 'N/A'),
    vendor: getStr(r.vendor, 'N/A'),
    amount: getNum(r.amount),
    platformFee: getNum(r.pfee),
    deliveryFee: getNum(r.dfee),
    discount: getNum(r.discount),
    couponCode: getStr(r.code),
    status: getStr(r.status),
    paymentMethod: getStr(r.pm, 'unknown'),
    gross: getNum(r.gross),
  }))
  const payAgg = await rRows(
    payload,
    sql`SELECT v.id::text AS vid, COALESCE(v.business_name,'') AS name,
      COUNT(*)::int AS orders, COALESCE(SUM(t.amount::numeric),0) AS gross,
      COALESCE(SUM(o.platform_fee::numeric),0) AS pfees, COALESCE(SUM(o.delivery_fee::numeric),0) AS dfees,
      COALESCE(SUM(d.vshare),0) AS dshare,
      COALESCE(SUM(GREATEST(0, t.amount::numeric - COALESCE(o.platform_fee::numeric,0) - COALESCE(o.delivery_fee::numeric,0) - COALESCE(d.vshare,0))),0) AS net
      FROM transactions t JOIN orders o ON o.id = t.order_id
      LEFT JOIN merchants m ON m.id = o.merchant_id LEFT JOIN vendors v ON v.id = m.vendor_id
      LEFT JOIN (SELECT order_id, SUM(vendor_share::numeric) AS vshare FROM order_discounts GROUP BY order_id) d ON d.order_id = o.id
      WHERE t.status='paid' AND ${inWindow('t.paid_at')} AND v.id IS NOT NULL
      GROUP BY v.id, v.business_name ORDER BY SUM(t.amount::numeric) DESC LIMIT 20`,
  )
  const vendorPayouts = payAgg.map((r) => ({
    vendorId: getStr(r.vid),
    businessName: getStr(r.name, `Vendor #${getStr(r.vid)}`),
    orders: getNum(r.orders),
    gross: getNum(r.gross),
    platformFees: getNum(r.pfees),
    deliveryFees: getNum(r.dfees),
    discountShare: getNum(r.dshare),
    net: getNum(r.net),
  }))
  const refRows = await rRows(
    payload,
    sql`(SELECT id::text AS tid, order_id::text AS oid, created_at::text AS date, amount, status::text AS status, COALESCE(payment_method,'unknown') AS pm FROM transactions WHERE status='refunded' AND ${inWindow('created_at')} ORDER BY created_at DESC LIMIT 100)
      UNION ALL
      (SELECT id::text AS tid, order_id::text AS oid, created_at::text AS date, amount, status::text AS status, COALESCE(payment_method,'unknown') AS pm FROM transactions WHERE status='failed' AND ${inWindow('created_at')} ORDER BY created_at DESC LIMIT 100)`,
  )
  const refundsRows = refRows.slice(0, 100).map((r) => ({
    transactionId: getStr(r.tid),
    orderId: getStr(r.oid, '—'),
    date: getStr(r.date),
    amount: getNum(r.amount),
    status: getStr(r.status),
    paymentMethod: getStr(r.pm, 'unknown'),
  }))

  // ---- Catalog: daily volume + products + vendors + bookings ----
  const dayO = await rRows(
    payload,
    sql`SELECT date_trunc('day', created_at)::date::text AS day, COUNT(*)::int AS orders FROM orders ${startISO ? sql`WHERE created_at >= ${startISO} AND created_at <= ${nowISO}` : sql``} GROUP BY 1`,
  )
  const dayT = await rRows(
    payload,
    sql`SELECT date_trunc('day', paid_at)::date::text AS day, COALESCE(SUM(amount::numeric),0) AS revenue FROM transactions WHERE status='paid' ${startISO ? sql`AND paid_at >= ${startISO} AND paid_at <= ${nowISO}` : sql``} GROUP BY 1`,
  )
  const dayMap = new Map<string, { date: string; orders: number; revenue: number }>()
  for (const r of dayO) {
    const d = String(r.day).slice(0, 10)
    dayMap.set(d, { date: d, orders: getNum(r.orders), revenue: 0 })
  }
  for (const r of dayT) {
    const d = String(r.day).slice(0, 10)
    const e = dayMap.get(d) ?? { date: d, orders: 0, revenue: 0 }
    e.revenue = getNum(r.revenue)
    dayMap.set(d, e)
  }
  const orderVolumeDaily = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  const prodRows = await rRows(
    payload,
    sql`SELECT COALESCE(NULLIF(oi.product_name_snapshot,''),'Unknown') AS name, oi.product_id::text AS pid,
      COALESCE(SUM(oi.quantity::numeric),0) AS qty, COALESCE(SUM(oi.total_price::numeric),0) AS revenue, COUNT(*)::int AS orders
      FROM order_items oi JOIN transactions t ON t.order_id = oi.order_id AND t.status='paid' ${startISO ? sql`AND t.paid_at >= ${startISO} AND t.paid_at <= ${nowISO}` : sql``}
      GROUP BY 1, 2 ORDER BY SUM(oi.total_price::numeric) DESC LIMIT 20`,
  )
  const vendAll = await rRows(
    payload,
    sql`SELECT id::text AS id, business_name, business_type::text AS bt, verification_status::text AS vs, is_active AS active,
      total_merchants, average_rating, total_orders FROM vendors ORDER BY id`,
  )
  const bookRows = await rRows(
    payload,
    sql`SELECT b.order_id::text AS oid, b.status::text AS status, b.delivery_fee AS dfee,
      COALESCE(b.service_type,'MOTORCYCLE') AS stype, COALESCE(b.driver_name,'—') AS dname
      FROM delivery_bookings b JOIN orders o ON o.id = b.order_id ${startISO ? sql`WHERE o.created_at >= ${startISO} AND o.created_at <= ${nowISO}` : sql``}
      ORDER BY b.id DESC LIMIT 200`,
  )
  const bookStatus = new Map<string, number>()
  for (const r of bookRows) bookStatus.set(getStr(r.status, 'unknown'), (bookStatus.get(getStr(r.status, 'unknown')) ?? 0) + 1)

  return {
    summary: { meta, summary },
    financial: {
      financialReconciliation: {
        rows: financialRows,
        totals: {
          gross: totalRevenue,
          platformFees: financialRows.reduce((s, r) => s + r.platformFee, 0),
          deliveryFees: financialRows.reduce((s, r) => s + r.deliveryFee, 0),
          discounts: financialRows.reduce((s, r) => s + (r.discount || 0), 0),
        },
        count: financialRows.length,
        totalCount: getNum(revRows[0]?.paid_n),
      },
      vendorPayouts: { rows: vendorPayouts, count: vendorPayouts.length },
      refundsFailures: {
        rows: refundsRows,
        totals: { refunded: totalRefunded, failed: getNum((await rRows(payload, sql`SELECT COALESCE(SUM(amount::numeric) FILTER (WHERE status='failed' AND ${inWindow('created_at')}),0) AS f FROM transactions`))[0]?.f) },
        count: refundsRows.length,
      },
    },
    catalog: {
      orderVolume: {
        daily: orderVolumeDaily,
        totalOrders,
        totalRevenue,
      },
      productPerformance: {
        rows: prodRows.map((r) => ({ id: getStr(r.pid, getStr(r.name, 'Unknown')), name: getStr(r.name, 'Unknown'), quantity: getNum(r.qty), revenue: getNum(r.revenue), orders: getNum(r.orders) })),
        count: prodRows.length,
      },
      vendorCompliance: {
        rows: vendAll.map((r) => ({
          vendorId: getStr(r.id),
          businessName: getStr(r.business_name),
          businessType: getStr(r.bt, 'other'),
          verificationStatus: getStr(r.vs, 'unknown'),
          isActive: !!r.active,
          totalMerchants: getNum(r.total_merchants),
          averageRating: getNum(r.average_rating),
          totalOrders: getNum(r.total_orders),
        })),
        count: vendAll.length,
      },
      deliveryLogistics: {
        totalBookings: bookRows.length,
        byStatus: Array.from(bookStatus.entries()).map(([status, count]) => ({ status, count })),
        sampleRows: bookRows.slice(0, 20).map((r) => ({
          orderId: getStr(r.oid),
          status: getStr(r.status),
          deliveryFee: getNum(r.dfee),
          serviceType: getStr(r.stype, 'MOTORCYCLE'),
          driverName: getStr(r.dname, '—'),
        })),
      },
    },
  }
}

export type ReportsOverview = Awaited<ReturnType<typeof buildReportsOverview>>

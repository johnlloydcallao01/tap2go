import type { Payload } from 'payload'

export function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

export function daysAgoDate(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getNum(val: unknown, fallback = 0): number {
  if (typeof val === 'number') return Number.isFinite(val) ? val : fallback
  if (typeof val === 'string') {
    const n = parseFloat(val)
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}

export function getStr(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  return fallback
}

type DrizzleRows = { rows: Array<Record<string, unknown>> }

async function drizzleRows(payload: Payload, query: string): Promise<Array<Record<string, unknown>>> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as DrizzleRows
  return Array.isArray(result?.rows) ? result.rows : []
}

const DASH_CTX = { skipStoreHours: true } as const

export type DashboardMetrics = {
  totalRevenue: number
  totalOrders: number
  activeMerchants: number
  totalCustomers: number
  totalVendors: number
  revenueChange: number
  ordersChange: number
  merchantsChange: number
}

export type DailyMetric = { date: string; revenue: number; orders: number }
export type OrderStatusCount = { status: string; count: number }
export type TopMerchant = { id: string; name: string; orders: number; revenue: number; rating: number }
export type TopVendor = {
  id: string
  businessName: string
  totalOrders: number
  totalMerchants: number
  averageRating: number
}
export type RecentOrder = {
  id: string
  merchantName: string
  customerEmail: string
  total: number
  status: string
  createdAt: string
}

/**
 * Efficient counts via payload.count (single COUNT(*), no doc hydration).
 * Matches previous limit:0 semantics exactly.
 */
export async function fetchDashboardCounts(payload: Payload) {
  const thirtyDaysAgoISO = daysAgoISO(30)
  const sixtyDaysAgoISO = daysAgoISO(60)

  const [vendors, customers, activeMerchants, ordersTotal, recentOrders, previousOrders] = await Promise.all([
    payload.count({ collection: 'vendors', overrideAccess: true, context: DASH_CTX }),
    payload.count({ collection: 'customers', overrideAccess: true, context: DASH_CTX }),
    payload.count({
      collection: 'merchants',
      where: { isActive: { equals: true } },
      overrideAccess: true,
      context: DASH_CTX,
    }),
    payload.count({ collection: 'orders', overrideAccess: true, context: DASH_CTX }),
    payload.count({
      collection: 'orders',
      where: { createdAt: { greater_than_equal: thirtyDaysAgoISO } },
      overrideAccess: true,
      context: DASH_CTX,
    }),
    payload.count({
      collection: 'orders',
      where: {
        and: [
          { createdAt: { greater_than_equal: sixtyDaysAgoISO } },
          { createdAt: { less_than: thirtyDaysAgoISO } },
        ],
      },
      overrideAccess: true,
      context: DASH_CTX,
    }),
  ])

  return {
    thirtyDaysAgoISO,
    sixtyDaysAgoISO,
    totalVendors: vendors.totalDocs,
    totalCustomers: customers.totalDocs,
    activeMerchants: activeMerchants.totalDocs,
    totalOrders: ordersTotal.totalDocs,
    recentOrdersCount: recentOrders.totalDocs,
    previousOrdersCount: previousOrders.totalDocs,
  }
}

/**
 * Revenue aggregates in Postgres — replaces fetching up to 1000 transactions
 * + JS filter/reduce with 3 indexed SUM/COUNT queries. No truncation.
 */
export async function fetchRevenueMetrics(payload: Payload, thirtyDaysAgoISO: string, sixtyDaysAgoISO: string) {
  const totalRows = await drizzleRows(
    payload,
    `SELECT COALESCE(SUM(amount::numeric),0) AS total_revenue FROM transactions WHERE status='paid'`,
  )
  const recentRows = await drizzleRows(
    payload,
    `SELECT COALESCE(SUM(amount::numeric),0) AS recent_revenue FROM transactions WHERE status='paid' AND paid_at >= '${thirtyDaysAgoISO}'`,
  )
  const previousRows = await drizzleRows(
    payload,
    `SELECT COALESCE(SUM(amount::numeric),0) AS previous_revenue FROM transactions WHERE status='paid' AND paid_at >= '${sixtyDaysAgoISO}' AND paid_at < '${thirtyDaysAgoISO}'`,
  )

  return {
    totalRevenue: getNum(totalRows[0]?.total_revenue),
    recentRevenue: getNum(recentRows[0]?.recent_revenue),
    previousRevenue: getNum(previousRows[0]?.previous_revenue),
  }
}

export async function fetchRevenueChart(payload: Payload, thirtyDaysAgoISO: string): Promise<DailyMetric[]> {
  const rows = await drizzleRows(
    payload,
    `SELECT date_trunc('day', paid_at)::date::text AS day, COALESCE(SUM(amount::numeric),0) AS revenue, COUNT(*) AS orders FROM transactions WHERE status='paid' AND paid_at >= '${thirtyDaysAgoISO}' GROUP BY 1 ORDER BY 1`,
  )
  const buckets = new Map<string, { revenue: number; orders: number }>()
  for (const r of rows) {
    const day = String(r.day ?? '').slice(0, 10)
    if (!day) continue
    buckets.set(day, { revenue: getNum(r.revenue), orders: getNum(r.orders) })
  }
  const chart: DailyMetric[] = []
  for (let i = 29; i >= 0; i--) {
    const date = daysAgoDate(i)
    const entry = buckets.get(date) ?? { revenue: 0, orders: 0 }
    chart.push({ date: formatDate(date), revenue: entry.revenue, orders: entry.orders })
  }
  return chart
}

export async function fetchOrderStatusChart(payload: Payload): Promise<OrderStatusCount[]> {
  const rows = await drizzleRows(payload, `SELECT status::text AS status, COUNT(*) AS count FROM orders GROUP BY status`)
  return rows.map((r) => ({ status: getStr(r.status, 'unknown'), count: getNum(r.count) }))
}

export async function fetchTopMerchants(payload: Payload): Promise<TopMerchant[]> {
  const rows = await drizzleRows(
    payload,
    `SELECT o.merchant_id::text AS merchant_id, m.outlet_name AS outlet_name, COUNT(*) AS orders, COALESCE(SUM(o.total::numeric),0) AS revenue FROM orders o LEFT JOIN merchants m ON m.id = o.merchant_id GROUP BY o.merchant_id, m.outlet_name ORDER BY COUNT(*) DESC LIMIT 5`,
  )
  return rows.map((r) => {
    const id = getStr(r.merchant_id)
    return {
      id,
      name: getStr(r.outlet_name, id ? `Merchant #${id}` : 'Unknown'),
      orders: getNum(r.orders),
      revenue: getNum(r.revenue),
      rating: 0,
    }
  })
}

export async function fetchTopVendors(payload: Payload): Promise<TopVendor[]> {
  const rows = await drizzleRows(
    payload,
    `SELECT v.id::text AS id, v.business_name AS business_name, v.total_merchants AS total_merchants, v.average_rating AS average_rating, COUNT(o.id)::int AS total_orders FROM vendors v LEFT JOIN merchants m ON m.vendor_id = v.id LEFT JOIN orders o ON o.merchant_id = m.id GROUP BY v.id, v.business_name, v.total_merchants, v.average_rating ORDER BY COUNT(o.id) DESC LIMIT 5`,
  )
  return rows.map((r) => ({
    id: getStr(r.id),
    businessName: getStr(r.business_name),
    totalOrders: getNum(r.total_orders),
    totalMerchants: getNum(r.total_merchants),
    averageRating: getNum(r.average_rating),
  }))
}

export async function fetchRecentOrders(payload: Payload): Promise<RecentOrder[]> {
  const rows = await drizzleRows(
    payload,
    `SELECT o.id::text AS id, o.total AS total, o.status::text AS status, o.created_at::text AS created_at, m.outlet_name AS merchant_name, c.email AS customer_email, c.id::text AS customer_id FROM orders o LEFT JOIN merchants m ON m.id = o.merchant_id LEFT JOIN customers c ON c.id = o.customer_id ORDER BY o.created_at DESC LIMIT 10`,
  )
  return rows.map((r) => ({
    id: getStr(r.id),
    merchantName: getStr(r.merchant_name, 'N/A'),
    customerEmail: getStr(r.customer_email, r.customer_id ? `Customer #${getStr(r.customer_id)}` : 'N/A'),
    total: getNum(r.total),
    status: getStr(r.status, 'unknown'),
    createdAt: getStr(r.created_at),
  }))
}

export async function buildMetricsGroup(payload: Payload): Promise<{ metrics: DashboardMetrics }> {
  const counts = await fetchDashboardCounts(payload)
  const revenue = await fetchRevenueMetrics(payload, counts.thirtyDaysAgoISO, counts.sixtyDaysAgoISO)
  const metrics: DashboardMetrics = {
    totalRevenue: revenue.totalRevenue,
    totalOrders: counts.totalOrders,
    activeMerchants: counts.activeMerchants,
    totalCustomers: counts.totalCustomers,
    totalVendors: counts.totalVendors,
    revenueChange:
      revenue.previousRevenue > 0
        ? ((revenue.recentRevenue - revenue.previousRevenue) / revenue.previousRevenue) * 100
        : 0,
    ordersChange:
      counts.previousOrdersCount > 0
        ? ((counts.recentOrdersCount - counts.previousOrdersCount) / counts.previousOrdersCount) * 100
        : 0,
    merchantsChange: 0,
  }
  return { metrics }
}

export async function buildChartsGroup(payload: Payload) {
  const thirtyDaysAgoISO = daysAgoISO(30)
  const [revenueChart, orderStatusChart, topMerchants] = await Promise.all([
    fetchRevenueChart(payload, thirtyDaysAgoISO),
    fetchOrderStatusChart(payload),
    fetchTopMerchants(payload),
  ])
  return { revenueChart, orderStatusChart, topMerchants }
}

export async function buildTablesGroup(payload: Payload) {
  const [topVendors, recentOrders] = await Promise.all([fetchTopVendors(payload), fetchRecentOrders(payload)])
  return { topVendors, recentOrders }
}

export async function buildOverview(payload: Payload) {
  const [metricsGroup, chartsGroup, tablesGroup] = await Promise.all([
    buildMetricsGroup(payload),
    buildChartsGroup(payload),
    buildTablesGroup(payload),
  ])
  return { ...metricsGroup, ...chartsGroup, ...tablesGroup }
}

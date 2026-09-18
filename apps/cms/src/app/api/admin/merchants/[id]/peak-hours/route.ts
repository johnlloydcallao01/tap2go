import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { validateTimezone } from '@/utils/storeHours'
import { sql } from 'drizzle-orm'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config: configPromise })
    if (!await authenticateAdmin(payload, request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const days = Math.min(366, Math.max(1, Number(searchParams.get('days') || 30)))
    const cacheKey = `admin:merchants:peak:v1:${String(Number(id))}:${days}`
    const { data, status } = await getOrBuildDashboard(cacheKey, 300, () =>
      withAdminRequestSlot(async () => {
        const merchant = await payload.findByID({ collection: 'merchants', id: Number(id), depth: 0, overrideAccess: true, context: { skipStoreHours: true } }) as any
        const timezone = validateTimezone(merchant.timezone)
        // Timezone-aware hourly buckets in Postgres — replaces unbounded
        // orders limit:0 + per-order Intl loop. tz validated via Intl above.
        const cutoffISO = new Date(Date.now() - days * 86400000).toISOString()
        const rows = (await payload.db.drizzle.execute(
          sql`SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE ${timezone})::int AS hour,
            COUNT(*)::int AS orders,
            COUNT(*) FILTER (WHERE status='delivered')::int AS completed,
            COUNT(*) FILTER (WHERE status='cancelled')::int AS cancelled
            FROM orders WHERE merchant_id = ${Number(id)} AND created_at >= ${cutoffISO}
            GROUP BY 1 ORDER BY 1` as never,
        ) as unknown as { rows: Array<Record<string, unknown>> }).rows ?? []
        const buckets = Array.from({ length: 24 }, (_, hour) => ({ hour, orders: 0, completed: 0, cancelled: 0 }))
        for (const r of rows) {
          const h = Number(r.hour)
          if (h < 0 || h > 23) continue
          buckets[h] = {
            hour: h,
            orders: Number(r.orders ?? 0),
            completed: Number(r.completed ?? 0),
            cancelled: Number(r.cancelled ?? 0),
          }
        }
        return {
          merchantId: Number(id),
          timezone,
          days,
          buckets,
          peakHours: buckets.filter((b) => b.orders > 0).sort((a, b) => b.orders - a.orders).slice(0, 3),
        }
      }),
    )
    return NextResponse.json(data, { headers: { 'X-Merchants-Cache': status } })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load peak hours'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

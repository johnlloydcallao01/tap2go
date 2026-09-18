import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { buildOverview } from '@/utils/dashboardOverview'

/**
 * Single deduped overview read: 1 CMS call replaces metrics+charts+tables
 * fan-out (was 14 finds + 3 auth). Counts via payload.count, aggregates
 * via indexed SQL GROUP BY/SUM, recent 10 via JOIN. Global cache key.
 * L1 (5s) + singleflight + SWR (30s stale) shielding Redis/DB.
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = `admin:dashboard:overview:v1`
    const { data, status } = await getOrBuildDashboard(cacheKey, 300, () =>
      withAdminRequestSlot(() => buildOverview(payload)),
    )
    return NextResponse.json(data, { headers: { 'X-Dashboard-Cache': status } })
  } catch (error) {
    console.error('Dashboard overview aggregation error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard overview' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { buildAnalyticsNormalizedKey, buildAnalyticsOverview } from '@/utils/analyticsOverview'

/**
 * Single deduped analytics read: 1 CMS call replaces summary+charts+tops
 * fan-out (was ~25 finds + 3 auth, 31k docs JS-aggregated).
 * Counts via payload.count, aggregates via parameterized SQL, global
 * normalized key (no admin.id), L1/singleflight/SWR, gate on MISS only.
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const cacheKey = `admin:analytics:overview:v1:${buildAnalyticsNormalizedKey(searchParams)}`
    const { data, status } = await getOrBuildDashboard(cacheKey, 300, () =>
      withAdminRequestSlot(() => buildAnalyticsOverview(payload, searchParams)),
    )
    return NextResponse.json(data, { headers: { 'X-Analytics-Cache': status } })
  } catch (error) {
    console.error('Analytics overview aggregation error:', error)
    return NextResponse.json({ error: 'Failed to load analytics overview' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { buildReportsNormalizedKey, buildReportsOverview } from '@/utils/reportsOverview'

/**
 * Single deduped reports read: 1 CMS call replaces summary+financial+catalog
 * fan-out (was 15 finds + 3 auth, ~41k docs JS-aggregated).
 * Counts via payload.count, aggregates via parameterized SQL, global
 * normalized key (no admin.id, range only), L1/singleflight/SWR, gate on MISS only.
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const cacheKey = `admin:reports:overview:v1:${buildReportsNormalizedKey(searchParams)}`
    const { data, status } = await getOrBuildDashboard(cacheKey, 300, () =>
      withAdminRequestSlot(() => buildReportsOverview(payload, searchParams)),
    )
    return NextResponse.json(data, { headers: { 'X-Reports-Cache': status } })
  } catch (error) {
    console.error('Reports overview aggregation error:', error)
    return NextResponse.json({ error: 'Failed to load reports overview' }, { status: 500 })
  }
}

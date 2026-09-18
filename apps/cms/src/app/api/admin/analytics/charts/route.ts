import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { buildAnalyticsNormalizedKey, buildAnalyticsOverview } from '@/utils/analyticsOverview'

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
    return NextResponse.json((data as { charts: unknown }).charts, { headers: { 'X-Analytics-Cache': status } })
  } catch (error) {
    console.error('Analytics charts aggregation error:', error)
    return NextResponse.json({ error: 'Failed to load analytics charts' }, { status: 500 })
  }
}

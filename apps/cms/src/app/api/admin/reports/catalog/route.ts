import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { buildReportsNormalizedKey, buildReportsOverview } from '@/utils/reportsOverview'

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
    return NextResponse.json((data as { catalog: unknown }).catalog, { headers: { 'X-Reports-Cache': status } })
  } catch (error) {
    console.error('Reports catalog aggregation error:', error)
    return NextResponse.json({ error: 'Failed to load reports catalog' }, { status: 500 })
  }
}

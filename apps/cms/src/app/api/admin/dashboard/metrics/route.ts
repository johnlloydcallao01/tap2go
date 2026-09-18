import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { buildMetricsGroup } from '@/utils/dashboardOverview'

type MetricsResponse = {
  metrics: Record<string, number>
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Global key: platform-wide metrics are identical for all admins.
    const cacheKey = `admin:dashboard:metrics:v1`
    const { data, status } = await getOrBuildDashboard<MetricsResponse>(cacheKey, 300, () =>
      withAdminRequestSlot(async () => {
        const built = await buildMetricsGroup(payload)
        return { metrics: built.metrics as unknown as Record<string, number> }
      }),
    )
    return NextResponse.json(data, { headers: { 'X-Dashboard-Cache': status } })
  } catch (error) {
    console.error('Dashboard metrics aggregation error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard metrics' }, { status: 500 })
  }
}

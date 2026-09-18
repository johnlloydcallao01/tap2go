import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { buildChartsGroup } from '@/utils/dashboardOverview'

type ChartsResponse = {
  revenueChart: Array<Record<string, string | number>>
  orderStatusChart: Array<Record<string, string | number>>
  topMerchants: Array<Record<string, string | number>>
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = `admin:dashboard:charts:v1`
    const { data, status } = await getOrBuildDashboard<ChartsResponse>(cacheKey, 300, () =>
      withAdminRequestSlot(async () => {
        const built = await buildChartsGroup(payload)
        return built as unknown as ChartsResponse
      }),
    )
    return NextResponse.json(data, { headers: { 'X-Dashboard-Cache': status } })
  } catch (error) {
    console.error('Dashboard charts aggregation error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard charts' }, { status: 500 })
  }
}

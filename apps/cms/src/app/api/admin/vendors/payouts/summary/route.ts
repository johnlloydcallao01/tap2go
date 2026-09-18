import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { buildPayoutsNormalizedKey, buildPayoutsOverview } from '@/utils/payoutsOverview'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const cacheKey = `admin:payouts:overview:v1:${buildPayoutsNormalizedKey(searchParams)}`
    const { data, status } = await getOrBuildDashboard(cacheKey, 300, () =>
      withAdminRequestSlot(() => buildPayoutsOverview(payload, searchParams)),
    )
    const overview = data as { meta: unknown; summary: unknown; verificationBreakdown: unknown }
    return NextResponse.json(
      { meta: overview.meta, summary: overview.summary, verificationBreakdown: overview.verificationBreakdown },
      { headers: { 'X-Payouts-Cache': status } },
    )
  } catch (err: unknown) {
    console.error('[admin/vendors/payouts/summary] error:', err)
    return NextResponse.json({ error: 'Failed to load payouts summary' }, { status: 500 })
  }
}

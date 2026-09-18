import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { buildPayoutsNormalizedKey, buildPayoutsOverview } from '@/utils/payoutsOverview'

/**
 * Single deduped payouts read: 1 CMS call replaces summary+rows+daily
 * fan-out (was 12 finds + 3 auth, ~36k docs JS-aggregated).
 * Aggregates via parameterized SQL, global normalized key (no admin.id),
 * L1/singleflight/SWR, gate on MISS only.
 */
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
    return NextResponse.json(data, { headers: { 'X-Payouts-Cache': status } })
  } catch (err: unknown) {
    console.error('[admin/vendors/payouts/overview] error:', err)
    return NextResponse.json({ error: 'Failed to load payouts overview' }, { status: 500 })
  }
}

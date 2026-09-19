/**
 * @file apps/cms/src/utils/businessZoneStats.ts
 * @description Global stats rollup for the /business-zones admin page.
 * Replaces the old per-request `business-zones 5000` + `merchants 5000`
 * hydration + JS Map counts with two indexed SQL statements, cached under
 * `admin:business-zones:stats:v1` (TTL 300). Shared by the list route and
 * the overview route. See docs/performance.md.
 *
 * Stats stay global (unfiltered) — the list's paginated find `totalDocs`
 * remains the exact filtered count.
 */

import type { Payload } from 'payload'
import { sql, type SQL } from 'drizzle-orm'
import { getOrBuildDashboard } from './dashboardCache'
import { withAdminRequestSlot } from './adminRequestGate'

type Row = Record<string, unknown>
type Rows = { rows: Row[] }

async function rows(payload: Payload, query: string | SQL): Promise<Row[]> {
  const result = (await payload.db.drizzle.execute(query as never)) as unknown as Rows
  return Array.isArray(result?.rows) ? result.rows : []
}

export type BusinessZoneStats = {
  totalZones: number
  activeZones: number
  inactiveZones: number
  totalMerchants: number
  assignedMerchants: number
  unassignedMerchants: number
  merchantCountByZone: Record<string, number>
}

/**
 * Cached 300s under its own key so per-qs list/overview MISSes don't recount.
 * Write-through hooks (BusinessZones, Merchants) + route POST/PATCH/DELETE
 * bust both `admin:business-zones:` and `admin:business-zones-overview:`
 * prefixes via bustBusinessZonesCache().
 */
export async function getBusinessZoneStats(payload: Payload): Promise<BusinessZoneStats> {
  const { data } = await getOrBuildDashboard<BusinessZoneStats>(
    'admin:business-zones:stats:v1',
    300,
    () =>
      withAdminRequestSlot(async () => {
        const [zoneRows, merchantRows] = await Promise.all([
          rows(
            payload,
            sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active)::int AS active FROM business_zones`,
          ),
          rows(payload, sql`SELECT COALESCE(business_zone_id::text,'') AS z, COUNT(*)::int AS c FROM merchants GROUP BY business_zone_id`),
        ])
        const totalZones = Number(zoneRows[0]?.total ?? 0)
        const activeZones = Number(zoneRows[0]?.active ?? 0)
        const inactiveZones = totalZones - activeZones
        const merchantCountByZone: Record<string, number> = {}
        let totalMerchants = 0
        let unassignedMerchants = 0
        for (const r of merchantRows) {
          const z = String(r.z ?? '')
          const c = Number(r.c ?? 0)
          totalMerchants += c
          if (!z) unassignedMerchants += c
          else merchantCountByZone[z] = c
        }
        return {
          totalZones,
          activeZones,
          inactiveZones,
          totalMerchants,
          assignedMerchants: totalMerchants - unassignedMerchants,
          unassignedMerchants,
          merchantCountByZone,
        }
      }),
  )
  return data
}
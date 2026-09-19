/**
 * @file apps/cms/src/app/api/admin/business-zones/overview/route.ts
 * @description BFF aggregation for centralized Business Zones + Merchant Zones overview.
 * Returns platform zones with merchant assignment + merchant zones (service_area) in one payload.
 * GET /api/admin/business-zones/overview?zoneId= optional filter
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'
import { getOrBuildDashboard } from '@/utils/dashboardCache'
import { withAdminRequestSlot } from '@/utils/adminRequestGate'
import { getBusinessZoneStats } from '@/utils/businessZoneStats'

function str(v: unknown, fb = ''): string { return typeof v === 'string' ? v : fb }

function sanitizeMediaRef(v: unknown): { id: number; url: string | null } | null {
  if (!v || typeof v !== 'object') return null
  const s = v as Record<string, unknown>
  const id = Number(s.id)
  if (Number.isNaN(id)) return null
  const url = typeof s.cloudinaryURL === 'string' ? s.cloudinaryURL : typeof s.url === 'string' ? s.url : null
  return { id, url }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const cacheQuery = Array.from(searchParams.entries())
      .filter(([key]) => key !== '_t')
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&') || 'default'
    // Global key (platform-wide data). Gate wraps the builder only, so HIT
    // never queues. See performance.md.
    const cacheKey = `admin:business-zones-overview:v1:${cacheQuery}`

    const { data: responseBody, status } = await getOrBuildDashboard<Record<string, unknown>>(
      cacheKey,
      300,
      () =>
        withAdminRequestSlot(async () => {
          const zoneIdParam = searchParams.get('zoneId') || searchParams.get('businessZoneId')
          const zoneId = zoneIdParam ? Number(zoneIdParam) : null
          const includeMerchants = searchParams.get('includeMerchants') !== 'false'

          // Zones (tiny config table) + global stats rollup — counts no longer
          // require hydrating every merchant.
          const zonesRes = await payload.find({ collection: 'business-zones', limit: 1000, depth: 0, overrideAccess: true, pagination: false } as any)
          const zones = ((zonesRes as any).docs || []) as any[]
          const stats = await getBusinessZoneStats(payload)

          // Merchant zones (service_area view). Projected select drops every
          // unread merchant blob; skipStoreHours guards the afterRead hook.
          // vendor/media stay populated at depth:2 for logo/thumbnail.
          let merchants: any[] = []
          if (includeMerchants) {
            const where = zoneId && !Number.isNaN(zoneId) ? { businessZone: { equals: zoneId } } : undefined
            const mRes = await payload.find({
              collection: 'merchants',
              where,
              limit: 1000,
              depth: 2,
              overrideAccess: true,
              pagination: false,
              select: {
                id: true,
                outletName: true,
                outletCode: true,
                vendor: true,
                media: true,
                businessZone: true,
                isActive: true,
                isAcceptingOrders: true,
                operationalStatus: true,
                merchant_latitude: true,
                merchant_longitude: true,
                merchant_coordinates: true,
                service_area: true,
                priority_zones: true,
                restricted_areas: true,
                delivery_radius_meters: true,
                timezone: true,
              },
              context: { skipStoreHours: true },
            } as any)
            merchants = ((mRes as any).docs || []) as any[]
          }

          // Sanitize zones with counts (global rollup — exact even under zoneId filter)
          const zonesWithCounts = zones.map((z: any) => ({
            id: z.id,
            name: str(z.name),
            slug: str(z.slug),
            description: z.description ?? null,
            boundary: z.boundary ?? null,
            isActive: typeof z.isActive === 'boolean' ? z.isActive : true,
            disabledReason: z.disabledReason ?? null,
            displayOrder: z.displayOrder ?? 0,
            timezone: str(z.timezone, 'Asia/Manila'),
            createdAt: String(z.createdAt ?? ''),
            updatedAt: String(z.updatedAt ?? ''),
            merchantCount: stats.merchantCountByZone[String(z.id)] || 0,
          }))

          // Sanitize Merchant Zones (service_area view)
          const merchantZones = merchants.slice(0, 1000).map((m: any) => {
            const vendor = m.vendor && typeof m.vendor === 'object' ? m.vendor as any : null
            const zoneVal = m.businessZone ?? m.business_zone ?? null
            const zoneObj = zoneVal && typeof zoneVal === 'object' ? zoneVal as any : null
            return {
              id: m.id,
              outletName: str(m.outletName),
              outletCode: str(m.outletCode),
              vendor: vendor ? { id: vendor.id, businessName: str(vendor.businessName), logo: sanitizeMediaRef(vendor.logo) } : null,
              vendorId: vendor ? vendor.id : (typeof m.vendor === 'number' ? m.vendor : null),
              media: {
                thumbnail: sanitizeMediaRef((m.media as any)?.thumbnail),
                storeFrontImage: sanitizeMediaRef((m.media as any)?.storeFrontImage),
              },
              businessZone: zoneObj ? { id: zoneObj.id, name: str(zoneObj.name), isActive: !!zoneObj.isActive } : (zoneVal ? { id: Number(zoneVal), name: String(zoneVal) } : null),
              businessZoneId: zoneObj ? zoneObj.id : (zoneVal ? Number(zoneVal) : null),
              isActive: !!m.isActive,
              isAcceptingOrders: !!m.isAcceptingOrders,
              operationalStatus: str(m.operationalStatus, 'open'),
              merchant_latitude: m.merchant_latitude ?? null,
              merchant_longitude: m.merchant_longitude ?? null,
              merchant_coordinates: m.merchant_coordinates ?? null,
              service_area: m.service_area ?? null,
              priority_zones: m.priority_zones ?? null,
              restricted_areas: m.restricted_areas ?? null,
              delivery_radius_meters: m.delivery_radius_meters ?? null,
              timezone: str(m.timezone, 'Asia/Manila'),
            }
          })

          return {
            zones: zonesWithCounts,
            merchantZones,
            stats,
            meta: { generatedAt: new Date().toISOString(), zoneId: zoneId ?? null },
          }
        }),
    )
    return NextResponse.json(responseBody, { headers: { 'X-BusinessZonesOverview-Cache': status } })
  } catch (err: any) {
    console.error('[admin/business-zones/overview] GET error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to load overview' }, { status: 500 })
  }
}

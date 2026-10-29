import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import { GeospatialService } from '../../src/services/GeospatialService'
import { MerchantLocationService } from '../../src/services/MerchantLocationService'

describe('GeospatialService Home query', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses only existing merchant columns and returns the window count', async () => {
    let executedQuery = ''
    const payload = {
      db: {
        drizzle: {
          execute: vi.fn(async (query: string) => {
            executedQuery = query
            return {
              rows: [
                {
                  id: 1,
                  outlet_name: 'Tap2Go Kitchen',
                  outlet_code: 'T2G-1',
                  merchant_latitude: 14.6,
                  merchant_longitude: 121.0,
                  delivery_radius_meters: 5000,
                  avg_delivery_time_minutes: 30,
                  is_active: true,
                  is_accepting_orders: true,
                  operational_status: 'open',
                  service_area: null,
                  priority_zones: null,
                  restricted_areas: null,
                  delivery_zones: null,
                  timezone: 'Asia/Manila',
                  created_at: '2026-09-01T00:00:00.000Z',
                  updated_at: '2026-09-20T00:00:00.000Z',
                  distance_meters: '500',
                  total_count: '3',
                  vendor_id: 2,
                  vendor_business_name: 'Tap2Go',
                  vendor_average_rating: 4.8,
                  vendor_total_orders: 100,
                  vendor_cuisine_types: [],
                  merchant_category_ids: [4],
                  merchant_thumbnail_id: null,
                  merchant_thumbnail_cloudinary_public_id: null,
                  merchant_thumbnail_cloudinary_url: null,
                  merchant_thumbnail_url: null,
                  merchant_thumbnail_thumbnail_url: null,
                  merchant_thumbnail_filename: null,
                  merchant_thumbnail_alt: null,
                  merchant_storefront_id: null,
                  merchant_storefront_cloudinary_public_id: null,
                  merchant_storefront_cloudinary_url: null,
                  merchant_storefront_url: null,
                  merchant_storefront_thumbnail_url: null,
                  merchant_storefront_filename: null,
                  merchant_storefront_alt: null,
                  vendor_logo_id: null,
                  vendor_logo_cloudinary_public_id: null,
                  vendor_logo_cloudinary_url: null,
                  vendor_logo_url: null,
                  vendor_logo_thumbnail_url: null,
                  vendor_logo_filename: null,
                  vendor_logo_alt: null,
                },
              ],
            }
          }),
        },
      },
    }

    const result = await new GeospatialService(
      payload as unknown as Payload,
    ).findMerchantsWithinRadiusPostGIS({
      latitude: 14.6,
      longitude: 121.0,
      radiusMeters: 50000,
      limit: 50,
    })

    expect(executedQuery).toContain('COUNT(*) OVER() as total_count')
    expect(executedQuery).not.toMatch(/\bm\.(average_rating|total_orders)\b/)
    expect(result.totalCount).toBe(3)
    expect(result.merchants).toHaveLength(1)
  })

  it('loads customer coordinates through the populated active-address relationship', async () => {
    const findByID = vi.fn(async () => ({
      id: 1,
      activeAddress: {
        id: 2,
        latitude: 14.6,
        longitude: 121.0,
      },
    }))
    const geospatialLookup = vi
      .spyOn(GeospatialService.prototype, 'findMerchantsWithinRadiusPostGIS')
      .mockResolvedValue({
        merchants: [],
        totalCount: 0,
      } as never)
    const payload = { findByID }

    const result = await new MerchantLocationService(
      payload as unknown as Payload,
    ).getMerchantsForLocationDisplay({ customerId: 1, includeTotalCount: false })

    expect(findByID).toHaveBeenCalledTimes(1)
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'customers', id: 1, depth: 1 }),
    )
    expect(geospatialLookup).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 14.6, longitude: 121.0 }),
    )
    expect(result.address.id).toBe(2)
  })

  it('skips the window and empty-page counts when exact totals are disabled', async () => {
    const execute = vi.fn(async (_query: string) => ({ rows: [] }))
    const timings: Array<{ phase: string; durationMs: number; counts?: Record<string, number> }> = []
    const payload = {
      db: { drizzle: { execute } },
    }

    const result = await new GeospatialService(
      payload as unknown as Payload,
    ).findMerchantsWithinRadiusPostGIS({
      latitude: 14.6,
      longitude: 121.0,
      radiusMeters: 50000,
      limit: 50,
      includeTotalCount: false,
      onTiming: (phase, durationMs, counts) => timings.push({ phase, durationMs, counts }),
    })

    expect(execute).toHaveBeenCalledTimes(1)
    expect(execute.mock.calls[0]?.[0]).not.toContain('COUNT(*) OVER()')
    expect(result.totalCount).toBe(0)
    expect(timings).toContainEqual(
      expect.objectContaining({
        phase: 'geospatial_sql',
        counts: { rowCount: 0, countFallback: 0 },
      }),
    )
  })

  it('keeps the empty-page exact-count fallback enabled by default', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total_count: '4' }] })
    const payload = {
      db: { drizzle: { execute } },
    }

    const result = await new GeospatialService(
      payload as unknown as Payload,
    ).findMerchantsWithinRadiusPostGIS({
      latitude: 14.6,
      longitude: 121.0,
      radiusMeters: 50000,
      limit: 50,
    })

    expect(execute).toHaveBeenCalledTimes(2)
    expect(result.totalCount).toBe(4)
  })
})

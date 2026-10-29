import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Payload } from 'payload'
import { CustomerHomeService } from '../../src/services/CustomerHomeService'
import { MerchantLocationService } from '../../src/services/MerchantLocationService'

vi.mock('@encreasl/cache', () => ({
  getCached: vi.fn(async () => null),
  setCached: vi.fn(async () => {}),
  deleteCachedByPrefix: vi.fn(async () => {}),
}))

describe('CustomerHomeService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads the three home sections concurrently and avoids unused per-document hooks', async () => {
    const customerId = Date.now()
    const locationLookup = vi.spyOn(
      MerchantLocationService.prototype,
      'getMerchantsForLocationDisplay',
    ).mockResolvedValue({
      customer: { id: 1, activeAddressId: 2 },
      address: { id: 2, latitude: 14.6, longitude: 121.0 },
      merchants: [
        {
          id: 10,
          outletName: 'Tap2Go Kitchen',
          outletCode: 'T2G-10',
          vendor: { id: 20, businessName: 'Tap2Go', logo: null },
          media: { thumbnail: null },
          metrics: { averageRating: 4.8, totalOrders: 100 },
          distanceMeters: 500,
          distanceKm: 0.5,
          isWithinDeliveryRadius: true,
          estimatedDeliveryTime: 20,
          merchant_categories: [30],
          updatedAt: '2026-09-20T00:00:00.000Z',
          createdAt: '2026-09-01T00:00:00.000Z',
        },
      ] as never,
      totalCount: 1,
    })

    const findCalls: Record<string, unknown>[] = []
    let finishReads!: () => void
    let notifyAllReadsStarted!: () => void
    const readsCanFinish = new Promise<void>((resolve) => {
      finishReads = resolve
    })
    const allReadsStarted = new Promise<void>((resolve) => {
      notifyAllReadsStarted = resolve
    })
    const payload = {
      find: vi.fn(async (args: Record<string, unknown>) => {
        findCalls.push(args)
        if (findCalls.length === 3) notifyAllReadsStarted()
        await readsCanFinish
        if (args.collection === 'merchant-categories') {
          return {
            docs: [{ id: 30, name: 'Meals', slug: 'meals', icon: null }],
          }
        }
        if (args.collection === 'merchant-products') {
          return {
            docs: [
              {
                id: 40,
                price_override: 125,
                merchant_id: { id: 10, outletName: 'Tap2Go Kitchen' },
                product_id: {
                  id: 50,
                  name: 'Rice Bowl',
                  isActive: true,
                  catalogVisibility: 'visible',
                  productType: 'simple',
                  basePrice: 140,
                  compareAtPrice: 160,
                  shortDescription: 'A rice bowl',
                  media: { primaryImage: null },
                  categories: [{ id: 30, name: 'Meals', slug: 'meals' }],
                },
              },
            ],
          }
        }
        if (args.collection === 'merchants') {
          return {
            docs: [
              {
                id: 10,
                activeAddress: { formatted_address: 'Makati City' },
              },
            ],
          }
        }
        throw new Error(`Unexpected collection: ${String(args.collection)}`)
      }),
    }

    const responsePromise = new CustomerHomeService(
      payload as unknown as Payload,
    ).buildCustomerHomeOverview({ customerId, limit: 20 })
    await allReadsStarted
    expect(locationLookup).toHaveBeenCalledWith(
      expect.objectContaining({ includeTotalCount: false }),
    )
    expect(findCalls).toHaveLength(3)
    finishReads()
    const response = await responsePromise

    expect(findCalls.map((call) => call.collection)).toEqual([
      'merchant-categories',
      'merchant-products',
      'merchants',
    ])
    expect(findCalls[0]).toMatchObject({
      pagination: false,
      select: { id: true, name: true, slug: true, icon: true },
    })
    expect(findCalls[1]).toMatchObject({
      pagination: false,
      context: { skipEffectiveModifierPreview: true },
      select: {
        id: true,
        price_override: true,
        merchant_id: true,
        product_id: true,
      },
    })
    expect(findCalls[2]).toMatchObject({
      pagination: false,
      context: { skipStoreHours: true },
      select: { id: true, activeAddress: true },
    })
    expect(response.categories).toHaveLength(1)
    expect(response.totalCount).toBe(1)
    expect(response.nearbyMerchants[0]?.activeAddressName).toBe('Makati City')
    expect(response.recommended.products).toMatchObject([
      {
        id: 50,
        merchantProductId: 40,
        merchantId: 10,
        name: 'Rice Bowl',
        basePrice: 125,
      },
    ])
  })

  it('fetches only the requested section data', async () => {
    const customerId = Date.now() + 1
    vi.spyOn(
      MerchantLocationService.prototype,
      'getMerchantsForLocationDisplay',
    ).mockResolvedValue({
      customer: { id: 1, activeAddressId: 2 },
      address: { id: 2, latitude: 14.6, longitude: 121.0 },
      merchants: [
        {
          id: 10,
          outletName: 'Tap2Go Kitchen',
          outletCode: 'T2G-10',
          vendor: null,
          media: null,
          metrics: null,
          distanceMeters: 500,
          distanceKm: 0.5,
          isWithinDeliveryRadius: true,
          estimatedDeliveryTime: 20,
          merchant_categories: [30],
        },
      ] as never,
      totalCount: 1,
    })

    const calls: string[] = []
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => {
        calls.push(collection)
        return { docs: [] }
      }),
    }
    const service = new CustomerHomeService(payload as unknown as Payload)

    const primary = await service.buildCustomerHomeOverview(
      { customerId, section: 'primary' },
    )
    expect(calls).toEqual(['merchant-categories', 'merchants'])
    expect(primary.recommended.products).toEqual([])

    calls.length = 0
    const recommendations = await service.buildCustomerHomeOverview(
      { customerId, section: 'recommendations' },
    )
    expect(calls).toEqual(['merchant-products'])
    expect(recommendations.categories).toEqual([])
    expect(recommendations.nearbyMerchants).toEqual([])
  })
})

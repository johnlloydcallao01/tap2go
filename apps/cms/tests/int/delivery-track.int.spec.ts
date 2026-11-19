import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getDeliveryProvider, mapLalamoveStatus, mapToOrderStatus } = vi.hoisted(() => ({
  getDeliveryProvider: vi.fn(),
  mapLalamoveStatus: vi.fn((status: string) => status),
  mapToOrderStatus: vi.fn(() => null),
}))

vi.mock('../../src/services/deliveryProviders', () => ({
  getDeliveryProvider,
  mapLalamoveStatus,
  mapToOrderStatus,
}))

import { deliveryTrackHandler } from '../../src/endpoints/deliveryTrack'

describe('delivery tracking endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('records a live location and returns the persisted trail to the owning customer', async () => {
    const history: Array<Record<string, unknown>> = []
    const payload = {
      findByID: vi.fn(async () => ({
        id: 42,
        customer: 5,
        fulfillment_type: 'delivery',
        delivery_status: 'driver_assigned',
        status: 'accepted',
      })),
      find: vi.fn(async ({ collection, where }: {
        collection: string
        where?: Record<string, any>
      }) => {
        if (collection === 'customers') return { docs: [{ id: 5 }] }
        if (collection === 'delivery-bookings') {
          return {
            docs: [{
              id: 8,
              order: 42,
              lalamove_order_id: 'llm-order-1',
              status: 'driver_assigned',
            }],
          }
        }
        if (collection === 'delivery-location-history') {
          if (where?.dedupe_key?.equals) {
            return {
              docs: history.filter((sample) => sample.dedupe_key === where.dedupe_key.equals),
            }
          }
          return {
            docs: history
              .filter((sample) => sample.driver_id === where?.and?.[1]?.driver_id?.equals)
              .sort((first, second) =>
                String(second.observed_at).localeCompare(String(first.observed_at)),
              ),
          }
        }
        return { docs: [] }
      }),
      create: vi.fn(async ({ collection, data }: {
        collection: string
        data: Record<string, unknown>
      }) => {
        if (collection === 'delivery-location-history') history.push({ id: 1, ...data })
        return { id: history.length, ...data }
      }),
      update: vi.fn(async () => ({})),
    }

    getDeliveryProvider.mockResolvedValue({
      getOrderDetails: vi.fn(async () => ({
        status: 'driver_assigned',
        driverId: 'driver-1',
      })),
      getDriverDetails: vi.fn(async () => ({
        driverId: 'driver-1',
        name: 'Rider',
        coordinates: {
          lat: '14',
          lng: '121',
          updatedAt: '2026-07-18T10:00:00Z',
        },
      })),
    })

    const response = await deliveryTrackHandler({
      user: { id: 99, role: 'customer' },
      query: { orderId: '42' },
      payload,
    } as never)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'delivery-location-history',
      data: expect.objectContaining({
        order: 42,
        driver_id: 'driver-1',
        latitude: 14,
        longitude: 121,
      }),
    }))
    expect(body.data.trail).toEqual([{ latitude: 14, longitude: 121 }])
  })

  it('rejects another customer before requesting live delivery data', async () => {
    const payload = {
      findByID: vi.fn(async () => ({
        id: 42,
        customer: 5,
        fulfillment_type: 'delivery',
      })),
      find: vi.fn(async ({ collection }: { collection: string }) =>
        collection === 'customers' ? { docs: [{ id: 6 }] } : { docs: [] }),
    }

    const response = await deliveryTrackHandler({
      user: { id: 99, role: 'customer' },
      query: { orderId: '42' },
      payload,
    } as never)

    expect(response.status).toBe(403)
    expect(getDeliveryProvider).not.toHaveBeenCalled()
  })

  it('does not save malformed live coordinates or the cached marker as a trail point', async () => {
    const payload = {
      findByID: vi.fn(async () => ({
        id: 42,
        customer: 5,
        fulfillment_type: 'delivery',
        delivery_status: 'driver_assigned',
        status: 'accepted',
      })),
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'customers') return { docs: [{ id: 5 }] }
        if (collection === 'delivery-bookings') {
          return {
            docs: [{
              id: 8,
              order: 42,
              lalamove_order_id: 'llm-order-1',
              status: 'driver_assigned',
              driver_lat: 14,
              driver_lng: 121,
            }],
          }
        }
        return { docs: [] }
      }),
      create: vi.fn(),
      update: vi.fn(async () => ({})),
    }

    getDeliveryProvider.mockResolvedValue({
      getOrderDetails: vi.fn(async () => ({
        status: 'driver_assigned',
        driverId: 'driver-1',
      })),
      getDriverDetails: vi.fn(async () => ({
        driverId: 'driver-1',
        coordinates: { lat: 'invalid', lng: '121' },
      })),
    })

    const response = await deliveryTrackHandler({
      user: { id: 99, role: 'customer' },
      query: { orderId: '42' },
      payload,
    } as never)

    expect(response.status).toBe(200)
    expect(payload.create).not.toHaveBeenCalled()
  })
})

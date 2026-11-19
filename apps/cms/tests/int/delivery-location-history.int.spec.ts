import { describe, expect, it, vi } from 'vitest'
import { recordDriverLocationSample } from '../../src/services/deliveryLocationHistory'

function createPayload() {
  const docs: Array<Record<string, unknown>> = []
  const payload = {
    find: vi.fn(async ({ where }: { where?: Record<string, any> }) => {
      if (where?.dedupe_key?.equals) {
        return {
          docs: docs.filter((doc) => doc.dedupe_key === where.dedupe_key.equals),
        }
      }
      return {
        docs: docs
          .filter((doc) => doc.order === where?.and?.[0]?.order?.equals)
          .sort((first, second) =>
            String(second.observed_at).localeCompare(String(first.observed_at)),
          )
          .slice(0, 1),
      }
    }),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      docs.push(data)
      return data
    }),
  }
  return { payload, docs }
}

describe('delivery location history', () => {
  it('persists new live movement and ignores stationary or out-of-order samples', async () => {
    const { payload, docs } = createPayload()
    const req = {} as never

    await recordDriverLocationSample(payload as never, {
      orderId: 42,
      driverId: 'driver-1',
      latitude: 14,
      longitude: 121,
      providerUpdatedAt: '2026-07-18T10:00:00Z',
      observedAt: '2026-07-18T10:00:01Z',
    }, req)
    await recordDriverLocationSample(payload as never, {
      orderId: 42,
      driverId: 'driver-1',
      latitude: 14.00001,
      longitude: 121,
      providerUpdatedAt: '2026-07-18T10:00:10Z',
      observedAt: '2026-07-18T10:00:11Z',
    }, req)
    await recordDriverLocationSample(payload as never, {
      orderId: 42,
      driverId: 'driver-1',
      latitude: 14.0002,
      longitude: 121,
      providerUpdatedAt: '2026-07-18T10:00:20Z',
      observedAt: '2026-07-18T10:00:21Z',
    }, req)
    await recordDriverLocationSample(payload as never, {
      orderId: 42,
      driverId: 'driver-1',
      latitude: 14.0004,
      longitude: 121,
      providerUpdatedAt: '2026-07-18T10:00:15Z',
      observedAt: '2026-07-18T10:00:22Z',
    }, req)

    expect(docs).toHaveLength(2)
    expect(docs[1]).toMatchObject({
      order: 42,
      driver_id: 'driver-1',
      latitude: 14.0002,
      longitude: 121,
    })
  })

  it('uses server-observed time when Lalamove omits or returns an unparsable timestamp', async () => {
    const { payload, docs } = createPayload()
    const req = {} as never

    await recordDriverLocationSample(payload as never, {
      orderId: 42,
      driverId: 'driver-1',
      latitude: 14,
      longitude: 121,
      providerUpdatedAt: 'not-a-date',
      observedAt: '2026-07-18T10:00:01Z',
    }, req)
    await recordDriverLocationSample(payload as never, {
      orderId: 42,
      driverId: 'driver-1',
      latitude: 14.0002,
      longitude: 121,
      providerUpdatedAt: 'not-a-date',
      observedAt: '2026-07-18T10:00:11Z',
    }, req)

    expect(docs).toHaveLength(2)
  })
})

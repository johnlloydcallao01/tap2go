import { beforeEach, describe, expect, it, vi } from 'vitest'

const { broadcastUserNotification, broadcastUserOrderUpdate } = vi.hoisted(() => ({
  broadcastUserNotification: vi.fn(async () => undefined),
  broadcastUserOrderUpdate: vi.fn(async () => undefined),
}))

vi.mock('../../src/utils/supabaseNotifications', () => ({
  broadcastUserNotification,
  broadcastUserOrderUpdate,
}))

import {
  broadcastCustomerOrderUpdate,
  createCustomerDeliveryBookingNotification,
} from '../../src/utils/notificationFanout'

describe('customer delivery booking notification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('persists and broadcasts a generic booking-created notification to the order customer', async () => {
    const created: Array<{ collection: string; data: Record<string, unknown> }> = []
    const payload = {
      findByID: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'orders') return { customer: 8 }
        if (collection === 'customers') return { user: 99 }
        throw new Error(`Unexpected collection: ${collection}`)
      }),
      find: vi.fn(async () => ({ docs: [] })),
      create: vi.fn(async ({ collection, data }: { collection: string; data: Record<string, unknown> }) => {
        created.push({ collection, data })
        return { id: created.length, ...data }
      }),
    } as any

    await createCustomerDeliveryBookingNotification(payload, 17)

    expect(created).toEqual(expect.arrayContaining([
      expect.objectContaining({
        collection: 'notification-events',
        data: expect.objectContaining({
          typeKey: 'delivery.booking_created',
          idempotency_key: 'delivery.booking_created:17',
        }),
      }),
      expect.objectContaining({
        collection: 'user-notifications',
        data: expect.objectContaining({ user: 99 }),
      }),
    ]))
    expect(broadcastUserNotification).toHaveBeenCalledWith(
      99,
      expect.objectContaining({
        typeKey: 'delivery.booking_created',
        title: 'Lalamove booking created',
        metadata: undefined,
      }),
    )
  })

  it('does not create a notification when the order has no customer user', async () => {
    const payload = {
      findByID: vi.fn(async ({ collection }: { collection: string }) =>
        collection === 'orders' ? { customer: 8 } : { user: null }),
      find: vi.fn(),
      create: vi.fn(),
    } as any

    await expect(createCustomerDeliveryBookingNotification(payload, 17)).resolves.toBeNull()
    expect(payload.create).not.toHaveBeenCalled()
    expect(broadcastUserNotification).not.toHaveBeenCalled()
  })

  it('broadcasts only the owning customer order identifier for Realtime refresh', async () => {
    const payload = {
      findByID: vi.fn(async ({ collection }: { collection: string }) =>
        collection === 'orders' ? { customer: 8 } : { user: 99 }),
    } as any

    await broadcastCustomerOrderUpdate(payload, 17)

    expect(broadcastUserOrderUpdate).toHaveBeenCalledWith(99, 17)
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getOrderRealtimeChannelName } = vi.hoisted(() => ({
  getOrderRealtimeChannelName: vi.fn(),
}))

vi.mock('../../src/utils/supabaseNotifications', () => ({
  getOrderRealtimeChannelName,
}))

import { customerOrderRealtimeChannelHandler } from '../../src/endpoints/customerOrderRealtimeChannel'

describe('customer order Realtime channel endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('only returns a channel to an active authenticated customer', async () => {
    const channelName = `orders:${'a'.repeat(64)}`
    getOrderRealtimeChannelName.mockReturnValue(channelName)
    const response = await customerOrderRealtimeChannelHandler({
      user: { id: 17, role: 'customer', isActive: true },
    } as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      channelName,
    })
    expect(getOrderRealtimeChannelName).toHaveBeenCalledWith(17)
  })

  it('rejects unauthenticated and non-customer users', async () => {
    const unauthenticated = await customerOrderRealtimeChannelHandler({ user: null } as never)
    const merchant = await customerOrderRealtimeChannelHandler({
      user: { id: 18, role: 'merchant', isActive: true },
    } as never)

    expect(unauthenticated.status).toBe(401)
    expect(merchant.status).toBe(401)
    expect(getOrderRealtimeChannelName).not.toHaveBeenCalled()
  })

  it('reports an unavailable channel when the server key is missing', async () => {
    getOrderRealtimeChannelName.mockReturnValue(null)
    const response = await customerOrderRealtimeChannelHandler({
      user: { id: 17, role: 'customer', isActive: true },
    } as never)

    expect(response.status).toBe(503)
  })
})

import { describe, expect, it, vi } from 'vitest'
import { customerAppRatingHandler } from '../../src/endpoints/customerAppRating'

function createRequest(args: {
  method?: string
  user?: { id: number; role: string; isActive?: boolean } | null
  order?: Record<string, unknown> | null
  existingRating?: Record<string, unknown> | null
  body?: Record<string, unknown>
  query?: Record<string, string>
} = {}) {
  const payload = {
    find: vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === 'customers') return { docs: [{ id: 8 }] }
      if (collection === 'orders') return { docs: args.order ? [args.order] : [] }
      if (collection === 'app-ratings') return { docs: args.existingRating ? [args.existingRating] : [] }
      return { docs: [] }
    }),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
      id: 44,
      ...data,
      createdAt: '2026-11-09T00:00:00.000Z',
    })),
    update: vi.fn(async ({ id, data }: { id: number; data: Record<string, unknown> }) => ({
      id,
      order: 18,
      customer: 8,
      rating: 4,
      comment: null,
      createdAt: '2026-11-08T00:00:00.000Z',
      updatedAt: '2026-11-09T00:00:00.000Z',
      ...data,
    })),
  }
  const req = {
    method: args.method || 'POST',
    user: args.user === undefined ? { id: 99, role: 'service', isActive: true } : args.user,
    query: args.query || { orderId: '23', customerId: '12' },
    json: async () => args.body || { orderId: 23, customerId: 12, rating: 5, comment: 'Great app!' },
    payload,
  }
  return { req, payload }
}

describe('customer app rating', () => {
  it('accepts a rating only for the authenticated customer’s completed order', async () => {
    const { req, payload } = createRequest({
      order: { id: 23, status: 'delivered', fulfillment_type: 'pickup', customer: 8 },
    })

    const response = await customerAppRatingHandler(req as never)

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toMatchObject({
      id: 44,
      firstCompletedOrderId: 23,
      rating: 5,
      comment: 'Great app!',
    })
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'app-ratings',
      data: { order: 23, customer: 8, rating: 5, comment: 'Great app!' },
      overrideAccess: true,
    }))
  })

  it('rejects ratings for incomplete orders', async () => {
    const { req, payload } = createRequest({
      order: { id: 23, status: 'on_delivery', fulfillment_type: 'delivery', delivery_status: 'picked_up' },
    })

    const response = await customerAppRatingHandler(req as never)

    expect(response.status).toBe(409)
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('does not expose orders belonging to another customer', async () => {
    const { req, payload } = createRequest({
      order: null,
    })

    const response = await customerAppRatingHandler(req as never)

    expect(response.status).toBe(404)
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('requires a whole-number rating from one to five', async () => {
    const { req, payload } = createRequest({
      body: { orderId: 23, rating: 4.5, comment: 'Good' },
      order: { id: 23, status: 'delivered', fulfillment_type: 'pickup' },
    })

    const response = await customerAppRatingHandler(req as never)

    expect(response.status).toBe(400)
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('updates the customer’s current rating from another completed order', async () => {
    const { req, payload } = createRequest({
      order: { id: 23, status: 'delivered', fulfillment_type: 'pickup' },
      existingRating: {
        id: 44,
        order: 18,
        rating: 5,
        comment: 'Great app!',
      },
      body: { orderId: 23, customerId: 12, rating: 3, comment: 'Updated feedback' },
    })

    const response = await customerAppRatingHandler(req as never)

    expect(response.status).toBe(200)
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'app-ratings',
      id: 44,
      data: { rating: 3, comment: 'Updated feedback' },
    }))
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('recovers a concurrent first submission using the customer unique constraint', async () => {
    const { req, payload } = createRequest({
      order: { id: 23, status: 'delivered', fulfillment_type: 'pickup' },
    })
    payload.create.mockRejectedValue({ code: '23505' })
    payload.find.mockImplementation(async ({ collection }: { collection: string }) => {
      if (collection === 'customers') return { docs: [{ id: 8 }] }
      if (collection === 'orders') {
        return { docs: [{ id: 23, status: 'delivered', fulfillment_type: 'pickup' }] }
      }
      if (collection === 'app-ratings' && payload.create.mock.calls.length > 0) {
        return { docs: [{ id: 44, order: 18, rating: 4, comment: null }] }
      }
      return { docs: [] }
    })

    const response = await customerAppRatingHandler(req as never)

    expect(response.status).toBe(200)
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'app-ratings',
      id: 44,
      data: { rating: 5, comment: 'Great app!' },
    }))
  })

  it('returns a customer’s existing rating for an order', async () => {
    const { req } = createRequest({
      method: 'GET',
      query: { orderId: '23', customerId: '12' },
      order: { id: 23, status: 'delivered', fulfillment_type: 'pickup' },
      existingRating: {
        id: 44,
        order: 18,
        rating: 5,
        comment: 'Great app!',
        createdAt: '2026-11-09T00:00:00.000Z',
      },
    })

    const response = await customerAppRatingHandler(req as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      orderId: 23,
      eligible: true,
      submitted: true,
      firstCompletedOrderId: 18,
      rating: 5,
      comment: 'Great app!',
    })
  })
})

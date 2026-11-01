import { describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import { customerCartHandler } from '../../src/endpoints/customerCart'

describe('customerCartHandler', () => {
  it('returns all active cart items, including linked rows, and skips display-irrelevant modifier work', async () => {
    const docs = [{ id: 7, customer: 42, status: 'active' }]
    const find = vi.fn().mockResolvedValue({ docs, totalDocs: docs.length })
    const req = {
      headers: new Headers(),
      query: {},
      url: 'http://localhost/api/customer/cart?customerId=42',
      user: { role: 'service' },
      payload: { find },
    } as unknown as PayloadRequest

    const response = await customerCartHandler(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.docs).toEqual(docs)
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'cart-items',
        where: {
          and: [
            { customer: { equals: 42 } },
            { status: { equals: 'active' } },
          ],
        },
        depth: 3,
        limit: 200,
        context: {
          skipEffectiveModifierPreview: true,
          skipStoreHours: true,
        },
      }),
    )
  })

  it('rejects callers outside the service/admin roles', async () => {
    const find = vi.fn()
    const req = {
      headers: new Headers(),
      query: { customerId: '42' },
      url: 'http://localhost/api/customer/cart?customerId=42',
      user: { role: 'customer' },
      payload: { find },
    } as unknown as PayloadRequest

    const response = await customerCartHandler(req)

    expect(response.status).toBe(401)
    expect(find).not.toHaveBeenCalled()
  })
})

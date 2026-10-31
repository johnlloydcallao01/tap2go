import { describe, expect, it, vi } from 'vitest'
import { customerCartHandler } from '../../src/endpoints/customerCart'

function createRequest({
  role = 'service',
  customerId = '501',
}: {
  role?: string | null
  customerId?: string
} = {}) {
  const find = vi.fn().mockResolvedValue({
    docs: [{ id: 7, customer: 501, status: 'active' }],
    totalDocs: 1,
  })
  const req = {
    user: role ? { role } : null,
    url: `http://localhost/api/customer/cart?customerId=${customerId}`,
    query: { customerId },
    payload: { find },
  }
  return { req, find }
}

describe('customer cart endpoint', () => {
  it('requires authentication', async () => {
    const { req, find } = createRequest({ role: null })
    const response = await customerCartHandler(req as never)

    expect(response.status).toBe(401)
    expect(find).not.toHaveBeenCalled()
  })

  it('returns active cart items using the original display depth and skips read-only previews', async () => {
    const { req, find } = createRequest()
    const response = await customerCartHandler(req as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      docs: [{ id: 7, customer: 501, status: 'active' }],
      totalDocs: 1,
    })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'cart-items',
        where: {
          and: [
            { customer: { equals: 501 } },
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

  it('rejects callers without the service or admin role', async () => {
    const { req, find } = createRequest({ role: 'customer' })
    const response = await customerCartHandler(req as never)

    expect(response.status).toBe(403)
    expect(find).not.toHaveBeenCalled()
  })

  it('rejects invalid customer IDs', async () => {
    const { req, find } = createRequest({ customerId: 'invalid' })
    const response = await customerCartHandler(req as never)

    expect(response.status).toBe(400)
    expect(find).not.toHaveBeenCalled()
  })
})

import { APIError } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { customerCartAddHandler } from '../../src/endpoints/customerCartAdd'

const body = {
  customer: 42,
  merchant: 7,
  product: 11,
  merchantProduct: 19,
  quantity: 2,
  priceAtAdd: 125,
}

const hydratedDoc = {
  id: 123,
  ...body,
  merchant: { id: 7, outletName: 'Lukas Butter Steaks' },
}

function createRequest(payload: Record<string, unknown>) {
  return {
    user: { role: 'service' },
    json: vi.fn().mockResolvedValue(body),
    payload,
  }
}

describe('customerCartAddHandler', () => {
  it('returns a newly added cart item with populated relationships', async () => {
    const create = vi.fn().mockResolvedValue(hydratedDoc)
    const findByID = vi.fn()
    const req = createRequest({ create, findByID })

    const response = await customerCartAddHandler(req as never)

    expect(create).toHaveBeenCalledWith({
      collection: 'cart-items',
      data: body,
      depth: 3,
      context: {
        skipEffectiveModifierPreview: true,
        skipStoreHours: true,
      },
      overrideAccess: true,
      req,
    })
    expect(await response.json()).toEqual({ success: true, doc: hydratedDoc })
  })

  it('returns a merged cart item with populated relationships', async () => {
    const create = vi.fn().mockRejectedValue(new APIError('CART_ITEM_MERGED:123', 400, undefined, true))
    const findByID = vi.fn().mockResolvedValue(hydratedDoc)
    const req = createRequest({ create, findByID })

    const response = await customerCartAddHandler(req as never)

    expect(findByID).toHaveBeenCalledWith({
      collection: 'cart-items',
      id: 123,
      depth: 3,
      context: {
        skipEffectiveModifierPreview: true,
        skipStoreHours: true,
      },
      overrideAccess: true,
      req,
    })
    expect(await response.json()).toEqual({ success: true, doc: hydratedDoc, merged: true })
  })
})
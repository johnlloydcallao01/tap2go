import { describe, expect, it, vi } from 'vitest'
import { Orders } from '../../src/collections/Orders'

function getBeforeDeleteHook() {
  const hook = Orders.hooks?.beforeDelete?.[0]
  if (!hook) throw new Error('Orders beforeDelete hook is not configured')
  return hook
}

function createHookArgs(paymentDocs: unknown[] = []) {
  const payload = {
    find: vi.fn().mockResolvedValue({ docs: paymentDocs }),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  }

  return {
    payload,
    args: {
      id: 42,
      req: { payload } as never,
      collection: {} as never,
      context: {},
    },
  }
}

describe('order deletion cleanup', () => {
  it('removes checked-out cart rows from the active cart and deletes dependent records', async () => {
    const { payload, args } = createHookArgs()

    await getBeforeDeleteHook()(args)

    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'cart-items',
      where: { order_id: { equals: 42 } },
      data: {
        order_id: null,
        ordered_at: null,
        status: 'removed',
        deleted_at: expect.any(String),
      },
      overrideAccess: true,
      req: args.req,
    }))
    expect(payload.delete).toHaveBeenCalledTimes(11)
    expect(payload.delete).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'order-items',
      where: { order: { equals: 42 } },
      overrideAccess: true,
      req: args.req,
    }))
    expect(payload.delete).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'app-ratings',
      where: { order: { equals: 42 } },
      overrideAccess: true,
      req: args.req,
    }))
    expect(payload.delete).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'app-rating-history',
      where: { order: { equals: 42 } },
      overrideAccess: true,
      req: args.req,
    }))
  })

  it('refuses to delete an order with a paid or refunded transaction', async () => {
    const { payload, args } = createHookArgs([{ id: 12 }])

    await expect(getBeforeDeleteHook()(args)).rejects.toThrow(
      'Order #42 has a paid or refunded transaction and cannot be permanently deleted.',
    )
    expect(payload.update).not.toHaveBeenCalled()
    expect(payload.delete).not.toHaveBeenCalled()
  })
})

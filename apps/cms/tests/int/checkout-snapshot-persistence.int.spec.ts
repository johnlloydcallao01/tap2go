import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  assertCheckoutCartAvailable,
  CheckoutCartUnavailableError,
  persistCheckoutSnapshots,
} from '../../src/services/checkoutSnapshotPersistence'

vi.mock('../../src/utils/dashboardCache', () => ({
  bustOrderItemsCache: vi.fn().mockResolvedValue(undefined),
  bustOrdersCache: vi.fn().mockResolvedValue(undefined),
}))

afterEach(() => {
  vi.restoreAllMocks()
})

function createPayload(rows: Array<Record<string, unknown>>) {
  const execute = vi.fn().mockResolvedValue({ rows })
  return {
    payload: { db: { drizzle: { execute } } } as any,
    execute,
  }
}

const checkoutArgs = {
  requestId: 'checkout-test-request',
  orderId: 99,
  customerId: 5,
  merchantId: 7,
  cartItems: [{
    id: 21,
    product: 31,
    merchantProduct: 41,
    quantity: 2,
    priceAtAdd: 10,
    subtotal: 20,
    selectedVariation: null,
    selectedModifiers: [],
  }],
  delivery: {
    formattedAddress: 'Test address',
    latitude: 14.5,
    longitude: 121,
    street: null,
    floorUnitRoom: null,
    deliveryInstructions: null,
    notes: null,
    contactName: 'Test customer',
    contactPhone: null,
    label: 'home' as const,
  },
}

describe('checkout snapshot persistence', () => {
  it('rejects cart items already linked to an order before creating a new order', async () => {
    const { payload, execute } = createPayload([{ eligible_count: 0 }])

    await expect(assertCheckoutCartAvailable({
      payload,
      customerId: checkoutArgs.customerId,
      merchantId: checkoutArgs.merchantId,
      cartItems: checkoutArgs.cartItems,
    })).rejects.toBeInstanceOf(CheckoutCartUnavailableError)
    expect(execute).toHaveBeenCalledOnce()
  })

  it('writes the delivery snapshot, order items, and cart links as one validated operation', async () => {
    const { payload, execute } = createPayload([{
      delivery_count: 1,
      order_item_count: 1,
      cart_link_count: 1,
    }])

    await expect(persistCheckoutSnapshots({
      ...checkoutArgs,
      payload,
    })).resolves.toMatchObject({
      validationMs: expect.any(Number),
      writeMs: expect.any(Number),
    })
    expect(execute).toHaveBeenCalledOnce()
  })

  it('rejects a checkout if every active cart item was not linked', async () => {
    const { payload } = createPayload([{
      delivery_count: 0,
      order_item_count: 0,
      cart_link_count: 0,
    }])

    await expect(persistCheckoutSnapshots({
      ...checkoutArgs,
      payload,
    })).rejects.toThrow('Cart changed during checkout')
  })

  it('rejects duplicate cart item IDs before writing', async () => {
    const { payload, execute } = createPayload([])

    await expect(persistCheckoutSnapshots({
      ...checkoutArgs,
      payload,
      cartItems: [checkoutArgs.cartItems[0], checkoutArgs.cartItems[0]],
    })).rejects.toThrow('duplicate cart item IDs')
    expect(execute).not.toHaveBeenCalled()
  })

  it('rejects an empty cart before writing', async () => {
    const { payload, execute } = createPayload([])

    await expect(persistCheckoutSnapshots({
      ...checkoutArgs,
      payload,
      cartItems: [],
    })).rejects.toThrow('requires at least one cart item')
    expect(execute).not.toHaveBeenCalled()
  })
})

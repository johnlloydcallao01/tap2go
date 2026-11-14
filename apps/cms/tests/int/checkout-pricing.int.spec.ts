import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkoutContextHash, checkoutPrepareHandler } from '../../src/endpoints/checkoutPrepare'
import { Orders } from '../../src/collections/Orders'
import { CartItems } from '../../src/collections/CartItems'
import { ModifierResolverService, type EffectiveModifierGroup } from '../../src/services/ModifierResolverService'
import { CheckoutValidationError, priceCheckoutCart } from '../../src/services/checkoutPricing'
import {
  distanceInMeters,
  getFirstOrderFreeDeliveryPromotion,
} from '../../src/services/firstOrderDeliveryPromotion'
import { isMerchantOnVacation } from '../../src/utils/vacationMode'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

function createPayload(
  cartItems: any[],
  merchant: Record<string, unknown> = { id: 300, isActive: true, isAcceptingOrders: true },
  catalogOverrides: Record<string, Record<string, any>> = {},
) {
  const lookupCounts: Record<string, number> = {}
  const collections: Record<string, any[]> = {
    'cart-items': cartItems,
  }
  const docs: Record<string, Record<string, any>> = {
    merchants: { 300: merchant },
    products: {
      100: { id: 100, name: 'Burger', productType: 'simple', basePrice: 120 },
    },
    'merchant-products': {
      900: {
        id: 900,
        product_id: 100,
        merchant_id: 300,
        price_override: 90,
        stock_quantity: 20,
        is_active: true,
        is_available: true,
      },
    },
  }
  for (const [collection, records] of Object.entries(catalogOverrides)) {
    docs[collection] = { ...docs[collection], ...records }
  }

  return {
    find: async ({ collection }: { collection: string }) => ({
      docs: collections[collection] || [],
    }),
    findByID: async ({ collection, id }: { collection: string; id: number | string }) => {
      lookupCounts[collection] = (lookupCounts[collection] || 0) + 1
      const doc = docs[collection]?.[String(id)]
      if (!doc) throw new Error(`Unexpected lookup: ${collection} ${id}`)
      return doc
    },
    lookupCounts,
  }
}

const modifierGroups: EffectiveModifierGroup[] = [{
  id: 11,
  name: 'Cheese',
  selectionType: 'single',
  isRequired: false,
  minSelections: 0,
  maxSelections: 1,
  sortOrder: 0,
  source: 'product-base',
  options: [{
    id: 101,
    name: 'Extra cheese',
    priceAdjustment: 15,
    isDefault: false,
    isAvailable: true,
    sortOrder: 0,
    source: 'product-base',
  }],
}]

describe('checkout preparation', () => {
  it('allows checkout when tracked stock is below the requested quantity', async () => {
    const simplePayload = createPayload([{
      id: 1,
      customer: 5,
      merchant: 300,
      product: 100,
      merchantProduct: 900,
      quantity: 2,
      selectedModifiers: [],
      selectedAddons: [],
      status: 'active',
    }], undefined, {
      'merchant-products': {
        900: {
          product_id: 100,
          merchant_id: 300,
          price_override: 90,
          stock_quantity: 0,
          is_active: true,
          is_available: true,
        },
      },
    })

    await expect(priceCheckoutCart({
      payload: simplePayload as any,
      customerId: 5,
      merchantId: 300,
      cartItemIds: [1],
    })).resolves.toMatchObject({ subtotal: 180 })

    const variablePayload = createPayload([{
      id: 2,
      customer: 5,
      merchant: 300,
      product: 100,
      merchantProduct: 900,
      selectedVariation: 501,
      quantity: 2,
      selectedModifiers: [],
      selectedAddons: [],
      status: 'active',
    }], undefined, {
      products: {
        100: { id: 100, name: 'Burger', productType: 'variable', basePrice: 120 },
      },
      'merchant-products': {
        900: {
          product_id: 100,
          merchant_id: 300,
          price_override: 90,
          stock_quantity: 0,
          is_active: true,
          is_available: true,
        },
      },
      'prod-variations': {
        501: {
          id: 501,
          product_id: 100,
          name: 'Large',
          base_price: 130,
          stock_quantity: 0,
        },
      },
    })

    await expect(priceCheckoutCart({
      payload: variablePayload as any,
      customerId: 5,
      merchantId: 300,
      cartItemIds: [2],
    })).resolves.toMatchObject({ subtotal: 180 })
  })

  it('waives delivery and priority charges through the inclusive 5 km boundary for a new customer', async () => {
    const count = vi.fn().mockResolvedValue({ totalDocs: 0 })
    const promotion = await getFirstOrderFreeDeliveryPromotion({
      payload: { count } as any,
      customerId: 50,
      distance: { value: 5, unit: 'km' },
      deliveryFee: 80,
      priorityFee: 25,
    })

    expect(promotion).toEqual({ eligible: true, discount: 105, distanceMeters: 5000 })
    expect(count).toHaveBeenCalledOnce()
  })

  it('fails closed outside the limit or when the provider uses an unknown distance unit', async () => {
    const count = vi.fn()
    const payload = { count } as any

    await expect(getFirstOrderFreeDeliveryPromotion({
      payload,
      customerId: 50,
      distance: { value: 5001, unit: 'm' },
      deliveryFee: 80,
      priorityFee: 25,
    })).resolves.toEqual({ eligible: false, discount: 0, distanceMeters: 5001 })
    await expect(getFirstOrderFreeDeliveryPromotion({
      payload,
      customerId: 50,
      distance: { value: 4, unit: 'miles' },
      deliveryFee: 80,
      priorityFee: 25,
    })).resolves.toEqual({ eligible: false, discount: 0, distanceMeters: null })
    expect(count).not.toHaveBeenCalled()
    expect(distanceInMeters({ value: 1.5, unit: 'km' })).toBe(1500)
  })

  it('does not reapply the offer after a previous paid order', async () => {
    const count = vi.fn().mockResolvedValue({ totalDocs: 1 })

    await expect(getFirstOrderFreeDeliveryPromotion({
      payload: { count } as any,
      customerId: 50,
      distance: { value: 4000, unit: 'm' },
      deliveryFee: 80,
      priorityFee: 25,
    })).resolves.toEqual({ eligible: false, discount: 0, distanceMeters: 4000 })
    expect(count).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      where: expect.objectContaining({
        and: expect.arrayContaining([
          { status: { equals: 'paid' } },
          { 'order.customer': { equals: 50 } },
          {
            or: [
              { transaction_type: { not_equals: 'priority_fee' } },
              { transaction_type: { exists: false } },
            ],
          },
        ]),
      }),
    }))
  })

  it('blocks checkout while an outlet is in vacation mode', async () => {
    const payload = createPayload([{
      id: 1,
      customer: 5,
      merchant: 300,
      product: 100,
      merchantProduct: 900,
      quantity: 1,
      selectedModifiers: [],
      selectedAddons: [],
      status: 'active',
    }], {
      id: 300,
      isActive: true,
      isAcceptingOrders: true,
      vacationMode: true,
      vacationModeEndsAt: new Date(Date.now() + 60_000).toISOString(),
    })

    await expect(priceCheckoutCart({
      payload: payload as any,
      customerId: 5,
      merchantId: 300,
      cartItemIds: [1],
    })).rejects.toMatchObject<Partial<CheckoutValidationError>>({
      code: 'MERCHANT_UNAVAILABLE',
    })
  })

  it('uses catalog prices instead of client-submitted prices and resolves each modifier context once', async () => {
    const resolve = vi.spyOn(ModifierResolverService.prototype, 'resolveEffectiveGroups')
      .mockResolvedValue(modifierGroups)
    const payload = createPayload([
      {
        id: 1,
        customer: 5,
        merchant: 300,
        product: 100,
        merchantProduct: 900,
        quantity: 2,
        priceAtAdd: 1,
        subtotal: 2,
        selectedModifiers: [{ groupId: 11, optionId: 101, price: 9999 }],
        selectedAddons: [],
        status: 'active',
      },
      {
        id: 2,
        customer: 5,
        merchant: 300,
        product: 100,
        merchantProduct: 900,
        quantity: 3,
        priceAtAdd: 1,
        subtotal: 3,
        selectedModifiers: [{ groupId: 11, optionId: 101, price: 9999 }],
        selectedAddons: [],
        status: 'active',
      },
    ])

    const priced = await priceCheckoutCart({
      payload: payload as any,
      customerId: 5,
      merchantId: 300,
      cartItemIds: [1, 2],
    })

    expect(priced.lines.map(({ unitPrice, totalPrice }) => ({ unitPrice, totalPrice }))).toEqual([
      { unitPrice: 105, totalPrice: 210 },
      { unitPrice: 105, totalPrice: 315 },
    ])
    expect(priced.subtotal).toBe(525)
    expect(resolve).toHaveBeenCalledTimes(1)
    expect(payload.lookupCounts).toMatchObject({
      merchants: 1,
      products: 1,
      'merchant-products': 1,
    })
  })

  describe('merchant vacation mode', () => {
    it('stays active indefinitely or until its scheduled resume time', () => {
      const now = new Date('2026-11-09T12:00:00.000Z')

      expect(isMerchantOnVacation({ vacationMode: true }, now)).toBe(true)
      expect(isMerchantOnVacation({ vacationMode: true, vacationModeEndsAt: '2026-11-09T12:01:00.000Z' }, now)).toBe(true)
      expect(isMerchantOnVacation({ vacationMode: true, vacationModeEndsAt: '2026-11-09T12:00:00.000Z' }, now)).toBe(false)
      expect(isMerchantOnVacation({ vacationMode: false }, now)).toBe(false)
    })
  })

  it('rejects add-ons that do not have a server-managed price catalog', async () => {
    const payload = createPayload([{
      id: 1,
      customer: 5,
      merchant: 300,
      product: 100,
      merchantProduct: 900,
      quantity: 1,
      selectedAddons: [{ id: 'client-addon', price: 1 }],
      selectedModifiers: [],
      status: 'active',
    }])

    await expect(priceCheckoutCart({
      payload: payload as any,
      customerId: 5,
      merchantId: 300,
      cartItemIds: [1],
    })).rejects.toMatchObject<Partial<CheckoutValidationError>>({
      code: 'UNSUPPORTED_CLIENT_PRICED_ADDONS',
    })
  })

  it('requires customer authentication before touching checkout data', async () => {
    const response = await checkoutPrepareHandler({
      headers: new Headers(),
      user: null,
    } as any)

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({
      code: 'CUSTOMER_AUTH_REQUIRED',
    })
  })

  it('reuses a saved checkout on an idempotent retry', async () => {
    vi.stubEnv('PAYMONGO_SANDBOX', 'true')
    const cartItem = {
      id: 1,
      customer: 5,
      merchant: 300,
      product: 100,
      merchantProduct: 900,
      quantity: 1,
      selectedVariation: null,
      selectedModifiers: [],
      selectedAddons: [],
      status: 'ordered',
      order_id: 77,
    }
    const address = {
      id: 8,
      user: 50,
      formatted_address: '1 Test Street',
      latitude: 14.5,
      longitude: 121,
      coordinates: { lat: 14.5, lng: 121 },
    }
    const order = {
      id: 77,
      customer: 5,
      subtotal: 90,
      delivery_fee: 0,
      priority_fee: 0,
      total: 90,
      checkout_address_id: '8',
      checkout_context_hash: checkoutContextHash([cartItem], address),
    }
    const transaction = { id: 99, status: 'pending', payment_method: 'gcash', order: 77 }
    const update = vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      Object.assign(transaction, data)
      return transaction
    })
    const create = vi.fn()
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => ({
        docs: collection === 'customers'
          ? [{ id: 5 }]
          : collection === 'orders'
            ? [order]
            : collection === 'transactions'
              ? [transaction]
              : collection === 'order-items'
                ? [{ checkout_cart_item_id: '1', total_price: 90 }]
                : collection === 'cart-items'
                  ? [cartItem]
                  : [],
      })),
      findByID: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'addresses') return address
        throw new Error(`Unexpected lookup: ${collection}`)
      }),
      create,
      update,
      db: {
        beginTransaction: vi.fn().mockResolvedValue('local-tx'),
        commitTransaction: vi.fn().mockResolvedValue(undefined),
        rollbackTransaction: vi.fn().mockResolvedValue(undefined),
      },
    }
    const request = () => ({
      headers: new Headers({ 'x-request-id': 'checkout-retry-test' }),
      user: { id: 50, role: 'customer' },
      body: {
        merchantId: 300,
        addressId: 8,
        cartItemIds: [1],
        paymentMethod: 'gcash',
        expectedTotal: 90,
        idempotencyKey: 'checkout-attempt-00000001',
      },
      payload,
    })

    const first = await checkoutPrepareHandler(request() as any)
    const second = await checkoutPrepareHandler(request() as any)

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    await expect(second.json()).resolves.toMatchObject({
      data: { orderId: 77, payment: { sandbox: true, paid: true }, reused: true },
    })
    expect(create).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('rolls back checkout persistence before any provider call on a write failure', async () => {
    vi.stubEnv('PAYMONGO_SANDBOX', 'false')
    vi.stubEnv('PAYMONGO_SECRET_KEY_LIVE', 'sk_test_checkout_unit')
    vi.spyOn(ModifierResolverService.prototype, 'resolveEffectiveGroups').mockResolvedValue([])
    const cartItem = {
      id: 1,
      customer: 5,
      merchant: 300,
      product: 100,
      merchantProduct: 900,
      quantity: 1,
      selectedVariation: null,
      selectedModifiers: [],
      selectedAddons: [],
      status: 'active',
    }
    const address = {
      id: 8,
      user: 50,
      formatted_address: '1 Test Street',
      latitude: 14.5,
      longitude: 121,
      coordinates: { lat: 14.5, lng: 121 },
    }
    const create = vi.fn(async ({ collection }: { collection: string }) => {
      if (collection === 'orders') return { id: 77 }
      if (collection === 'order-items') return { id: 88 }
      if (collection === 'delivery-locations') return { id: 89 }
      throw new Error('transaction write failed')
    })
    const commitTransaction = vi.fn().mockResolvedValue(undefined)
    const rollbackTransaction = vi.fn().mockResolvedValue(undefined)
    const providerFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 'pi_unexpected' } }), { status: 200 }),
    )
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => ({
        docs: collection === 'customers'
          ? [{ id: 5 }]
          : collection === 'cart-items'
            ? [cartItem]
            : [],
      })),
      findByID: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'addresses') return address
        if (collection === 'merchants') return { id: 300, isActive: true, isAcceptingOrders: true }
        if (collection === 'products') return { id: 100, name: 'Burger', productType: 'simple', basePrice: 90 }
        if (collection === 'merchant-products') {
          return {
            id: 900,
            product_id: 100,
            merchant_id: 300,
            price_override: 90,
            stock_quantity: 10,
            is_active: true,
            is_available: true,
          }
        }
        throw new Error(`Unexpected lookup: ${collection}`)
      }),
      findGlobal: vi.fn().mockResolvedValue({ deliveryProvider: 'native' }),
      create,
      update: vi.fn().mockResolvedValue(cartItem),
      db: {
        beginTransaction: vi.fn().mockResolvedValue('local-tx'),
        commitTransaction,
        rollbackTransaction,
      },
    }
    const response = await checkoutPrepareHandler({
      headers: new Headers({ 'x-request-id': 'checkout-rollback-test' }),
      user: { id: 50, role: 'customer' },
      body: {
        merchantId: 300,
        addressId: 8,
        cartItemIds: [1],
        paymentMethod: 'gcash',
        expectedTotal: 90,
        idempotencyKey: 'checkout-attempt-00000002',
      },
      payload,
    } as any)

    expect(response.status).toBe(503)
    expect(commitTransaction).not.toHaveBeenCalled()
    expect(rollbackTransaction).toHaveBeenCalledWith('local-tx')
    expect(providerFetch).not.toHaveBeenCalled()
  })

  it('queues order-created notification work through Payload Jobs', async () => {
    const queue = vi.fn().mockResolvedValue(undefined)
    const req = { payload: { jobs: { queue } } }
    const hook = Orders.hooks?.afterChange?.[0]
    if (!hook) throw new Error('Orders afterChange hook is not configured')

    await hook({
      doc: { id: 123, status: 'pending' },
      previousDoc: undefined,
      operation: 'create',
      req,
    } as any)

    expect(queue).toHaveBeenCalledWith(expect.objectContaining({
      task: 'notification-fanout',
      input: { event: expect.objectContaining({ kind: 'order.created', orderId: '123' }) },
      req,
    }))
  })
})

describe('merchant vacation order guards', () => {
  const vacationMerchant = {
    id: 300,
    isActive: true,
    isAcceptingOrders: true,
    vacationMode: true,
    vacationModeEndsAt: new Date(Date.now() + 60_000).toISOString(),
  }

  it('rejects new cart items and quantity increases while preserving cart reductions', async () => {
    const beforeChange = CartItems.hooks?.beforeChange?.[0] as (args: any) => Promise<any>
    const findByID = vi.fn(async () => vacationMerchant)
    const req = { payload: { findByID } }

    await expect(beforeChange({
      data: { merchant: 300, product: 100, quantity: 1 },
      operation: 'create',
      originalDoc: undefined,
      req,
    })).rejects.toMatchObject({ status: 409, message: expect.stringContaining('vacation') })

    await expect(beforeChange({
      data: { quantity: 2 },
      operation: 'update',
      originalDoc: { merchant: 300, status: 'active', quantity: 1 },
      req,
    })).rejects.toMatchObject({ status: 409, message: expect.stringContaining('vacation') })

    const reduced = await beforeChange({
      data: { quantity: 1 },
      operation: 'update',
      originalDoc: { merchant: 300, status: 'active', quantity: 2, priceAtAdd: 10 },
      req,
    })
    expect(reduced.quantity).toBe(1)
    expect(findByID).toHaveBeenCalledTimes(2)
  })

  it('rejects direct new order creation during vacation but allows existing order updates', async () => {
    const beforeValidate = Orders.hooks?.beforeValidate?.[0] as (args: any) => Promise<any>
    const findByID = vi.fn(async () => vacationMerchant)
    const req = { payload: { findByID } }

    await expect(beforeValidate({
      data: { merchant: 300, total: 10, subtotal: 10 },
      operation: 'create',
      req,
    })).rejects.toMatchObject({ status: 409, message: expect.stringContaining('vacation') })

    const update = { status: 'accepted' }
    await expect(beforeValidate({ data: update, operation: 'update', req })).resolves.toBe(update)
    expect(findByID).toHaveBeenCalledTimes(1)
  })
})

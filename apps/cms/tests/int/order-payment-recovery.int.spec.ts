import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildOrderPaymentSummary,
  classifyPayMongoIntentStatus,
  isLatestFailedPaymentAttempt,
  isOrderOwnedByCustomer,
  isTerminalPaymentFailure,
} from '../../src/services/orderPaymentRecovery'
import {
  findLinkedPendingOrder,
} from '../../src/services/checkoutSnapshotPersistence'
import { checkoutPaymentResumeHandler } from '../../src/endpoints/checkoutPaymentResume'
import { paymongoWebhook } from '../../src/endpoints/paymongoWebhook'

describe('pending order payment recovery', () => {
  beforeEach(() => {
    vi.stubEnv('PAYMONGO_SANDBOX', 'false')
    vi.stubEnv('PAYMONGO_SECRET_KEY_LIVE', 'test_secret')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('only treats provider retryable and canceled states as terminal failures', () => {
    expect(isTerminalPaymentFailure('awaiting_payment_method')).toBe(true)
    expect(isTerminalPaymentFailure('canceled')).toBe(true)
    expect(isTerminalPaymentFailure('awaiting_next_action')).toBe(false)
    expect(isTerminalPaymentFailure('succeeded')).toBe(false)
  })

  it('does not let an old failure event release the cart for a newer attempt', () => {
    expect(isLatestFailedPaymentAttempt({ id: 20, status: 'failed' }, 20)).toBe(true)
    expect(isLatestFailedPaymentAttempt({ id: 21, status: 'pending' }, 20)).toBe(false)
  })

  it('classifies existing intent states without assuming an active action can be reattached', () => {
    expect(classifyPayMongoIntentStatus('awaiting_next_action')).toBe('action_required')
    expect(classifyPayMongoIntentStatus('awaiting_payment_method')).toBe('retryable')
    expect(classifyPayMongoIntentStatus('succeeded')).toBe('processing')
    expect(classifyPayMongoIntentStatus('canceled')).toBe('terminal')
    expect(classifyPayMongoIntentStatus('unknown')).toBe('unknown')
  })

  it('validates that the order belongs to the requested customer user', () => {
    const order = { customer: { user: { id: 21 } } }
    expect(isOrderOwnedByCustomer(order, 21)).toBe(true)
    expect(isOrderOwnedByCustomer(order, 22)).toBe(false)
    expect(isOrderOwnedByCustomer({ customer: { user: 21 } }, 21)).toBe(true)
  })

  it('rejects another customer before retrieving the provider intent', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const response = await checkoutPaymentResumeHandler(createResumeRequest({
      customerId: 99,
    }) as any)

    expect(response.status).toBe(404)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns the original QR action without attaching another payment method', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: {
        status: 'awaiting_next_action',
        next_action: { code: { image_url: 'data:image/png;base64,qr' } },
      },
    })))
    const response = await checkoutPaymentResumeHandler(createResumeRequest() as any)

    await expect(response.json()).resolves.toMatchObject({
      state: 'qr',
      orderId: '17',
      paymentIntentId: 'pi_existing',
      qrImage: 'data:image/png;base64,qr',
    })
  })

  it('offers same-intent retry only when PayMongo is awaiting a payment method', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: { status: 'awaiting_payment_method', client_key: 'pi_existing_secret_key' },
    })))
    const response = await checkoutPaymentResumeHandler(createResumeRequest() as any)

    await expect(response.json()).resolves.toMatchObject({
      state: 'retry',
      paymentIntentId: 'pi_existing',
      clientKey: 'pi_existing_secret_key',
      paymentMethod: 'qrph',
    })
  })

  it('creates a replacement intent on the same order only after the prior attempt is failed and terminal', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_existing',
        attributes: { status: 'awaiting_payment_method' },
      }))
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_replacement',
        attributes: { client_key: 'pi_replacement_secret_key' },
      }))
    vi.stubGlobal('fetch', fetch)
    const request = createResumeRequest({ transactionStatus: 'failed' })
    const response = await checkoutPaymentResumeHandler(request as any)

    await expect(response.json()).resolves.toMatchObject({
      state: 'retry',
      orderId: '17',
      transactionId: '21',
      paymentIntentId: 'pi_replacement',
      clientKey: 'pi_replacement_secret_key',
    })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(request.payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      data: expect.objectContaining({
        order: 17,
        payment_intent_id: 'pi_replacement',
        status: 'pending',
      }),
    }))
    expect(request.payload.update).not.toHaveBeenCalledWith(expect.objectContaining({
      collection: 'cart-items',
    }))
  })

  it('keeps checked-out cart items linked to the pending order after payment failure', async () => {
    vi.stubEnv('PAYMONGO_SECRET_KEY_LIVE', 'test_secret')
    vi.stubEnv('PAYMONGO_WEBHOOK_SECRET', '')
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      attributes: { status: 'canceled' },
    })))

    const transaction = {
      id: 20,
      order: 17,
      status: 'pending',
      payment_intent_id: 'pi_existing',
    }
    const payload = {
      find: vi.fn(async () => ({ docs: [transaction] })),
      update: vi.fn(async () => transaction),
    }
    const req = {
      headers: new Headers(),
      text: async () => JSON.stringify({
        data: {
          attributes: {
            type: 'payment.failed',
            data: {
              id: 'pay_1',
              attributes: { payment_intent_id: 'pi_existing' },
            },
          },
        },
      }),
      payload,
    }

    const response = await paymongoWebhook(req as any)

    expect(response.status).toBe(200)
    expect(payload.update).toHaveBeenCalledTimes(1)
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      id: 20,
      data: { status: 'failed' },
    }))
    expect(payload.update).not.toHaveBeenCalledWith(expect.objectContaining({
      collection: 'cart-items',
    }))
  })

  it('does not present a provider-succeeded intent as paid before webhook confirmation', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: { status: 'succeeded' },
    })))
    const response = await checkoutPaymentResumeHandler(createResumeRequest() as any)

    await expect(response.json()).resolves.toMatchObject({
      state: 'processing',
      orderId: '17',
    })
  })

  it('exposes unpaid pending and failed transactions as resumable, but never paid orders', () => {
    expect(buildOrderPaymentSummary('pending', [
      { status: 'pending', payment_method: 'qrph' },
    ])).toEqual({
      isPaid: false,
      paymentStatus: 'pending',
      paymentMethod: 'qrph',
      canResumePayment: true,
    })

    expect(buildOrderPaymentSummary('pending', [
      { status: 'failed', payment_method: 'gcash' },
    ])).toEqual({
      isPaid: false,
      paymentStatus: 'failed',
      paymentMethod: 'gcash',
      canResumePayment: true,
    })
    expect(buildOrderPaymentSummary('pending', [
      { status: 'paid', payment_method: 'qrph' },
      { status: 'pending', payment_method: 'qrph' },
    ]).canResumePayment).toBe(false)
  })

  it('resolves a cart already linked to its pending order instead of opening another order', async () => {
    const collections: Record<string, any[]> = {
      'cart-items': [{ id: 9, order_id: 17 }],
      transactions: [{ id: 20, order: 17, status: 'pending' }],
    }
    const order = { id: 17, customer: 2, merchant: 3, status: 'pending' }
    const payload = {
      find: async ({ collection }: { collection: string }) => ({
        docs: collections[collection] || [],
      }),
      findByID: async () => order,
    }

    await expect(findLinkedPendingOrder({
      payload: payload as any,
      customerId: 2,
      merchantId: 3,
      cartItems: [{ id: 9 }],
    })).resolves.toBe(17)

    order.status = 'accepted'
    await expect(findLinkedPendingOrder({
      payload: payload as any,
      customerId: 2,
      merchantId: 3,
      cartItems: [{ id: 9 }],
    })).resolves.toBeNull()
  })

  it('does not reuse a pending order for a new cart row with the same product snapshot', async () => {
    const payload = {
      find: vi.fn(async () => ({ docs: [] })),
    }

    await expect(findLinkedPendingOrder({
      payload: payload as any,
      customerId: 2,
      merchantId: 3,
      cartItems: [{
        id: 10,
        product: 4,
        merchantProduct: 5,
        quantity: 2,
        priceAtAdd: 10,
        subtotal: 20,
      }],
    })).resolves.toBeNull()
    expect(payload.find).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'cart-items',
      where: expect.objectContaining({
        and: expect.arrayContaining([
          { id: { in: [10] } },
        ]),
      }),
    }))
  })
})

function createResumeRequest(options: {
  customerId?: number
  transactionStatus?: string
} = {}) {
  const transaction = {
    id: 20,
    order: 17,
    status: options.transactionStatus || 'pending',
    payment_intent_id: 'pi_existing',
    payment_method: 'qrph',
    amount: 125,
    currency: 'PHP',
  }
  const order = {
    id: 17,
    customer: { id: 2, user: { id: 42 } },
    merchant: { id: 3, outletName: 'Test Merchant' },
    status: 'pending',
    total: 125,
  }
  return {
    user: { id: 1, role: 'service' },
    json: async () => ({ orderId: 17, customerId: options.customerId || 42 }),
    payload: {
      findByID: async () => order,
      find: async ({ where }: any) => ({
        docs: JSON.stringify(where).includes('"equals":"paid"') ? [] : [transaction],
      }),
      update: vi.fn(async () => transaction),
      create: vi.fn(async () => ({ id: 21 })),
    },
  }
}

function providerResponse(data: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 400,
    json: async () => ({ data }),
  } as Response
}

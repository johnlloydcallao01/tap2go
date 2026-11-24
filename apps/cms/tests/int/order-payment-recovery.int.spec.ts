import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import crypto from 'crypto'
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
import { ensureCheckoutPayment } from '../../src/endpoints/checkoutPrepare'
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
    expect(classifyPayMongoIntentStatus('cancelled')).toBe('terminal')
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
      role: 'customer',
      userId: 99,
    }) as any)

    expect(response.status).toBe(404)
    expect(fetch).not.toHaveBeenCalled()
  })

  it.each([
    ['omitted', null],
    ['mismatched', 99],
  ])('uses the authenticated user when the client customer ID is %s', async (_label, customerId) => {
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: { status: 'awaiting_payment_method' },
    })))
    const request = createResumeRequest({
      role: 'customer',
      userId: 42,
      customerId,
    })

    const response = await checkoutPaymentResumeHandler(request as any)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ state: 'choose_method' })
  })

  it('allows the authenticated customer to access their own retry checkout', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: { status: 'awaiting_payment_method' },
    })))
    const request = createResumeRequest({ role: 'customer', userId: 42 })

    const response = await checkoutPaymentResumeHandler(request as any)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ state: 'choose_method' })
  })

  it('reconciles only the authenticated customer’s exact successful intent and transaction', async () => {
    const request = createReconcileRequest()
    const fetch = vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: { status: 'succeeded', amount: 12500, currency: 'PHP' },
    }))
    vi.stubGlobal('fetch', fetch)

    const response = await checkoutPaymentResumeHandler(request as any)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      state: 'paid',
      orderId: '17',
      paymentIntentId: 'pi_existing',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toBe('https://api.paymongo.com/v1/payment_intents/pi_existing')
    expect(fetch.mock.calls[0][1].method).toBeUndefined()
    expect(request.payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      id: 20,
      data: expect.objectContaining({ status: 'paid' }),
    }))
    expect(request.payload.db.commitTransaction).toHaveBeenCalledTimes(1)
    expect(request.payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'delivery-fulfillment-outbox',
      data: { order: 17, status: 'pending', attempt_count: 0 },
    }))
  })

  it('resolves the unique existing transaction when the customer provides its order and intent', async () => {
    const request = createReconcileRequest({ omitTransactionId: true })
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: { status: 'succeeded', amount: 12500, currency: 'PHP' },
    })))

    const response = await checkoutPaymentResumeHandler(request as any)

    expect(response.status).toBe(200)
    expect(request.payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      id: 20,
      data: expect.objectContaining({ status: 'paid' }),
    }))
  })

  it('rejects reconciliation for a different authenticated customer before provider lookup', async () => {
    const request = createReconcileRequest({ userId: 43 })
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const response = await checkoutPaymentResumeHandler(request as any)

    expect(response.status).toBe(401)
    expect(fetch).not.toHaveBeenCalled()
    expect(request.payload.update).not.toHaveBeenCalled()
  })

  it.each([
    ['not succeeded', { status: 'awaiting_next_action', amount: 12500, currency: 'PHP' }],
    ['amount mismatch', { status: 'succeeded', amount: 12499, currency: 'PHP' }],
    ['currency mismatch', { status: 'succeeded', amount: 12500, currency: 'USD' }],
  ])('does not reconcile a PayMongo intent with %s', async (_label, attributes) => {
    const request = createReconcileRequest()
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes,
    })))

    const response = await checkoutPaymentResumeHandler(request as any)

    expect(response.status).toBe(409)
    expect(request.payload.db.beginTransaction).not.toHaveBeenCalled()
    expect(request.payload.update).not.toHaveBeenCalled()
    expect(request.payload.create).not.toHaveBeenCalled()
  })

  it('requires the requested transaction ID to match the order and intent', async () => {
    const request = createReconcileRequest({ transactionId: '999' })
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const response = await checkoutPaymentResumeHandler(request as any)

    expect(response.status).toBe(404)
    expect(request.payload.find).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      where: expect.objectContaining({
        and: expect.arrayContaining([
          { id: { equals: '999' } },
          { order: { equals: 17 } },
          { payment_intent_id: { equals: 'pi_existing' } },
        ]),
      }),
    }))
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects a successful intent whose amount no longer matches the order total', async () => {
    const request = createReconcileRequest({ orderTotal: 126 })
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: { status: 'succeeded', amount: 12500, currency: 'PHP' },
    })))

    const response = await checkoutPaymentResumeHandler(request as any)

    expect(response.status).toBe(409)
    expect(request.payload.db.beginTransaction).not.toHaveBeenCalled()
    expect(request.payload.update).not.toHaveBeenCalled()
  })

  it('does not reconcile when an intent maps to multiple transactions for the order', async () => {
    const request = createReconcileRequest({
      omitTransactionId: true,
      ambiguousTransactions: true,
    })
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    const response = await checkoutPaymentResumeHandler(request as any)

    expect(response.status).toBe(409)
    expect(fetch).not.toHaveBeenCalled()
    expect(request.payload.db.beginTransaction).not.toHaveBeenCalled()
  })

  it('repeats paid reconciliation without creating a duplicate delivery outbox', async () => {
    const request = createReconcileRequest()
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: { status: 'succeeded', amount: 12500, currency: 'PHP' },
    })))

    const first = await checkoutPaymentResumeHandler(request as any)
    const second = await checkoutPaymentResumeHandler(request as any)

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(request.payload.create).toHaveBeenCalledTimes(1)
    expect(request.payload.db.commitTransaction).toHaveBeenCalledTimes(2)
  })

  it('rolls back paid reconciliation if delivery outbox persistence fails', async () => {
    const request = createReconcileRequest()
    request.payload.create.mockRejectedValue(new Error('outbox write failed'))
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: { status: 'succeeded', amount: 12500, currency: 'PHP' },
    })))

    const response = await checkoutPaymentResumeHandler(request as any)

    expect(response.status).toBe(500)
    expect(request.payload.db.rollbackTransaction).toHaveBeenCalledTimes(1)
    expect(request.payload.db.commitTransaction).not.toHaveBeenCalled()
  })

  it('ensures a delivery outbox when checkout reuses an already-paid transaction', async () => {
    const outboxes: any[] = []
    const req = {
      payload: {
        find: vi.fn(async () => ({ docs: [...outboxes] })),
        create: vi.fn(async ({ data }: any) => {
          const outbox = { id: 40, ...data }
          outboxes.push(outbox)
          return outbox
        }),
        update: vi.fn(async () => undefined),
      },
    }
    const args = {
      req: req as any,
      order: { id: 17, status: 'pending', fulfillment_type: 'delivery' },
      transaction: { id: 20, status: 'paid' },
      idempotencyKey: 'checkout-idempotency-key',
      paymentMethod: 'qrph',
      requestId: 'request-1',
    }

    await ensureCheckoutPayment(args)
    await ensureCheckoutPayment(args)

    expect(req.payload.create).toHaveBeenCalledTimes(1)
    expect(req.payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'delivery-fulfillment-outbox',
      data: { order: 17, status: 'pending', attempt_count: 0 },
    }))
  })

  it('offers method selection instead of reopening an active QR payment action', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: {
        status: 'awaiting_next_action',
        next_action: { code: { image_url: 'data:image/png;base64,qr' } },
      },
    })))
    const response = await checkoutPaymentResumeHandler(createResumeRequest() as any)

    await expect(response.json()).resolves.toMatchObject({
      state: 'choose_method',
      orderId: '17',
      previousPaymentMethod: 'qrph',
    })
  })

  it('asks the customer to choose a method when PayMongo allows a retry', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: { status: 'awaiting_payment_method', client_key: 'pi_existing_secret_key' },
    })))
    const response = await checkoutPaymentResumeHandler(createResumeRequest() as any)

    await expect(response.json()).resolves.toMatchObject({
      state: 'choose_method',
      orderId: '17',
      previousPaymentMethod: 'qrph',
    })
  })

  it('creates a fresh intent with the selected method after a retryable attempt', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_existing',
        attributes: { status: 'awaiting_payment_method' },
      }))
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_replacement',
        attributes: {
          client_key: 'pi_replacement_secret_key',
          amount: 12500,
          currency: 'PHP',
        },
      }))
    vi.stubGlobal('fetch', fetch)
    const request = createResumeRequest({
      transactionStatus: 'failed',
      paymentMethod: 'dob',
      bankCode: 'bpi',
    })
    const response = await checkoutPaymentResumeHandler(request as any)

    await expect(response.json()).resolves.toMatchObject({
      state: 'retry',
      orderId: '17',
      transactionId: '21',
      paymentIntentId: 'pi_replacement',
      clientKey: 'pi_replacement_secret_key',
    })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({
      data: {
        attributes: {
          amount: 12500,
          payment_method_allowed: ['card', 'gcash', 'grab_pay', 'paymaya', 'billease', 'dob', 'brankas', 'qrph'],
          payment_method_options: { card: { request_three_d_secure: 'any' } },
          statement_descriptor: 'TAP2GO',
          metadata: {
            orderId: '17',
            payment_recovery: 'true',
            payment_recovery_attempt_id: 'retry-attempt-1',
          },
        },
      },
    })
    expect(fetch.mock.calls[1][1].headers['Idempotency-Key']).toMatch(/^[a-f0-9]{64}$/)
    expect(request.payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      data: expect.objectContaining({
        order: 17,
        payment_intent_id: 'pi_replacement',
        payment_method: 'dob',
        status: 'pending',
      }),
    }))
    expect(request.payload.update).not.toHaveBeenCalledWith(expect.objectContaining({
      collection: 'cart-items',
    }))
  })

  it('reuses the fresh recovery intent for a repeated retry request', async () => {
    const fetch = vi.fn(async () => providerResponse({
      id: 'pi_replacement',
      attributes: {
        status: 'awaiting_payment_method',
        client_key: 'pi_replacement_secret_key',
        amount: 12500,
        currency: 'PHP',
        metadata: {
          payment_recovery: 'true',
          payment_recovery_attempt_id: 'retry-attempt-1',
        },
      },
    }))
    vi.stubGlobal('fetch', fetch)
    const request = createResumeRequest({
      transactionStatus: 'pending',
      transactionPaymentMethod: 'gcash',
      paymentIntentId: 'pi_replacement',
      paymentMethod: 'gcash',
    })
    const response = await checkoutPaymentResumeHandler(request as any)

    await expect(response.json()).resolves.toMatchObject({
      state: 'retry',
      transactionId: '20',
      paymentIntentId: 'pi_replacement',
      paymentMethod: 'gcash',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(request.payload.create).not.toHaveBeenCalled()
  })

  it('creates a new recovery intent when the customer starts another checkout retry', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_previous_retry',
        attributes: {
          status: 'awaiting_payment_method',
          client_key: 'pi_previous_retry_secret_key',
          amount: 12500,
          currency: 'PHP',
          metadata: {
            payment_recovery: 'true',
            payment_recovery_attempt_id: 'retry-attempt-1',
          },
        },
      }))
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_new_retry',
        attributes: {
          client_key: 'pi_new_retry_secret_key',
          amount: 12500,
          currency: 'PHP',
        },
      }))
    vi.stubGlobal('fetch', fetch)
    const request = createResumeRequest({
      transactionStatus: 'pending',
      transactionPaymentMethod: 'gcash',
      paymentIntentId: 'pi_previous_retry',
      paymentMethod: 'gcash',
      retryAttemptId: 'retry-attempt-2',
    })

    const response = await checkoutPaymentResumeHandler(request as any)

    await expect(response.json()).resolves.toMatchObject({
      state: 'retry',
      paymentIntentId: 'pi_new_retry',
    })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(request.payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      id: 20,
      data: { status: 'failed' },
    }))
  })

  it('rejects invalid bank codes before creating a replacement intent', async () => {
    const fetch = vi.fn(async () => providerResponse({
      id: 'pi_existing',
      attributes: { status: 'awaiting_payment_method' },
    }))
    vi.stubGlobal('fetch', fetch)
    const response = await checkoutPaymentResumeHandler(createResumeRequest({
      paymentMethod: 'dob',
      bankCode: 'bdo',
    }) as any)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Select a valid bank for this payment method.',
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('cancels the active intent before creating a fresh attempt with the selected method', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_existing',
        attributes: {
          status: 'awaiting_next_action',
          next_action: { redirect: { url: 'https://paymongo.example/continue' } },
        },
      }))
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_existing',
        attributes: { status: 'cancelled' },
      }))
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_replacement',
        attributes: {
          client_key: 'pi_replacement_secret_key',
          amount: 12500,
          currency: 'PHP',
        },
      }))
    vi.stubGlobal('fetch', fetch)
    const request = createResumeRequest({
      paymentMethod: 'gcash',
    })
    const response = await checkoutPaymentResumeHandler(request as any)

    await expect(response.json()).resolves.toMatchObject({
      state: 'retry',
      transactionId: '21',
      paymentIntentId: 'pi_replacement',
      paymentMethod: 'gcash',
    })
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch.mock.calls[1][0]).toBe('https://api.paymongo.com/v1/payment_intents/pi_existing/cancel')
    expect(fetch.mock.calls[1][1].method).toBe('POST')
    expect(fetch.mock.calls[1][1].body).toBeUndefined()
    expect(request.payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      id: 20,
      data: { status: 'failed' },
    }))
    expect(response.status).toBe(200)
  })

  it('retries a transient PayMongo lock and starts a fresh attempt after cancellation', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_existing',
        attributes: { status: 'awaiting_next_action' },
      }))
      .mockResolvedValueOnce(providerResponse({
        errors: [{ code: 'resource_locked', detail: 'Payment is temporarily locked.' }],
      }, false, 409))
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_existing',
        attributes: { status: 'awaiting_next_action' },
      }))
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_existing',
        attributes: { status: 'cancelled' },
      }))
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_replacement',
        attributes: {
          client_key: 'pi_replacement_secret_key',
          amount: 12500,
          currency: 'PHP',
        },
      }))
    vi.stubGlobal('fetch', fetch)
    const request = createResumeRequest({ paymentMethod: 'gcash' })
    const response = await checkoutPaymentResumeHandler(request as any)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      state: 'retry',
      paymentIntentId: 'pi_replacement',
    })
    expect(fetch).toHaveBeenCalledTimes(5)
    expect(fetch.mock.calls[3][0]).toBe('https://api.paymongo.com/v1/payment_intents/pi_existing/cancel')
  })

  it('does not create a new intent while PayMongo keeps the previous attempt locked', async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_existing',
        attributes: { status: 'awaiting_next_action' },
      }))
      .mockResolvedValueOnce(providerResponse({
        errors: [{ code: 'resource_locked', detail: 'Payment is still locked.' }],
      }, false, 409))
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_existing',
        attributes: { status: 'awaiting_next_action' },
      }))
      .mockResolvedValueOnce(providerResponse({
        errors: [{ code: 'resource_locked', detail: 'Payment is still locked.' }],
      }, false, 409))
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_existing',
        attributes: { status: 'awaiting_next_action' },
      }))
      .mockResolvedValueOnce(providerResponse({
        errors: [{ code: 'resource_locked', detail: 'Payment is still locked.' }],
      }, false, 409))
      .mockResolvedValueOnce(providerResponse({
        id: 'pi_existing',
        attributes: { status: 'awaiting_next_action' },
      }))
    vi.stubGlobal('fetch', fetch)
    const request = createResumeRequest({ paymentMethod: 'gcash' })
    const response = await checkoutPaymentResumeHandler(request as any)

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({
      state: 'unavailable',
      code: 'PREVIOUS_PAYMENT_STILL_ACTIVE',
      providerErrorCode: 'resource_locked',
      previousPaymentStatus: 'awaiting_next_action',
    })
    expect(fetch).toHaveBeenCalledTimes(7)
    expect(request.payload.create).not.toHaveBeenCalled()
  })

  it('keeps checked-out cart items linked to the pending order after payment failure', async () => {
    vi.stubEnv('PAYMONGO_SECRET_KEY_LIVE', 'test_secret')
    const webhookSecret = 'test_webhook_secret'
    vi.stubEnv('PAYMONGO_WEBHOOK_SECRET', webhookSecret)
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
    const rawBody = JSON.stringify({
        data: {
          attributes: {
            type: 'payment.failed',
            data: {
              id: 'pay_1',
              attributes: { payment_intent_id: 'pi_existing' },
            },
          },
        },
      })
    const timestamp = String(Math.floor(Date.now() / 1000))
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex')
    const req = {
      headers: new Headers({
        'paymongo-signature': `t=${timestamp},li=${signature}`,
      }),
      text: async () => rawBody,
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

  it('does not process a webhook when the signing secret is missing', async () => {
    vi.stubEnv('PAYMONGO_WEBHOOK_SECRET', '')
    const payload = {
      find: vi.fn(),
      update: vi.fn(),
    }
    const req = {
      headers: new Headers(),
      text: async () => JSON.stringify({
        data: { attributes: { type: 'payment.failed', data: { id: 'pay_1' } } },
      }),
      payload,
    }

    const response = await paymongoWebhook(req as any)

    expect(response.status).toBe(503)
    expect(payload.find).not.toHaveBeenCalled()
    expect(payload.update).not.toHaveBeenCalled()
  })

  it('commits paid delivery state and its unique fulfillment request together', async () => {
    const webhookSecret = 'test_webhook_secret'
    vi.stubEnv('PAYMONGO_WEBHOOK_SECRET', webhookSecret)
    const transaction = {
      id: 20,
      order: 17,
      status: 'pending',
      transaction_type: 'order',
      amount: 100,
      currency: 'PHP',
      payment_intent_id: 'pi_paid',
    }
    const order = { id: 17, status: 'pending', fulfillment_type: 'delivery' }
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => ({
        docs: collection === 'transactions' ? [transaction] : [],
      })),
      findByID: vi.fn(async () => order),
      create: vi.fn(async ({ collection, data }: { collection: string; data: object }) => ({
        id: collection === 'delivery-fulfillment-outbox' ? 40 : 41,
        ...data,
      })),
      update: vi.fn(async () => transaction),
      db: {
        beginTransaction: vi.fn(async () => 'payment-tx'),
        commitTransaction: vi.fn(async () => undefined),
        rollbackTransaction: vi.fn(async () => undefined),
      },
    }
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      attributes: { status: 'succeeded', amount: 10000, currency: 'PHP' },
    })))
    const rawBody = JSON.stringify({
      data: {
        attributes: {
          type: 'payment.paid',
          data: {
            id: 'pay_1',
            attributes: { payment_intent_id: 'pi_paid', paid_at: 1700000000 },
          },
        },
      },
    })
    const timestamp = String(Math.floor(Date.now() / 1000))
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${timestamp}.${rawBody}`)
      .digest('hex')
    const req = {
      headers: new Headers({ 'paymongo-signature': `t=${timestamp},li=${signature}` }),
      text: async () => rawBody,
      payload,
      transactionID: undefined,
    }

    const response = await paymongoWebhook(req as any)

    expect(response.status).toBe(200)
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'delivery-fulfillment-outbox',
      data: { order: 17, status: 'pending', attempt_count: 0 },
    }))
    expect(payload.db.commitTransaction).toHaveBeenCalledWith('payment-tx')
    expect(payload.db.rollbackTransaction).not.toHaveBeenCalled()
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
  customerId?: number | null
  role?: string
  userId?: number
  transactionStatus?: string
  paymentMethod?: string
  bankCode?: string
  retryAttemptId?: string
  transactionPaymentMethod?: string
  paymentIntentId?: string
} = {}) {
  const transaction = {
    id: 20,
    order: 17,
    status: options.transactionStatus || 'pending',
    payment_intent_id: options.paymentIntentId || 'pi_existing',
    payment_method: options.transactionPaymentMethod || 'qrph',
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
    user: { id: options.userId ?? 1, role: options.role || 'service' },
    json: async () => ({
      orderId: 17,
      ...(options.customerId === null ? {} : { customerId: options.customerId || 42 }),
      ...(options.paymentMethod ? { paymentMethod: options.paymentMethod } : {}),
      ...(options.bankCode ? { bankCode: options.bankCode } : {}),
      ...(options.paymentMethod && {
        retryAttemptId: options.retryAttemptId || 'retry-attempt-1',
      }),
    }),
    payload: {
      findByID: async () => order,
      find: async ({ where }: any) => {
        const whereString = JSON.stringify(where)
        if (whereString.includes('"equals":"paid"')) return { docs: [] }
        const requestedIntent = where?.and?.find((filter: any) => filter.payment_intent_id)?.payment_intent_id?.equals
        if (requestedIntent && requestedIntent !== transaction.payment_intent_id) return { docs: [] }
        return { docs: [transaction] }
      },
      update: vi.fn(async () => transaction),
      create: vi.fn(async () => ({ id: 21 })),
    },
  }
}

function createReconcileRequest(options: {
  userId?: number
  transactionId?: string
  orderTotal?: number
  omitTransactionId?: boolean
  ambiguousTransactions?: boolean
} = {}) {
  const transaction = {
    id: 20,
    order: 17,
    status: 'pending',
    payment_intent_id: 'pi_existing',
    transaction_type: 'order',
    amount: 125,
    currency: 'PHP',
  }
  const outboxes: any[] = []
  const order = {
    id: 17,
    customer: { id: 2, user: { id: 42 } },
    merchant: { id: 3, outletName: 'Test Merchant' },
    status: 'pending',
    fulfillment_type: 'delivery',
    total: options.orderTotal ?? 125,
  }
  return {
    user: { id: options.userId ?? 42, role: 'customer' },
    json: async () => ({
      orderId: 17,
      customerId: 42,
      ...(!options.omitTransactionId && {
        transactionId: options.transactionId ?? '20',
      }),
      paymentIntentId: 'pi_existing',
      reconcileOnly: true,
    }),
    payload: {
      findByID: vi.fn(async () => order),
      find: vi.fn(async ({ collection }: { collection: string }) => ({
        docs: collection === 'transactions'
          ? options.ambiguousTransactions
            ? [transaction, { ...transaction, id: 21 }]
            : [transaction]
          : [...outboxes],
      })),
      update: vi.fn(async () => transaction),
      create: vi.fn(async ({ data }: { data: object }) => {
        const outbox = { id: 40, ...data }
        outboxes.push(outbox)
        return outbox
      }),
      db: {
        beginTransaction: vi.fn(async () => 'payment-tx'),
        commitTransaction: vi.fn(async () => undefined),
        rollbackTransaction: vi.fn(async () => undefined),
      },
    },
  }
}

function providerResponse(data: unknown, ok = true, status = ok ? 200 : 400) {
  return {
    ok,
    status,
    json: async () => ok ? { data } : data,
  } as Response
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { createAdminNotificationFanout } = vi.hoisted(() => ({
  createAdminNotificationFanout: vi.fn(async () => undefined),
}))

vi.mock('../../src/utils/notificationFanout', () => ({
  createAdminNotificationFanout,
}))

import {
  paymongoReconcileDelayMinutes,
  recoverStaleDeliveryPayments,
} from '../../src/jobs/deliveryFulfillment'

const BASE_TIME = new Date('2026-11-17T00:00:00.000Z')

describe('background PayMongo delivery payment recovery', () => {
  beforeEach(() => {
    vi.stubEnv('PAYMONGO_SANDBOX', 'false')
    vi.stubEnv('PAYMONGO_SECRET_KEY_LIVE', 'test_secret')
    createAdminNotificationFanout.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('atomically marks an exactly verified payment paid and ensures its delivery outbox', async () => {
    const { req, transaction, order, outboxes } = createRecoveryRequest()
    const fetch = vi.fn(async () => providerResponse({
      id: 'pi_stale',
      attributes: { status: 'succeeded', amount: 12500, currency: 'PHP' },
    }))
    vi.stubGlobal('fetch', fetch)

    await expect(recoverStaleDeliveryPayments(req as any, BASE_TIME)).resolves.toEqual({
      checked: 1,
      paid: 1,
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toBe('https://api.paymongo.com/v1/payment_intents/pi_stale')
    expect(transaction.status).toBe('paid')
    expect(order.status).toBe('accepted')
    expect(outboxes).toHaveLength(1)
    expect(req.payload.db.commitTransaction).toHaveBeenCalledTimes(1)
    expect(req.payload.db.rollbackTransaction).not.toHaveBeenCalled()
  })

  it('reschedules an intent that has not succeeded without marking payment paid', async () => {
    const { req, transaction, outboxes } = createRecoveryRequest()
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_stale',
      attributes: { status: 'processing', amount: 12500, currency: 'PHP' },
    })))

    await recoverStaleDeliveryPayments(req as any, BASE_TIME)

    expect(transaction.status).toBe('pending')
    expect(transaction.paymongo_reconcile_next_check_at).toBeTruthy()
    expect(transaction.paymongo_reconcile_stopped).not.toBe(true)
    expect(req.payload.db.beginTransaction).not.toHaveBeenCalled()
    expect(outboxes).toHaveLength(0)
  })

  it.each([
    ['amount mismatch', { status: 'succeeded', amount: 12499, currency: 'PHP' }],
    ['currency mismatch', { status: 'succeeded', amount: 12500, currency: 'USD' }],
  ])('stops and alerts on a terminal succeeded intent with %s', async (_label, attributes) => {
    const { req, transaction, outboxes } = createRecoveryRequest()
    const fetch = vi.fn(async () => providerResponse({
      id: 'pi_stale',
      attributes,
    }))
    vi.stubGlobal('fetch', fetch)

    await recoverStaleDeliveryPayments(req as any, BASE_TIME)
    await recoverStaleDeliveryPayments(req as any, new Date(BASE_TIME.getTime() + 60 * 60_000))

    expect(transaction.status).toBe('pending')
    expect(transaction.paymongo_reconcile_stopped).toBe(true)
    expect(transaction.paymongo_reconcile_next_check_at).toBeNull()
    expect(transaction.paymongo_reconcile_alerted_at).toBeTruthy()
    expect(req.payload.db.beginTransaction).not.toHaveBeenCalled()
    expect(outboxes).toHaveLength(0)
    expect(createAdminNotificationFanout).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('marks a terminal provider state failed and stops scheduling lookups', async () => {
    const { req, transaction, outboxes } = createRecoveryRequest()
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_stale',
      attributes: { status: 'canceled', amount: 12500, currency: 'PHP' },
    })))

    await recoverStaleDeliveryPayments(req as any, BASE_TIME)

    expect(transaction.status).toBe('failed')
    expect(transaction.paymongo_reconcile_next_check_at).toBeNull()
    expect(outboxes).toHaveLength(0)
  })

  it('rolls back paid state when the delivery outbox cannot be persisted', async () => {
    const { req, transaction, outboxes } = createRecoveryRequest()
    req.payload.create.mockRejectedValue(new Error('outbox unavailable'))
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_stale',
      attributes: { status: 'succeeded', amount: 12500, currency: 'PHP' },
    })))

    await recoverStaleDeliveryPayments(req as any, BASE_TIME)

    expect(req.payload.db.rollbackTransaction).toHaveBeenCalledTimes(1)
    expect(req.payload.db.commitTransaction).not.toHaveBeenCalled()
    expect(transaction.status).toBe('pending')
    expect(transaction.paymongo_reconcile_next_check_at).toBeTruthy()
    expect(outboxes).toHaveLength(0)
  })

  it('records a verified late payment on a cancelled order without enqueueing delivery', async () => {
    const { req, transaction, order, outboxes } = createRecoveryRequest()
    order.status = 'cancelled'
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_stale',
      attributes: { status: 'succeeded', amount: 12500, currency: 'PHP' },
    })))

    await recoverStaleDeliveryPayments(req as any, BASE_TIME)

    expect(transaction.status).toBe('paid')
    expect(order.status).toBe('cancelled')
    expect(outboxes).toHaveLength(0)
    expect(createAdminNotificationFanout).toHaveBeenCalledWith(
      req.payload,
      expect.objectContaining({ typeKey: 'payment.delivery_payment_after_cancellation' }),
    )
  })

  it('limits provider lookups per run and alerts once after repeated checks while continuing at capped backoff', async () => {
    const transactions = [1, 2, 3].map((id) => makeTransaction(id, `pi_${id}`))
    const { req } = createRecoveryRequest({ transactions })
    const fetch = vi.fn(async (url: string) => {
      const intentId = url.slice(url.lastIndexOf('/') + 1)
      return providerResponse({
        id: intentId,
        attributes: { status: 'processing', amount: 12500, currency: 'PHP' },
      })
    })
    vi.stubGlobal('fetch', fetch)

    await recoverStaleDeliveryPayments(req as any, BASE_TIME)
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(req.payload.find).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      limit: 2,
    }))

    const oneTransactionReq = createRecoveryRequest()
    vi.stubGlobal('fetch', vi.fn(async () => providerResponse({
      id: 'pi_stale',
      attributes: { status: 'processing', amount: 12500, currency: 'PHP' },
    })))
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const now = new Date(BASE_TIME.getTime() + attempt * 7 * 60 * 60_000)
      await recoverStaleDeliveryPayments(oneTransactionReq.req as any, now)
    }

    expect(createAdminNotificationFanout).toHaveBeenCalledTimes(1)
    expect(oneTransactionReq.transaction.paymongo_reconcile_attempt_count).toBe(6)
    expect(paymongoReconcileDelayMinutes(100)).toBe(360)
    expect(oneTransactionReq.transaction.paymongo_reconcile_next_check_at).toBeTruthy()
  })

  it('does not call PayMongo when the transaction claim loses a concurrent race', async () => {
    const { req } = createRecoveryRequest()
    req.payload.update.mockResolvedValueOnce({ docs: [] })
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)

    await expect(recoverStaleDeliveryPayments(req as any, BASE_TIME)).resolves.toEqual({
      checked: 0,
      paid: 0,
    })
    expect(fetch).not.toHaveBeenCalled()
  })
})

function makeTransaction(id = 21, paymentIntentId = 'pi_stale') {
  return {
    id,
    order: 17,
    status: 'pending',
    transaction_type: 'order',
    payment_intent_id: paymentIntentId,
    amount: 125,
    currency: 'PHP',
    createdAt: new Date(BASE_TIME.getTime() - 10 * 60_000).toISOString(),
    paymongo_reconcile_attempt_count: 0,
  }
}

function createRecoveryRequest(options: { transactions?: any[] } = {}) {
  const transactions = options.transactions || [makeTransaction()]
  const transaction = transactions[0]
  const order = {
    id: 17,
    status: 'pending',
    fulfillment_type: 'delivery',
    total: 125,
  }
  const outboxes: any[] = []
  let transactionSnapshot: any[] = []
  let orderSnapshot = { ...order }
  const payload = {
    find: vi.fn(async (args: any) => {
      if (args.collection === 'transactions') {
        if (args.sort === 'createdAt') {
          return {
            docs: transactions.filter((item) =>
              item.status === 'pending' && !item.paymongo_reconcile_stopped,
            ),
          }
        }
        if (args.where?.and?.some((condition: any) => condition.paymongo_reconcile_stopped)) {
          return {
            docs: transactions.filter((item) =>
              item.paymongo_reconcile_stopped &&
              !item.paymongo_reconcile_alerted_at,
            ),
          }
        }
        return {
          docs: transactions.filter((item) =>
            item.payment_intent_id === args.where?.payment_intent_id?.equals,
          ),
        }
      }
      if (args.collection === 'delivery-fulfillment-outbox') return { docs: [...outboxes] }
      return { docs: [] }
    }),
    findByID: vi.fn(async ({ collection, id }: any) => {
      if (collection === 'transactions') {
        return transactions.find((item) => String(item.id) === String(id))
      }
      if (collection === 'orders') return order
      return null
    }),
    update: vi.fn(async (args: any) => {
      if (args.collection === 'transactions') {
        const target = transactions.find((item) => String(item.id) === String(args.id ?? args.where?.and?.[0]?.id?.equals))
        if (!target || (target.status !== 'pending' && args.data?.status !== 'paid')) {
          return { docs: [] }
        }
        Object.assign(target, args.data)
        return { docs: [target] }
      }
      if (args.collection === 'orders') {
        Object.assign(order, args.data)
        return order
      }
      return { docs: [] }
    }),
    create: vi.fn(async ({ collection, data }: any) => {
      if (collection === 'delivery-fulfillment-outbox') {
        const outbox = { id: 40, ...data }
        outboxes.push(outbox)
        return outbox
      }
      return { id: 41, ...data }
    }),
    db: {
      beginTransaction: vi.fn(async () => {
        transactionSnapshot = transactions.map((item) => ({ ...item }))
        orderSnapshot = { ...order }
        return 'payment-tx'
      }),
      commitTransaction: vi.fn(async () => undefined),
      rollbackTransaction: vi.fn(async () => {
        transactions.forEach((item, index) => {
          Object.assign(item, transactionSnapshot[index])
        })
        Object.assign(order, orderSnapshot)
      }),
    },
  }
  return { req: { payload, transactionID: undefined }, payload, transaction, order, outboxes }
}

function providerResponse(data: unknown) {
  return {
    ok: true,
    json: async () => ({ data }),
  } as Response
}

import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getDeliveryProvider } = vi.hoisted(() => ({
  getDeliveryProvider: vi.fn(),
}))

vi.mock('../../src/services/deliveryProviders', () => ({
  getDeliveryProvider,
}))

import { deliveryPriorityFeePrepareHandler } from '../../src/endpoints/deliveryPriorityFee'

describe('priority-fee payment recovery', () => {
  beforeEach(() => {
    vi.stubEnv('PAYMONGO_SANDBOX', 'false')
    vi.stubEnv('PAYMONGO_SECRET_KEY_LIVE', 'sk_test_priority_fee')
    getDeliveryProvider.mockResolvedValue({
      getOrderDetails: vi.fn(async () => ({ status: 'ASSIGNING_DRIVER' })),
    })
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          id: 'pi_expired',
          attributes: { status: 'canceled' },
        },
      }),
    })))
  })

  it('releases a canceled pending QR payment so the customer can retry', async () => {
    let transactionQuery = 0
    const activePayment = {
      id: 501,
      order: 95,
      amount: 25,
      payment_intent_id: 'pi_expired',
      status: 'pending',
      transaction_type: 'priority_fee',
      priority_fee_total: 45,
      priority_fee_fulfillment_status: 'pending',
    }
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'orders') {
          return {
            docs: [{
              id: 95,
              status: 'accepted',
              fulfillment_type: 'delivery',
              lalamove_order_id: 'llm-95',
            }],
          }
        }
        if (collection === 'delivery-bookings') {
          return { docs: [{ lalamove_order_id: 'llm-95', priority_fee: 20 }] }
        }
        if (collection === 'transactions') {
          transactionQuery += 1
          return transactionQuery === 1
            ? { docs: [{ id: 1 }] }
            : transactionQuery === 2
              ? { docs: [] }
              : { docs: [activePayment] }
        }
        return { docs: [] }
      }),
      update: vi.fn(async () => activePayment),
    }

    const response = await deliveryPriorityFeePrepareHandler({
      user: { role: 'service' },
      body: { orderId: 95, customerId: 7, additionalAmount: 25 },
      payload,
    } as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ state: 'expired', amount: 25 })
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      id: 501,
      data: { status: 'failed', priority_fee_fulfillment_status: 'failed' },
    }))
  })

  it('resumes the saved redirect action for a non-QR payment method', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          id: 'pi_gcash',
          attributes: {
            status: 'awaiting_next_action',
            next_action: { redirect: { url: 'https://paymongo.example.test/gcash' } },
          },
        },
      }),
    })))
    let transactionQuery = 0
    const activePayment = {
      id: 501,
      order: 95,
      amount: 25,
      payment_intent_id: 'pi_gcash',
      payment_method: 'gcash',
      status: 'pending',
      transaction_type: 'priority_fee',
      priority_fee_total: 45,
      priority_fee_fulfillment_status: 'pending',
    }
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'orders') {
          return {
            docs: [{
              id: 95,
              status: 'accepted',
              fulfillment_type: 'delivery',
              lalamove_order_id: 'llm-95',
            }],
          }
        }
        if (collection === 'delivery-bookings') {
          return { docs: [{ lalamove_order_id: 'llm-95', priority_fee: 20 }] }
        }
        if (collection === 'transactions') {
          transactionQuery += 1
          return transactionQuery === 1
            ? { docs: [{ id: 1 }] }
            : transactionQuery === 2
              ? { docs: [] }
              : { docs: [activePayment] }
        }
        return { docs: [] }
      }),
    }

    const response = await deliveryPriorityFeePrepareHandler({
      user: { role: 'service' },
      body: { orderId: 95, customerId: 7, additionalAmount: 25, paymentMethod: 'gcash' },
      payload,
    } as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      state: 'action',
      paymentIntentId: 'pi_gcash',
      paymentMethod: 'gcash',
      nextAction: { redirect: { url: 'https://paymongo.example.test/gcash' } },
    })
  })

  it('resumes an unattached payment with its saved payment method', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          id: 'pi_gcash',
          attributes: {
            status: 'awaiting_payment_method',
            client_key: 'pi_gcash_secret',
          },
        },
      }),
    })))
    let transactionQuery = 0
    const activePayment = {
      id: 501,
      order: 95,
      amount: 25,
      payment_intent_id: 'pi_gcash',
      payment_method: 'gcash',
      status: 'pending',
      transaction_type: 'priority_fee',
      priority_fee_total: 45,
      priority_fee_fulfillment_status: 'pending',
    }
    const payload = {
      find: vi.fn(async ({ collection }: { collection: string }) => {
        if (collection === 'orders') {
          return {
            docs: [{
              id: 95,
              status: 'accepted',
              fulfillment_type: 'delivery',
              lalamove_order_id: 'llm-95',
            }],
          }
        }
        if (collection === 'delivery-bookings') {
          return { docs: [{ lalamove_order_id: 'llm-95', priority_fee: 20 }] }
        }
        if (collection === 'transactions') {
          transactionQuery += 1
          return transactionQuery === 1
            ? { docs: [{ id: 1 }] }
            : transactionQuery === 2
              ? { docs: [] }
              : { docs: [activePayment] }
        }
        return { docs: [] }
      }),
    }

    const response = await deliveryPriorityFeePrepareHandler({
      user: { role: 'service' },
      body: { orderId: 95, customerId: 7, additionalAmount: 25 },
      payload,
    } as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      state: 'attach',
      paymentIntentId: 'pi_gcash',
      paymentMethod: 'gcash',
      clientKey: 'pi_gcash_secret',
    })
  })

  it.each(['gcash', 'grab_pay', 'paymaya', 'billease', 'dob', 'brankas', 'qrph'])(
    'creates a PayMongo intent and transaction for %s',
    async (paymentMethod) => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          id: 'pi_gcash',
          attributes: {
            amount: 2500,
            client_key: 'pi_gcash_secret',
          },
        },
      }),
    }))
    vi.stubGlobal('fetch', fetchMock)
    const payload = {
      find: vi.fn(async ({ collection, where }: {
        collection: string
        where?: Record<string, any>
      }) => {
        if (collection === 'orders') {
          return {
            docs: [{
              id: 95,
              status: 'accepted',
              fulfillment_type: 'delivery',
              lalamove_order_id: 'llm-95',
            }],
          }
        }
        if (collection === 'delivery-bookings') {
          return { docs: [{ lalamove_order_id: 'llm-95', priority_fee: 20 }] }
        }
        if (collection === 'transactions' && where?.and?.some(
          (filter: Record<string, any>) => filter.transaction_type?.equals === 'order',
        )) {
          return { docs: [{ id: 3 }] }
        }
        return { docs: [] }
      }),
      create: vi.fn(async () => ({ id: 502 })),
    }

    const response = await deliveryPriorityFeePrepareHandler({
      user: { role: 'service' },
      body: { orderId: 95, customerId: 7, additionalAmount: 25, paymentMethod },
      payload,
    } as never)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      state: 'attach',
      paymentIntentId: 'pi_gcash',
      paymentMethod,
    })
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toMatchObject({
      data: { attributes: { payment_method_allowed: [paymentMethod] } },
    })
    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      data: expect.objectContaining({ payment_method: paymentMethod, status: 'pending' }),
    }))
    },
  )
})

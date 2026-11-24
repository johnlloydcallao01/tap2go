import crypto from 'crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { applyPaidPriorityFee, ensureDeliveryFulfillment } = vi.hoisted(() => ({
  applyPaidPriorityFee: vi.fn(async () => ({ state: 'applied' })),
  ensureDeliveryFulfillment: vi.fn(async () => undefined),
}))

vi.mock('../../src/endpoints/deliveryPriorityFee', () => ({ applyPaidPriorityFee }))
vi.mock('../../src/services/deliveryFulfillmentOutbox', () => ({ ensureDeliveryFulfillment }))

import { paymongoWebhook } from '../../src/endpoints/paymongoWebhook'

describe('PayMongo priority-fee webhook', () => {
  beforeEach(() => {
    vi.stubEnv('PAYMONGO_SANDBOX', 'true')
    vi.stubEnv('PAYMONGO_SANDBOX_WEBHOOK_SECRET', 'whsec_priority_fee_test')
    vi.stubEnv('PAYMONGO_SANDBOX_API_KEY', 'sk_priority_fee_test')
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: {
          id: 'pi_gcash',
          attributes: { status: 'succeeded', amount: 2500, currency: 'PHP' },
        },
      }),
    })))
  })

  it('records a paid non-QR priority-fee transaction and applies it from the webhook', async () => {
    const transaction = {
      id: 501,
      order: 95,
      payment_intent_id: 'pi_gcash',
      payment_method: 'gcash',
      amount: 25,
      currency: 'PHP',
      status: 'pending',
      transaction_type: 'priority_fee',
    }
    const payload = {
      find: vi.fn(async () => ({ docs: [transaction] })),
      update: vi.fn(async () => ({ ...transaction, status: 'paid' })),
      db: {
        beginTransaction: vi.fn(async () => 'tx-1'),
        commitTransaction: vi.fn(async () => undefined),
        rollbackTransaction: vi.fn(async () => undefined),
      },
    }
    const body = JSON.stringify({
      data: {
        attributes: {
          type: 'payment.paid',
          data: {
            id: 'pay_gcash',
            attributes: {
              payment_intent_id: 'pi_gcash',
              paid_at: 1795500000,
            },
          },
        },
      },
    })
    const timestamp = '1795500000'
    const signature = crypto
      .createHmac('sha256', 'whsec_priority_fee_test')
      .update(`${timestamp}.${body}`)
      .digest('hex')
    const request = new Request('https://cms.example.test/api/paymongo/webhook', {
      method: 'POST',
      headers: { 'paymongo-signature': `t=${timestamp},te=${signature}` },
      body,
    })
    Object.assign(request, { payload })

    const response = await paymongoWebhook(request as never)

    expect(response.status).toBe(200)
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'transactions',
      id: 501,
      data: expect.objectContaining({
        status: 'paid',
        payment_id: 'pay_gcash',
        priority_fee_fulfillment_status: 'pending',
      }),
    }))
    expect(applyPaidPriorityFee).toHaveBeenCalledWith(
      expect.objectContaining({ payload }),
      expect.objectContaining({ id: 501, status: 'paid' }),
    )
    expect(ensureDeliveryFulfillment).not.toHaveBeenCalled()
  })
})

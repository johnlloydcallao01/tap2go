import { describe, expect, it, vi } from 'vitest'
import { ensureDeliveryFulfillment } from '../../src/services/deliveryFulfillmentOutbox'

function createRequest(options: {
  existing?: Array<{ id: number; status: string }>
  createError?: Error & { code?: string }
} = {}) {
  const outbox = { id: 41, order: 17, status: 'pending', attempt_count: 0 }
  const payload = {
    find: vi.fn(async () => ({ docs: options.existing || [] })),
    create: vi.fn(async () => {
      if (options.createError) throw options.createError
      return outbox
    }),
    jobs: {
      queue: vi.fn(async () => undefined),
    },
  }
  return { req: { payload } as any, payload, outbox }
}

describe('delivery fulfillment outbox wake-up', () => {
  it('queues the worker when creating a pending outbox row', async () => {
    const { req, payload, outbox } = createRequest()

    await expect(ensureDeliveryFulfillment(req, 17)).resolves.toBe(outbox)

    expect(payload.jobs.queue).toHaveBeenCalledWith({
      task: 'delivery-fulfillment',
      input: {},
      req,
    })
  })

  it('re-queues existing pending work but does not queue completed work', async () => {
    const pending = createRequest({ existing: [{ id: 41, status: 'pending' }] })
    await ensureDeliveryFulfillment(pending.req, 17)
    expect(pending.payload.jobs.queue).toHaveBeenCalledTimes(1)

    const booked = createRequest({ existing: [{ id: 41, status: 'booked' }] })
    await ensureDeliveryFulfillment(booked.req, 17)
    expect(booked.payload.jobs.queue).not.toHaveBeenCalled()
  })

  it('does not hide worker enqueue failures', async () => {
    const { req, payload } = createRequest()
    const queueError = new Error('queue unavailable')
    payload.jobs.queue.mockRejectedValue(queueError)

    await expect(ensureDeliveryFulfillment(req, 17)).rejects.toBe(queueError)
  })
})

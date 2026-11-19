import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  deliveryBookForFulfillment: vi.fn(),
}))

vi.mock('../../src/endpoints/deliveryBook', () => ({
  deliveryBookForFulfillment: mocks.deliveryBookForFulfillment,
}))

vi.mock('../../src/utils/notificationFanout', () => ({
  createAdminNotificationFanout: vi.fn(async () => undefined),
  createCustomerDeliveryBookingNotification: vi.fn(async () => undefined),
}))

import {
  DeliveryFulfillmentOutbox,
  guardDeliveryFulfillmentOutboxChange,
  guardDeliveryFulfillmentOutboxDelete,
} from '../../src/collections/DeliveryFulfillmentOutbox'
import { deliveryFulfillmentTask } from '../../src/jobs/deliveryFulfillment'

function queryText(query: any) {
  return query.queryChunks
    .map((chunk: any) => chunk.value?.join('') || '')
    .join('')
    .replace(/\s+/g, ' ')
}

function createRequest(readyWorkerCount = 1) {
  const outbox: Record<string, any> = {
    id: 41,
    order: 17,
    status: 'pending',
    attempt_count: 0,
    submission_started_at: null,
  }
  const attempts: Array<Record<string, any>> = []
  let readyFindCount = 0
  let releaseReady: () => void = () => undefined
  const readyBarrier = new Promise<void>((resolve) => {
    releaseReady = resolve
  })

  const payload = {
    db: {
      drizzle: {
        execute: vi.fn(async (query: any) => {
          const text = queryText(query)
          if (text.includes('SET status = \'submitting\'')) {
            if (
              !['pending', 'retryable'].includes(outbox.status) ||
              outbox.submission_started_at
            ) return { rows: [] }

            outbox.status = 'submitting'
            outbox.attempt_count += 1
            return { rows: [{ attempt_count: outbox.attempt_count }] }
          }

          if (text.includes('SET submission_started_at =')) {
            if (outbox.status !== 'submitting' || outbox.submission_started_at) {
              return { rows: [] }
            }
            outbox.submission_started_at = new Date().toISOString()
            return { rows: [{ id: outbox.id }] }
          }

          throw new Error(`Unexpected atomic outbox query: ${text}`)
        }),
      },
    },
    find: vi.fn(async ({ collection, where }: any) => {
      if (collection === 'delivery-fulfillment-outbox') {
        const statusIn = where?.and?.find((clause: any) => Array.isArray(clause.status?.in))
          ?.status.in as string[] | undefined
        const hasUnsubmittedGuard = where?.and?.some(
          (clause: any) => clause.submission_started_at?.exists === false,
        )
        if (
          statusIn?.includes('pending') &&
          statusIn.includes('retryable') &&
          hasUnsubmittedGuard
        ) {
          const docs = ['pending', 'retryable'].includes(outbox.status) &&
            !outbox.submission_started_at
            ? [{ ...outbox }]
            : []
          readyFindCount += 1
          if (readyFindCount >= readyWorkerCount) releaseReady()
          await readyBarrier
          return { docs }
        }
      }
      return { docs: [] }
    }),
    findByID: vi.fn(async ({ collection }: any) =>
      collection === 'delivery-fulfillment-outbox' ? { ...outbox } : undefined,
    ),
    update: vi.fn(async ({ collection, data, id }: any) => {
      if (collection === 'delivery-fulfillment-outbox') {
        guardDeliveryFulfillmentOutboxChange({
          data,
          operation: 'update',
          originalDoc: { ...outbox },
        })
        Object.assign(outbox, data)
        return { docs: [{ ...outbox }] }
      }

      if (collection === 'delivery-fulfillment-attempts') {
        const attempt = attempts.find((item) => String(item.id) === String(id))
        if (attempt) Object.assign(attempt, data)
        return { docs: attempt ? [{ ...attempt }] : [] }
      }

      return { docs: [] }
    }),
    create: vi.fn(async ({ collection, data }: any) => {
      if (collection === 'delivery-fulfillment-attempts') {
        const attempt = { id: attempts.length + 100, ...data }
        attempts.push(attempt)
        return attempt
      }
      return { id: 1 }
    }),
  }

  return { req: { payload } as any, outbox, payload }
}

describe('delivery fulfillment duplicate prevention', () => {
  beforeEach(() => {
    mocks.deliveryBookForFulfillment.mockReset()
  })

  it('does not resubmit after a submitted request returns 429 or an admin reset is attempted', async () => {
    let placeOrderCalls = 0
    mocks.deliveryBookForFulfillment.mockImplementation(
      async (_req: unknown, _orderId: number, fulfillment: { onProviderSubmissionStarted: () => Promise<void> }) => {
        await fulfillment.onProviderSubmissionStarted()
        placeOrderCalls += 1
        return Response.json({ error: 'rate limited' }, { status: 429 })
      },
    )
    const { req, outbox, payload } = createRequest()

    await deliveryFulfillmentTask({ req })
    expect(outbox.status).toBe('unknown')
    expect(outbox.submission_started_at).toBeTruthy()
    expect(placeOrderCalls).toBe(1)

    await expect(payload.update({
      collection: 'delivery-fulfillment-outbox',
      id: outbox.id,
      data: { status: 'pending', submission_started_at: null },
    })).rejects.toThrow(/submission latch/i)
    expect(outbox.status).toBe('unknown')
    expect(DeliveryFulfillmentOutbox.access?.delete?.({
      req: { user: { role: 'admin' } },
    } as any)).toBe(false)
    expect(() => guardDeliveryFulfillmentOutboxDelete({ doc: outbox })).toThrow(/cannot be deleted/i)

    await deliveryFulfillmentTask({ req })
    expect(placeOrderCalls).toBe(1)
  })

  it('leaves a pre-submit 429 retryable without setting the latch', async () => {
    let placeOrderCalls = 0
    mocks.deliveryBookForFulfillment.mockImplementation(
      async () => {
        return Response.json({ error: 'quote rate limited' }, { status: 429 })
      },
    )
    const { req, outbox } = createRequest()

    await deliveryFulfillmentTask({ req })

    expect(outbox.status).toBe('retryable')
    expect(outbox.submission_started_at).toBeNull()
    expect(placeOrderCalls).toBe(0)
    expect(mocks.deliveryBookForFulfillment).toHaveBeenCalledTimes(1)
  })

  it('allows only one concurrent worker to claim and submit an outbox row', async () => {
    let placeOrderCalls = 0
    mocks.deliveryBookForFulfillment.mockImplementation(
      async (_req: unknown, _orderId: number, fulfillment: { onProviderSubmissionStarted: () => Promise<void> }) => {
        await fulfillment.onProviderSubmissionStarted()
        placeOrderCalls += 1
        return Response.json({ data: { lalamoveOrderId: 'LL-1' } })
      },
    )
    const { req, outbox, payload } = createRequest(2)

    await Promise.all([
      deliveryFulfillmentTask({ req }),
      deliveryFulfillmentTask({ req }),
    ])

    expect(outbox.status).toBe('booked')
    expect(outbox.submission_started_at).toBeTruthy()
    expect(placeOrderCalls).toBe(1)
    expect(mocks.deliveryBookForFulfillment).toHaveBeenCalledTimes(1)

    const claimQuery = payload.db.drizzle.execute.mock.calls
      .map(([query]) => queryText(query))
      .find((text) => text.includes('SET status = \'submitting\''))
    expect(claimQuery).toContain('submission_started_at IS NULL')
    expect(claimQuery).toContain('status =')
  })

  it('rejects CMS changes that clear the latch or move a latched row to retryable', () => {
    const originalDoc = {
      order: 17,
      status: 'unknown',
      submission_started_at: '2026-11-19T10:00:00.000Z',
    }

    expect(() => guardDeliveryFulfillmentOutboxChange({
      data: { submission_started_at: null },
      operation: 'update',
      originalDoc,
    })).toThrow(/cannot be changed or cleared/i)
    expect(() => guardDeliveryFulfillmentOutboxChange({
      data: { status: 'retryable' },
      operation: 'update',
      originalDoc,
    })).toThrow(/cannot return to a retryable state/i)
    expect(() => guardDeliveryFulfillmentOutboxChange({
      data: { order: 18 },
      operation: 'update',
      originalDoc,
    })).toThrow(/cannot be moved/i)
  })
})

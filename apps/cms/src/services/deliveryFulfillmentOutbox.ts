import type { PayloadRequest } from 'payload'
import { sql } from 'drizzle-orm'

type AtomicUpdateResult = { rows?: Array<{ attempt_count?: number | string }> }

export async function claimDeliveryFulfillmentOutbox(
  req: PayloadRequest,
  outboxId: number | string,
  expectedStatus: 'pending' | 'retryable',
  requestId: string,
  now: Date,
  leaseExpiresAt: Date,
): Promise<number | null> {
  const result = (await req.payload.db.drizzle.execute(sql`
    UPDATE delivery_fulfillment_outbox
    SET
      status = 'submitting',
      attempt_count = attempt_count + 1,
      last_attempt_at = ${now.toISOString()}::timestamptz,
      last_request_id = ${requestId},
      lease_expires_at = ${leaseExpiresAt.toISOString()}::timestamptz,
      next_attempt_at = NULL,
      last_error = NULL,
      manual_alerted_at = NULL,
      updated_at = now()
    WHERE id = ${outboxId}
      AND status = ${expectedStatus}::enum_delivery_fulfillment_outbox_status
      AND submission_started_at IS NULL
      AND (next_attempt_at IS NULL OR next_attempt_at <= ${now.toISOString()}::timestamptz)
    RETURNING attempt_count
  ` as never)) as unknown as AtomicUpdateResult

  const attemptCount = Number(result.rows?.[0]?.attempt_count)
  return Number.isSafeInteger(attemptCount) && attemptCount > 0 ? attemptCount : null
}

export async function latchDeliveryFulfillmentSubmission(
  req: PayloadRequest,
  outboxId: number | string,
  requestId: string,
  startedAt = new Date(),
): Promise<boolean> {
  const result = (await req.payload.db.drizzle.execute(sql`
    UPDATE delivery_fulfillment_outbox
    SET submission_started_at = ${startedAt.toISOString()}::timestamptz,
        updated_at = now()
    WHERE id = ${outboxId}
      AND status = 'submitting'
      AND last_request_id = ${requestId}
      AND submission_started_at IS NULL
    RETURNING id
  ` as never)) as unknown as { rows?: Array<{ id: number | string }> }

  return (result.rows?.length ?? 0) === 1
}

export async function ensureDeliveryFulfillment(req: PayloadRequest, orderId: number) {
  const existing = await req.payload.find({
    collection: 'delivery-fulfillment-outbox',
    where: { order: { equals: orderId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })

  let outbox = existing.docs[0]

  if (!outbox) {
    try {
      outbox = await req.payload.create({
        collection: 'delivery-fulfillment-outbox',
        data: { order: orderId, status: 'pending', attempt_count: 0 },
        overrideAccess: true,
        req,
      })
    } catch (error) {
      const code = (error as { code?: string })?.code
      if (code !== '23505') throw error

      const raced = await req.payload.find({
        collection: 'delivery-fulfillment-outbox',
        where: { order: { equals: orderId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      })
      if (!raced.docs[0]) throw error
      outbox = raced.docs[0]
    }
  }

  if (outbox.status === 'pending' || outbox.status === 'retryable') {
    await enqueueDeliveryFulfillment(req)
  }
  return outbox
}

async function enqueueDeliveryFulfillment(req: PayloadRequest) {
  await req.payload.jobs.queue({
    task: 'delivery-fulfillment',
    input: {},
    req,
  } as never)
}

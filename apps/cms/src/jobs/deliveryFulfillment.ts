import type { PayloadRequest, TaskConfig } from 'payload'
import { deliveryBookForFulfillment } from '../endpoints/deliveryBook'
import {
  getDeliveryProvider,
  mapLalamoveStatus,
  mapToOrderStatus,
} from '../services/deliveryProviders'
import { ensureDeliveryFulfillment } from '../services/deliveryFulfillmentOutbox'
import { createAdminNotificationFanout } from '../utils/notificationFanout'

const LEASE_MINUTES = 5
const BATCH_SIZE = 2
const MAX_ATTEMPTS = 8

type RelationId = number | string | { id?: number | string } | null | undefined

function relationId(value: RelationId): number | null {
  const id = value && typeof value === 'object' ? value.id : value
  const parsed = Number(id)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

function retryDelayMinutes(attempt: number) {
  return Math.min(60, 2 ** Math.max(0, attempt - 1))
}

export async function deliveryFulfillmentTask({ req }: { req: PayloadRequest }) {
  const now = new Date()
  const pendingAlerts = await req.payload.find({
    collection: 'delivery-fulfillment-outbox',
    where: {
      and: [
        { manual_intervention_required: { equals: true } },
        { manual_alerted_at: { exists: false } },
      ],
    },
    limit: BATCH_SIZE,
    depth: 0,
    overrideAccess: true,
    req,
  })
  for (const item of pendingAlerts.docs) {
    await alertManualIntervention(
      req,
      item.id,
      relationId(item.order as RelationId),
      item.last_error || item.reconciliation_note || 'Delivery fulfillment requires review.',
    )
  }

  const paidTransactions = await req.payload.find({
    collection: 'transactions',
    where: {
      and: [
        { status: { equals: 'paid' } },
        { transaction_type: { not_equals: 'priority_fee' } },
      ],
    },
    sort: '-updatedAt',
    limit: 200,
    depth: 1,
    overrideAccess: true,
    req,
  })
  const paidOrderIds = [
    ...new Set(
      paidTransactions.docs
        .map((transaction) => relationId(transaction.order as RelationId))
        .filter((id): id is number => id !== null),
    ),
  ]
  const existingOutboxes = paidOrderIds.length
    ? await req.payload.find({
        collection: 'delivery-fulfillment-outbox',
        where: { order: { in: paidOrderIds } },
        limit: paidOrderIds.length,
        depth: 0,
        overrideAccess: true,
        req,
      })
    : { docs: [] }
  const outboxedOrderIds = new Set(
    existingOutboxes.docs
      .map((item) => relationId(item.order as RelationId))
      .filter((id): id is number => id !== null),
  )
  for (const transaction of paidTransactions.docs) {
    const orderId = relationId(transaction.order as RelationId)
    if (!orderId || outboxedOrderIds.has(orderId)) continue
    const order = typeof transaction.order === 'object'
      ? transaction.order
      : await req.payload.findByID({
          collection: 'orders',
          id: orderId,
          depth: 0,
          overrideAccess: true,
          req,
        })
    if (order.fulfillment_type === 'delivery') {
      await ensureDeliveryFulfillment(req, orderId)
    }
  }

  const expiredLease = await req.payload.find({
    collection: 'delivery-fulfillment-outbox',
    where: {
      and: [
        { status: { equals: 'submitting' } },
        { lease_expires_at: { less_than_equal: now.toISOString() } },
      ],
    },
    limit: BATCH_SIZE,
    depth: 0,
    overrideAccess: true,
    req,
  })

  for (const item of expiredLease.docs) {
    const canReconcileAutomatically = Boolean(item.lalamove_order_id)
    const expired = await req.payload.update({
      collection: 'delivery-fulfillment-outbox',
      where: {
        and: [
          { id: { equals: item.id } },
          { status: { equals: 'submitting' } },
          { lease_expires_at: { less_than_equal: now.toISOString() } },
        ],
      },
      data: {
        status: 'reconciliation_required',
        lease_expires_at: null,
        manual_intervention_required: !canReconcileAutomatically,
        manual_alerted_at: null,
        reconciliation_note: canReconcileAutomatically
          ? 'Worker lease expired. The known Lalamove order will be checked automatically.'
          : 'Worker lease expired during submission. Verify Lalamove before any new booking attempt.',
      },
      overrideAccess: true,
      req,
    })
    if (expired.docs.length === 1 && !canReconcileAutomatically) {
      await alertManualIntervention(
        req,
        item.id,
        relationId(item.order as RelationId),
        'A worker lease expired during delivery submission.',
      )
    }
  }

  const needsReconciliation = await req.payload.find({
    collection: 'delivery-fulfillment-outbox',
    where: {
      and: [
        { status: { in: ['unknown', 'reconciliation_required'] } },
        { lalamove_order_id: { exists: true } },
        { updatedAt: { less_than_equal: new Date(Date.now() - 5 * 60_000).toISOString() } },
      ],
    },
    limit: BATCH_SIZE,
    depth: 0,
    overrideAccess: true,
    req,
  })
  for (const item of needsReconciliation.docs) {
    const orderId = relationId(item.order as RelationId)
    if (!orderId || !item.lalamove_order_id) continue

    try {
      const provider = await getDeliveryProvider(req.payload)
      const externalOrder = await provider.getOrderDetails(String(item.lalamove_order_id))
      const bookingResult = await req.payload.find({
        collection: 'delivery-bookings',
        where: { order: { equals: orderId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      })
      const bookingData = {
        order: orderId,
        lalamove_order_id: String(item.lalamove_order_id),
        rider_remarks: item.rider_remarks || undefined,
        lalamove_quotation_id: externalOrder?.quotationId || undefined,
        share_link: externalOrder?.shareLink || undefined,
        service_type: externalOrder?.serviceType || 'MOTORCYCLE',
        status: mapLalamoveStatus(String(externalOrder?.status || 'ASSIGNING_DRIVER')),
        lalamove_raw_status: String(externalOrder?.status || 'ASSIGNING_DRIVER'),
        delivery_fee: Number(
          externalOrder?.priceBreakdown?.totalExcludePriorityFee ??
          Math.max(
            0,
            Number(externalOrder?.priceBreakdown?.total || 0) -
              Number(externalOrder?.priceBreakdown?.priorityFee || 0),
          ),
        ),
        priority_fee: Number(externalOrder?.priceBreakdown?.priorityFee || 0),
        currency: externalOrder?.priceBreakdown?.currency || 'PHP',
      }
      if (bookingResult.docs[0]) {
        await req.payload.update({
          collection: 'delivery-bookings',
          id: bookingResult.docs[0].id,
          data: bookingData,
          overrideAccess: true,
          req,
        })
      } else {
        await req.payload.create({
          collection: 'delivery-bookings',
          data: bookingData,
          overrideAccess: true,
          req,
        })
      }
      await req.payload.update({
        collection: 'orders',
        id: orderId,
        data: {
          lalamove_order_id: String(item.lalamove_order_id),
          ...(bookingData.status !== 'rejected'
            ? { delivery_status: bookingData.status }
            : {}),
          delivery_service_type: bookingData.service_type,
          delivery_tracking_link: bookingData.share_link,
        },
        overrideAccess: true,
        req,
      })
      await req.payload.update({
        collection: 'delivery-fulfillment-outbox',
        id: item.id,
        data: {
          status: 'booked',
          manual_intervention_required: false,
          manual_alerted_at: null,
          reconciliation_note: null,
          last_error: null,
          lease_expires_at: null,
        },
        overrideAccess: true,
        req,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[delivery-fulfillment] reconciliation failed for outbox ${item.id}: ${message}`)
      await req.payload.update({
        collection: 'delivery-fulfillment-outbox',
        id: item.id,
        data: {
          status: 'reconciliation_required',
          manual_intervention_required: true,
          manual_alerted_at: null,
          reconciliation_note: `Could not verify Lalamove order ${item.lalamove_order_id}: ${message}`,
        },
        overrideAccess: true,
        req,
      })
      await alertManualIntervention(
        req,
        item.id,
        orderId,
        `Could not verify Lalamove order ${item.lalamove_order_id}: ${message}`,
      )
    }
  }

  const reconciliationCutoff = new Date(Date.now() - 10 * 60_000).toISOString()
  const activeBookings = await req.payload.find({
    collection: 'delivery-bookings',
    where: {
      and: [
        { status: { in: ['assigning_driver', 'driver_assigned', 'picked_up', 'rejected'] } },
        {
          or: [
            { last_reconciled_at: { exists: false } },
            { last_reconciled_at: { less_than_equal: reconciliationCutoff } },
          ],
        },
      ],
    },
    sort: 'last_reconciled_at',
    limit: BATCH_SIZE,
    depth: 0,
    overrideAccess: true,
    req,
  })
  if (activeBookings.docs.length > 0) {
    const provider = await getDeliveryProvider(req.payload)
    if (provider.name === 'lalamove') {
      for (const booking of activeBookings.docs) {
        if (!booking.lalamove_order_id) continue
        try {
          const externalOrder = await provider.getOrderDetails(String(booking.lalamove_order_id))
          const rawStatus = String(externalOrder?.status || booking.lalamove_raw_status || '')
          const status = mapLalamoveStatus(rawStatus)
          const reconciledAt = new Date().toISOString()
          await req.payload.update({
            collection: 'delivery-bookings',
            id: booking.id,
            data: {
              status,
              lalamove_raw_status: rawStatus,
              last_reconciled_at: reconciledAt,
              last_reconciliation_error: null,
            },
            overrideAccess: true,
            req,
          })
          const orderId = relationId(booking.order as RelationId)
          if (orderId) {
            const orderStatus = mapToOrderStatus(status)
            await req.payload.update({
              collection: 'orders',
              id: orderId,
              data: {
                ...(status !== 'rejected' ? { delivery_status: status } : {}),
                ...(orderStatus ? { status: orderStatus } : {}),
              },
              overrideAccess: true,
              req,
            })
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          console.error(
            `[delivery-fulfillment] status reconciliation failed for Lalamove order ${booking.lalamove_order_id}: ${message}`,
          )
          await req.payload.update({
            collection: 'delivery-bookings',
            id: booking.id,
            data: {
              last_reconciled_at: new Date().toISOString(),
              last_reconciliation_error: message,
            },
            overrideAccess: true,
            req,
          })
        }
      }
    }
  }

  const ready = await req.payload.find({
    collection: 'delivery-fulfillment-outbox',
    where: {
      and: [
        { status: { in: ['pending', 'retryable'] } },
        {
          or: [
            { next_attempt_at: { exists: false } },
            { next_attempt_at: { less_than_equal: now.toISOString() } },
          ],
        },
      ],
    },
    sort: 'createdAt',
    limit: BATCH_SIZE,
    depth: 0,
    overrideAccess: true,
    req,
  })

  for (const item of ready.docs) {
    const orderId = relationId(item.order as RelationId)
    if (!orderId) {
      await req.payload.update({
        collection: 'delivery-fulfillment-outbox',
        id: item.id,
        data: {
          status: 'failed',
          manual_intervention_required: true,
          manual_alerted_at: null,
          last_error: 'Outbox record has no valid order relationship.',
        },
        overrideAccess: true,
        req,
      })
      await alertManualIntervention(
        req,
        item.id,
        null,
        'Outbox record has no valid order relationship.',
      )
      continue
    }

    const attemptNumber = Number(item.attempt_count || 0) + 1
    const requestId = crypto.randomUUID()
    const claimed = await req.payload.update({
      collection: 'delivery-fulfillment-outbox',
      where: {
        and: [
          { id: { equals: item.id } },
          { status: { equals: item.status } },
        ],
      },
      data: {
        status: 'submitting',
        attempt_count: attemptNumber,
        last_attempt_at: now.toISOString(),
        last_request_id: requestId,
        lease_expires_at: new Date(now.getTime() + LEASE_MINUTES * 60_000).toISOString(),
        next_attempt_at: null,
        last_error: null,
        manual_alerted_at: null,
      },
      overrideAccess: true,
      req,
    })
    if (claimed.docs.length !== 1) continue

    const attempt = await req.payload.create({
      collection: 'delivery-fulfillment-attempts',
      data: {
        outbox: item.id,
        attempt_number: attemptNumber,
        status: 'started',
        request_id: requestId,
        started_at: now.toISOString(),
      },
      overrideAccess: true,
      req,
    })

    let providerSubmissionStarted = false
    try {
      const response = await deliveryBookForFulfillment(req, orderId, {
        requestId,
        onRemarksPrepared: async (remarks) => {
          await req.payload.update({
            collection: 'delivery-fulfillment-outbox',
            id: item.id,
            data: { rider_remarks: remarks },
            overrideAccess: true,
            req,
          })
        },
        onProviderSubmissionStarted: () => {
          providerSubmissionStarted = true
        },
        onProviderAccepted: async (lalamoveOrderId) => {
          await req.payload.update({
            collection: 'delivery-fulfillment-outbox',
            id: item.id,
            data: { lalamove_order_id: lalamoveOrderId },
            overrideAccess: true,
            req,
          })
          await req.payload.update({
            collection: 'delivery-fulfillment-attempts',
            id: attempt.id,
            data: { lalamove_order_id: lalamoveOrderId },
            overrideAccess: true,
            req,
          })
        },
      })
      const body = await response.json() as {
        error?: string
        data?: { lalamoveOrderId?: string }
      }

      if (!response.ok) {
        const errorMessage = body.error || `Delivery booking failed with HTTP ${response.status}.`
        const ambiguous = providerSubmissionStarted
          && (response.status === 408 || response.status >= 500)
        const retryable = response.status === 429
          || (!providerSubmissionStarted && response.status >= 500)
        const terminal = response.status === 422 || response.status === 400
        const status = ambiguous
          ? 'unknown'
          : retryable && attemptNumber < MAX_ATTEMPTS
            ? 'retryable'
            : 'failed'
        const needsManual = ambiguous || terminal || status === 'failed'

        await req.payload.update({
          collection: 'delivery-fulfillment-attempts',
          id: attempt.id,
          data: {
            status: ambiguous ? 'unknown' : status,
            http_status: response.status,
            error: errorMessage,
            completed_at: new Date().toISOString(),
          },
          overrideAccess: true,
          req,
        })
        await req.payload.update({
          collection: 'delivery-fulfillment-outbox',
          id: item.id,
          data: {
            status: status === 'retryable' ? 'retryable' : ambiguous ? 'unknown' : 'failed',
            next_attempt_at: status === 'retryable'
              ? new Date(Date.now() + retryDelayMinutes(attemptNumber) * 60_000).toISOString()
              : null,
            lease_expires_at: null,
            last_error: errorMessage,
            manual_intervention_required: needsManual,
            manual_alerted_at: needsManual ? null : undefined,
            reconciliation_note: ambiguous
              ? 'The booking request may have been accepted. Do not retry until Lalamove is checked.'
              : null,
          },
          overrideAccess: true,
          req,
        })
        if (needsManual) {
          await alertManualIntervention(req, item.id, orderId, errorMessage)
        }
        continue
      }

      const lalamoveOrderId = body.data?.lalamoveOrderId
      if (!lalamoveOrderId) {
        const errorMessage = 'Booking endpoint returned success without a Lalamove order ID.'
        await req.payload.update({
          collection: 'delivery-fulfillment-attempts',
          id: attempt.id,
          data: {
            status: 'unknown',
            http_status: response.status,
            error: errorMessage,
            completed_at: new Date().toISOString(),
          },
          overrideAccess: true,
          req,
        })
        await req.payload.update({
          collection: 'delivery-fulfillment-outbox',
          id: item.id,
          data: {
            status: 'reconciliation_required',
            lease_expires_at: null,
            manual_intervention_required: true,
            manual_alerted_at: null,
            last_error: errorMessage,
            reconciliation_note: errorMessage,
          },
          overrideAccess: true,
          req,
        })
        await alertManualIntervention(req, item.id, orderId, errorMessage)
        continue
      }

      await req.payload.update({
        collection: 'delivery-fulfillment-attempts',
        id: attempt.id,
        data: {
          status: 'booked',
          http_status: response.status,
          lalamove_order_id: lalamoveOrderId,
          completed_at: new Date().toISOString(),
        },
        overrideAccess: true,
        req,
      })
      await req.payload.update({
        collection: 'delivery-fulfillment-outbox',
        id: item.id,
        data: {
          status: 'booked',
        lalamove_order_id: lalamoveOrderId,
          lease_expires_at: null,
          next_attempt_at: null,
          last_error: null,
          manual_intervention_required: false,
          manual_alerted_at: null,
          reconciliation_note: null,
        },
        overrideAccess: true,
        req,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const ambiguous = providerSubmissionStarted
      const status = ambiguous
        ? 'unknown'
        : attemptNumber < MAX_ATTEMPTS
          ? 'retryable'
          : 'failed'
      await req.payload.update({
        collection: 'delivery-fulfillment-attempts',
        id: attempt.id,
        data: {
          status: ambiguous ? 'unknown' : status,
          error: message,
          completed_at: new Date().toISOString(),
        },
        overrideAccess: true,
        req,
      })
      await req.payload.update({
        collection: 'delivery-fulfillment-outbox',
        id: item.id,
        data: {
          status,
          next_attempt_at: status === 'retryable'
            ? new Date(Date.now() + retryDelayMinutes(attemptNumber) * 60_000).toISOString()
            : null,
          lease_expires_at: null,
          last_error: message,
          manual_intervention_required: ambiguous || status === 'failed',
          manual_alerted_at: ambiguous || status === 'failed' ? null : undefined,
          reconciliation_note: ambiguous
            ? 'The booking request may have been accepted. Do not retry until Lalamove is checked.'
            : null,
        },
        overrideAccess: true,
        req,
      })
      if (ambiguous || status === 'failed') {
        await alertManualIntervention(req, item.id, orderId, message)
      }
    }
  }

  return { output: { processed: ready.docs.length, expiredLeases: expiredLease.docs.length } }
}

async function alertManualIntervention(
  req: PayloadRequest,
  outboxId: number | string,
  orderId: number | null,
  reason: string,
) {
  try {
    const outbox = await req.payload.findByID({
      collection: 'delivery-fulfillment-outbox',
      id: outboxId,
      depth: 0,
      overrideAccess: true,
      req,
    })
    await createAdminNotificationFanout(req.payload, {
      typeKey: 'delivery.fulfillment_manual_intervention',
      domain: 'order',
      title: 'Lalamove booking needs investigation',
      body: `Delivery fulfillment for order #${orderId ?? 'unknown'} requires manual review: ${reason}`,
      sourceEntityType: 'order',
      sourceEntityId: orderId ?? outboxId,
      priority: 'critical',
      idempotencyKey: `delivery-fulfillment:${outboxId}:attempt:${outbox.attempt_count}:manual-intervention`,
      metadata: { outboxId, orderId, reason },
    })
    await req.payload.update({
      collection: 'delivery-fulfillment-outbox',
      id: outboxId,
      data: { manual_alerted_at: new Date().toISOString() },
      overrideAccess: true,
      req,
    })
  } catch (error) {
    console.error(`[delivery-fulfillment] admin alert failed for outbox ${outboxId}:`, error)
  }
}

export const deliveryFulfillmentTaskConfig: TaskConfig<any> = {
  slug: 'delivery-fulfillment',
  label: 'Process paid delivery fulfillment',
  schedule: [{ cron: '* * * * *', queue: 'default' }],
  retries: { attempts: 3, backoff: { type: 'exponential', delay: 30_000 } },
  handler: deliveryFulfillmentTask as any,
}

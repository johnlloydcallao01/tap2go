import type { PayloadRequest, TaskConfig } from 'payload'
import { deliveryBookForFulfillment } from '../endpoints/deliveryBook'
import {
  getDeliveryProvider,
  mapLalamoveStatus,
  mapToOrderStatus,
} from '../services/deliveryProviders'
import { ensureDeliveryFulfillment } from '../services/deliveryFulfillmentOutbox'
import {
  amountInMinorUnits,
  getPayMongoSecretKey,
  retrievePayMongoIntent,
} from '../services/paymongoIntent'
import { isTerminalPaymentFailure } from '../services/orderPaymentRecovery'
import {
  createAdminNotificationFanout,
  createCustomerDeliveryBookingNotification,
} from '../utils/notificationFanout'

const LEASE_MINUTES = 5
const BATCH_SIZE = 2
const PAYMONGO_LOOKUP_BATCH_SIZE = 2
const PAYMONGO_STALE_MINUTES = 5
const PAYMONGO_CLAIM_MINUTES = 15
const PAYMONGO_ALERT_AFTER_CHECKS = 5
const PAYMONGO_MAX_ATTEMPTS = 2_147_483_647

type RelationId = number | string | { id?: number | string } | null | undefined

function relationId(value: RelationId): number | null {
  const id = value && typeof value === 'object' ? value.id : value
  const parsed = Number(id)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function retryDelayMinutes(attempt: number) {
  return Math.min(60, 2 ** Math.max(0, attempt - 1))
}

export function classifySubmissionFailure(httpStatus: number, providerSubmissionStarted: boolean) {
  const ambiguous = providerSubmissionStarted && (httpStatus === 408 || httpStatus >= 500)
  const retryable = httpStatus === 429 ||
    (!providerSubmissionStarted && (httpStatus === 408 || httpStatus >= 500))
  return {
    ambiguous,
    retryable: retryable && !ambiguous,
    terminal: httpStatus === 422 || httpStatus === 400,
  }
}

export function paymongoReconcileDelayMinutes(attempt: number) {
  return Math.min(360, 5 * 2 ** Math.max(0, attempt - 1))
}

export async function recoverStaleDeliveryPayments(
  req: PayloadRequest,
  now = new Date(),
) {
  const pendingStoppedAlerts = await req.payload.find({
    collection: 'transactions',
    where: {
      and: [
        { status: { equals: 'pending' } },
        { paymongo_reconcile_stopped: { equals: true } },
        { paymongo_reconcile_alerted_at: { exists: false } },
      ],
    },
    limit: PAYMONGO_LOOKUP_BATCH_SIZE,
    depth: 0,
    overrideAccess: true,
    req,
  })
  for (const transaction of pendingStoppedAlerts.docs as any[]) {
    await alertPayMongoReconciliation(
      req,
      transaction,
      now,
      String(transaction.paymongo_reconcile_last_status || 'manual_review'),
      String(transaction.paymongo_reconcile_last_error || 'Automated payment checks stopped.'),
      `stopped-${transaction.paymongo_reconcile_last_status || 'manual-review'}`,
      Number(transaction.paymongo_reconcile_attempt_count || 0),
    )
  }

  const staleBefore = new Date(now.getTime() - PAYMONGO_STALE_MINUTES * 60_000).toISOString()
  const dueChecks = [
    { paymongo_reconcile_next_check_at: { exists: false } },
    { paymongo_reconcile_next_check_at: { less_than_equal: now.toISOString() } },
  ]
  const candidates = await req.payload.find({
    collection: 'transactions',
    where: {
      and: [
        { status: { equals: 'pending' } },
        { transaction_type: { not_equals: 'priority_fee' } },
        { payment_intent_id: { exists: true } },
        { 'order.fulfillment_type': { equals: 'delivery' } },
        { paymongo_reconcile_stopped: { not_equals: true } },
        { createdAt: { less_than_equal: staleBefore } },
        { or: dueChecks },
      ],
    },
    sort: 'createdAt',
    limit: PAYMONGO_LOOKUP_BATCH_SIZE,
    depth: 1,
    overrideAccess: true,
    req,
  })

  let checked = 0
  let paid = 0
  for (const candidate of candidates.docs.slice(0, PAYMONGO_LOOKUP_BATCH_SIZE) as any[]) {
    const claimedAt = now.toISOString()
    const attemptCount = Math.min(
      PAYMONGO_MAX_ATTEMPTS,
      Math.max(0, Number(candidate.paymongo_reconcile_attempt_count) || 0) + 1,
    )
    const claim = await req.payload.update({
      collection: 'transactions',
      where: {
        and: [
          { id: { equals: candidate.id } },
          { status: { equals: 'pending' } },
          { createdAt: { less_than_equal: staleBefore } },
          { or: dueChecks },
        ],
      },
      data: {
        paymongo_reconcile_attempt_count: attemptCount,
        paymongo_reconcile_last_checked_at: claimedAt,
        paymongo_reconcile_next_check_at: new Date(
          now.getTime() + PAYMONGO_CLAIM_MINUTES * 60_000,
        ).toISOString(),
        paymongo_reconcile_last_status: 'checking',
        paymongo_reconcile_last_error: null,
      },
      overrideAccess: true,
      req,
    })
    if (claim.docs.length !== 1) continue
    checked += 1

    const orderId = relationId(candidate.order as RelationId)
    const paymentIntentId = String(candidate.payment_intent_id || '')
    try {
      if (!orderId || !paymentIntentId) {
        await stopPayMongoReconciliation(
          req,
          candidate,
          now,
          'invalid_local_reference',
          'The pending delivery transaction is missing its order or PayMongo intent reference.',
        )
        continue
      }

      const secretKey = getPayMongoSecretKey()
      if (!secretKey) {
        await schedulePayMongoRecheck(
          req,
          candidate,
          attemptCount,
          now,
          'lookup_unavailable',
          'PayMongo credentials are not configured for background verification.',
        )
        continue
      }

      const order = await req.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 0,
        overrideAccess: true,
        req,
      }) as any
      if (!order || order.fulfillment_type !== 'delivery') {
        await stopPayMongoReconciliation(
          req,
          candidate,
          now,
          'order_not_eligible',
          'The referenced order is not a delivery order.',
        )
        continue
      }

      const intentsOnTransactions = await req.payload.find({
        collection: 'transactions',
        where: { payment_intent_id: { equals: paymentIntentId } },
        limit: 2,
        depth: 0,
        overrideAccess: true,
        req,
      })
      if (
        intentsOnTransactions.docs.length !== 1 ||
        String(intentsOnTransactions.docs[0]?.id) !== String(candidate.id) ||
        String(relationId(intentsOnTransactions.docs[0]?.order as RelationId)) !== String(orderId)
      ) {
        await stopPayMongoReconciliation(
          req,
          candidate,
          now,
          'intent_transaction_mismatch',
          'The PayMongo intent is not linked to exactly one matching order transaction.',
        )
        continue
      }

      const intent = await retrievePayMongoIntent(paymentIntentId, secretKey)
      const attributes = intent?.attributes
      const providerStatus = String(attributes?.status || '').toLowerCase()

      if (String(intent?.id || '') !== paymentIntentId) {
        await stopPayMongoReconciliation(
          req,
          candidate,
          now,
          'intent_id_mismatch',
          'PayMongo returned an intent ID that does not match the stored transaction.',
        )
        continue
      }

      if (providerStatus !== 'succeeded') {
        if (isTerminalPaymentFailure(providerStatus)) {
          await markPayMongoTransactionFailed(
            req,
            candidate,
            now,
            providerStatus,
          )
        } else {
          await schedulePayMongoRecheck(
            req,
            candidate,
            attemptCount,
            now,
            providerStatus || 'unknown',
            'PayMongo has not confirmed a successful payment yet.',
          )
        }
        continue
      }

      const transactionAmount = amountInMinorUnits(candidate.amount)
      const orderAmount = amountInMinorUnits(order.total)
      const intentAmount = Number(attributes?.amount)
      const transactionCurrency = String(candidate.currency || '').toUpperCase()
      const intentCurrency = String(attributes?.currency || '').toUpperCase()
      if (
        !Number.isSafeInteger(intentAmount) ||
        intentAmount <= 0 ||
        transactionAmount === null ||
        transactionAmount !== intentAmount ||
        orderAmount === null ||
        orderAmount !== intentAmount ||
        !transactionCurrency ||
        transactionCurrency !== intentCurrency
      ) {
        await stopPayMongoReconciliation(
          req,
          candidate,
          now,
          'succeeded_mismatch',
          'The succeeded PayMongo intent does not exactly match the stored order amount and currency.',
        )
        continue
      }

      const committed = await persistVerifiedDeliveryPayment(
        req,
        candidate,
        orderId,
        now,
        paymentIntentId,
        intentAmount,
        intentCurrency,
      )
      if (committed) paid += 1
      else {
        await schedulePayMongoRecheck(
          req,
          candidate,
          attemptCount,
          now,
          'local_state_changed',
          'Local order or transaction state changed while PayMongo was being verified.',
        )
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(
        `[delivery-fulfillment] PayMongo reconciliation failed for transaction ${candidate.id}: ${message}`,
      )
      await schedulePayMongoRecheck(
        req,
        candidate,
        attemptCount,
        now,
        'lookup_error',
        message,
      )
    }
  }

  return { checked, paid }
}

async function schedulePayMongoRecheck(
  req: PayloadRequest,
  transaction: any,
  attemptCount: number,
  now: Date,
  lastStatus: string,
  lastError: string,
) {
  const updated = await req.payload.update({
    collection: 'transactions',
    where: {
      and: [
        { id: { equals: transaction.id } },
        { status: { equals: 'pending' } },
      ],
    },
    data: {
      paymongo_reconcile_last_checked_at: now.toISOString(),
      paymongo_reconcile_next_check_at: new Date(
        now.getTime() + paymongoReconcileDelayMinutes(attemptCount) * 60_000,
      ).toISOString(),
      paymongo_reconcile_last_status: lastStatus.slice(0, 100),
      paymongo_reconcile_last_error: lastError.slice(0, 2000),
    },
    overrideAccess: true,
    req,
  })
  if (
    updated.docs.length !== 1 ||
    attemptCount < PAYMONGO_ALERT_AFTER_CHECKS ||
    transaction.paymongo_reconcile_alerted_at
  ) return
  await alertPayMongoReconciliation(
    req,
    transaction,
    now,
    lastStatus,
    lastError,
    'stale-pending',
    attemptCount,
  )
}

async function stopPayMongoReconciliation(
  req: PayloadRequest,
  transaction: any,
  now: Date,
  lastStatus: string,
  lastError: string,
) {
  const updated = await req.payload.update({
    collection: 'transactions',
    where: {
      and: [
        { id: { equals: transaction.id } },
        { status: { equals: 'pending' } },
      ],
    },
    data: {
      paymongo_reconcile_last_checked_at: now.toISOString(),
      paymongo_reconcile_next_check_at: null,
      paymongo_reconcile_last_status: lastStatus.slice(0, 100),
      paymongo_reconcile_last_error: lastError.slice(0, 2000),
      paymongo_reconcile_stopped: true,
    },
    overrideAccess: true,
    req,
  })
  if (updated.docs.length !== 1) return
  await alertPayMongoReconciliation(
    req,
    transaction,
    now,
    lastStatus,
    lastError,
    `stopped-${lastStatus}`,
    Number(transaction.paymongo_reconcile_attempt_count || 0) + 1,
  )
}

async function alertPayMongoReconciliation(
  req: PayloadRequest,
  transaction: any,
  now: Date,
  lastStatus: string,
  lastError: string,
  alertKey: string,
  attempts: number,
) {
  try {
    const orderId = relationId(transaction.order as RelationId)
    await createAdminNotificationFanout(req.payload, {
      typeKey: 'payment.delivery_reconciliation_required',
      domain: 'order',
      title: 'Delivery payment needs review',
      body: `PayMongo reconciliation for order #${orderId ?? 'unknown'} needs review after ${attempts} checks. Latest status: ${lastStatus}. ${lastError}`,
      sourceEntityType: 'transaction',
      sourceEntityId: transaction.id,
      priority: 'critical',
      idempotencyKey: `paymongo-reconcile:${transaction.id}:${alertKey}`,
      metadata: {
        transactionId: transaction.id,
        orderId,
        attempts,
        lastStatus,
        lastError: lastError.slice(0, 500),
      },
    })
    await req.payload.update({
      collection: 'transactions',
      where: {
        and: [
          { id: { equals: transaction.id } },
          { status: { equals: 'pending' } },
          { paymongo_reconcile_alerted_at: { exists: false } },
        ],
      },
      data: { paymongo_reconcile_alerted_at: now.toISOString() },
      overrideAccess: true,
      req,
    })
  } catch (error) {
    console.error(
      `[delivery-fulfillment] PayMongo admin alert failed for transaction ${transaction.id}:`,
      error,
    )
  }
}

async function markPayMongoTransactionFailed(
  req: PayloadRequest,
  transaction: any,
  now: Date,
  providerStatus: string,
) {
  await req.payload.update({
    collection: 'transactions',
    where: {
      and: [
        { id: { equals: transaction.id } },
        { status: { equals: 'pending' } },
      ],
    },
    data: {
      status: 'failed',
      paymongo_reconcile_last_checked_at: now.toISOString(),
      paymongo_reconcile_next_check_at: null,
      paymongo_reconcile_last_status: providerStatus,
      paymongo_reconcile_last_error: null,
    },
    overrideAccess: true,
    req,
  })
}

async function persistVerifiedDeliveryPayment(
  req: PayloadRequest,
  transaction: any,
  orderId: number,
  now: Date,
  paymentIntentId: string,
  intentAmount: number,
  intentCurrency: string,
): Promise<boolean> {
  const transactionID = await req.payload.db.beginTransaction()
  if (!transactionID) throw new Error('Database transaction support is required for payment reconciliation.')
  req.transactionID = transactionID
  try {
    const currentTransaction = await req.payload.findByID({
      collection: 'transactions',
      id: transaction.id,
      depth: 0,
      overrideAccess: true,
      req,
    }) as any
    const order = await req.payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 0,
      overrideAccess: true,
      req,
    }) as any
    const transactionAmount = amountInMinorUnits(currentTransaction?.amount)
    const orderAmount = amountInMinorUnits(order?.total)
    if (
      !currentTransaction ||
      !['pending', 'paid'].includes(String(currentTransaction.status)) ||
      String(currentTransaction.payment_intent_id || '') !== paymentIntentId ||
      String(relationId(currentTransaction.order as RelationId)) !== String(orderId) ||
      transactionAmount !== intentAmount ||
      orderAmount !== intentAmount ||
      String(currentTransaction.currency || '').toUpperCase() !== intentCurrency ||
      !order ||
      order.fulfillment_type !== 'delivery'
    ) {
      await req.payload.db.rollbackTransaction(transactionID)
      req.transactionID = undefined
      return false
    }

    await req.payload.update({
      collection: 'transactions',
      id: transaction.id,
      data: {
        status: 'paid',
        paid_at: currentTransaction.paid_at || now.toISOString(),
        paymongo_reconcile_last_checked_at: now.toISOString(),
        paymongo_reconcile_next_check_at: null,
        paymongo_reconcile_last_status: 'succeeded',
        paymongo_reconcile_last_error: null,
      },
      overrideAccess: true,
      req,
    })

    if (order.status === 'pending') {
      await req.payload.update({
        collection: 'orders',
        id: orderId,
        data: { status: 'accepted' },
        overrideAccess: true,
        req,
      })
    }
    if (order.status !== 'cancelled') {
      await ensureDeliveryFulfillment(req, orderId)
    }
    await req.payload.db.commitTransaction(transactionID)
    req.transactionID = undefined
    if (order.status === 'cancelled') {
      try {
        await createAdminNotificationFanout(req.payload, {
          typeKey: 'payment.delivery_payment_after_cancellation',
          domain: 'order',
          title: 'Paid delivery order is cancelled',
          body: `PayMongo confirmed payment for cancelled order #${orderId}. Review the payment and refund if appropriate.`,
          sourceEntityType: 'transaction',
          sourceEntityId: transaction.id,
          priority: 'critical',
          idempotencyKey: `paymongo-reconcile:${transaction.id}:cancelled-paid`,
          metadata: { transactionId: transaction.id, orderId },
        })
      } catch (error) {
        console.error(
          `[delivery-fulfillment] cancelled-order payment alert failed for transaction ${transaction.id}:`,
          error,
        )
      }
    }
    return true
  } catch (error) {
    await req.payload.db.rollbackTransaction(transactionID)
    req.transactionID = undefined
    throw error
  }
}

export async function deliveryFulfillmentTask({ req }: { req: PayloadRequest }) {
  const now = new Date()
  const paymongoRecovery = await recoverStaleDeliveryPayments(req, now)
  if (paymongoRecovery.checked > 0) {
    console.info('[delivery-fulfillment] PayMongo background reconciliation', paymongoRecovery)
  }
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
    if (order.fulfillment_type === 'delivery' && order.status !== 'cancelled') {
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
      await createCustomerDeliveryBookingNotification(req.payload, orderId).catch((error) =>
        console.error(
          `[delivery-fulfillment] customer booking notification failed for order ${orderId}:`,
          error,
        ),
      )
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
        const { ambiguous, retryable, terminal } = classifySubmissionFailure(
          response.status,
          providerSubmissionStarted,
        )
        const status = ambiguous ? 'unknown' : retryable ? 'retryable' : 'failed'
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
      await createCustomerDeliveryBookingNotification(req.payload, orderId).catch((error) =>
        console.error(
          `[delivery-fulfillment] customer booking notification failed for order ${orderId}:`,
          error,
        ),
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const ambiguous = providerSubmissionStarted
      const status = ambiguous ? 'unknown' : 'retryable'
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
          manual_intervention_required: ambiguous,
          manual_alerted_at: ambiguous ? null : undefined,
          reconciliation_note: ambiguous
            ? 'The booking request may have been accepted. Do not retry until Lalamove is checked.'
            : null,
        },
        overrideAccess: true,
        req,
      })
      if (ambiguous) {
        await alertManualIntervention(req, item.id, orderId, message)
      }
    }
  }

  return {
    output: {
      processed: ready.docs.length,
      expiredLeases: expiredLease.docs.length,
      paymongoRecovery,
    },
  }
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

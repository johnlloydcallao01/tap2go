import crypto from 'crypto'
import type { PayloadRequest } from 'payload'
import { getDeliveryProvider } from '../services/deliveryProviders'
import { PAYMONGO_STATEMENT_DESCRIPTOR } from '../services/paymongo'

type PriorityFeeTransaction = {
  id: number
  order: number | { id?: number }
  payment_intent_id?: string | null
  payment_id?: string | null
  refund_id?: string | null
  amount: number
  status: string
  transaction_type?: string | null
  priority_fee_total?: number | null
  priority_fee_fulfillment_status?: string | null
}

function relationId(value: unknown): number | null {
  const raw = value && typeof value === 'object' && 'id' in value
    ? (value as { id?: unknown }).id
    : value
  const id = Number(raw)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

function isActivePriorityFeeConflict(error: unknown): boolean {
  let current = error
  for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
    const record = current as { code?: unknown; constraint?: unknown; cause?: unknown }
    if (
      record.code === '23505' &&
      record.constraint === 'transactions_one_active_priority_fee_per_order_idx'
    ) {
      return true
    }
    current = record.cause
  }
  return false
}

async function readBody(req: PayloadRequest): Promise<Record<string, unknown>> {
  const request = req as unknown as { json?: () => Promise<unknown>; body?: unknown }
  const body = typeof request.json === 'function' ? await request.json() : request.body
  return body && typeof body === 'object' ? body as Record<string, unknown> : {}
}

async function getOwnedOrder(
  req: PayloadRequest,
  orderId: number,
  customerUserId: number,
) {
  const { docs } = await req.payload.find({
    collection: 'orders',
    where: {
      and: [
        { id: { equals: orderId } },
        { 'customer.user': { equals: customerUserId } },
      ],
    },
    limit: 1,
    depth: 1,
    pagination: false,
    overrideAccess: true,
  })
  return docs[0] as Record<string, any> | undefined
}

async function getBooking(req: PayloadRequest, orderId: number) {
  const { docs } = await req.payload.find({
    collection: 'delivery-bookings',
    where: { order: { equals: orderId } },
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  return docs[0] as Record<string, any> | undefined
}

function getPayMongoSecret(): string | null {
  return process.env.PAYMONGO_SANDBOX === 'true'
    ? process.env.PAYMONGO_SANDBOX_API_KEY || null
    : process.env.PAYMONGO_SECRET_KEY_LIVE || null
}

async function retrievePaymentIntent(paymentIntentId: string, secretKey: string) {
  const response = await fetch(
    `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
      },
      signal: AbortSignal.timeout(10000),
    },
  )
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data?.data?.id) {
    throw new Error('Unable to verify this payment with PayMongo.')
  }
  return data.data
}

async function markPriorityFeeFailed(
  req: PayloadRequest,
  transaction: PriorityFeeTransaction,
  reason: string,
): Promise<boolean> {
  console.error(`[delivery/priority-fee] Transaction ${transaction.id} could not be applied: ${reason}`)
  const refund = await refundPriorityFee(req, transaction, reason)
  await req.payload.update({
    collection: 'transactions',
    id: transaction.id,
    data: {
      priority_fee_fulfillment_status: 'failed',
      ...(refund ? { status: 'refunded', refund_id: refund.id } : {}),
    },
    overrideAccess: true,
  })
  return Boolean(refund)
}

async function refundPriorityFee(
  req: PayloadRequest,
  transaction: PriorityFeeTransaction,
  reason: string,
): Promise<{ id: string } | null> {
  if (transaction.status === 'refunded' || transaction.refund_id) return null
  if (transaction.payment_intent_id?.startsWith('sandbox_priority_')) return null
  const secretKey = getPayMongoSecret()
  if (!secretKey) {
    console.error(`[delivery/priority-fee] Cannot refund transaction ${transaction.id}: PayMongo secret key is missing.`)
    return null
  }

  let paymentId = transaction.payment_id || ''
  if (!paymentId && transaction.payment_intent_id) {
    try {
      const intent = await retrievePaymentIntent(transaction.payment_intent_id, secretKey)
      paymentId = String(intent?.attributes?.payments?.data?.[0]?.id || '')
    } catch (error) {
      console.error(`[delivery/priority-fee] Could not find payment for refund ${transaction.id}:`, error)
      return null
    }
  }
  if (!paymentId) {
    console.error(`[delivery/priority-fee] Cannot refund transaction ${transaction.id}: PayMongo payment ID is missing.`)
    return null
  }

  try {
    const response = await fetch('https://api.paymongo.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Idempotency-Key': `priority-fee-refund-${transaction.id}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(Number(transaction.amount) * 100),
            payment_id: paymentId,
            reason: 'others',
            notes: 'Priority fee could not be applied to the delivery.',
          },
        },
      }),
      signal: AbortSignal.timeout(12000),
    })
    const data = await response.json().catch(() => ({}))
    const refundId = String(data?.data?.id || '')
    if (!response.ok || !refundId) {
      console.error(`[delivery/priority-fee] PayMongo refund failed for transaction ${transaction.id}:`, {
        status: response.status,
        detail: data?.errors?.[0]?.detail,
      })
      return null
    }
    return { id: refundId }
  } catch (error) {
    console.error(`[delivery/priority-fee] PayMongo refund request failed for transaction ${transaction.id}:`, error)
    return null
  }
}

export async function applyPaidPriorityFee(
  req: PayloadRequest,
  transaction: PriorityFeeTransaction,
): Promise<{ state: 'applied' | 'pending' | 'failed'; message?: string }> {
  const orderId = relationId(transaction.order)
  const targetFee = Number(transaction.priority_fee_total)
  if (!orderId || !Number.isFinite(targetFee) || targetFee <= 0) {
    const refunded = await markPriorityFeeFailed(req, transaction, 'The saved order or fee amount is invalid.')
    return {
      state: 'failed',
      message: refunded
        ? 'The priority fee could not be applied. A refund has been initiated.'
        : 'The priority fee could not be applied. Please contact support.',
    }
  }

  const order = await req.payload.findByID({
    collection: 'orders',
    id: orderId,
    depth: 0,
    overrideAccess: true,
  }) as Record<string, any> | null
  const booking = await getBooking(req, orderId)
  const lalamoveOrderId = String(booking?.lalamove_order_id || order?.lalamove_order_id || '')
  if (!order || !booking || !lalamoveOrderId) {
    const refunded = await markPriorityFeeFailed(req, transaction, 'No active Lalamove booking was found.')
    return {
      state: 'failed',
      message: refunded
        ? 'The priority fee could not be applied. A refund has been initiated.'
        : 'The priority fee could not be applied. Please contact support.',
    }
  }

  const currentFee = Number(booking.priority_fee ?? order.priority_fee) || 0
  if (currentFee >= targetFee) {
    const discount = Number(order.discount_total) || 0
    const deliveryFee = Number(order.delivery_fee ?? booking.delivery_fee) || 0
    const platformFee = Number(order.platform_fee) || 0
    const total = Math.max(
      0,
      Math.round((Number(order.subtotal || 0) + deliveryFee + platformFee + currentFee - discount) * 100) / 100,
    )
    await req.payload.update({
      collection: 'orders',
      id: orderId,
      data: { priority_fee: currentFee, total },
      overrideAccess: true,
    })
    await req.payload.update({
      collection: 'transactions',
      id: transaction.id,
      data: { priority_fee_fulfillment_status: 'applied' },
      overrideAccess: true,
    })
    return { state: 'applied' }
  }

  const provider = await getDeliveryProvider(req.payload)
  let liveOrder: any
  try {
    liveOrder = await provider.getOrderDetails(lalamoveOrderId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lalamove status lookup failed.'
    const refunded = await markPriorityFeeFailed(req, transaction, message)
    return {
      state: 'failed',
      message: refunded
        ? 'Payment was received, but Lalamove could not apply the fee. A refund has been initiated.'
        : 'Payment was received, but the priority fee could not be applied. Please contact support.',
    }
  }

  if (String(liveOrder?.status || '').toUpperCase() !== 'ASSIGNING_DRIVER') {
    const refunded = await markPriorityFeeFailed(req, transaction, 'A driver has already accepted the delivery.')
    return {
      state: 'failed',
      message: refunded
        ? 'Payment was received, but a rider was matched before the fee could be applied. A refund has been initiated.'
        : 'Payment was received, but a rider was matched before the fee could be applied. Please contact support.',
    }
  }

  let lalamoveResponse: any
  try {
    lalamoveResponse = await provider.addPriorityFee(lalamoveOrderId, targetFee.toFixed(2))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lalamove rejected the priority fee.'
    const refunded = await markPriorityFeeFailed(req, transaction, message)
    return {
      state: 'failed',
      message: refunded
        ? 'Payment was received, but Lalamove could not apply the fee. A refund has been initiated.'
        : 'Payment was received, but the priority fee could not be applied. Please contact support.',
    }
  }

  const appliedFee = Number(lalamoveResponse?.priceBreakdown?.priorityFee)
  const persistedFee = Number.isFinite(appliedFee) && appliedFee > 0 && appliedFee >= currentFee
    ? appliedFee
    : targetFee
  const discount = Number(order.discount_total) || 0
  const deliveryFee = Number(order.delivery_fee ?? booking.delivery_fee) || 0
  const platformFee = Number(order.platform_fee) || 0
  const total = Math.max(
    0,
    Math.round((Number(order.subtotal || 0) + deliveryFee + platformFee + persistedFee - discount) * 100) / 100,
  )

  await req.payload.update({
    collection: 'delivery-bookings',
    id: booking.id,
    data: { priority_fee: persistedFee },
    overrideAccess: true,
  })
  await req.payload.update({
    collection: 'orders',
    id: orderId,
    data: { priority_fee: persistedFee, total },
    overrideAccess: true,
  })
  await req.payload.create({
    collection: 'order-tracking',
    data: {
      order: orderId,
      status: 'accepted' as any,
      timestamp: new Date().toISOString(),
      description: `Customer added a priority fee of ₱${(persistedFee - currentFee).toFixed(2)} while rider matching was in progress.`,
    },
    overrideAccess: true,
  })
  await req.payload.update({
    collection: 'transactions',
    id: transaction.id,
    data: { priority_fee_fulfillment_status: 'applied' },
    overrideAccess: true,
  })
  return { state: 'applied' }
}

async function hasPaidOrder(req: PayloadRequest, orderId: number): Promise<boolean> {
  const { docs } = await req.payload.find({
    collection: 'transactions',
    where: {
      and: [
        { order: { equals: orderId } },
        { transaction_type: { equals: 'order' } },
        { status: { equals: 'paid' } },
      ],
    },
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  return docs.length > 0
}

async function checkOrderEligibility(req: PayloadRequest, order: Record<string, any>, booking: Record<string, any>) {
  if (order.fulfillment_type !== 'delivery' || !order.lalamove_order_id || !booking?.lalamove_order_id) {
    return 'This order does not have an active delivery.'
  }
  if (['cancelled', 'canceled', 'delivered'].includes(String(order.status || '').toLowerCase())) {
    return 'This order is no longer active.'
  }
  const provider = await getDeliveryProvider(req.payload)
  const liveOrder = await provider.getOrderDetails(String(booking.lalamove_order_id))
  if (String(liveOrder?.status || '').toUpperCase() !== 'ASSIGNING_DRIVER') {
    return 'Priority fees can only be added while Lalamove is searching for a rider.'
  }
  return null
}

async function findActivePriorityFeePayment(req: PayloadRequest, orderId: number) {
  const { docs } = await req.payload.find({
    collection: 'transactions',
    where: {
      and: [
        { order: { equals: orderId } },
        { transaction_type: { equals: 'priority_fee' } },
        { status: { in: ['pending', 'paid'] } },
        { priority_fee_fulfillment_status: { in: ['pending', 'applying'] } },
      ],
    },
    sort: '-id',
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  return docs[0] as PriorityFeeTransaction | undefined
}

export async function deliveryPriorityFeePrepareHandler(req: PayloadRequest) {
  try {
    if (!req.user || !['service', 'admin'].includes(String(req.user.role))) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await readBody(req)
    const orderId = Number(body.orderId)
    const customerUserId = Number(body.customerId)
    const additionalAmount = Number(body.additionalAmount)
    if (
      !Number.isSafeInteger(orderId) || orderId <= 0 ||
      !Number.isSafeInteger(customerUserId) || customerUserId <= 0 ||
      !Number.isFinite(additionalAmount) || additionalAmount < 1 ||
      Math.round(additionalAmount * 100) !== additionalAmount * 100
    ) {
      return Response.json({ error: 'A valid order, customer, and additional fee of at least PHP 1.00 are required.' }, { status: 400 })
    }

    const order = await getOwnedOrder(req, orderId, customerUserId)
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 })
    const booking = await getBooking(req, orderId)
    if (!booking) return Response.json({ error: 'No delivery booking was found for this order.' }, { status: 409 })
    const eligibilityError = await checkOrderEligibility(req, order, booking)
    if (eligibilityError) return Response.json({ error: eligibilityError }, { status: 409 })
    if (!(await hasPaidOrder(req, orderId))) {
      return Response.json({ error: 'The original order payment must be confirmed before adding a priority fee.' }, { status: 409 })
    }

    const currentFee = Number(booking.priority_fee) || 0
    const targetFee = Math.round((currentFee + additionalAmount) * 100) / 100
    const { docs: failedPaidPayments } = await req.payload.find({
      collection: 'transactions',
      where: {
        and: [
          { order: { equals: orderId } },
          { transaction_type: { equals: 'priority_fee' } },
          { status: { equals: 'paid' } },
          { priority_fee_fulfillment_status: { equals: 'failed' } },
        ],
      },
      sort: '-id',
      limit: 1,
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })
    if (failedPaidPayments.length > 0) {
      return Response.json({
        error: 'A previous priority-fee payment was received but could not be applied. Please contact support before making another payment.',
        code: 'PRIORITY_FEE_REQUIRES_SUPPORT',
      }, { status: 409 })
    }

    const activePayment = await findActivePriorityFeePayment(req, orderId)
    if (activePayment) {
      if (Number(activePayment.amount) !== additionalAmount) {
        return Response.json({
          error: 'A priority-fee payment is already in progress. Complete it or wait for its status to update before starting another.',
          code: 'PRIORITY_FEE_PAYMENT_IN_PROGRESS',
        }, { status: 409 })
      }

      if (activePayment.status === 'paid') {
        const applied = await applyPaidPriorityFee(req, activePayment)
        return Response.json({ ...applied, amount: additionalAmount })
      }

      const secretKey = getPayMongoSecret()
      if (!secretKey || !activePayment.payment_intent_id) {
        return Response.json({ error: 'The pending priority-fee payment cannot be resumed. Please contact support.' }, { status: 503 })
      }
      const intent = await retrievePaymentIntent(activePayment.payment_intent_id, secretKey)
      const intentStatus = String(intent?.attributes?.status || '').toLowerCase()
      if (intentStatus === 'succeeded') {
        const updated = await req.payload.update({
          collection: 'transactions',
          id: activePayment.id,
          data: {
            status: 'paid',
            paid_at: new Date().toISOString(),
            payment_id: String(intent?.attributes?.payments?.data?.[0]?.id || ''),
            priority_fee_fulfillment_status: 'pending',
          },
          overrideAccess: true,
        }) as unknown as PriorityFeeTransaction
        const applied = await applyPaidPriorityFee(req, updated)
        return Response.json({ ...applied, amount: additionalAmount })
      }
      const qrImage = intent?.attributes?.next_action?.code?.image_url
      if (intentStatus === 'awaiting_next_action' && typeof qrImage === 'string') {
        return Response.json({
          state: 'qr',
          qrImage,
          paymentIntentId: activePayment.payment_intent_id,
          amount: Number(activePayment.amount),
          targetFee: Number(activePayment.priority_fee_total),
        })
      }
      if (intentStatus !== 'awaiting_payment_method') {
        return Response.json({
          error: 'This payment is still being processed. Check the order again before trying another payment.',
          code: 'PRIORITY_FEE_PAYMENT_PROCESSING',
        }, { status: 409 })
      }
      return Response.json({
        state: 'attach',
        paymentIntentId: activePayment.payment_intent_id,
        clientKey: intent?.attributes?.client_key || null,
        amount: Number(activePayment.amount),
        targetFee: Number(activePayment.priority_fee_total),
      })
    }

    if (process.env.PAYMONGO_SANDBOX === 'true') {
      const sandboxTransaction = await req.payload.create({
        collection: 'transactions',
        data: {
          order: orderId,
          payment_intent_id: `sandbox_priority_${crypto.randomUUID()}`,
          payment_method: 'qrph',
          amount: additionalAmount,
          currency: 'PHP',
          status: 'paid',
          paid_at: new Date().toISOString(),
          transaction_type: 'priority_fee',
          priority_fee_total: targetFee,
          priority_fee_fulfillment_status: 'pending',
        },
        overrideAccess: true,
      }) as unknown as PriorityFeeTransaction
      const applied = await applyPaidPriorityFee(req, sandboxTransaction)
      return Response.json({ ...applied, amount: additionalAmount })
    }

    const secretKey = getPayMongoSecret()
    if (!secretKey) {
      console.error('[delivery/priority-fee] PayMongo secret key is not configured')
      return Response.json({ error: 'Payment is temporarily unavailable.' }, { status: 503 })
    }

    const idempotencyKey = crypto.randomUUID()
    const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(additionalAmount * 100),
            currency: 'PHP',
            description: `Tap2Go priority fee for order #${orderId}`,
            statement_descriptor: PAYMONGO_STATEMENT_DESCRIPTOR,
            payment_method_allowed: ['qrph'],
            metadata: {
              orderId: String(orderId),
              transactionType: 'priority_fee',
              priorityFeeTotal: targetFee.toFixed(2),
            },
          },
        },
      }),
      signal: AbortSignal.timeout(12000),
    })
    const intentResponse = await response.json().catch(() => ({}))
    const intent = intentResponse?.data
    if (!response.ok || !intent?.id || !intent?.attributes?.client_key) {
      console.error('[delivery/priority-fee] PayMongo intent creation failed', {
        orderId,
        status: response.status,
        details: intentResponse?.errors?.[0]?.detail,
      })
      return Response.json({
        error: intentResponse?.errors?.[0]?.detail || 'PayMongo could not prepare this payment.',
      }, { status: response.ok ? 502 : response.status })
    }
    if (Number(intent.attributes.amount) !== Math.round(additionalAmount * 100)) {
      return Response.json({ error: 'PayMongo returned a different amount than requested.' }, { status: 502 })
    }

    let transaction: { id: number }
    try {
      transaction = await req.payload.create({
        collection: 'transactions',
        data: {
          order: orderId,
          payment_intent_id: String(intent.id),
          payment_method: 'qrph',
          amount: additionalAmount,
          currency: 'PHP',
          status: 'pending',
          transaction_type: 'priority_fee',
          priority_fee_total: targetFee,
          priority_fee_fulfillment_status: 'pending',
        },
        overrideAccess: true,
      })
    } catch (error) {
      if (isActivePriorityFeeConflict(error)) {
        return Response.json({
          error: 'A priority-fee payment is already in progress. Check the order before trying again.',
          code: 'PRIORITY_FEE_PAYMENT_IN_PROGRESS',
        }, { status: 409 })
      }
      throw error
    }

    return Response.json({
      state: 'attach',
      transactionId: transaction.id,
      paymentIntentId: String(intent.id),
      clientKey: String(intent.attributes.client_key),
      amount: additionalAmount,
      targetFee,
    })
  } catch (error) {
    console.error('[delivery/priority-fee] Prepare failed:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to prepare the priority-fee payment.' },
      { status: 500 },
    )
  }
}

export async function deliveryPriorityFeeStatusHandler(req: PayloadRequest) {
  try {
    if (!req.user || !['service', 'admin'].includes(String(req.user.role))) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await readBody(req)
    const orderId = Number(body.orderId)
    const customerUserId = Number(body.customerId)
    const paymentIntentId = String(body.paymentIntentId || '')
    if (!Number.isSafeInteger(orderId) || orderId <= 0 ||
      !Number.isSafeInteger(customerUserId) || customerUserId <= 0 ||
      !paymentIntentId) {
      return Response.json({ error: 'orderId, customerId, and paymentIntentId are required.' }, { status: 400 })
    }

    const order = await getOwnedOrder(req, orderId, customerUserId)
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 })
    const { docs } = await req.payload.find({
      collection: 'transactions',
      where: {
        and: [
          { order: { equals: orderId } },
          { payment_intent_id: { equals: paymentIntentId } },
          { transaction_type: { equals: 'priority_fee' } },
        ],
      },
      limit: 1,
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })
    const transaction = docs[0] as unknown as PriorityFeeTransaction | undefined
    if (!transaction) return Response.json({ error: 'Priority-fee payment not found.' }, { status: 404 })

    let currentTransaction = transaction
    if (transaction.status === 'pending') {
      const secretKey = getPayMongoSecret()
      if (!secretKey) return Response.json({ error: 'Payment status is temporarily unavailable.' }, { status: 503 })
      const intent = await retrievePaymentIntent(paymentIntentId, secretKey)
      const intentStatus = String(intent?.attributes?.status || '').toLowerCase()
      if (intentStatus === 'succeeded') {
        currentTransaction = await req.payload.update({
          collection: 'transactions',
          id: transaction.id,
          data: {
            status: 'paid',
            paid_at: new Date().toISOString(),
            priority_fee_fulfillment_status: 'pending',
          },
          overrideAccess: true,
        }) as unknown as PriorityFeeTransaction
      } else if (['awaiting_payment_method', 'canceled'].includes(intentStatus)) {
        currentTransaction = await req.payload.update({
          collection: 'transactions',
          id: transaction.id,
          data: {
            status: 'failed',
            priority_fee_fulfillment_status: 'failed',
          },
          overrideAccess: true,
        }) as unknown as PriorityFeeTransaction
      }
    }

    let fulfillmentState = String(currentTransaction.priority_fee_fulfillment_status || 'pending')
    let message: string | undefined
    if (currentTransaction.status === 'paid' && !['applied', 'failed'].includes(fulfillmentState)) {
      const result = await applyPaidPriorityFee(req, currentTransaction)
      fulfillmentState = result.state
      message = result.message
    }

    if (currentTransaction.status === 'failed' || currentTransaction.status === 'refunded') {
      return Response.json({
        status: 'failed',
        fulfillmentStatus: fulfillmentState,
        refunded: Boolean(currentTransaction.refund_id),
        message: currentTransaction.refund_id
          ? 'The priority fee could not be applied. A refund has been initiated.'
          : undefined,
      })
    }
    if (currentTransaction.status !== 'paid' || fulfillmentState === 'pending' || fulfillmentState === 'applying') {
      return Response.json({ status: 'pending', fulfillmentStatus: fulfillmentState })
    }
    return Response.json({
      status: fulfillmentState === 'applied' ? 'applied' : 'failed',
      fulfillmentStatus: fulfillmentState,
      refunded: Boolean(currentTransaction.refund_id),
      message,
    })
  } catch (error) {
    console.error('[delivery/priority-fee] Status check failed:', error)
    return Response.json({ error: 'Unable to verify the priority-fee payment.' }, { status: 500 })
  }
}

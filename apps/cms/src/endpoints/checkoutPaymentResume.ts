import type { PayloadRequest } from 'payload'
import {
  classifyPayMongoIntentStatus,
  isOrderOwnedByCustomer,
} from '../services/orderPaymentRecovery'
import { PAYMONGO_STATEMENT_DESCRIPTOR } from '../services/paymongo'

const PAYMENT_METHODS = new Set([
  'qrph',
  'gcash',
  'grab_pay',
  'paymaya',
  'billease',
  'dob',
  'brankas',
  'card',
])

function relationId(value: unknown): string | null {
  const raw = value && typeof value === 'object' && 'id' in value
    ? (value as { id?: unknown }).id
    : value
  return raw === null || raw === undefined || raw === '' ? null : String(raw)
}

function getSecretKey(): string | null {
  return process.env.PAYMONGO_SANDBOX === 'true'
    ? process.env.PAYMONGO_SANDBOX_API_KEY || null
    : process.env.PAYMONGO_SECRET_KEY_LIVE || null
}

async function retrieveIntent(paymentIntentId: string, secretKey: string) {
  const response = await fetch(
    `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
      },
    },
  )
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error('Unable to verify the payment with PayMongo. Please try again shortly.')
  }
  return body?.data
}

function getPaymentAction(intent: any) {
  const nextAction = intent?.attributes?.next_action
  const qrImage = nextAction?.code?.image_url
  if (typeof qrImage === 'string' && qrImage) {
    return { type: 'qr', qrImage }
  }
  const redirectUrl = nextAction?.redirect?.url
  if (typeof redirectUrl === 'string' && redirectUrl) {
    return { type: 'redirect', redirectUrl }
  }
  return null
}

export async function checkoutPaymentResumeHandler(req: PayloadRequest) {
  try {
    if (!req.user || !['service', 'admin'].includes(String(req.user.role))) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = (await (typeof (req as any).json === 'function'
      ? (req as any).json()
      : Promise.resolve((req as any).body))) ?? {}
    const orderId = Number(body.orderId)
    const customerUserId = Number(body.customerId)
    const confirmAttached = body.confirmAttached === true
    const requestedTransactionId = body.transactionId == null ? null : String(body.transactionId)

    if (!Number.isSafeInteger(orderId) || orderId <= 0 ||
      !Number.isSafeInteger(customerUserId) || customerUserId <= 0) {
      return Response.json({ error: 'orderId and customerId are required' }, { status: 400 })
    }

    const order = await req.payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 1,
      overrideAccess: true,
    }) as any
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 })
    const orderCustomer = order?.customer && typeof order.customer === 'object'
      ? order.customer
      : await req.payload.findByID({
          collection: 'customers',
          id: order?.customer,
          depth: 1,
          overrideAccess: true,
        }) as any
    if (!isOrderOwnedByCustomer({ ...order, customer: orderCustomer }, customerUserId)) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    const [transactions, paidTransactions] = await Promise.all([
      req.payload.find({
        collection: 'transactions',
        where: { order: { equals: orderId } },
        sort: '-id',
        limit: 10,
        depth: 0,
        overrideAccess: true,
      }),
      req.payload.find({
        collection: 'transactions',
        where: {
          and: [
            { order: { equals: orderId } },
            { status: { equals: 'paid' } },
          ],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      }),
    ])
    if (paidTransactions.docs.length > 0) {
      const paidTransaction = paidTransactions.docs[0] as any
      return Response.json({
        state: 'paid',
        orderId: String(orderId),
        paymentIntentId: paidTransaction.payment_intent_id || null,
        merchantId: relationId(order.merchant),
      })
    }
    const transaction = requestedTransactionId
      ? transactions.docs.find((doc: any) => String(doc.id) === requestedTransactionId)
      : transactions.docs[0]
    if (!transaction) {
      return Response.json({ error: 'No payment attempt is linked to this order' }, { status: 404 })
    }
    if (String(order.status).toLowerCase() !== 'pending') {
      return Response.json({
        state: 'processing',
        orderId: String(orderId),
        message: 'This order is not awaiting payment. Refresh the order status before retrying.',
      })
    }

    const transactionStatus = String((transaction as any).status || '').toLowerCase()
    if (transactionStatus === 'paid') {
      return Response.json({
        state: 'paid',
        orderId: String(orderId),
        paymentIntentId: (transaction as any).payment_intent_id || null,
        merchantId: relationId(order.merchant),
      })
    }
    if (!['pending', 'failed'].includes(transactionStatus)) {
      return Response.json({
        state: 'unavailable',
        message: 'This payment cannot be resumed. Please contact support for help.',
      })
    }

    const paymentIntentId = String((transaction as any).payment_intent_id || '')
    if (!paymentIntentId) {
      return Response.json({
        state: 'unavailable',
        message: 'The payment provider did not return a reference for this attempt. Please contact support.',
      })
    }

    const secretKey = getSecretKey()
    if (!secretKey) {
      console.error('[checkout/payment-resume] PayMongo secret key is not configured')
      return Response.json({ error: 'Payment recovery is temporarily unavailable' }, { status: 503 })
    }

    const intent = await retrieveIntent(paymentIntentId, secretKey)
    const providerStatus = String(intent?.attributes?.status || '').toLowerCase()
    const recoveryState = classifyPayMongoIntentStatus(providerStatus)
    if (
      transactionStatus === 'failed' &&
      (recoveryState === 'action_required' || recoveryState === 'processing')
    ) {
      await req.payload.update({
        collection: 'transactions',
        id: (transaction as any).id,
        data: { status: 'pending' },
        overrideAccess: true,
      })
    }

    if (confirmAttached) {
      if (String((transaction as any).payment_intent_id) !== paymentIntentId ||
        !['awaiting_next_action', 'succeeded'].includes(providerStatus)) {
        return Response.json({
          error: 'PayMongo has not confirmed the new payment action. Please try again.',
          code: 'PAYMENT_ACTION_NOT_CONFIRMED',
        }, { status: 409 })
      }
    }

    const action = getPaymentAction(intent)
    if (recoveryState === 'action_required' && action) {
      return Response.json({
        state: action.type,
        ...action,
        orderId: String(orderId),
        paymentIntentId,
        amount: Number(order.total) || Number((transaction as any).amount) || 0,
        merchantId: relationId(order.merchant),
        merchantName: (order.merchant as any)?.outletName || (order.merchant as any)?.name || 'Merchant',
      })
    }

    if (recoveryState === 'processing') {
      return Response.json({
        state: 'processing',
        orderId: String(orderId),
        paymentIntentId,
        merchantId: relationId(order.merchant),
        message: 'PayMongo is confirming this payment. Your order will update as soon as confirmation arrives.',
      })
    }

    if (recoveryState === 'retryable' && transactionStatus !== 'failed') {
      const clientKey = String(intent?.attributes?.client_key || '')
      const paymentMethod = String((transaction as any).payment_method || '')
      if (!clientKey || !PAYMENT_METHODS.has(paymentMethod)) {
        return Response.json({
          state: 'unavailable',
          message: 'PayMongo requires a new payment attempt that cannot be safely resumed here. Please contact support.',
        })
      }
      return Response.json({
        state: 'retry',
        orderId: String(orderId),
        transactionId: String((transaction as any).id),
        paymentIntentId,
        clientKey,
        paymentMethod,
        amount: Number(order.total) || Number((transaction as any).amount) || 0,
        merchantId: relationId(order.merchant),
        merchantName: (order.merchant as any)?.outletName || (order.merchant as any)?.name || 'Merchant',
      })
    }

    if (
      !confirmAttached &&
      (recoveryState === 'terminal' ||
        (recoveryState === 'retryable' && transactionStatus === 'failed'))
    ) {
      const method = PAYMENT_METHODS.has(String((transaction as any).payment_method))
        ? String((transaction as any).payment_method)
        : 'qrph'
      const amount = Math.round(Number(order.total) * 100)
      if (!Number.isSafeInteger(amount) || amount < 100) {
        return Response.json({ error: 'Order amount is invalid for payment recovery' }, { status: 409 })
      }
      const replacementResponse = await fetch('https://api.paymongo.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount,
              currency: String((transaction as any).currency || 'PHP'),
              payment_method_allowed: [method],
              description: `Order #${orderId}`,
              statement_descriptor: PAYMONGO_STATEMENT_DESCRIPTOR,
            },
          },
        }),
      })
      const replacement = await replacementResponse.json().catch(() => ({}))
      const replacementIntent = replacement?.data
      const replacementIntentId = String(replacementIntent?.id || '')
      const replacementClientKey = String(replacementIntent?.attributes?.client_key || '')
      if (!replacementResponse.ok || !replacementIntentId || !replacementClientKey) {
        console.error('[checkout/payment-resume] PayMongo replacement intent creation failed', {
          status: replacementResponse.status,
        })
        return Response.json({ error: 'A new payment attempt could not be started. Please try again.' }, { status: 502 })
      }

      const replacementTransaction = await req.payload.create({
        collection: 'transactions',
        data: {
          order: orderId,
          payment_intent_id: replacementIntentId,
          payment_method: method,
          amount: Number(order.total),
          currency: String((transaction as any).currency || 'PHP'),
          status: 'pending',
        },
        overrideAccess: true,
      })
      return Response.json({
        state: 'retry',
        orderId: String(orderId),
        transactionId: String(replacementTransaction.id),
        paymentIntentId: replacementIntentId,
        clientKey: replacementClientKey,
        paymentMethod: method,
        amount: Number(order.total),
        merchantId: relationId(order.merchant),
        merchantName: (order.merchant as any)?.outletName || (order.merchant as any)?.name || 'Merchant',
      })
    }

    return Response.json({
      state: 'unavailable',
      message: 'PayMongo has not confirmed that this payment attempt can be retried. Please try again shortly.',
    })
  } catch (error) {
    console.error('[checkout/payment-resume] error:', error)
    return Response.json({ error: 'Unable to resume payment right now. Please try again shortly.' }, { status: 500 })
  }
}

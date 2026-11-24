import crypto from 'crypto'
import type { PayloadRequest, Where } from 'payload'
import { createPaymentIntent } from './checkoutPrepare'
import {
  classifyPayMongoIntentStatus,
  isOrderOwnedByCustomer,
} from '../services/orderPaymentRecovery'
import { ensureDeliveryFulfillment } from '../services/deliveryFulfillmentOutbox'
import { CouponService } from '../services/CouponService'
import {
  debitWalletForOrder,
  findOrCreateCustomerWallet,
  InsufficientWalletBalanceError,
} from '../services/customerWallet'
import {
  amountInMinorUnits,
  cancelPayMongoIntent,
  getPayMongoSecretKey,
  retrievePayMongoIntent,
} from '../services/paymongoIntent'

const PAYMENT_METHODS = new Set([
  'qrph',
  'gcash',
  'grab_pay',
  'paymaya',
  'billease',
  'dob',
  'brankas',
  'card',
  'wallet',
])
const SELECTABLE_PAYMENT_METHODS = [
  'gcash',
  'grab_pay',
  'paymaya',
  'billease',
  'dob',
  'brankas',
  'qrph',
  'wallet',
] as const
const SELECTABLE_PAYMENT_METHOD_SET = new Set<string>(SELECTABLE_PAYMENT_METHODS)
const BANK_CODES_BY_METHOD: Record<string, Set<string>> = {
  dob: new Set(['bpi', 'ubp']),
  brankas: new Set(['bdo', 'landbank', 'metrobank']),
}

function relationId(value: unknown): string | null {
  const raw = value && typeof value === 'object' && 'id' in value
    ? (value as { id?: unknown }).id
    : value
  return raw === null || raw === undefined || raw === '' ? null : String(raw)
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
    const body = (await (typeof (req as any).json === 'function'
      ? (req as any).json()
      : Promise.resolve((req as any).body))) ?? {}
    const orderId = Number(body.orderId)
    const confirmAttached = body.confirmAttached === true
    const reconcileOnly = body.reconcileOnly === true
    const requestedPaymentIntentId = typeof body.paymentIntentId === 'string'
      ? body.paymentIntentId.trim()
      : ''
    const requestedTransactionId = body.transactionId == null || String(body.transactionId).trim() === ''
      ? null
      : String(body.transactionId).trim()
    const requestedPaymentMethod = typeof body.paymentMethod === 'string'
      ? body.paymentMethod.trim()
      : ''
    const requestedBankCode = typeof body.bankCode === 'string'
      ? body.bankCode.trim().toLowerCase()
      : ''
    const retryAttemptId = typeof body.retryAttemptId === 'string'
      ? body.retryAttemptId.trim()
      : ''
    const role = String(req.user?.role || '')
    if (
      !req.user ||
      !['customer', 'service', 'admin'].includes(role) ||
      (role === 'customer' && req.user.isActive === false)
    ) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const customerUserId = role === 'customer'
      ? Number(req.user.id)
      : Number(body.customerId)

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
    if (requestedPaymentMethod) {
      if (!/^[A-Za-z0-9_-]{1,128}$/.test(retryAttemptId)) {
        return Response.json({ error: 'A valid payment retry attempt ID is required.' }, { status: 400 })
      }
      if (!SELECTABLE_PAYMENT_METHOD_SET.has(requestedPaymentMethod)) {
        return Response.json({ error: 'Select a supported payment method.' }, { status: 400 })
      }
      const bankCodes = BANK_CODES_BY_METHOD[requestedPaymentMethod]
      if (bankCodes && !bankCodes.has(requestedBankCode)) {
        return Response.json({ error: 'Select a valid bank for this payment method.' }, { status: 400 })
      }
      if (!bankCodes && requestedBankCode) {
        return Response.json({ error: 'A bank can only be selected for an online banking method.' }, { status: 400 })
      }
    }

    if (reconcileOnly) {
      if (!requestedPaymentIntentId) {
        return Response.json({
          error: 'paymentIntentId is required for reconciliation',
        }, { status: 400 })
      }
      const transactionFilters: Where[] = [
        { order: { equals: orderId } },
        { payment_intent_id: { equals: requestedPaymentIntentId } },
        { transaction_type: { not_equals: 'priority_fee' } },
      ]
      if (requestedTransactionId) {
        transactionFilters.unshift({ id: { equals: requestedTransactionId } })
      }
      const matchingTransactions = await req.payload.find({
        collection: 'transactions',
        where: { and: transactionFilters },
        limit: requestedTransactionId ? 1 : 2,
        depth: 0,
        overrideAccess: true,
        req,
      })
      const matchedTransaction = matchingTransactions.docs[0] as any
      if (!requestedTransactionId && matchingTransactions.docs.length > 1) {
        return Response.json({
          error: 'More than one payment attempt matches this order and intent',
          code: 'PAYMENT_ATTEMPT_AMBIGUOUS',
        }, { status: 409 })
      }
      if (
        !matchedTransaction ||
        !String(matchedTransaction.id || '') ||
        (requestedTransactionId && String(matchedTransaction.id) !== requestedTransactionId) ||
        relationId(matchedTransaction.order) !== String(orderId) ||
        String(matchedTransaction.payment_intent_id || '') !== requestedPaymentIntentId ||
        String(matchedTransaction.transaction_type || '') === 'priority_fee'
      ) {
        return Response.json({ error: 'Payment attempt not found' }, { status: 404 })
      }
      const currentStatus = String(matchedTransaction.status || '').toLowerCase()
      if (!['pending', 'failed', 'paid'].includes(currentStatus)) {
        return Response.json({ error: 'This payment cannot be reconciled' }, { status: 409 })
      }

      const secretKey = getPayMongoSecretKey()
      if (!secretKey) {
        console.error('[checkout/payment-resume] PayMongo secret key is not configured')
        return Response.json({ error: 'Payment recovery is temporarily unavailable' }, { status: 503 })
      }
      const intent = await retrievePayMongoIntent(requestedPaymentIntentId, secretKey)
      const attributes = intent?.attributes
      const intentAmount = Number(attributes?.amount)
      const transactionAmount = amountInMinorUnits(matchedTransaction.amount)
      const orderAmount = amountInMinorUnits(order.total)
      const transactionCurrency = String(matchedTransaction.currency || '').toUpperCase()
      const intentCurrency = String(attributes?.currency || '').toUpperCase()
      if (
        String(intent?.id || '') !== requestedPaymentIntentId ||
        String(attributes?.status || '').toLowerCase() !== 'succeeded' ||
        !Number.isSafeInteger(intentAmount) ||
        intentAmount <= 0 ||
        transactionAmount === null ||
        transactionAmount !== intentAmount ||
        orderAmount === null ||
        orderAmount !== intentAmount ||
        transactionCurrency !== intentCurrency
      ) {
        return Response.json({
          error: 'PayMongo has not confirmed a matching successful payment',
          code: 'PAYMENT_NOT_VERIFIED',
        }, { status: 409 })
      }

      const transactionID = await req.payload.db.beginTransaction()
      if (!transactionID) {
        return Response.json({ error: 'Payment persistence is unavailable' }, { status: 503 })
      }
      req.transactionID = transactionID
      try {
        await req.payload.update({
          collection: 'transactions',
          id: matchedTransaction.id,
          data: { status: 'paid', paid_at: new Date().toISOString() },
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
        if (order.fulfillment_type === 'delivery') {
          await ensureDeliveryFulfillment(req, orderId)
        }
        await req.payload.db.commitTransaction(transactionID)
        req.transactionID = undefined
      } catch (error) {
        await req.payload.db.rollbackTransaction(transactionID)
        req.transactionID = undefined
        throw error
      }

      return Response.json({
        state: 'paid',
        orderId: String(orderId),
        paymentIntentId: requestedPaymentIntentId,
        merchantId: relationId(order.merchant),
      })
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
        wallet: String(paidTransaction.payment_method || '') === 'wallet',
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
        wallet: String((transaction as any).payment_method || '') === 'wallet',
      })
    }
    if (!['pending', 'failed'].includes(transactionStatus)) {
      return Response.json({
        state: 'unavailable',
        message: 'This payment cannot be resumed. Please contact support for help.',
      })
    }

    const paymentIntentId = String((transaction as any).payment_intent_id || '')
    if (requestedPaymentMethod === 'wallet') {
      if (paymentIntentId) {
        const secretKey = getPayMongoSecretKey()
        if (!secretKey) {
          return Response.json({ error: 'Payment recovery is temporarily unavailable' }, { status: 503 })
        }
        let intent = await retrievePayMongoIntent(paymentIntentId, secretKey)
        let recoveryState = classifyPayMongoIntentStatus(String(intent?.attributes?.status || '').toLowerCase())
        if (recoveryState === 'processing') {
          return Response.json({
            state: 'processing',
            orderId: String(orderId),
            paymentIntentId,
            merchantId: relationId(order.merchant),
            message: 'PayMongo is confirming the previous payment. Wait before using your wallet.',
          })
        }
        if (recoveryState === 'action_required') {
          const cancellation = await cancelPayMongoIntent(paymentIntentId, secretKey)
          intent = cancellation.intent
          recoveryState = classifyPayMongoIntentStatus(String(intent?.attributes?.status || '').toLowerCase())
          if (recoveryState === 'processing') {
            return Response.json({
              state: 'processing',
              orderId: String(orderId),
              paymentIntentId,
              merchantId: relationId(order.merchant),
              message: 'PayMongo is confirming the previous payment. Wait before using your wallet.',
            })
          }
          if (!['retryable', 'terminal'].includes(recoveryState)) {
            return Response.json({
              state: 'unavailable',
              code: 'PREVIOUS_PAYMENT_STILL_ACTIVE',
              providerErrorCode: cancellation.providerErrorCode,
              previousPaymentStatus: String(intent?.attributes?.status || ''),
              message: 'The previous PayMongo payment is still active. No wallet debit was made.',
            }, { status: 409 })
          }
        }
        if (!['retryable', 'terminal'].includes(recoveryState)) {
          return Response.json({
            state: 'unavailable',
            code: 'PREVIOUS_PAYMENT_STILL_ACTIVE',
            previousPaymentStatus: String(intent?.attributes?.status || ''),
            message: 'The previous PayMongo payment could not be confirmed as inactive. No wallet debit was made.',
          }, { status: 409 })
        }
      }

      const walletCustomerId = Number(relationId(order.customer))
      const amountMinor = amountInMinorUnits(order.total)
      if (!Number.isSafeInteger(walletCustomerId) || walletCustomerId <= 0 || amountMinor === null || amountMinor <= 0) {
        return Response.json({ error: 'Order wallet payment details are invalid.' }, { status: 409 })
      }
      await findOrCreateCustomerWallet(req, walletCustomerId)
      const paidAt = new Date().toISOString()
      const transactionID = await req.payload.db.beginTransaction()
      if (!transactionID) {
        return Response.json({ error: 'Payment persistence is unavailable' }, { status: 503 })
      }
      req.transactionID = transactionID
      try {
        await debitWalletForOrder(req, walletCustomerId, orderId, amountMinor)
        await req.payload.update({
          collection: 'transactions',
          id: (transaction as any).id,
          data: { status: 'paid', payment_method: 'wallet', paid_at: paidAt },
          overrideAccess: true,
          req,
        })
        await req.payload.update({
          collection: 'orders',
          id: orderId,
          data: { status: 'accepted' },
          overrideAccess: true,
          req,
        })
        await req.payload.update({
          collection: 'cart-items',
          where: { order_id: { equals: orderId } },
          data: { status: 'ordered', ordered_at: paidAt },
          overrideAccess: true,
          req,
        })
        if (order.fulfillment_type === 'delivery') {
          await ensureDeliveryFulfillment(req, orderId)
        }
        await req.payload.db.commitTransaction(transactionID)
        req.transactionID = undefined
      } catch (error) {
        await req.payload.db.rollbackTransaction(transactionID)
        req.transactionID = undefined
        throw error
      }
      try {
        await new CouponService(req.payload).finalizeForOrder(orderId, true)
      } catch (error) {
        console.error(`[checkout/payment-resume] wallet coupon finalization failed for order ${orderId}:`, error)
      }
      return Response.json({
        state: 'paid',
        orderId: String(orderId),
        merchantId: relationId(order.merchant),
        wallet: true,
      })
    }

    if (!paymentIntentId) {
      return Response.json({
        state: 'unavailable',
        message: 'The payment provider did not return a reference for this attempt. Please contact support.',
      })
    }

    const secretKey = getPayMongoSecretKey()
    if (!secretKey) {
      console.error('[checkout/payment-resume] PayMongo secret key is not configured')
      return Response.json({ error: 'Payment recovery is temporarily unavailable' }, { status: 503 })
    }

    let intent = await retrievePayMongoIntent(paymentIntentId, secretKey)
    let providerStatus = String(intent?.attributes?.status || '').toLowerCase()
    let recoveryState = classifyPayMongoIntentStatus(providerStatus)
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

    if (!confirmAttached && recoveryState === 'action_required') {
      if (!requestedPaymentMethod) {
        return Response.json({
          state: 'choose_method',
          orderId: String(orderId),
          previousPaymentMethod: PAYMENT_METHODS.has(String((transaction as any).payment_method))
            ? String((transaction as any).payment_method)
            : null,
          amount: Number(order.total) || Number((transaction as any).amount) || 0,
          merchantId: relationId(order.merchant),
          message: 'Choose a payment method to replace the previous payment attempt.',
        })
      }

      const cancellation = await cancelPayMongoIntent(paymentIntentId, secretKey)
      intent = cancellation.intent
      providerStatus = String(intent?.attributes?.status || '').toLowerCase()
      recoveryState = classifyPayMongoIntentStatus(providerStatus)
      if (recoveryState === 'processing') {
        return Response.json({
          state: 'processing',
          orderId: String(orderId),
          paymentIntentId,
          merchantId: relationId(order.merchant),
          message: 'PayMongo is confirming the previous payment. Wait for confirmation before starting another attempt.',
        })
      }
      if (!['retryable', 'terminal'].includes(recoveryState)) {
        return Response.json({
          state: 'unavailable',
          code: 'PREVIOUS_PAYMENT_STILL_ACTIVE',
          providerErrorCode: cancellation.providerErrorCode,
          previousPaymentStatus: providerStatus,
          message: `PayMongo still reports the previous payment as ${providerStatus || 'active'}. It has not confirmed cancellation, so no new attempt was started.`,
        }, { status: 409 })
      }
    }

    if (confirmAttached && recoveryState === 'action_required') {
      const action = getPaymentAction(intent)
      if (action) {
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

    if (
      !confirmAttached &&
      (recoveryState === 'terminal' || recoveryState === 'retryable')
    ) {
      if (!requestedPaymentMethod) {
        return Response.json({
          state: 'choose_method',
          orderId: String(orderId),
          previousPaymentMethod: PAYMENT_METHODS.has(String((transaction as any).payment_method))
            ? String((transaction as any).payment_method)
            : null,
          amount: Number(order.total) || Number((transaction as any).amount) || 0,
          merchantId: relationId(order.merchant),
          message: 'The previous payment attempt is no longer active. Choose a payment method to try again.',
        })
      }

      const amount = Math.round(Number(order.total) * 100)
      if (!Number.isSafeInteger(amount) || amount < 100) {
        return Response.json({ error: 'Order amount is invalid for payment recovery' }, { status: 409 })
      }
      const currency = String((transaction as any).currency || 'PHP').toUpperCase()
      const currentClientKey = String(intent?.attributes?.client_key || '')
      const intentAmount = Number(intent?.attributes?.amount)
      const intentCurrency = String(intent?.attributes?.currency || '').toUpperCase()
      if (
        transactionStatus === 'pending' &&
        String((transaction as any).payment_method || '') === requestedPaymentMethod &&
        intent?.attributes?.metadata?.payment_recovery === 'true' &&
        intent?.attributes?.metadata?.payment_recovery_attempt_id === retryAttemptId &&
        currentClientKey &&
        intentAmount === amount &&
        intentCurrency === currency
      ) {
        return Response.json({
          state: 'retry',
          orderId: String(orderId),
          transactionId: String((transaction as any).id),
          paymentIntentId,
          clientKey: currentClientKey,
          paymentMethod: requestedPaymentMethod,
          bankCode: requestedBankCode || null,
          amount: Number(order.total),
          merchantId: relationId(order.merchant),
          merchantName: (order.merchant as any)?.outletName || (order.merchant as any)?.name || 'Merchant',
        })
      }

      const idempotencyKey = crypto
        .createHash('sha256')
        .update(`order-payment-retry:${orderId}:${String((transaction as any).id)}:${requestedPaymentMethod}:${retryAttemptId}`)
        .digest('hex')
      await req.payload.update({
        collection: 'transactions',
        id: (transaction as any).id,
        data: { status: 'failed' },
        overrideAccess: true,
      })
      let replacementIntent: any
      try {
        replacementIntent = await createPaymentIntent({
          amount: Number(order.total),
          currency,
          idempotencyKey,
          orderId,
          secret: secretKey,
          requestId: `retry-${retryAttemptId}`,
          metadata: {
            payment_recovery: 'true',
            payment_recovery_attempt_id: retryAttemptId,
          },
        })
      } catch (error) {
        console.error('[checkout/payment-resume] PayMongo replacement intent creation failed:', error)
        return Response.json({
          error: 'A new payment attempt could not be started. Please try again.',
        }, { status: 502 })
      }
      const replacementAttributes = replacementIntent?.attributes
      const replacementIntentId = String(replacementIntent?.id || '')
      const replacementClientKey = String(replacementAttributes?.client_key || '')
      if (
        !replacementIntentId ||
        !replacementClientKey ||
        Number(replacementAttributes?.amount) !== amount ||
        String(replacementAttributes?.currency || '').toUpperCase() !== currency
      ) {
        console.error('[checkout/payment-resume] PayMongo replacement intent failed validation')
        return Response.json({ error: 'A new payment attempt could not be started. Please try again.' }, { status: 502 })
      }

      const existingReplacement = await req.payload.find({
        collection: 'transactions',
        where: {
          and: [
            { order: { equals: orderId } },
            { payment_intent_id: { equals: replacementIntentId } },
            { transaction_type: { not_equals: 'priority_fee' } },
          ],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      let replacementTransaction = existingReplacement.docs[0]
      if (!replacementTransaction) {
        replacementTransaction = await req.payload.create({
          collection: 'transactions',
          data: {
            order: orderId,
            payment_intent_id: replacementIntentId,
            payment_method: requestedPaymentMethod,
            amount: Number(order.total),
            currency,
            status: 'pending',
            transaction_type: 'order',
          },
          overrideAccess: true,
        })
      }
      return Response.json({
        state: 'retry',
        orderId: String(orderId),
        transactionId: String((replacementTransaction as any).id),
        paymentIntentId: replacementIntentId,
        clientKey: replacementClientKey,
        paymentMethod: requestedPaymentMethod,
        bankCode: requestedBankCode || null,
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
    if (error instanceof InsufficientWalletBalanceError) {
      return Response.json({ error: error.message, code: 'WALLET_INSUFFICIENT_BALANCE' }, { status: 402 })
    }
    return Response.json({ error: 'Unable to resume payment right now. Please try again shortly.' }, { status: 500 })
  }
}

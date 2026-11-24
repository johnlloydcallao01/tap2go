import crypto from 'crypto'
import type { PayloadRequest } from 'payload'
import {
  creditWalletTopup,
  failWalletTopupIfPending,
  findOrCreateCustomerWallet,
} from '../services/customerWallet'
import {
  classifyPayMongoIntentStatus,
  isTerminalPaymentFailure,
} from '../services/orderPaymentRecovery'
import { cancelPayMongoIntent } from '../services/paymongoIntent'

const PAYMENT_METHODS = new Set([
  'gcash',
  'grab_pay',
  'paymaya',
  'billease',
  'dob',
  'brankas',
  'qrph',
])
const BANK_CODES: Record<string, Set<string>> = {
  dob: new Set(['bpi', 'ubp']),
  brankas: new Set(['bdo', 'landbank', 'metrobank']),
}

function readBody(req: PayloadRequest): Promise<Record<string, unknown>> {
  const request = req as unknown as { json?: () => Promise<unknown>; body?: unknown }
  const parsed = typeof request.json === 'function'
    ? request.json()
    : Promise.resolve(request.body)
  return parsed.then((value) => (
    value && typeof value === 'object' ? value as Record<string, unknown> : {}
  ))
}

function relationId(value: unknown): number | null {
  const raw = value && typeof value === 'object' && 'id' in value
    ? (value as { id?: unknown }).id
    : value
  const parsed = Number(raw)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

async function getCustomer(req: PayloadRequest) {
  const user = req.user
  if (!user || user.role !== 'customer' || user.isActive === false) return null
  const result = await req.payload.find({
    collection: 'customers',
    where: { user: { equals: user.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return result.docs[0] ?? null
}

function payMongoSecret() {
  return process.env.PAYMONGO_SANDBOX === 'true'
    ? process.env.PAYMONGO_SANDBOX_API_KEY
    : process.env.PAYMONGO_SECRET_KEY_LIVE
}

async function retrieveIntent(paymentIntentId: string, secret: string) {
  const response = await fetch(
    `https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`,
    {
      headers: { Authorization: `Basic ${Buffer.from(`${secret}:`).toString('base64')}` },
      signal: AbortSignal.timeout(12_000),
    },
  )
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`PayMongo intent verification failed (HTTP ${response.status}).`)
  return body?.data
}

export async function resolveWalletTopupByIntent(req: PayloadRequest, paymentIntentId: string) {
  const result = await req.payload.find({
    collection: 'wallet-topups',
    where: { payment_intent_id: { equals: paymentIntentId } },
    limit: 2,
    depth: 0,
    overrideAccess: true,
    req,
  })
  if (result.docs.length > 1) throw new Error('More than one wallet top-up matches this payment intent.')
  return result.docs[0] ?? null
}

export async function reconcileWalletTopupByIntent(
  req: PayloadRequest,
  paymentIntentId: string,
  providerIntent: Record<string, any>,
  paymentId: string,
  paidAt: string,
) {
  const topup = await resolveWalletTopupByIntent(req, paymentIntentId) as Record<string, any> | null
  if (!topup) return false

  const attrs = providerIntent?.attributes
  if (
    String(providerIntent?.id || '') !== paymentIntentId ||
    String(attrs?.status || '').toLowerCase() !== 'succeeded' ||
    Number(attrs?.amount) !== Number(topup.amount_minor) ||
    String(attrs?.currency || '').toUpperCase() !== String(topup.currency || '').toUpperCase() ||
    String(topup.currency || '').toUpperCase() !== 'PHP'
  ) {
    throw new Error('PayMongo wallet top-up does not match the saved amount or currency.')
  }

  const transactionID = await req.payload.db.beginTransaction()
  if (!transactionID) throw new Error('Wallet database transaction support is unavailable.')
  req.transactionID = transactionID
  try {
    await creditWalletTopup(req, topup.id, paidAt, paymentId)
    await req.payload.db.commitTransaction(transactionID)
    req.transactionID = undefined
  } catch (error) {
    await req.payload.db.rollbackTransaction(transactionID)
    req.transactionID = undefined
    throw error
  }
  return true
}

async function failPendingTopup(req: PayloadRequest, topupId: number | string) {
  const transactionID = await req.payload.db.beginTransaction()
  if (!transactionID) throw new Error('Wallet database transaction support is unavailable.')
  req.transactionID = transactionID
  try {
    const result = await failWalletTopupIfPending(req, topupId)
    await req.payload.db.commitTransaction(transactionID)
    req.transactionID = undefined
    return result
  } catch (error) {
    await req.payload.db.rollbackTransaction(transactionID)
    req.transactionID = undefined
    throw error
  }
}

export async function customerWalletOverviewHandler(req: PayloadRequest) {
  try {
    const customer = await getCustomer(req)
    if (!customer) return Response.json({ error: 'Authenticated customer account required.' }, { status: 401 })
    const wallet = await findOrCreateCustomerWallet(req, Number(customer.id))
    const entries = await req.payload.find({
      collection: 'wallet-ledger-entries',
      where: { wallet: { equals: wallet.id } },
      sort: '-createdAt',
      limit: 100,
      depth: 0,
      overrideAccess: true,
      req,
    })
    return Response.json({
      balanceMinor: Number(wallet.balance_minor) || 0,
      currency: wallet.currency || 'PHP',
      entries: entries.docs.map((entry: any) => ({
        id: entry.id,
        type: entry.entry_type,
        amountMinor: Number(entry.amount_minor),
        currency: entry.currency,
        sourceType: entry.source_type,
        sourceId: entry.source_id,
        description: entry.description || '',
        createdAt: entry.createdAt,
      })),
    })
  } catch (error) {
    console.error('[wallet] overview failed', error)
    return Response.json({ error: 'Wallet details are temporarily unavailable.' }, { status: 503 })
  }
}

export async function customerWalletTopupPrepareHandler(req: PayloadRequest) {
  try {
    const customer = await getCustomer(req)
    if (!customer) return Response.json({ error: 'Authenticated customer account required.' }, { status: 401 })
    const body = await readBody(req)
    const amountMinor = Number(body.amountMinor)
    const paymentMethod = String(body.paymentMethod || '')
    const bankCode = String(body.bankCode || '').toLowerCase()
    const idempotencyKey = String(body.idempotencyKey || '')
    if (
      !Number.isSafeInteger(amountMinor) ||
      amountMinor < 100 ||
      !PAYMENT_METHODS.has(paymentMethod) ||
      !/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey) ||
      (BANK_CODES[paymentMethod] && !BANK_CODES[paymentMethod].has(bankCode)) ||
      (!BANK_CODES[paymentMethod] && bankCode)
    ) {
      return Response.json({ error: 'Enter a valid amount and supported payment method.' }, { status: 400 })
    }

    const secret = payMongoSecret()
    if (!secret) return Response.json({ error: 'PayMongo wallet top-ups are not configured.' }, { status: 503 })

    const customerId = Number(customer.id)
    const wallet = await findOrCreateCustomerWallet(req, customerId)
    const scopedIdempotencyKey = `${customerId}:${idempotencyKey}`
    const existing = await req.payload.find({
      collection: 'wallet-topups',
      where: { idempotency_key: { equals: scopedIdempotencyKey } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    let topup: any = existing.docs[0]
    if (topup) {
      if (Number(topup.amount_minor) !== amountMinor || topup.payment_method !== paymentMethod) {
        return Response.json({ error: 'This top-up request key was already used for different details.' }, { status: 409 })
      }
      if (topup.status !== 'pending') {
        return Response.json({ error: 'This top-up attempt is already resolved. Start a new top-up.' }, { status: 409 })
      }
    } else {
      topup = await req.payload.create({
        collection: 'wallet-topups',
        data: {
          customer: customerId,
          wallet: wallet.id,
          amount_minor: amountMinor,
          currency: 'PHP',
          status: 'pending',
          payment_method: paymentMethod,
          idempotency_key: scopedIdempotencyKey,
        } as never,
        depth: 0,
        overrideAccess: true,
        req,
      })
    }

    let intent: any
    if (topup.payment_intent_id) {
      intent = await retrieveIntent(String(topup.payment_intent_id), secret)
    } else {
      const providerKey = crypto
        .createHash('sha256')
        .update(`wallet-topup:${customerId}:${idempotencyKey}`)
        .digest('hex')
      const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${secret}:`).toString('base64')}`,
          'Idempotency-Key': providerKey,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: amountMinor,
              currency: 'PHP',
              description: `Tap2Go wallet top-up #${topup.id}`,
              statement_descriptor: 'TAP2GO',
              payment_method_allowed: ['card', ...PAYMENT_METHODS],
              payment_method_options: { card: { request_three_d_secure: 'any' } },
              metadata: {
                purpose: 'customer_wallet_topup',
                walletTopupId: String(topup.id),
                customerId: String(customerId),
              },
            },
          },
        }),
        signal: AbortSignal.timeout(12_000),
      })
      const data = await response.json().catch(() => ({}))
      intent = data?.data
      if (!response.ok || !intent?.id || !intent?.attributes?.client_key) {
        console.error('[wallet] PayMongo intent creation failed', { status: response.status })
        return Response.json({ error: 'PayMongo could not prepare this top-up.' }, { status: 502 })
      }
      if (Number(intent.attributes.amount) !== amountMinor || String(intent.attributes.currency).toUpperCase() !== 'PHP') {
        return Response.json({ error: 'PayMongo prepared a top-up with a mismatched amount.' }, { status: 502 })
      }
      await req.payload.update({
        collection: 'wallet-topups',
        id: topup.id,
        data: { payment_intent_id: String(intent.id) } as never,
        overrideAccess: true,
        req,
      })
    }

    return Response.json({
      topupId: topup.id,
      paymentIntentId: String(intent.id),
      clientKey: String(intent.attributes.client_key),
      amountMinor,
      status: String(intent.attributes.status || 'awaiting_payment_method'),
    })
  } catch (error) {
    console.error('[wallet] top-up preparation failed', error)
    return Response.json({ error: 'Wallet top-up could not be prepared.' }, { status: 503 })
  }
}

export async function customerWalletTopupReconcileHandler(req: PayloadRequest) {
  try {
    const customer = await getCustomer(req)
    if (!customer) return Response.json({ error: 'Authenticated customer account required.' }, { status: 401 })
    const body = await readBody(req)
    const topupId = Number(body.topupId)
    if (!Number.isSafeInteger(topupId) || topupId <= 0) {
      return Response.json({ error: 'A valid wallet top-up is required.' }, { status: 400 })
    }
    const topup = await req.payload.findByID({
      collection: 'wallet-topups',
      id: topupId,
      depth: 0,
      overrideAccess: true,
      req,
    }) as any
    if (!topup || relationId(topup.customer) !== Number(customer.id)) {
      return Response.json({ error: 'Wallet top-up not found.' }, { status: 404 })
    }
    if (topup.status === 'paid') return Response.json({ state: 'paid' })
    if (!topup.payment_intent_id) return Response.json({ state: 'pending' })

    const secret = payMongoSecret()
    if (!secret) return Response.json({ error: 'PayMongo verification is unavailable.' }, { status: 503 })
    const intent = await retrieveIntent(String(topup.payment_intent_id), secret)
    const status = String(intent?.attributes?.status || '').toLowerCase()
    if (status === 'succeeded') {
      const paidAt = new Date(
        (Number(intent.attributes?.paid_at) || Date.now() / 1000) * 1000,
      ).toISOString()
      const paymentId = String(intent.attributes?.payments?.[0]?.id || '')
      const settled = await reconcileWalletTopupByIntent(
        req,
        String(topup.payment_intent_id),
        intent,
        paymentId,
        paidAt,
      )
      if (!settled) throw new Error('The matching wallet top-up could not be found.')
      return Response.json({ state: 'paid' })
    }
    if (isTerminalPaymentFailure(status)) {
      const state = await failPendingTopup(req, topup.id)
      return Response.json({ state: state === 'paid' ? 'paid' : 'failed' })
    }
    return Response.json({ state: 'pending' })
  } catch (error) {
    console.error('[wallet] top-up reconciliation failed', error)
    return Response.json({ error: 'Wallet top-up status could not be verified.' }, { status: 503 })
  }
}

export async function customerWalletTopupCancelHandler(req: PayloadRequest) {
  try {
    const customer = await getCustomer(req)
    if (!customer) return Response.json({ error: 'Authenticated customer account required.' }, { status: 401 })
    const body = await readBody(req)
    const topupId = Number(body.topupId)
    if (!Number.isSafeInteger(topupId) || topupId <= 0) {
      return Response.json({ error: 'A valid wallet top-up is required.' }, { status: 400 })
    }

    const topup = await req.payload.findByID({
      collection: 'wallet-topups',
      id: topupId,
      depth: 0,
      overrideAccess: true,
      req,
    }) as any
    if (!topup || relationId(topup.customer) !== Number(customer.id)) {
      return Response.json({ error: 'Wallet top-up not found.' }, { status: 404 })
    }
    if (topup.status === 'paid') return Response.json({ state: 'paid' })
    if (topup.status === 'failed') return Response.json({ state: 'cancelled' })
    if (!topup.payment_intent_id) {
      const result = await failPendingTopup(req, topup.id)
      return Response.json({ state: result === 'paid' ? 'paid' : 'cancelled' })
    }

    const secret = payMongoSecret()
    if (!secret) return Response.json({ error: 'PayMongo verification is unavailable.' }, { status: 503 })
    const paymentIntentId = String(topup.payment_intent_id)
    let intent = await retrieveIntent(paymentIntentId, secret)
    if (String(intent?.id || '') !== paymentIntentId) {
      return Response.json({ error: 'PayMongo returned a different payment attempt.' }, { status: 502 })
    }

    const settleIfPaid = async () => {
      const paidAt = new Date(
        (Number(intent.attributes?.paid_at) || Date.now() / 1000) * 1000,
      ).toISOString()
      const paymentId = String(intent.attributes?.payments?.[0]?.id || '')
      const settled = await reconcileWalletTopupByIntent(
        req,
        paymentIntentId,
        intent,
        paymentId,
        paidAt,
      )
      if (!settled) throw new Error('The matching wallet top-up could not be found.')
      return Response.json({ state: 'paid' })
    }

    let recoveryState = classifyPayMongoIntentStatus(intent?.attributes?.status)
    if (recoveryState === 'processing') {
      if (String(intent.attributes?.status || '').toLowerCase() === 'succeeded') {
        return await settleIfPaid()
      }
      return Response.json({ state: 'processing' })
    }

    if (recoveryState === 'action_required') {
      const cancellation = await cancelPayMongoIntent(paymentIntentId, secret)
      intent = cancellation.intent
      if (String(intent?.id || '') !== paymentIntentId) {
        return Response.json({ error: 'PayMongo returned a different payment attempt.' }, { status: 502 })
      }
      recoveryState = classifyPayMongoIntentStatus(intent?.attributes?.status)
      if (
        recoveryState === 'processing' &&
        String(intent.attributes?.status || '').toLowerCase() === 'succeeded'
      ) {
        return await settleIfPaid()
      }
      if (recoveryState === 'processing') return Response.json({ state: 'processing' })
    }

    if (
      recoveryState === 'retryable' ||
      recoveryState === 'terminal' ||
      isTerminalPaymentFailure(intent?.attributes?.status)
    ) {
      const result = await failPendingTopup(req, topup.id)
      return Response.json({ state: result === 'paid' ? 'paid' : 'cancelled' })
    }

    return Response.json(
      { error: 'This payment is still active and cannot be safely cancelled yet.' },
      { status: 409 },
    )
  } catch (error) {
    console.error('[wallet] top-up cancellation failed', error)
    return Response.json({ error: 'Wallet top-up could not be safely cancelled.' }, { status: 503 })
  }
}


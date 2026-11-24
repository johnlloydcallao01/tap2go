import crypto from 'crypto'
import type { PayloadRequest } from 'payload'
import { getCheckoutDeliveryQuote } from '../services/checkoutDeliveryQuote'
import { CheckoutValidationError, priceCheckoutCart } from '../services/checkoutPricing'
import { PAYMONGO_STATEMENT_DESCRIPTOR } from '../services/paymongo'
import {
  FIRST_ORDER_FREE_DELIVERY_CODE,
  getFirstOrderFreeDeliveryPromotion,
} from '../services/firstOrderDeliveryPromotion'
import { ensureDeliveryFulfillment } from '../services/deliveryFulfillmentOutbox'
import { isE164PhoneNumber } from '../services/lalamoveClient'
import { CouponService } from '../services/CouponService'
import {
  debitWalletForOrder,
  findOrCreateCustomerWallet,
  InsufficientWalletBalanceError,
} from '../services/customerWallet'

const PAYMENT_METHODS = new Set(['gcash', 'grab_pay', 'paymaya', 'billease', 'dob', 'brankas', 'qrph', 'card', 'wallet'])
const REQUEST_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/
const IDEMPOTENCY_KEY_PATTERN = /^[a-zA-Z0-9_-]{16,100}$/

type CheckoutBody = {
  merchantId?: unknown
  addressId?: unknown
  cartItemIds?: unknown
  contactPhone?: unknown
  paymentMethod?: unknown
  expectedTotal?: unknown
  idempotencyKey?: unknown
}

function idOf(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  if (value && typeof value === 'object' && 'id' in value) return idOf((value as { id?: unknown }).id)
  return null
}

function amount(value: unknown): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : null
}

function deliveryLabel(value: unknown): 'home' | 'office' | 'other' {
  const label = String(value || '').toLowerCase()
  if (label === 'home') return 'home'
  if (label === 'office' || label === 'work') return 'office'
  return 'other'
}

function normalizeDeliveryPhone(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  const digits = value.replace(/\D/g, '')
  if (/^09\d{9}$/.test(digits)) return `+63${digits.slice(1)}`
  if (/^9\d{9}$/.test(digits)) return `+63${digits}`
  if (/^639\d{9}$/.test(digits)) return `+${digits}`
  const international = trimmed.replace(/[\s().-]/g, '')
  return /^\+[1-9]\d{7,14}$/.test(international) ? international : null
}

export function checkoutContextHash(
  cartItems: any[],
  address: any,
  recipientPhone?: string,
): string {
  const coordinates = address.coordinates as { lat?: unknown; lng?: unknown } | null | undefined
  const context = cartItems
    .map((item) => ({
      id: idOf(item.id),
      productId: idOf(item.product),
      merchantProductId: idOf(item.merchantProduct),
      quantity: Number(item.quantity),
      variationId: idOf(item.selectedVariation),
      modifiers: item.selectedModifiers ?? [],
      addons: item.selectedAddons ?? [],
    }))
    .sort((left, right) => Number(left.id) - Number(right.id))
  const addressContext = {
    id: idOf(address.id),
    formattedAddress: address.formatted_address,
    latitude: address.latitude ?? coordinates?.lat,
    longitude: address.longitude ?? coordinates?.lng,
    street: address.street,
    floorUnitRoom: address.floor_unit_room,
    deliveryInstructions: address.delivery_instructions,
    notes: address.notes ?? address.accessibility_notes,
    label: address.label ?? address.address_type,
    recipientPhone,
  }
  return crypto
    .createHash('sha256')
    .update(JSON.stringify({ address: addressContext, cartItems: context }))
    .digest('hex')
}

async function readBody(req: PayloadRequest): Promise<CheckoutBody> {
  const request = req as unknown as { json?: () => Promise<unknown>; body?: unknown }
  const value = typeof request.json === 'function' ? await request.json() : request.body
  return value && typeof value === 'object' ? value as CheckoutBody : {}
}

function logSpan(requestId: string, phase: string, startedAt: number) {
  console.info('[checkout] span', { requestId, phase, durationMs: Date.now() - startedAt })
}

async function timed<T>(requestId: string, phase: string, operation: () => Promise<T>): Promise<T> {
  const startedAt = Date.now()
  try {
    return await operation()
  } finally {
    logSpan(requestId, phase, startedAt)
  }
}

async function findExistingCheckout(req: PayloadRequest, customerId: number, idempotencyKey: string) {
  const result = await req.payload.find({
    collection: 'orders',
    where: {
      and: [
        { customer: { equals: customerId } },
        { checkout_idempotency_key: { equals: idempotencyKey } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}

async function getTransaction(req: PayloadRequest, orderId: number) {
  const result = await req.payload.find({
    collection: 'transactions',
    where: { order: { equals: orderId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}

async function finalizeWalletOrder(req: PayloadRequest, orderId: number, paidAt: string) {
  try {
    await req.payload.update({
      collection: 'cart-items',
      where: { order_id: { equals: orderId } },
      data: { status: 'ordered', ordered_at: paidAt } as never,
      overrideAccess: true,
      req,
    })
  } catch (error) {
    console.error(`[checkout] wallet order cart cleanup failed for order ${orderId}:`, error)
  }
  try {
    await new CouponService(req.payload).finalizeForOrder(orderId, true)
  } catch (error) {
    console.error(`[checkout] wallet order coupon finalization failed for order ${orderId}:`, error)
  }
}

function paymentSecret(): string | null {
  return process.env.PAYMONGO_SANDBOX === 'true'
    ? process.env.PAYMONGO_SANDBOX_API_KEY || null
    : process.env.PAYMONGO_SECRET_KEY_LIVE || null
}

async function retrievePaymentIntent(paymentIntentId: string, secret: string, requestId: string) {
  const startedAt = Date.now()
  try {
    const response = await fetch(`https://api.paymongo.com/v1/payment_intents/${encodeURIComponent(paymentIntentId)}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${secret}:`).toString('base64')}` },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) throw new Error(`intent lookup returned ${response.status}`)
    return await response.json() as any
  } finally {
    logSpan(requestId, 'provider.intent_retrieve', startedAt)
  }
}

export async function createPaymentIntent(args: {
  amount: number
  currency: string
  idempotencyKey: string
  orderId: number
  secret: string
  requestId: string
  metadata?: Record<string, string>
}) {
  const startedAt = Date.now()
  try {
    const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${args.secret}:`).toString('base64')}`,
        'Idempotency-Key': args.idempotencyKey,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(args.amount * 100),
            currency: args.currency,
            description: `Tap2Go order #${args.orderId}`,
            statement_descriptor: PAYMONGO_STATEMENT_DESCRIPTOR,
            payment_method_allowed: ['card', 'gcash', 'grab_pay', 'paymaya', 'billease', 'dob', 'brankas', 'qrph'],
            payment_method_options: { card: { request_three_d_secure: 'any' } },
            metadata: {
              orderId: String(args.orderId),
              ...args.metadata,
            },
          },
        },
      }),
      signal: AbortSignal.timeout(12000),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok || !data?.data?.id || !data?.data?.attributes?.client_key) {
      throw new Error('The payment provider could not prepare this payment.')
    }
    const providerAmount = Number(data.data.attributes.amount)
    if (providerAmount !== Math.round(args.amount * 100)) {
      throw new Error('Payment provider amount did not match the saved order.')
    }
    return data.data
  } finally {
    logSpan(args.requestId, 'provider.intent_create', startedAt)
  }
}

async function updateTransaction(req: PayloadRequest, transactionId: number, data: Record<string, unknown>, requestId: string) {
  const transactionID = await req.payload.db.beginTransaction()
  if (!transactionID) throw new Error('Database transaction support is required for checkout.')
  req.transactionID = transactionID
  try {
    await timed(requestId, 'payload.transaction_update', () => req.payload.update({
      collection: 'transactions',
      id: transactionId,
      data: data as never,
      overrideAccess: true,
      req,
    }))
    await req.payload.db.commitTransaction(transactionID)
    req.transactionID = undefined
  } catch (error) {
    await req.payload.db.rollbackTransaction(transactionID)
    req.transactionID = undefined
    throw error
  }
}

export async function ensureCheckoutPayment(args: {
  req: PayloadRequest
  order: any
  transaction: any
  idempotencyKey: string
  paymentMethod: string
  requestId: string
}) {
  const { req, order, transaction, idempotencyKey, paymentMethod, requestId } = args
  if (transaction.status === 'paid') {
    if (order.fulfillment_type === 'delivery') {
      if (order.status === 'pending') {
        await req.payload.update({
          collection: 'orders',
          id: order.id,
          data: { status: 'accepted' } as never,
          overrideAccess: true,
          req,
        })
      }
      await ensureDeliveryFulfillment(req, Number(order.id))
    }
    return {
      sandbox: process.env.PAYMONGO_SANDBOX === 'true',
      paid: true,
      ...(String(transaction.payment_method || '') === 'wallet' ? { wallet: true } : {}),
    }
  }
  if (transaction.status === 'failed' || order.status === 'cancelled') {
    return { failed: true }
  }

  if (process.env.PAYMONGO_SANDBOX === 'true') {
    const sandboxIntentId = `sandbox_${idempotencyKey}`
    if (transaction.status !== 'paid' || transaction.payment_intent_id !== sandboxIntentId) {
      await updateTransaction(req, Number(transaction.id), {
        payment_intent_id: sandboxIntentId,
        payment_method: paymentMethod,
        status: 'paid',
        paid_at: new Date().toISOString(),
      }, requestId)
    }
    if (order.fulfillment_type === 'delivery') {
      if (order.status === 'pending') {
        await req.payload.update({
          collection: 'orders',
          id: order.id,
          data: { status: 'accepted' } as never,
          overrideAccess: true,
          req,
        })
      }
      await ensureDeliveryFulfillment(req, Number(order.id))
    }
    return { sandbox: true, paid: true }
  }

  const secret = paymentSecret()
  if (!secret) throw new CheckoutValidationError('Payment service is not configured. Please try again later.', 'PAYMENT_UNAVAILABLE', 503)

  let intent: any
  if (transaction.payment_intent_id) {
    intent = await retrievePaymentIntent(String(transaction.payment_intent_id), secret, requestId)
  } else {
    const providerIdempotencyKey = crypto
      .createHash('sha256')
      .update(`${idOf(order.customer)}:${idempotencyKey}`)
      .digest('hex')
    intent = await createPaymentIntent({
      amount: Number(order.total),
      currency: 'PHP',
      idempotencyKey: providerIdempotencyKey,
      orderId: Number(order.id),
      secret,
      requestId,
    })
    await updateTransaction(req, Number(transaction.id), {
      payment_intent_id: String(intent.id),
      payment_method: paymentMethod,
    }, requestId)
  }

  const clientKey = intent?.attributes?.client_key
  if (!clientKey) throw new CheckoutValidationError('Payment preparation is still processing. Retry this checkout to safely continue.', 'PAYMENT_SETUP_PENDING', 503)
  return { sandbox: false, paid: false, paymentIntentId: String(intent.id), clientKey: String(clientKey) }
}

export const checkoutPrepareHandler = async (req: PayloadRequest) => {
  const requestedId = req.headers.get('x-request-id')
  const requestId = requestedId && REQUEST_ID_PATTERN.test(requestedId) ? requestedId : crypto.randomUUID()
  const endpointStartedAt = Date.now()

  try {
    const authStartedAt = Date.now()
    const user = req.user
    logSpan(requestId, 'auth.post_payload', authStartedAt)
    if (!user || user.role !== 'customer' || user.isActive === false) {
      return Response.json({ error: 'Authenticated customer account required.', code: 'CUSTOMER_AUTH_REQUIRED', requestId }, { status: 401 })
    }

    const body = await timed(requestId, 'request.parse', () => readBody(req))
    const merchantId = idOf(body.merchantId)
    const addressId = idOf(body.addressId)
    const rawContactPhone = body.contactPhone === undefined ? user.phone : body.contactPhone
    const recipientPhone =
      typeof rawContactPhone === 'string' && isE164PhoneNumber(rawContactPhone)
        ? rawContactPhone
        : null
    const expectedTotal = amount(body.expectedTotal)
    const paymentMethod = typeof body.paymentMethod === 'string' ? body.paymentMethod : ''
    const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey : ''
    if (!recipientPhone) {
      return Response.json({
        error: 'Enter a phone number in E.164 format, such as +639468748743, before paying.',
        code: 'RECIPIENT_PHONE_REQUIRED',
        requestId,
      }, { status: 400 })
    }
    const customerIdResult = await timed(requestId, 'payload.customer_resolve', () => req.payload.find({
      collection: 'customers',
      where: { user: { equals: user.id } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    }))
    const customer = customerIdResult.docs[0]
    const customerId = customer ? Number(customer.id) : null

    if (
      !customerId ||
      !merchantId ||
      !addressId ||
      !Number.isInteger(customerId) ||
      !Number.isInteger(merchantId) ||
      !Number.isInteger(addressId) ||
      customerId < 1 ||
      merchantId < 1 ||
      addressId < 1
    ) {
      return Response.json({ error: 'Customer profile, merchant, and delivery address are required.', code: 'CHECKOUT_INPUT_INVALID', requestId }, { status: 400 })
    }
    if (!IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
      return Response.json({ error: 'A valid checkout idempotency key is required.', code: 'IDEMPOTENCY_KEY_INVALID', requestId }, { status: 400 })
    }
    if (expectedTotal === null || (paymentMethod && !PAYMENT_METHODS.has(paymentMethod))) {
      return Response.json({ error: 'Checkout total or payment method is invalid.', code: 'CHECKOUT_INPUT_INVALID', requestId }, { status: 400 })
    }
    const cartItemIdsRaw = body.cartItemIds
    const cartItemIds = Array.isArray(cartItemIdsRaw)
      ? cartItemIdsRaw.map(idOf)
      : []
    if (
      !cartItemIds.length ||
      cartItemIds.length > 100 ||
      cartItemIds.some((id) => !id || !Number.isInteger(id) || id < 1) ||
      new Set(cartItemIds).size !== cartItemIds.length ||
      (paymentMethod && !PAYMENT_METHODS.has(paymentMethod))
    ) {
      return Response.json({ error: 'Checkout needs valid cart items and a payment method.', code: 'CHECKOUT_INPUT_INVALID', requestId }, { status: 400 })
    }

    const address = await timed(requestId, 'payload.address_lookup', () => req.payload.findByID({
      collection: 'addresses',
      id: addressId,
      depth: 0,
      overrideAccess: true,
    }))
    if (idOf(address.user) !== Number(user.id)) {
      return Response.json({ error: 'The selected delivery address does not belong to your account.', code: 'ADDRESS_NOT_OWNED', requestId }, { status: 403 })
    }
    const addressCoordinates = address.coordinates as { lat?: unknown; lng?: unknown } | null | undefined

    const existing = await timed(requestId, 'payload.idempotency_lookup', () => findExistingCheckout(req, customerId, idempotencyKey))
    if (existing) {
      const transaction = await timed(requestId, 'payload.transaction_lookup', () => getTransaction(req, Number(existing.id)))
      if (!transaction) throw new Error('Saved checkout is missing its payment record.')
      const linkedCart = await timed(requestId, 'payload.idempotency_cart_check', () => req.payload.find({
        collection: 'cart-items',
        where: { order_id: { equals: existing.id } },
        limit: 100,
        depth: 0,
        overrideAccess: true,
      }))
      const linkedIds = linkedCart.docs.map((item) => Number(item.id)).sort((a, b) => a - b)
      const requestedIds = (cartItemIds as number[]).slice().sort((a, b) => a - b)
      const sameCart = linkedIds.length === requestedIds.length &&
        linkedIds.every((id, index) => id === requestedIds[index])
      const sameAddress = String(existing.checkout_address_id || '') === String(addressId)
      const currentCart = await timed(requestId, 'payload.idempotency_context_lookup', () => req.payload.find({
        collection: 'cart-items',
        where: {
          and: [
            { id: { in: cartItemIds as number[] } },
            { customer: { equals: customerId } },
            { merchant: { equals: merchantId } },
          ],
        },
        limit: cartItemIds.length,
        depth: 0,
        overrideAccess: true,
      }))
      let sameContext = currentCart.docs.length === cartItemIds.length &&
        checkoutContextHash(currentCart.docs, address, recipientPhone) === String(existing.checkout_context_hash || '')
      if (
        !sameContext &&
        currentCart.docs.length === cartItemIds.length &&
        checkoutContextHash(currentCart.docs, address) === String(existing.checkout_context_hash || '')
      ) {
        const savedDeliveryLocation = await timed(requestId, 'payload.idempotency_delivery_lookup', () => req.payload.find({
          collection: 'delivery-locations',
          where: { order: { equals: existing.id } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        }))
        sameContext = normalizeDeliveryPhone(savedDeliveryLocation.docs[0]?.contact_phone) === recipientPhone
      }
      if (!sameCart || !sameAddress || !sameContext) {
        return Response.json({
          error: 'A previous checkout attempt for a different cart or address is still saved. Recover or resolve it before starting another checkout.',
          code: 'CHECKOUT_ATTEMPT_REQUIRES_RECOVERY',
          requestId,
          data: {
            orderId: existing.id,
            transactionId: transaction.id,
            paymentIntentId: transaction.payment_intent_id || null,
            status: transaction.status,
          },
        }, { status: 409 })
      }
      const savedLines = await timed(requestId, 'payload.idempotency_lines_lookup', () => req.payload.find({
        collection: 'order-items',
        where: { order: { equals: existing.id } },
        limit: 100,
        depth: 0,
        overrideAccess: true,
      }))
      const payment = await ensureCheckoutPayment({
        req,
        order: existing,
        transaction,
        idempotencyKey,
        paymentMethod: paymentMethod || String(transaction.payment_method || 'gcash'),
        requestId,
      })
      if (payment.paid && String(transaction.payment_method || '') === 'wallet') {
        await finalizeWalletOrder(req, Number(existing.id), String(transaction.paid_at || new Date().toISOString()))
      }
      if (payment.failed) {
        return Response.json({ error: 'This checkout attempt has failed. Start a new checkout from your cart.', code: 'CHECKOUT_ATTEMPT_FAILED', requestId }, { status: 409 })
      }
      logSpan(requestId, 'endpoint.total', endpointStartedAt)
      return Response.json({
        data: {
          orderId: existing.id,
          transactionId: transaction.id,
          subtotal: Number(existing.subtotal),
          deliveryFee: Number(existing.delivery_fee),
          priorityFee: Number(existing.priority_fee),
          deliveryDiscount: Number(existing.discount_total) || 0,
          freeDeliveryApplied: existing.free_delivery_applied === true,
          total: Number(existing.total),
          paidAt: transaction.paid_at || null,
          lines: savedLines.docs.map((line) => ({
            cartItemId: Number(line.checkout_cart_item_id),
            totalPrice: Number(line.total_price),
          })),
          payment,
          reused: true,
        },
        requestId,
      })
    }

    if (!paymentMethod || !PAYMENT_METHODS.has(paymentMethod)) {
      return Response.json({ error: 'Checkout needs a valid payment method.', code: 'CHECKOUT_INPUT_INVALID', requestId }, { status: 400 })
    }

    const merchant = await timed(requestId, 'payload.merchant_lookup', () => req.payload.findByID({
      collection: 'merchants',
      id: merchantId,
      depth: 0,
      overrideAccess: true,
    }))
    const merchantAddressId = idOf(merchant.activeAddress)
    const merchantAddress = merchantAddressId
      ? await timed(requestId, 'payload.merchant_address_lookup', () => req.payload.findByID({
          collection: 'addresses',
          id: merchantAddressId,
          depth: 0,
          overrideAccess: true,
        }))
      : null
    const pricedCart = await timed(requestId, 'checkout.catalog_price_and_validate', () => priceCheckoutCart({
      payload: req.payload,
      customerId,
      merchantId,
      cartItemIds: cartItemIds as number[],
    }))
    const quote = await timed(requestId, 'provider.delivery_quote', () => getCheckoutDeliveryQuote({
      payload: req.payload,
      merchant,
      merchantAddress,
      customerAddress: address,
    }))
    if (!quote.available) {
      throw new CheckoutValidationError(
        'Lalamove delivery is currently unavailable for this order. Please try again later.',
        'DELIVERY_UNAVAILABLE',
        503,
      )
    }
    if (quote.currency !== 'PHP') {
      throw new CheckoutValidationError('The delivery quote currency is not supported for this checkout.', 'DELIVERY_CURRENCY_UNSUPPORTED', 503)
    }
    const deliveryFee = quote.available ? quote.deliveryFee : 0
    const priorityFee = quote.available ? quote.priorityFee : 0
    const promotion = quote.available
      ? await timed(requestId, 'checkout.first_order_promotion', () => getFirstOrderFreeDeliveryPromotion({
          payload: req.payload,
          customerId,
          distance: quote.distance,
          deliveryFee,
          priorityFee,
        }))
      : { eligible: false, discount: 0, distanceMeters: null }
    const deliveryDiscount = promotion.discount
    const discountTotal = deliveryDiscount
    const total = Math.round((pricedCart.subtotal + deliveryFee + priorityFee - discountTotal) * 100) / 100
    const contextHash = checkoutContextHash(pricedCart.cartItems, address, recipientPhone)

    if (Math.round(expectedTotal * 100) !== Math.round(total * 100)) {
      logSpan(requestId, 'endpoint.total', endpointStartedAt)
      return Response.json({
        error: 'Checkout prices or delivery fees changed. Review the updated total and confirm again before paying.',
        code: 'CHECKOUT_REVIEW_REQUIRED',
        requestId,
        data: {
          subtotal: pricedCart.subtotal,
          lines: pricedCart.lines.map((line) => ({
            cartItemId: line.cartItemId,
            unitPrice: line.unitPrice,
            totalPrice: line.totalPrice,
          })),
          deliveryFee,
          priorityFee,
          deliveryDiscount,
          freeDeliveryApplied: promotion.eligible,
          total,
          currency: quote.currency,
          deliveryAvailable: quote.available,
          distance: quote.distance,
        },
      }, { status: 409 })
    }

    if (paymentMethod === 'wallet') {
      await findOrCreateCustomerWallet(req, customerId)
    }

    if (paymentMethod !== 'wallet' && Math.round(total * 100) < 100 && process.env.PAYMONGO_SANDBOX !== 'true') {
      return Response.json({ error: 'Checkout total must be at least PHP 1.00.', code: 'PAYMENT_MINIMUM_NOT_MET', requestId }, { status: 422 })
    }

    const transactionID = await timed(requestId, 'database.begin_transaction', () => req.payload.db.beginTransaction())
    if (!transactionID) {
      throw new CheckoutValidationError('Database transaction support is required to place this order safely.', 'TRANSACTION_UNAVAILABLE', 503)
    }
    req.transactionID = transactionID
    let order: any
    let transaction: any
    let walletPaidAt: string | null = null
    try {
      req.context = { ...req.context, checkoutPricingValidated: true }
      order = await timed(requestId, 'payload.order_create', () => req.payload.create({
        collection: 'orders',
        data: {
          customer: customerId,
          merchant: merchantId,
          status: 'pending',
          fulfillment_type: 'delivery',
          total,
          subtotal: pricedCart.subtotal,
          delivery_fee: deliveryFee,
          platform_fee: 0,
          priority_fee: priorityFee,
          discount_total: discountTotal,
          ...(promotion.eligible
            ? {
                coupon_code: FIRST_ORDER_FREE_DELIVERY_CODE,
                free_delivery_applied: true,
              }
            : {}),
          placed_at: new Date().toISOString(),
          checkout_idempotency_key: idempotencyKey,
          checkout_address_id: String(addressId),
          checkout_context_hash: contextHash,
        } as never,
        depth: 0,
        overrideAccess: true,
        req,
      }))

      if (promotion.eligible) {
        await timed(requestId, 'payload.delivery_promotion_create', () => req.payload.create({
          collection: 'order-discounts',
          data: {
            order: order.id,
            code: FIRST_ORDER_FREE_DELIVERY_CODE,
            amount_off: deliveryDiscount,
            type: 'fixed',
            coupon_snapshot: {
              campaign: 'first_order_free_delivery',
              maxDistanceMeters: 5000,
              distanceMeters: promotion.distanceMeters,
              deliveryFee,
              priorityFee,
            },
            food_discount: 0,
            delivery_discount: deliveryDiscount,
            funded_by: 'platform',
            vendor_share_pct: 0,
            platform_share: deliveryDiscount,
            vendor_share: 0,
            source: 'auto_campaign',
          } as never,
          depth: 0,
          overrideAccess: true,
          req,
        }))
      }

      for (const line of pricedCart.lines) {
        await timed(requestId, 'payload.order_item_create', () => req.payload.create({
          collection: 'order-items',
          data: {
            order: order.id,
            checkout_cart_item_id: String(line.cartItemId),
            product: line.productId,
            merchant_product: line.merchantProductId,
            product_name_snapshot: line.productName,
            price_at_purchase: line.unitPrice,
            quantity: line.quantity,
            options_snapshot: line.optionsSnapshot,
            total_price: line.totalPrice,
          } as never,
          depth: 0,
          overrideAccess: true,
          req,
        }))
      }

      await timed(requestId, 'payload.delivery_snapshot_create', () => req.payload.create({
        collection: 'delivery-locations',
        data: {
          order: order.id,
          formatted_address: address.formatted_address || 'Delivery Address',
          coordinates: {
            lat: Number(address.latitude ?? addressCoordinates?.lat),
            lng: Number(address.longitude ?? addressCoordinates?.lng),
          },
          street: address.street || [address.street_number, address.route].filter(Boolean).join(' ') || null,
          floor_unit_room: address.floor_unit_room || null,
          delivery_instructions: address.delivery_instructions || null,
          notes: address.notes || address.accessibility_notes || null,
          contact_name: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Customer',
          contact_phone: recipientPhone,
          label: deliveryLabel(address.address_type || address.label),
          merchant_formatted_address: merchant.activeAddress && typeof merchant.activeAddress === 'object'
            ? merchant.activeAddress.formatted_address || null
            : merchantAddress?.formatted_address || null,
          merchant_coordinates: merchantAddress
            ? { lat: merchantAddress.latitude, lng: merchantAddress.longitude }
            : merchant.activeAddress && typeof merchant.activeAddress === 'object'
              ? { lat: merchant.activeAddress.latitude, lng: merchant.activeAddress.longitude }
              : null,
          merchant_street: merchantAddress?.street || null,
          merchant_floor_unit_room: merchantAddress?.floor_unit_room || null,
          merchant_delivery_instructions: merchantAddress?.delivery_instructions || null,
          merchant_label: deliveryLabel(merchantAddress?.address_type || merchantAddress?.label),
        } as never,
        depth: 0,
        overrideAccess: true,
        req,
      }))

      for (const line of pricedCart.lines) {
        await timed(requestId, 'payload.cart_link', () => req.payload.update({
          collection: 'cart-items',
          id: line.cartItemId,
          data: { order_id: order.id, status: 'checked_out' } as never,
          depth: 0,
          overrideAccess: true,
          req,
        }))
      }

      transaction = await timed(requestId, 'payload.transaction_create', () => req.payload.create({
        collection: 'transactions',
        data: {
          order: order.id,
          amount: total,
          currency: 'PHP',
          status: 'pending',
          payment_method: paymentMethod,
        } as never,
        depth: 0,
        overrideAccess: true,
        req,
      }))
      if (paymentMethod === 'wallet') {
        walletPaidAt = new Date().toISOString()
        await debitWalletForOrder(req, customerId, order.id, Math.round(total * 100))
        transaction = await req.payload.update({
          collection: 'transactions',
          id: transaction.id,
          data: { status: 'paid', paid_at: walletPaidAt } as never,
          depth: 0,
          overrideAccess: true,
          req,
        })
        order = await req.payload.update({
          collection: 'orders',
          id: order.id,
          data: { status: 'accepted' } as never,
          depth: 0,
          overrideAccess: true,
          req,
        })
        await ensureDeliveryFulfillment(req, Number(order.id))
      }
      await timed(requestId, 'database.commit_transaction', () => req.payload.db.commitTransaction(transactionID))
      req.transactionID = undefined
    } catch (error) {
      await req.payload.db.rollbackTransaction(transactionID)
      req.transactionID = undefined
      throw error
    }

    let payment: {
      sandbox?: boolean
      paid?: boolean
      wallet?: boolean
      failed?: boolean
      paymentIntentId?: string
      clientKey?: string
    }
    if (paymentMethod === 'wallet') {
      await finalizeWalletOrder(req, Number(order.id), walletPaidAt || new Date().toISOString())
      payment = { sandbox: false, paid: true, wallet: true }
    } else {
      payment = await ensureCheckoutPayment({
          req,
          order,
          transaction,
          idempotencyKey,
          paymentMethod,
          requestId,
        })
    }
    logSpan(requestId, 'endpoint.total', endpointStartedAt)
    return Response.json({
      data: {
        orderId: order.id,
        transactionId: transaction.id,
        subtotal: pricedCart.subtotal,
        lines: pricedCart.lines.map((line) => ({
          cartItemId: line.cartItemId,
          unitPrice: line.unitPrice,
          totalPrice: line.totalPrice,
        })),
        deliveryFee,
        priorityFee,
        deliveryDiscount,
        freeDeliveryApplied: promotion.eligible,
        total,
        currency: quote.currency,
        deliveryAvailable: quote.available,
        distance: quote.distance,
        payment,
        reused: false,
      },
      requestId,
    })
  } catch (error) {
    logSpan(requestId, 'endpoint.total', endpointStartedAt)
    if (error instanceof InsufficientWalletBalanceError) {
      return Response.json({ error: error.message, code: 'WALLET_INSUFFICIENT_BALANCE', requestId }, { status: 402 })
    }
    if (error instanceof CheckoutValidationError) {
      return Response.json({ error: error.message, code: error.code, requestId }, { status: error.status })
    }
    console.error('[checkout] operation failed', {
      requestId,
      error: error instanceof Error ? error.message : 'unknown',
    })
    return Response.json({
      error: 'Checkout could not be completed safely. Retry the same checkout attempt or contact support.',
      code: 'CHECKOUT_PROCESSING_ERROR',
      requestId,
    }, { status: 503 })
  }
}

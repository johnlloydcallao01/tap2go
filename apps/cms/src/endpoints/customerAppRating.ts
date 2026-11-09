import type { PayloadRequest } from 'payload'
import type { AppRating as AppRatingDocument } from '../payload-types'

const MAX_COMMENT_LENGTH = 4000

type AppRating = {
  id: number
  order: number | { id?: number }
  customer: number | { id?: number }
  rating: number
  comment?: string | null
  createdAt?: string
  updatedAt?: string
}

function relationId(value: unknown): number | null {
  const raw = value && typeof value === 'object' && 'id' in value
    ? (value as { id?: unknown }).id
    : value
  const id = Number(raw)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

async function readBody(req: PayloadRequest): Promise<Record<string, unknown>> {
  const request = req as unknown as { json?: () => Promise<unknown>; body?: unknown }
  const body = typeof request.json === 'function' ? await request.json() : request.body
  return body && typeof body === 'object' ? body as Record<string, unknown> : {}
}

function isUniqueConstraintViolation(error: unknown): boolean {
  let current = error
  for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
    const record = current as { code?: unknown; cause?: unknown }
    if (record.code === '23505') return true
    current = record.cause
  }
  return false
}

async function getCustomerId(
  req: PayloadRequest,
  requestedCustomerUserId: unknown,
): Promise<number | null> {
  if (!req.user || !['customer', 'service', 'admin'].includes(String(req.user.role))) return null
  if (req.user.role === 'customer' && req.user.isActive === false) return null

  const customerUserId = req.user.role === 'customer'
    ? Number(req.user.id)
    : Number(requestedCustomerUserId)
  if (!Number.isSafeInteger(customerUserId) || customerUserId <= 0) return null

  const result = await req.payload.find({
    collection: 'customers',
    where: { user: { equals: customerUserId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return result.docs[0]?.id ?? null
}

async function getCompletedOrderRatingContext(
  req: PayloadRequest,
  orderId: number,
  customerId: number,
) {
  const orders = await req.payload.find({
    collection: 'orders',
    where: {
      and: [
        { id: { equals: orderId } },
        { customer: { equals: customerId } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  const order = orders.docs[0]
  if (!order) return null

  const active = !['cancelled', 'canceled'].includes(String(order.status).toLowerCase())
  const completed = active && (
    order.status === 'delivered' ||
    (order.fulfillment_type === 'delivery' && order.delivery_status === 'completed')
  )

  return { order, completed }
}

async function findCustomerRating(req: PayloadRequest, customerId: number) {
  const result = await req.payload.find({
    collection: 'app-ratings',
    where: { customer: { equals: customerId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })
  return result.docs[0] as unknown as AppRating | undefined
}

export async function customerAppRatingHandler(req: PayloadRequest) {
  try {
    if (req.method === 'GET') {
      const query = req.query as { orderId?: string; customerId?: string }
      const orderId = Number(query.orderId)
      if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return Response.json({ error: 'A valid orderId is required.' }, { status: 400 })
      }
      const customerId = await getCustomerId(req, query.customerId)
      if (!customerId) {
        return Response.json({ error: 'Authenticated customer account required.' }, { status: 401 })
      }

      const context = await getCompletedOrderRatingContext(req, orderId, customerId)
      if (!context) return Response.json({ error: 'Order not found.' }, { status: 404 })

      const rating = await findCustomerRating(req, customerId)
      return Response.json({
        orderId,
        eligible: context.completed,
        submitted: Boolean(rating),
        firstCompletedOrderId: rating ? relationId(rating.order) : null,
        rating: rating?.rating ?? null,
        comment: rating?.comment ?? null,
        createdAt: rating?.createdAt ?? null,
        updatedAt: rating?.updatedAt ?? null,
      })
    }

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed.' }, { status: 405 })
    }

    const body = await readBody(req)
    const orderId = Number(body.orderId)
    const rating = Number(body.rating)
    const comment = typeof body.comment === 'string' ? body.comment.trim() : ''
    if (
      !Number.isSafeInteger(orderId) || orderId <= 0 ||
      !Number.isInteger(rating) || rating < 1 || rating > 5 ||
      comment.length > MAX_COMMENT_LENGTH
    ) {
      return Response.json({
        error: `A valid orderId, a whole-number rating from 1 to 5, and a comment of at most ${MAX_COMMENT_LENGTH} characters are required.`,
      }, { status: 400 })
    }

    const customerId = await getCustomerId(req, body.customerId)
    if (!customerId) {
      return Response.json({ error: 'Authenticated customer account required.' }, { status: 401 })
    }

    const context = await getCompletedOrderRatingContext(req, orderId, customerId)
    if (!context) return Response.json({ error: 'Order not found.' }, { status: 404 })
    if (!context.completed) {
      return Response.json({ error: 'App ratings are available after an order is completed.' }, { status: 409 })
    }
    try {
      const existingRating = await findCustomerRating(req, customerId)
      const saved = existingRating
        ? await req.payload.update({
            collection: 'app-ratings',
            id: existingRating.id,
            data: {
              rating,
              comment: comment || null,
            },
            overrideAccess: true,
            req,
          }) as unknown as AppRating
        : await req.payload.create({
            collection: 'app-ratings',
            data: {
              order: orderId,
              customer: customerId,
              rating,
              comment: comment || undefined,
            } satisfies Pick<AppRatingDocument, 'order' | 'customer' | 'rating' | 'comment'>,
            overrideAccess: true,
            req,
          }) as unknown as AppRating

      return Response.json({
        id: saved.id,
        firstCompletedOrderId: relationId(saved.order),
        rating: saved.rating,
        comment: saved.comment ?? null,
        createdAt: saved.createdAt ?? null,
        updatedAt: saved.updatedAt ?? null,
      }, { status: existingRating ? 200 : 201 })
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        const ratingAfterConflict = await findCustomerRating(req, customerId)
        if (ratingAfterConflict) {
          const saved = await req.payload.update({
            collection: 'app-ratings',
            id: ratingAfterConflict.id,
            data: { rating, comment: comment || null },
            overrideAccess: true,
            req,
          }) as unknown as AppRating
          return Response.json({
            id: saved.id,
            firstCompletedOrderId: relationId(saved.order),
            rating: saved.rating,
            comment: saved.comment ?? null,
            createdAt: saved.createdAt ?? null,
            updatedAt: saved.updatedAt ?? null,
          })
        }
      }
      throw error
    }
  } catch (error) {
    console.error('[customer/app-rating] Request failed:', error)
    return Response.json({ error: 'Unable to process the app rating.' }, { status: 500 })
  }
}

import type { PayloadRequest } from 'payload'
import crypto from 'crypto'

export const customerCartHandler = async (req: PayloadRequest) => {
  const startedAt = Date.now()
  const requestedId = req.headers.get('x-request-id')
  const requestId =
    requestedId && /^[a-zA-Z0-9_-]{1,64}$/.test(requestedId)
      ? requestedId
      : crypto.randomUUID()

  if (!req.user || (req.user.role !== 'service' && req.user.role !== 'admin')) {
    return Response.json(
      { success: false, error: 'Access denied', requestId },
      { status: 401 },
    )
  }

  const query = req.query as { customerId?: string } | undefined
  const urlCustomerId = req.url
    ? new URL(req.url).searchParams.get('customerId') ?? undefined
    : undefined
  const customerIdValue =
    query?.customerId ?? urlCustomerId
  const customerId = Number(customerIdValue)
  if (!Number.isSafeInteger(customerId) || customerId <= 0) {
    return Response.json(
      { success: false, error: 'A valid customerId is required', requestId },
      { status: 400 },
    )
  }

  try {
    const queryStartedAt = Date.now()
    const result = await req.payload.find({
      collection: 'cart-items',
      where: {
        and: [
          { customer: { equals: customerId } },
          { status: { equals: 'active' } },
        ],
      },
      depth: 3,
      limit: 200,
      overrideAccess: true,
      context: {
        skipEffectiveModifierPreview: true,
        skipStoreHours: true,
      },
    })

    console.info('[customer-cart] timing', {
      requestId,
      phase: 'payload_find',
      durationMs: Date.now() - queryStartedAt,
      itemCount: result.docs.length,
      totalDurationMs: Date.now() - startedAt,
    })

    return Response.json({
      success: true,
      docs: result.docs,
      totalDocs: result.totalDocs,
      requestId,
    })
  } catch (error) {
    console.error('[customer-cart] request failed', {
      requestId,
      durationMs: Date.now() - startedAt,
      error,
    })
    return Response.json(
      { success: false, error: 'Failed to load cart', requestId },
      { status: 500 },
    )
  }
}

import type { PayloadRequest } from 'payload'

export const customerCartHandler = async (req: PayloadRequest) => {
  if (!req.user) {
    return Response.json({ error: 'Authentication required.' }, { status: 401 })
  }

  if (req.user.role !== 'service' && req.user.role !== 'admin') {
    return Response.json({ error: 'Access denied.' }, { status: 403 })
  }

  const query = req.query as { customerId?: string } | undefined
  const customerIdParam =
    query?.customerId ??
    new URL(req.url ?? '', 'http://localhost').searchParams.get('customerId') ??
    undefined
  const customerId = Number(customerIdParam)
  if (!customerIdParam || !Number.isSafeInteger(customerId) || customerId < 1) {
    return Response.json({ error: 'A valid customerId is required.' }, { status: 400 })
  }

  const startedAt = Date.now()
  try {
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
      req,
      context: {
        skipEffectiveModifierPreview: true,
        skipStoreHours: true,
      },
    })

    console.info('[customer-cart] read complete', {
      durationMs: Date.now() - startedAt,
      itemCount: result.docs.length,
    })
    return Response.json(result)
  } catch (error) {
    console.error('[customer-cart] read failed', {
      durationMs: Date.now() - startedAt,
      error,
    })
    return Response.json({ error: 'Unable to load cart.' }, { status: 500 })
  }
}

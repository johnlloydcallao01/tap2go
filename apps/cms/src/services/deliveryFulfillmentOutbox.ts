import type { PayloadRequest } from 'payload'

export async function ensureDeliveryFulfillment(req: PayloadRequest, orderId: number) {
  const existing = await req.payload.find({
    collection: 'delivery-fulfillment-outbox',
    where: { order: { equals: orderId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  })

  if (existing.docs[0]) return existing.docs[0]

  try {
    return await req.payload.create({
      collection: 'delivery-fulfillment-outbox',
      data: { order: orderId, status: 'pending', attempt_count: 0 },
      overrideAccess: true,
      req,
    })
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code !== '23505') throw error

    const raced = await req.payload.find({
      collection: 'delivery-fulfillment-outbox',
      where: { order: { equals: orderId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (!raced.docs[0]) throw error
    return raced.docs[0]
  }
}

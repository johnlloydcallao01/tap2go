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

  let outbox = existing.docs[0]

  if (!outbox) {
    try {
      outbox = await req.payload.create({
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
      outbox = raced.docs[0]
    }
  }

  if (outbox.status === 'pending' || outbox.status === 'retryable') {
    await enqueueDeliveryFulfillment(req)
  }
  return outbox
}

async function enqueueDeliveryFulfillment(req: PayloadRequest) {
  await req.payload.jobs.queue({
    task: 'delivery-fulfillment',
    input: {},
    req,
  } as never)
}

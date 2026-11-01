import type { TaskConfig } from 'payload'
import type { PayloadRequest } from 'payload'
import { createNotificationFanout, getOrderStatusLabel } from '../utils/notificationFanout'

type EventInput = {
  eventKey: string
  kind: 'order.created' | 'order.status_changed' | 'payment.status'
  orderId: string
  transactionId?: string
  status: string
  previousStatus?: string
  amount?: number
  currency?: string
}

function relationId(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return relationId((value as { id?: unknown }).id)
  }
  return null
}

async function deliverToUser(
  req: PayloadRequest,
  userId: string | number,
  input: EventInput,
  message: { title: string; body: string; priority: 'info' | 'warning' | 'critical'; typeKey: string },
  audience: string,
) {
  await createNotificationFanout({
    payload: req.payload,
    userId,
    ...message,
    domain: 'order',
    sourceEntityType: input.kind.startsWith('payment') ? 'transaction' : 'order',
    sourceEntityId: input.transactionId || input.orderId,
    idempotencyKey: `${input.eventKey}:${audience}:${userId}`,
    metadata: {
      orderId: input.orderId,
      transactionId: input.transactionId,
      status: input.status,
      previousStatus: input.previousStatus,
      amount: input.amount,
      currency: input.currency,
    },
  })
}

export async function notificationFanoutTask({
  input,
  req,
}: {
  input: { event: EventInput }
  req: PayloadRequest
}) {
  const event = input.event
  const order = await req.payload.findByID({
    collection: 'orders',
    id: event.orderId,
    depth: 0,
    overrideAccess: true,
  })
  const statusLabel = getOrderStatusLabel(event.status, order.delivery_status)
  const isPayment = event.kind === 'payment.status'
  const isCreated = event.kind === 'order.created'
  const title = isPayment ? `Payment ${event.status}` : isCreated ? 'New order received' : `Order ${statusLabel}`
  const body = isPayment
    ? `A payment for order #${event.orderId} is ${event.status}.`
    : isCreated
      ? `Order #${event.orderId} has been placed.`
      : `Order #${event.orderId} is now ${statusLabel.toLowerCase()}.`
  const priority = event.status === 'failed' || event.status === 'cancelled'
    ? isPayment ? 'critical' as const : 'warning' as const
    : event.status === 'refunded' ? 'warning' as const : 'info' as const
  const typeKey = isPayment ? `payment.${event.status}` : event.kind
  const message = { title, body, priority, typeKey }

  const admins = await req.payload.find({
    collection: 'users',
    where: { role: { equals: 'admin' } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  await Promise.all(admins.docs.map((admin) => deliverToUser(req, admin.id, event, message, 'admin')))

  const merchantId = relationId(order.merchant)
  if (merchantId) {
    const merchant = await req.payload.findByID({
      collection: 'merchants',
      id: merchantId,
      depth: 0,
      overrideAccess: true,
    })
    const vendorId = relationId(merchant.vendor)
    if (vendorId) {
      const vendor = await req.payload.findByID({
        collection: 'vendors',
        id: vendorId,
        depth: 0,
        overrideAccess: true,
      })
      const vendorUserId = relationId(vendor.user)
      if (vendorUserId) {
        await deliverToUser(req, vendorUserId, event, message, 'merchant')
      }
    }
  }

  if (!isPayment) {
    const customerId = relationId(order.customer)
    if (customerId) {
      const customer = await req.payload.findByID({
        collection: 'customers',
        id: customerId,
        depth: 0,
        overrideAccess: true,
      })
      const customerUserId = relationId(customer.user)
      if (customerUserId) {
        const customerMessage = isCreated
          ? {
              title: 'New order placed',
              body: `Your order #${event.orderId} has been placed. We'll let you know as soon as it's confirmed.`,
              priority: 'info' as const,
              typeKey: 'order.created',
            }
          : {
              title: `Order ${statusLabel}`,
              body: `Your order #${event.orderId} is now ${statusLabel.toLowerCase()}.`,
              priority,
              typeKey: 'order.status_changed',
            }
        await deliverToUser(req, customerUserId, event, customerMessage, 'customer')
      }
    }
  }

  return { output: { delivered: true } }
}

export const notificationFanoutTaskConfig: TaskConfig<any> = {
  slug: 'notification-fanout',
  label: 'Deliver order and payment notifications',
  inputSchema: [{ name: 'event', type: 'json', required: true }],
  retries: { attempts: 10, backoff: { type: 'exponential', delay: 30000 } },
  handler: notificationFanoutTask as any,
}

export async function enqueueNotificationFanout(req: PayloadRequest, event: EventInput) {
  await req.payload.jobs.queue({
    task: 'notification-fanout',
    input: { event },
    req,
  } as never)
}

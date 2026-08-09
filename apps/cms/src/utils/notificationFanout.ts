import type { Payload } from 'payload'
import { broadcastUserNotification } from './supabaseNotifications'

// ============================================================================
// Notification Fanout for the ordering system
//
// Creates the durable notification records (notification-events +
// user-notifications) and then pushes the realtime broadcast so the customer's
// bell updates instantly.
// ============================================================================

type NotificationFanoutArgs = {
  payload: Payload
  /** Payload `users` collection id of the recipient. */
  userId: string | number
  typeKey: string
  domain: 'order' | 'account' | 'system' | 'marketing' | 'custom'
  title: string
  body: string
  sourceEntityType?: string
  sourceEntityId?: string | number
  metadata?: Record<string, unknown>
  priority?: 'info' | 'warning' | 'critical'
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for pickup',
  on_delivery: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function getOrderStatusLabel(status?: string | null): string {
  if (!status) return 'updated'
  return ORDER_STATUS_LABELS[status] || status
}

export async function createNotificationFanout({
  payload,
  userId,
  typeKey,
  domain,
  title,
  body,
  sourceEntityType,
  sourceEntityId,
  metadata,
  priority = 'info',
}: NotificationFanoutArgs) {
  if (!userId) return null

  const deliveredAt = new Date().toISOString()
  const numericUserId = typeof userId === 'number' ? userId : Number(userId)
  if (!Number.isFinite(numericUserId)) return null

  // Try to attach a template for admin-configured messages (optional).
  let template: number | undefined
  try {
    const templateResult = await payload.find({
      collection: 'notification-templates',
      where: { typeKey: { equals: typeKey } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const templateId = templateResult.docs[0]?.id
    if (typeof templateId === 'number') {
      template = templateId
    } else if (typeof templateId === 'string' && /^\d+$/.test(templateId)) {
      template = Number(templateId)
    }
  } catch {
    // Templates are optional - never fail the fanout over a template lookup.
  }

  const notificationEvent = await payload.create({
    collection: 'notification-events',
    data: {
      ...(template ? { template } : {}),
      typeKey,
      domain,
      title,
      body,
      metadata,
      origin: 'automatic',
      priority,
      ...(sourceEntityType ? { sourceEntityType } : {}),
      ...(sourceEntityId != null ? { sourceEntityId: String(sourceEntityId) } : {}),
    },
    depth: 0,
    overrideAccess: true,
  })

  const userNotification = await payload.create({
    collection: 'user-notifications',
    data: {
      user: numericUserId,
      notificationEvent: notificationEvent.id,
      channel: 'in_app',
      status: 'unread',
      deliveredAt,
    },
    depth: 0,
    overrideAccess: true,
  })

  await broadcastUserNotification(userId, {
    id: userNotification.id,
    title,
    body,
    domain,
    typeKey,
    status: 'unread',
    channel: 'in_app',
    priority,
    deliveredAt,
    metadata,
  })

  return { notificationEvent, userNotification }
}
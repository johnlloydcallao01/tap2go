import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// ============================================================================
// Supabase Realtime Notifications - Server-side broadcaster
//
// Mirrors the pattern used by the grandline CMS: the CMS server pushes an
// ephemeral broadcast to the user's notification channel (`notifications:user:{id}`)
// over Supabase Realtime. Clients that are subscribed to that channel update
// the notification bell instantly without polling.
// ============================================================================

let serviceClient: SupabaseClient | null = null

/**
 * Get the Supabase service-role client for server-side broadcasting.
 * Uses the service role key so it can publish to any channel.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  if (serviceClient) return serviceClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.warn(
      '[SupabaseNotifications] Missing Supabase env vars ' +
        '(NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY). Realtime notifications are disabled.',
    )
    return null
  }

  serviceClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return serviceClient
}

export function getOrderRealtimeChannelName(userId: string | number): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null

  const token = crypto.createHmac('sha256', key).update(String(userId)).digest('hex')
  return `orders:${token}`
}

async function broadcast(
  channelName: string,
  event: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const supabase = getSupabaseServiceClient()
  if (!supabase) return

  const channel = supabase.channel(channelName)
  await new Promise<void>((resolve) => {
    let finished = false
    let sendStarted = false
    const timeout = setTimeout(() => {
      console.error(`[SupabaseNotifications] Broadcast ${event} timed out before delivery`)
      finish()
    }, 5000)

    const finish = () => {
      if (finished) return
      finished = true
      clearTimeout(timeout)
      void supabase.removeChannel(channel).finally(resolve)
    }

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' && !sendStarted) {
        sendStarted = true
        void channel.send({ type: 'broadcast', event, payload }).then((result) => {
          if (result !== 'ok') {
            console.error(`[SupabaseNotifications] Broadcast ${event} failed:`, result)
          }
          finish()
        }).catch((error) => {
          console.error(`[SupabaseNotifications] Broadcast ${event} failed:`, error)
          finish()
        })
      } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
        console.error(`[SupabaseNotifications] Broadcast channel ${status}: ${event}`)
        finish()
      }
    })
  })
}

export async function broadcastUserOrderUpdate(
  userId: string | number,
  orderId: string | number,
): Promise<void> {
  const channelName = getOrderRealtimeChannelName(userId)
  if (!channelName) {
    console.warn('[SupabaseNotifications] Order Realtime is disabled: service role key is missing.')
    return
  }

  await broadcast(channelName, 'order_updated', {
    orderId: String(orderId),
    updatedAt: new Date().toISOString(),
  })
}

export interface BroadcastNotificationPayload {
  id: string | number
  title: string
  body: string
  domain: string
  typeKey: string
  status: string
  channel: string
  priority?: string
  deliveredAt: string
  metadata?: Record<string, unknown>
}

/**
 * Broadcast a notification event to a specific user via Supabase Realtime.
 * Delivery is best-effort - persisted notification rows remain available for
 * the client's REST reconciliation if the Realtime broadcast fails.
 */
export async function broadcastUserNotification(
  userId: string | number,
  notification: BroadcastNotificationPayload,
): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient()
    if (!supabase) return

    const channelName = `notifications:user:${userId}`
    await broadcast(channelName, 'new_notification', {
      type: 'new_notification',
      notification,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[SupabaseNotifications] Failed to broadcast notification:', error)
  }
}

/**
 * Broadcast a "mark as read" event so every connected client updates its
 * unread badge immediately.
 */
export async function broadcastNotificationRead(
  userId: string | number,
  notificationId: string | number,
): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient()
    if (!supabase) return

    const channelName = `notifications:user:${userId}`
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: {
          self: true,
        },
      },
    })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'notification_read',
          payload: {
            type: 'notification_read',
            notificationId: String(notificationId),
            timestamp: new Date().toISOString(),
          },
        })

        setTimeout(() => {
          supabase.removeChannel(channel)
        }, 1000)
      }
    })
  } catch (error) {
    console.error('[SupabaseNotifications] Failed to broadcast read status:', error)
  }
}
import type { PayloadRequest } from 'payload'
import { getOrderRealtimeChannelName } from '../utils/supabaseNotifications'

export async function customerOrderRealtimeChannelHandler(req: PayloadRequest) {
  const user = req.user
  if (!user || user.role !== 'customer' || user.isActive === false) {
    return Response.json({ error: 'Active customer authentication required.' }, { status: 401 })
  }

  const channelName = getOrderRealtimeChannelName(user.id)
  if (!channelName) {
    return Response.json({ error: 'Order updates are temporarily unavailable.' }, { status: 503 })
  }

  return Response.json({ channelName })
}

import { PayloadRequest } from 'payload'
import { DeliveryCancellationError, cancelDeliveryOrder } from '../services/deliveryCancellation'

/**
 * POST /api/delivery/cancel
 *
 * Cancels a Lalamove-delivered order so the delivery fee is not charged.
 * Per the Lalamove API, cancellation is allowed while the order is in
 * `ASSIGNING_DRIVER`, or within 5 minutes of a rider being matched.
 *
 * Body: { orderId: number }
 *
 * Response: { data: { canceled: true, deliveredId, refundedDeliveryFee } }
 * or 409 if the order can no longer be cancelled.
 */
export const deliveryCancelHandler = async (req: PayloadRequest) => {
  try {
    if (!req.user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const hasJson = typeof (req as any).json === 'function'
    const parsed = (await (hasJson ? (req as any).json() : Promise.resolve((req as any).body))) ?? {}
    const { orderId } = parsed as { orderId?: number }

    if (!orderId) {
      return Response.json({ error: 'orderId is required' }, { status: 400 })
    }

    // 1. Load the order
    const order = await req.payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 1,
    })

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    return Response.json({ data: await cancelDeliveryOrder(req.payload, order as Record<string, any>, orderId) })
  } catch (error: any) {
    if (error instanceof DeliveryCancellationError) {
      return Response.json(
        { error: error.message, ...(error.code ? { code: error.code } : {}) },
        { status: error.status },
      )
    }
    console.error('[delivery/cancel] Error:', error)
    return Response.json(
      { error: error?.message || 'Failed to cancel delivery' },
      { status: 500 },
    )
  }
}
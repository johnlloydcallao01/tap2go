import type { Payload } from 'payload'
import { getDeliveryProvider } from './deliveryProviders'

export class DeliveryCancellationError extends Error {
  constructor(
    message: string,
    readonly status = 409,
    readonly code?: string,
  ) {
    super(message)
  }
}

export async function cancelDeliveryOrder(
  payload: Payload,
  order: Record<string, any>,
  orderId: number,
  options: { overrideAccess?: boolean } = {},
) {
  if (order.fulfillment_type !== 'delivery') {
    throw new DeliveryCancellationError('Order is not a delivery order', 422)
  }

  if (
    order.status === 'cancelled'
    || order.delivery_status === 'canceled'
    || order.delivery_status === 'expired'
  ) {
    return { canceled: true, orderId, alreadyCanceled: true }
  }

  const bookings = await payload.find({
    collection: 'delivery-bookings',
    where: { order: { equals: orderId } },
    limit: 1,
    overrideAccess: options.overrideAccess === true,
  })
  const booking = bookings.docs[0] as
    | { id: number | string; lalamove_order_id?: string | null; delivery_fee?: number | null }
    | undefined
  const lalamoveOrderId = booking?.lalamove_order_id || order.lalamove_order_id

  if (!lalamoveOrderId) {
    throw new DeliveryCancellationError(
      'This order has no active Lalamove delivery to cancel. If a rider is already assigned, contact support.',
    )
  }

  try {
    const provider = await getDeliveryProvider(payload)
    await provider.cancelOrder(lalamoveOrderId)
  } catch (error) {
    if (
      typeof error === 'object'
      && error !== null
      && 'isCancellationForbidden' in error
      && error.isCancellationForbidden === true
    ) {
      throw new DeliveryCancellationError(
        'This order can no longer be cancelled — a rider has already been dispatched (cancellation is only allowed while we are still finding a rider, or within 5 minutes of matching).',
        409,
        'ERR_CANCELLATION_FORBIDDEN',
      )
    }
    throw error
  }

  const refundedFee = booking?.delivery_fee || order.delivery_fee || 0
  const preservedDiscount = Number(order.discount_total) || 0
  const preservedPriority = Number(order.priority_fee) || 0
  const newTotal = Math.max(
    0,
    Math.round(
      ((Number(order.subtotal) || 0)
        + (Number(order.platform_fee) || 0)
        + preservedPriority
        - preservedDiscount) * 100,
    ) / 100,
  )

  if (booking) {
    await payload.update({
      collection: 'delivery-bookings',
      id: booking.id,
      data: {
        status: 'canceled',
        lalamove_raw_status: 'CANCELED',
      },
      overrideAccess: options.overrideAccess === true,
    })
  } else {
    await payload.update({
      collection: 'orders',
      id: orderId,
      data: { delivery_status: 'canceled' },
      overrideAccess: options.overrideAccess === true,
    })
  }

  await payload.update({
    collection: 'orders',
    id: orderId,
    data: {
      status: 'cancelled',
      delivery_status: 'canceled',
      delivery_fee: 0,
      total: newTotal,
    },
    overrideAccess: options.overrideAccess === true,
  })

  await payload.create({
    collection: 'order-tracking',
    data: {
      order: orderId,
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      description: `Delivery cancelled on Lalamove. Delivery fee of ₱${refundedFee} was not charged.`,
    },
    overrideAccess: options.overrideAccess === true,
  })

  return { canceled: true, orderId, refundedDeliveryFee: refundedFee }
}

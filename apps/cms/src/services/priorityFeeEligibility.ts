import type { Payload } from 'payload'
import { getDeliveryProvider } from './deliveryProviders'

export async function getPriorityFeeEligibilityError(
  payload: Payload,
  order: Record<string, unknown>,
  booking?: Record<string, unknown> | null,
): Promise<string | null> {
  if (order.fulfillment_type !== 'delivery') {
    return 'This is a pickup order; priority fees are only available for delivery orders.'
  }
  if (!order.lalamove_order_id) {
    return 'This order has no Lalamove order ID, so a priority fee cannot be added.'
  }
  if (!booking?.lalamove_order_id) {
    return 'No delivery booking with a Lalamove order ID was found for this order.'
  }

  const orderStatus = String(order.status || '').trim()
  const normalizedOrderStatus = orderStatus.toLowerCase()
  if (['cancelled', 'canceled', 'delivered'].includes(normalizedOrderStatus)) {
    return `Tap2Go has marked this order "${orderStatus}", so a priority fee can no longer be added.`
  }

  const provider = await getDeliveryProvider(payload)
  const liveOrder = await provider.getOrderDetails(String(booking.lalamove_order_id))
  const lalamoveStatus = String(liveOrder?.status || '').trim()
  if (lalamoveStatus.toUpperCase() !== 'ASSIGNING_DRIVER') {
    return `Lalamove's current status is "${lalamoveStatus || 'unknown'}"; a priority fee can only be added while it is "ASSIGNING_DRIVER".`
  }

  return null
}

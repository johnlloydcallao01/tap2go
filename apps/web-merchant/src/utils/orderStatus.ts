const LALAMOVE_STATUSES = new Set([
  'assigning_driver',
  'driver_assigned',
  'picked_up',
  'completed',
  'canceled',
  'rejected',
  'expired',
])

const ORDER_STATUS_ALIASES: Record<string, string> = {
  preparing: 'assigning_driver',
  ready_for_pickup: 'driver_assigned',
  on_delivery: 'picked_up',
  delivered: 'completed',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  assigning_driver: 'Assigning Driver',
  driver_assigned: 'On Going',
  picked_up: 'Picked Up',
  completed: 'Completed',
  canceled: 'Canceled',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  expired: 'Expired',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready for Pickup',
  on_delivery: 'On Delivery',
  delivered: 'Delivered',
  none: 'Not booked',
}

export const ORDER_PROGRESS_STEPS = [
  { key: 'accepted', label: 'Accepted' },
  { key: 'assigning_driver', label: 'Assigning Driver' },
  { key: 'driver_assigned', label: 'On Going' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'completed', label: 'Completed' },
]

export function getEffectiveOrderStatus(
  fulfillmentType: string,
  orderStatus: string,
  lalamoveStatus: string | null | undefined,
): string {
  const deliveryStatus = (lalamoveStatus || '').toLowerCase()
  return fulfillmentType === 'delivery' && LALAMOVE_STATUSES.has(deliveryStatus)
    ? deliveryStatus
    : orderStatus.toLowerCase()
}

export function getOrderStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Status unavailable'
  return STATUS_LABELS[status.toLowerCase()] || 'Status unavailable'
}

export function getOrderDetailProgressStatus(
  orderStatus: string,
  fulfillmentType: string,
  lalamoveStatus: string | null | undefined,
): string {
  const normalizedOrderStatus = orderStatus.toLowerCase()
  const normalizedDeliveryStatus = (lalamoveStatus || '').toLowerCase()
  if (fulfillmentType === 'delivery' && LALAMOVE_STATUSES.has(normalizedDeliveryStatus)) {
    return normalizedDeliveryStatus
  }
  if (['cancelled', 'canceled'].includes(normalizedOrderStatus)) return normalizedOrderStatus
  if (normalizedOrderStatus === 'accepted') return 'accepted'
  if (normalizedOrderStatus === 'pending') return 'pending'
  if (fulfillmentType === 'delivery' && normalizedDeliveryStatus === 'pending') return 'pending'
  return ORDER_STATUS_ALIASES[normalizedOrderStatus] || normalizedOrderStatus
}

export function getOrderProgressStepIndex(status: string): number {
  const normalized = ORDER_STATUS_ALIASES[status.toLowerCase()] || status.toLowerCase()
  if (normalized === 'pending') return -1
  return ORDER_PROGRESS_STEPS.findIndex((step) => step.key === normalized)
}

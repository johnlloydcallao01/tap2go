import type { Payload } from 'payload'

export const FIRST_ORDER_FREE_DELIVERY_DISTANCE_METERS = 5_000
export const FIRST_ORDER_FREE_DELIVERY_CODE = 'NEWUSER5KM'

export function distanceInMeters(distance: unknown): number | null {
  if (!distance || typeof distance !== 'object') return null
  const value = Number((distance as { value?: unknown }).value)
  const unit = String((distance as { unit?: unknown }).unit || '').trim().toLowerCase()
  if (!Number.isFinite(value) || value < 0) return null
  if (unit === 'm' || unit === 'meter' || unit === 'meters') return value
  if (unit === 'km' || unit === 'kilometer' || unit === 'kilometers') return value * 1000
  return null
}

export async function hasPreviouslyPaidOrder(
  payload: Payload,
  customerId: number | string,
): Promise<boolean> {
  const result = await payload.count({
    collection: 'transactions',
    where: {
      and: [
        { status: { equals: 'paid' } },
        { 'order.customer': { equals: customerId } },
        {
          or: [
            { transaction_type: { not_equals: 'priority_fee' } },
            { transaction_type: { exists: false } },
          ],
        },
      ],
    } as never,
    overrideAccess: true,
  })

  return result.totalDocs > 0
}

export async function getFirstOrderFreeDeliveryPromotion(args: {
  payload: Payload
  customerId: number | string
  distance: unknown
  deliveryFee: number
  priorityFee: number
}): Promise<{ eligible: boolean; discount: number; distanceMeters: number | null }> {
  const distanceMeters = distanceInMeters(args.distance)
  const totalDeliveryCharge = Math.round((args.deliveryFee + args.priorityFee) * 100) / 100
  if (
    distanceMeters === null ||
    distanceMeters > FIRST_ORDER_FREE_DELIVERY_DISTANCE_METERS ||
    !Number.isFinite(totalDeliveryCharge) ||
    totalDeliveryCharge <= 0
  ) {
    return { eligible: false, discount: 0, distanceMeters }
  }

  const eligible = !(await hasPreviouslyPaidOrder(args.payload, args.customerId))
  return {
    eligible,
    discount: eligible ? totalDeliveryCharge : 0,
    distanceMeters,
  }
}

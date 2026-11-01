import type { Payload } from 'payload'
import { getDeliveryProvider, type DeliveryProvider } from './deliveryProviders'
import type { LalamoveStop } from './lalamoveClient'

function relationId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && Number.isFinite(Number(value))) return Number(value)
  if (value && typeof value === 'object' && 'id' in value) {
    return relationId((value as { id?: unknown }).id)
  }
  return null
}

function coordinates(address: any): { lat: number; lng: number } | null {
  const jsonCoordinates = address?.coordinates
  const lat = Number(address?.latitude ?? jsonCoordinates?.lat)
  const lng = Number(address?.longitude ?? jsonCoordinates?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null
  }
  return { lat, lng }
}

export type CheckoutDeliveryQuote = {
  available: boolean
  deliveryFee: number
  priorityFee: number
  currency: string
  distance?: { value: number | string; unit: string }
  quotationId?: string
  expiresAt?: string
}

export async function getCheckoutDeliveryQuote(args: {
  payload: Payload
  merchant: any
  merchantAddress?: any
  customerAddress: any
}): Promise<CheckoutDeliveryQuote> {
  const provider: DeliveryProvider = await getDeliveryProvider(args.payload)
  if (provider.name !== 'lalamove') {
    return { available: false, deliveryFee: 0, priorityFee: 0, currency: 'PHP' }
  }

  const merchantAddressId = relationId(args.merchant.activeAddress)
  const merchantAddress = args.merchantAddress !== undefined
    ? args.merchantAddress
    : merchantAddressId
    ? await args.payload.findByID({
        collection: 'addresses',
        id: merchantAddressId,
        depth: 0,
        overrideAccess: true,
      })
    : null
  const pickup = coordinates(merchantAddress) ?? coordinates({
    latitude: args.merchant.merchant_latitude,
    longitude: args.merchant.merchant_longitude,
  })
  const dropoff = coordinates(args.customerAddress)

  if (!pickup || !dropoff) {
    throw new Error('Delivery coordinates are not available for this address or merchant.')
  }

  const stops: LalamoveStop[] = [
    {
      coordinates: { lat: String(pickup.lat), lng: String(pickup.lng) },
      address: String(merchantAddress?.formatted_address || args.merchant.outletName || 'Merchant Location'),
    },
    {
      coordinates: { lat: String(dropoff.lat), lng: String(dropoff.lng) },
      address: String(args.customerAddress.formatted_address || 'Delivery Location'),
    },
  ]

  const quotation = await provider.getQuotation(stops, provider.getServiceTypeDefault(), {
    language: 'en_PH',
  })
  const deliveryFee = Number(quotation.priceBreakdown.total)
  const priorityFee = Number(provider.getPriorityFeeEnv()) || 0
  if (!Number.isFinite(deliveryFee) || deliveryFee < 0 || !Number.isFinite(priorityFee) || priorityFee < 0) {
    throw new Error('The delivery provider returned an invalid quote.')
  }

  return {
    available: true,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    priorityFee: Math.round(priorityFee * 100) / 100,
    currency: quotation.priceBreakdown.currency || 'PHP',
    distance: quotation.distance,
    quotationId: quotation.quotationId,
    expiresAt: quotation.expiresAt,
  }
}

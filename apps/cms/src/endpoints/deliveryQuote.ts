import { PayloadRequest } from 'payload'
import { getDeliveryProvider, type DeliveryProvider } from '../services/deliveryProviders'
import type { LalamoveStop } from '../services/lalamoveClient'
import {
  FIRST_ORDER_FREE_DELIVERY_DISTANCE_METERS,
  getFirstOrderFreeDeliveryPromotion,
} from '../services/firstOrderDeliveryPromotion'

type AnyDoc = {
  id?: number | string
  [key: string]: any
}

/**
 * Resolve an address id from a Payload relationship field. The field may be
 * populated (object) or just the id (number/string), depending on depth.
 */
async function resolveAddressId(payload: PayloadRequest['payload'], field: any): Promise<number | null> {
  if (!field) return null
  if (typeof field === 'object' && field.id != null) return Number(field.id)
  const id = Number(field)
  return Number.isFinite(id) ? id : null
}

/**
 * POST /api/delivery/quote
 *
 * Returns a Lalamove quotation for a delivery (pickup = merchant active address,
 * dropoff = customer active address). Delivery is motorcycle-only.
 * Read-only endpoint — no order is placed, no money is charged.
 *
 * Body (checkout-time, no order yet):
 *   { merchantId: number, customerId: number }
 *
 * Body (order-time):
 *   { orderId: number }   → derives merchant + dropoff from the order
 */
export const deliveryQuoteHandler = async (req: PayloadRequest) => {
  try {
    if (!req.user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const provider = await getDeliveryProvider(req.payload)
    if (provider.name !== 'lalamove') {
      return Response.json({
        data: {
          available: false,
          deliveryFee: 0,
          priorityFee: 0,
          deliveryDiscount: 0,
          freeDeliveryApplied: false,
        },
      })
    }

    const hasJson = typeof (req as any).json === 'function'
    const parsed = (await (hasJson ? (req as any).json() : Promise.resolve((req as any).body))) ?? {}

    const {
      orderId,
      merchantId,
      customerId,
      addressId,
      lat,
      lng,
      address,
    } = parsed as {
      orderId?: number
      merchantId?: number
      customerId?: number
      addressId?: number
      lat?: number
      lng?: number
      address?: string
    }

    let promotionCustomerId: number | null = null
    let merchant: AnyDoc | null = null
    let pickupLat: number | null = null
    let pickupLng: number | null = null
    let pickupAddress = 'Merchant Location'
    let dropoffLat: number | null = null
    let dropoffLng: number | null = null
    let dropoffAddress = 'Delivery Location'

    if (orderId) {
      // ─── Mode A: derive from an existing order ────────────────────────────
      const order = await req.payload.findByID({
        collection: 'orders',
        id: orderId,
        depth: 2,
      })

      if (!order) return Response.json({ error: 'Order not found' }, { status: 404 })
      if (order.fulfillment_type !== 'delivery') {
        return Response.json({ error: 'Order is not a delivery order' }, { status: 422 })
      }
      if (req.user.role === 'customer') {
        const customers = await req.payload.find({
          collection: 'customers',
          where: { user: { equals: req.user.id } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        const orderCustomerId = typeof order.customer === 'object' ? order.customer.id : order.customer
        if (!customers.docs[0] || String(customers.docs[0].id) !== String(orderCustomerId)) {
          return Response.json({ error: 'You may only quote your own order.' }, { status: 403 })
        }
      }

      merchant =
        typeof order.merchant === 'object'
          ? order.merchant
          : await req.payload.findByID({ collection: 'merchants', id: order.merchant as any })

      const deliveryLocations = await req.payload.find({
        collection: 'delivery-locations',
        where: { order: { equals: orderId } },
        limit: 1,
      })

      if (deliveryLocations.docs.length > 0) {
        const coords = deliveryLocations.docs[0].coordinates as { lat?: number; lng?: number } | null
        dropoffLat = Number(coords?.lat ?? null)
        dropoffLng = Number(coords?.lng ?? null)
        dropoffAddress = deliveryLocations.docs[0].formatted_address || dropoffAddress
      } else if (order.customer && typeof order.customer === 'object' && order.customer.activeAddress) {
        const customerActiveAddrId = await resolveAddressId(
          req.payload,
          (order.customer as AnyDoc).activeAddress,
        )
        if (customerActiveAddrId) {
          const addr = await req.payload.findByID({ collection: 'addresses', id: customerActiveAddrId })
          dropoffLat = Number(addr?.latitude ?? null)
          dropoffLng = Number(addr?.longitude ?? null)
          dropoffAddress = addr?.formatted_address || dropoffAddress
        }
      }
    } else {
      // ─── Mode B: checkout-time — resolve from merchant + customer active addresses ──
      if (!merchantId) {
        return Response.json(
          { error: 'Either orderId or merchantId is required' },
          { status: 400 },
        )
      }

      merchant = await req.payload.findByID({
        collection: 'merchants',
        id: merchantId,
        depth: 1,
      })

      if (!merchant) return Response.json({ error: 'Merchant not found' }, { status: 404 })

      let resolvedCustomerId = customerId
      if (req.user.role === 'customer') {
        if (req.user.isActive === false) {
          return Response.json({ error: 'Active customer account required.' }, { status: 403 })
        }
        const customers = await req.payload.find({
          collection: 'customers',
          where: { user: { equals: req.user.id } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        resolvedCustomerId = Number(customers.docs[0]?.id) || undefined
        promotionCustomerId = resolvedCustomerId ? Number(resolvedCustomerId) : null
      }

      // Pickup = merchant.active_address_id → addresses
      const merchantAddrId = await resolveAddressId(req.payload, merchant.activeAddress)
      if (merchantAddrId) {
        const addr = await req.payload.findByID({ collection: 'addresses', id: merchantAddrId })
        pickupLat = Number(addr?.latitude ?? null)
        pickupLng = Number(addr?.longitude ?? null)
        pickupAddress = addr?.formatted_address || merchant.outletName || pickupAddress
      }

      // Dropoff = customer.active_address_id → addresses
      if (addressId && req.user.role === 'customer') {
        const selectedAddress = await req.payload.findByID({
          collection: 'addresses',
          id: addressId,
          depth: 0,
          overrideAccess: true,
        })
        if (!selectedAddress) {
          return Response.json({ error: 'The selected delivery address was not found.' }, { status: 404 })
        }
        const addressOwnerId = typeof selectedAddress.user === 'object'
          ? selectedAddress.user.id
          : selectedAddress.user
        if (String(addressOwnerId) !== String(req.user.id)) {
          return Response.json({ error: 'The selected delivery address does not belong to your account.' }, { status: 403 })
        }
        dropoffLat = Number(selectedAddress.latitude ?? null)
        dropoffLng = Number(selectedAddress.longitude ?? null)
        dropoffAddress = selectedAddress.formatted_address || dropoffAddress
      } else if (resolvedCustomerId) {
        const customer = await req.payload.findByID({
          collection: 'customers',
          id: resolvedCustomerId as number,
          depth: 1,
          overrideAccess: true,
        })

        if (customer) {
          const customerAddrId = await resolveAddressId(req.payload, customer.activeAddress)
          if (customerAddrId) {
            const addr = await req.payload.findByID({ collection: 'addresses', id: customerAddrId })
            dropoffLat = Number(addr?.latitude ?? null)
            dropoffLng = Number(addr?.longitude ?? null)
            dropoffAddress = addr?.formatted_address || dropoffAddress
          }
        }
      }

      // Fallbacks if relationships are missing/unset
      if (!pickupLat || !pickupLng) {
        pickupLat = Number(merchant.merchant_latitude ?? null)
        pickupLng = Number(merchant.merchant_longitude ?? null)
        pickupAddress = merchant.outletName || pickupAddress
      }

      if (!dropoffLat || !dropoffLng) {
        if (req.user.role !== 'customer') {
          dropoffLat = Number(lat ?? null)
          dropoffLng = Number(lng ?? null)
          dropoffAddress = address || dropoffAddress
        }
      }
    }

    if (!merchant) return Response.json({ error: 'Merchant not found' }, { status: 404 })

    if (!pickupLat || !pickupLng) {
      return Response.json(
        { error: 'Merchant has no GPS coordinates configured' },
        { status: 422 },
      )
    }

    if (!dropoffLat || !dropoffLng) {
      return Response.json(
        { error: 'Delivery location has no GPS coordinates' },
        { status: 422 },
      )
    }

    const stops: LalamoveStop[] = [
      {
        coordinates: { lat: String(pickupLat), lng: String(pickupLng) },
        address: String(pickupAddress),
      },
      {
        coordinates: { lat: String(dropoffLat), lng: String(dropoffLng) },
        address: String(dropoffAddress),
      },
    ]

    const effectiveServiceType = provider.getServiceTypeDefault()

    const quotation = await provider.getQuotation(stops, effectiveServiceType, {
      language: 'en_PH',
    })

    const priorityFeeAmount = Number(provider.getPriorityFeeEnv())
    const deliveryFee = Number(quotation.priceBreakdown.total)
    if (!Number.isFinite(deliveryFee) || deliveryFee < 0 || !Number.isFinite(priorityFeeAmount) || priorityFeeAmount < 0) {
      throw new Error('The delivery provider returned an invalid quote.')
    }
    const promotion = promotionCustomerId
      ? await getFirstOrderFreeDeliveryPromotion({
          payload: req.payload,
          customerId: promotionCustomerId,
          distance: quotation.distance,
          deliveryFee,
          priorityFee: priorityFeeAmount,
        })
      : { eligible: false, discount: 0, distanceMeters: null }

    return Response.json({
      data: {
        available: true,
        quotationId: quotation.quotationId,
        serviceType: quotation.serviceType,
        deliveryFee,
        priorityFee: priorityFeeAmount > 0 ? priorityFeeAmount : 0,
        deliveryDiscount: promotion.discount,
        freeDeliveryApplied: promotion.eligible,
        promotionDistanceMeters: promotion.distanceMeters,
        promotionMaxDistanceMeters: FIRST_ORDER_FREE_DELIVERY_DISTANCE_METERS,
        currency: quotation.priceBreakdown.currency,
        distance: quotation.distance,
        expiresAt: quotation.expiresAt,
        stops: quotation.stops,
      },
    })
  } catch (error: any) {
    console.error('[delivery/quote] Error:', error.message || error)
    return Response.json({ error: error.message || 'Failed to get delivery quote' }, { status: 500 })
  }
}

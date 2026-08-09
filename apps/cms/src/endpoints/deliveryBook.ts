import { PayloadRequest } from 'payload'
import {
  getQuotation,
  placeOrder,
  addPriorityFee,
  type LalamoveStop,
  type LalamoveServiceType,
} from '../services/lalamoveClient'

type AnyDoc = {
  id?: number | string
  [key: string]: any
}

async function resolveAddressId(payload: PayloadRequest['payload'], field: any): Promise<number | null> {
  if (!field) return null
  if (typeof field === 'object' && field.id != null) return Number(field.id)
  const id = Number(field)
  return Number.isFinite(id) ? id : null
}

/**
 * POST /api/delivery/book
 *
 * Books a Lalamove delivery for a paid order.
 * Called after payment is confirmed (webhook or checkoutReturn).
 * Gets a fresh quotation (valid 5 min) and immediately places the delivery.
 *
 * Body: { orderId: number }
 *
 * Response: { data: { deliveryBookingId, lalamoveOrderId, shareLink, deliveryFee, status } }
 */
export const deliveryBookHandler = async (req: PayloadRequest) => {
  try {
    // 1. Parse body
    const hasJson = typeof (req as any).json === 'function'
    const parsed = (await (hasJson ? (req as any).json() : Promise.resolve((req as any).body))) ?? {}
    const { orderId } = parsed as { orderId?: number }

    if (!orderId) {
      return Response.json({ error: 'orderId is required' }, { status: 400 })
    }

    // 2. Fetch order
    const order = await req.payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 2,
    })

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.fulfillment_type !== 'delivery') {
      return Response.json({ error: 'Order is not a delivery order' }, { status: 422 })
    }

    // Bail if already booked
    if (order.lalamove_order_id) {
      return Response.json(
        { error: 'Order already has a Lalamove delivery booked' },
        { status: 409 },
      )
    }

    // 3. Get merchant (pickup)
    const merchant =
      typeof order.merchant === 'object'
        ? order.merchant
        : await req.payload.findByID({ collection: 'merchants', id: order.merchant })

    if (!merchant) {
      return Response.json({ error: 'Merchant not found' }, { status: 404 })
    }

    // Pickup = merchant.active_address_id → addresses (fallback: legacy lat/lng)
    const merchantAddrId = await resolveAddressId(req.payload, merchant.activeAddress)
    let merchantLat: number | null = null
    let merchantLng: number | null = null
    let merchantAddress = merchant.outletName || 'Merchant Location'

    if (merchantAddrId) {
      const addr = await req.payload.findByID({ collection: 'addresses', id: merchantAddrId })
      merchantLat = Number(addr?.latitude ?? null)
      merchantLng = Number(addr?.longitude ?? null)
      merchantAddress = addr?.formatted_address || merchantAddress
    }

    if (!merchantLat || !merchantLng) {
      merchantLat = Number(merchant.merchant_latitude ?? null)
      merchantLng = Number(merchant.merchant_longitude ?? null)
      merchantAddress = merchant.outletName || merchantAddress
    }

    if (!merchantLat || !merchantLng) {
      return Response.json(
        { error: 'Merchant has no GPS coordinates configured' },
        { status: 422 },
      )
    }

    // 4. Get delivery location (dropoff)
    const deliveryLocations = await req.payload.find({
      collection: 'delivery-locations',
      where: { order: { equals: orderId } },
      limit: 1,
    })

    const deliveryLocation = deliveryLocations.docs[0]
    let dropoffLat: number | null = null
    let dropoffLng: number | null = null
    let dropoffAddress = 'Delivery Location'

    if (deliveryLocation) {
      const dropoffCoords = deliveryLocation.coordinates as { lat?: number; lng?: number } | null
      dropoffLat = Number(dropoffCoords?.lat ?? null)
      dropoffLng = Number(dropoffCoords?.lng ?? null)
      dropoffAddress = deliveryLocation.formatted_address || dropoffAddress
    }

    // 5. Get customer info
    const customer =
      typeof order.customer === 'object'
        ? order.customer
        : await req.payload.findByID({ collection: 'customers', id: order.customer })

    let senderName = 'Tap2Go Customer'
    let senderPhone = '+639000000000'

    if (customer) {
      if (customer.user && typeof customer.user === 'object') {
        const user = customer.user as any
        senderName = [user.firstName, user.lastName].filter(Boolean).join(' ') || senderName
        senderPhone = user.phone || senderPhone
      }
      if (customer.email) {
        senderName = senderName || customer.email
      }
    }

    // Dropoff fallback = customer.active_address_id → addresses
    if (!dropoffLat || !dropoffLng) {
      const customerAddrId = await resolveAddressId(req.payload, (customer as AnyDoc | null)?.activeAddress)
      if (customerAddrId) {
        const addr = await req.payload.findByID({ collection: 'addresses', id: customerAddrId })
        dropoffLat = Number(addr?.latitude ?? null)
        dropoffLng = Number(addr?.longitude ?? null)
        dropoffAddress = addr?.formatted_address || dropoffAddress
      }
    }

    if (!dropoffLat || !dropoffLng) {
      return Response.json(
        { error: 'Delivery location has no GPS coordinates' },
        { status: 422 },
      )
    }

    // 6. Build Lalamove stops and quotation
    const stops: LalamoveStop[] = [
      {
        coordinates: { lat: String(merchantLat), lng: String(merchantLng) },
        address: String(merchantAddress),
      },
      {
        coordinates: { lat: String(dropoffLat), lng: String(dropoffLng) },
        address: String(dropoffAddress),
      },
    ]

    // Delivery is motorcycle-only: always book the MOTORCYCLE vehicle type so
    // the distance and fee match what was quoted at checkout.
    const serviceType: LalamoveServiceType = 'MOTORCYCLE'

    // Get a fresh quotation (valid for 5 minutes)
    const quotation = await getQuotation(stops, serviceType, {
      language: 'en_PH',
    })

    // 7. Place Lalamove order with that quotation
    const recipientName = deliveryLocation?.contact_name || senderName
    const recipientPhone = deliveryLocation?.contact_phone || senderPhone
    const notesForRider = deliveryLocation?.notes || ''

    const lalamoveOrder = await placeOrder({
      quotation,
      senderName,
      senderPhone,
      recipients: [
        {
          name: recipientName,
          phone: recipientPhone,
          remarks: notesForRider || undefined,
        },
      ],
      isPODEnabled: true,
      metadata: { orderId: String(orderId) },
    })

    // 7b. Always add a priority fee to speed up driver matching. Per Lalamove
    //      docs, priority fees can ONLY be added before the driver accepts, so we
    //      do it immediately after placing the order (status = ASSIGNING_DRIVER).
    const priorityFeeAmount = Number(
      process.env.LALAMOVE_PRIORITY_FEE || '20',
    )
    let priorityFee = 0
    let rawPriorityFee = ''
    if (priorityFeeAmount > 0) {
      try {
        const prioUpdate = await addPriorityFee(
          lalamoveOrder.orderId,
          String(priorityFeeAmount),
        )
        priorityFee = Number(
          prioUpdate?.priceBreakdown?.priorityFee || priorityFeeAmount,
        )
        rawPriorityFee = prioUpdate?.priceBreakdown?.priorityFee || ''
        console.log(
          `[delivery/book] Order ${orderId}: priority fee ₱${priorityFee} added (driver not yet matched)`,
        )
      } catch (prioErr: any) {
        // Priority is a delivery-speed enhancement, not a blocker. Log it clearly
        // but still honour the delivery if Lalamove rejects the tip (e.g. above max).
        console.error(
          `[delivery/book] Priority fee NOT applied for order ${orderId}: ${prioErr?.message}`,
        )
      }
    } else {
      console.warn(`[delivery/book] LALAMOVE_PRIORITY_FEE unset or 0 → priority fee skipped`)
    }

    // 8. Create delivery-bookings record
    const deliveryFee = Number(lalamoveOrder.priceBreakdown.total)
    const lalamoveStatus = lalamoveOrder.status || 'ASSIGNING_DRIVER'

    const booking = await req.payload.create({
      collection: 'delivery-bookings',
      data: {
        order: orderId,
        lalamove_order_id: lalamoveOrder.orderId,
        lalamove_quotation_id: quotation.quotationId,
        share_link: lalamoveOrder.shareLink,
        service_type: lalamoveOrder.stops ? serviceType : serviceType,
        status: mapLalamoveStatus(lalamoveStatus) as any,
        lalamove_raw_status: lalamoveStatus,
        delivery_fee: deliveryFee,
        priority_fee: priorityFee,
        currency: lalamoveOrder.priceBreakdown.currency || 'PHP',
        pickup_address: String(merchantAddress),
        pickup_lat: Number(merchantLat),
        pickup_lng: Number(merchantLng),
        dropoff_address: dropoffAddress,
        dropoff_lat: Number(dropoffLat),
        dropoff_lng: Number(dropoffLng),
        distance_meters: Number(lalamoveOrder.distance?.value || 0),
        scheduled_at: quotation.scheduleAt || undefined,
        expires_at: quotation.expiresAt || undefined,
      },
    })

    // 9. Update order with Lalamove data
    await req.payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        lalamove_order_id: lalamoveOrder.orderId,
        delivery_fee: deliveryFee,
        delivery_service_type: serviceType,
        delivery_status: mapLalamoveStatus(lalamoveStatus) as any,
        delivery_tracking_link: lalamoveOrder.shareLink || undefined,
        // Recalculate total to reflect actual delivery fee + any priority fee
        total:
          order.subtotal +
          deliveryFee +
          (order.platform_fee || 0) +
          priorityFee,
      },
    })

    // 10. Create initial order-tracking entry
    await req.payload.create({
      collection: 'order-tracking',
      data: {
        order: orderId,
        status: 'accepted' as any,
        timestamp: new Date().toISOString(),
        description: `Delivery booked with Lalamove (${serviceType}). Rider matching in progress. Priority fee of ₱${priorityFee} applied to match a rider faster.`,
      },
    })

    return Response.json({
      data: {
        deliveryBookingId: booking.id,
        lalamoveOrderId: lalamoveOrder.orderId,
        shareLink: lalamoveOrder.shareLink,
        deliveryFee,
        priorityFee,
        status: mapLalamoveStatus(lalamoveStatus),
      },
    })
  } catch (error: any) {
    console.error('[delivery/book] Error:', error)
    return Response.json(
      { error: error?.message || 'Failed to book delivery' },
      { status: 500 },
    )
  }
}

function mapLalamoveStatus(raw: string): string {
  const s = raw.toUpperCase()
  if (s === 'ASSIGNING_DRIVER') return 'assigning_driver'
  if (s === 'ON_GOING') return 'driver_assigned'
  if (s === 'PICKED_UP') return 'picked_up'
  if (s === 'COMPLETED') return 'completed'
  if (s === 'CANCELED') return 'canceled'
  if (s === 'REJECTED') return 'rejected'
  if (s === 'EXPIRED') return 'expired'
  return 'pending'
}

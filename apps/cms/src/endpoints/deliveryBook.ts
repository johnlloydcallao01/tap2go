import { PayloadRequest } from 'payload'
import { getDeliveryProvider, mapLalamoveStatus } from '../services/deliveryProviders'
import { LalamoveApiError, type LalamoveStop } from '../services/lalamoveClient'
import { ensureDeliveryFulfillment } from '../services/deliveryFulfillmentOutbox'
import {
  buildLalamoveOrderRemarks,
  getLalamoveItemQuantity,
} from '../services/lalamoveOrderRemarks'
import { submitInitialLalamovePriorityFee } from '../services/initialLalamovePriorityFee'

type FulfillmentCallbacks = {
  requestId: string
  onProviderSubmissionStarted: () => void
  onProviderAccepted: (lalamoveOrderId: string) => Promise<void>
}

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
 * Requests or performs delivery fulfillment for a paid order.
 *
 * Body: { orderId: number }
 *
 * Response: { data: { deliveryBookingId, lalamoveOrderId, shareLink, deliveryFee, status } }
 */
export const deliveryBookHandler = async (
  req: PayloadRequest,
  internalOrderId?: number,
  fulfillment?: FulfillmentCallbacks,
) => {
  try {
    let orderId = internalOrderId
    if (!orderId) {
      if (!req.user) {
        return Response.json({ error: 'Authentication required.' }, { status: 401 })
      }

      const hasJson = typeof (req as any).json === 'function'
      const parsed = (await (hasJson ? (req as any).json() : Promise.resolve((req as any).body))) ?? {}
      const parsedId = Number((parsed as { orderId?: unknown }).orderId)
      orderId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : undefined
    }

    if (!orderId) {
      return Response.json({ error: 'orderId is required' }, { status: 400 })
    }

    // 2. Fetch order
    const order = await req.payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 2,
      overrideAccess: true,
      req,
    })

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!fulfillment && req.user?.role !== 'admin') {
      if (req.user?.role !== 'customer') {
        return Response.json({ error: 'Customer or admin authentication required.' }, { status: 403 })
      }
      const customerDocs = await req.payload.find({
        collection: 'customers',
        where: { user: { equals: req.user.id } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      })
      const customerId = customerDocs.docs[0]?.id
      const orderCustomerId = typeof order.customer === 'object' ? order.customer.id : order.customer
      if (!customerId || String(customerId) !== String(orderCustomerId)) {
        return Response.json({ error: 'You may only request fulfillment for your own order.' }, { status: 403 })
      }
    }

    if (order.fulfillment_type !== 'delivery') {
      return Response.json({ error: 'Order is not a delivery order' }, { status: 422 })
    }

    const paidTransactions = await req.payload.find({
      collection: 'transactions',
      where: {
        and: [
          { order: { equals: orderId } },
          { status: { equals: 'paid' } },
          { transaction_type: { not_equals: 'priority_fee' } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (paidTransactions.docs.length === 0) {
      return Response.json({ error: 'A paid order transaction is required.' }, { status: 409 })
    }

    if (!fulfillment) {
      const outbox = await ensureDeliveryFulfillment(req, orderId)
      return Response.json(
        { data: { fulfillmentId: outbox.id, status: outbox.status } },
        { status: 202 },
      )
    }

    const existingBookings = await req.payload.find({
      collection: 'delivery-bookings',
      where: { order: { equals: orderId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const existingBooking = existingBookings.docs[0]
    if (existingBooking?.lalamove_order_id) {
      return Response.json({
        data: {
          deliveryBookingId: existingBooking.id,
          lalamoveOrderId: existingBooking.lalamove_order_id,
          shareLink: existingBooking.share_link,
          deliveryFee: existingBooking.delivery_fee,
          priorityFee: existingBooking.priority_fee,
          status: existingBooking.status,
        },
      })
    }

    // 3. Get merchant (pickup)
    const merchant =
      typeof order.merchant === 'object'
        ? order.merchant
        : await req.payload.findByID({
            collection: 'merchants',
            id: order.merchant,
            overrideAccess: true,
            req,
          })

    if (!merchant) {
      return Response.json({ error: 'Merchant not found' }, { status: 404 })
    }

    // Pickup = merchant.active_address_id → addresses (fallback: legacy lat/lng)
    const merchantAddrId = await resolveAddressId(req.payload, merchant.activeAddress)
    let merchantLat: number | null = null
    let merchantLng: number | null = null
    let merchantAddress = merchant.outletName || 'Merchant Location'

    if (merchantAddrId) {
      const addr = await req.payload.findByID({
        collection: 'addresses',
        id: merchantAddrId,
        overrideAccess: true,
        req,
      })
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
      overrideAccess: true,
      req,
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
        : await req.payload.findByID({
            collection: 'customers',
            id: order.customer,
            depth: 1,
            overrideAccess: true,
            req,
          })

    // Sender = merchant (pickup)
    let senderName = merchant.outletName || 'Merchant'
    const senderPhone =
      typeof merchant.contactInfo?.phone === 'string' ? merchant.contactInfo.phone.trim() : ''

    // Recipient = customer (dropoff)
    let recipientName = 'Tap2Go Customer'
    let recipientPhone = ''

    if (customer) {
      if (customer.user && typeof customer.user === 'object') {
        const user = customer.user as any
        recipientName = [user.firstName, user.lastName].filter(Boolean).join(' ') || recipientName
        recipientPhone = typeof user.phone === 'string' ? user.phone.trim() : ''
      }
      if (customer.email) {
        recipientName = recipientName || customer.email
      }
    }

    // Override with delivery-location snapshot if available
    const finalRecipientName = deliveryLocation?.contact_name || recipientName
    const finalRecipientPhone =
      typeof deliveryLocation?.contact_phone === 'string' && deliveryLocation.contact_phone.trim()
        ? deliveryLocation.contact_phone.trim()
        : recipientPhone

    if (!senderPhone || !finalRecipientPhone) {
      return Response.json(
        {
          error: !senderPhone
            ? 'Merchant pickup phone number is missing. Add a contact phone before booking delivery.'
            : 'Customer phone number is missing. Add a phone number to the customer profile before booking delivery.',
        },
        { status: 422 },
      )
    }

    // Dropoff fallback = customer.active_address_id → addresses
    if (!dropoffLat || !dropoffLng) {
      const customerAddrId = await resolveAddressId(req.payload, (customer as AnyDoc | null)?.activeAddress)
      if (customerAddrId) {
        const addr = await req.payload.findByID({
          collection: 'addresses',
          id: customerAddrId,
          overrideAccess: true,
          req,
        })
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
    const pickupAddressParts = [
      deliveryLocation?.merchant_street,
      deliveryLocation?.merchant_floor_unit_room,
      deliveryLocation?.merchant_formatted_address || String(merchantAddress),
    ].filter(Boolean).join(', ');

    const dropoffAddressParts = [
      deliveryLocation?.street,
      deliveryLocation?.floor_unit_room,
      String(dropoffAddress),
    ].filter(Boolean).join(', ');

    const stops: LalamoveStop[] = [
      {
        coordinates: { lat: String(merchantLat), lng: String(merchantLng) },
        address: pickupAddressParts,
      },
      {
        coordinates: { lat: String(dropoffLat), lng: String(dropoffLng) },
        address: dropoffAddressParts,
      },
    ]

    const orderItemsResult = await req.payload.find({
      collection: 'order-items',
      where: { order: { equals: orderId } },
      limit: 1000,
      pagination: false,
      depth: 0,
      overrideAccess: true,
      req,
      select: {
        product_name_snapshot: true,
        price_at_purchase: true,
        quantity: true,
        options_snapshot: true,
        total_price: true,
      },
    })
    const orderItems = orderItemsResult.docs as Array<{
      product_name_snapshot?: unknown
      price_at_purchase?: unknown
      quantity?: unknown
      options_snapshot?: unknown
      total_price?: unknown
    }>

    const provider = await getDeliveryProvider(req.payload)
    const serviceType = provider.getServiceTypeDefault()

    const quotation = await provider.getQuotation(stops, serviceType, {
      language: 'en_PH',
      item: {
        quantity: String(getLalamoveItemQuantity(orderItems) || 1),
        weight: 'LESS_THAN_20_KG',
        categories: ['FOOD_AND_BEVERAGES'],
      },
    })

    // 7. Place Lalamove order with that quotation
    const riderInstructions = [
      deliveryLocation?.merchant_delivery_instructions,
      deliveryLocation?.delivery_instructions,
      deliveryLocation?.notes,
    ].filter(Boolean).join(' | ') || ''
    const remarks = buildLalamoveOrderRemarks({
      orderId,
      merchantName: senderName,
      items: orderItems,
      totals: {
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        total: order.total,
      },
      lalamoveQuote: {
        total: quotation.priceBreakdown.total,
        currency: quotation.priceBreakdown.currency,
      },
      instructions: riderInstructions,
    })

    fulfillment.onProviderSubmissionStarted()
    const lalamoveOrder = await provider.placeOrder({
      quotation,
      senderName,
      senderPhone,
      recipients: [
        {
          name: finalRecipientName,
          phone: finalRecipientPhone,
          remarks,
        },
      ],
      isPODEnabled: true,
      metadata: { orderId: String(orderId) },
      requestId: fulfillment.requestId,
    })
    const priorityFeeAmount = Number(provider.getPriorityFeeEnv())
    // Start the fee request as soon as Lalamove returns the order ID. Persist the
    // ID at the same time so a crash cannot leave an accepted booking untraceable.
    const priorityFeePromise = submitInitialLalamovePriorityFee({
      provider,
      orderId: lalamoveOrder.orderId,
      requestedFee: priorityFeeAmount,
      orderStatus: lalamoveOrder.status,
    })
    await fulfillment.onProviderAccepted(lalamoveOrder.orderId)
    const priorityFee = await priorityFeePromise

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

    // The total charged at checkout is immutable; provider repricing is recorded
    // on the booking and must not silently change the paid order total.
    await req.payload.update({
      collection: 'orders',
      id: orderId,
      data: {
        lalamove_order_id: lalamoveOrder.orderId,
        delivery_service_type: serviceType,
        delivery_status: mapLalamoveStatus(lalamoveStatus) as any,
        delivery_tracking_link: lalamoveOrder.shareLink || undefined,
      },
    })

    // 10. Create initial order-tracking entry
    await req.payload.create({
      collection: 'order-tracking',
      data: {
        order: orderId,
        status: 'accepted' as any,
        timestamp: new Date().toISOString(),
        description: priorityFee > 0
          ? `Delivery booked with Lalamove (${serviceType}). Rider matching in progress. Lalamove confirmed a priority fee of ₱${priorityFee}.`
          : `Delivery booked with Lalamove (${serviceType}). Rider matching in progress. No priority fee was confirmed by Lalamove.`,
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
    const status = error instanceof LalamoveApiError
      ? error.status
      : 500
    return Response.json(
      { error: error?.message || 'Failed to book delivery' },
      { status: status >= 400 && status < 600 ? status : 500 },
    )
  }
}

export function deliveryBookForFulfillment(
  req: PayloadRequest,
  orderId: number,
  fulfillment: FulfillmentCallbacks,
) {
  return deliveryBookHandler(req, orderId, fulfillment)
}

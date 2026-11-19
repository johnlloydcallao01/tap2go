import { PayloadRequest } from 'payload'
import { getDeliveryProvider, mapLalamoveStatus, mapToOrderStatus } from '../services/deliveryProviders'
import type { LalamoveDriverDetails } from '../services/lalamoveClient'
import { getDriverLocationTrail, recordDriverLocationSample } from '../services/deliveryLocationHistory'

type AnyDoc = Record<string, any>

function relationId(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'string' || typeof id === 'number' ? String(id) : null
  }
  return null
}

/**
 * GET /api/delivery/track?orderId=123
 *
 * Returns the live tracking state for a Lalamove delivery so the mobile app
 * can render an in-app map without exposing the HMAC Lalamove API to clients.
 *
 * Fetches the order + driver from Lalamove (driver location refreshes every
 * ~10s), persists refreshed coords/status into delivery-bookings, records
 * sampled location history, and returns the trail with the current snapshot.
 */
export const deliveryTrackHandler = async (req: PayloadRequest) => {
  try {
    if (!req.user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    const role = String(req.user.role || '')
    if (!['customer', 'admin', 'service'].includes(role)) {
      return Response.json({ error: 'Not authorized to view delivery tracking' }, { status: 403 })
    }

    const { orderId: rawOrderId } = req.query as { orderId?: string }

    if (typeof rawOrderId !== 'string' || !/^[1-9]\d*$/.test(rawOrderId)) {
      return Response.json({ error: 'A valid orderId is required' }, { status: 400 })
    }

    const orderId = Number(rawOrderId)
    if (!Number.isSafeInteger(orderId)) {
      return Response.json({ error: 'A valid orderId is required' }, { status: 400 })
    }

    // 1. Load the order + booking
    const order = await req.payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 1,
      overrideAccess: true,
      req,
    })

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    if (role === 'customer') {
      const customerRecords = await req.payload.find({
        collection: 'customers',
        where: { user: { equals: req.user.id } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      })
      const customerId = relationId(order.customer)
      if (!customerId || !customerRecords.docs.some((customer) => String(customer.id) === customerId)) {
        return Response.json({ error: 'Not authorized to view delivery tracking' }, { status: 403 })
      }
    }

    if (order.fulfillment_type !== 'delivery') {
      return Response.json({ error: 'Order is not a delivery order' }, { status: 422 })
    }

    const bookings = await req.payload.find({
      collection: 'delivery-bookings',
      where: { order: { equals: orderId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })

    const booking = bookings.docs[0] as AnyDoc | undefined
    const lalamoveOrderId = booking?.lalamove_order_id || order.lalamove_order_id

    if (!lalamoveOrderId) {
      return Response.json({ error: 'No active Lalamove delivery for this order' }, { status: 404 })
    }

    let rawStatus = booking?.lalamove_raw_status || ''
    let driverId = ''
    let liveDriver: LalamoveDriverDetails | null = null

    const provider = await getDeliveryProvider(req.payload)

    // 2. Pull live order state (status + matched driver id)
    try {
      const orderData = (await provider.getOrderDetails(lalamoveOrderId)) as any
      rawStatus = orderData?.status || rawStatus
      driverId = String(
        orderData?.driver?.driverId || orderData?.driverId || '',
      )
    } catch (err: any) {
      console.error('[delivery/track] getOrderDetails failed (using cached order state):', err?.message)
    }

    const mappedStatus = mapLalamoveStatus(rawStatus)

    // 3. Pull live driver location (if we have a driverId)
    if (driverId) {
      try {
        liveDriver = (await provider.getDriverDetails(lalamoveOrderId, driverId)) as LalamoveDriverDetails
      } catch (err: any) {
        console.error('[delivery/track] getDriverDetails failed (using cached driver data):', err?.message)
      }
    }

    // 4. Persist refreshed data back into delivery-bookings (denormalized)
    const liveCoordinates = liveDriver?.coordinates
    const liveLat = Number(liveCoordinates?.lat)
    const liveLng = Number(liveCoordinates?.lng)
    const hasLiveCoordinates =
      liveCoordinates?.lat != null &&
      liveCoordinates?.lng != null &&
      Number.isFinite(liveLat) &&
      Number.isFinite(liveLng) &&
      liveLat >= -90 &&
      liveLat <= 90 &&
      liveLng >= -180 &&
      liveLng <= 180
    const locationObservedAt = hasLiveCoordinates
      ? new Date().toISOString()
      : null

    const bookingUpdateData: Record<string, any> = {
      status: mappedStatus,
      lalamove_raw_status: rawStatus,
    }

    if (liveDriver) {
      if (hasLiveCoordinates) {
        bookingUpdateData.driver_lat = liveLat
        bookingUpdateData.driver_lng = liveLng
        if (liveCoordinates?.updatedAt) {
          bookingUpdateData.driver_location_updated_at = liveCoordinates.updatedAt
        }
      }
      if (liveDriver.name) bookingUpdateData.driver_name = liveDriver.name
      if (liveDriver.phone) bookingUpdateData.driver_phone = liveDriver.phone
      if (liveDriver.plateNumber) bookingUpdateData.driver_plate_number = liveDriver.plateNumber
      if (liveDriver.photo) bookingUpdateData.driver_photo_url = liveDriver.photo
    }

    if (hasLiveCoordinates && driverId && locationObservedAt) {
      await recordDriverLocationSample(
        req.payload,
        {
          orderId,
          driverId,
          latitude: liveLat,
          longitude: liveLng,
          providerUpdatedAt: liveCoordinates?.updatedAt || null,
          observedAt: locationObservedAt,
        },
        req,
      )
    }

    if (booking) {
      await req.payload.update({
        collection: 'delivery-bookings',
        id: booking.id,
        data: bookingUpdateData,
        overrideAccess: true,
        req,
      })
    }

    // 5. Keep order.delivery_status in sync, and infer overall order status.
    //    Only write delivery_status values that exist in the orders enum,
    //    and only when it has actually changed (this endpoint is polled ~10s).
    const VALID_ORDER_DELIVERY_STATUSES = [
      'none',
      'pending',
      'assigning_driver',
      'driver_assigned',
      'picked_up',
      'completed',
      'canceled',
      'expired',
    ]

    const orderStatusUpdate: Record<string, any> = {}

    if (
      VALID_ORDER_DELIVERY_STATUSES.includes(mappedStatus) &&
      order.delivery_status !== mappedStatus
    ) {
      orderStatusUpdate.delivery_status = mappedStatus
    }

    const mappedOrderStatus = mapToOrderStatus(mappedStatus)
    if (mappedOrderStatus && order.status !== mappedOrderStatus) {
      orderStatusUpdate.status = mappedOrderStatus
    }

    if (Object.keys(orderStatusUpdate).length > 0) {
      await req.payload.update({
        collection: 'orders',
        id: order.id,
        data: orderStatusUpdate,
        overrideAccess: true,
        req,
      })
    }

    const trail = await getDriverLocationTrail(
      req.payload,
      orderId,
      driverId || null,
      req,
    )

    // 6. Build the tracking payload (live driver data, cached booking as fallback)
    const driver = {
      driverId: driverId || null,
      name: liveDriver?.name || booking?.driver_name || null,
      phone: liveDriver?.phone || booking?.driver_phone || null,
      plateNumber: liveDriver?.plateNumber || booking?.driver_plate_number || null,
      photoUrl: liveDriver?.photo || booking?.driver_photo_url || null,
      lat:
        hasLiveCoordinates
          ? liveLat
          : (booking?.driver_lat ?? null),
      lng:
        hasLiveCoordinates
          ? liveLng
          : (booking?.driver_lng ?? null),
      locationUpdatedAt:
        hasLiveCoordinates
          ? liveCoordinates?.updatedAt || null
          : booking?.driver_location_updated_at || null,
      locationObservedAt,
      locationIsLive: hasLiveCoordinates,
    }

    return Response.json({
      data: {
        orderId: order.id,
        deliveryStatus: mappedStatus,
        lalamoveRawStatus: rawStatus,
        driver,
        pickup: {
          lat: Number(booking?.pickup_lat ?? null) || null,
          lng: Number(booking?.pickup_lng ?? null) || null,
          address: booking?.pickup_address || null,
        },
        dropoff: {
          lat: Number(booking?.dropoff_lat ?? null) || null,
          lng: Number(booking?.dropoff_lng ?? null) || null,
          address: booking?.dropoff_address || null,
        },
        distanceMeters: Number(booking?.distance_meters || 0) || null,
        priorityFee: Number(booking?.priority_fee || 0) || 0,
        shareLink: booking?.share_link || null,
        trail,
      },
    })
  } catch (error: any) {
    console.error('[delivery/track] Error:', error)
    return Response.json(
      { error: error?.message || 'Failed to load tracking data' },
      { status: 500 },
    )
  }
}
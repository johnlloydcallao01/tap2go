import { PayloadRequest } from 'payload'
import { googleMapsService, type LocationCoordinates } from '../services/GoogleMapsService'

type AnyDoc = Record<string, any>

function readCoordinates(latitude: unknown, longitude: unknown): LocationCoordinates | null {
  if (latitude == null || longitude == null) return null

  const lat = Number(latitude)
  const lng = Number(longitude)
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null
  }

  return { latitude: lat, longitude: lng }
}

/**
 * GET /api/delivery/route?orderId=123
 *
 * Returns a Google Routes API TWO_WHEELER route between the order's pickup and
 * delivery points. The mobile app requests this once per tracking-screen visit,
 * separately from its live-location polling endpoint.
 */
export const deliveryRouteHandler = async (req: PayloadRequest) => {
  try {
    if (!req.user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!['customer', 'admin', 'service'].includes(String(req.user.role))) {
      return Response.json({ error: 'Customer or staff authentication required' }, { status: 403 })
    }

    const { orderId: rawOrderId } = req.query as { orderId?: string }
    const orderId = Number(rawOrderId)
    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      return Response.json({ error: 'A valid orderId is required' }, { status: 400 })
    }

    const order = await req.payload.findByID({
      collection: 'orders',
      id: orderId,
      depth: 0,
      overrideAccess: true,
      req,
    }) as AnyDoc | null

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    if (req.user.role === 'customer') {
      const customerDocs = await req.payload.find({
        collection: 'customers',
        where: { user: { equals: req.user.id } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      })
      const customerId = customerDocs.docs[0]?.id
      const orderCustomerId =
        typeof order.customer === 'object' && order.customer !== null
          ? order.customer.id
          : order.customer

      if (!customerId || String(customerId) !== String(orderCustomerId)) {
        return Response.json({ error: 'You may only request a route for your own order' }, { status: 403 })
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
    if (!booking) {
      return Response.json({ error: 'Delivery route is not available for this order' }, { status: 404 })
    }

    const origin = readCoordinates(booking.pickup_lat, booking.pickup_lng)
    const destination = readCoordinates(booking.dropoff_lat, booking.dropoff_lng)
    if (!origin || !destination) {
      return Response.json({ error: 'Pickup or delivery coordinates are unavailable' }, { status: 422 })
    }

    let route
    try {
      route = await googleMapsService.calculateTwoWheelerRoute(origin, destination)
    } catch (error) {
      console.error(
        '[delivery/route] Google two-wheeler route calculation failed:',
        error instanceof Error ? error.message : 'Unknown error',
      )
      return Response.json({ error: 'Google could not calculate a motorcycle route' }, { status: 502 })
    }

    return Response.json({
      data: {
        travelMode: 'TWO_WHEELER',
        coordinates: route.coordinates,
        distanceMeters: route.distanceMeters,
        durationSeconds: route.durationSeconds,
      },
    })
  } catch (error) {
    console.error(
      '[delivery/route] Error:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return Response.json({ error: 'Failed to load delivery route' }, { status: 500 })
  }
}
import { PayloadRequest } from 'payload'
import crypto from 'crypto'
import { mapLalamoveStatus, mapToOrderStatus, mapToOrderTrackingStatus } from '../services/deliveryProviders'

/**
 * POST /api/lalamove/webhook
 *
 * Receives webhook events from Lalamove for delivery status changes.
 *
 * Event types handled:
 * - ORDER_STATUS_CHANGED  → updates delivery_bookings + order status
 * - DRIVER_ASSIGNED       → updates rider details on delivery_booking
 * - ORDER_REPLACED        → updates lalamove_order_id if CS replaced the order
 * - POD_STATUS_CHANGED    → creates order-tracking entry
 */
export const lalamoveWebhookHandler = async (req: PayloadRequest) => {
  try {
    const secret = process.env.LALAMOVE_WEBHOOK_SECRET
    if (!secret) {
      console.error('[lalamove/webhook] LALAMOVE_WEBHOOK_SECRET is not configured')
      return Response.json({ error: 'Webhook authentication is unavailable' }, { status: 503 })
    }
    const requestUrl = new URL((req as unknown as Request).url)
    const suppliedSecret =
      req.headers.get('x-lalamove-webhook-secret')
      || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
      || requestUrl.searchParams.get('token')
      || ''
    const expected = Buffer.from(secret)
    const supplied = Buffer.from(suppliedSecret)
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
      return Response.json({ error: 'Invalid webhook authentication' }, { status: 401 })
    }

    // 1. Parse body
    const rawBody = await (req as unknown as Request).text()
    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const eventType = body.eventType || body.event || body.type || ''
    const payload = body.data || body.payload || body

    console.log(`[lalamove/webhook] Received event: ${eventType}`)

    // 2. Find the delivery booking by Lalamove order ID
    const lalamoveOrderId =
      payload.orderId || payload.lalamove_order_id || payload.id || ''

    if (!lalamoveOrderId) {
      console.warn('[lalamove/webhook] No orderId in payload.')
      return Response.json({ error: 'Order ID is missing' }, { status: 400 })
    }

    const bookings = await req.payload.find({
      collection: 'delivery-bookings',
      where: { lalamove_order_id: { equals: String(lalamoveOrderId) } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
      req,
    })

    if (bookings.docs.length === 0) {
      const outboxes = await req.payload.find({
        collection: 'delivery-fulfillment-outbox',
        where: { lalamove_order_id: { equals: String(lalamoveOrderId) } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
        req,
      })
      if (outboxes.docs[0]) {
        await req.payload.update({
          collection: 'delivery-fulfillment-outbox',
          id: outboxes.docs[0].id,
          data: {
            status: 'reconciliation_required',
            manual_intervention_required: false,
            reconciliation_note: `Lalamove event ${eventType} arrived before the local booking record.`,
          },
          overrideAccess: true,
          req,
        })
        return Response.json({ status: 'reconciliation scheduled' }, { status: 202 })
      }
      console.error(`[lalamove/webhook] No local record for Lalamove order ${lalamoveOrderId}`)
      return Response.json({ error: 'Local delivery record not found' }, { status: 503 })
    }

    const booking = bookings.docs[0]
    const orderId =
      typeof booking.order === 'object' ? booking.order.id : booking.order

    // 3. Handle each event type
    switch (eventType) {
      case 'ORDER_STATUS_CHANGED': {
        const newStatus = payload.status || payload.newStatus || ''
        const mappedStatus = mapLalamoveStatus(newStatus)
        const statusRank: Record<string, number> = {
          pending: 0,
          assigning_driver: 1,
          rejected: 1,
          driver_assigned: 2,
          picked_up: 3,
          completed: 4,
          canceled: 4,
          expired: 4,
        }
        const currentStatus = String(booking.status || 'pending')
        const terminal = ['completed', 'canceled', 'expired'].includes(currentStatus)
        if (
          (terminal && mappedStatus !== currentStatus)
          || (statusRank[mappedStatus] ?? 0) < (statusRank[currentStatus] ?? 0)
        ) {
          console.info(
            `[lalamove/webhook] Ignoring out-of-order status ${newStatus} for order ${orderId}; current status is ${currentStatus}.`,
          )
          return Response.json({ status: 'received', ignored: 'stale status' })
        }

        // Update delivery booking
        await req.payload.update({
          collection: 'delivery-bookings',
          id: booking.id,
          data: {
            status: mappedStatus as any,
            lalamove_raw_status: newStatus,
            last_reconciled_at: new Date().toISOString(),
            last_reconciliation_error: null,
          },
          overrideAccess: true,
          req,
        })

        // Update order denormalized fields
        const orderStatusUpdate: Record<string, any> = {}

        // Only write delivery_status values that exist in the orders enum
        // ('rejected' exists on delivery-bookings but NOT on orders).
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
        if (VALID_ORDER_DELIVERY_STATUSES.includes(mappedStatus)) {
          orderStatusUpdate.delivery_status = mappedStatus as any
        }

        // Map Lalam status to our order status (canceled/expired → cancelled)
        const mappedOrderStatus = mapToOrderStatus(mappedStatus)
        if (mappedOrderStatus) {
          orderStatusUpdate.status = mappedOrderStatus
        }

        await req.payload.update({
          collection: 'orders',
          id: orderId,
          data: orderStatusUpdate,
          overrideAccess: true,
          req,
        })

        // Create order-tracking entry
        await req.payload.create({
          collection: 'order-tracking',
          data: {
            order: orderId,
            status: mapToOrderTrackingStatus(mappedStatus) as any,
            timestamp: new Date().toISOString(),
            description: `Lalamove status: ${newStatus}`,
          },
          overrideAccess: true,
          req,
        })

        console.log(`[lalamove/webhook] Order ${orderId}: status → ${mappedStatus} (raw: ${newStatus})`)
        break
      }

      case 'ORDER_AMOUNT_CHANGED': {
        const priorityFee = Number(
          payload.priorityFee ??
            payload.priceBreakdown?.priorityFee ??
            0,
        )
        const bookingUpdate: Record<string, any> = {}
        if (Number.isFinite(priorityFee) && priorityFee > 0) {
          bookingUpdate.priority_fee = priorityFee
        }
        if (Object.keys(bookingUpdate).length > 0) {
          await req.payload.update({
            collection: 'delivery-bookings',
            id: booking.id,
            data: bookingUpdate as any,
            overrideAccess: true,
            req,
          })
        }
        console.log(
          `[lalamove/webhook] Order ${orderId}: amount changed — priority fee = ₱${priorityFee}`,
        )
        break
      }

      case 'DRIVER_ASSIGNED': {
        const driver = payload.driver || payload.driverDetails || {}

        await req.payload.update({
          collection: 'delivery-bookings',
          id: booking.id,
          data: {
            status: 'driver_assigned' as any,
            lalamove_raw_status: 'DRIVER_ASSIGNED',
            last_reconciled_at: new Date().toISOString(),
            last_reconciliation_error: null,
            driver_name: driver.name || driver.driverName || undefined,
            driver_phone: driver.phone || driver.driverPhone || undefined,
            driver_plate_number: driver.plateNumber || driver.plate_number || undefined,
            driver_photo_url: driver.photo || driver.photoUrl || undefined,
            driver_lat: driver.coordinates?.lat ? Number(driver.coordinates.lat) : undefined,
            driver_lng: driver.coordinates?.lng ? Number(driver.coordinates.lng) : undefined,
            driver_location_updated_at: driver.coordinates?.updatedAt || undefined,
          },
          overrideAccess: true,
          req,
        })

        // Keep orders.delivery_status in sync so the order-level status reflects driver assignment
        await req.payload.update({
          collection: 'orders',
          id: orderId,
          data: { delivery_status: 'driver_assigned' as any },
          overrideAccess: true,
          req,
        })

        console.log(`[lalamove/webhook] Order ${orderId}: driver assigned — ${driver.name || 'unknown'}`)
        break
      }

      case 'ORDER_REPLACED': {
        const newLalamoveOrderId = payload.newOrderId || payload.replacedOrderId || ''
        const newShareLink = payload.shareLink || ''

        if (newLalamoveOrderId) {
          await req.payload.update({
            collection: 'delivery-bookings',
            id: booking.id,
            data: {
              lalamove_order_id: String(newLalamoveOrderId),
              status: 'assigning_driver',
              lalamove_raw_status: 'ASSIGNING_DRIVER',
              last_reconciled_at: new Date().toISOString(),
              last_reconciliation_error: null,
              ...(newShareLink ? { share_link: newShareLink } : {}),
            },
            overrideAccess: true,
            req,
          })

          await req.payload.update({
            collection: 'orders',
            id: orderId,
            data: {
              lalamove_order_id: String(newLalamoveOrderId),
              ...(newShareLink ? { delivery_tracking_link: newShareLink } : {}),
            },
            overrideAccess: true,
            req,
          })

          await req.payload.update({
            collection: 'delivery-fulfillment-outbox',
            where: { order: { equals: orderId } },
            data: {
              lalamove_order_id: String(newLalamoveOrderId),
              status: 'booked',
              manual_intervention_required: false,
              reconciliation_note: null,
            },
            overrideAccess: true,
            req,
          })

          console.log(`[lalamove/webhook] Order ${orderId}: replaced with new Lalamove order ${newLalamoveOrderId}`)
        }
        break
      }

      case 'POD_STATUS_CHANGED': {
        const podStatus = payload.status || ''
        const description = payload.description || `Proof of delivery: ${podStatus}`

        await req.payload.create({
          collection: 'order-tracking',
          data: {
            order: orderId,
            status: 'on_delivery' as any,
            timestamp: new Date().toISOString(),
            description,
          },
          overrideAccess: true,
          req,
        })

        console.log(`[lalamove/webhook] Order ${orderId}: POD status — ${podStatus}`)
        break
      }

      default:
        console.log(`[lalamove/webhook] Order ${orderId}: unhandled event type: ${eventType}`)
        break
    }

    return Response.json({ status: 'received' })
  } catch (error: any) {
    console.error('[lalamove/webhook] Error:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { bustOrderItemsCache, bustOrdersCache } from '@/utils/dashboardCache'
import { getDeliveryProvider, mapLalamoveStatus, mapToOrderStatus } from '@/services/deliveryProviders'
import { cancelDeliveryOrder, DeliveryCancellationError } from '@/services/deliveryCancellation'
import {
  buildVendorOrderData,
  findVendorOrder,
  isVendorCustomer,
  parseVendorOrderId,
  resolveVendorOrderScope,
  sanitizeVendorOrderDoc,
  VendorOrderError,
} from '../_lib'

export const dynamic = 'force-dynamic'

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() || null : null
}

function num(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

const RAW_LALAMOVE_STATUSES = new Set([
  'PENDING',
  'ASSIGNING_DRIVER',
  'DRIVER_ASSIGNED',
  'ON_GOING',
  'PICKED_UP',
  'COMPLETED',
  'CANCELED',
  'REJECTED',
  'EXPIRED',
])

const DELIVERY_STATUS_RANK: Record<string, number> = {
  pending: 0,
  assigning_driver: 1,
  rejected: 1,
  driver_assigned: 2,
  picked_up: 3,
  completed: 4,
  canceled: 4,
  expired: 4,
}

async function refreshVendorLalamoveStatus(
  payload: Awaited<ReturnType<typeof getPayload>>,
  order: Record<string, any>,
  booking: Record<string, any> | undefined,
): Promise<{
  order: Record<string, any>
  booking: Record<string, any> | undefined
  source: 'stored' | 'lalamove'
  warning: string | undefined
}> {
  const lalamoveOrderId = booking?.lalamove_order_id || order.lalamove_order_id
  if (!lalamoveOrderId) {
    return { order, booking, source: 'stored' as const, warning: undefined }
  }

  try {
    const provider = await getDeliveryProvider(payload)
    if (provider.name !== 'lalamove') {
      return { order, booking, source: 'stored' as const, warning: undefined }
    }

    const result = await provider.getOrderDetails(String(lalamoveOrderId))
    const rawStatus = typeof result?.status === 'string' ? result.status.trim() : ''
    const normalizedRawStatus = rawStatus.toUpperCase()
    if (!RAW_LALAMOVE_STATUSES.has(normalizedRawStatus)) {
      throw new Error(`Lalamove returned an unsupported status: ${rawStatus || 'empty'}`)
    }

    const status = mapLalamoveStatus(normalizedRawStatus)
    const currentStatus = String(booking?.status || order.delivery_status || 'pending').toLowerCase()
    const isTerminal = ['completed', 'canceled', 'expired'].includes(currentStatus)
    if (
      (isTerminal && status !== currentStatus)
      || (DELIVERY_STATUS_RANK[status] ?? 0) < (DELIVERY_STATUS_RANK[currentStatus] ?? 0)
    ) {
      return {
        order,
        booking,
        source: 'stored' as const,
        warning: 'Lalamove returned an older status; showing the latest saved status.',
      }
    }

    const bookingNeedsUpdate = booking && (
      booking.status !== status
      || booking.lalamove_raw_status !== rawStatus
    )
    const liveBooking = booking
      ? {
          ...booking,
          status,
          lalamove_raw_status: rawStatus,
          ...(bookingNeedsUpdate ? {
            last_reconciled_at: new Date().toISOString(),
            last_reconciliation_error: null,
          } : {}),
        }
      : undefined
    const orderUpdate: Record<string, unknown> = {}
    if (
      status !== 'rejected'
      && order.delivery_status !== status
    ) {
      orderUpdate.delivery_status = status
    }
    const mappedOrderStatus = mapToOrderStatus(status)
    if (mappedOrderStatus && order.status !== mappedOrderStatus) {
      orderUpdate.status = mappedOrderStatus
    }

    try {
      if (bookingNeedsUpdate && booking && liveBooking) {
        await payload.update({
          collection: 'delivery-bookings',
          id: booking.id,
          data: {
            status,
            lalamove_raw_status: rawStatus,
            last_reconciled_at: liveBooking.last_reconciled_at,
            last_reconciliation_error: null,
          } as any,
          overrideAccess: true,
        })
      }
      if (Object.keys(orderUpdate).length > 0) {
        await payload.update({
          collection: 'orders',
          id: order.id,
          data: orderUpdate as any,
          overrideAccess: true,
        })
      }
    } catch (error) {
      console.error('[vendor/orders/[id]] live Lalamove status could not be persisted:', error)
      return {
        order: { ...order, lalamove_order_id: lalamoveOrderId, ...orderUpdate },
        booking: liveBooking,
        source: 'lalamove' as const,
        warning: 'Showing the live Lalamove status, but it could not be saved.',
      }
    }

    return {
      order: { ...order, lalamove_order_id: lalamoveOrderId, ...orderUpdate },
      booking: liveBooking,
      source: 'lalamove' as const,
      warning: undefined,
    }
  } catch (error) {
    console.warn('[vendor/orders/[id]] live Lalamove status refresh failed; showing saved status:', error)
    return {
      order,
      booking,
      source: 'stored' as const,
      warning: 'Unable to refresh from Lalamove; showing the latest saved status.',
    }
  }
}

async function buildVendorOrderDetail(
  payload: Awaited<ReturnType<typeof getPayload>>,
  order: Record<string, any>,
  refreshStatus = false,
) {
  const orderId = Number(order.id)
  const [itemsRes, bookingRes, locationRes, transactionsRes, trackingRes, discountsRes] = await Promise.all([
    payload.find({
      collection: 'order-items',
      where: { order: { equals: orderId } },
      depth: 0,
      limit: 500,
      pagination: false,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'delivery-bookings',
      where: { order: { equals: orderId } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'delivery-locations',
      where: { order: { equals: orderId } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'transactions',
      where: { order: { equals: orderId } },
      depth: 0,
      limit: 50,
      pagination: false,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'order-tracking',
      where: { order: { equals: orderId } },
      sort: '-timestamp',
      limit: 20,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'order-discounts',
      where: { order: { equals: orderId } },
      depth: 0,
      limit: 50,
      pagination: false,
      overrideAccess: true,
    }),
  ])

  const items = (itemsRes.docs as Record<string, any>[]).map((item) => ({
    id: item.id,
    product_name_snapshot: str(item.product_name_snapshot, 'Item'),
    price_at_purchase: num(item.price_at_purchase),
    quantity: num(item.quantity),
    total_price: num(item.total_price),
    options_snapshot: item.options_snapshot ?? null,
  }))
  let bookingRaw: Record<string, any> | undefined = (bookingRes.docs as Record<string, any>[])[0]
  let statusSource: 'stored' | 'lalamove' = 'stored'
  let statusWarning: string | undefined
  let effectiveOrder = order
  if (refreshStatus) {
    const refresh = await refreshVendorLalamoveStatus(payload, order, bookingRaw)
    effectiveOrder = refresh.order
    bookingRaw = refresh.booking
    statusSource = refresh.source
    statusWarning = refresh.warning
  }
  const booking = bookingRaw
    ? {
        service_type: str(bookingRaw.service_type, 'MOTORCYCLE'),
        status: str(bookingRaw.status, 'pending'),
        raw_status: optionalString(bookingRaw.lalamove_raw_status),
        lalamove_order_id: optionalString(bookingRaw.lalamove_order_id),
        share_link: optionalString(bookingRaw.share_link),
        driver_name: optionalString(bookingRaw.driver_name),
        driver_phone: optionalString(bookingRaw.driver_phone),
        pickup_address: optionalString(bookingRaw.pickup_address),
        dropoff_address: optionalString(bookingRaw.dropoff_address),
        delivery_fee: bookingRaw.delivery_fee == null ? null : num(bookingRaw.delivery_fee),
      }
    : null
  const locationRaw = (locationRes.docs as Record<string, any>[])[0]
  const location = locationRaw
    ? {
        formatted_address: str(locationRaw.formatted_address),
        street: optionalString(locationRaw.street),
        floor_unit_room: optionalString(locationRaw.floor_unit_room),
        delivery_instructions: optionalString(locationRaw.delivery_instructions),
        contact_name: optionalString(locationRaw.contact_name),
        contact_phone: optionalString(locationRaw.contact_phone),
        label: optionalString(locationRaw.label),
      }
    : null
  const transactions = (transactionsRes.docs as Record<string, any>[]).map((transaction) => ({
    id: transaction.id,
    payment_method: optionalString(transaction.payment_method),
    amount: num(transaction.amount),
    currency: str(transaction.currency, 'PHP'),
    status: str(transaction.status, 'pending'),
    paid_at: transaction.paid_at ? String(transaction.paid_at) : null,
    createdAt: String(transaction.createdAt ?? ''),
  }))
  const trackingHistory = (trackingRes.docs as Record<string, any>[]).map((entry) => ({
    id: entry.id,
    status: str(entry.status),
    timestamp: entry.timestamp ? String(entry.timestamp) : String(entry.createdAt ?? ''),
    description: optionalString(entry.description),
  }))
  const discounts = (discountsRes.docs as Record<string, any>[]).map((discount) => ({
    id: discount.id,
    code: optionalString(discount.code),
    amount_off: num(discount.amount_off),
    funded_by: optionalString(discount.funded_by),
  }))

  const base = sanitizeVendorOrderDoc({
    ...effectiveOrder,
    ...(bookingRaw ? {
      delivery_status: bookingRaw.status,
      delivery_service_type: bookingRaw.service_type,
      lalamove_order_id: bookingRaw.lalamove_order_id || effectiveOrder.lalamove_order_id,
      delivery_tracking_link: bookingRaw.share_link || effectiveOrder.delivery_tracking_link,
    } : {}),
  })
  const customer = base.customer as Record<string, unknown> | null
  const customerUser =
    order.customer && typeof order.customer === 'object' && order.customer.user && typeof order.customer.user === 'object'
      ? order.customer.user as Record<string, unknown>
      : null

  return {
    ...base,
    customer: customer ? { ...customer, phone: optionalString(customerUser?.phone) } : null,
    items,
    booking,
    deliveryStatusSource: statusSource,
    deliveryStatusWarning: statusWarning ?? null,
    location,
    payment: {
      isPaid: transactions.some((transaction) => transaction.status.toLowerCase() === 'paid'),
      transactions,
    },
    trackingHistory,
    discounts,
  }
}

function errorResponse(error: unknown) {
  if (error instanceof VendorOrderError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  return null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const [{ id }, payload] = await Promise.all([params, getPayload({ config: configPromise })])
    const { merchantIds } = await resolveVendorOrderScope(payload, request)
    const orderId = parseVendorOrderId(id)
    const order = await findVendorOrder(payload, orderId, merchantIds)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const refreshStatus = new URL(request.url).searchParams.get('refresh') === 'true'
    return NextResponse.json({ doc: await buildVendorOrderDetail(payload, order, refreshStatus) })
  } catch (error) {
    const response = errorResponse(error)
    if (response) return response
    console.error('[vendor/orders/[id]] GET error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load order' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const [{ id }, payload] = await Promise.all([params, getPayload({ config: configPromise })])
    const { authUser, merchantIds } = await resolveVendorOrderScope(payload, request)
    const orderId = parseVendorOrderId(id)
    const current = await findVendorOrder(payload, orderId, merchantIds)
    if (!current) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    let input: unknown
    try {
      input = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { data, description } = buildVendorOrderData(input, current)
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update. Provide order fields to change.' }, { status: 400 })
    }
    if (data.merchant !== undefined && !merchantIds.includes(Number(data.merchant))) {
      return NextResponse.json({ error: 'Forbidden: outlet does not belong to vendor' }, { status: 403 })
    }
    if (current.status === 'cancelled' && data.status !== undefined && data.status !== 'cancelled') {
      return NextResponse.json({ error: 'Cancelled orders cannot be reopened.' }, { status: 409 })
    }
    if (current.status === 'delivered' && data.status === 'cancelled') {
      return NextResponse.json({ error: 'Delivered orders cannot be cancelled.' }, { status: 409 })
    }
    let deliveryBooking: Record<string, any> | undefined
    let requiresProviderCancellation = false
    if (
      current.fulfillment_type === 'delivery'
      && data.fulfillment_type !== 'pickup'
      && data.status !== undefined
      && data.status !== current.status
    ) {
      const isAcceptanceToggle =
        (current.status === 'pending' && data.status === 'accepted')
        || (current.status === 'accepted' && data.status === 'pending')
      const isCancellation = data.status === 'cancelled'
      if (!isAcceptanceToggle && !isCancellation) {
        return NextResponse.json(
          { error: 'Only Pending and Accepted can be toggled manually, or an eligible order can be cancelled; Lalamove manages delivery progress.' },
          { status: 409 },
        )
      }

      const bookingRes = await payload.find({
        collection: 'delivery-bookings',
        where: { order: { equals: orderId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      deliveryBooking = bookingRes.docs[0] as Record<string, any> | undefined
      const deliveryStatus = String(
        deliveryBooking?.status
          || current.delivery_status
          || 'none',
      ).toLowerCase()
      const allowedStatuses = isCancellation
        ? ['none', 'pending', 'assigning_driver']
        : ['none', 'pending']
      if (!allowedStatuses.includes(deliveryStatus)) {
        return NextResponse.json(
          { error: isCancellation
            ? 'This Lalamove delivery is too far along to be cancelled here.'
            : 'This delivery has progressed in Lalamove, so its status can no longer be changed manually.' },
          { status: 409 },
        )
      }
      requiresProviderCancellation = isCancellation
        && Boolean(deliveryBooking || current.lalamove_order_id)
    }
    if (
      current.fulfillment_type === 'delivery'
      && data.fulfillment_type !== undefined
      && data.fulfillment_type !== 'delivery'
    ) {
      const bookingRes = await payload.find({
        collection: 'delivery-bookings',
        where: { order: { equals: orderId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (bookingRes.docs.length > 0) {
        return NextResponse.json(
          { error: 'Fulfillment cannot be changed after a delivery booking exists.' },
          { status: 409 },
        )
      }
    }
    if (data.customer !== undefined && !(await isVendorCustomer(payload, Number(data.customer), merchantIds))) {
      return NextResponse.json({ error: 'Forbidden: customer has no order at this vendor’s outlets' }, { status: 403 })
    }

    if (requiresProviderCancellation) {
      await cancelDeliveryOrder(payload, current, orderId, { overrideAccess: true })
    }

    const updateData: Record<string, unknown> = { ...data }
    if (requiresProviderCancellation) {
      const subtotal = num(updateData.subtotal, num(current.subtotal))
      const platformFee = num(updateData.platform_fee, num(current.platform_fee))
      const priorityFee = num(updateData.priority_fee, num(current.priority_fee))
      const discountTotal = num(updateData.discount_total, num(current.discount_total))
      updateData.delivery_fee = 0
      updateData.total = Math.max(
        0,
        Math.round((subtotal + platformFee + priorityFee - discountTotal) * 100) / 100,
      )
    }

    const updated = (await payload.update({
      collection: 'orders',
      id: orderId,
      data: updateData as any,
      depth: 2,
      overrideAccess: true,
    })) as Record<string, any>

    let warning: string | undefined
    if (data.status !== undefined && data.status !== current.status && !requiresProviderCancellation) {
      try {
        await payload.create({
          collection: 'order-tracking',
          data: {
            order: updated.id,
            status: data.status,
            timestamp: new Date().toISOString(),
            actor: authUser.id,
            description: description || `Vendor changed status to ${String(data.status)}`,
          } as any,
          overrideAccess: true,
        })
      } catch (error) {
        console.error('[vendor/orders/[id]] status tracking creation failed:', error)
        warning = 'Order updated, but its status history could not be saved.'
      }
    }

    await bustOrdersCache()
    await bustOrderItemsCache()
    const doc = await buildVendorOrderDetail(payload, updated)
    return NextResponse.json({ success: true, message: 'Order updated successfully', doc, warning })
  } catch (error: any) {
    const response = errorResponse(error)
    if (response) return response
    if (error instanceof DeliveryCancellationError) {
      return NextResponse.json({ error: error.message, ...(error.code ? { code: error.code } : {}) }, { status: error.status })
    }
    console.error('[vendor/orders/[id]] PATCH error:', error)
    const status = error?.status === 409 ? 409 : 400
    return NextResponse.json({ error: error?.message || 'Failed to update order' }, { status })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const [{ id }, payload] = await Promise.all([params, getPayload({ config: configPromise })])
    const { merchantIds } = await resolveVendorOrderScope(payload, request)
    const orderId = parseVendorOrderId(id)
    const order = await findVendorOrder(payload, orderId, merchantIds)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    try {
      await payload.delete({
        collection: 'orders',
        id: orderId,
        overrideAccess: true,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete order'
      if (message.includes('paid or refunded transaction')) {
        return NextResponse.json({ error: message }, { status: 409 })
      }
      throw error
    }

    await bustOrdersCache()
    await bustOrderItemsCache()
    return NextResponse.json({ success: true, message: 'Order deleted successfully', id: orderId })
  } catch (error: any) {
    const response = errorResponse(error)
    if (response) return response
    console.error('[vendor/orders/[id]] DELETE error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to delete order' }, { status: error?.status || 500 })
  }
}

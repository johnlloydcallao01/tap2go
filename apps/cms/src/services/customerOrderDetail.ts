import type { Payload } from 'payload'
import { buildOrderPaymentSummary } from './orderPaymentRecovery'

export async function buildCustomerOrderDetail(
  payload: Payload,
  userId: number,
  orderId: number,
) {
  const { docs } = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { id: { equals: orderId } },
        { 'customer.user': { equals: userId } },
      ],
    },
    limit: 1,
    pagination: false,
    depth: 2,
    overrideAccess: true,
    context: { skipStoreHours: true },
    select: {
      id: true,
      status: true,
      fulfillment_type: true,
      total: true,
      subtotal: true,
      delivery_fee: true,
      platform_fee: true,
      placed_at: true,
      notes: true,
      customer: true,
      merchant: true,
    },
  })
  const order = docs[0] as Record<string, any> | undefined
  if (!order) return null

  const [itemsResult, bookingsResult, locationsResult, transactionsResult] = await Promise.all([
    payload.find({
      collection: 'order-items',
      where: { order: { equals: orderId } },
      depth: 1,
      limit: 500,
      pagination: false,
      overrideAccess: true,
      select: {
        id: true,
        product: true,
        product_name_snapshot: true,
        price_at_purchase: true,
        quantity: true,
        total_price: true,
      },
    }),
    payload.find({
      collection: 'delivery-bookings',
      where: { order: { equals: orderId } },
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      select: {
        id: true,
        lalamove_order_id: true,
        share_link: true,
        status: true,
        lalamove_raw_status: true,
        delivery_fee: true,
        priority_fee: true,
        distance_meters: true,
        driver_name: true,
        driver_phone: true,
        driver_plate_number: true,
        driver_photo_url: true,
        driver_lat: true,
        driver_lng: true,
        driver_location_updated_at: true,
      },
    }),
    payload.find({
      collection: 'delivery-locations',
      where: { order: { equals: orderId } },
      depth: 0,
      limit: 1,
      pagination: false,
      overrideAccess: true,
      select: {
        id: true,
        formatted_address: true,
        street: true,
        floor_unit_room: true,
        delivery_instructions: true,
        notes: true,
        contact_name: true,
        contact_phone: true,
        label: true,
        merchant_formatted_address: true,
        merchant_street: true,
        merchant_floor_unit_room: true,
        merchant_delivery_instructions: true,
      },
    }),
    payload.find({
      collection: 'transactions',
      where: { order: { equals: orderId } },
      sort: '-id',
      depth: 0,
      limit: 500,
      pagination: false,
      overrideAccess: true,
      select: {
        order: true,
        status: true,
        payment_method: true,
      },
    }),
  ])

  const merchant = order.merchant && typeof order.merchant === 'object' ? order.merchant : null
  const vendor = merchant?.vendor && typeof merchant.vendor === 'object' ? merchant.vendor : null
  const booking = bookingsResult.docs[0] as Record<string, any> | undefined
  const location = locationsResult.docs[0] as Record<string, any> | undefined
  const items = (itemsResult.docs as Array<Record<string, any>>).map((item) => {
    const product = item.product && typeof item.product === 'object' ? item.product : null
    return {
      id: item.id,
      name: item.product_name_snapshot || product?.name || product?.productName || 'Item',
      quantity: item.quantity || 1,
      price: item.price_at_purchase || 0,
      total: item.total_price || 0,
      image:
        product?.media?.primaryImage?.cloudinaryURL ||
        product?.media?.primaryImage?.url ||
        product?.image?.cloudinaryURL ||
        product?.image?.url ||
        null,
    }
  })
  const paymentSummary = buildOrderPaymentSummary(
    order.status,
    transactionsResult.docs as Array<Record<string, unknown>>,
  )

  return {
    id: order.id,
    orderNumber: `#${String(order.id).padStart(5, '0')}`,
    status: order.status || 'pending',
    fulfillmentType: order.fulfillment_type,
    total: order.total || 0,
    subtotal: order.subtotal || 0,
    deliveryFee: order.delivery_fee || 0,
    platformFee: order.platform_fee || 0,
    placedAt: order.placed_at || null,
    notes: order.notes || null,
    ...paymentSummary,
    merchant: merchant
      ? {
          id: merchant.id,
          name: merchant.outletName || merchant.name || vendor?.businessName || 'Restaurant',
          phone: merchant.contactInfo?.phone || null,
          logo: vendor?.logo?.cloudinaryURL || vendor?.logo?.url || null,
        }
      : null,
    customer:
      order.customer && typeof order.customer === 'object'
        ? {
            id: order.customer.id,
            email: order.customer.email || null,
            user:
              order.customer.user && typeof order.customer.user === 'object'
                ? {
                    id: order.customer.user.id,
                    firstName: order.customer.user.firstName || null,
                    lastName: order.customer.user.lastName || null,
                    phone: order.customer.user.phone || null,
                    email: order.customer.user.email || null,
                  }
                : null,
          }
        : null,
    items,
    delivery: booking
      ? {
          id: booking.id,
          lalamoveOrderId: booking.lalamove_order_id || null,
          shareLink: booking.share_link || null,
          status: booking.status || null,
          rawStatus: booking.lalamove_raw_status || null,
          deliveryFee: booking.delivery_fee || 0,
          priorityFee: booking.priority_fee || 0,
          distanceMeters: booking.distance_meters || null,
          driver: {
            name: booking.driver_name || null,
            phone: booking.driver_phone || null,
            plateNumber: booking.driver_plate_number || null,
            photoUrl: booking.driver_photo_url || null,
            lat: booking.driver_lat || null,
            lng: booking.driver_lng || null,
            locationUpdatedAt: booking.driver_location_updated_at || null,
          },
        }
      : null,
    deliveryLocation: location
      ? {
          id: location.id,
          formattedAddress: location.formatted_address || null,
          street: location.street || null,
          floorUnitRoom: location.floor_unit_room || null,
          deliveryInstructions: location.delivery_instructions || null,
          notes: location.notes || null,
          contactName: location.contact_name || null,
          contactPhone: location.contact_phone || null,
          label: location.label || null,
          merchantFormattedAddress: location.merchant_formatted_address || null,
          merchantStreet: location.merchant_street || null,
          merchantFloorUnitRoom: location.merchant_floor_unit_room || null,
          merchantDeliveryInstructions: location.merchant_delivery_instructions || null,
        }
      : null,
  }
}

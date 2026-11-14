import type { Payload } from 'payload'
import { buildOrderPaymentSummary } from './orderPaymentRecovery'
import {
  buildLalamoveOrderRemarks,
  LalamoveOrderDetailsError,
  LalamoveRemarksLimitError,
} from './lalamoveOrderRemarks'

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
      priority_fee: true,
      discount_total: true,
      free_delivery_applied: true,
      placed_at: true,
      notes: true,
      customer: true,
      merchant: true,
    },
  })
  const order = docs[0] as Record<string, any> | undefined
  if (!order) return null

  const merchantId = order.merchant && typeof order.merchant === 'object'
    ? order.merchant.id
    : order.merchant
  const [merchantResult, itemsResult, bookingsResult, locationsResult, transactionsResult] = await Promise.all([
    merchantId
      ? payload.find({
          collection: 'merchants',
          where: { id: { equals: merchantId } },
          depth: 2,
          limit: 1,
          pagination: false,
          overrideAccess: true,
          context: { skipStoreHours: true },
          select: {
            id: true,
            outletName: true,
            vendor: true,
            contactInfo: true,
          },
        })
      : Promise.resolve({ docs: [] }),
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
        options_snapshot: true,
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
        rider_remarks: true,
        share_link: true,
        status: true,
        lalamove_raw_status: true,
        delivery_fee: true,
        priority_fee: true,
        currency: true,
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
        transaction_type: true,
        priority_fee_fulfillment_status: true,
      },
    }),
  ])

  const merchant = merchantResult.docs[0] as Record<string, any> | undefined
  const vendor = merchant?.vendor && typeof merchant.vendor === 'object' ? merchant.vendor : null
  const booking = bookingsResult.docs[0] as Record<string, any> | undefined
  const location = locationsResult.docs[0] as Record<string, any> | undefined
  let riderRemarks: string | null = null
  let riderRemarksPreview: string | null = null
  if (booking?.lalamove_order_id) {
    if (typeof booking.rider_remarks === 'string') {
      riderRemarks = booking.rider_remarks
    } else {
      try {
        riderRemarks = buildLalamoveOrderRemarks({
          orderId,
          merchantName: merchant?.outletName || 'Merchant',
          items: itemsResult.docs as Array<Record<string, any>>,
          totals: {
            subtotal: order.subtotal,
            deliveryFee: order.delivery_fee,
            total: order.total,
          },
          lalamoveQuote: {
            total: booking.delivery_fee,
            currency: booking.currency || 'PHP',
          },
          instructions: [
            location?.merchant_delivery_instructions,
            location?.delivery_instructions,
            location?.notes,
          ].filter(Boolean).join(' | ') || '',
        })
      } catch (error) {
        if (!(error instanceof LalamoveRemarksLimitError || error instanceof LalamoveOrderDetailsError)) {
          throw error
        }
        console.warn(
          `[customer-order-detail] Could not reconstruct uncaptured Lalamove remarks for order ${orderId}: ${error.message}`,
        )
      }
    }
  } else if (
    order.fulfillment_type === 'delivery' &&
    !['cancelled', 'canceled'].includes(String(order.status || '').toLowerCase())
  ) {
    try {
      riderRemarksPreview = buildLalamoveOrderRemarks({
        orderId,
        merchantName: merchant?.outletName || 'Merchant',
        items: itemsResult.docs as Array<Record<string, any>>,
        totals: {
          subtotal: order.subtotal,
          deliveryFee: order.delivery_fee,
          total: order.total,
        },
        lalamoveQuote: {
          total: order.delivery_fee,
          currency: booking?.currency || 'PHP',
        },
        instructions: [
          location?.merchant_delivery_instructions,
          location?.delivery_instructions,
          location?.notes,
        ].filter(Boolean).join(' | ') || '',
      })
    } catch (error) {
      if (!(error instanceof LalamoveRemarksLimitError || error instanceof LalamoveOrderDetailsError)) {
        throw error
      }
      console.warn(
        `[customer-order-detail] Could not build Lalamove remarks preview for order ${orderId}: ${error.message}`,
      )
    }
  }
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
  const priorityFeePaymentPending = (transactionsResult.docs as Array<Record<string, unknown>>)
    .some((transaction) =>
      transaction.transaction_type === 'priority_fee' &&
      (
        transaction.status === 'pending' ||
        ['pending', 'applying'].includes(String(transaction.priority_fee_fulfillment_status || ''))
      ),
    )
  const priorityFeePaymentFailed = (transactionsResult.docs as Array<Record<string, unknown>>)
    .some((transaction) =>
      transaction.transaction_type === 'priority_fee' &&
      transaction.status === 'paid' &&
      transaction.priority_fee_fulfillment_status === 'failed',
    )
  const priorityFeePaymentRefunded = (transactionsResult.docs as Array<Record<string, unknown>>)
    .some((transaction) =>
      transaction.transaction_type === 'priority_fee' &&
      transaction.status === 'refunded' &&
      transaction.priority_fee_fulfillment_status === 'failed',
    )

  return {
    id: order.id,
    orderNumber: `#${String(order.id).padStart(5, '0')}`,
    status: order.status || 'pending',
    fulfillmentType: order.fulfillment_type,
    total: order.total || 0,
    subtotal: order.subtotal || 0,
    deliveryFee: order.delivery_fee || 0,
    priorityFee: order.priority_fee || 0,
    platformFee: order.platform_fee || 0,
    discountTotal: order.discount_total || 0,
    freeDeliveryApplied: order.free_delivery_applied === true,
    placedAt: order.placed_at || null,
    notes: order.notes || null,
    ...paymentSummary,
    priorityFeePaymentPending,
    priorityFeePaymentFailed,
    priorityFeePaymentRefunded,
    riderRemarksPreview,
    merchant: merchant
      ? {
          id: merchant.id,
          name: merchant.outletName || merchant.name || vendor?.businessName || 'Restaurant',
          phone: merchant.contactInfo?.phone || null,
          logo: vendor?.logo?.cloudinaryURL || vendor?.logo?.url || vendor?.logo?.thumbnailURL || null,
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
          riderRemarks,
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

import type { Payload } from 'payload'
import { buildOrderPaymentSummary } from './orderPaymentRecovery'

type Relation = number | string | { id?: number | string } | null | undefined
type RecordValue = Record<string, unknown>

type CustomerOrder = {
  id: number
  status?: string | null
  fulfillment_type?: string | null
  total?: number | null
  placed_at?: string | null
  merchant?: Relation
}

type OrderMerchant = {
  id: number
  outletName?: string | null
  vendor?: Relation & {
    businessName?: string | null
    logo?: Relation & {
      cloudinaryURL?: string | null
      url?: string | null
    }
  }
}

type OrderItem = {
  id: number
  order: Relation
  product_name_snapshot?: string | null
  quantity?: number | null
}

type DeliveryBooking = {
  order: Relation
  status?: string | null
  priority_fee?: number | null
}

type Transaction = {
  order: Relation
  status?: string | null
  payment_method?: string | null
}

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null
}

function relationId(value: Relation): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (isRecord(value) && (typeof value.id === 'number' || typeof value.id === 'string')) {
    return value.id
  }
  return null
}

function groupByOrder<T extends { order: Relation }>(docs: T[]): Map<number, T[]> {
  const grouped = new Map<number, T[]>()
  for (const doc of docs) {
    const orderId = relationId(doc.order)
    if (orderId === null) continue
    const key = Number(orderId)
    const group = grouped.get(key) ?? []
    group.push(doc)
    grouped.set(key, group)
  }
  return grouped
}

export async function buildCustomerOrdersOverview(payload: Payload, userId: number) {
  const { docs: orderDocs } = await payload.find({
    collection: 'orders',
    where: { 'customer.user': { equals: userId } },
    sort: '-placed_at',
    depth: 0,
    limit: 100,
    pagination: false,
    overrideAccess: true,
    select: {
      id: true,
      status: true,
      fulfillment_type: true,
      total: true,
      placed_at: true,
      merchant: true,
    },
  })

  const orders = orderDocs as unknown as CustomerOrder[]
  if (orders.length === 0) return { docs: [] }

  const orderIds = orders.map((order) => order.id)
  const merchantIds = Array.from(
    new Set(
      orders
        .map((order) => relationId(order.merchant))
        .filter((id): id is number | string => id !== null),
    ),
  )
  const [merchantResult, itemResult, bookingResult, transactionResult] = await Promise.all([
    merchantIds.length
      ? payload.find({
          collection: 'merchants',
          where: { id: { in: merchantIds } },
          depth: 2,
          limit: merchantIds.length,
          pagination: false,
          overrideAccess: true,
          context: { skipStoreHours: true },
          select: {
            id: true,
            outletName: true,
            vendor: true,
          },
        })
      : Promise.resolve({ docs: [] }),
    payload.find({
      collection: 'order-items',
      where: { order: { in: orderIds } },
      depth: 0,
      limit: 500,
      pagination: false,
      overrideAccess: true,
      select: {
        id: true,
        order: true,
        product_name_snapshot: true,
        quantity: true,
      },
    }),
    payload.find({
      collection: 'delivery-bookings',
      where: { order: { in: orderIds } },
      depth: 0,
      limit: 200,
      pagination: false,
      overrideAccess: true,
      select: {
        order: true,
        status: true,
        priority_fee: true,
      },
    }),
    payload.find({
      collection: 'transactions',
      where: { order: { in: orderIds } },
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

  const merchantsById = new Map(
    (merchantResult.docs as unknown as OrderMerchant[]).map((merchant) => [
      String(merchant.id),
      merchant,
    ]),
  )
  const itemsByOrder = groupByOrder(itemResult.docs as unknown as OrderItem[])
  const bookingsByOrder = new Map(
    (bookingResult.docs as unknown as DeliveryBooking[]).flatMap((booking) => {
      const orderId = relationId(booking.order)
      return orderId === null ? [] : [[Number(orderId), booking] as const]
    }),
  )
  const transactionsByOrder = groupByOrder(
    transactionResult.docs as unknown as Transaction[],
  )

  return {
    docs: orders.map((order) => {
      const merchantId = relationId(order.merchant)
      const merchant = merchantId === null ? null : merchantsById.get(String(merchantId)) ?? null
      const vendor = merchant && isRecord(merchant.vendor) ? merchant.vendor : null
      const logo = vendor && isRecord(vendor.logo) ? vendor.logo : null
      const booking = bookingsByOrder.get(order.id)

      return {
        id: order.id,
        orderNumber: `#${String(order.id).padStart(5, '0')}`,
        status: order.status || 'pending',
        fulfillmentType: order.fulfillment_type,
        total: order.total || 0,
        placedAt: order.placed_at || null,
        ...buildOrderPaymentSummary(
          order.status,
          (transactionsByOrder.get(order.id) ?? []) as never[],
        ),
        merchant: merchant
          ? {
              id: merchant.id,
              name:
                (typeof merchant.outletName === 'string' && merchant.outletName) ||
                (typeof vendor?.businessName === 'string' && vendor.businessName) ||
                'Restaurant',
              logo:
                (typeof logo?.cloudinaryURL === 'string' && logo.cloudinaryURL) ||
                (typeof logo?.url === 'string' && logo.url) ||
                null,
            }
          : null,
        items: (itemsByOrder.get(order.id) ?? []).map((item) => ({
          id: item.id,
          name: item.product_name_snapshot || 'Item',
          quantity: item.quantity || 1,
        })),
        delivery: booking
          ? {
              status: booking.status || null,
              priorityFee: booking.priority_fee || 0,
            }
          : null,
      }
    }),
  }
}

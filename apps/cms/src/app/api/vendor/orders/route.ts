/**
 * @file apps/cms/src/app/api/vendor/orders/route.ts
 * @description Vendor-scoped BFF for web-merchant /orders (All Orders).
 *
 * Divergence from admin (cms/.../admin/orders): orders carry a direct `merchant` FK (merchants),
 * so scope = `order.merchant ∈ merchants where vendor = this vendor`. All filtering, joins,
 * pagination and sanitization happen server-side (docs/BFF-pattern.md). Revenue follows the same
 * rule as analytics/admin: only verified `transactions` with status paid whose order belongs to the
 * vendor's merchants. Writes are scoped to those same merchants and use Payload so collection
 * hooks, notifications, and deletion safeguards remain active.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { bustOrderItemsCache, bustOrdersCache } from '@/utils/dashboardCache'
import {
  buildVendorOrderData,
  DELIVERY_STATUS_SET,
  FULFILLMENT_SET,
  isVendorCustomer,
  ORDER_STATUS_SET,
  resolveVendorOrderScope,
  sanitizeVendorOrderDoc,
  VendorOrderError,
} from './_lib'

export const dynamic = 'force-dynamic'

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}
function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}
function parseCsv(value: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

const ALLOWED_SORT = new Set([
  '-placed_at', 'placed_at', '-total', 'total', '-createdAt', 'createdAt',
  'status', '-status', 'fulfillment_type', '-fulfillment_type', 'delivery_status', '-delivery_status',
])

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { merchantIds } = await resolveVendorOrderScope(payload, request)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 10))
    const search = (searchParams.get('search') || '').trim()
    const sort = searchParams.get('sort') || '-placed_at'
    const safeSort = ALLOWED_SORT.has(sort) ? sort : '-placed_at'
    const statusCsv = parseCsv(searchParams.get('status'))
    const fulfillmentCsv = parseCsv(searchParams.get('fulfillment_type'))
    const deliveryStatusCsv = parseCsv(searchParams.get('delivery_status'))
    const hasDiscount = (searchParams.get('has_discount') || '').trim().toLowerCase()

    // 1. Resolve vendor + owned merchants.
    if (merchantIds.length === 0) {
      return NextResponse.json({ docs: [], pagination: { page, limit, totalDocs: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false }, stats: null })
    }

    // 2. Build where: scope to vendor merchants + filters.
    const where: Record<string, any> = { merchant: { in: merchantIds } }
    const and: any[] = []

    if (search) {
      const isNumeric = /^\d+$/.test(search)
      if (isNumeric) {
        const numericId = Number(search)
        and.push({ or: [{ id: { equals: numericId } }, { lalamove_order_id: { contains: search } }, { notes: { contains: search } }] })
      } else {
        and.push({ or: [{ lalamove_order_id: { contains: search } }, { notes: { contains: search } }, { coupon_code: { contains: search } }] })
      }
    }
    if (statusCsv.length) {
      const filtered = statusCsv.filter((v) => ORDER_STATUS_SET.has(v))
      if (filtered.length) where.status = { in: filtered }
    }
    if (hasDiscount === 'true') where.discount_total = { greater_than: 0 }
    else if (hasDiscount === 'false') where.discount_total = { equals: 0 }
    if (fulfillmentCsv.length) {
      const filtered = fulfillmentCsv.filter((v) => FULFILLMENT_SET.has(v))
      if (filtered.length) where.fulfillment_type = { in: filtered }
    }
    if (deliveryStatusCsv.length) {
      const filtered = deliveryStatusCsv.filter((v) => DELIVERY_STATUS_SET.has(v))
      if (filtered.length) {
        const matchingBookings = await payload.find({
          collection: 'delivery-bookings',
          where: { status: { in: filtered } } as any,
          limit: 5000,
          depth: 0,
          overrideAccess: true,
          pagination: false,
        } as any)
        const matchingOrderIds = (matchingBookings.docs as Record<string, any>[])
          .map((booking) => Number(typeof booking.order === 'object' ? booking.order.id : booking.order))
          .filter(Number.isFinite)
        where.id = matchingOrderIds.length > 0 ? { in: matchingOrderIds } : { equals: -1 }
      }
    }

    const finalWhere = and.length ? { and: [...and, where] } : where

    // 3. Fetch paginated orders + all scoped orders (for breakdowns) + all scoped order ids.
    const [paginated, statsAll] = await Promise.all([
      payload.find({
        collection: 'orders',
        where: finalWhere as any,
        page,
        limit,
        sort: safeSort as any,
        depth: 2,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'orders',
        where: { merchant: { in: merchantIds } } as any,
        limit: 5000,
        depth: 0,
        overrideAccess: true,
        pagination: false,
      } as any),
    ])

    const statsDocs = ((statsAll as any).docs as Record<string, any>[]) ?? []
    const totalAll = typeof (statsAll as any).totalDocs === 'number' ? (statsAll as any).totalDocs : statsDocs.length
    const scopedOrderIds = statsDocs.map((o) => Number(o.id)).filter((v) => Number.isFinite(v))
    const [bookingsRes, txnRes] = scopedOrderIds.length > 0
      ? await Promise.all([
          payload.find({
            collection: 'delivery-bookings',
            where: { order: { in: scopedOrderIds } } as any,
            limit: 5000,
            depth: 0,
            overrideAccess: true,
            pagination: false,
          } as any),
          payload.find({
            collection: 'transactions',
            where: { status: { equals: 'paid' }, order: { in: scopedOrderIds } } as any,
            limit: 5000,
            depth: 0,
            overrideAccess: true,
            pagination: false,
          } as any),
        ])
      : [{ docs: [] }, { docs: [] }]

    const bookingsByOrder = new Map<number, Record<string, any>>()
    for (const booking of bookingsRes.docs as Record<string, any>[]) {
      const orderValue = typeof booking.order === 'object' ? booking.order.id : booking.order
      bookingsByOrder.set(Number(orderValue), booking)
    }

    const paidOrderIds = new Set<number>()
    let totalRevenue = 0
    for (const transaction of txnRes.docs as Record<string, any>[]) {
      const orderValue = typeof transaction.order === 'object' ? transaction.order.id : transaction.order
      const orderId = Number(orderValue)
      if (Number.isFinite(orderId)) paidOrderIds.add(orderId)
      totalRevenue += num(transaction.amount, 0)
    }

    const docs = (paginated.docs as unknown as Record<string, any>[]).map((doc) => {
      const booking = bookingsByOrder.get(Number(doc.id))
      return sanitizeVendorOrderDoc(doc, {
        ...(booking ? {
          deliveryStatus: str(booking.status, 'pending'),
          lalamoveOrderId: typeof booking.lalamove_order_id === 'string'
            ? booking.lalamove_order_id
            : typeof doc.lalamove_order_id === 'string' ? doc.lalamove_order_id : null,
          serviceType: str(booking.service_type, str(doc.delivery_service_type, 'MOTORCYCLE')),
          trackingLink: typeof booking.share_link === 'string'
            ? booking.share_link
            : typeof doc.delivery_tracking_link === 'string' ? doc.delivery_tracking_link : null,
        } : {}),
        isPaid: paidOrderIds.has(Number(doc.id)),
      })
    })

    const statusBreakdown: Record<string, number> = {}
    for (const s of ORDER_STATUS_SET) statusBreakdown[s] = 0
    const fulfillmentBreakdown: Record<string, number> = {}
    for (const f of FULFILLMENT_SET) fulfillmentBreakdown[f] = 0
    const deliveryStatusBreakdown: Record<string, number> = {}
    for (const d of DELIVERY_STATUS_SET) deliveryStatusBreakdown[d] = 0

    for (const o of statsDocs) {
      const st = String(o.status || 'pending')
      if (statusBreakdown[st] !== undefined) statusBreakdown[st]++
      else statusBreakdown[st] = (statusBreakdown[st] || 0) + 1
      const ft = String(o.fulfillment_type || 'delivery')
      if (fulfillmentBreakdown[ft] !== undefined) fulfillmentBreakdown[ft]++
      else fulfillmentBreakdown[ft] = (fulfillmentBreakdown[ft] || 0) + 1
      const booking = bookingsByOrder.get(Number(o.id))
      const ds = String(booking?.status || o.delivery_status || 'none')
      if (deliveryStatusBreakdown[ds] !== undefined) deliveryStatusBreakdown[ds]++
      else deliveryStatusBreakdown[ds] = (deliveryStatusBreakdown[ds] || 0) + 1
    }

    // 4. Revenue: verified (paid) transactions whose order belongs to the vendor's merchants.
    const avgOrderValue = totalAll > 0 ? totalRevenue / totalAll : 0
    const filteredTotal = typeof paginated.totalDocs === 'number' ? paginated.totalDocs : docs.length

    return NextResponse.json({
      docs,
      pagination: {
        page: paginated.page,
        limit: paginated.limit,
        totalDocs: paginated.totalDocs,
        totalPages: paginated.totalPages,
        hasNextPage: paginated.hasNextPage,
        hasPrevPage: paginated.hasPrevPage,
      },
      stats: {
        totalAll,
        filteredTotal,
        statusBreakdown,
        fulfillmentBreakdown,
        deliveryStatusBreakdown,
        totalRevenue,
        avgOrderValue,
      },
      meta: { generatedAt: new Date().toISOString(), sort: safeSort, search },
    })
  } catch (err: any) {
    if (err instanceof VendorOrderError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[vendor/orders] GET error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to load orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { merchantIds } = await resolveVendorOrderScope(payload, request)
    let input: unknown
    try {
      input = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { data } = buildVendorOrderData(input)
    if (data.fulfillment_type === 'delivery' && data.status !== 'pending') {
      throw new VendorOrderError('New delivery orders must start as pending; Lalamove controls delivery progress.')
    }
    const merchantId = Number(data.merchant)
    const customerId = Number(data.customer)
    if (!merchantIds.includes(merchantId)) {
      return NextResponse.json({ error: 'Forbidden: outlet does not belong to vendor' }, { status: 403 })
    }
    if (!(await isVendorCustomer(payload, customerId, merchantIds))) {
      return NextResponse.json({ error: 'Forbidden: customer has no order at this vendor’s outlets' }, { status: 403 })
    }

    const created = await payload.create({
      collection: 'orders',
      data: data as any,
      depth: 2,
      overrideAccess: true,
    })
    await bustOrdersCache()
    await bustOrderItemsCache()
    return NextResponse.json(
      { success: true, message: 'Order created successfully', doc: sanitizeVendorOrderDoc(created as Record<string, any>) },
      { status: 201 },
    )
  } catch (err: any) {
    if (err instanceof VendorOrderError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[vendor/orders] POST error:', err)
    const status = err?.status === 409 ? 409 : 400
    return NextResponse.json({ error: err?.message || 'Failed to create order' }, { status })
  }
}
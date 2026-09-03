/**
 * @file apps/cms/src/app/api/admin/orders/[id]/route.ts
 * @description BFF for single order (detail + status update) - admin-only safe boundary.
 * GET  /api/admin/orders/[id] -> sanitized order + aggregates
 * PATCH /api/admin/orders/[id] -> whitelist status/notes/delivery_status + auto audit trail
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { authenticateAdmin } from '@/utils/mediaLibrary'

function optionalString(v: unknown): string | null {
  return typeof v === 'string' ? v.trim() || null : null
}
function str(v: unknown, fb = ''): string {
  return typeof v === 'string' ? v : fb
}
function num(v: unknown, fb = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : fb
  }
  return fb
}
function sanitizeMediaRef(value: unknown): { id: number; url: string | null; filename: string | null } | null {
  if (!value || typeof value !== 'object') return null
  const src = value as Record<string, unknown>
  const id = Number(src.id)
  if (Number.isNaN(id)) return null
  const url =
    typeof src.cloudinaryURL === 'string' ? src.cloudinaryURL : typeof src.url === 'string' ? src.url : null
  return { id, url, filename: typeof src.filename === 'string' ? src.filename : null }
}
function sanitizeMerchantBrief(value: unknown): Record<string, any> | null {
  if (value == null) return null
  if (typeof value !== 'object') {
    const id = Number(value)
    if (Number.isNaN(id)) return null
    return { id, outletName: `Outlet #${id}`, outletCode: '', isActive: null, vendor: null }
  }
  const m = value as Record<string, any>
  const id = Number(m.id)
  if (Number.isNaN(id)) return null
  const rawVendor = m.vendor
  let vendor: Record<string, any> | null = null
  if (rawVendor && typeof rawVendor === 'object') {
    const v = rawVendor as Record<string, any>
    const vid = Number(v.id)
    if (!Number.isNaN(vid)) {
      vendor = { id: vid, businessName: str(v.businessName, ''), logo: sanitizeMediaRef(v.logo) }
    }
  } else if (rawVendor != null) {
    const vid = Number(rawVendor)
    if (!Number.isNaN(vid)) vendor = { id: vid, businessName: '', logo: null }
  }
  return {
    id,
    outletName: str(m.outletName, `Outlet #${id}`),
    outletCode: str(m.outletCode, ''),
    isActive: typeof m.isActive === 'boolean' ? m.isActive : null,
    vendor,
  }
}
function sanitizeCustomerBrief(value: unknown): Record<string, any> | null {
  if (value == null) return null
  if (typeof value !== 'object') {
    const id = Number(value)
    if (Number.isNaN(id)) return null
    return { id, email: '', user: null }
  }
  const c = value as Record<string, any>
  const id = Number(c.id)
  if (Number.isNaN(id)) return null
  const rawUser = c.user
  let user: Record<string, any> | null = null
  if (rawUser && typeof rawUser === 'object') {
    const u = rawUser as Record<string, any>
    const uid = Number(u.id)
    if (!Number.isNaN(uid)) {
      user = {
        id: uid,
        email: str(u.email, str(c.email, '')),
        firstName: str(u.firstName, ''),
        lastName: str(u.lastName, ''),
        phone: optionalString(u.phone),
      }
    }
  } else if (rawUser != null) {
    const uid = Number(rawUser)
    if (!Number.isNaN(uid)) user = { id: uid, email: str(c.email, ''), firstName: '', lastName: '', phone: null }
  }
  return { id, email: str(c.email, user ? str((user as any).email, '') : ''), user }
}
function sanitizeOrderDoc(raw: Record<string, any>): Record<string, any> {
  const id = raw.id
  const orderNumber = `#${String(id).padStart(5, '0')}`
  return {
    id,
    orderNumber,
    status: str(raw.status, 'pending'),
    fulfillment_type: str(raw.fulfillment_type, 'delivery'),
    total: num(raw.total, 0),
    subtotal: num(raw.subtotal, 0),
    delivery_fee: num(raw.delivery_fee, 0),
    platform_fee: num(raw.platform_fee, 0),
    priority_fee: num(raw.priority_fee, 0),
    discount_total: num(raw.discount_total, 0),
    coupon_code: optionalString(raw.coupon_code),
    free_delivery_applied: !!raw.free_delivery_applied,
    placed_at: raw.placed_at ? String(raw.placed_at) : null,
    notes: optionalString(raw.notes),
    lalamove: {
      orderId: optionalString(raw.lalamove_order_id),
      serviceType: optionalString(raw.delivery_service_type) || 'MOTORCYCLE',
      status: str(raw.delivery_status, 'none'),
      trackingLink: optionalString(raw.delivery_tracking_link),
    },
    merchant: sanitizeMerchantBrief(raw.merchant),
    customer: sanitizeCustomerBrief(raw.customer),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  }
}

const STATUS_SET = new Set([
  'pending',
  'accepted',
  'preparing',
  'ready_for_pickup',
  'on_delivery',
  'delivered',
  'cancelled',
])
const DELIVERY_STATUS_SET = new Set([
  'none',
  'pending',
  'assigning_driver',
  'driver_assigned',
  'picked_up',
  'completed',
  'canceled',
  'expired',
])

async function fetchAggregates(payload: any, orderId: number | string) {
  const [itemsRes, bookingRes, locationRes, transactionsRes, trackingRes, discountsRes, reviewsRes] =
    await Promise.all([
      payload.find({
        collection: 'order-items',
        where: { order: { equals: orderId } },
        depth: 1,
        limit: 500,
        pagination: false,
        overrideAccess: true,
      } as any).catch(() => ({ docs: [] } as any)),
      payload.find({
        collection: 'delivery-bookings',
        where: { order: { equals: orderId } },
        depth: 0,
        limit: 1,
        overrideAccess: true,
      } as any).catch(() => ({ docs: [] } as any)),
      payload.find({
        collection: 'delivery-locations',
        where: { order: { equals: orderId } },
        depth: 0,
        limit: 1,
        overrideAccess: true,
      } as any).catch(() => ({ docs: [] } as any)),
      payload.find({
        collection: 'transactions',
        where: { order: { equals: orderId } },
        depth: 0,
        limit: 50,
        pagination: false,
        overrideAccess: true,
      } as any).catch(() => ({ docs: [] } as any)),
      payload.find({
        collection: 'order-tracking',
        where: { order: { equals: orderId } },
        sort: '-timestamp',
        limit: 20,
        depth: 0,
        overrideAccess: true,
      } as any).catch(() => ({ docs: [] } as any)),
      payload.find({
        collection: 'order-discounts',
        where: { order: { equals: orderId } },
        depth: 0,
        limit: 50,
        pagination: false,
        overrideAccess: true,
      } as any).catch(() => ({ docs: [] } as any)),
      payload.find({
        collection: 'reviews',
        where: { order: { equals: orderId } },
        depth: 0,
        limit: 5,
        overrideAccess: true,
      } as any).catch(() => ({ docs: [] } as any)),
    ])

  const items = ((itemsRes as any).docs as any[]).map((it: any) => ({
    id: it.id,
    product_name_snapshot: str(it.product_name_snapshot, ''),
    price_at_purchase: num(it.price_at_purchase, 0),
    quantity: num(it.quantity, 0),
    total_price: num(it.total_price, 0),
    options_snapshot: it.options_snapshot ?? null,
    merchant_product: it.merchant_product ?? null,
    product: it.product ?? null,
    createdAt: String(it.createdAt ?? ''),
    updatedAt: String(it.updatedAt ?? ''),
  }))

  const bookingRaw = ((bookingRes as any).docs as any[])[0] || null
  const booking = bookingRaw
    ? {
        id: bookingRaw.id,
        lalamove_order_id: optionalString(bookingRaw.lalamove_order_id),
        lalamove_quotation_id: optionalString(bookingRaw.lalamove_quotation_id),
        share_link: optionalString(bookingRaw.share_link),
        service_type: str(bookingRaw.service_type, 'MOTORCYCLE'),
        status: str(bookingRaw.status, 'pending'),
        lalamove_raw_status: optionalString(bookingRaw.lalamove_raw_status),
        delivery_fee: bookingRaw.delivery_fee != null ? num(bookingRaw.delivery_fee, 0) : null,
        currency: str(bookingRaw.currency, 'PHP'),
        driver_name: optionalString(bookingRaw.driver_name),
        driver_phone: optionalString(bookingRaw.driver_phone),
        driver_plate_number: optionalString(bookingRaw.driver_plate_number),
        driver_photo_url: optionalString(bookingRaw.driver_photo_url),
        pickup_address: optionalString(bookingRaw.pickup_address),
        dropoff_address: optionalString(bookingRaw.dropoff_address),
        distance_meters: bookingRaw.distance_meters != null ? num(bookingRaw.distance_meters, 0) : null,
        createdAt: String(bookingRaw.createdAt ?? ''),
        updatedAt: String(bookingRaw.updatedAt ?? ''),
      }
    : null

  const locationRaw = ((locationRes as any).docs as any[])[0] || null
  const location = locationRaw
    ? {
        id: locationRaw.id,
        formatted_address: str(locationRaw.formatted_address, ''),
        coordinates: locationRaw.coordinates ?? null,
        street: optionalString(locationRaw.street),
        floor_unit_room: optionalString(locationRaw.floor_unit_room),
        delivery_instructions: optionalString(locationRaw.delivery_instructions),
        notes: optionalString(locationRaw.notes),
        contact_name: optionalString(locationRaw.contact_name),
        contact_phone: optionalString(locationRaw.contact_phone),
        label: optionalString(locationRaw.label),
        merchant_formatted_address: optionalString(locationRaw.merchant_formatted_address),
        merchant_coordinates: locationRaw.merchant_coordinates ?? null,
      }
    : null

  const transactions = ((transactionsRes as any).docs as any[]).map((t: any) => ({
    id: t.id,
    payment_intent_id: optionalString(t.payment_intent_id),
    payment_method: optionalString(t.payment_method),
    amount: num(t.amount, 0),
    currency: str(t.currency, 'PHP'),
    status: str(t.status, 'pending'),
    paid_at: t.paid_at ? String(t.paid_at) : null,
    createdAt: String(t.createdAt ?? ''),
  }))
  const isPaid = transactions.some((t: any) => String(t.status).toLowerCase() === 'paid')

  const trackingHistory = ((trackingRes as any).docs as any[]).map((tr: any) => ({
    id: tr.id,
    status: str(tr.status, ''),
    timestamp: tr.timestamp ? String(tr.timestamp) : String(tr.createdAt ?? ''),
    actor: tr.actor ?? null,
    description: optionalString(tr.description),
    createdAt: String(tr.createdAt ?? ''),
  }))

  const discounts = ((discountsRes as any).docs as any[]).map((d: any) => ({
    id: d.id,
    code: str(d.code, ''),
    amount_off: num(d.amount_off, 0),
    type: str(d.type, 'fixed'),
    coupon: d.coupon ?? null,
    food_discount: num(d.food_discount, 0),
    delivery_discount: num(d.delivery_discount, 0),
    funded_by: str(d.funded_by, 'platform'),
    vendor_share_pct: num(d.vendor_share_pct, 0),
    platform_share: num(d.platform_share, 0),
    vendor_share: num(d.vendor_share, 0),
    source: str(d.source, 'coupon'),
  }))

  const reviewRaw = ((reviewsRes as any).docs as any[])[0] || null
  const review = reviewRaw
    ? {
        id: reviewRaw.id,
        merchant_rating: num(reviewRaw.merchant_rating, 0),
        driver_rating: reviewRaw.driver_rating != null ? num(reviewRaw.driver_rating, 0) : null,
        comment: optionalString(reviewRaw.comment),
        is_public: !!reviewRaw.is_public,
        createdAt: String(reviewRaw.createdAt ?? ''),
      }
    : null

  return { items, booking, location, transactions, isPaid, trackingHistory, discounts, review }
}

function buildAggregatedDoc(orderRaw: Record<string, any>, agg: Awaited<ReturnType<typeof fetchAggregates>>) {
  const base = sanitizeOrderDoc(orderRaw)
  return {
    ...base,
    items: agg.items,
    booking: agg.booking,
    location: agg.location,
    payment: { isPaid: agg.isPaid, transactions: agg.transactions },
    trackingHistory: agg.trackingHistory,
    discounts: agg.discounts,
    review: agg.review,
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })

    const numericId = Number(id)
    const docId: number | string = Number.isFinite(numericId) ? numericId : id

    let doc: Record<string, any>
    try {
      doc = (await payload.findByID({
        collection: 'orders',
        id: docId as number,
        depth: 2,
        overrideAccess: true,
      })) as unknown as Record<string, any>
    } catch (e: any) {
      return NextResponse.json({ error: 'Order not found', details: e?.message }, { status: 404 })
    }
    if (!doc) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const agg = await fetchAggregates(payload, doc.id)
    const sanitized = buildAggregatedDoc(doc, agg)
    return NextResponse.json({ doc: sanitized })
  } catch (err: any) {
    console.error('[admin/orders/[id]] GET error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to load order' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })
    const admin = await authenticateAdmin(payload, request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized: admin authentication required' }, { status: 401 })

    let body: Record<string, any>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const numericId = Number(id)
    const docId: number | string = Number.isFinite(numericId) ? numericId : id

    const patch: Record<string, any> = {}
    if (typeof body.status === 'string') {
      const v = body.status.trim().toLowerCase()
      if (!STATUS_SET.has(v)) {
        return NextResponse.json(
          { error: `status must be one of ${Array.from(STATUS_SET).join(', ')}` },
          { status: 400 },
        )
      }
      patch.status = v
    }
    if (body.delivery_status !== undefined && body.delivery_status !== null && body.delivery_status !== '') {
      if (typeof body.delivery_status === 'string') {
        const v = body.delivery_status.trim().toLowerCase()
        if (!DELIVERY_STATUS_SET.has(v)) {
          return NextResponse.json(
            { error: `delivery_status must be one of ${Array.from(DELIVERY_STATUS_SET).join(', ')}` },
            { status: 400 },
          )
        }
        patch.delivery_status = v
      }
    }
    if (body.notes !== undefined) {
      patch.notes = typeof body.notes === 'string' ? (body.notes.trim() || null) : null
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update. Provide status, delivery_status, or notes.' }, { status: 400 })
    }

    let updated: Record<string, any>
    try {
      updated = (await payload.update({
        collection: 'orders',
        id: docId as number,
        data: patch as any,
        depth: 2,
        overrideAccess: true,
      })) as unknown as Record<string, any>
    } catch (e: any) {
      const msg = e?.message || 'Failed to update order'
      const lower = String(msg).toLowerCase()
      if (lower.includes('unique') || lower.includes('duplicate') || lower.includes('already exists')) {
        return NextResponse.json({ error: 'Duplicate value violates unique constraint', details: msg }, { status: 409 })
      }
      return NextResponse.json({ error: msg, details: e?.data || e?.errors }, { status: 400 })
    }

    // auto audit trail: create order-tracking entry if status changed
    if (patch.status) {
      try {
        await payload.create({
          collection: 'order-tracking',
          data: {
            order: updated.id,
            status: patch.status,
            timestamp: new Date().toISOString(),
            actor: admin.id,
            description:
              typeof body.description === 'string' && body.description.trim()
                ? body.description.trim()
                : `Admin changed status to ${patch.status}`,
          } as any,
          overrideAccess: true,
        })
      } catch {
        // ignore audit failures
      }
    }

    const agg = await fetchAggregates(payload, updated.id)
    const sanitized = buildAggregatedDoc(updated, agg)
    return NextResponse.json({ success: true, message: 'Order updated successfully', doc: sanitized })
  } catch (err: any) {
    console.error('[admin/orders/[id]] PATCH error:', err)
    return NextResponse.json({ error: err?.message || 'Update failed' }, { status: 500 })
  }
}

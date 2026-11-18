import type { NextRequest } from 'next/server'
import type { Payload } from 'payload'
import { authenticateVendor } from '@/utils/mediaLibrary'

export class VendorOrderError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message)
  }
}

export const ORDER_STATUS_SET = new Set([
  'pending',
  'accepted',
  'preparing',
  'ready_for_pickup',
  'on_delivery',
  'delivered',
  'cancelled',
])
export const FULFILLMENT_SET = new Set(['delivery', 'pickup'])
export const DELIVERY_STATUS_SET = new Set([
  'none',
  'pending',
  'assigning_driver',
  'driver_assigned',
  'picked_up',
  'completed',
  'canceled',
  'rejected',
  'expired',
])

const MONEY_KEYS = [
  'subtotal',
  'delivery_fee',
  'platform_fee',
  'priority_fee',
  'discount_total',
] as const

const ALLOWED_INPUT_KEYS = new Set([
  'customer',
  'customer_id',
  'merchant',
  'merchant_id',
  'status',
  'fulfillment_type',
  'subtotal',
  'delivery_fee',
  'platform_fee',
  'priority_fee',
  'discount_total',
  'total',
  'coupon_code',
  'free_delivery_applied',
  'notes',
  'placed_at',
  'description',
])

export async function resolveVendorOrderScope(payload: Payload, request: NextRequest) {
  const authUser = await authenticateVendor(payload, request)
  if (!authUser) {
    throw new VendorOrderError('Unauthorized: vendor authentication required', 401)
  }

  const vendorRes = await payload.find({
    collection: 'vendors',
    where: { user: { equals: String(authUser.id) } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const vendor = vendorRes.docs[0] as Record<string, any> | undefined
  if (!vendor) {
    throw new VendorOrderError('Vendor profile not found', 404)
  }

  const merchantRes = await payload.find({
    collection: 'merchants',
    where: { vendor: { equals: Number(vendor.id) } },
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  const merchants = merchantRes.docs as Record<string, any>[]
  const merchantIds = merchants.map((merchant) => Number(merchant.id)).filter(Number.isFinite)

  return { authUser, vendor, merchants, merchantIds }
}

export async function findVendorOrder(
  payload: Payload,
  orderId: number,
  merchantIds: number[],
): Promise<Record<string, any> | null> {
  if (merchantIds.length === 0) return null
  const result = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { id: { equals: orderId } },
        { merchant: { in: merchantIds } },
      ],
    } as any,
    limit: 1,
    depth: 3,
    overrideAccess: true,
  })
  return (result.docs[0] as Record<string, any> | undefined) ?? null
}

export async function isVendorCustomer(
  payload: Payload,
  customerId: number,
  merchantIds: number[],
): Promise<boolean> {
  if (merchantIds.length === 0) return false
  const result = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { customer: { equals: customerId } },
        { merchant: { in: merchantIds } },
      ],
    } as any,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return result.docs.length > 0
}

export function parseVendorOrderId(value: string): number {
  if (!/^\d+$/.test(value)) throw new VendorOrderError('Invalid order ID', 400)
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id < 1) throw new VendorOrderError('Invalid order ID', 400)
  return id
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function relationId(value: unknown, field: string): number {
  const rawId = isRecord(value) ? value.id : value
  const id = typeof rawId === 'number' ? rawId : typeof rawId === 'string' ? Number(rawId) : NaN
  if (!Number.isSafeInteger(id) || id < 1) throw new VendorOrderError(`${field} must be a valid ID`)
  return id
}

function amount(value: unknown, field: string): number {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new VendorOrderError(`${field} must be a non-negative number`)
  }
  return Math.round(parsed * 100) / 100
}

function optionalText(value: unknown, field: string, maxLength = 2000): string | null {
  if (value == null) return null
  if (typeof value !== 'string') throw new VendorOrderError(`${field} must be a string`)
  const text = value.trim()
  if (text.length > maxLength) throw new VendorOrderError(`${field} must be at most ${maxLength} characters`)
  return text || null
}

function requiredEnum(value: unknown, field: string, options: Set<string>, fallback?: string): string {
  const normalized = value == null && fallback ? fallback : typeof value === 'string' ? value.trim().toLowerCase() : ''
  if (!options.has(normalized)) {
    throw new VendorOrderError(`${field} must be one of ${Array.from(options).join(', ')}`)
  }
  return normalized
}

function has(body: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(body, key)
}

export function buildVendorOrderData(
  input: unknown,
  current?: Record<string, any>,
): { data: Record<string, unknown>; description: string | null } {
  if (!isRecord(input)) throw new VendorOrderError('Invalid JSON body')

  const unknownKey = Object.keys(input).find((key) => !ALLOWED_INPUT_KEYS.has(key))
  if (unknownKey) throw new VendorOrderError(`Unsupported order field: ${unknownKey}`)

  const creating = current == null
  const data: Record<string, unknown> = {}
  const customerValue = input.customer ?? input.customer_id
  const merchantValue = input.merchant ?? input.merchant_id

  if (creating || has(input, 'customer') || has(input, 'customer_id')) {
    if (customerValue == null || customerValue === '') {
      throw new VendorOrderError('customer is required')
    }
    data.customer = relationId(customerValue, 'customer')
  }
  if (creating || has(input, 'merchant') || has(input, 'merchant_id')) {
    if (merchantValue == null || merchantValue === '') {
      throw new VendorOrderError('merchant is required')
    }
    data.merchant = relationId(merchantValue, 'merchant')
  }

  if (creating || has(input, 'status')) {
    data.status = requiredEnum(input.status, 'status', ORDER_STATUS_SET, 'pending')
  }
  if (creating || has(input, 'fulfillment_type')) {
    data.fulfillment_type = requiredEnum(input.fulfillment_type, 'fulfillment_type', FULFILLMENT_SET)
  }
  const touchesMoney = creating || MONEY_KEYS.some((key) => has(input, key))
  const suppliesTotal = has(input, 'total')
  if (touchesMoney || suppliesTotal) {
    const legs: Record<(typeof MONEY_KEYS)[number], number> = {
      subtotal: 0,
      delivery_fee: 0,
      platform_fee: 0,
      priority_fee: 0,
      discount_total: 0,
    }
    for (const key of MONEY_KEYS) {
      const source = has(input, key) ? input[key] : current?.[key]
      legs[key] = amount(source ?? 0, key)
      if (creating || has(input, key)) data[key] = legs[key]
    }
    const expectedTotal = Math.round(
      (legs.subtotal + legs.delivery_fee + legs.platform_fee + legs.priority_fee - legs.discount_total) * 100,
    ) / 100
    if (expectedTotal < 0) throw new VendorOrderError('discount_total cannot exceed the order charges')
    if (suppliesTotal && Math.abs(amount(input.total, 'total') - expectedTotal) > 0.01) {
      throw new VendorOrderError(`Order total mismatch: expected ${expectedTotal.toFixed(2)}`)
    }
    data.total = expectedTotal
  }

  if (creating || has(input, 'coupon_code')) {
    data.coupon_code = optionalText(input.coupon_code, 'coupon_code', 100)
  }
  if (creating || has(input, 'free_delivery_applied')) {
    if (input.free_delivery_applied != null && typeof input.free_delivery_applied !== 'boolean') {
      throw new VendorOrderError('free_delivery_applied must be a boolean')
    }
    data.free_delivery_applied = input.free_delivery_applied === true
  }
  if (creating || has(input, 'notes')) data.notes = optionalText(input.notes, 'notes')
  if (creating || has(input, 'placed_at')) {
    const rawDate = input.placed_at
    if (rawDate == null || rawDate === '') {
      if (creating) data.placed_at = new Date().toISOString()
    } else {
      if (typeof rawDate !== 'string' || Number.isNaN(new Date(rawDate).getTime())) {
        throw new VendorOrderError('placed_at must be a valid date')
      }
      data.placed_at = new Date(rawDate).toISOString()
    }
  }
  return {
    data,
    description: optionalText(input.description, 'description', 1000),
  }
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function num(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() || null : null
}

function sanitizeMerchant(value: unknown): Record<string, unknown> | null {
  if (value == null) return null
  const merchant = isRecord(value) ? value : { id: value }
  const id = Number(merchant.id)
  if (!Number.isFinite(id)) return null
  const rawVendor = isRecord(merchant.vendor) ? merchant.vendor : null
  const rawLogo = rawVendor && isRecord(rawVendor.logo) ? rawVendor.logo : null
  const vendorId = rawVendor ? Number(rawVendor.id) : NaN
  return {
    id,
    outletName: str(merchant.outletName, `Outlet #${id}`),
    outletCode: str(merchant.outletCode),
    isActive: typeof merchant.isActive === 'boolean' ? merchant.isActive : null,
    vendor: rawVendor && Number.isFinite(vendorId)
      ? {
          id: vendorId,
          businessName: str(rawVendor.businessName),
          logo: rawLogo
            ? {
                id: rawLogo.id,
                url: optionalString(rawLogo.cloudinaryURL) ?? optionalString(rawLogo.url),
              }
            : null,
        }
      : null,
  }
}

function sanitizeCustomer(value: unknown): Record<string, unknown> | null {
  if (value == null) return null
  const customer = isRecord(value) ? value : { id: value }
  const id = Number(customer.id)
  if (!Number.isFinite(id)) return null
  const user = isRecord(customer.user) ? customer.user : null
  return {
    id,
    email: str(customer.email),
    firstName: user ? str(user.firstName) : '',
    lastName: user ? str(user.lastName) : '',
  }
}

export function sanitizeVendorOrderDoc(
  raw: Record<string, any>,
  options: {
    deliveryStatus?: string
    lalamoveOrderId?: string | null
    serviceType?: string
    trackingLink?: string | null
    isPaid?: boolean
  } = {},
): Record<string, unknown> {
  const id = raw.id
  const deliveryStatus = options.deliveryStatus ?? str(raw.delivery_status, 'none')
  const lalamoveOrderId = options.lalamoveOrderId !== undefined
    ? options.lalamoveOrderId
    : optionalString(raw.lalamove_order_id)
  const serviceType = options.serviceType ?? str(raw.delivery_service_type, 'MOTORCYCLE')
  const trackingLink = options.trackingLink !== undefined
    ? options.trackingLink
    : optionalString(raw.delivery_tracking_link)
  return {
    id,
    orderNumber: `#${String(id).padStart(5, '0')}`,
    status: str(raw.status, 'pending'),
    fulfillment_type: str(raw.fulfillment_type, 'delivery'),
    total: num(raw.total),
    subtotal: num(raw.subtotal),
    delivery_fee: num(raw.delivery_fee),
    platform_fee: num(raw.platform_fee),
    priority_fee: num(raw.priority_fee),
    discount_total: num(raw.discount_total),
    coupon_code: optionalString(raw.coupon_code),
    free_delivery_applied: !!raw.free_delivery_applied,
    placed_at: raw.placed_at ? String(raw.placed_at) : null,
    notes: optionalString(raw.notes),
    delivery_status: deliveryStatus,
    delivery_service_type: serviceType,
    delivery_tracking_link: trackingLink,
    isPaid: options.isPaid ?? false,
    lalamove: {
      orderId: lalamoveOrderId,
      serviceType,
      status: deliveryStatus,
      trackingLink,
    },
    merchant: sanitizeMerchant(raw.merchant),
    customer: sanitizeCustomer(raw.customer),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
  }
}

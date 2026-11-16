import type { PayloadRequest } from 'payload'
import { getStoreHoursStatus } from '../utils/storeHours'
import { isMerchantOnVacation } from '../utils/vacationMode'

function parseId(value: string | undefined): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

function authorized(req: PayloadRequest): boolean {
  return req.user?.role === 'service' || req.user?.role === 'admin'
}

function authError(req: PayloadRequest): Response | null {
  if (!req.user) {
    return Response.json(
      { success: false, error: 'Authentication required.', code: 'UNAUTHENTICATED' },
      { status: 401 },
    )
  }
  if (!authorized(req)) {
    return Response.json(
      { success: false, error: 'Service or admin role required.', code: 'INSUFFICIENT_PERMISSIONS' },
      { status: 403 },
    )
  }
  return null
}

function sanitizePublicMedia(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  const media = value as Record<string, unknown>
  return {
    id: media.id,
    alt: media.alt,
    cloudinaryURL: media.cloudinaryURL,
    url: media.url,
    thumbnailURL: media.thumbnailURL,
  }
}

function sanitizePublicVendor(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  const vendor = value as Record<string, unknown>
  return {
    id: vendor.id,
    businessName: vendor.businessName,
    businessType: vendor.businessType,
    description: vendor.description,
    logo: sanitizePublicMedia(vendor.logo),
  }
}

function sanitizePublicAddress(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  const address = value as Record<string, unknown>
  return {
    id: address.id,
    formatted_address: address.formatted_address,
    street: address.street,
    street_number: address.street_number,
    route: address.route,
    subpremise: address.subpremise,
    floor_unit_room: address.floor_unit_room,
    barangay: address.barangay,
    locality: address.locality,
    administrative_area_level_2: address.administrative_area_level_2,
    city: address.city,
    administrative_area_level_1: address.administrative_area_level_1,
    postal_code: address.postal_code,
    country: address.country,
    latitude: address.latitude,
    longitude: address.longitude,
  }
}

function sanitizePublicCategories(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return []
  return value.map((category) => {
    if (!category || typeof category !== 'object') return { id: category }
    const item = category as Record<string, unknown>
    return { id: item.id, name: item.name, slug: item.slug }
  })
}

function sanitizePublicContact(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  const contact = value as Record<string, unknown>
  return { phone: contact.phone, email: contact.email }
}

export const merchantViewHandler = async (req: PayloadRequest) => {
  const unauthorized = authError(req)
  if (unauthorized) return unauthorized

  const { merchantId: merchantIdParam } = req.query as { merchantId?: string }
  const merchantId = parseId(merchantIdParam)
  if (!merchantId) {
    return Response.json(
      { success: false, error: 'Invalid merchantId.', code: 'INVALID_PARAMETER' },
      { status: 400 },
    )
  }

  try {
    const merchant = await req.payload.findByID({
      collection: 'merchants',
      id: merchantId,
      depth: 2,
      context: { skipStoreHours: true },
      select: {
        id: true,
        outletName: true,
        isActive: true,
        isAcceptingOrders: true,
        vacationMode: true,
        vacationModeEndsAt: true,
        timezone: true,
        operatingHours: true,
        specialHours: true,
        delivery_hours: true,
        vendor: true,
        media: {
          thumbnail: true,
          storeFrontImage: true,
        },
        activeAddress: true,
        contactInfo: {
          phone: true,
          email: true,
        },
        description: true,
        specialInstructions: true,
        merchant_categories: true,
        deliverySettings: {
          minimumOrderAmount: true,
          deliveryFee: true,
          freeDeliveryThreshold: true,
          estimatedDeliveryTimeMinutes: true,
          maxDeliveryTimeMinutes: true,
        },
        is_currently_delivering: true,
        delivery_radius_meters: true,
        min_order_amount: true,
        delivery_fee_base: true,
        delivery_fee_per_km: true,
        free_delivery_threshold: true,
        avg_delivery_time_minutes: true,
      },
    })
    const now = new Date()
    const storeHoursStatus = getStoreHoursStatus(merchant, now)
    const onVacation = isMerchantOnVacation(merchant, now)
    return Response.json(
      {
        success: true,
        data: {
          ...merchant,
          vendor: sanitizePublicVendor(merchant.vendor),
          media: {
            thumbnail: sanitizePublicMedia(merchant.media?.thumbnail),
            storeFrontImage: sanitizePublicMedia(merchant.media?.storeFrontImage),
          },
          activeAddress: sanitizePublicAddress(merchant.activeAddress),
          contactInfo: sanitizePublicContact(merchant.contactInfo),
          merchant_categories: sanitizePublicCategories(merchant.merchant_categories),
          isOpenNow: onVacation ? false : storeHoursStatus.isOpen,
          storeHoursStatus: onVacation ? { ...storeHoursStatus, isOpen: false } : storeHoursStatus,
          nextOpeningAt: onVacation
            ? merchant.vacationModeEndsAt ?? null
            : storeHoursStatus.nextOpeningAt ?? null,
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (message.toLowerCase().includes('not found')) {
      return Response.json(
        { success: false, error: 'Merchant not found.', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }
    console.error('[merchant-view] failed to load merchant', { merchantId, message })
    return Response.json(
      { success: false, error: 'Failed to load merchant.', code: 'MERCHANT_VIEW_ERROR' },
      { status: 500 },
    )
  }
}

import type { Payload } from 'payload'
import type { Merchant, Vendor } from '../payload-types'

export interface MerchantLocationRequest {
  customerId: number
}

export interface MerchantLocationResponse {
  customer: {
    id: number
    activeAddressId: number
  }
  address: {
    id: number
    latitude: number
    longitude: number
  }
  merchants: Merchant[]
  totalCount: number
}

/**
 * MerchantLocationService for location-based-display endpoint
 * Uses PostGIS ONLY - no Google Maps, no Haversine, no external dependencies
 * Completely independent from checkout-delivery endpoint
 */
export class MerchantLocationService {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  async getMerchantsForLocationDisplay(request: MerchantLocationRequest): Promise<MerchantLocationResponse> {
    const { customerId } = request
    const startTime = Date.now()

    try {
      // Step 1: Get customer data
      const customer = await this.payload.findByID({
        collection: 'customers',
        id: customerId,
      })

      if (!customer || !customer.activeAddress) {
        throw new Error('Customer not found or no active address')
      }

      const activeAddressId = typeof customer.activeAddress === 'object' 
        ? customer.activeAddress.id 
        : customer.activeAddress

      // Step 2: Get active address coordinates
      const address = await this.payload.findByID({
        collection: 'addresses',
        id: activeAddressId,
      })

      if (!address || !address.latitude || !address.longitude) {
        throw new Error('Address not found or missing coordinates')
      }

      const customerLat = parseFloat(address.latitude.toString())
      const customerLng = parseFloat(address.longitude.toString())

      if (isNaN(customerLat) || isNaN(customerLng)) {
        throw new Error('Invalid customer coordinates')
      }

      // Step 3: Use PostGIS to find merchants within 50km radius
      const radiusMeters = 50000 // 50km for location display
      
      console.log(`🗺️ Using PostGIS to find merchants within ${radiusMeters}m of (${customerLat}, ${customerLng})`)

      // PostGIS query using ST_DWithin for spatial search
      const postgisQuery = `
        SELECT 
          m.*,
          v.name as vendor_name,
          v.id as vendor_id,
          ST_Distance(
            ST_GeogFromText('POINT(' || m.merchant_longitude || ' ' || m.merchant_latitude || ')'),
            ST_GeogFromText('POINT(${customerLng} ${customerLat})')
          ) as distance_meters
        FROM merchants m
        LEFT JOIN vendors v ON m.vendor = v.id
        WHERE 
          m."isActive" = true 
          AND m."isAcceptingOrders" = true
          AND m.merchant_latitude IS NOT NULL 
          AND m.merchant_longitude IS NOT NULL
          AND ST_DWithin(
            ST_GeogFromText('POINT(' || m.merchant_longitude || ' ' || m.merchant_latitude || ')'),
            ST_GeogFromText('POINT(${customerLng} ${customerLat})'),
            ${radiusMeters}
          )
        ORDER BY distance_meters ASC
        LIMIT 50
      `

      // Execute PostGIS query directly
      const db = this.payload.db
      const result = await db.drizzle.execute(postgisQuery) as { rows: Record<string, unknown>[] }
      
      console.log(`🗺️ PostGIS found ${result.rows.length} merchants`)

      // Convert raw results to Merchant objects
      const merchants: Merchant[] = result.rows.map((row: Record<string, unknown>) => ({
        id: Number(row.id),
        outletName: String(row.outletName || row.outlet_name || ''),
        outletCode: String(row.outletCode || row.outlet_code || ''),
        merchant_latitude: Number(row.merchant_latitude),
        merchant_longitude: Number(row.merchant_longitude),
        isActive: Boolean(row.isActive),
        isAcceptingOrders: Boolean(row.isAcceptingOrders),
        isCurrentlyDelivering: Boolean(row.isCurrentlyDelivering),
        operationalStatus: (row.operationalStatus as 'open' | 'closed' | 'busy' | 'temp_closed' | 'maintenance') || null,
        delivery_radius_meters: Number(row.delivery_radius_meters),
        avg_delivery_time_minutes: Number(row.avg_delivery_time_minutes),
        distanceMeters: Math.round(Number(row.distance_meters)),
        distanceKm: Math.round(Number(row.distance_meters) / 1000 * 100) / 100,
        vendor: {
          id: Number(row.vendor_id),
          user: Number(row.vendor_user_id) || 0,
          businessName: String(row.vendor_name || ''),
          legalName: String(row.vendor_legal_name || row.vendor_name || ''),
          businessRegistrationNumber: String(row.vendor_registration_number || ''),
          primaryContactEmail: String(row.vendor_email || ''),
          primaryContactPhone: String(row.vendor_phone || ''),
          businessType: (row.vendor_business_type as 'restaurant' | 'fast_food' | 'grocery' | 'pharmacy' | 'convenience' | 'bakery' | 'coffee_shop' | 'other') || 'restaurant',
          verificationStatus: (row.vendor_verification_status as 'pending' | 'verified' | 'rejected' | 'suspended') || 'pending',
          isActive: Boolean(row.vendor_is_active !== undefined ? row.vendor_is_active : true),
          updatedAt: String(row.vendor_updated_at || new Date().toISOString()),
          createdAt: String(row.vendor_created_at || new Date().toISOString()),
        } as Vendor,
        updatedAt: String(row.updatedAt || row.updated_at || new Date().toISOString()),
        createdAt: String(row.createdAt || row.created_at || new Date().toISOString()),
      }))

      const endTime = Date.now()
      console.log(`✅ PostGIS location service completed in ${endTime - startTime}ms, found ${merchants.length} merchants`)

      return {
        customer: {
          id: customer.id,
          activeAddressId,
        },
        address: {
          id: address.id,
          latitude: customerLat,
          longitude: customerLng,
        },
        merchants,
        totalCount: merchants.length,
      }

    } catch (error) {
      const endTime = Date.now()
      console.error(`🚨 PostGIS MerchantLocationService error (${endTime - startTime}ms):`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        customerId,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }
}
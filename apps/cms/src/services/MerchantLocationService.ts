import type { Payload } from 'payload'
import type { Merchant } from '../payload-types'
import { GeospatialService } from './GeospatialService'

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
 * MerchantLocationService - PostGIS-based location service
 * This service is specifically designed for location-based display functionality
 * Uses PostGIS spatial queries for accurate distance calculations
 * 
 * Note: This is separate from MerchantCheckoutService which uses Google Maps for delivery calculations
 */
export class MerchantLocationService {
  private payload: Payload
  private geospatialService: GeospatialService

  constructor(payload: Payload) {
    this.payload = payload
    this.geospatialService = new GeospatialService(payload)
  }

  async getMerchantsForLocationDisplay(request: MerchantLocationRequest): Promise<MerchantLocationResponse> {
    const { customerId } = request

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

    const lat = parseFloat(address.latitude.toString())
    const lng = parseFloat(address.longitude.toString())

    // Step 3: Find merchants using PostGIS spatial queries
    const result = await this.geospatialService.findMerchantsWithinRadiusPostGIS({
      latitude: lat,
      longitude: lng,
      radiusMeters: 50000, // 50km radius for location display
      limit: 50, // More merchants for location display
      offset: 0 // First page
    })

    return {
      customer: {
        id: customer.id,
        activeAddressId,
      },
      address: {
        id: address.id,
        latitude: lat,
        longitude: lng,
      },
      merchants: result.merchants,
      totalCount: result.totalCount,
    }
  }
}
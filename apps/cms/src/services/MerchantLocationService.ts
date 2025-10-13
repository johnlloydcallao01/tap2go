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
 * MerchantLocationService - Pure PostGIS distance calculation service
 * 
 * This service is specifically designed for location-based display functionality
 * Uses PostGIS spatial queries for accurate distance calculations
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

    if (!customer) {
      throw new Error('Customer not found')
    }

    if (!customer.activeAddress) {
      throw new Error('Customer has no active address')
    }

    // Extract activeAddressId with proper validation
    let activeAddressId: number
    if (typeof customer.activeAddress === 'object' && customer.activeAddress !== null) {
      activeAddressId = customer.activeAddress.id
    } else if (typeof customer.activeAddress === 'number') {
      activeAddressId = customer.activeAddress
    } else if (typeof customer.activeAddress === 'string') {
      activeAddressId = parseInt(customer.activeAddress, 10)
      if (isNaN(activeAddressId)) {
        throw new Error('Invalid activeAddress ID format')
      }
    } else {
      throw new Error('Invalid activeAddress format')
    }

    // Validate the extracted ID
    if (!activeAddressId || isNaN(activeAddressId)) {
      throw new Error('Invalid activeAddress ID')
    }

    // Step 2: Get active address coordinates
    const address = await this.payload.findByID({
      collection: 'addresses',
      id: activeAddressId,
    })

    if (!address) {
      throw new Error('Address not found')
    }

    if (!address.latitude || !address.longitude) {
      throw new Error('Address missing coordinates')
    }

    // Validate coordinates before parsing
    const latStr = address.latitude.toString()
    const lngStr = address.longitude.toString()
    
    if (!latStr || !lngStr || latStr === 'null' || lngStr === 'null') {
      throw new Error('Address has null coordinates')
    }

    const lat = parseFloat(latStr)
    const lng = parseFloat(lngStr)

    // Validate parsed coordinates
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Address has invalid coordinate values')
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Address coordinates are out of valid range')
    }

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
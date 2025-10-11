import type { Payload } from 'payload'
import type { Merchant } from '../payload-types'
import { GeospatialService } from './GeospatialService'

export interface MerchantCheckoutRequest {
  customerId: number
}

export interface MerchantCheckoutResponse {
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

export class MerchantCheckoutService {
  private payload: Payload
  private geospatialService: GeospatialService

  constructor(payload: Payload) {
    this.payload = payload
    this.geospatialService = new GeospatialService(payload)
  }

  async getMerchantsForCheckout(request: MerchantCheckoutRequest): Promise<MerchantCheckoutResponse> {
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

    // Step 3: Find merchants using the same logic as merchants-by-location
    const result = await this.geospatialService.findMerchantsWithinRadius({
      latitude: lat,
      longitude: lng,
      radiusMeters: 100000, // 100km default radius
      limit: 20, // Default limit
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
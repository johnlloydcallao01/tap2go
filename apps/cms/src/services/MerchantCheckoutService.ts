import type { Payload } from 'payload'
import type { Merchant, Vendor } from '../payload-types'
import type { Where } from 'payload'
import { GoogleMapsService } from './GoogleMapsService'

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

// Type for merchants with distance calculation
type MerchantWithDistance = Merchant & {
  distanceMeters: number
  distanceKm: number
  isWithinDeliveryRadius?: boolean
  estimatedDeliveryTime?: number
  vendor: Vendor
}

/**
 * MerchantCheckoutService for checkout functionality
 * Uses Google Maps API for distance calculations
 */
export class MerchantCheckoutService {
  private payload: Payload
  private googleMapsService: GoogleMapsService

  constructor(payload: Payload) {
    this.payload = payload
    this.googleMapsService = new GoogleMapsService()
  }

  /**
   * Calculate distance using Google Maps API
   * Returns distance in meters
   */
  private async calculateGoogleMapsDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): Promise<number> {
    try {
      const result = await this.googleMapsService.calculateDrivingDistance(
        { latitude: lat1, longitude: lon1 },
        { latitude: lat2, longitude: lon2 }
      )
      
      if (result.status === 'OK') {
        return result.distance
      } else {
        console.warn(`Google Maps API returned status: ${result.status}`)
        // Fallback to Haversine if Google Maps fails
        return this.calculateHaversineDistance(lat1, lon1, lat2, lon2)
      }
    } catch (error) {
      console.error('Error calculating Google Maps distance:', error)
      // Fallback to Haversine if Google Maps fails
      return this.calculateHaversineDistance(lat1, lon1, lat2, lon2)
    }
  }

  /**
   * Fallback Haversine calculation for when Google Maps fails
   */
  private calculateHaversineDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371000 // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Calculate estimated delivery time based on distance
   */
  private calculateEstimatedDeliveryTime(distanceMeters: number, avgDeliveryTime?: number): number {
    if (avgDeliveryTime && avgDeliveryTime > 0) {
      return avgDeliveryTime
    }
    
    // Base time + distance-based calculation for checkout
    const baseTime = 20 // 20 minutes base for checkout
    const timePerKm = 4 // 4 minutes per km for checkout (more conservative)
    const distanceKm = distanceMeters / 1000
    
    return Math.round(baseTime + (distanceKm * timePerKm))
  }

  /**
   * Validate coordinates
   */
  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180 &&
      !isNaN(latitude) && !isNaN(longitude)
    )
  }

  async getMerchantsForCheckout(request: MerchantCheckoutRequest): Promise<MerchantCheckoutResponse> {
    const { customerId } = request
    const startTime = Date.now()

    try {
      // Step 1: Get customer data independently
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

      // Step 2: Get active address coordinates independently
      const address = await this.payload.findByID({
        collection: 'addresses',
        id: activeAddressId,
      })

      if (!address || !address.latitude || !address.longitude) {
        throw new Error('Address not found or missing coordinates')
      }

      const customerLat = parseFloat(address.latitude.toString())
      const customerLng = parseFloat(address.longitude.toString())

      if (!this.isValidCoordinate(customerLat, customerLng)) {
        throw new Error('Invalid customer coordinates')
      }

      // Step 3: Find merchants using independent Payload queries (no GeospatialService, no external APIs)
      const whereClause: Where = {
        and: [
          { isActive: { equals: true } },
          { isAcceptingOrders: { equals: true } },
          { isCurrentlyDelivering: { equals: true } }, // Only merchants currently delivering for checkout
          { merchant_latitude: { not_equals: null } },
          { merchant_longitude: { not_equals: null } },
        ]
      }

      // Get merchants with vendor relationship
      const result = await this.payload.find({
        collection: 'merchants',
        where: whereClause,
        limit: 100, // Get more to filter by distance
        depth: 2, // Populate vendor relationship
      })

      console.log(`🛒 Found ${result.docs.length} active merchants for checkout`)

      // Step 4: Calculate distances and filter independently
      const merchantsWithDistance: MerchantWithDistance[] = []
      const radiusMeters = 100000 // 100km radius for checkout (wider range)

      for (const merchant of result.docs) {
        if (!merchant.merchant_latitude || !merchant.merchant_longitude) {
          continue
        }

        const merchantLat = parseFloat(merchant.merchant_latitude.toString())
        const merchantLng = parseFloat(merchant.merchant_longitude.toString())

        if (!this.isValidCoordinate(merchantLat, merchantLng)) {
          continue
        }

        // Calculate distance using Google Maps API
        const distanceMeters = await this.calculateGoogleMapsDistance(
          customerLat, customerLng,
          merchantLat, merchantLng
        )

        // Filter by radius
        if (distanceMeters > radiusMeters) {
          continue
        }

        // For checkout, prioritize merchants within their delivery radius
        const isWithinDeliveryRadius = merchant.delivery_radius_meters 
          ? distanceMeters <= merchant.delivery_radius_meters 
          : false

        merchantsWithDistance.push({
          ...merchant,
          vendor: merchant.vendor as Vendor,
          distanceMeters,
          distanceKm: distanceMeters / 1000,
          isWithinDeliveryRadius,
          estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(
            distanceMeters,
            merchant.avg_delivery_time_minutes || undefined
          ),
        } as MerchantWithDistance)
      }

      // Sort by delivery radius first, then by distance
      const sortedMerchants = merchantsWithDistance
        .sort((a, b) => {
          // Prioritize merchants within delivery radius
          if (a.isWithinDeliveryRadius && !b.isWithinDeliveryRadius) return -1
          if (!a.isWithinDeliveryRadius && b.isWithinDeliveryRadius) return 1
          // Then sort by distance
          return a.distanceMeters - b.distanceMeters
        })
        .slice(0, 20) // Limit to 20 merchants for checkout

      const endTime = Date.now()
      console.log(`✅ Checkout service completed in ${endTime - startTime}ms, found ${sortedMerchants.length} merchants`)

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
        merchants: sortedMerchants,
        totalCount: sortedMerchants.length,
      }

    } catch (error) {
      const endTime = Date.now()
      console.error(`🚨 MerchantCheckoutService error (${endTime - startTime}ms):`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        customerId,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }
}
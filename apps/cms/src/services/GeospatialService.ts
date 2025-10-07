import type { Payload } from 'payload'
import type { Merchant } from '../payload-types'
import type { Where } from 'payload'

// Type for geospatial query results
type _MerchantWithDistance = Merchant & {
  distanceMeters: number
  distanceKm: number
  isWithinDeliveryRadius?: boolean
  estimatedDeliveryTime?: number
  serviceAreaType?: string[]
  isPriorityZone?: boolean
}

// Type for PayloadCMS Where clause and array
type WhereCondition = Record<string, unknown>

/**
 * Enhanced GeospatialService with PostGIS support
 * Provides high-performance geospatial operations for merchant location queries
 */
export class GeospatialService {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Find merchants within a specific radius of a given location
   * Uses PostGIS ST_DWithin for efficient distance queries
   */
  async findMerchantsWithinRadius(params: {
    latitude: number
    longitude: number
    radiusMeters: number
    limit?: number
    offset?: number
    filters?: {
      isActive?: boolean
      isAcceptingOrders?: boolean
      operationalStatus?: string[]
      cuisineTypes?: string[]
      minRating?: number
    }
  }) {
    const {
      latitude,
      longitude,
      radiusMeters,
      limit = 50,
      offset = 0,
      filters = {}
    } = params

    // Validate coordinates
    if (!this.isValidCoordinate(latitude, longitude)) {
      throw new Error('Invalid coordinates provided')
    }

    // Build where clause with geospatial and business logic filters
    const whereClause: Where = {
      and: [
        // Geospatial filter using PostGIS
        {
          merchant_coordinates: {
            near: [longitude, latitude, radiusMeters]
          }
        },
        // Business logic filters
        ...(filters.isActive !== undefined ? [{ isActive: { equals: filters.isActive } }] : []),
        ...(filters.isAcceptingOrders !== undefined ? [{ isAcceptingOrders: { equals: filters.isAcceptingOrders } }] : []),
        ...(filters.operationalStatus ? [{ operationalStatus: { in: filters.operationalStatus } }] : []),
        ...(filters.cuisineTypes ? [{ cuisineTypes: { in: filters.cuisineTypes } }] : []),
        ...(filters.minRating ? [{ averageRating: { greater_than_equal: filters.minRating } }] : []),
        // Ensure merchant has valid coordinates
        {
          and: [
            { merchant_latitude: { not_equals: null } },
            { merchant_longitude: { not_equals: null } }
          ]
        }
      ]
    }

    try {
      const result = await this.payload.find({
        collection: 'merchants',
        where: whereClause,
        limit,
        page: Math.floor(offset / limit) + 1,
        sort: '-averageRating', // Sort by rating by default
        depth: 2, // Include vendor and address details
      })

      // Calculate actual distances and add to results
      const merchantsWithDistance = result.docs.map(merchant => {
        const distance = this.calculateHaversineDistance(
          latitude,
          longitude,
          merchant.merchant_latitude || 0,
          merchant.merchant_longitude || 0
        )

        return {
          ...merchant,
          distanceMeters: Math.round(distance),
          distanceKm: Math.round(distance / 1000 * 100) / 100,
          isWithinDeliveryRadius: distance <= (merchant.delivery_radius_meters || 5000)
        }
      })

      return {
        merchants: merchantsWithDistance,
        pagination: {
          totalDocs: result.totalDocs,
          limit: result.limit,
          totalPages: result.totalPages,
          page: result.page,
          pagingCounter: result.pagingCounter,
          hasPrevPage: result.hasPrevPage,
          hasNextPage: result.hasNextPage,
          prevPage: result.prevPage,
          nextPage: result.nextPage
        },
        searchCenter: { latitude, longitude },
        searchRadiusMeters: radiusMeters
      }
    } catch (error) {
      console.error('Error finding merchants within radius:', error)
      throw new Error('Failed to find merchants within radius')
    }
  }

  /**
   * Find merchants that can deliver to a specific location
   * Considers each merchant's individual delivery radius
   */
  async findMerchantsInDeliveryRadius(params: {
    latitude: number
    longitude: number
    limit?: number
    offset?: number
    filters?: {
      isActive?: boolean
      isAcceptingOrders?: boolean
      isCurrentlyDelivering?: boolean
      maxDeliveryTime?: number
      minOrderAmount?: number
    }
  }) {
    const {
      latitude,
      longitude,
      limit = 50,
      offset = 0,
      filters = {}
    } = params

    if (!this.isValidCoordinate(latitude, longitude)) {
      throw new Error('Invalid coordinates provided')
    }

    // First, get all active merchants with their delivery radius
    const whereClause: Where = {
      and: [
        // Basic business filters
        { isActive: { equals: true } },
        { isAcceptingOrders: { equals: true } },
        ...(filters.isCurrentlyDelivering !== undefined ? [{ is_currently_delivering: { equals: filters.isCurrentlyDelivering } }] : []),
        ...(filters.maxDeliveryTime ? [{ avg_delivery_time_minutes: { less_than_equal: filters.maxDeliveryTime } }] : []),
        ...(filters.minOrderAmount ? [{ min_order_amount: { less_than_equal: filters.minOrderAmount } }] : []),
        // Ensure merchant has valid coordinates and delivery radius
        {
          and: [
            { merchant_latitude: { not_equals: null } },
            { merchant_longitude: { not_equals: null } },
            { delivery_radius_meters: { greater_than: 0 } }
          ]
        }
      ]
    }

    try {
      const result = await this.payload.find({
        collection: 'merchants',
        where: whereClause,
        limit: 200, // Get more to filter by individual delivery radius
        depth: 2,
        sort: '-delivery_success_rate'
      })

      // Filter merchants by their individual delivery radius
      const merchantsInDeliveryRange = result.docs
        .map(merchant => {
          const distance = this.calculateHaversineDistance(
            latitude,
            longitude,
            merchant.merchant_latitude || 0,
            merchant.merchant_longitude || 0
          )

          const deliveryRadius = merchant.delivery_radius_meters || 5000
          const isInDeliveryRange = distance <= deliveryRadius

          return {
            ...merchant,
            distanceMeters: Math.round(distance),
            distanceKm: Math.round(distance / 1000 * 100) / 100,
            deliveryRadiusMeters: deliveryRadius,
            isInDeliveryRange,
            estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(distance, merchant.avg_delivery_time_minutes || undefined)
          }
        })
        .filter(merchant => merchant.isInDeliveryRange)
        .sort((a, b) => a.distanceMeters - b.distanceMeters) // Sort by distance
        .slice(offset, offset + limit)

      return {
        merchants: merchantsInDeliveryRange,
        totalFound: merchantsInDeliveryRange.length,
        searchLocation: { latitude, longitude },
        filters: filters
      }
    } catch (error) {
      console.error('Error finding merchants in delivery radius:', error)
      throw new Error('Failed to find merchants in delivery radius')
    }
  }

  /**
   * Find merchants within custom service areas (polygon-based queries)
   * Uses PostGIS ST_Contains for polygon intersection
   */
  async findMerchantsInServiceArea(params: {
    latitude: number
    longitude: number
    serviceAreaType?: 'delivery' | 'priority' | 'all'
    limit?: number
    offset?: number
  }) {
    const {
      latitude,
      longitude,
      serviceAreaType = 'all',
      limit = 50,
      offset = 0
    } = params

    if (!this.isValidCoordinate(latitude, longitude)) {
      throw new Error('Invalid coordinates provided')
    }

    // Create point for the search location
    const searchPoint = {
      type: 'Point',
      coordinates: [longitude, latitude]
    }

    const whereClause: Where = {
      and: [
        { isActive: { equals: true } },
        { isAcceptingOrders: { equals: true } },
        {
          and: [
            { merchant_latitude: { not_equals: null } },
            { merchant_longitude: { not_equals: null } }
          ]
        }
      ]
    }

    // Add service area filters based on type
    if (serviceAreaType === 'delivery') {
      (whereClause.and as WhereCondition[]).push({
        service_area: {
          intersects: searchPoint
        }
      })
    } else if (serviceAreaType === 'priority') {
      (whereClause.and as WhereCondition[]).push({
        priority_zones: {
          intersects: searchPoint
        }
      })
    } else {
      // 'all' - merchants with any service area containing the point
      (whereClause.and as WhereCondition[]).push({
        or: [
          { service_area: { intersects: searchPoint } },
          { priority_zones: { intersects: searchPoint } }
        ]
      })
    }

    try {
      const result = await this.payload.find({
        collection: 'merchants',
        where: whereClause,
        limit,
        page: Math.floor(offset / limit) + 1,
        depth: 2,
        sort: '-delivery_success_rate'
      })

      const merchantsWithServiceInfo = result.docs.map(merchant => {
        const distance = this.calculateHaversineDistance(
          latitude,
          longitude,
          merchant.merchant_latitude || 0,
          merchant.merchant_longitude || 0
        )

        return {
          ...merchant,
          distanceMeters: Math.round(distance),
          distanceKm: Math.round(distance / 1000 * 100) / 100,
          serviceAreaType: this.determineServiceAreaType(merchant, searchPoint),
          isPriorityZone: this.isPointInPriorityZone(merchant, searchPoint)
        }
      })

      return {
        merchants: merchantsWithServiceInfo,
        pagination: {
          totalDocs: result.totalDocs,
          limit: result.limit,
          totalPages: result.totalPages,
          page: result.page,
          pagingCounter: result.pagingCounter,
          hasPrevPage: result.hasPrevPage,
          hasNextPage: result.hasNextPage,
          prevPage: result.prevPage,
          nextPage: result.nextPage
        },
        searchLocation: { latitude, longitude },
        serviceAreaType
      }
    } catch (error) {
      console.error('Error finding merchants in service area:', error)
      throw new Error('Failed to find merchants in service area')
    }
  }

  /**
   * Calculate Haversine distance between two points
   */
  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Validate coordinate values
   */
  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    )
  }

  /**
   * Calculate estimated delivery time based on distance and merchant average
   */
  private calculateEstimatedDeliveryTime(distanceMeters: number, avgDeliveryTime?: number): number {
    const baseTime = avgDeliveryTime || 30 // Default 30 minutes
    const distanceKm = distanceMeters / 1000
    const additionalTime = Math.max(0, (distanceKm - 2) * 5) // Add 5 min per km after 2km
    return Math.round(baseTime + additionalTime)
  }

  /**
   * Determine service area type for a merchant and point
   */
  private determineServiceAreaType(merchant: Merchant, _point: unknown): string[] {
    const types: string[] = []
    
    // This would need actual PostGIS queries in a real implementation
    // For now, we'll use simplified logic
    if (merchant.service_area) types.push('delivery')
    if (merchant.priority_zones) types.push('priority')
    
    return types
  }

  /**
   * Check if point is in merchant's priority zone
   */
  private isPointInPriorityZone(merchant: Merchant, _point: unknown): boolean {
    // This would need actual PostGIS ST_Contains query
    // For now, return false as placeholder
    return merchant.priority_zones ? true : false
  }

  /**
   * Get performance metrics for monitoring
   */
  async getPerformanceMetrics() {
    try {
      const metrics = await this.payload.find({
        collection: 'merchants',
        where: {
          isActive: { equals: true }
        },
        limit: 0, // Just get count
      })

      return {
        totalActiveMerchants: metrics.totalDocs,
        timestamp: new Date().toISOString(),
        // Add more metrics as needed
      }
    } catch (error) {
      console.error('Error getting performance metrics:', error)
      return null
    }
  }
}

export default GeospatialService
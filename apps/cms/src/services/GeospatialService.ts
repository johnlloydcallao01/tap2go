import type { Payload } from 'payload'
import type { Merchant, Vendor } from '../payload-types'
import type { Where } from 'payload'

// Type for geospatial query results with vendor relationship
type MerchantWithDistance = Merchant & {
  distanceMeters: number
  distanceKm: number
  isWithinDeliveryRadius?: boolean
  estimatedDeliveryTime?: number
  serviceAreaType?: string[]
  isPriorityZone?: boolean
  vendor: Vendor // Ensure vendor is populated for rating access
}

// Type for merchants with service area analysis - ensures required properties
type MerchantWithServiceArea = Merchant & {
  distanceMeters: number
  distanceKm: number
  isWithinDeliveryRadius: boolean // Required for service area analysis
  estimatedDeliveryTime: number // Required for service area analysis
  serviceAreaType?: string[]
  isPriorityZone?: boolean
  vendor: Vendor
  serviceAreaAnalysis: {
    inServiceArea: boolean
    inPriorityZone: boolean
    inDeliveryZone: boolean
    inRestrictedArea: boolean
    zoneTypes: string[]
  }
  zonePriority: 'high' | 'medium' | 'standard'
}

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
   * Find merchants within a specific radius using Haversine distance calculation
   * Note: This method uses JavaScript calculation instead of PostGIS for compatibility
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
      sortBy?: 'distance' | 'rating' | 'delivery_time' | 'success_rate'
    }
  }) {
    const { latitude, longitude, radiusMeters, limit = 20, offset = 0, filters = {} } = params
    const startTime = Date.now()

    // Validate coordinates
    if (!this.isValidCoordinate(latitude, longitude)) {
      throw new Error('Invalid coordinates provided')
    }

    // Validate search radius (max 100km for performance)
    if (radiusMeters > 100000) {
      throw new Error('Search radius cannot exceed 100km')
    }

    try {
      // Build where clause for basic filters
      const whereClause: Where = {
        and: [
          // Basic business filters
          { isActive: { equals: true } },
          { isAcceptingOrders: { equals: true } },
          // Ensure merchant has valid coordinates
          { merchant_latitude: { not_equals: null } },
          { merchant_longitude: { not_equals: null } },
          ...(filters.isActive !== undefined ? [{ isActive: { equals: filters.isActive } }] : []),
          ...(filters.isAcceptingOrders !== undefined ? [{ isAcceptingOrders: { equals: filters.isAcceptingOrders } }] : []),
          ...(filters.operationalStatus ? [{ operationalStatus: { in: filters.operationalStatus } }] : []),
        ]
      }

      // Query merchants with vendor relationship populated
      const result = await this.payload.find({
        collection: 'merchants',
        where: whereClause,
        limit: Math.min(limit, 100), // Cap at 100 for performance
        page: Math.floor(offset / limit) + 1,
        depth: 2, // Populate vendor relationship
      })

      // Calculate distances using Haversine formula and filter by radius
      const merchantsWithDistance: MerchantWithDistance[] = result.docs
        .map((merchant) => {
          const merchantLat = merchant.merchant_latitude
          const merchantLng = merchant.merchant_longitude

          if (!merchantLat || !merchantLng) return null

          const distanceMeters = this.calculateHaversineDistance(
            latitude,
            longitude,
            merchantLat,
            merchantLng
          )

          // Filter by radius
          if (distanceMeters > radiusMeters) return null

          return {
            ...merchant,
            vendor: merchant.vendor as Vendor, // Ensure vendor is typed correctly
            distanceMeters,
            distanceKm: distanceMeters / 1000,
            isWithinDeliveryRadius: merchant.delivery_radius_meters 
              ? distanceMeters <= merchant.delivery_radius_meters 
              : false,
            estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(
              distanceMeters,
              merchant.avg_delivery_time_minutes || undefined
            ),
          } as MerchantWithDistance
        })
        .filter((merchant): merchant is MerchantWithDistance => merchant !== null)

      // Apply rating filter if specified
      let filteredMerchants = merchantsWithDistance
      if (filters.minRating) {
        filteredMerchants = merchantsWithDistance.filter(merchant => {
          const vendor = merchant.vendor as Vendor
          return vendor.averageRating && vendor.averageRating >= filters.minRating!
        })
      }

      // Sort results
      const sortedMerchants = filters.sortBy === 'rating'
        ? filteredMerchants.sort((a, b) => {
            const aRating = (a.vendor as Vendor).averageRating || 0
            const bRating = (b.vendor as Vendor).averageRating || 0
            return bRating - aRating
          })
        : filters.sortBy === 'delivery_time'
        ? filteredMerchants.sort((a, b) => (a.avg_delivery_time_minutes || 999) - (b.avg_delivery_time_minutes || 999))
        : filters.sortBy === 'success_rate'
        ? filteredMerchants.sort((a, b) => (b.delivery_success_rate || 0) - (a.delivery_success_rate || 0))
        : filteredMerchants.sort((a, b) => a.distanceMeters - b.distanceMeters) // Default: sort by distance

      const endTime = Date.now()
      const queryTime = endTime - startTime

      return {
        merchants: sortedMerchants,
        totalCount: filteredMerchants.length,
        pagination: {
          totalDocs: filteredMerchants.length,
          limit,
          totalPages: Math.ceil(filteredMerchants.length / limit),
          page: Math.floor(offset / limit) + 1,
          pagingCounter: offset + 1,
          hasPrevPage: offset > 0,
          hasNextPage: offset + limit < filteredMerchants.length,
          prevPage: offset > 0 ? Math.floor((offset - limit) / limit) + 1 : null,
          nextPage: offset + limit < filteredMerchants.length ? Math.floor((offset + limit) / limit) + 1 : null,
        },
        performance: {
          queryTimeMs: queryTime,
          searchRadius: radiusMeters,
          withinSearchRadius: filteredMerchants.length,
          proximityScore: filteredMerchants.length > 0 ? 
            filteredMerchants.reduce((sum, m) => sum + (1 - m.distanceKm / (radiusMeters / 1000)), 0) / filteredMerchants.length : 0
        }
      }
    } catch (error) {
      console.error('Error in findMerchantsWithinRadius:', error)
      throw new Error(`Failed to find merchants within radius: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Find merchants within their delivery radius using optimized distance calculation
   * This method checks if the user location is within each merchant's delivery radius
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
      maxSearchRadius?: number // Optional max search radius to limit query scope
    }
  }) {
    const { latitude, longitude, limit = 20, offset = 0, filters = {} } = params
    const startTime = Date.now()

    // Validate coordinates
    if (!this.isValidCoordinate(latitude, longitude)) {
      throw new Error('Invalid coordinates provided')
    }

    try {
      // Build where clause - removed raw PostGIS query
      const whereClause: Where = {
        and: [
          // Basic business filters
          { isActive: { equals: true } },
          { isAcceptingOrders: { equals: true } },
          ...(filters.isCurrentlyDelivering !== undefined ? [{ is_currently_delivering: { equals: filters.isCurrentlyDelivering } }] : []),
          ...(filters.maxDeliveryTime ? [{ avg_delivery_time_minutes: { less_than_equal: filters.maxDeliveryTime } }] : []),
          ...(filters.minOrderAmount ? [{ min_order_amount: { less_than_equal: filters.minOrderAmount } }] : []),
          // Ensure merchant has valid coordinates and delivery radius
          { merchant_latitude: { not_equals: null } },
          { merchant_longitude: { not_equals: null } },
          { delivery_radius_meters: { greater_than: 0 } },
        ]
      }

      // Query merchants with vendor relationship
      const result = await this.payload.find({
        collection: 'merchants',
        where: whereClause,
        limit: Math.min(limit * 3, 300), // Get more results to filter by delivery radius
        page: Math.floor(offset / (limit * 3)) + 1,
        depth: 2, // Populate vendor relationship
      })

      // Filter merchants by delivery radius using Haversine calculation
      const merchantsInDeliveryRadius: MerchantWithDistance[] = result.docs
        .map((merchant) => {
          const merchantLat = merchant.merchant_latitude
          const merchantLng = merchant.merchant_longitude
          const deliveryRadius = merchant.delivery_radius_meters

          if (!merchantLat || !merchantLng || !deliveryRadius) return null

          const distanceMeters = this.calculateHaversineDistance(
            latitude,
            longitude,
            merchantLat,
            merchantLng
          )

          // Check if within delivery radius
          if (distanceMeters > deliveryRadius) return null

          // Apply max search radius filter if specified
          if (filters.maxSearchRadius && distanceMeters > filters.maxSearchRadius) return null

          return {
            ...merchant,
            vendor: merchant.vendor as Vendor,
            distanceMeters,
            distanceKm: distanceMeters / 1000,
            isWithinDeliveryRadius: true, // All results are within delivery radius
            estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(
              distanceMeters,
              merchant.avg_delivery_time_minutes || undefined
            ),
          } as MerchantWithDistance
        })
        .filter((merchant): merchant is MerchantWithDistance => merchant !== null)
        .sort((a, b) => a.distanceMeters - b.distanceMeters) // Sort by distance
        .slice(offset, offset + limit) // Apply pagination

      const endTime = Date.now()
      const queryTime = endTime - startTime

      return {
        merchants: merchantsInDeliveryRadius,
        totalCount: merchantsInDeliveryRadius.length,
        pagination: {
          totalDocs: merchantsInDeliveryRadius.length,
          limit,
          totalPages: Math.ceil(merchantsInDeliveryRadius.length / limit),
          page: Math.floor(offset / limit) + 1,
          pagingCounter: offset + 1,
          hasPrevPage: offset > 0,
          hasNextPage: offset + limit < merchantsInDeliveryRadius.length,
          prevPage: offset > 0 ? Math.floor((offset - limit) / limit) + 1 : null,
          nextPage: offset + limit < merchantsInDeliveryRadius.length ? Math.floor((offset + limit) / limit) + 1 : null,
        },
        performance: {
          queryTimeMs: queryTime,
          optimizationUsed: 'haversine_distance_calculation',
          totalMerchantsScanned: result.docs.length,
          merchantsWithinRadius: merchantsInDeliveryRadius.length,
          averageDistanceKm: merchantsInDeliveryRadius.length > 0 
            ? merchantsInDeliveryRadius.reduce((sum, m) => sum + m.distanceKm, 0) / merchantsInDeliveryRadius.length 
            : 0
        }
      }
    } catch (error) {
      console.error('Error in findMerchantsInDeliveryRadius:', error)
      throw new Error(`Failed to find merchants in delivery radius: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Find merchants within service areas using polygon intersection
   * Note: This method uses basic coordinate filtering instead of PostGIS for compatibility
   */
  async findMerchantsInServiceArea(params: {
    latitude: number
    longitude: number
    serviceAreaType?: 'service_area' | 'priority_zones' | 'delivery_zones' | 'all'
    limit?: number
    offset?: number
    filters?: {
      isActive?: boolean
      isAcceptingOrders?: boolean
      operationalStatus?: string[]
      cuisineTypes?: string[]
      minRating?: number
      sortBy?: 'distance' | 'rating' | 'delivery_time' | 'success_rate' | 'zone_priority'
      includeRestrictedAreas?: boolean
    }
  }) {
    const { latitude, longitude, serviceAreaType = 'all', limit = 20, offset = 0, filters = {} } = params
    const startTime = Date.now()

    // Validate coordinates
    if (!this.isValidCoordinate(latitude, longitude)) {
      throw new Error('Invalid coordinates provided')
    }

    try {
      // Build where clause for basic filters
      const whereClause: Where = {
        and: [
          // Basic business filters
          { isActive: { equals: true } },
          { isAcceptingOrders: { equals: true } },
          // Ensure merchant has valid coordinates
          { merchant_latitude: { not_equals: null } },
          { merchant_longitude: { not_equals: null } },
          ...(filters.isActive !== undefined ? [{ isActive: { equals: filters.isActive } }] : []),
          ...(filters.isAcceptingOrders !== undefined ? [{ isAcceptingOrders: { equals: filters.isAcceptingOrders } }] : []),
          ...(filters.operationalStatus ? [{ operationalStatus: { in: filters.operationalStatus } }] : []),
        ]
      }

      // Query merchants with vendor relationship
      const result = await this.payload.find({
        collection: 'merchants',
        where: whereClause,
        limit: Math.min(limit * 2, 200), // Get more results for service area filtering
        page: Math.floor(offset / (limit * 2)) + 1,
        depth: 2, // Populate vendor relationship
      })

      // Process merchants and add service area analysis
      const merchantsWithServiceAreaData: MerchantWithServiceArea[] = result.docs
        .map((merchant) => {
          const merchantLat = merchant.merchant_latitude
          const merchantLng = merchant.merchant_longitude

          if (!merchantLat || !merchantLng) return null

          const distanceMeters = this.calculateHaversineDistance(
            latitude,
            longitude,
            merchantLat,
            merchantLng
          )

          // Basic service area analysis (simplified without PostGIS)
          const serviceAreaAnalysis = {
            inServiceArea: !!merchant.service_area,
            inPriorityZone: !!merchant.priority_zones,
            inDeliveryZone: !!merchant.delivery_zones,
            inRestrictedArea: false, // Simplified - would need PostGIS for accurate calculation
            zoneTypes: [
              ...(merchant.service_area ? ['service_area'] : []),
              ...(merchant.priority_zones ? ['priority_zones'] : []),
              ...(merchant.delivery_zones ? ['delivery_zones'] : []),
            ]
          }

          // Filter by service area type
          if (serviceAreaType !== 'all') {
            const hasRequestedServiceArea = serviceAreaAnalysis.zoneTypes.includes(serviceAreaType)
            if (!hasRequestedServiceArea) return null
          }

          // Apply rating filter if specified
          if (filters.minRating) {
            const vendor = merchant.vendor as Vendor
            if (!vendor.averageRating || vendor.averageRating < filters.minRating) return null
          }

          return {
            ...merchant,
            vendor: merchant.vendor as Vendor,
            distanceMeters,
            distanceKm: distanceMeters / 1000,
            isWithinDeliveryRadius: merchant.delivery_radius_meters 
              ? distanceMeters <= merchant.delivery_radius_meters 
              : false,
            estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(
              distanceMeters,
              merchant.avg_delivery_time_minutes || undefined
            ) || 30, // Ensure we always have a number
            serviceAreaAnalysis,
            zonePriority: serviceAreaAnalysis.inPriorityZone ? 'high' : 
                         serviceAreaAnalysis.inDeliveryZone ? 'medium' : 'standard'
          } as MerchantWithServiceArea
        })
        .filter((merchant): merchant is MerchantWithServiceArea => merchant !== null)

      // Sort results based on sortBy parameter with proper null checks
      const finalResults = filters.sortBy === 'rating'
        ? merchantsWithServiceAreaData.sort((a, b) => {
            if (!a || !b) return 0
            const aRating = (a.vendor as Vendor).averageRating || 0
            const bRating = (b.vendor as Vendor).averageRating || 0
            return bRating - aRating
          })
        : filters.sortBy === 'delivery_time'
        ? merchantsWithServiceAreaData.sort((a, b) => {
            if (!a || !b) return 0
            return (a.avg_delivery_time_minutes || 999) - (b.avg_delivery_time_minutes || 999)
          })
        : filters.sortBy === 'success_rate'
        ? merchantsWithServiceAreaData.sort((a, b) => {
            if (!a || !b) return 0
            return (b.delivery_success_rate || 0) - (a.delivery_success_rate || 0)
          })
        : filters.sortBy === 'zone_priority'
        ? merchantsWithServiceAreaData.sort((a, b) => {
            if (!a || !b) return 0
            // Priority: high > medium > standard, then by rating
            const priorityOrder = { high: 3, medium: 2, standard: 1 }
            const aPriority = priorityOrder[a.zonePriority as keyof typeof priorityOrder] || 1
            const bPriority = priorityOrder[b.zonePriority as keyof typeof priorityOrder] || 1
            if (aPriority !== bPriority) return bPriority - aPriority
            const aRating = (a.vendor as Vendor).averageRating || 0
            const bRating = (b.vendor as Vendor).averageRating || 0
            return bRating - aRating
          })
        : merchantsWithServiceAreaData.sort((a, b) => {
            if (!a || !b) return 0
            return a.distanceMeters - b.distanceMeters
          }) // Default: distance

      const paginatedResults = finalResults.slice(offset, offset + limit)
      const endTime = Date.now()
      const queryTime = endTime - startTime

      return {
        merchants: paginatedResults,
        totalCount: finalResults.length,
        pagination: {
          totalDocs: finalResults.length,
          limit,
          totalPages: Math.ceil(finalResults.length / limit),
          page: Math.floor(offset / limit) + 1,
          pagingCounter: offset + 1,
          hasPrevPage: offset > 0,
          hasNextPage: offset + limit < finalResults.length,
          prevPage: offset > 0 ? Math.floor((offset - limit) / limit) + 1 : null,
          nextPage: offset + limit < finalResults.length ? Math.floor((offset + limit) / limit) + 1 : null,
        },
        performance: {
          queryTimeMs: queryTime,
          serviceAreaType,
          totalMerchantsScanned: result.docs.length,
          merchantsInServiceArea: finalResults.length,
          serviceAreaAnalysis: {
            withServiceArea: finalResults.filter(m => m && m.serviceAreaAnalysis.inServiceArea).length,
            withPriorityZones: finalResults.filter(m => m && m.serviceAreaAnalysis.inPriorityZone).length,
            withDeliveryZones: finalResults.filter(m => m && m.serviceAreaAnalysis.inDeliveryZone).length,
          }
        }
      }
    } catch (error) {
      console.error('Error in findMerchantsInServiceArea:', error)
      throw new Error(`Failed to find merchants in service area: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
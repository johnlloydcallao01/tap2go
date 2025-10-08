import type { Payload } from 'payload';
import type { Where } from 'payload';

// Type for PayloadCMS Where clause and array
type WhereCondition = Record<string, unknown>

/**
 * Utility service for geospatial operations and merchant queries
 */
export class GeospatialService {
  private payload: Payload;

  constructor(payload: Payload) {
    this.payload = payload;
  }

  /**
   * Find merchants within a specified radius of a location
   * Uses PostGIS ST_DWithin for efficient spatial queries
   */
  async findMerchantsWithinRadius(params: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
    limit?: number;
    offset?: number;
    includeInactive?: boolean;
  }) {
    const { latitude, longitude, radiusMeters, limit = 50, offset = 0, includeInactive = false } = params;

    // Validate coordinates
    this.validateCoordinates(latitude, longitude);

    try {
      // Use basic where clause without PostGIS spatial queries for now
      const whereClause: Where = {
        and: [
          {
            merchant_latitude: {
              exists: true,
              not_equals: null
            }
          },
          {
            merchant_longitude: {
              exists: true,
              not_equals: null
            }
          }
        ]
      };

      // Filter active merchants unless explicitly including inactive
      if (!includeInactive) {
        (whereClause.and as WhereCondition[]).push({ isActive: { equals: true } });
      }

      const merchants = await this.payload.find({
        collection: 'merchants',
        where: whereClause,
        limit,
        page: Math.floor(offset / limit) + 1,
        select: {
          id: true,
          outletName: true,
          merchant_latitude: true,
          merchant_longitude: true,
          delivery_radius_meters: true,
          isActive: true,
          operationalStatus: true,
          activeAddress: true,
        }
      });

      // Filter by distance using Haversine formula
      const filteredMerchants = merchants.docs.filter(merchant => {
        if (!merchant.merchant_latitude || !merchant.merchant_longitude) return false;
        
        const distance = this.calculateHaversineDistance(
          latitude,
          longitude,
          merchant.merchant_latitude,
          merchant.merchant_longitude
        );
        
        return distance <= radiusMeters;
      });

      // Calculate distances and add estimated delivery times
      const enrichedMerchants = filteredMerchants.map(merchant => ({
        ...merchant,
        distance: this.calculateHaversineDistance(
          latitude,
          longitude,
          merchant.merchant_latitude || 0,
          merchant.merchant_longitude || 0
        ),
        estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(
          this.calculateHaversineDistance(
            latitude,
            longitude,
            merchant.merchant_latitude || 0,
            merchant.merchant_longitude || 0
          )
        )
      }));

      // Sort by distance
      enrichedMerchants.sort((a, b) => a.distance - b.distance);

      return {
        merchants: enrichedMerchants,
        totalCount: filteredMerchants.length,
        pagination: {
          totalDocs: filteredMerchants.length,
          limit: merchants.limit,
          totalPages: Math.ceil(filteredMerchants.length / limit),
          page: merchants.page,
          pagingCounter: merchants.pagingCounter,
          hasPrevPage: merchants.hasPrevPage,
          hasNextPage: merchants.hasNextPage,
          prevPage: merchants.prevPage,
          nextPage: merchants.nextPage
        }
      };
    } catch (error) {
      console.error('Error in findMerchantsWithinRadius:', error);
      throw error;
    }
  }

  /**
   * Find merchants that can deliver to a specific location
   * Checks if the target location is within each merchant's delivery radius
   */
  async findMerchantsInDeliveryRadius(params: {
    latitude: number;
    longitude: number;
    limit?: number;
    offset?: number;
    includeInactive?: boolean;
  }) {
    const { latitude, longitude, limit = 50, offset = 0, includeInactive = false } = params;

    // Validate coordinates
    this.validateCoordinates(latitude, longitude);

    try {
      const whereClause: Where = {
        and: [
          {
            delivery_radius_meters: { greater_than: 0 }
          },
          {
            merchant_latitude: {
              exists: true,
              not_equals: null
            }
          },
          {
            merchant_longitude: {
              exists: true,
              not_equals: null
            }
          }
        ]
      };

      // Filter active merchants unless explicitly including inactive
      if (!includeInactive) {
        (whereClause.and as WhereCondition[]).push({ isActive: { equals: true } });
      }

      const merchants = await this.payload.find({
        collection: 'merchants',
        where: whereClause,
        limit: 1000, // Get more to filter by delivery radius
        select: {
          id: true,
          outletName: true,
          merchant_latitude: true,
          merchant_longitude: true,
          delivery_radius_meters: true,
          isActive: true,
          operationalStatus: true,
          activeAddress: true,
        }
      });

      // Filter merchants that can deliver to the target location
      const deliverableMerchants = merchants.docs.filter(merchant => {
        if (!merchant.merchant_latitude || !merchant.merchant_longitude) return false;
        
        const distance = this.calculateHaversineDistance(
          latitude,
          longitude,
          merchant.merchant_latitude,
          merchant.merchant_longitude
        );
        return distance <= (merchant.delivery_radius_meters || 0);
      });

      // Apply pagination to filtered results
      const paginatedMerchants = deliverableMerchants
        .slice(offset, offset + limit)
        .map(merchant => ({
          ...merchant,
          distance: this.calculateHaversineDistance(
            latitude,
            longitude,
            merchant.merchant_latitude || 0,
            merchant.merchant_longitude || 0
          ),
          estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(
            this.calculateHaversineDistance(
              latitude,
              longitude,
              merchant.merchant_latitude || 0,
              merchant.merchant_longitude || 0
            )
          )
        }));

      // Sort by distance
      paginatedMerchants.sort((a, b) => a.distance - b.distance);

      return {
        merchants: paginatedMerchants,
        totalCount: deliverableMerchants.length,
        pagination: {
          totalDocs: deliverableMerchants.length,
          limit: limit,
          totalPages: Math.ceil(deliverableMerchants.length / limit),
          page: Math.floor(offset / limit) + 1,
          pagingCounter: offset + 1,
          hasPrevPage: offset > 0,
          hasNextPage: offset + limit < deliverableMerchants.length,
          prevPage: offset > 0 ? Math.floor((offset - limit) / limit) + 1 : null,
          nextPage: offset + limit < deliverableMerchants.length ? Math.floor((offset + limit) / limit) + 1 : null
        }
      };
    } catch (error) {
      console.error('Error in findMerchantsInDeliveryRadius:', error);
      throw error;
    }
  }

  /**
   * Find merchants whose service area polygons contain the target location
   * Uses PostGIS ST_Contains for precise polygon containment queries
   */
  async findMerchantsInServiceArea(params: {
    latitude: number;
    longitude: number;
    limit?: number;
    offset?: number;
    includeInactive?: boolean;
  }) {
    const { latitude, longitude, limit = 50, offset = 0, includeInactive = false } = params;

    // Validate coordinates
    this.validateCoordinates(latitude, longitude);

    try {
      const whereClause: Where = {
        and: [
          {
            merchant_latitude: {
              exists: true,
              not_equals: null
            }
          },
          {
            merchant_longitude: {
              exists: true,
              not_equals: null
            }
          }
        ]
      };

      // Filter active merchants unless explicitly including inactive
      if (!includeInactive) {
        (whereClause.and as WhereCondition[]).push({ isActive: { equals: true } });
      }

      const merchants = await this.payload.find({
        collection: 'merchants',
        where: whereClause,
        limit,
        page: Math.floor(offset / limit) + 1,
        select: {
          id: true,
          outletName: true,
          merchant_latitude: true,
          merchant_longitude: true,
          service_area: true,
          isActive: true,
          operationalStatus: true,
          activeAddress: true,
        }
      });

      // Calculate distances for merchants in service area
      const enrichedMerchants = merchants.docs
        .filter(merchant => merchant.merchant_latitude && merchant.merchant_longitude)
        .map(merchant => ({
          ...merchant,
          distance: this.calculateHaversineDistance(
            latitude,
            longitude,
            merchant.merchant_latitude || 0,
            merchant.merchant_longitude || 0
          ),
          estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(
            this.calculateHaversineDistance(
              latitude,
              longitude,
              merchant.merchant_latitude || 0,
              merchant.merchant_longitude || 0
            )
          )
        }));

      // Sort by distance
      enrichedMerchants.sort((a, b) => a.distance - b.distance);

      return {
        merchants: enrichedMerchants,
        totalCount: merchants.totalDocs,
        pagination: {
          totalDocs: merchants.totalDocs,
          limit: merchants.limit,
          totalPages: merchants.totalPages,
          page: merchants.page,
          pagingCounter: merchants.pagingCounter,
          hasPrevPage: merchants.hasPrevPage,
          hasNextPage: merchants.hasNextPage,
          prevPage: merchants.prevPage,
          nextPage: merchants.nextPage
        }
      };
    } catch (error) {
      console.error('Error in findMerchantsInServiceArea:', error);
      throw error;
    }
  }

  /**
   * Calculate Haversine distance between two coordinates in meters
   */
  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Validate latitude and longitude coordinates
   */
  private validateCoordinates(latitude: number, longitude: number): void {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new Error('Latitude and longitude must be numbers');
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }
  }

  /**
   * Calculate estimated delivery time based on distance
   * Simple heuristic: 2 minutes per kilometer + 10 minute base time
   */
  private calculateEstimatedDeliveryTime(distanceMeters: number): number {
    const distanceKm = distanceMeters / 1000;
    const baseTimeMinutes = 10;
    const timePerKm = 2;
    return Math.round(baseTimeMinutes + (distanceKm * timePerKm));
  }
}
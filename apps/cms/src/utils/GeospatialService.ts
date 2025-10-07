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
    const { latitude, longitude, radiusMeters, limit = 50, includeInactive = false } = params;

    // Validate coordinates
    this.validateCoordinates(latitude, longitude);

    const whereClause: Where = {
      and: [
        {
          merchant_coordinates: {
            near: [longitude, latitude, radiusMeters]
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

    // Calculate distances and add estimated delivery times
    const enrichedMerchants = merchants.docs.map(merchant => ({
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

    return {
      merchants: enrichedMerchants,
      totalCount: merchants.totalDocs,
      hasNextPage: merchants.hasNextPage,
      hasPrevPage: merchants.hasPrevPage,
      page: merchants.page,
      totalPages: merchants.totalPages
    };
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
    const { latitude, longitude, limit = 50, offset: _offset = 0, includeInactive = false } = params;

    // Validate coordinates
    this.validateCoordinates(latitude, longitude);

    const whereClause: Where = {
      and: [
        {
          delivery_radius_meters: { greater_than: 0 }
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
      const distance = this.calculateHaversineDistance(
        latitude,
        longitude,
        merchant.merchant_latitude || 0,
        merchant.merchant_longitude || 0
      );
      return distance <= (merchant.delivery_radius_meters || 0);
    });

    // Apply pagination to filtered results
    const paginatedMerchants = deliverableMerchants
      .slice(_offset, _offset + limit)
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

    return {
      merchants: paginatedMerchants,
      totalCount: deliverableMerchants.length,
      hasNextPage: (_offset + limit) < deliverableMerchants.length,
      hasPrevPage: _offset > 0,
      page: Math.floor(_offset / limit) + 1,
      totalPages: Math.ceil(deliverableMerchants.length / limit)
    };
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
    const { latitude, longitude, limit = 50, offset: _offset = 0, includeInactive = false } = params;

    // Validate coordinates
    this.validateCoordinates(latitude, longitude);

    const whereClause: Where = {
      and: [
        {
          service_area: { exists: true }
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
    const enrichedMerchants = merchants.docs.map(merchant => ({
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

    return {
      merchants: enrichedMerchants,
      totalCount: merchants.totalDocs,
      hasNextPage: merchants.hasNextPage,
      hasPrevPage: merchants.hasPrevPage,
      page: merchants.page,
      totalPages: merchants.totalPages
    };
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
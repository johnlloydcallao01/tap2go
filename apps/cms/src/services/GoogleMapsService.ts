import axios from 'axios'
import {
  Client,
  DistanceMatrixRequest,
  DistanceMatrixResponse,
  TravelMode,
  UnitSystem,
  TrafficModel,
} from '@googlemaps/google-maps-services-js'

// Define Google Maps API response types
interface GoogleMapsAddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

export interface GoogleMapsGeocodingResult {
  formatted_address: string
  google_place_id: string
  latitude: number
  longitude: number
  address_components: {
    street_number?: string
    route?: string
    subpremise?: string
    barangay?: string
    locality?: string
    administrative_area_level_2?: string
    administrative_area_level_1?: string
    country?: string
    postal_code?: string
  }
  geocoding_accuracy: 'ROOFTOP' | 'RANGE_INTERPOLATED' | 'GEOMETRIC_CENTER' | 'APPROXIMATE'
  address_quality_score: number
}

export interface DistanceResult {
  distance: number; // Distance in meters
  duration: number; // Duration in seconds
  status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' | 'MAX_ROUTE_LENGTH_EXCEEDED' | 'INVALID_REQUEST' | 'OVER_DAILY_LIMIT' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export class GoogleMapsService {
  private apiKey: string
  private baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
  private distanceMatrixClient: Client

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || ''
    this.distanceMatrixClient = new Client({})
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured. Geocoding and distance calculation will not work.')
    }
  }

  /**
   * Geocode a raw address string using Google Maps Geocoding API
   */
  async geocodeAddress(address: string): Promise<GoogleMapsGeocodingResult | null> {
    if (!this.apiKey) {
      console.error('Google Maps API key not configured')
      return null
    }

    if (!address || address.trim().length === 0) {
      console.error('Address is required for geocoding')
      return null
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          address: address.trim(),
          key: this.apiKey,
          region: 'ph', // Bias results to Philippines
          language: 'en', // Return results in English
        },
        timeout: 10000, // 10 second timeout
      })

      if (response.data.status !== 'OK') {
        console.error('Google Maps Geocoding API error:', response.data.status, response.data.error_message)
        return null
      }

      const result = response.data.results[0]
      if (!result) {
        console.error('No geocoding results found for address:', address)
        return null
      }

      // Parse address components
      const addressComponents = this.parseAddressComponents(result.address_components)

      // Calculate quality score based on accuracy and completeness
      const qualityScore = this.calculateQualityScore(result.geometry.location_type, addressComponents)

      return {
        formatted_address: result.formatted_address,
        google_place_id: result.place_id,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        address_components: addressComponents,
        geocoding_accuracy: this.mapLocationType(result.geometry.location_type),
        address_quality_score: qualityScore,
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
      return null
    }
  }

  /**
   * Reverse geocode coordinates to get address information
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<GoogleMapsGeocodingResult | null> {
    if (!this.apiKey) {
      console.error('Google Maps API key not configured')
      return null
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: this.apiKey,
          language: 'en',
        },
        timeout: 10000,
      })

      if (response.data.status !== 'OK') {
        console.error('Google Maps Reverse Geocoding API error:', response.data.status)
        return null
      }

      const result = response.data.results[0]
      if (!result) {
        return null
      }

      const addressComponents = this.parseAddressComponents(result.address_components)
      const qualityScore = this.calculateQualityScore(result.geometry.location_type, addressComponents)

      return {
        formatted_address: result.formatted_address,
        google_place_id: result.place_id,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        address_components: addressComponents,
        geocoding_accuracy: this.mapLocationType(result.geometry.location_type),
        address_quality_score: qualityScore,
      }
    } catch (error) {
      console.error('Error reverse geocoding coordinates:', error)
      return null
    }
  }

  /**
   * Parse Google Maps address components into our schema format
   */
  private parseAddressComponents(components: GoogleMapsAddressComponent[]): GoogleMapsGeocodingResult['address_components'] {
    const parsed: GoogleMapsGeocodingResult['address_components'] = {}

    for (const component of components) {
      const types = component.types

      if (types.includes('street_number')) {
        parsed.street_number = component.long_name
      } else if (types.includes('route')) {
        parsed.route = component.long_name
      } else if (types.includes('subpremise')) {
        parsed.subpremise = component.long_name
      } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
        parsed.barangay = component.long_name
      } else if (types.includes('locality')) {
        parsed.locality = component.long_name
      } else if (types.includes('administrative_area_level_2')) {
        parsed.administrative_area_level_2 = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        parsed.administrative_area_level_1 = component.long_name
      } else if (types.includes('country')) {
        parsed.country = component.long_name
      } else if (types.includes('postal_code')) {
        parsed.postal_code = component.long_name
      }
    }

    return parsed
  }

  /**
   * Map Google's location_type to our geocoding_accuracy enum
   */
  private mapLocationType(locationType: string): GoogleMapsGeocodingResult['geocoding_accuracy'] {
    switch (locationType) {
      case 'ROOFTOP':
        return 'ROOFTOP'
      case 'RANGE_INTERPOLATED':
        return 'RANGE_INTERPOLATED'
      case 'GEOMETRIC_CENTER':
        return 'GEOMETRIC_CENTER'
      case 'APPROXIMATE':
      default:
        return 'APPROXIMATE'
    }
  }

  /**
   * Calculate address quality score (1-100) based on accuracy and completeness
   */
  private calculateQualityScore(
    locationType: string,
    addressComponents: GoogleMapsGeocodingResult['address_components']
  ): number {
    let score = 0

    // Base score from location accuracy
    switch (locationType) {
      case 'ROOFTOP':
        score += 50
        break
      case 'RANGE_INTERPOLATED':
        score += 40
        break
      case 'GEOMETRIC_CENTER':
        score += 30
        break
      case 'APPROXIMATE':
      default:
        score += 20
        break
    }

    // Bonus points for address component completeness
    const components = [
      'street_number',
      'route',
      'barangay',
      'locality',
      'administrative_area_level_1',
      'country',
      'postal_code',
    ]

    const completedComponents = components.filter(
      (component) => addressComponents[component as keyof typeof addressComponents]
    ).length

    score += (completedComponents / components.length) * 50

    return Math.min(Math.round(score), 100)
  }

  /**
   * Validate if the API key is configured and working
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false
    }

    try {
      // Test with a simple geocoding request
      const response = await axios.get(this.baseUrl, {
        params: {
          address: 'Manila, Philippines',
          key: this.apiKey,
        },
        timeout: 5000,
      })

      return response.data.status === 'OK'
    } catch (error) {
      console.error('Google Maps API key validation failed:', error)
      return false
    }
  }

  /**
   * Calculate real-world driving distance between two points using Google Maps Distance Matrix API
   * @param origin Starting point coordinates
   * @param destination Ending point coordinates
   * @returns Promise<DistanceResult> Distance and duration information
   */
  async calculateDrivingDistance(
    origin: LocationCoordinates,
    destination: LocationCoordinates
  ): Promise<DistanceResult> {
    if (!this.apiKey) {
      console.error('Google Maps API key not configured')
      return {
        distance: 0,
        duration: 0,
        status: 'REQUEST_DENIED',
      }
    }

    try {
      const request: DistanceMatrixRequest = {
        params: {
          key: this.apiKey,
          origins: [`${origin.latitude},${origin.longitude}`],
          destinations: [`${destination.latitude},${destination.longitude}`],
          mode: TravelMode.driving, // Use driving mode for motor vehicle distances
          units: UnitSystem.metric, // Use metric units (meters/seconds)
          avoid: [], // No restrictions by default
          traffic_model: TrafficModel.best_guess, // Use best guess for traffic
        },
        timeout: 10000, // 10 second timeout
      };

      const response: DistanceMatrixResponse = await this.distanceMatrixClient.distancematrix(request);
      
      if (response.data.status !== 'OK') {
        console.error(`Google Maps Distance Matrix API error: ${response.data.status}`);
        return {
          distance: 0,
          duration: 0,
          status: 'UNKNOWN_ERROR',
        };
      }

      const element = response.data.rows[0]?.elements[0];
      
      if (!element) {
        console.error('No route data returned from Google Maps Distance Matrix API');
        return {
          distance: 0,
          duration: 0,
          status: 'UNKNOWN_ERROR',
        };
      }

      return {
        distance: element.distance?.value || 0, // Distance in meters
        duration: element.duration?.value || 0, // Duration in seconds
        status: element.status as DistanceResult['status'],
      };
    } catch (error) {
      console.error('Error calculating driving distance:', error);
      
      // Return error result
      return {
        distance: 0,
        duration: 0,
        status: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Calculate driving distances from one origin to multiple destinations
   * @param origin Starting point coordinates
   * @param destinations Array of destination coordinates
   * @returns Promise<DistanceResult[]> Array of distance results
   */
  async calculateMultipleDistances(
    origin: LocationCoordinates,
    destinations: LocationCoordinates[]
  ): Promise<DistanceResult[]> {
    if (!this.apiKey) {
      console.error('Google Maps API key not configured')
      return destinations.map(() => ({
        distance: 0,
        duration: 0,
        status: 'REQUEST_DENIED' as const,
      }))
    }

    try {
      if (destinations.length === 0) {
        return [];
      }

      // Google Maps API has a limit of 25 destinations per request
      const maxDestinations = 25;
      const results: DistanceResult[] = [];

      // Process destinations in batches
      for (let i = 0; i < destinations.length; i += maxDestinations) {
        const batch = destinations.slice(i, i + maxDestinations);
        
        const request: DistanceMatrixRequest = {
          params: {
            key: this.apiKey,
            origins: [`${origin.latitude},${origin.longitude}`],
            destinations: batch.map(dest => `${dest.latitude},${dest.longitude}`),
            mode: TravelMode.driving,
            units: UnitSystem.metric,
            avoid: [],
            traffic_model: TrafficModel.best_guess,
          },
          timeout: 15000, // 15 second timeout for batch requests
        };

        const response: DistanceMatrixResponse = await this.distanceMatrixClient.distancematrix(request);
        
        if (response.data.status !== 'OK') {
          console.error(`Google Maps Distance Matrix API batch error: ${response.data.status}`);
          // Add error results for this batch
          const errorResults = batch.map(() => ({
            distance: 0,
            duration: 0,
            status: 'UNKNOWN_ERROR' as const,
          }));
          results.push(...errorResults);
          continue;
        }

        const elements = response.data.rows[0]?.elements || [];
        
        for (const element of elements) {
          results.push({
            distance: element.distance?.value || 0,
            duration: element.duration?.value || 0,
            status: (element.status as DistanceResult['status']) || 'UNKNOWN_ERROR',
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error calculating multiple distances:', error);
      
      // Return error results for all destinations
      return destinations.map(() => ({
        distance: 0,
        duration: 0,
        status: 'UNKNOWN_ERROR' as const,
      }));
    }
  }

  /**
   * Fallback to Haversine formula for basic distance calculation
   * Used when Google Maps API is unavailable or returns errors
   * @param origin Starting point coordinates
   * @param destination Ending point coordinates
   * @returns Distance in meters (straight-line distance)
   */
  static calculateHaversineDistance(
    origin: LocationCoordinates,
    destination: LocationCoordinates
  ): number {
    const R = 6371000; // Earth's radius in meters
    const lat1Rad = (origin.latitude * Math.PI) / 180;
    const lat2Rad = (destination.latitude * Math.PI) / 180;
    const deltaLatRad = ((destination.latitude - origin.latitude) * Math.PI) / 180;
    const deltaLngRad = ((destination.longitude - origin.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate distance with automatic fallback to Haversine if Google Maps fails
   * @param origin Starting point coordinates
   * @param destination Ending point coordinates
   * @returns Promise<DistanceResult> Distance result with fallback support
   */
  async calculateDistanceWithFallback(
    origin: LocationCoordinates,
    destination: LocationCoordinates
  ): Promise<DistanceResult> {
    // Try Google Maps API first
    const googleResult = await this.calculateDrivingDistance(origin, destination);
    
    if (googleResult.status === 'OK' && googleResult.distance > 0) {
      return googleResult;
    }

    // Fallback to Haversine distance
    console.warn('Google Maps Distance Matrix API failed, falling back to Haversine distance calculation');
    const haversineDistance = GoogleMapsService.calculateHaversineDistance(origin, destination);
    
    return {
      distance: haversineDistance,
      duration: Math.round(haversineDistance / 13.89), // Approximate driving time (50 km/h average)
      status: 'OK',
    };
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService()
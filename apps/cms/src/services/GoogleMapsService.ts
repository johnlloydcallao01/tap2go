import axios from 'axios'
import {
  Client,
} from '@googlemaps/google-maps-services-js'

// Routes API v2 types for TWO_WHEELER support
interface RouteMatrixRequest {
  origins: Array<{
    waypoint: {
      location: {
        latLng: {
          latitude: number
          longitude: number
        }
      }
    }
  }>
  destinations: Array<{
    waypoint: {
      location: {
        latLng: {
          latitude: number
          longitude: number
        }
      }
    }
  }>
  travelMode: string
  routingPreference: string
  units: string
}

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

export interface TwoWheelerRouteResult {
  coordinates: LocationCoordinates[];
  distanceMeters: number;
  durationSeconds: number;
}

function decodeEncodedPolyline(encoded: string): LocationCoordinates[] {
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  const coordinates: LocationCoordinates[] = [];

  const readDelta = () => {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      if (index >= encoded.length || shift > 30) {
        throw new Error('Invalid encoded route polyline')
      }

      byte = encoded.charCodeAt(index++) - 63;
      if (byte < 0 || byte > 63) {
        throw new Error('Invalid encoded route polyline')
      }

      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    return result & 1 ? ~(result >> 1) : result >> 1;
  };

  while (index < encoded.length) {
    latitude += readDelta();
    longitude += readDelta();
    coordinates.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
  }

  if (coordinates.length < 2) {
    throw new Error('Google Routes API returned an incomplete route polyline')
  }

  return coordinates;
}

export class GoogleMapsService {
  private apiKey: string
  private baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json'
  private routesApiUrl = 'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix'
  private computeRoutesApiUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes'
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
   * Get a road-following motorcycle route and its high-quality map geometry.
   */
  async calculateTwoWheelerRoute(
    origin: LocationCoordinates,
    destination: LocationCoordinates,
  ): Promise<TwoWheelerRouteResult> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key is not configured')
    }

    const response = await axios.post<{
      routes?: Array<{
        distanceMeters?: number;
        duration?: string;
        polyline?: { encodedPolyline?: string };
      }>;
    }>(
      this.computeRoutesApiUrl,
      {
        origin: {
          location: {
            latLng: {
              latitude: origin.latitude,
              longitude: origin.longitude,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          },
        },
        travelMode: 'TWO_WHEELER',
        polylineQuality: 'HIGH_QUALITY',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask':
            'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
        },
        timeout: 10000,
      },
    );

    const route = response.data.routes?.[0];
    const encodedPolyline = route?.polyline?.encodedPolyline;
    if (!encodedPolyline) {
      throw new Error('Google Routes API returned no two-wheeler route')
    }

    if (
      typeof route.distanceMeters !== 'number' ||
      !Number.isFinite(route.distanceMeters) ||
      route.distanceMeters < 0
    ) {
      throw new Error('Google Routes API returned an invalid route distance')
    }

    if (!route.duration || !/^\d+s$/.test(route.duration)) {
      throw new Error('Google Routes API returned an invalid route duration')
    }

    return {
      coordinates: decodeEncodedPolyline(encodedPolyline),
      distanceMeters: route.distanceMeters,
      durationSeconds: Number.parseInt(route.duration.replace(/s$/, ''), 10),
    };
  }

  /**
   * Calculate real-world two-wheeler distance between two points using Google Routes API v2
   * Uses TWO_WHEELER travel mode for accurate motorcycle delivery distance calculations
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
      const requestBody: RouteMatrixRequest = {
        origins: [{
          waypoint: {
            location: {
              latLng: {
                latitude: origin.latitude,
                longitude: origin.longitude
              }
            }
          }
        }],
        destinations: [{
          waypoint: {
            location: {
              latLng: {
                latitude: destination.latitude,
                longitude: destination.longitude
              }
            }
          }
        }],
        travelMode: 'TWO_WHEELER', // Use TWO_WHEELER mode for motorcycle delivery
        routingPreference: 'TRAFFIC_AWARE',
        units: 'METRIC'
      };

      const response = await axios.post(this.routesApiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status,condition'
        },
        timeout: 10000, // 10 second timeout
      });

      if (!response.data) {
        console.error('No route data returned from Google Routes API');
        return {
          distance: 0,
          duration: 0,
          status: 'UNKNOWN_ERROR',
        };
      }

      // Handle single route response (API returns an object for single destination)
      const element = response.data;
      
      if (!element) {
        console.error('No route element returned from Google Routes API');
        return {
          distance: 0,
          duration: 0,
          status: 'UNKNOWN_ERROR',
        };
      }

      // Parse duration from string format (e.g., "139s") to seconds
      const durationInSeconds = element.duration ? parseInt(element.duration.replace('s', '')) : 0;

      return {
        distance: element.distanceMeters || 0, // Distance in meters
        duration: durationInSeconds, // Duration in seconds
        status: element.condition === 'ROUTE_EXISTS' ? 'OK' : 'NOT_FOUND',
      };
    } catch (error) {
      console.error('Error calculating two-wheeler distance:', error);
      
      // Return error result
      return {
        distance: 0,
        duration: 0,
        status: 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Calculate two-wheeler distances from one origin to multiple destinations using Google Routes API v2
   * Uses TWO_WHEELER travel mode for accurate motorcycle delivery distance calculations
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

      // Routes API v2 has a limit of 625 route elements (origins × destinations)
      // For single origin, this means up to 625 destinations per request
      const maxDestinations = 625;
      const results: DistanceResult[] = [];

      // Process destinations in batches
      for (let i = 0; i < destinations.length; i += maxDestinations) {
        const batch = destinations.slice(i, i + maxDestinations);
        
        const requestBody: RouteMatrixRequest = {
          origins: [{
            waypoint: {
              location: {
                latLng: {
                  latitude: origin.latitude,
                  longitude: origin.longitude
                }
              }
            }
          }],
          destinations: batch.map(dest => ({
            waypoint: {
              location: {
                latLng: {
                  latitude: dest.latitude,
                  longitude: dest.longitude
                }
              }
            }
          })),
          travelMode: 'TWO_WHEELER', // Use TWO_WHEELER mode for motorcycle delivery
          routingPreference: 'TRAFFIC_AWARE',
          units: 'METRIC'
        };

        const response = await axios.post(this.routesApiUrl, requestBody, {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status,condition'
          },
          timeout: 15000, // 15 second timeout for batch requests
        });
        
        if (!response.data) {
          console.error('No response data from Google Routes API batch request');
          // Add error results for this batch
          const errorResults = batch.map(() => ({
            distance: 0,
            duration: 0,
            status: 'UNKNOWN_ERROR' as const,
          }));
          results.push(...errorResults);
          continue;
        }

        // Handle both single object and array responses
        // For single destination, API returns an object; for multiple destinations, it returns an array
        const responseElements = Array.isArray(response.data) ? response.data : [response.data];

        // Process each element in the response
        for (const element of responseElements) {
          // Parse duration from string format (e.g., "139s") to seconds
          const durationInSeconds = element.duration ? parseInt(element.duration.replace('s', '')) : 0;
          
          results.push({
            distance: element.distanceMeters || 0,
            duration: durationInSeconds,
            status: element.condition === 'ROUTE_EXISTS' ? 'OK' : 'NOT_FOUND',
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error calculating multiple two-wheeler distances:', error);
      
      // Return error results for all destinations
      return destinations.map(() => ({
        distance: 0,
        duration: 0,
        status: 'UNKNOWN_ERROR' as const,
      }));
    }
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService()
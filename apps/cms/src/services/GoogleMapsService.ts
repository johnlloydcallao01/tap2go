import axios from 'axios'

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

export class GoogleMapsService {
  private apiKey: string
  private baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json'

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured. Geocoding will not work.')
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
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService()
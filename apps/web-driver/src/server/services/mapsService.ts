// Google Maps Backend Service for Tap2Go Platform
// Handles server-side Google Maps operations using backend API key

/// <reference types="google.maps" />

import {
  Coordinates,
  GeocodeResult,
  DistanceResult,
  RouteInfo,
  DeliveryCalculation
} from '@/lib/maps/types';
import {
  calculateDeliveryInfo,
  handleGoogleMapsError,
  createMapsError,
  isValidPhilippinesCoordinates
} from '@/lib/maps/utils';
import { GEOCODING_CONFIG, DISTANCE_CONFIG } from '@/lib/maps/constants';

// Get backend API key from environment
const BACKEND_API_KEY = process.env.MAPS_BACKEND_KEY;

if (!BACKEND_API_KEY) {
  throw new Error('MAPS_BACKEND_KEY environment variable is required');
}

// ===== GEOCODING SERVICES =====

/**
 * Geocodes an address to coordinates using Google Geocoding API
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&region=${GEOCODING_CONFIG.REGION}&key=${BACKEND_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw handleGoogleMapsError(data.status);
    }
    
    if (!data.results || data.results.length === 0) {
      throw createMapsError('NOT_FOUND', 'Address not found');
    }
    
    const result = data.results[0];
    const coordinates: Coordinates = {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng
    };
    
    // Validate coordinates are in Philippines
    if (!isValidPhilippinesCoordinates(coordinates)) {
      throw createMapsError('INVALID_REQUEST', 'Address must be in Philippines');
    }
    
    return {
      coordinates,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      addressComponents: result.address_components.map((component: google.maps.GeocoderAddressComponent) => ({
        longName: component.long_name,
        shortName: component.short_name,
        types: component.types
      })),
      types: result.types
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error; // Re-throw MapsError
    }
    throw createMapsError('GEOCODING_FAILED', 'Failed to geocode address', error as Record<string, unknown>);
  }
}

/**
 * Reverse geocodes coordinates to address
 */
export async function reverseGeocode(coordinates: Coordinates): Promise<GeocodeResult> {
  try {
    if (!isValidPhilippinesCoordinates(coordinates)) {
      throw createMapsError('INVALID_REQUEST', 'Coordinates must be in Philippines');
    }
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${BACKEND_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw handleGoogleMapsError(data.status);
    }
    
    if (!data.results || data.results.length === 0) {
      throw createMapsError('NOT_FOUND', 'No address found for coordinates');
    }
    
    const result = data.results[0];
    
    return {
      coordinates,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      addressComponents: result.address_components.map((component: google.maps.GeocoderAddressComponent) => ({
        longName: component.long_name,
        shortName: component.short_name,
        types: component.types
      })),
      types: result.types
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    throw createMapsError('GEOCODING_FAILED', 'Failed to reverse geocode coordinates', error as Record<string, unknown>);
  }
}

// ===== DISTANCE SERVICES =====

/**
 * Calculates distance and duration between two points
 */
export async function calculateDistance(
  origin: Coordinates,
  destination: Coordinates
): Promise<DistanceResult> {
  try {
    const originStr = `${origin.lat},${origin.lng}`;
    const destinationStr = `${destination.lat},${destination.lng}`;
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&mode=${DISTANCE_CONFIG.TRAVEL_MODE}&units=${DISTANCE_CONFIG.UNIT_SYSTEM}&key=${BACKEND_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw handleGoogleMapsError(data.status);
    }
    
    const element = data.rows[0]?.elements[0];
    if (!element || element.status !== 'OK') {
      throw createMapsError('NOT_FOUND', 'Route not found');
    }
    
    return {
      distance: element.distance,
      duration: element.duration,
      status: element.status
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    throw createMapsError('DISTANCE_CALCULATION_FAILED', 'Failed to calculate distance', error as Record<string, unknown>);
  }
}

/**
 * Calculates distances from one origin to multiple destinations
 */
export async function calculateDistanceMatrix(
  origin: Coordinates,
  destinations: Coordinates[]
): Promise<DistanceResult[]> {
  try {
    if (destinations.length > DISTANCE_CONFIG.MAX_ELEMENTS) {
      throw createMapsError('INVALID_REQUEST', `Too many destinations. Maximum ${DISTANCE_CONFIG.MAX_ELEMENTS} allowed`);
    }
    
    const originStr = `${origin.lat},${origin.lng}`;
    const destinationsStr = destinations
      .map(dest => `${dest.lat},${dest.lng}`)
      .join('|');
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationsStr}&mode=${DISTANCE_CONFIG.TRAVEL_MODE}&units=${DISTANCE_CONFIG.UNIT_SYSTEM}&key=${BACKEND_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw handleGoogleMapsError(data.status);
    }
    
    const elements = data.rows[0]?.elements || [];
    return elements.map((element: google.maps.DistanceMatrixResponseElement) => ({
      distance: element.distance || { text: 'N/A', value: 0 },
      duration: element.duration || { text: 'N/A', value: 0 },
      status: element.status
    }));
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    throw createMapsError('DISTANCE_CALCULATION_FAILED', 'Failed to calculate distance matrix', error as Record<string, unknown>);
  }
}

// ===== DIRECTIONS SERVICES =====

/**
 * Gets directions between two points
 */
export async function getDirections(
  origin: Coordinates,
  destination: Coordinates,
  waypoints?: Coordinates[]
): Promise<RouteInfo> {
  try {
    const originStr = `${origin.lat},${origin.lng}`;
    const destinationStr = `${destination.lat},${destination.lng}`;
    
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&mode=${DISTANCE_CONFIG.TRAVEL_MODE}&key=${BACKEND_API_KEY}`;
    
    if (waypoints && waypoints.length > 0) {
      if (waypoints.length > DISTANCE_CONFIG.MAX_WAYPOINTS) {
        throw createMapsError('INVALID_REQUEST', `Too many waypoints. Maximum ${DISTANCE_CONFIG.MAX_WAYPOINTS} allowed`);
      }
      
      const waypointsStr = waypoints
        .map(wp => `${wp.lat},${wp.lng}`)
        .join('|');
      url += `&waypoints=${waypointsStr}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw handleGoogleMapsError(data.status);
    }
    
    if (!data.routes || data.routes.length === 0) {
      throw createMapsError('NOT_FOUND', 'No route found');
    }
    
    const route = data.routes[0];
    const leg = route.legs[0];
    
    return {
      distance: leg.distance,
      duration: leg.duration,
      polyline: route.overview_polyline.points,
      steps: leg.steps.map((step: google.maps.DirectionsStep) => ({
        distance: step.distance,
        duration: step.duration,
        startLocation: {
          lat: step.start_location.lat,
          lng: step.start_location.lng
        },
        endLocation: {
          lat: step.end_location.lat,
          lng: step.end_location.lng
        },
        instructions: step.instructions?.replace(/<[^>]*>/g, '') || '', // Strip HTML
        polyline: step.polyline?.points || ''
      })),
      bounds: {
        northeast: {
          lat: route.bounds.northeast.lat,
          lng: route.bounds.northeast.lng
        },
        southwest: {
          lat: route.bounds.southwest.lat,
          lng: route.bounds.southwest.lng
        }
      }
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      throw error;
    }
    throw createMapsError('DISTANCE_CALCULATION_FAILED', 'Failed to get directions', error as Record<string, unknown>);
  }
}

// ===== DELIVERY SERVICES =====

/**
 * Calculates complete delivery information including fees and time
 */
export async function calculateDeliveryDetails(
  restaurantLocation: Coordinates,
  deliveryLocation: Coordinates,
  restaurantRadius?: number
): Promise<DeliveryCalculation> {
  try {
    // Get accurate distance from Google Maps
    const distanceResult = await calculateDistance(restaurantLocation, deliveryLocation);
    const distanceInKm = distanceResult.distance.value / 1000;
    
    // Calculate delivery info using the accurate distance
    const deliveryInfo = calculateDeliveryInfo(
      restaurantLocation,
      deliveryLocation,
      restaurantRadius
    );
    
    // Override with Google Maps distance for accuracy
    return {
      ...deliveryInfo,
      distance: distanceInKm,
      estimatedTime: Math.round(distanceResult.duration.value / 60) // Convert to minutes
    };
  } catch (error) {
    // Fallback to Haversine calculation if Google Maps fails
    console.warn('Google Maps distance calculation failed, using fallback:', error);
    return calculateDeliveryInfo(restaurantLocation, deliveryLocation, restaurantRadius);
  }
}

/**
 * Finds nearby restaurants within delivery radius
 */
export async function findNearbyRestaurants(
  customerLocation: Coordinates,
  radiusKm: number = 10
): Promise<Coordinates[]> {
  // This would typically query your restaurant database
  // For now, returning empty array as placeholder
  // Implementation would involve:
  // 1. Query Firestore for restaurants within bounds
  // 2. Calculate distances to each restaurant
  // 3. Filter by radius
  // 4. Return restaurant coordinates

  console.log(`Finding restaurants near ${customerLocation.lat}, ${customerLocation.lng} within ${radiusKm}km`);
  return [];
}

// ===== VALIDATION SERVICES =====

/**
 * Validates if an address is within serviceable area
 */
export async function validateServiceableAddress(address: string): Promise<{
  isServiceable: boolean;
  coordinates?: Coordinates;
  formattedAddress?: string;
  reason?: string;
}> {
  try {
    const geocodeResult = await geocodeAddress(address);
    
    // Check if coordinates are in Philippines
    if (!isValidPhilippinesCoordinates(geocodeResult.coordinates)) {
      return {
        isServiceable: false,
        reason: 'Address is outside our service area (Philippines only)'
      };
    }
    
    return {
      isServiceable: true,
      coordinates: geocodeResult.coordinates,
      formattedAddress: geocodeResult.formattedAddress
    };
  } catch (error) {
    return {
      isServiceable: false,
      reason: error instanceof Error ? error.message : 'Unable to validate address'
    };
  }
}

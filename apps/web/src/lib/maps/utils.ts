// Google Maps Utility Functions for Tap2Go Platform

import {
  Coordinates,
  MapAddress,
  DeliveryCalculation,
  MapsError
} from './types';
import {
  DELIVERY_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES
} from './constants';

// ===== COORDINATE UTILITIES =====

/**
 * Validates if coordinates are within Philippines bounds
 */
export function isValidPhilippinesCoordinates(coordinates: Coordinates): boolean {
  const { lat, lng } = coordinates;
  const bounds = VALIDATION_RULES.COORDINATE_BOUNDS;
  
  return (
    lat >= bounds.LAT_MIN &&
    lat <= bounds.LAT_MAX &&
    lng >= bounds.LNG_MIN &&
    lng <= bounds.LNG_MAX
  );
}

/**
 * Calculates distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  origin: Coordinates,
  destination: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(origin.lat)) * 
    Math.cos(toRadians(destination.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Formats distance for display
 */
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    return `${Math.round(distanceInKm * 1000)}m`;
  }
  return `${distanceInKm.toFixed(1)}km`;
}

/**
 * Formats duration for display
 */
export function formatDuration(durationInMinutes: number): string {
  if (durationInMinutes < 60) {
    return `${Math.round(durationInMinutes)} min`;
  }
  
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = Math.round(durationInMinutes % 60);
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}

// ===== DELIVERY CALCULATIONS =====

/**
 * Calculates delivery fee based on distance
 */
export function calculateDeliveryFee(distanceInKm: number): number {
  const { BASE_FEE, PER_KM_FEE, MIN_FEE, MAX_FEE } = DELIVERY_CONFIG;
  
  let fee = BASE_FEE + (distanceInKm * PER_KM_FEE);
  
  // Apply min/max constraints
  fee = Math.max(fee, MIN_FEE);
  fee = Math.min(fee, MAX_FEE);
  
  return Math.round(fee);
}

/**
 * Estimates delivery time based on distance
 */
export function estimateDeliveryTime(distanceInKm: number): number {
  const { DELIVERY_TIME_PER_KM, BASE_DELIVERY_TIME } = DELIVERY_CONFIG;
  return BASE_DELIVERY_TIME + (distanceInKm * DELIVERY_TIME_PER_KM);
}

/**
 * Checks if delivery is within allowed radius
 */
export function isWithinDeliveryRadius(
  restaurantLocation: Coordinates,
  deliveryLocation: Coordinates,
  maxRadius: number = DELIVERY_CONFIG.DEFAULT_RADIUS
): boolean {
  const distance = calculateDistance(restaurantLocation, deliveryLocation);
  return distance <= maxRadius;
}

/**
 * Calculates complete delivery information
 */
export function calculateDeliveryInfo(
  origin: Coordinates,
  destination: Coordinates,
  restaurantRadius?: number
): DeliveryCalculation {
  const distance = calculateDistance(origin, destination);
  const estimatedTime = estimateDeliveryTime(distance);
  const baseFee = DELIVERY_CONFIG.BASE_FEE;
  const distanceFee = distance * DELIVERY_CONFIG.PER_KM_FEE;
  const totalFee = calculateDeliveryFee(distance);
  const maxRadius = restaurantRadius || DELIVERY_CONFIG.DEFAULT_RADIUS;
  
  return {
    distance,
    estimatedTime,
    baseFee,
    distanceFee,
    totalFee,
    isWithinZone: distance <= maxRadius
  };
}

// ===== ADDRESS UTILITIES =====

/**
 * Formats address for display
 */
export function formatAddress(address: MapAddress): string {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.country
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Extracts city from formatted address
 */
export function extractCityFromAddress(formattedAddress: string): string {
  // Common patterns for Philippine addresses
  const cityPatterns = [
    /,\s*([^,]+),\s*Metro Manila/i,
    /,\s*([^,]+),\s*Philippines/i,
    /,\s*([^,]+)\s+City/i
  ];
  
  for (const pattern of cityPatterns) {
    const match = formattedAddress.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return 'Metro Manila';
}

/**
 * Validates address string
 */
export function isValidAddress(address: string): boolean {
  const { MIN_ADDRESS_LENGTH, MAX_ADDRESS_LENGTH } = VALIDATION_RULES;
  return (
    address.length >= MIN_ADDRESS_LENGTH &&
    address.length <= MAX_ADDRESS_LENGTH &&
    /[a-zA-Z]/.test(address) // Contains at least one letter
  );
}

// ===== SEARCH UTILITIES =====

/**
 * Validates search query
 */
export function isValidSearchQuery(query: string): boolean {
  const { MIN_SEARCH_LENGTH, MAX_SEARCH_LENGTH } = VALIDATION_RULES;
  return (
    query.trim().length >= MIN_SEARCH_LENGTH &&
    query.trim().length <= MAX_SEARCH_LENGTH
  );
}

/**
 * Sanitizes search input
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// ===== BOUNDS UTILITIES =====

/**
 * Creates bounds that include all given coordinates
 */
export function createBoundsFromCoordinates(coordinates: Coordinates[]): google.maps.LatLngBounds {
  const bounds = new google.maps.LatLngBounds();
  coordinates.forEach(coord => {
    bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
  });
  return bounds;
}

/**
 * Expands bounds by a given distance (in kilometers)
 */
export function expandBounds(
  center: Coordinates, 
  radiusKm: number
): { northeast: Coordinates; southwest: Coordinates } {
  const latOffset = radiusKm / 111; // Approximate km per degree latitude
  const lngOffset = radiusKm / (111 * Math.cos(toRadians(center.lat)));
  
  return {
    northeast: {
      lat: center.lat + latOffset,
      lng: center.lng + lngOffset
    },
    southwest: {
      lat: center.lat - latOffset,
      lng: center.lng - lngOffset
    }
  };
}

// ===== TIME UTILITIES =====

/**
 * Checks if current time is during peak hours
 */
export function isPeakHours(): boolean {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return DELIVERY_CONFIG.PEAK_HOURS.some(period => {
    return currentTime >= period.start && currentTime <= period.end;
  });
}

/**
 * Applies peak hours multiplier to delivery time
 */
export function adjustForPeakHours(baseTime: number): number {
  return isPeakHours() 
    ? Math.round(baseTime * DELIVERY_CONFIG.PEAK_HOURS_MULTIPLIER)
    : baseTime;
}

// ===== ERROR HANDLING =====

/**
 * Creates standardized maps error
 */
export function createMapsError(
  code: string,
  message?: string,
  details?: Record<string, unknown>
): MapsError {
  return {
    code,
    message: message || ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || 'Unknown error',
    details
  };
}

/**
 * Handles Google Maps API errors
 */
export function handleGoogleMapsError(status: string): MapsError {
  switch (status) {
    case 'ZERO_RESULTS':
      return createMapsError('NOT_FOUND', ERROR_MESSAGES.LOCATION_NOT_FOUND);
    case 'OVER_QUERY_LIMIT':
      return createMapsError('OVER_QUERY_LIMIT', ERROR_MESSAGES.API_QUOTA_EXCEEDED);
    case 'REQUEST_DENIED':
      return createMapsError('REQUEST_DENIED', ERROR_MESSAGES.PERMISSION_DENIED);
    case 'INVALID_REQUEST':
      return createMapsError('INVALID_REQUEST', ERROR_MESSAGES.INVALID_COORDINATES);
    default:
      return createMapsError('UNKNOWN_ERROR', ERROR_MESSAGES.NETWORK_ERROR);
  }
}

// ===== CONVERSION UTILITIES =====

/**
 * Converts Google Maps LatLng to Coordinates
 */
export function latLngToCoordinates(latLng: google.maps.LatLng): Coordinates {
  return {
    lat: latLng.lat(),
    lng: latLng.lng()
  };
}

/**
 * Converts Coordinates to Google Maps LatLng
 */
export function coordinatesToLatLng(coordinates: Coordinates): google.maps.LatLng {
  return new google.maps.LatLng(coordinates.lat, coordinates.lng);
}

/**
 * Converts meters to kilometers
 */
export function metersToKilometers(meters: number): number {
  return meters / 1000;
}

/**
 * Converts seconds to minutes
 */
export function secondsToMinutes(seconds: number): number {
  return seconds / 60;
}

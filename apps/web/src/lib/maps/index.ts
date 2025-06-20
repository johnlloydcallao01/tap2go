// Google Maps Integration Index - Export all maps functionality for Tap2Go Platform

// Types
export type {
  Coordinates,
  Location,
  MapAddress,
  AddressComponent,
  DistanceResult,
  RouteInfo,
  RouteStep,
  DeliveryZone,
  DeliveryCalculation,
  RestaurantLocation,
  NearbyRestaurant,
  TrackingLocation,
  DeliveryTracking,
  TrackingUpdate,
  DriverLocation,
  GeocodeRequest,
  GeocodeResult,
  PlaceAutocompleteRequest,
  PlaceAutocompletePrediction,
  PlaceDetailsResult,
  MapProps,
  MapMarker,
  MapsApiResponse,
  DistanceMatrixResponse,
  GeocodeResponse,
  PlaceAutocompleteResponse,
  PlaceDetailsResponse,
  MapsError,
  MapsErrorCode
} from './types';

// Constants
export {
  MAP_CONFIG,
  DELIVERY_CONFIG,
  GEOCODING_CONFIG,
  DISTANCE_CONFIG,
  MARKER_CONFIG,
  TRACKING_CONFIG,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  PHILIPPINES_CONFIG,
  VALIDATION_RULES,
  FEATURE_FLAGS
} from './constants';

// Utilities
export {
  isValidPhilippinesCoordinates,
  calculateDistance,
  formatDistance,
  formatDuration,
  calculateDeliveryFee,
  estimateDeliveryTime,
  isWithinDeliveryRadius,
  calculateDeliveryInfo,
  formatAddress,
  extractCityFromAddress,
  isValidAddress,
  isValidSearchQuery,
  sanitizeSearchQuery,
  createBoundsFromCoordinates,
  expandBounds,
  isPeakHours,
  adjustForPeakHours,
  createMapsError,
  handleGoogleMapsError,
  latLngToCoordinates,
  coordinatesToLatLng,
  metersToKilometers,
  secondsToMinutes
} from './utils';

// Import types and utilities for internal use
import type { Coordinates } from './types';
import { isValidPhilippinesCoordinates } from './utils';

// Components (re-export for convenience)
export { default as GoogleMap } from '@/components/maps/GoogleMap';
export { default as AddressPicker } from '@/components/maps/AddressPicker';
export { default as AddressAutocomplete } from '@/components/maps/AddressAutocomplete';
export { default as LocationSearch } from '@/components/maps/LocationSearch';
export { default as RestaurantMapView } from '@/components/maps/RestaurantMapView';
export { default as DeliveryTracker } from '@/components/maps/DeliveryTracker';

// API Client Functions for Frontend Use
export const mapsApi = {
  // Geocoding
  geocodeAddress: async (address: string, validate = false) => {
    const response = await fetch('/api/maps/geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, validate })
    });
    return response.json();
  },

  reverseGeocode: async (lat: number, lng: number) => {
    const response = await fetch(`/api/maps/geocode?lat=${lat}&lng=${lng}`);
    return response.json();
  },

  validateAddress: async (address: string) => {
    const response = await fetch('/api/maps/geocode/validate', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });
    return response.json();
  },

  // Distance Calculations
  calculateDistance: async (origin: Coordinates, destination: Coordinates, includeDeliveryInfo = false, restaurantRadius?: number) => {
    const response = await fetch('/api/maps/distance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, includeDeliveryInfo, restaurantRadius })
    });
    return response.json();
  },

  calculateDistanceMatrix: async (origin: Coordinates, destinations: Coordinates[]) => {
    const response = await fetch('/api/maps/distance/matrix', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destinations })
    });
    return response.json();
  },

  calculateDeliveryFee: async (originLat: number, originLng: number, destLat: number, destLng: number, radius?: number) => {
    const params = new URLSearchParams({
      origin_lat: originLat.toString(),
      origin_lng: originLng.toString(),
      dest_lat: destLat.toString(),
      dest_lng: destLng.toString()
    });
    
    if (radius) {
      params.append('radius', radius.toString());
    }

    const response = await fetch(`/api/maps/distance/delivery-fee?${params}`);
    return response.json();
  },

  // Directions
  getDirections: async (origin: Coordinates, destination: Coordinates, waypoints?: Coordinates[]) => {
    const response = await fetch('/api/maps/directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, waypoints })
    });
    return response.json();
  },

  getDirectionsSimple: async (originLat: number, originLng: number, destLat: number, destLng: number) => {
    const params = new URLSearchParams({
      origin_lat: originLat.toString(),
      origin_lng: originLng.toString(),
      dest_lat: destLat.toString(),
      dest_lng: destLng.toString()
    });

    const response = await fetch(`/api/maps/directions?${params}`);
    return response.json();
  },

  optimizeRoute: async (origin: Coordinates, destinations: Coordinates[], returnToOrigin = false) => {
    const response = await fetch('/api/maps/directions/optimize', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destinations, returnToOrigin })
    });
    return response.json();
  }
};

// Utility hooks for React components
export const useMapsApi = () => mapsApi;

// Note: mapConfigs removed to avoid circular imports
// Import MAP_CONFIG directly from constants when needed

// Error handling utilities
export const handleMapsApiError = (error: unknown) => {
  console.error('Maps API Error:', error);

  if (error && typeof error === 'object' && 'success' in error && error.success === false) {
    return (error as { error?: string }).error || 'Maps service error';
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown maps error occurred';
};

// Validation utilities for forms
export const validateCoordinatesInput = (lat: string, lng: string): { isValid: boolean; error?: string } => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    return { isValid: false, error: 'Invalid coordinate format' };
  }
  
  if (!isValidPhilippinesCoordinates({ lat: latitude, lng: longitude })) {
    return { isValid: false, error: 'Coordinates must be within Philippines' };
  }
  
  return { isValid: true };
};

// Default export for convenience
const mapsUtils = {
  mapsApi,
  handleMapsApiError,
  validateCoordinatesInput
};

export default mapsUtils;

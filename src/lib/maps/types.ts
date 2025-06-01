// Google Maps Integration Types for Tap2Go Platform
// Integrates with existing Address and Restaurant types

import { Address } from '@/types';

// ===== CORE LOCATION TYPES =====

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  coordinates: Coordinates;
  address?: string;
  placeId?: string;
}

// Enhanced Address type that extends the existing one
export interface MapAddress extends Address {
  coordinates: Coordinates; // Make coordinates required for maps
  placeId?: string;
  formattedAddress?: string;
  addressComponents?: AddressComponent[];
}

export interface AddressComponent {
  longName: string;
  shortName: string;
  types: string[];
}

// ===== DISTANCE & ROUTE TYPES =====

export interface DistanceResult {
  distance: {
    text: string; // "5.2 km"
    value: number; // 5200 (in meters)
  };
  duration: {
    text: string; // "15 mins"
    value: number; // 900 (in seconds)
  };
  status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS' | 'MAX_WAYPOINTS_EXCEEDED' | 'INVALID_REQUEST' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'UNKNOWN_ERROR';
}

export interface RouteInfo {
  distance: DistanceResult['distance'];
  duration: DistanceResult['duration'];
  polyline?: string;
  steps?: RouteStep[];
  bounds?: {
    northeast: Coordinates;
    southwest: Coordinates;
  };
}

export interface RouteStep {
  distance: DistanceResult['distance'];
  duration: DistanceResult['duration'];
  startLocation: Coordinates;
  endLocation: Coordinates;
  instructions: string;
  polyline: string;
}

// ===== DELIVERY TYPES =====

export interface DeliveryZone {
  id: string;
  name: string;
  center: Coordinates;
  radius: number; // in kilometers
  deliveryFee: number;
  minimumOrder: number;
  isActive: boolean;
}

export interface DeliveryCalculation {
  distance: number; // in kilometers
  estimatedTime: number; // in minutes
  baseFee: number;
  distanceFee: number;
  totalFee: number;
  isWithinZone: boolean;
  zone?: DeliveryZone;
}

// ===== RESTAURANT LOCATION TYPES =====

export interface RestaurantLocation {
  restaurantId: string;
  name: string;
  address: MapAddress;
  deliveryRadius: number; // in kilometers
  isOpen: boolean;
  estimatedPreparationTime: number; // in minutes
}

export interface NearbyRestaurant extends RestaurantLocation {
  distance: number; // in kilometers
  estimatedDeliveryTime: number; // in minutes
  deliveryFee: number;
}

// ===== TRACKING TYPES =====

export interface TrackingLocation {
  coordinates: Coordinates;
  timestamp: Date;
  accuracy?: number; // in meters
  heading?: number; // in degrees
  speed?: number; // in km/h
}

export interface DeliveryTracking {
  orderId: string;
  driverId: string;
  status: 'assigned' | 'picked_up' | 'on_the_way' | 'delivered';
  currentLocation: TrackingLocation;
  estimatedArrival: Date;
  route?: RouteInfo;
  updates: TrackingUpdate[];
}

export interface TrackingUpdate {
  timestamp: Date;
  status: string;
  location: Coordinates;
  message?: string;
}

// ===== DRIVER TYPES =====

export interface DriverLocation {
  driverId: string;
  currentLocation: TrackingLocation;
  isOnline: boolean;
  isAvailable: boolean;
  activeOrderId?: string;
}

// ===== GEOCODING TYPES =====

export interface GeocodeRequest {
  address: string;
  region?: string; // Country code bias
  bounds?: {
    northeast: Coordinates;
    southwest: Coordinates;
  };
}

export interface GeocodeResult {
  coordinates: Coordinates;
  formattedAddress: string;
  placeId: string;
  addressComponents: AddressComponent[];
  types: string[];
}

// ===== PLACES API TYPES =====

export interface PlaceAutocompleteRequest {
  input: string;
  types?: string[]; // ['address', 'establishment', etc.]
  componentRestrictions?: {
    country: string[];
  };
  location?: Coordinates;
  radius?: number;
}

export interface PlaceAutocompletePrediction {
  placeId: string;
  description: string;
  matchedSubstrings: Array<{
    length: number;
    offset: number;
  }>;
  structuredFormatting: {
    mainText: string;
    secondaryText: string;
  };
  types: string[];
}

export interface PlaceDetailsResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  coordinates: Coordinates;
  addressComponents: AddressComponent[];
  types: string[];
  rating?: number;
  priceLevel?: number;
  openingHours?: {
    openNow: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
}

// ===== MAP COMPONENT TYPES =====

export interface MapProps {
  center: Coordinates;
  zoom: number;
  markers?: MapMarker[];
  onMapClick?: (coordinates: Coordinates) => void;
  onMarkerClick?: (markerId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface MapMarker {
  id: string;
  position: Coordinates;
  title?: string;
  icon?: string;
  infoWindow?: {
    content: string;
    isOpen: boolean;
  };
}

// ===== API RESPONSE TYPES =====

export interface MapsApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DistanceMatrixResponse extends MapsApiResponse<DistanceResult[]> {}
export interface GeocodeResponse extends MapsApiResponse<GeocodeResult[]> {}
export interface PlaceAutocompleteResponse extends MapsApiResponse<PlaceAutocompletePrediction[]> {}
export interface PlaceDetailsResponse extends MapsApiResponse<PlaceDetailsResult> {}

// ===== ERROR TYPES =====

export interface MapsError {
  code: string;
  message: string;
  details?: any;
}

export type MapsErrorCode = 
  | 'INVALID_REQUEST'
  | 'OVER_QUERY_LIMIT'
  | 'REQUEST_DENIED'
  | 'UNKNOWN_ERROR'
  | 'ZERO_RESULTS'
  | 'NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'GEOCODING_FAILED'
  | 'DISTANCE_CALCULATION_FAILED';

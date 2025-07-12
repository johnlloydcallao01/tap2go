// Google Maps Configuration Constants for Tap2Go Platform

import { Coordinates } from './types';

// ===== MAP CONFIGURATION =====

export const MAP_CONFIG = {
  // Default map center (Metro Manila, Philippines)
  DEFAULT_CENTER: {
    lat: 14.5995,
    lng: 120.9842
  } as Coordinates,

  // Default zoom levels
  ZOOM_LEVELS: {
    CITY: 11,
    DISTRICT: 13,
    NEIGHBORHOOD: 15,
    STREET: 17,
    BUILDING: 19
  },

  // Map styles
  STYLES: {
    DEFAULT: [],
    DELIVERY: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  },

  // Map options
  OPTIONS: {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    gestureHandling: 'auto' as 'auto' | 'cooperative' | 'greedy' | 'none',
    mapTypeId: 'roadmap' as 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  }
} as const;

// ===== DELIVERY CONFIGURATION =====

export const DELIVERY_CONFIG = {
  // Default delivery settings
  DEFAULT_RADIUS: 10, // kilometers
  MAX_RADIUS: 25, // kilometers
  MIN_RADIUS: 1, // kilometers

  // Delivery fees (in PHP)
  BASE_FEE: 49,
  PER_KM_FEE: 8,
  MIN_FEE: 29,
  MAX_FEE: 199,

  // Time estimates
  PREPARATION_TIME: 30, // minutes
  DELIVERY_TIME_PER_KM: 3, // minutes per kilometer
  BASE_DELIVERY_TIME: 15, // base minutes

  // Peak hours multiplier
  PEAK_HOURS_MULTIPLIER: 1.5,
  PEAK_HOURS: [
    { start: '11:00', end: '14:00' }, // Lunch
    { start: '18:00', end: '21:00' }  // Dinner
  ]
} as const;

// ===== GEOCODING CONFIGURATION =====

export const GEOCODING_CONFIG = {
  // Default region bias (Philippines)
  REGION: 'PH',
  
  // Component restrictions
  COMPONENT_RESTRICTIONS: {
    country: ['PH']
  },

  // Address types for autocomplete (use geocode for general addresses)
  ADDRESS_TYPES: ['geocode'],

  // Establishment types for places (restaurants, malls, landmarks)
  ESTABLISHMENT_TYPES: ['establishment'],

  // General location types for comprehensive search
  GENERAL_LOCATION_TYPES: ['geocode'],

  // Place types for restaurant search
  RESTAURANT_TYPES: [
    'restaurant',
    'food',
    'meal_takeaway',
    'meal_delivery'
  ]
} as const;

// ===== DISTANCE MATRIX CONFIGURATION =====

export const DISTANCE_CONFIG = {
  // Travel mode
  TRAVEL_MODE: 'DRIVING' as 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT',

  // Unit system
  UNIT_SYSTEM: 'METRIC' as 'METRIC' | 'IMPERIAL',

  // Avoid options
  AVOID: [] as ('tolls' | 'highways' | 'ferries' | 'indoor')[],

  // Traffic model
  TRAFFIC_MODEL: 'BEST_GUESS' as 'BEST_GUESS' | 'OPTIMISTIC' | 'PESSIMISTIC',

  // Maximum elements per request
  MAX_ELEMENTS: 25,

  // Maximum origins/destinations
  MAX_WAYPOINTS: 8
} as const;

// ===== MARKER CONFIGURATION =====

export const MARKER_CONFIG = {
  // Default marker icons
  ICONS: {
    RESTAURANT: {
      url: '/icons/restaurant-marker.png',
      scaledSize: { width: 40, height: 40 },
      anchor: { x: 20, y: 40 }
    },
    CUSTOMER: {
      url: '/icons/customer-marker.png',
      scaledSize: { width: 32, height: 32 },
      anchor: { x: 16, y: 32 }
    },
    DRIVER: {
      url: '/icons/driver-marker.png',
      scaledSize: { width: 36, height: 36 },
      anchor: { x: 18, y: 36 }
    },
    PICKUP: {
      url: '/icons/pickup-marker.png',
      scaledSize: { width: 32, height: 32 },
      anchor: { x: 16, y: 32 }
    },
    DELIVERY: {
      url: '/icons/delivery-marker.png',
      scaledSize: { width: 32, height: 32 },
      anchor: { x: 16, y: 32 }
    }
  },

  // Marker colors (for default markers)
  COLORS: {
    PRIMARY: '#f3a823',    // Tap2Go primary orange
    SECONDARY: '#ef7b06',  // Tap2Go secondary orange
    SUCCESS: '#10b981',    // Green
    WARNING: '#f59e0b',    // Amber
    ERROR: '#ef4444',      // Red
    INFO: '#3b82f6'        // Blue
  }
} as const;

// ===== TRACKING CONFIGURATION =====

export const TRACKING_CONFIG = {
  // Update intervals
  LOCATION_UPDATE_INTERVAL: 10000, // 10 seconds
  TRACKING_UPDATE_INTERVAL: 5000,  // 5 seconds
  
  // Accuracy thresholds
  MIN_ACCURACY: 100, // meters
  MAX_ACCURACY: 1000, // meters
  
  // Distance thresholds
  MIN_DISTANCE_UPDATE: 50, // meters
  
  // Geolocation options
  GEOLOCATION_OPTIONS: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000
  }
} as const;

// ===== API ENDPOINTS =====

export const API_ENDPOINTS = {
  GEOCODE: '/api/maps/geocode',
  DISTANCE: '/api/maps/distance',
  DIRECTIONS: '/api/maps/directions',
  PLACES_AUTOCOMPLETE: '/api/maps/places/autocomplete',
  PLACES_DETAILS: '/api/maps/places/details',
  NEARBY_RESTAURANTS: '/api/maps/nearby-restaurants',
  DELIVERY_ZONES: '/api/maps/delivery-zones'
} as const;

// ===== ERROR MESSAGES =====

export const ERROR_MESSAGES = {
  GEOCODING_FAILED: 'Unable to find the specified address',
  DISTANCE_CALCULATION_FAILED: 'Unable to calculate distance',
  LOCATION_NOT_FOUND: 'Location not found',
  OUTSIDE_DELIVERY_ZONE: 'Address is outside our delivery zone',
  INVALID_COORDINATES: 'Invalid coordinates provided',
  NETWORK_ERROR: 'Network error occurred',
  API_QUOTA_EXCEEDED: 'Service temporarily unavailable',
  PERMISSION_DENIED: 'Location permission denied',
  POSITION_UNAVAILABLE: 'Location unavailable'
} as const;

// ===== PHILIPPINES SPECIFIC CONFIGURATION =====

export const PHILIPPINES_CONFIG = {
  // Major cities coordinates
  CITIES: {
    MANILA: { lat: 14.5995, lng: 120.9842 },
    QUEZON_CITY: { lat: 14.6760, lng: 121.0437 },
    MAKATI: { lat: 14.5547, lng: 121.0244 },
    TAGUIG: { lat: 14.5176, lng: 121.0509 },
    PASIG: { lat: 14.5764, lng: 121.0851 },
    MANDALUYONG: { lat: 14.5794, lng: 121.0359 },
    CEBU: { lat: 10.3157, lng: 123.8854 },
    DAVAO: { lat: 7.1907, lng: 125.4553 }
  },

  // Metro Manila bounds
  METRO_MANILA_BOUNDS: {
    northeast: { lat: 14.7608, lng: 121.1744 },
    southwest: { lat: 14.3890, lng: 120.8535 }
  },

  // Common address components
  ADDRESS_COMPONENTS: {
    BARANGAY: 'sublocality_level_1',
    CITY: 'locality',
    PROVINCE: 'administrative_area_level_2',
    REGION: 'administrative_area_level_1',
    COUNTRY: 'country'
  }
} as const;

// ===== VALIDATION RULES =====

export const VALIDATION_RULES = {
  // Coordinate bounds for Philippines
  COORDINATE_BOUNDS: {
    LAT_MIN: 4.5,
    LAT_MAX: 21.0,
    LNG_MIN: 116.0,
    LNG_MAX: 127.0
  },

  // Address validation
  MIN_ADDRESS_LENGTH: 10,
  MAX_ADDRESS_LENGTH: 200,

  // Distance validation
  MIN_DELIVERY_DISTANCE: 0.1, // km
  MAX_DELIVERY_DISTANCE: 50,   // km

  // Search validation
  MIN_SEARCH_LENGTH: 3,
  MAX_SEARCH_LENGTH: 100
} as const;

// ===== FEATURE FLAGS =====

export const FEATURE_FLAGS = {
  ENABLE_REAL_TIME_TRACKING: true,
  ENABLE_ROUTE_OPTIMIZATION: true,
  ENABLE_TRAFFIC_AWARE_ROUTING: true,
  ENABLE_DELIVERY_ZONES: true,
  ENABLE_DYNAMIC_PRICING: false,
  ENABLE_GEOFENCING: true
} as const;

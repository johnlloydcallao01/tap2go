// Comprehensive Google Maps TypeScript declarations
// This file ensures proper type recognition across all components

/// <reference types="google.maps" />

declare global {
  interface Window {
    google: typeof google;
  }
}

// Re-export Google Maps types for easier access
export namespace GoogleMaps {
  // Core Map types
  export type Map = google.maps.Map;
  export type MapOptions = google.maps.MapOptions;
  export type MapTypeStyle = google.maps.MapTypeStyle;
  export type LatLng = google.maps.LatLng;
  export type LatLngBounds = google.maps.LatLngBounds;
  export type Size = google.maps.Size;
  export type Point = google.maps.Point;

  // Marker types
  export type Marker = google.maps.Marker;
  export type MarkerOptions = google.maps.MarkerOptions;
  export type InfoWindow = google.maps.InfoWindow;
  export type InfoWindowOptions = google.maps.InfoWindowOptions;

  // Event types
  export type MapMouseEvent = google.maps.MapMouseEvent;
  export type MapsEventListener = google.maps.MapsEventListener;

  // Geometry types
  export type Circle = google.maps.Circle;
  export type CircleOptions = google.maps.CircleOptions;

  // Places API types
  export namespace Places {
    export type AutocompleteService = google.maps.places.AutocompleteService;
    export type PlacesService = google.maps.places.PlacesService;
    export type Autocomplete = google.maps.places.Autocomplete;
    export type AutocompleteOptions = google.maps.places.AutocompleteOptions;
    export type AutocompletionRequest = google.maps.places.AutocompletionRequest;
    export type AutocompletePrediction = google.maps.places.AutocompletePrediction;
    export type PlaceDetailsRequest = google.maps.places.PlaceDetailsRequest;
    export type PlaceResult = google.maps.places.PlaceResult;
    export type PlacesServiceStatus = google.maps.places.PlacesServiceStatus;
    export type AutocompleteSessionToken = google.maps.places.AutocompleteSessionToken;
  }

  // Directions API types
  export type DirectionsService = google.maps.DirectionsService;
  export type DirectionsRenderer = google.maps.DirectionsRenderer;
  export type DirectionsRequest = google.maps.DirectionsRequest;
  export type DirectionsResult = google.maps.DirectionsResult;
  export type DirectionsStep = google.maps.DirectionsStep;
  export type TravelMode = google.maps.TravelMode;
  export type UnitSystem = google.maps.UnitSystem;

  // Distance Matrix types
  export type DistanceMatrixService = google.maps.DistanceMatrixService;
  export type DistanceMatrixRequest = google.maps.DistanceMatrixRequest;
  export type DistanceMatrixResponse = google.maps.DistanceMatrixResponse;
  export type DistanceMatrixResponseElement = google.maps.DistanceMatrixResponseElement;

  // Geocoder types
  export type Geocoder = google.maps.Geocoder;
  export type GeocoderRequest = google.maps.GeocoderRequest;
  export type GeocoderResult = google.maps.GeocoderResult;
  export type GeocoderStatus = google.maps.GeocoderStatus;
  export type GeocoderAddressComponent = google.maps.GeocoderAddressComponent;
}

// Type guards for runtime checks
export const isGoogleMapsLoaded = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.google !== 'undefined' && 
         typeof window.google.maps !== 'undefined';
};

// Helper type for coordinates
export interface Coordinates {
  lat: number;
  lng: number;
}

// Helper type for address components
export interface AddressComponent {
  longName: string;
  shortName: string;
  types: string[];
}

// Enhanced map address interface
export interface MapAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: Coordinates;
  placeId?: string;
  formattedAddress?: string;
  addressComponents?: AddressComponent[];
}

// Place autocomplete prediction interface
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

// Export the global google object type for components
export type GoogleMapsAPI = typeof google;

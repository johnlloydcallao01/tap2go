'use client';

// DEPRECATED: Old problematic Google Map Component
// This component had issues with shaking, blinking, and unprofessional behavior
// Use ProfessionalMap.tsx instead

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Coordinates, MapProps, MapMarker } from '@/lib/maps/types';
import { MAP_CONFIG, MARKER_CONFIG } from '@/lib/maps/constants';
import { coordinatesToLatLng, latLngToCoordinates } from '@/lib/maps/utils';

/// <reference types="google.maps" />

// Declare global google object for TypeScript
declare global {
  interface Window {
    google: typeof google;
  }
}

// Get frontend API key from environment
// const FRONTEND_API_KEY = process.env.NEXT_PUBLIC_MAPS_FRONTEND_KEY;

interface GoogleMapProps extends MapProps {
  height?: string;
  width?: string;
  showCurrentLocation?: boolean;
  enableGeolocation?: boolean;
  onLocationFound?: (coordinates: Coordinates) => void;
  onLocationError?: (error: string) => void;
}

export default function GoogleMap({
  center = MAP_CONFIG.DEFAULT_CENTER,
  zoom = MAP_CONFIG.ZOOM_LEVELS.NEIGHBORHOOD,
  markers = [],
  onMapClick,
  onMarkerClick,
  className = '',
  style = {},
  height = '400px',
  width = '100%',
  showCurrentLocation = false,
  enableGeolocation = false,
  onLocationFound,
  onLocationError
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  // Using legacy Marker for compatibility - suppress deprecation warnings
  const markersRef = useRef<google.maps.Marker[]>([]);
  const currentLocationMarkerRef = useRef<google.maps.Marker | null>(null);
  
  const [isLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);

  // DEPRECATED: This component is no longer used
  // API loading disabled to prevent conflicts with ProfessionalMap
  useEffect(() => {
    setError('This component is deprecated. Use ProfessionalMap instead.');
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      const mapOptions: google.maps.MapOptions = {
        center: coordinatesToLatLng(center),
        zoom,
        styles: JSON.parse(JSON.stringify(MAP_CONFIG.STYLES.DELIVERY)) as google.maps.MapTypeStyle[],
        ...MAP_CONFIG.OPTIONS
      };

      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);

      // Add click listener
      if (onMapClick) {
        mapInstanceRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            onMapClick(latLngToCoordinates(event.latLng));
          }
        });
      }
    } catch (err) {
      setError('Failed to initialize map');
      console.error('Map initialization error:', err);
    }
  }, [isLoaded, center, zoom, onMapClick]);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const newCenter = coordinatesToLatLng(center);
      mapInstanceRef.current.setCenter(newCenter);
      // Smooth pan to new location for better UX
      mapInstanceRef.current.panTo(newCenter);
    }
  }, [center]);

  // Update map zoom when zoom prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [zoom]);

  // Clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  }, []);

  // Add markers to map
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    clearMarkers();

    markers.forEach((markerData: MapMarker) => {
      // Using legacy Marker for compatibility (deprecated but functional)
      const marker = new google.maps.Marker({
        position: coordinatesToLatLng(markerData.position),
        map: mapInstanceRef.current,
        title: markerData.title,
        icon: markerData.icon || {
          path: 'M 0, 0 m -8, 0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0',
          fillColor: MARKER_CONFIG.COLORS.PRIMARY,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 1
        }
      });

      // Add click listener
      if (onMarkerClick) {
        marker.addListener('click', () => onMarkerClick(markerData.id));
      }

      // Add info window if provided
      if (markerData.infoWindow) {
        const infoWindow = new google.maps.InfoWindow({
          content: markerData.infoWindow.content
        });

        if (markerData.infoWindow.isOpen) {
          infoWindow.open(mapInstanceRef.current, marker);
        }

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });
      }

      markersRef.current.push(marker);
    });
  }, [markers, onMarkerClick, clearMarkers]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!enableGeolocation || !navigator.geolocation) {
      onLocationError?.('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setCurrentLocation(coordinates);
        onLocationFound?.(coordinates);

        // Center map on current location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(coordinatesToLatLng(coordinates));
        }
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout';
            break;
        }
        onLocationError?.(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, [enableGeolocation, onLocationFound, onLocationError]);

  // Add current location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !currentLocation || !showCurrentLocation) return;

    // Remove existing current location marker
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
    }

    // Add new current location marker (using legacy Marker for compatibility)
    currentLocationMarkerRef.current = new google.maps.Marker({
      position: coordinatesToLatLng(currentLocation),
      map: mapInstanceRef.current,
      title: 'Your Location',
      icon: {
        path: 'M 0, 0 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0',
        fillColor: MARKER_CONFIG.COLORS.INFO,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 1
      }
    });
  }, [currentLocation, showCurrentLocation]);

  // Auto-get location on mount if enabled
  useEffect(() => {
    if (enableGeolocation) {
      getCurrentLocation();
    }
  }, [enableGeolocation, getCurrentLocation]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={{ height, width, ...style }}
      >
        <div className="text-center text-gray-600">
          <p className="text-sm">Map Error</p>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={{ height, width, ...style }}
      >
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-sm">Loading Map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height, width, ...style }}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Current Location Button */}
      {enableGeolocation && (
        <button
          onClick={getCurrentLocation}
          className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          title="Get Current Location"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  );
}

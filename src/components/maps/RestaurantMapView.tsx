'use client';

// Restaurant Map View Component - Frontend Pattern Example
// Uses NEXT_PUBLIC_MAPS_FRONTEND_KEY for client-side map display

import React, { useEffect, useRef, useState } from 'react';
import { Coordinates } from '@/lib/maps/types';
import { MAP_CONFIG, MARKER_CONFIG } from '@/lib/maps/constants';
import { coordinatesToLatLng } from '@/lib/maps/utils';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import { Restaurant } from '@/types';

const FRONTEND_API_KEY = process.env.NEXT_PUBLIC_MAPS_FRONTEND_KEY;

interface RestaurantMapViewProps {
  restaurant: Restaurant;
  showDeliveryRadius?: boolean;
  height?: string;
  className?: string;
  onLocationClick?: (coordinates: Coordinates) => void;
}

export default function RestaurantMapView({
  restaurant,
  showDeliveryRadius = true,
  height = '300px',
  className = '',
  onLocationClick
}: RestaurantMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Maps script using singleton loader
  useEffect(() => {
    const loadMapsAPI = async () => {
      if (!FRONTEND_API_KEY) {
        setError('Frontend API key not found');
        return;
      }

      try {
        await loadGoogleMaps(FRONTEND_API_KEY);
        setIsLoaded(true);
      } catch (err) {
        setError('Failed to load Google Maps');
        console.error('Google Maps loading error:', err);
      }
    };

    loadMapsAPI();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !restaurant.address?.coordinates) return;

    try {
      const restaurantLocation = restaurant.address.coordinates;
      
      const mapOptions: google.maps.MapOptions = {
        center: coordinatesToLatLng(restaurantLocation),
        zoom: MAP_CONFIG.ZOOM_LEVELS.NEIGHBORHOOD,
        styles: JSON.parse(JSON.stringify(MAP_CONFIG.STYLES.DELIVERY)) as google.maps.MapTypeStyle[],
        ...MAP_CONFIG.OPTIONS,
        gestureHandling: 'cooperative'
      };

      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);

      // Add restaurant marker
      markerRef.current = new google.maps.Marker({
        position: coordinatesToLatLng(restaurantLocation),
        map: mapInstanceRef.current,
        title: restaurant.name,
        icon: {
          url: MARKER_CONFIG.ICONS.RESTAURANT.url,
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 40)
        }
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-semibold text-gray-900">${restaurant.name}</h3>
            <p class="text-sm text-gray-600">${restaurant.address.street}, ${restaurant.address.city}</p>
            <p class="text-sm text-orange-600">⭐ ${restaurant.rating} • ${restaurant.deliveryTime}</p>
          </div>
        `
      });

      markerRef.current.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, markerRef.current);
      });

      // Show delivery radius circle
      if (showDeliveryRadius) {
        const deliveryRadius = restaurant.deliveryRadius || 5; // Default 5km
        
        circleRef.current = new google.maps.Circle({
          strokeColor: MARKER_CONFIG.COLORS.PRIMARY,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: MARKER_CONFIG.COLORS.PRIMARY,
          fillOpacity: 0.15,
          map: mapInstanceRef.current,
          center: coordinatesToLatLng(restaurantLocation),
          radius: deliveryRadius * 1000 // Convert km to meters
        });
      }

      // Add click listener
      if (onLocationClick) {
        mapInstanceRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const coordinates: Coordinates = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            };
            onLocationClick(coordinates);
          }
        });
      }

    } catch (err) {
      setError('Failed to initialize restaurant map');
      console.error('Restaurant map error:', err);
    }
  }, [isLoaded, restaurant, showDeliveryRadius, onLocationClick]);

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={{ height }}
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
        style={{ height }}
      >
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-sm">Loading Map...</p>
        </div>
      </div>
    );
  }

  if (!restaurant.address?.coordinates) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-600">
          <p className="text-sm">Location not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Restaurant Info Overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
        <h3 className="font-semibold text-gray-900 text-sm">{restaurant.name}</h3>
        <p className="text-xs text-gray-600">{restaurant.address.city}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-orange-600">⭐ {restaurant.rating}</span>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-600">{restaurant.deliveryTime}</span>
        </div>
        {showDeliveryRadius && (
          <p className="text-xs text-gray-500 mt-1">
            Delivery radius: {restaurant.deliveryRadius || 5}km
          </p>
        )}
      </div>

      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          restaurant.isOpen 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {restaurant.isOpen ? 'Open' : 'Closed'}
        </div>
      </div>
    </div>
  );
}

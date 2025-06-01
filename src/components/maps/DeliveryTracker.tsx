'use client';

// Real-time Delivery Tracking Component for Tap2Go Platform
// Shows live driver location and delivery progress

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Coordinates, DeliveryTracking, TrackingUpdate } from '@/lib/maps/types';
import { MAP_CONFIG, MARKER_CONFIG, TRACKING_CONFIG } from '@/lib/maps/constants';
import { coordinatesToLatLng } from '@/lib/maps/utils';
import { 
  TruckIcon, 
  ClockIcon, 
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

// Get frontend API key from environment
const FRONTEND_API_KEY = process.env.NEXT_PUBLIC_MAPS_FRONTEND_KEY;

interface DeliveryTrackerProps {
  orderId: string;
  restaurantLocation: Coordinates;
  deliveryLocation: Coordinates;
  driverLocation?: Coordinates;
  trackingData?: DeliveryTracking;
  onTrackingUpdate?: (update: TrackingUpdate) => void;
  className?: string;
  height?: string;
  showRoute?: boolean;
  autoCenter?: boolean;
}

export default function DeliveryTracker({
  orderId,
  restaurantLocation,
  deliveryLocation,
  driverLocation,
  trackingData,
  onTrackingUpdate,
  className = '',
  height = '400px',
  showRoute = true,
  autoCenter = true
}: DeliveryTrackerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const routeRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDriverLocation, setCurrentDriverLocation] = useState<Coordinates | null>(driverLocation || null);
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(trackingData?.estimatedArrival || null);
  const [deliveryStatus, setDeliveryStatus] = useState<string>(trackingData?.status || 'assigned');

  // Load Google Maps script
  useEffect(() => {
    if (!FRONTEND_API_KEY) {
      setError('Google Maps API key not found');
      return;
    }

    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${FRONTEND_API_KEY}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Failed to load Google Maps');
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      const mapOptions: google.maps.MapOptions = {
        center: coordinatesToLatLng(restaurantLocation),
        zoom: MAP_CONFIG.ZOOM_LEVELS.NEIGHBORHOOD,
        styles: JSON.parse(JSON.stringify(MAP_CONFIG.STYLES.DELIVERY)) as google.maps.MapTypeStyle[],
        ...MAP_CONFIG.OPTIONS,
        gestureHandling: 'cooperative'
      };

      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
      directionsServiceRef.current = new google.maps.DirectionsService();
      routeRendererRef.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // We'll add custom markers
        polylineOptions: {
          strokeColor: MARKER_CONFIG.COLORS.PRIMARY,
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      routeRendererRef.current.setMap(mapInstanceRef.current);
    } catch (err) {
      setError('Failed to initialize tracking map');
      console.error('Tracking map initialization error:', err);
    }
  }, [isLoaded, restaurantLocation]);

  // Update markers
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.setMap(null));
    markersRef.current = {};

    // Restaurant marker
    markersRef.current.restaurant = new google.maps.Marker({
      position: coordinatesToLatLng(restaurantLocation),
      map: mapInstanceRef.current,
      title: 'Restaurant',
      icon: {
        url: MARKER_CONFIG.ICONS.PICKUP.url,
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32)
      }
    });

    // Delivery location marker
    markersRef.current.delivery = new google.maps.Marker({
      position: coordinatesToLatLng(deliveryLocation),
      map: mapInstanceRef.current,
      title: 'Delivery Location',
      icon: {
        url: MARKER_CONFIG.ICONS.DELIVERY.url,
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32)
      }
    });

    // Driver marker (if available)
    if (currentDriverLocation) {
      markersRef.current.driver = new google.maps.Marker({
        position: coordinatesToLatLng(currentDriverLocation),
        map: mapInstanceRef.current,
        title: 'Driver Location',
        icon: {
          url: MARKER_CONFIG.ICONS.DRIVER.url,
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 36)
        }
      });
    }

    // Auto-center map to show all markers
    if (autoCenter) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(coordinatesToLatLng(restaurantLocation));
      bounds.extend(coordinatesToLatLng(deliveryLocation));
      if (currentDriverLocation) {
        bounds.extend(coordinatesToLatLng(currentDriverLocation));
      }
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [restaurantLocation, deliveryLocation, currentDriverLocation, autoCenter]);

  // Update route
  const updateRoute = useCallback(() => {
    if (!showRoute || !directionsServiceRef.current || !routeRendererRef.current) return;

    let origin: Coordinates;
    let destination: Coordinates;

    // Determine route based on delivery status
    if (deliveryStatus === 'assigned' || deliveryStatus === 'picked_up') {
      // Show route from driver (or restaurant) to delivery location
      origin = currentDriverLocation || restaurantLocation;
      destination = deliveryLocation;
    } else {
      // Show completed route or no route for delivered orders
      return;
    }

    const request: google.maps.DirectionsRequest = {
      origin: coordinatesToLatLng(origin),
      destination: coordinatesToLatLng(destination),
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === 'OK' && result && routeRendererRef.current) {
        routeRendererRef.current.setDirections(result);
      }
    });
  }, [showRoute, deliveryStatus, currentDriverLocation, restaurantLocation, deliveryLocation]);

  // Update markers when locations change
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Update route when relevant data changes
  useEffect(() => {
    updateRoute();
  }, [updateRoute]);

  // Update driver location
  useEffect(() => {
    setCurrentDriverLocation(driverLocation || null);
  }, [driverLocation]);

  // Update tracking data
  useEffect(() => {
    if (trackingData) {
      setCurrentDriverLocation(trackingData.currentLocation.coordinates);
      setEstimatedArrival(trackingData.estimatedArrival);
      setDeliveryStatus(trackingData.status);
    }
  }, [trackingData]);

  // Simulate real-time updates (in production, this would come from WebSocket or polling)
  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(() => {
      // In production, this would fetch real tracking data
      // For now, we'll just trigger the callback if provided
      if (onTrackingUpdate && currentDriverLocation) {
        const update: TrackingUpdate = {
          timestamp: new Date(),
          status: deliveryStatus,
          location: currentDriverLocation,
          message: getStatusMessage(deliveryStatus)
        };
        onTrackingUpdate(update);
      }
    }, TRACKING_CONFIG.TRACKING_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [orderId, onTrackingUpdate, currentDriverLocation, deliveryStatus]);

  // Get status message
  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'assigned':
        return 'Driver assigned to your order';
      case 'picked_up':
        return 'Order picked up from restaurant';
      case 'on_the_way':
        return 'Driver is on the way to you';
      case 'delivered':
        return 'Order delivered successfully';
      default:
        return 'Tracking your order';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'picked_up':
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'on_the_way':
        return <TruckIcon className="h-5 w-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          <p className="text-red-700">Tracking Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded-lg p-4 ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-sm">Loading Tracking...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Status Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(deliveryStatus)}
            <div>
              <h3 className="font-semibold">Order #{orderId.slice(-8)}</h3>
              <p className="text-sm opacity-90">{getStatusMessage(deliveryStatus)}</p>
            </div>
          </div>
          {estimatedArrival && (
            <div className="text-right">
              <p className="text-sm opacity-90">ETA</p>
              <p className="font-semibold">
                {estimatedArrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ height, width: '100%' }} />

      {/* Status Footer */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-4 w-4" />
            <span>Live tracking active</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4" />
            <span>Updates every {TRACKING_CONFIG.TRACKING_UPDATE_INTERVAL / 1000}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';

// Professional Google Maps Component
// Based on industry best practices from Google Maps documentation
// Stable, performant, and professional implementation
// Uses singleton pattern to prevent multiple API loads

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  className?: string;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
}

// Global types handled by googleMapsLoader

export default function ProfessionalMap({
  center = { lat: 14.5995, lng: 120.9842 }, // Manila default
  zoom = 15,
  height = '400px',
  className = '',
  onLocationSelect
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Load Google Maps API using singleton loader
  const loadMapsAPI = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_MAPS_FRONTEND_KEY;
    if (!apiKey) {
      setError('Google Maps API key not configured');
      setIsLoading(false);
      return;
    }

    try {
      await loadGoogleMaps(apiKey);
      setIsLoaded(true);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load Google Maps');
      setIsLoading(false);
      console.error('Google Maps loading error:', err);
    }
  }, []);

  // Initialize map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google || mapInstanceRef.current) return;

    try {
      // Create map with professional settings
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
        gestureHandling: 'auto',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add click listener for location selection
      mapInstanceRef.current.addListener('click', (event: any) => {
        // Close any open info windows when clicking on empty map area
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Remove existing marker and info window
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        // Reverse geocode to get address first
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            const placeName = results[0].address_components?.[0]?.long_name || 'Selected Location';

            // Add new marker with Google Maps style - DRAGGABLE
            markerRef.current = new window.google.maps.Marker({
              position: { lat, lng },
              map: mapInstanceRef.current,
              title: address,
              draggable: true, // Make marker draggable
              icon: {
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#EA4335',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 1.5,
                anchor: new window.google.maps.Point(12, 24)
              }
            });

            // Create info window with Google Maps style content
            infoWindowRef.current = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 12px; min-width: 200px; font-family: Roboto, Arial, sans-serif;">
                  <div style="font-weight: 500; font-size: 16px; color: #202124; margin-bottom: 4px;">
                    ${placeName}
                  </div>
                  <div style="font-size: 14px; color: #5f6368; line-height: 1.4; margin-bottom: 8px;">
                    ${address}
                  </div>
                  <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                    <span>Lat: ${lat.toFixed(6)}</span>
                    <span>Lng: ${lng.toFixed(6)}</span>
                  </div>
                </div>
              `,
              pixelOffset: new window.google.maps.Size(0, -10)
            });

            // Open info window immediately
            infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);

            // Add click listener to marker to reopen info window
            markerRef.current.addListener('click', () => {
              infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
            });

            // Add drag listener to update location when marker is dragged
            markerRef.current.addListener('dragend', (event: any) => {
              const newLat = event.latLng.lat();
              const newLng = event.latLng.lng();

              // Update info window content with new coordinates
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results: any, status: any) => {
                if (status === 'OK' && results[0]) {
                  const newAddress = results[0].formatted_address;
                  const newPlaceName = results[0].address_components?.[0]?.long_name || 'Dragged Location';

                  // Update info window content
                  infoWindowRef.current.setContent(`
                    <div style="padding: 12px; min-width: 200px; font-family: Roboto, Arial, sans-serif;">
                      <div style="font-weight: 500; font-size: 16px; color: #202124; margin-bottom: 4px;">
                        ${newPlaceName}
                      </div>
                      <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                        📍 Dragged Location
                      </div>
                      <div style="font-size: 14px; color: #5f6368; line-height: 1.4; margin-bottom: 8px;">
                        ${newAddress}
                      </div>
                      <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                        <span>Lat: ${newLat.toFixed(6)}</span>
                        <span>Lng: ${newLng.toFixed(6)}</span>
                      </div>
                    </div>
                  `);

                  // Update marker title
                  markerRef.current.setTitle(newAddress);

                  // Update state
                  setSelectedLocation(newAddress);
                  onLocationSelect?.({ lat: newLat, lng: newLng, address: newAddress });
                } else {
                  // Fallback if geocoding fails
                  const fallbackAddress = `Dragged to ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;

                  infoWindowRef.current.setContent(`
                    <div style="padding: 12px; min-width: 200px; font-family: Roboto, Arial, sans-serif;">
                      <div style="font-weight: 500; font-size: 16px; color: #202124; margin-bottom: 4px;">
                        Dragged Location
                      </div>
                      <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                        📍 Custom Position
                      </div>
                      <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                        <span>Lat: ${newLat.toFixed(6)}</span>
                        <span>Lng: ${newLng.toFixed(6)}</span>
                      </div>
                    </div>
                  `);

                  markerRef.current.setTitle(fallbackAddress);
                  setSelectedLocation(fallbackAddress);
                  onLocationSelect?.({ lat: newLat, lng: newLng, address: fallbackAddress });
                }
              });
            });

            setSelectedLocation(address);
            onLocationSelect?.({ lat, lng, address });
          } else {
            // Fallback if geocoding fails
            const fallbackAddress = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;

            markerRef.current = new window.google.maps.Marker({
              position: { lat, lng },
              map: mapInstanceRef.current,
              title: fallbackAddress,
              draggable: true, // Make fallback marker draggable too
              icon: {
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#EA4335',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 1.5,
                anchor: new window.google.maps.Point(12, 24)
              }
            });

            infoWindowRef.current = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 12px; min-width: 200px; font-family: Roboto, Arial, sans-serif;">
                  <div style="font-weight: 500; font-size: 16px; color: #202124; margin-bottom: 4px;">
                    Selected Location
                  </div>
                  <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                    <span>Lat: ${lat.toFixed(6)}</span>
                    <span>Lng: ${lng.toFixed(6)}</span>
                  </div>
                </div>
              `,
              pixelOffset: new window.google.maps.Size(0, -10)
            });

            infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);

            markerRef.current.addListener('click', () => {
              infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
            });

            // Add drag listener for fallback marker
            markerRef.current.addListener('dragend', (event: any) => {
              const newLat = event.latLng.lat();
              const newLng = event.latLng.lng();

              // Try to get address for new position
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results: any, status: any) => {
                if (status === 'OK' && results[0]) {
                  const newAddress = results[0].formatted_address;
                  const newPlaceName = results[0].address_components?.[0]?.long_name || 'Dragged Location';

                  infoWindowRef.current.setContent(`
                    <div style="padding: 12px; min-width: 200px; font-family: Roboto, Arial, sans-serif;">
                      <div style="font-weight: 500; font-size: 16px; color: #202124; margin-bottom: 4px;">
                        ${newPlaceName}
                      </div>
                      <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                        📍 Dragged Location
                      </div>
                      <div style="font-size: 14px; color: #5f6368; line-height: 1.4; margin-bottom: 8px;">
                        ${newAddress}
                      </div>
                      <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                        <span>Lat: ${newLat.toFixed(6)}</span>
                        <span>Lng: ${newLng.toFixed(6)}</span>
                      </div>
                    </div>
                  `);

                  markerRef.current.setTitle(newAddress);
                  setSelectedLocation(newAddress);
                  onLocationSelect?.({ lat: newLat, lng: newLng, address: newAddress });
                } else {
                  const newFallbackAddress = `Dragged to ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;

                  infoWindowRef.current.setContent(`
                    <div style="padding: 12px; min-width: 200px; font-family: Roboto, Arial, sans-serif;">
                      <div style="font-weight: 500; font-size: 16px; color: #202124; margin-bottom: 4px;">
                        Dragged Location
                      </div>
                      <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                        📍 Custom Position
                      </div>
                      <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                        <span>Lat: ${newLat.toFixed(6)}</span>
                        <span>Lng: ${newLng.toFixed(6)}</span>
                      </div>
                    </div>
                  `);

                  markerRef.current.setTitle(newFallbackAddress);
                  setSelectedLocation(newFallbackAddress);
                  onLocationSelect?.({ lat: newLat, lng: newLng, address: newFallbackAddress });
                }
              });
            });

            setSelectedLocation(fallbackAddress);
            onLocationSelect?.({ lat, lng, address: fallbackAddress });
          }
        });
      });

    } catch (err) {
      setError('Failed to initialize map');
      console.error('Map initialization error:', err);
    }
  }, [center, zoom, onLocationSelect]);

  // Initialize autocomplete
  const initializeAutocomplete = useCallback(() => {
    if (!searchInputRef.current || !window.google || autocompleteRef.current) return;

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          componentRestrictions: { country: 'PH' },
          fields: ['place_id', 'geometry', 'name', 'formatted_address']
        }
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const address = place.formatted_address || place.name;
        const placeName = place.name || 'Selected Location';
        const placeTypes = place.types || [];

        // Update map center with smooth animation
        mapInstanceRef.current?.panTo({ lat, lng });
        mapInstanceRef.current?.setZoom(17);

        // Remove existing marker and info window
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        // Add new marker with Google Maps style pin - DRAGGABLE
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          title: address,
          draggable: true, // Make search result marker draggable
          icon: {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#EA4335',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            scale: 1.5,
            anchor: new window.google.maps.Point(12, 24)
          }
        });

        // Determine place type for display
        let placeTypeDisplay = '';
        if (placeTypes.includes('restaurant')) placeTypeDisplay = '🍽️ Restaurant';
        else if (placeTypes.includes('shopping_mall')) placeTypeDisplay = '🏬 Shopping Mall';
        else if (placeTypes.includes('hospital')) placeTypeDisplay = '🏥 Hospital';
        else if (placeTypes.includes('school')) placeTypeDisplay = '🏫 School';
        else if (placeTypes.includes('bank')) placeTypeDisplay = '🏦 Bank';
        else if (placeTypes.includes('gas_station')) placeTypeDisplay = '⛽ Gas Station';
        else if (placeTypes.includes('establishment')) placeTypeDisplay = '📍 Establishment';
        else placeTypeDisplay = '📍 Location';

        // Create professional info window with Google Maps styling
        infoWindowRef.current = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 16px; min-width: 250px; max-width: 300px; font-family: Roboto, Arial, sans-serif;">
              <div style="font-weight: 500; font-size: 18px; color: #202124; margin-bottom: 6px; line-height: 1.3;">
                ${placeName}
              </div>
              ${placeTypeDisplay ? `
                <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                  ${placeTypeDisplay}
                </div>
              ` : ''}
              <div style="font-size: 14px; color: #5f6368; line-height: 1.4; margin-bottom: 12px;">
                ${address}
              </div>
              <div style="border-top: 1px solid #e8eaed; padding-top: 8px;">
                <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                  <span>Lat: ${lat.toFixed(6)}</span>
                  <span>Lng: ${lng.toFixed(6)}</span>
                </div>
              </div>
            </div>
          `,
          pixelOffset: new window.google.maps.Size(0, -10)
        });

        // Open info window immediately
        infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);

        // Add click listener to marker to reopen info window
        markerRef.current.addListener('click', () => {
          infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
        });

        // Add drag listener for search result marker
        markerRef.current.addListener('dragend', (event: any) => {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();

          // Get new address for dragged position
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
              const newAddress = results[0].formatted_address;
              const newPlaceName = results[0].address_components?.[0]?.long_name || 'Dragged Location';
              const newPlaceTypes = results[0].types || [];

              // Determine new place type
              let newPlaceTypeDisplay = '';
              if (newPlaceTypes.includes('restaurant')) newPlaceTypeDisplay = '🍽️ Restaurant';
              else if (newPlaceTypes.includes('shopping_mall')) newPlaceTypeDisplay = '🏬 Shopping Mall';
              else if (newPlaceTypes.includes('hospital')) newPlaceTypeDisplay = '🏥 Hospital';
              else if (newPlaceTypes.includes('school')) newPlaceTypeDisplay = '🏫 School';
              else if (newPlaceTypes.includes('bank')) newPlaceTypeDisplay = '🏦 Bank';
              else if (newPlaceTypes.includes('gas_station')) newPlaceTypeDisplay = '⛽ Gas Station';
              else if (newPlaceTypes.includes('establishment')) newPlaceTypeDisplay = '📍 Establishment';
              else newPlaceTypeDisplay = '📍 Dragged Location';

              // Update info window content
              infoWindowRef.current.setContent(`
                <div style="padding: 16px; min-width: 250px; max-width: 300px; font-family: Roboto, Arial, sans-serif;">
                  <div style="font-weight: 500; font-size: 18px; color: #202124; margin-bottom: 6px; line-height: 1.3;">
                    ${newPlaceName}
                  </div>
                  <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                    ${newPlaceTypeDisplay}
                  </div>
                  <div style="font-size: 14px; color: #5f6368; line-height: 1.4; margin-bottom: 12px;">
                    ${newAddress}
                  </div>
                  <div style="border-top: 1px solid #e8eaed; padding-top: 8px;">
                    <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                      <span>Lat: ${newLat.toFixed(6)}</span>
                      <span>Lng: ${newLng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              `);

              markerRef.current.setTitle(newAddress);
              setSelectedLocation(newAddress);
              onLocationSelect?.({ lat: newLat, lng: newLng, address: newAddress });
            } else {
              // Fallback if geocoding fails
              const fallbackAddress = `Dragged to ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`;

              infoWindowRef.current.setContent(`
                <div style="padding: 16px; min-width: 250px; max-width: 300px; font-family: Roboto, Arial, sans-serif;">
                  <div style="font-weight: 500; font-size: 18px; color: #202124; margin-bottom: 6px; line-height: 1.3;">
                    Dragged Location
                  </div>
                  <div style="font-size: 13px; color: #1a73e8; margin-bottom: 8px; font-weight: 500;">
                    📍 Custom Position
                  </div>
                  <div style="border-top: 1px solid #e8eaed; padding-top: 8px;">
                    <div style="font-size: 12px; color: #70757a; display: flex; justify-content: space-between;">
                      <span>Lat: ${newLat.toFixed(6)}</span>
                      <span>Lng: ${newLng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              `);

              markerRef.current.setTitle(fallbackAddress);
              setSelectedLocation(fallbackAddress);
              onLocationSelect?.({ lat: newLat, lng: newLng, address: fallbackAddress });
            }
          });
        });

        setSelectedLocation(address);
        onLocationSelect?.({ lat, lng, address });
      });

    } catch (err) {
      console.error('Autocomplete initialization error:', err);
    }
  }, [onLocationSelect]);

  // Load Google Maps on mount
  useEffect(() => {
    loadMapsAPI();
  }, [loadMapsAPI]);

  // Initialize map when loaded
  useEffect(() => {
    if (isLoaded) {
      initializeMap();
      initializeAutocomplete();
    }
  }, [isLoaded, initializeMap, initializeAutocomplete]);

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading Map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-gray-600">
          <p className="text-sm font-medium">Map Error</p>
          <p className="text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search any location in Philippines..."
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="w-full rounded-lg" style={{ height }} />

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg border">
          <p className="text-sm font-medium text-gray-900">Selected Location:</p>
          <p className="text-xs text-gray-600 mt-1">{selectedLocation}</p>
        </div>
      )}
    </div>
  );
}

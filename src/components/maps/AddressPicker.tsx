'use client';

// Address Picker Component with Google Places Autocomplete for Tap2Go Platform
// Uses frontend API key for client-side address search and selection

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Coordinates, MapAddress } from '@/lib/maps/types';
import { MAP_CONFIG } from '@/lib/maps/constants';
import { isValidAddress, sanitizeSearchQuery } from '@/lib/maps/utils';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import { MapPinIcon } from '@heroicons/react/24/outline';

// Get frontend API key from environment
const FRONTEND_API_KEY = process.env.NEXT_PUBLIC_MAPS_FRONTEND_KEY;

interface AddressPickerProps {
  onAddressSelect: (address: MapAddress) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  showMap?: boolean;
  mapHeight?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function AddressPicker({
  onAddressSelect,
  onError,
  placeholder = 'Enter your delivery address...',
  className = '',
  defaultValue = '',
  showMap = true,
  mapHeight = '200px',
  disabled = false,
  required = false
}: AddressPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [inputValue, setInputValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<MapAddress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load Google Maps script using singleton loader
  useEffect(() => {
    const loadMapsAPI = async () => {
      if (!FRONTEND_API_KEY) {
        setError('Google Maps API key not found');
        onError?.('Google Maps API key not found');
        return;
      }

      try {
        await loadGoogleMaps(FRONTEND_API_KEY);
        setIsLoaded(true);
      } catch (err) {
        setError('Failed to load Google Maps');
        onError?.('Failed to load Google Maps');
        console.error('Google Maps loading error:', err);
      }
    };

    loadMapsAPI();
  }, [onError]);

  // Initialize autocomplete
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'], // Address types for autocomplete
        componentRestrictions: { country: ['PH'] }, // Philippines only
        fields: ['place_id', 'formatted_address', 'geometry', 'address_components', 'name']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        handlePlaceSelect(place);
      });

      autocompleteRef.current = autocomplete;
    } catch (err) {
      setError('Failed to initialize address search');
      onError?.('Failed to initialize address search');
      console.error('Autocomplete initialization error:', err);
    }
  }, [isLoaded, onError]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !showMap || !mapRef.current || mapInstanceRef.current) return;

    try {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: MAP_CONFIG.DEFAULT_CENTER.lat, lng: MAP_CONFIG.DEFAULT_CENTER.lng },
        zoom: MAP_CONFIG.ZOOM_LEVELS.CITY,
        styles: JSON.parse(JSON.stringify(MAP_CONFIG.STYLES.DELIVERY)) as google.maps.MapTypeStyle[],
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'cooperative'
      };

      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);

      // Add click listener to map
      mapInstanceRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const coordinates: Coordinates = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          handleMapClick(coordinates);
        }
      });
    } catch (err) {
      console.error('Map initialization error:', err);
    }
  }, [isLoaded, showMap]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle place selection from autocomplete
  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (!place.geometry || !place.geometry.location) {
      setError('Invalid place selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const coordinates: Coordinates = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      const address: MapAddress = {
        street: extractAddressComponent(place.address_components, 'route') || 
                extractAddressComponent(place.address_components, 'street_number') || '',
        city: extractAddressComponent(place.address_components, 'locality') || 
              extractAddressComponent(place.address_components, 'administrative_area_level_2') || '',
        state: extractAddressComponent(place.address_components, 'administrative_area_level_1') || '',
        zipCode: extractAddressComponent(place.address_components, 'postal_code') || '',
        country: extractAddressComponent(place.address_components, 'country') || 'Philippines',
        coordinates,
        placeId: place.place_id,
        formattedAddress: place.formatted_address || '',
        addressComponents: place.address_components?.map(component => ({
          longName: component.long_name,
          shortName: component.short_name,
          types: component.types
        }))
      };

      setSelectedAddress(address);
      setInputValue(address.formattedAddress || '');
      updateMapLocation(coordinates);
      onAddressSelect(address);
    } catch (error) {
      console.error('Error processing selected address:', error);
      setError('Failed to process selected address');
      onError?.('Failed to process selected address');
    } finally {
      setIsLoading(false);
    }
  }, [onAddressSelect, onError]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle map click for reverse geocoding
  const handleMapClick = useCallback(async (coordinates: Coordinates) => {
    setIsLoading(true);
    setError(null);

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: coordinates });

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        
        const address: MapAddress = {
          street: extractAddressComponent(result.address_components, 'route') || '',
          city: extractAddressComponent(result.address_components, 'locality') || 
                extractAddressComponent(result.address_components, 'administrative_area_level_2') || '',
          state: extractAddressComponent(result.address_components, 'administrative_area_level_1') || '',
          zipCode: extractAddressComponent(result.address_components, 'postal_code') || '',
          country: extractAddressComponent(result.address_components, 'country') || 'Philippines',
          coordinates,
          placeId: result.place_id,
          formattedAddress: result.formatted_address,
          addressComponents: result.address_components.map(component => ({
            longName: component.long_name,
            shortName: component.short_name,
            types: component.types
          }))
        };

        setSelectedAddress(address);
        setInputValue(address.formattedAddress || '');
        updateMapLocation(coordinates);
        onAddressSelect(address);
      }
    } catch (error) {
      console.error('Error getting address for selected location:', error);
      setError('Failed to get address for selected location');
      onError?.('Failed to get address for selected location');
    } finally {
      setIsLoading(false);
    }
  }, [onAddressSelect, onError]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update map location and marker
  const updateMapLocation = useCallback((coordinates: Coordinates) => {
    if (!mapInstanceRef.current) return;

    // Update map center
    mapInstanceRef.current.setCenter(coordinates);
    mapInstanceRef.current.setZoom(MAP_CONFIG.ZOOM_LEVELS.STREET);

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Add new marker
    markerRef.current = new google.maps.Marker({
      position: coordinates,
      map: mapInstanceRef.current,
      title: 'Selected Location',
      draggable: true
    });

    // Handle marker drag
    markerRef.current.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const newCoordinates: Coordinates = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        handleMapClick(newCoordinates);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Extract address component by type
  const extractAddressComponent = (
    components: google.maps.GeocoderAddressComponent[] | undefined,
    type: string
  ): string => {
    if (!components) return '';
    const component = components.find(comp => comp.types.includes(type));
    return component?.long_name || '';
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = sanitizeSearchQuery(e.target.value);
    setInputValue(value);
    setError(null);

    if (value.length < 3) {
      return;
    }

    if (!isValidAddress(value)) {
      setError('Please enter a valid address');
      return;
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    // Native Google autocomplete handles predictions
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Native Google autocomplete handles blur
  };

  return (
    <div className={`relative ${className}`}>
      {/* Address Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPinIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          required={required}
          className={`
            w-full pl-10 pr-10 py-3 text-gray-900 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:border-transparent
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
          style={{ '--tw-ring-color': '#f3a823' } as React.CSSProperties}
        />

        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Map */}
      {showMap && isLoaded && (
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-300">
          <div ref={mapRef} style={{ height: mapHeight, width: '100%' }} />
          <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600">
            Click on the map to select a location or drag the marker to adjust
          </div>
        </div>
      )}

      {/* Selected Address Display */}
      {selectedAddress && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <MapPinIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">Selected Address:</p>
              <p className="text-sm text-green-700">{selectedAddress.formattedAddress}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

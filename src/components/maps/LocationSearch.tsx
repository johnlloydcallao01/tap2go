'use client';

// General Location Search Component - Like Google Maps Platform
// Searches for ANY location: addresses, establishments, landmarks, etc.

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapAddress, PlaceAutocompletePrediction, Coordinates } from '@/lib/maps/types';
import { sanitizeSearchQuery } from '@/lib/maps/utils';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import { MagnifyingGlassIcon, XMarkIcon, MapPinIcon, BuildingOfficeIcon, HomeIcon } from '@heroicons/react/24/outline';

const FRONTEND_API_KEY = process.env.NEXT_PUBLIC_MAPS_FRONTEND_KEY;

interface LocationSearchProps {
  onLocationSelect: (address: MapAddress) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
}

export default function LocationSearch({
  onLocationSelect,
  onError,
  placeholder = 'Search any location...',
  className = '',
  defaultValue = '',
  disabled = false
}: LocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  const [inputValue, setInputValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<PlaceAutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

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

  // Initialize services
  useEffect(() => {
    if (!isLoaded) return;

    try {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      
      const dummyMap = new google.maps.Map(document.createElement('div'));
      placesServiceRef.current = new google.maps.places.PlacesService(dummyMap);
      
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    } catch (err) {
      setError('Failed to initialize location search');
      onError?.('Failed to initialize location search');
      console.error('Location search initialization error:', err);
    }
  }, [isLoaded, onError]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Get predictions for any location type
  const getPredictions = useCallback(async (input: string) => {
    if (!autocompleteServiceRef.current || !input || input.length < 2) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use no types restriction to get ALL location types
      const request: google.maps.places.AutocompletionRequest = {
        input: sanitizeSearchQuery(input),
        componentRestrictions: { country: ['PH'] },
        sessionToken: sessionTokenRef.current!
        // No types restriction = search everything (addresses, establishments, landmarks, etc.)
      };

      autocompleteServiceRef.current.getPlacePredictions(
        request,
        (predictions, status) => {
          setIsLoading(false);
          
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const formattedPredictions: PlaceAutocompletePrediction[] = predictions.map(prediction => ({
              placeId: prediction.place_id,
              description: prediction.description,
              matchedSubstrings: prediction.matched_substrings.map(match => ({
                length: match.length,
                offset: match.offset
              })),
              structuredFormatting: {
                mainText: prediction.structured_formatting.main_text,
                secondaryText: prediction.structured_formatting.secondary_text || ''
              },
              types: prediction.types
            }));
            
            setPredictions(formattedPredictions);
            setShowPredictions(true);
          } else {
            setPredictions([]);
            if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              setError('Failed to get location suggestions');
            }
          }
        }
      );
    } catch (err) {
      setIsLoading(false);
      setError('Error getting location suggestions');
      console.error('Location search error:', err);
    }
  }, []);

  // Get place details
  const getPlaceDetails = useCallback(async (placeId: string) => {
    if (!placesServiceRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: ['place_id', 'formatted_address', 'geometry', 'address_components', 'name', 'types'],
        sessionToken: sessionTokenRef.current!
      };

      placesServiceRef.current.getDetails(request, (place, status) => {
        setIsLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          if (!place.geometry || !place.geometry.location) {
            setError('Invalid location selected');
            return;
          }

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

          setInputValue(address.formattedAddress || '');
          setShowPredictions(false);
          
          sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
          
          onLocationSelect(address);
        } else {
          setError('Failed to get location details');
        }
      });
    } catch (err) {
      setIsLoading(false);
      setError('Error getting location details');
      console.error('Place details error:', err);
    }
  }, [onLocationSelect]);

  // Extract address component
  const extractAddressComponent = (
    components: google.maps.GeocoderAddressComponent[] | undefined,
    type: string
  ): string => {
    if (!components) return '';
    const component = components.find(comp => comp.types.includes(type));
    return component?.long_name || '';
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setError(null);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (value.length >= 2) {
      const timer = setTimeout(() => {
        getPredictions(value);
      }, 300);
      
      setDebounceTimer(timer);
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  // Handle prediction selection
  const handlePredictionSelect = (prediction: PlaceAutocompletePrediction) => {
    getPlaceDetails(prediction.placeId);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (inputValue.length >= 2) {
      getPredictions(inputValue);
    }
    if (predictions.length > 0) {
      setShowPredictions(true);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    setTimeout(() => setShowPredictions(false), 200);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowPredictions(false);
    }
  };

  // Get icon for location type
  const getLocationIcon = (types: string[]) => {
    if (types.includes('establishment') || types.includes('point_of_interest')) {
      return <BuildingOfficeIcon className="h-5 w-5 text-blue-500" />;
    }
    if (types.includes('street_address') || types.includes('premise')) {
      return <HomeIcon className="h-5 w-5 text-green-500" />;
    }
    return <MapPinIcon className="h-5 w-5 text-gray-400" />;
  };

  // Get location type label
  const getLocationTypeLabel = (types: string[]) => {
    if (types.includes('establishment')) return 'Place';
    if (types.includes('street_address')) return 'Address';
    if (types.includes('administrative_area_level_2')) return 'City';
    if (types.includes('administrative_area_level_1')) return 'Province';
    return 'Location';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Enhanced Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || !isLoaded}
          className={`
            w-full pl-10 pr-12 py-3 text-gray-900 border border-gray-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${showPredictions ? 'rounded-b-none border-b-0' : ''}
          `}
          style={{ '--tw-ring-color': '#f3a823' } as React.CSSProperties}
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                setPredictions([]);
                setShowPredictions(false);
                setError(null);
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
          
          {isLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Predictions Dropdown */}
      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-xl max-h-80 overflow-y-auto">
          <div className="py-2">
            {predictions.map((prediction) => (
              <button
                key={prediction.placeId}
                type="button"
                onClick={() => handlePredictionSelect(prediction)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getLocationIcon(prediction.types)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {prediction.structuredFormatting.mainText}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {getLocationTypeLabel(prediction.types)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {prediction.structuredFormatting.secondaryText}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Powered by Google Maps
              </p>
              <p className="text-xs text-gray-400">
                {predictions.length} result{predictions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && inputValue.length >= 2 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-xl">
          <div className="px-4 py-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Searching locations...</p>
          </div>
        </div>
      )}

      {/* No results state */}
      {showPredictions && predictions.length === 0 && !isLoading && inputValue.length >= 2 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-xl">
          <div className="px-4 py-6 text-center">
            <MagnifyingGlassIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No locations found</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
          </div>
        </div>
      )}
    </div>
  );
}

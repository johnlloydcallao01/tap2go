'use client';

// Address Autocomplete Component - Frontend Pattern Example
// Uses NEXT_PUBLIC_MAPS_FRONTEND_KEY for client-side address search

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapAddress, PlaceAutocompletePrediction } from '@/lib/maps/types';
import { sanitizeSearchQuery } from '@/lib/maps/utils';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import { MapPinIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { GoogleMaps } from '@/types/google-maps';

/// <reference types="google.maps" />

const FRONTEND_API_KEY = process.env.NEXT_PUBLIC_MAPS_FRONTEND_KEY;

interface AddressAutocompleteProps {
  onAddressSelect: (address: MapAddress) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  showIcon?: boolean;
}

export default function AddressAutocomplete({
  onAddressSelect,
  onError,
  placeholder = 'Search for an address...',
  className = '',
  defaultValue = '',
  disabled = false,
  required = false
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef = useRef<GoogleMaps.Places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<GoogleMaps.Places.PlacesService | null>(null);
  const sessionTokenRef = useRef<GoogleMaps.Places.AutocompleteSessionToken | null>(null);

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
        setError('Frontend API key not found');
        onError?.('Frontend API key not found');
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

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Initialize services
  useEffect(() => {
    if (!isLoaded) return;

    try {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      
      // Create a dummy map for PlacesService (required by Google Maps API)
      const dummyMap = new google.maps.Map(document.createElement('div'));
      placesServiceRef.current = new google.maps.places.PlacesService(dummyMap);
      
      // Create session token for billing optimization
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    } catch (err) {
      setError('Failed to initialize address search');
      onError?.('Failed to initialize address search');
      console.error('Autocomplete service initialization error:', err);
    }
  }, [isLoaded, onError]);

  // Get autocomplete predictions
  const getPredictions = useCallback(async (input: string) => {
    if (!autocompleteServiceRef.current || !input || input.length < 3) {
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: GoogleMaps.Places.AutocompletionRequest = {
        input: sanitizeSearchQuery(input),
        types: ['geocode'], // Address types for autocomplete
        componentRestrictions: { country: ['PH'] }, // Philippines only
        sessionToken: sessionTokenRef.current!
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
              setError('Failed to get address suggestions');
            }
          }
        }
      );
    } catch (err) {
      setIsLoading(false);
      setError('Error getting address suggestions');
      console.error('Autocomplete error:', err);
    }
  }, []);

  // Get place details
  const getPlaceDetails = useCallback(async (placeId: string) => {
    if (!placesServiceRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const request: GoogleMaps.Places.PlaceDetailsRequest = {
        placeId,
        fields: ['place_id', 'formatted_address', 'geometry', 'address_components', 'name'],
        sessionToken: sessionTokenRef.current!
      };

      placesServiceRef.current.getDetails(request, (place, status) => {
        setIsLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          if (!place.geometry || !place.geometry.location) {
            setError('Invalid place selected');
            return;
          }

          const coordinates = {
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
          
          // Create new session token for next search
          sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
          
          onAddressSelect(address);
        } else {
          setError('Failed to get place details');
        }
      });
    } catch (err) {
      setIsLoading(false);
      setError('Error getting place details');
      console.error('Place details error:', err);
    }
  }, [onAddressSelect]);

  // Extract address component by type
  const extractAddressComponent = (
    components: GoogleMaps.GeocoderAddressComponent[] | undefined,
    type: string
  ): string => {
    if (!components) return '';
    const component = components.find(comp => comp.types.includes(type));
    return component?.long_name || '';
  };

  // Handle input change with debounced suggestions (like Google Maps)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setError(null);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Show suggestions after just 2 characters (like Google Maps)
    if (value.length >= 2) {
      // Debounce the API call to avoid too many requests
      const timer = setTimeout(() => {
        getPredictions(value);
      }, 300); // 300ms delay like Google Maps

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

  // Handle input focus - show suggestions immediately if there's text
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
    // Delay hiding predictions to allow for clicks
    setTimeout(() => setShowPredictions(false), 200);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowPredictions(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Enhanced Input Field - Google Maps Style */}
      <div className="relative">
        {/* Search Icon */}
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
          required={required}
          className={`
            w-full pl-10 pr-12 py-3 text-gray-900 border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${showPredictions ? 'rounded-b-none border-b-0' : ''}
          `}
          style={{ '--tw-ring-color': '#f3a823' } as React.CSSProperties}
        />

        {/* Right side icons */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
          {/* Clear button */}
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

          {/* Loading spinner */}
          {isLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Auto-Suggest Predictions Dropdown - Google Maps Style */}
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
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {prediction.structuredFormatting.mainText}
                      </p>
                      {prediction.types.includes('establishment') && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Place
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {prediction.structuredFormatting.secondaryText}
                    </p>
                    {/* Show matched text highlighting */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {prediction.types.slice(0, 2).map((type, typeIndex) => (
                        <span
                          key={typeIndex}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                        >
                          {type.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
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

          {/* Footer with Google attribution */}
          <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Powered by Google Maps
              </p>
              <p className="text-xs text-gray-400">
                {predictions.length} suggestion{predictions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state for predictions */}
      {isLoading && inputValue.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="px-4 py-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Searching locations...</p>
          </div>
        </div>
      )}

      {/* No results state */}
      {showPredictions && predictions.length === 0 && !isLoading && inputValue.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="px-4 py-6 text-center">
            <MapPinIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No locations found</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
          </div>
        </div>
      )}
    </div>
  );
}

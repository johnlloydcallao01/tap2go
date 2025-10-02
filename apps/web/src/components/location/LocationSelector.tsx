'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LocationSelectorProps {
  onLocationSelect?: (location: google.maps.places.PlaceResult) => void;
  className?: string;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect?: (location: google.maps.places.PlaceResult) => void;
}

// Location Icon Component
function LocationIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
      />
    </svg>
  );
}

// Global Google Maps loader with singleton pattern and async loading
let googleMapsPromise: Promise<void> | null = null;
let isGoogleMapsLoaded = false;

const loadGoogleMaps = (): Promise<void> => {
  // If already loaded, return resolved promise
  if (isGoogleMapsLoaded && window.google && window.google.maps && window.google.maps.places) {
    return Promise.resolve();
  }

  // If loading is in progress, return the existing promise
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Check if script already exists
  const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
  if (existingScript) {
    // Script exists, wait for it to load
    googleMapsPromise = new Promise((resolve) => {
      const checkLoaded = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          isGoogleMapsLoaded = true;
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
    });
    return googleMapsPromise;
  }

  // Create new loading promise with proper async loading
  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_BACKEND_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isGoogleMapsLoaded = true;
      resolve();
    };

    script.onerror = () => {
      googleMapsPromise = null; // Reset on error so it can be retried
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

// Location Modal Component
function LocationModal({ isOpen, onClose, onLocationSelect }: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapsReady, setIsMapsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile/tablet
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // Below lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load Google Maps API
  useEffect(() => {
    if (isOpen && !isMapsReady) {
      loadGoogleMaps()
        .then(() => {
          setIsMapsReady(true);
        })
        .catch((error) => {
          console.error('Failed to load Google Maps:', error);
        });
    }
  }, [isOpen, isMapsReady]);

  // Handle search input changes with new AutocompleteSuggestion API
  useEffect(() => {
    if (!searchQuery.trim() || !isMapsReady) {
      setPredictions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        // Use the new AutocompleteSuggestion API
        const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: searchQuery,
          locationBias: {
            // Bias results towards Philippines
            center: { lat: 12.8797, lng: 121.7740 }, // Center of Philippines
            radius: 50000 // 50km radius (maximum allowed by Google Maps API)
          }
        });

        // Convert suggestions to the expected format
        const convertedPredictions: google.maps.places.AutocompletePrediction[] = suggestions.map(suggestion => ({
          description: suggestion.placePrediction?.text?.text || '',
          matched_substrings: (suggestion.placePrediction?.text?.matches || []).map(match => ({
            length: match.endOffset - match.startOffset,
            offset: match.startOffset,
          })),
          place_id: suggestion.placePrediction?.placeId || '',
          reference: suggestion.placePrediction?.placeId || '',
          structured_formatting: {
            main_text: suggestion.placePrediction?.text?.text?.split(',')[0] || '',
            main_text_matched_substrings: (suggestion.placePrediction?.text?.matches || []).map(match => ({
              length: match.endOffset - match.startOffset,
              offset: match.startOffset,
            })),
            secondary_text: suggestion.placePrediction?.text?.text?.split(',').slice(1).join(',').trim() || '',
          },
          terms: [],
          types: suggestion.placePrediction?.types || [],
        }));

        setPredictions(convertedPredictions);
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        setPredictions([]);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isMapsReady]);

  const handlePlaceSelect = async (placeId: string) => {
    if (!placeId) return;

    setIsLoading(true);
    try {
      // Use the new Place API
      const place = new google.maps.places.Place({
        id: placeId,
        requestedLanguage: 'en',
      });

      // Fetch place details
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'id'],
      });

      // Convert to the expected PlaceResult format for backward compatibility
      const placeResult: google.maps.places.PlaceResult = {
        name: place.displayName || undefined,
        formatted_address: place.formattedAddress || undefined,
        geometry: place.location ? {
          location: place.location,
          viewport: undefined,
        } : undefined,
        place_id: place.id,
      };

      onLocationSelect?.(placeResult);
      onClose();
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen, isMobile]);

  if (!isOpen) return null;

  const modalElement = (
    <div 
      className={isMobile ? '' : 'fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4'}
      style={isMobile ? { 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: 'white', 
        zIndex: 99999 
      } : { position: 'fixed', zIndex: 9999 }}
    >
      {/* Modal - Responsive design */}
      <div className={`${
        isMobile 
          ? 'w-full h-full flex flex-col bg-white' // Full height on mobile/tablet with solid white background
          : 'bg-white rounded-2xl shadow-2xl w-full transform transition-all' // Popup style on desktop
      }`} style={isMobile ? { width: '100%', height: '100%', backgroundColor: 'white' } : {}}>
        {/* Header */}
        <div className={`${
          isMobile 
            ? 'px-4 py-3 border-b border-gray-100 flex items-center' // Mobile header with back button
            : 'px-6 py-4 border-b border-gray-100' // Desktop header
        }`}>
          {isMobile ? (
            // Mobile header with back button
            <div className="flex items-center w-full">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
              >
                <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-xl font-semibold text-gray-900">
                Addresses
              </h3>
            </div>
          ) : (
            // Desktop header with close button
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Addresses
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className={`${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for an address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Search Results */}
        {predictions.length > 0 && (
          <div className={`${isMobile ? 'px-4 pb-4 flex-1 overflow-y-auto' : 'px-6 pb-4'}`}>
            <div className={`${isMobile ? 'h-full overflow-y-auto' : 'max-h-64 overflow-y-auto'}`}>
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  onClick={() => handlePlaceSelect(prediction.place_id)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50 mb-2"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <LocationIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {prediction.structured_formatting.main_text}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {prediction.structured_formatting.secondary_text}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading States */}
        {isLoading && (
          <div className={`${isMobile ? 'px-4 py-8' : 'px-6 py-8'} flex items-center justify-center`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <span className="ml-3 text-gray-600">Loading location details...</span>
          </div>
        )}

        {isOpen && !isMapsReady && (
          <div className={`${isMobile ? 'px-4 py-8' : 'px-6 py-8'} flex items-center justify-center`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <span className="ml-3 text-gray-600">Loading Google Maps...</span>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalElement as React.ReactNode, document.body);
}

// Main Location Selector Component
export function LocationSelector({ onLocationSelect, className = '' }: LocationSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<google.maps.places.PlaceResult | null>(null);

  const handleLocationSelect = (location: google.maps.places.PlaceResult) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  };

  const displayText = selectedLocation?.name || selectedLocation?.formatted_address || 'Enter Address';

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors ${className}`}
      >
        <LocationIcon className="h-5 w-5 text-gray-500" />
        <span className="truncate max-w-32">{displayText}</span>
      </button>

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
    </>
  );
}

export default LocationSelector;
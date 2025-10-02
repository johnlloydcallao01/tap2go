'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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

export default function AddressesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapsReady, setIsMapsReady] = useState(false);

  const handleBack = () => {
    router.back();
  };

  // Load Google Maps API
  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        setIsMapsReady(true);
      })
      .catch((error) => {
        console.error('Failed to load Google Maps:', error);
      });
  }, []);

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

      // Store the selected location and navigate back
      localStorage.setItem('selectedLocation', JSON.stringify(placeResult));
      router.back();
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect above
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-gray-100 bg-white flex items-center">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
        >
          <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          Addresses
        </h1>
      </div>

      {/* Search Section */}
      <div className="px-4 py-4">
        <form onSubmit={handleSearch} className="flex">
          <div className="flex-1 relative">
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
        </form>
      </div>

      {/* Search Results */}
      {predictions.length > 0 && (
        <div className="px-4 pb-4 flex-1 overflow-y-auto">
          <div className="h-full overflow-y-auto">
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
        <div className="px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 text-gray-600">Loading location details...</span>
        </div>
      )}

      {!isMapsReady && (
        <div className="px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 text-gray-600">Loading Google Maps...</span>
        </div>
      )}
    </div>
  );
}
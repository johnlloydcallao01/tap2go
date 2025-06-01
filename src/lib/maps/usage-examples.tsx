// Google Maps Usage Examples for Tap2Go Platform
// Demonstrates proper frontend vs backend API key usage patterns

import React, { useState, useEffect } from 'react';
import { 
  GoogleMap, 
  AddressAutocomplete, 
  RestaurantMapView, 
  DeliveryTracker,
  mapsApi 
} from '@/lib/maps';
import { Coordinates, MapAddress, DeliveryCalculation } from '@/lib/maps/types';
import { Restaurant } from '@/types';

// ===== FRONTEND PATTERN EXAMPLES =====

/**
 * Example 1: Restaurant Location Display (Frontend Key)
 * Shows restaurant on interactive map with delivery radius
 */
export function RestaurantLocationExample({ restaurant }: { restaurant: Restaurant }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Restaurant Location</h3>
      
      {/* Uses NEXT_PUBLIC_MAPS_FRONTEND_KEY for map display */}
      <RestaurantMapView 
        restaurant={restaurant}
        showDeliveryRadius={true}
        height="300px"
        onLocationClick={(coords) => {
          console.log('Location clicked:', coords);
        }}
      />
    </div>
  );
}

/**
 * Example 2: Address Selection (Frontend Key)
 * Customer selects delivery address with autocomplete
 */
export function AddressSelectionExample() {
  const [selectedAddress, setSelectedAddress] = useState<MapAddress | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryCalculation | null>(null);

  const handleAddressSelect = async (address: MapAddress) => {
    setSelectedAddress(address);
    
    // Calculate delivery fee using backend API (uses MAPS_BACKEND_KEY)
    try {
      const response = await fetch('/api/delivery/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: 'restaurant-123',
          deliveryAddress: address.formattedAddress
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setDeliveryInfo(result.data);
      }
    } catch (error) {
      console.error('Delivery calculation error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Delivery Address</h3>
      
      {/* Uses NEXT_PUBLIC_MAPS_FRONTEND_KEY for autocomplete */}
      <AddressAutocomplete 
        onAddressSelect={handleAddressSelect}
        placeholder="Enter your delivery address..."
        showIcon={true}
      />

      {selectedAddress && (
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="font-medium">Selected Address:</p>
          <p className="text-sm text-gray-600">{selectedAddress.formattedAddress}</p>
        </div>
      )}

      {deliveryInfo && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="font-medium">Delivery Information:</p>
          <p className="text-sm">Distance: {deliveryInfo.distance.toFixed(1)}km</p>
          <p className="text-sm">Time: {deliveryInfo.estimatedTime} minutes</p>
          <p className="text-sm">Fee: ₱{deliveryInfo.totalFee}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Live Delivery Tracking (Frontend Key)
 * Real-time tracking of order delivery
 */
export function DeliveryTrackingExample({ orderId }: { orderId: string }) {
  const [driverLocation, setDriverLocation] = useState<Coordinates | null>(null);

  // Simulate real-time driver location updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In production, this would come from WebSocket or polling
      setDriverLocation({
        lat: 14.5995 + (Math.random() - 0.5) * 0.01,
        lng: 120.9842 + (Math.random() - 0.5) * 0.01
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Live Delivery Tracking</h3>
      
      {/* Uses NEXT_PUBLIC_MAPS_FRONTEND_KEY for tracking display */}
      <DeliveryTracker
        orderId={orderId}
        restaurantLocation={{ lat: 14.5995, lng: 120.9842 }}
        deliveryLocation={{ lat: 14.6042, lng: 120.9822 }}
        driverLocation={driverLocation || undefined}
        height="400px"
        showRoute={true}
        autoCenter={true}
      />
    </div>
  );
}

/**
 * Example 4: Interactive Restaurant Map (Frontend Key)
 * Shows multiple restaurants on map with click handling
 */
export function RestaurantMapExample() {
  const [restaurants] = useState([
    {
      id: '1',
      name: 'Jollibee - SM Mall of Asia',
      coordinates: { lat: 14.5995, lng: 120.9842 },
      rating: 4.5
    },
    {
      id: '2', 
      name: 'McDonald\'s - Ayala Malls',
      coordinates: { lat: 14.6042, lng: 120.9822 },
      rating: 4.3
    }
  ]);

  const markers = restaurants.map(restaurant => ({
    id: restaurant.id,
    position: restaurant.coordinates,
    title: restaurant.name,
    infoWindow: {
      content: `
        <div class="p-2">
          <h4 class="font-semibold">${restaurant.name}</h4>
          <p class="text-sm">⭐ ${restaurant.rating}</p>
        </div>
      `,
      isOpen: false
    }
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Nearby Restaurants</h3>
      
      {/* Uses NEXT_PUBLIC_MAPS_FRONTEND_KEY for interactive map */}
      <GoogleMap 
        center={{ lat: 14.5995, lng: 120.9842 }}
        zoom={15}
        markers={markers}
        height="400px"
        onMapClick={(coords) => {
          console.log('Map clicked at:', coords);
        }}
        onMarkerClick={(markerId) => {
          console.log('Restaurant selected:', markerId);
        }}
      />
    </div>
  );
}

// ===== BACKEND PATTERN EXAMPLES =====

/**
 * Example 5: Delivery Fee Calculation (Backend Key)
 * Server-side calculation using Google Maps APIs
 */
export async function calculateDeliveryFeeExample(
  restaurantId: string,
  deliveryAddress: string
): Promise<DeliveryCalculation | null> {
  try {
    // This uses MAPS_BACKEND_KEY on the server
    const response = await fetch('/api/delivery/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId,
        deliveryAddress
      })
    });

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Delivery calculation error:', error);
    return null;
  }
}

/**
 * Example 6: Address Validation (Backend Key)
 * Server-side address validation and geocoding
 */
export async function validateAddressExample(
  address: string,
  restaurantId?: string
): Promise<{ isValid: boolean; reason?: string }> {
  try {
    // This uses MAPS_BACKEND_KEY on the server
    const response = await fetch('/api/delivery/calculate/validate', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        restaurantId
      })
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        isValid: result.data.addressValidation.isValid,
        reason: result.data.addressValidation.reason
      };
    } else {
      return {
        isValid: false,
        reason: result.error
      };
    }
  } catch (error) {
    console.error('Address validation error:', error);
    return {
      isValid: false,
      reason: 'Validation service unavailable'
    };
  }
}

/**
 * Example 7: Find Nearby Restaurants (Backend Key)
 * Server-side restaurant discovery with distance calculations
 */
export async function findNearbyRestaurantsExample(
  customerLocation: Coordinates,
  radius: number = 10
) {
  try {
    // This uses MAPS_BACKEND_KEY on the server
    const params = new URLSearchParams({
      lat: customerLocation.lat.toString(),
      lng: customerLocation.lng.toString(),
      radius: radius.toString()
    });

    const response = await fetch(`/api/delivery/calculate/nearby?${params}`);
    const result = await response.json();
    
    return result.success ? result.data.restaurants : [];
  } catch (error) {
    console.error('Nearby restaurants error:', error);
    return [];
  }
}

// ===== COMBINED USAGE EXAMPLE =====

/**
 * Example 8: Complete Checkout Flow
 * Combines frontend and backend patterns
 */
export function CheckoutFlowExample({ restaurantId }: { restaurantId: string }) {
  const [selectedAddress, setSelectedAddress] = useState<MapAddress | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryCalculation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddressSelect = async (address: MapAddress) => {
    setSelectedAddress(address);
    setIsValidating(true);
    setValidationError(null);

    try {
      // Step 1: Validate address (Backend Key)
      const validation = await validateAddressExample(address.formattedAddress!, restaurantId);
      
      if (!validation.isValid) {
        setValidationError(validation.reason || 'Invalid address');
        setIsValidating(false);
        return;
      }

      // Step 2: Calculate delivery fee (Backend Key)
      const delivery = await calculateDeliveryFeeExample(restaurantId, address.formattedAddress!);
      
      if (delivery) {
        setDeliveryInfo(delivery);
      } else {
        setValidationError('Unable to calculate delivery fee');
      }
    } catch (error) {
      setValidationError('Service temporarily unavailable');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Checkout - Delivery Information</h3>
      
      {/* Frontend: Address selection with autocomplete */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Address
        </label>
        <AddressAutocomplete 
          onAddressSelect={handleAddressSelect}
          placeholder="Enter your delivery address..."
        />
      </div>

      {/* Loading state */}
      {isValidating && (
        <div className="flex items-center space-x-2 text-orange-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
          <span className="text-sm">Validating address and calculating delivery fee...</span>
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{validationError}</p>
        </div>
      )}

      {/* Success: Show delivery info */}
      {selectedAddress && deliveryInfo && !validationError && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Delivery Confirmed</h4>
          <p className="text-sm text-green-700 mb-2">{selectedAddress.formattedAddress}</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-green-600">Distance:</span>
              <p className="font-medium">{deliveryInfo.distance.toFixed(1)}km</p>
            </div>
            <div>
              <span className="text-green-600">Time:</span>
              <p className="font-medium">{deliveryInfo.estimatedTime} min</p>
            </div>
            <div>
              <span className="text-green-600">Fee:</span>
              <p className="font-medium">₱{deliveryInfo.totalFee}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default {
  RestaurantLocationExample,
  AddressSelectionExample,
  DeliveryTrackingExample,
  RestaurantMapExample,
  CheckoutFlowExample,
  calculateDeliveryFeeExample,
  validateAddressExample,
  findNearbyRestaurantsExample
};

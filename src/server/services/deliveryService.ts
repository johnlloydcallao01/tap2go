// Delivery Service - Backend Pattern Example
// Uses MAPS_BACKEND_KEY for server-side business logic operations

import { 
  calculateDistance, 
  calculateDistanceMatrix, 
  calculateDeliveryDetails,
  geocodeAddress,
  validateServiceableAddress 
} from './mapsService';
import { 
  Coordinates, 
  DeliveryCalculation,
  RestaurantLocation,
  NearbyRestaurant 
} from '@/lib/maps/types';
import { 
  calculateDeliveryFee, 
  estimateDeliveryTime,
  isWithinDeliveryRadius,
  adjustForPeakHours 
} from '@/lib/maps/utils';
import { db } from '@/lib/firebase-admin';
import { Restaurant } from '@/types';

// ===== 1. DISTANCE & ROUTE CALCULATIONS =====

/**
 * Calculate delivery distance and fees - Backend Operation
 */
export async function calculateDeliveryInfo(
  restaurantId: string,
  deliveryAddress: string
): Promise<DeliveryCalculation> {
  try {
    // Get restaurant location from database
    const restaurantDoc = await db.collection('restaurants').doc(restaurantId).get();
    if (!restaurantDoc.exists) {
      throw new Error('Restaurant not found');
    }
    
    const restaurant = restaurantDoc.data() as Restaurant;
    const restaurantLocation = restaurant.address.coordinates;
    
    if (!restaurantLocation) {
      throw new Error('Restaurant location not available');
    }

    // Geocode delivery address using backend key
    const geocodeResult = await geocodeAddress(deliveryAddress);
    const deliveryLocation = geocodeResult.coordinates;

    // Calculate delivery details using Google Maps backend API
    const deliveryInfo = await calculateDeliveryDetails(
      restaurantLocation,
      deliveryLocation,
      restaurant.deliveryRadius
    );

    // Adjust for peak hours
    const adjustedTime = adjustForPeakHours(deliveryInfo.estimatedTime);

    return {
      ...deliveryInfo,
      estimatedTime: adjustedTime
    };
  } catch (error) {
    console.error('Delivery calculation error:', error);
    throw error;
  }
}

/**
 * Estimate delivery time with traffic - Backend Operation
 */
export async function estimateDeliveryTimeWithTraffic(
  origin: Coordinates,
  destination: Coordinates
): Promise<number> {
  try {
    // Use Google Maps backend API for accurate time with traffic
    const distanceResult = await calculateDistance(origin, destination);
    
    // Convert seconds to minutes and adjust for peak hours
    const baseTime = Math.round(distanceResult.duration.value / 60);
    return adjustForPeakHours(baseTime);
  } catch (error) {
    console.error('Delivery time estimation error:', error);
    // Fallback to basic calculation
    return estimateDeliveryTime(0); // Will use default time
  }
}

// ===== 2. GEOCODING & ADDRESS VALIDATION =====

/**
 * Validate delivery address - Backend Operation
 */
export async function validateDeliveryAddress(address: string): Promise<{
  isValid: boolean;
  coordinates?: Coordinates;
  formattedAddress?: string;
  reason?: string;
}> {
  try {
    // Use backend geocoding service
    const validationResult = await validateServiceableAddress(address);
    
    return {
      isValid: validationResult.isServiceable,
      coordinates: validationResult.coordinates,
      formattedAddress: validationResult.formattedAddress,
      reason: validationResult.reason
    };
  } catch (error) {
    console.error('Address validation error:', error);
    return {
      isValid: false,
      reason: 'Unable to validate address'
    };
  }
}

/**
 * Standardize address format - Backend Operation
 */
export async function standardizeAddress(rawAddress: string): Promise<string> {
  try {
    const geocodeResult = await geocodeAddress(rawAddress);
    return geocodeResult.formattedAddress;
  } catch (error) {
    console.error('Address standardization error:', error);
    return rawAddress; // Return original if standardization fails
  }
}

// ===== 3. BUSINESS LOGIC OPERATIONS =====

/**
 * Find restaurants within delivery radius - Backend Operation
 */
export async function findRestaurantsInRadius(
  customerLocation: Coordinates,
  radiusKm: number = 10
): Promise<NearbyRestaurant[]> {
  try {
    // Get all active restaurants from database
    const restaurantsSnapshot = await db
      .collection('restaurants')
      .where('status', '==', 'active')
      .where('isOpen', '==', true)
      .get();

    const restaurants: Restaurant[] = [];
    restaurantsSnapshot.forEach(doc => {
      restaurants.push({ id: doc.id, ...doc.data() } as Restaurant);
    });

    // Filter restaurants with valid coordinates
    const restaurantsWithCoords = restaurants.filter(
      restaurant => restaurant.address?.coordinates
    );

    if (restaurantsWithCoords.length === 0) {
      return [];
    }

    // Calculate distances using Google Maps backend API
    const origins = [customerLocation];
    const destinations = restaurantsWithCoords.map(r => r.address.coordinates!);
    
    const distanceResults = await calculateDistanceMatrix(customerLocation, destinations);

    // Process results and filter by radius
    const nearbyRestaurants: NearbyRestaurant[] = [];
    
    for (let i = 0; i < restaurantsWithCoords.length; i++) {
      const restaurant = restaurantsWithCoords[i];
      const distanceResult = distanceResults[i];
      
      if (distanceResult.status === 'OK') {
        const distanceKm = distanceResult.distance.value / 1000;
        
        if (distanceKm <= radiusKm) {
          const deliveryTime = Math.round(distanceResult.duration.value / 60);
          const deliveryFee = calculateDeliveryFee(distanceKm);
          
          nearbyRestaurants.push({
            restaurantId: restaurant.id,
            name: restaurant.name,
            address: {
              ...restaurant.address,
              coordinates: restaurant.address.coordinates!
            },
            deliveryRadius: restaurant.deliveryRadius || 10,
            isOpen: restaurant.isOpen,
            estimatedPreparationTime: restaurant.averagePreparationTime || 30,
            distance: distanceKm,
            estimatedDeliveryTime: deliveryTime,
            deliveryFee
          });
        }
      }
    }

    // Sort by distance
    return nearbyRestaurants.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Find restaurants in radius error:', error);
    return [];
  }
}

/**
 * Check delivery availability for address - Backend Operation
 */
export async function checkDeliveryAvailability(
  address: string,
  restaurantId?: string
): Promise<{
  isAvailable: boolean;
  reason?: string;
  nearbyRestaurants?: string[];
}> {
  try {
    // Validate address first
    const addressValidation = await validateDeliveryAddress(address);
    
    if (!addressValidation.isValid) {
      return {
        isAvailable: false,
        reason: addressValidation.reason || 'Invalid address'
      };
    }

    const customerLocation = addressValidation.coordinates!;

    if (restaurantId) {
      // Check specific restaurant delivery availability
      const restaurantDoc = await db.collection('restaurants').doc(restaurantId).get();
      if (!restaurantDoc.exists) {
        return { isAvailable: false, reason: 'Restaurant not found' };
      }

      const restaurant = restaurantDoc.data() as Restaurant;
      const restaurantLocation = restaurant.address.coordinates;

      if (!restaurantLocation) {
        return { isAvailable: false, reason: 'Restaurant location not available' };
      }

      const isWithinRadius = isWithinDeliveryRadius(
        restaurantLocation,
        customerLocation,
        restaurant.deliveryRadius || 10
      );

      return {
        isAvailable: isWithinRadius,
        reason: isWithinRadius ? undefined : 'Outside delivery radius'
      };
    } else {
      // Find any available restaurants
      const nearbyRestaurants = await findRestaurantsInRadius(customerLocation, 25);
      
      return {
        isAvailable: nearbyRestaurants.length > 0,
        reason: nearbyRestaurants.length === 0 ? 'No restaurants deliver to this area' : undefined,
        nearbyRestaurants: nearbyRestaurants.map(r => r.restaurantId)
      };
    }
  } catch (error) {
    console.error('Delivery availability check error:', error);
    return {
      isAvailable: false,
      reason: 'Unable to check delivery availability'
    };
  }
}

// ===== 4. BATCH OPERATIONS & ANALYTICS =====

/**
 * Calculate bulk distances for analytics - Backend Operation
 */
export async function calculateBulkDistances(
  origin: Coordinates,
  destinations: Coordinates[]
): Promise<Array<{ destination: Coordinates; distance: number; duration: number }>> {
  try {
    const results = await calculateDistanceMatrix(origin, destinations);
    
    return results.map((result, index) => ({
      destination: destinations[index],
      distance: result.status === 'OK' ? result.distance.value / 1000 : 0,
      duration: result.status === 'OK' ? result.duration.value / 60 : 0
    }));
  } catch (error) {
    console.error('Bulk distance calculation error:', error);
    return [];
  }
}

/**
 * Analyze delivery performance metrics - Backend Operation
 */
export async function analyzeDeliveryPerformance(timeframe: 'day' | 'week' | 'month'): Promise<{
  averageDeliveryTime: number;
  averageDistance: number;
  totalDeliveries: number;
  onTimePercentage: number;
}> {
  try {
    // This would typically query your orders database
    // For now, returning mock data structure
    return {
      averageDeliveryTime: 35, // minutes
      averageDistance: 4.2,    // km
      totalDeliveries: 150,
      onTimePercentage: 92.5
    };
  } catch (error) {
    console.error('Delivery performance analysis error:', error);
    throw error;
  }
}

// ===== 5. DRIVER & LOGISTICS =====

/**
 * Find nearest available driver - Backend Operation
 */
export async function findNearestAvailableDriver(
  pickupLocation: Coordinates
): Promise<{ driverId: string; distance: number; estimatedArrival: number } | null> {
  try {
    // Get available drivers from database
    const driversSnapshot = await db
      .collection('drivers')
      .where('isOnline', '==', true)
      .where('isAvailable', '==', true)
      .get();

    if (driversSnapshot.empty) {
      return null;
    }

    const drivers: Array<{ id: string; currentLocation: Coordinates }> = [];
    driversSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.currentLocation) {
        drivers.push({
          id: doc.id,
          currentLocation: {
            lat: data.currentLocation.latitude,
            lng: data.currentLocation.longitude
          }
        });
      }
    });

    if (drivers.length === 0) {
      return null;
    }

    // Calculate distances to all drivers
    const driverLocations = drivers.map(d => d.currentLocation);
    const distanceResults = await calculateDistanceMatrix(pickupLocation, driverLocations);

    // Find nearest driver
    let nearestDriver = null;
    let shortestDistance = Infinity;

    for (let i = 0; i < drivers.length; i++) {
      const result = distanceResults[i];
      if (result.status === 'OK') {
        const distanceKm = result.distance.value / 1000;
        if (distanceKm < shortestDistance) {
          shortestDistance = distanceKm;
          nearestDriver = {
            driverId: drivers[i].id,
            distance: distanceKm,
            estimatedArrival: Math.round(result.duration.value / 60)
          };
        }
      }
    }

    return nearestDriver;
  } catch (error) {
    console.error('Find nearest driver error:', error);
    return null;
  }
}

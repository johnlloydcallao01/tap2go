// Delivery Calculation API - Backend Pattern Example
// Uses MAPS_BACKEND_KEY for server-side delivery calculations

import { NextRequest, NextResponse } from 'next/server';
import { 
  calculateDeliveryInfo,
  validateDeliveryAddress,
  findRestaurantsInRadius,
  checkDeliveryAvailability 
} from '@/server/services/deliveryService';
import { MapsApiResponse } from '@/lib/maps/types';

// POST /api/delivery/calculate - Calculate delivery fee and time
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, deliveryAddress } = body;

    // Validate input
    if (!restaurantId || !deliveryAddress) {
      return NextResponse.json({
        success: false,
        error: 'Restaurant ID and delivery address are required'
      } as MapsApiResponse, { status: 400 });
    }

    if (typeof restaurantId !== 'string' || typeof deliveryAddress !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid input format'
      } as MapsApiResponse, { status: 400 });
    }

    // Calculate delivery information using backend services
    const deliveryInfo = await calculateDeliveryInfo(restaurantId, deliveryAddress);

    return NextResponse.json({
      success: true,
      data: {
        restaurantId,
        deliveryAddress,
        ...deliveryInfo,
        currency: 'PHP'
      },
      message: 'Delivery information calculated successfully'
    } as MapsApiResponse, { status: 200 });

  } catch (error: unknown) {
    console.error('Delivery calculation API error:', error);

    // Handle specific errors
    if (error instanceof Error && error.message === 'Restaurant not found') {
      return NextResponse.json({
        success: false,
        error: 'Restaurant not found'
      } as MapsApiResponse, { status: 404 });
    }

    if (error instanceof Error && error.message === 'Restaurant location not available') {
      return NextResponse.json({
        success: false,
        error: 'Restaurant location not available'
      } as MapsApiResponse, { status: 400 });
    }

    // Handle Maps API errors
    if (error && typeof error === 'object' && 'code' in error) {
      const mapsError = error as { code: string; message: string; details?: unknown };
      return NextResponse.json({
        success: false,
        error: mapsError.message,
        details: mapsError.details
      } as MapsApiResponse, {
        status: mapsError.code === 'NOT_FOUND' ? 404 :
               mapsError.code === 'INVALID_REQUEST' ? 400 : 500
      });
    }

    // Handle unknown errors
    return NextResponse.json({
      success: false,
      error: 'Internal server error during delivery calculation'
    } as MapsApiResponse, { status: 500 });
  }
}

// PUT /api/delivery/calculate/validate - Validate delivery address
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, restaurantId } = body;

    // Validate input
    if (!address) {
      return NextResponse.json({
        success: false,
        error: 'Address is required'
      } as MapsApiResponse, { status: 400 });
    }

    if (typeof address !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Address must be a string'
      } as MapsApiResponse, { status: 400 });
    }

    // Validate address using backend services
    const addressValidation = await validateDeliveryAddress(address);

    if (!addressValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: addressValidation.reason || 'Invalid address',
        data: addressValidation
      } as MapsApiResponse, { status: 400 });
    }

    // If restaurant ID provided, check delivery availability
    let deliveryAvailability = null;
    if (restaurantId) {
      deliveryAvailability = await checkDeliveryAvailability(address, restaurantId);
    }

    return NextResponse.json({
      success: true,
      data: {
        addressValidation,
        deliveryAvailability
      },
      message: 'Address validated successfully'
    } as MapsApiResponse, { status: 200 });

  } catch (error: unknown) {
    console.error('Address validation API error:', error);

    // Handle Maps API errors
    if (error && typeof error === 'object' && 'code' in error) {
      const mapsError = error as { code: string; message: string; details?: unknown };
      return NextResponse.json({
        success: false,
        error: mapsError.message,
        details: mapsError.details
      } as MapsApiResponse, {
        status: mapsError.code === 'NOT_FOUND' ? 404 :
               mapsError.code === 'INVALID_REQUEST' ? 400 : 500
      });
    }

    // Handle unknown errors
    return NextResponse.json({
      success: false,
      error: 'Internal server error during address validation'
    } as MapsApiResponse, { status: 500 });
  }
}

// GET /api/delivery/calculate/nearby?lat=14.5995&lng=120.9842&radius=10
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radiusStr = searchParams.get('radius');

    // Validate coordinates
    if (!lat || !lng) {
      return NextResponse.json({
        success: false,
        error: 'Latitude and longitude are required'
      } as MapsApiResponse, { status: 400 });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid coordinate format'
      } as MapsApiResponse, { status: 400 });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({
        success: false,
        error: 'Coordinates out of valid range'
      } as MapsApiResponse, { status: 400 });
    }

    // Parse radius
    const radius = radiusStr ? parseFloat(radiusStr) : 10;
    if (isNaN(radius) || radius <= 0 || radius > 50) {
      return NextResponse.json({
        success: false,
        error: 'Radius must be a positive number between 0 and 50 km'
      } as MapsApiResponse, { status: 400 });
    }

    const customerLocation = { lat: latitude, lng: longitude };

    // Find nearby restaurants using backend services
    const nearbyRestaurants = await findRestaurantsInRadius(customerLocation, radius);

    return NextResponse.json({
      success: true,
      data: {
        customerLocation,
        radius,
        restaurants: nearbyRestaurants,
        count: nearbyRestaurants.length
      },
      message: `Found ${nearbyRestaurants.length} restaurants within ${radius}km`
    } as MapsApiResponse, { status: 200 });

  } catch (error: unknown) {
    console.error('Nearby restaurants API error:', error);

    // Handle Maps API errors
    if (error && typeof error === 'object' && 'code' in error) {
      const mapsError = error as { code: string; message: string; details?: unknown };
      return NextResponse.json({
        success: false,
        error: mapsError.message,
        details: mapsError.details
      } as MapsApiResponse, {
        status: mapsError.code === 'NOT_FOUND' ? 404 :
               mapsError.code === 'INVALID_REQUEST' ? 400 : 500
      });
    }

    // Handle unknown errors
    return NextResponse.json({
      success: false,
      error: 'Internal server error while finding nearby restaurants'
    } as MapsApiResponse, { status: 500 });
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

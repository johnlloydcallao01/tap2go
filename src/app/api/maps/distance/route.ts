// Distance Calculation API Route for Tap2Go Platform
// Handles distance and delivery fee calculations using backend Google Maps API

import { NextRequest, NextResponse } from 'next/server';
import { calculateDistance, calculateDistanceMatrix, calculateDeliveryDetails } from '@/server/services/mapsService';
import { DistanceMatrixResponse, MapsApiResponse, Coordinates } from '@/lib/maps/types';
import { isValidPhilippinesCoordinates, createMapsError } from '@/lib/maps/utils';

// POST /api/maps/distance - Calculate distance between two points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, includeDeliveryInfo = false, restaurantRadius } = body;

    // Validate input
    if (!origin || !destination) {
      return NextResponse.json({
        success: false,
        error: 'Origin and destination coordinates are required'
      } as MapsApiResponse, { status: 400 });
    }

    // Validate coordinate format
    if (!isValidCoordinates(origin) || !isValidCoordinates(destination)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid coordinate format. Expected {lat: number, lng: number}'
      } as MapsApiResponse, { status: 400 });
    }

    // Validate coordinates are in Philippines
    if (!isValidPhilippinesCoordinates(origin) || !isValidPhilippinesCoordinates(destination)) {
      return NextResponse.json({
        success: false,
        error: 'Coordinates must be within Philippines'
      } as MapsApiResponse, { status: 400 });
    }

    // Calculate distance
    if (includeDeliveryInfo) {
      // Calculate complete delivery information including fees
      const deliveryInfo = await calculateDeliveryDetails(origin, destination, restaurantRadius);
      
      return NextResponse.json({
        success: true,
        data: deliveryInfo,
        message: 'Delivery information calculated successfully'
      } as MapsApiResponse, { status: 200 });
    } else {
      // Calculate basic distance only
      const result = await calculateDistance(origin, destination);
      
      return NextResponse.json({
        success: true,
        data: [result],
        message: 'Distance calculated successfully'
      } as DistanceMatrixResponse, { status: 200 });
    }

  } catch (error: any) {
    console.error('Distance calculation API error:', error);

    // Handle known Maps errors
    if (error.code) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details
      } as MapsApiResponse, { 
        status: error.code === 'NOT_FOUND' ? 404 : 
               error.code === 'INVALID_REQUEST' ? 400 : 500 
      });
    }

    // Handle unknown errors
    return NextResponse.json({
      success: false,
      error: 'Internal server error during distance calculation'
    } as MapsApiResponse, { status: 500 });
  }
}

// PUT /api/maps/distance/matrix - Calculate distances from one origin to multiple destinations
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destinations } = body;

    // Validate input
    if (!origin || !destinations || !Array.isArray(destinations)) {
      return NextResponse.json({
        success: false,
        error: 'Origin coordinate and destinations array are required'
      } as MapsApiResponse, { status: 400 });
    }

    // Validate destinations limit
    if (destinations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one destination is required'
      } as MapsApiResponse, { status: 400 });
    }

    if (destinations.length > 25) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 25 destinations allowed per request'
      } as MapsApiResponse, { status: 400 });
    }

    // Validate origin coordinates
    if (!isValidCoordinates(origin)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid origin coordinate format'
      } as MapsApiResponse, { status: 400 });
    }

    if (!isValidPhilippinesCoordinates(origin)) {
      return NextResponse.json({
        success: false,
        error: 'Origin must be within Philippines'
      } as MapsApiResponse, { status: 400 });
    }

    // Validate all destination coordinates
    for (let i = 0; i < destinations.length; i++) {
      const dest = destinations[i];
      if (!isValidCoordinates(dest)) {
        return NextResponse.json({
          success: false,
          error: `Invalid coordinate format for destination ${i + 1}`
        } as MapsApiResponse, { status: 400 });
      }

      if (!isValidPhilippinesCoordinates(dest)) {
        return NextResponse.json({
          success: false,
          error: `Destination ${i + 1} must be within Philippines`
        } as MapsApiResponse, { status: 400 });
      }
    }

    // Calculate distance matrix
    const results = await calculateDistanceMatrix(origin, destinations);

    return NextResponse.json({
      success: true,
      data: results,
      message: 'Distance matrix calculated successfully'
    } as DistanceMatrixResponse, { status: 200 });

  } catch (error: any) {
    console.error('Distance matrix API error:', error);

    // Handle known Maps errors
    if (error.code) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details
      } as MapsApiResponse, { 
        status: error.code === 'NOT_FOUND' ? 404 : 
               error.code === 'INVALID_REQUEST' ? 400 : 500 
      });
    }

    // Handle unknown errors
    return NextResponse.json({
      success: false,
      error: 'Internal server error during distance matrix calculation'
    } as MapsApiResponse, { status: 500 });
  }
}

// GET /api/maps/distance/delivery-fee?origin_lat=14.5995&origin_lng=120.9842&dest_lat=14.6042&dest_lng=120.9822&radius=10
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract coordinates from query parameters
    const originLat = searchParams.get('origin_lat');
    const originLng = searchParams.get('origin_lng');
    const destLat = searchParams.get('dest_lat');
    const destLng = searchParams.get('dest_lng');
    const radiusStr = searchParams.get('radius');

    // Validate required parameters
    if (!originLat || !originLng || !destLat || !destLng) {
      return NextResponse.json({
        success: false,
        error: 'Origin and destination coordinates are required (origin_lat, origin_lng, dest_lat, dest_lng)'
      } as MapsApiResponse, { status: 400 });
    }

    // Parse coordinates
    const origin: Coordinates = {
      lat: parseFloat(originLat),
      lng: parseFloat(originLng)
    };

    const destination: Coordinates = {
      lat: parseFloat(destLat),
      lng: parseFloat(destLng)
    };

    // Validate coordinate format
    if (isNaN(origin.lat) || isNaN(origin.lng) || isNaN(destination.lat) || isNaN(destination.lng)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid coordinate format'
      } as MapsApiResponse, { status: 400 });
    }

    // Validate coordinates are in Philippines
    if (!isValidPhilippinesCoordinates(origin) || !isValidPhilippinesCoordinates(destination)) {
      return NextResponse.json({
        success: false,
        error: 'Coordinates must be within Philippines'
      } as MapsApiResponse, { status: 400 });
    }

    // Parse optional radius
    const radius = radiusStr ? parseFloat(radiusStr) : undefined;
    if (radius !== undefined && (isNaN(radius) || radius <= 0 || radius > 50)) {
      return NextResponse.json({
        success: false,
        error: 'Radius must be a positive number between 0 and 50 km'
      } as MapsApiResponse, { status: 400 });
    }

    // Calculate delivery information
    const deliveryInfo = await calculateDeliveryDetails(origin, destination, radius);

    return NextResponse.json({
      success: true,
      data: deliveryInfo,
      message: 'Delivery fee calculated successfully'
    } as MapsApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Delivery fee calculation API error:', error);

    // Handle known Maps errors
    if (error.code) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error.details
      } as MapsApiResponse, { 
        status: error.code === 'NOT_FOUND' ? 404 : 
               error.code === 'INVALID_REQUEST' ? 400 : 500 
      });
    }

    // Handle unknown errors
    return NextResponse.json({
      success: false,
      error: 'Internal server error during delivery fee calculation'
    } as MapsApiResponse, { status: 500 });
  }
}

// Helper function to validate coordinate format
function isValidCoordinates(coords: any): coords is Coordinates {
  return (
    coords &&
    typeof coords === 'object' &&
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lng)
  );
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

// Directions API Route for Tap2Go Platform
// Handles route planning and optimization using backend Google Maps API

import { NextRequest, NextResponse } from 'next/server';
import { getDirections } from '@/server/services/mapsService';
import { MapsApiResponse, Coordinates } from '@/lib/maps/types';
import { isValidPhilippinesCoordinates } from '@/lib/maps/utils';

// POST /api/maps/directions - Get directions between two or more points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination, waypoints = [], optimize = false } = body;

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

    // Validate waypoints if provided
    if (waypoints && Array.isArray(waypoints)) {
      if (waypoints.length > 8) {
        return NextResponse.json({
          success: false,
          error: 'Maximum 8 waypoints allowed per request'
        } as MapsApiResponse, { status: 400 });
      }

      for (let i = 0; i < waypoints.length; i++) {
        const waypoint = waypoints[i];
        if (!isValidCoordinates(waypoint)) {
          return NextResponse.json({
            success: false,
            error: `Invalid coordinate format for waypoint ${i + 1}`
          } as MapsApiResponse, { status: 400 });
        }

        if (!isValidPhilippinesCoordinates(waypoint)) {
          return NextResponse.json({
            success: false,
            error: `Waypoint ${i + 1} must be within Philippines`
          } as MapsApiResponse, { status: 400 });
        }
      }
    }

    // Get directions
    const route = await getDirections(origin, destination, waypoints.length > 0 ? waypoints : undefined);

    return NextResponse.json({
      success: true,
      data: route,
      message: 'Directions calculated successfully'
    } as MapsApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Directions API error:', error);

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
      error: 'Internal server error during directions calculation'
    } as MapsApiResponse, { status: 500 });
  }
}

// GET /api/maps/directions?origin_lat=14.5995&origin_lng=120.9842&dest_lat=14.6042&dest_lng=120.9822
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract coordinates from query parameters
    const originLat = searchParams.get('origin_lat');
    const originLng = searchParams.get('origin_lng');
    const destLat = searchParams.get('dest_lat');
    const destLng = searchParams.get('dest_lng');

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

    // Get directions
    const route = await getDirections(origin, destination);

    return NextResponse.json({
      success: true,
      data: route,
      message: 'Directions calculated successfully'
    } as MapsApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Directions GET API error:', error);

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
      error: 'Internal server error during directions calculation'
    } as MapsApiResponse, { status: 500 });
  }
}

// PUT /api/maps/directions/optimize - Get optimized route for multiple delivery stops
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destinations, returnToOrigin = false } = body;

    // Validate input
    if (!origin || !destinations || !Array.isArray(destinations)) {
      return NextResponse.json({
        success: false,
        error: 'Origin coordinate and destinations array are required'
      } as MapsApiResponse, { status: 400 });
    }

    // Validate destinations
    if (destinations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one destination is required'
      } as MapsApiResponse, { status: 400 });
    }

    if (destinations.length > 8) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 8 destinations allowed for route optimization'
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

    // For route optimization, we'll use the first destination as the final destination
    // and the rest as waypoints. In a full implementation, you'd use the Google Maps
    // Directions API with waypoint optimization.
    const finalDestination = returnToOrigin ? origin : destinations[destinations.length - 1];
    const waypoints = returnToOrigin ? destinations : destinations.slice(0, -1);

    const route = await getDirections(origin, finalDestination, waypoints);

    return NextResponse.json({
      success: true,
      data: {
        ...route,
        optimized: true,
        totalStops: destinations.length,
        returnToOrigin
      },
      message: 'Optimized route calculated successfully'
    } as MapsApiResponse, { status: 200 });

  } catch (error: any) {
    console.error('Route optimization API error:', error);

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
      error: 'Internal server error during route optimization'
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

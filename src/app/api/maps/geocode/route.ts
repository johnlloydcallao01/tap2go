// Geocoding API Route for Tap2Go Platform
// Handles address to coordinates conversion using backend Google Maps API

import { NextRequest, NextResponse } from 'next/server';
import { geocodeAddress, reverseGeocode, validateServiceableAddress } from '@/server/services/mapsService';
import { GeocodeResponse, MapsApiResponse } from '@/lib/maps/types';
import { isValidAddress, sanitizeSearchQuery } from '@/lib/maps/utils';

// POST /api/maps/geocode - Convert address to coordinates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, validate = false } = body;

    // Validate input
    if (!address || typeof address !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Address is required and must be a string'
      } as MapsApiResponse, { status: 400 });
    }

    const sanitizedAddress = sanitizeSearchQuery(address);
    
    if (!isValidAddress(sanitizedAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid address format'
      } as MapsApiResponse, { status: 400 });
    }

    // If validation is requested, use the validation service
    if (validate) {
      const validationResult = await validateServiceableAddress(sanitizedAddress);
      
      if (!validationResult.isServiceable) {
        return NextResponse.json({
          success: false,
          error: validationResult.reason || 'Address is not serviceable'
        } as MapsApiResponse, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: [{
          coordinates: validationResult.coordinates!,
          formattedAddress: validationResult.formattedAddress!,
          placeId: '',
          addressComponents: [],
          types: []
        }],
        message: 'Address validated and geocoded successfully'
      } as GeocodeResponse, { status: 200 });
    }

    // Regular geocoding
    const result = await geocodeAddress(sanitizedAddress);

    return NextResponse.json({
      success: true,
      data: [result],
      message: 'Address geocoded successfully'
    } as GeocodeResponse, { status: 200 });

  } catch (error: unknown) {
    console.error('Geocoding API error:', error);

    // Handle known Maps errors
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
      error: 'Internal server error during geocoding'
    } as MapsApiResponse, { status: 500 });
  }
}

// GET /api/maps/geocode?lat=14.5995&lng=120.9842 - Reverse geocode coordinates to address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

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
        error: 'Invalid coordinates format'
      } as MapsApiResponse, { status: 400 });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({
        success: false,
        error: 'Coordinates out of valid range'
      } as MapsApiResponse, { status: 400 });
    }

    const coordinates = { lat: latitude, lng: longitude };
    const result = await reverseGeocode(coordinates);

    return NextResponse.json({
      success: true,
      data: [result],
      message: 'Coordinates reverse geocoded successfully'
    } as GeocodeResponse, { status: 200 });

  } catch (error: unknown) {
    console.error('Reverse geocoding API error:', error);

    // Handle known Maps errors
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
      error: 'Internal server error during reverse geocoding'
    } as MapsApiResponse, { status: 500 });
  }
}

// PUT /api/maps/geocode/validate - Validate if address is serviceable
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    // Validate input
    if (!address || typeof address !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Address is required and must be a string'
      } as MapsApiResponse, { status: 400 });
    }

    const sanitizedAddress = sanitizeSearchQuery(address);

    if (!isValidAddress(sanitizedAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid address format'
      } as MapsApiResponse, { status: 400 });
    }

    const validationResult = await validateServiceableAddress(sanitizedAddress);

    return NextResponse.json({
      success: true,
      data: validationResult,
      message: validationResult.isServiceable
        ? 'Address is serviceable'
        : 'Address is not serviceable'
    } as MapsApiResponse, {
      status: validationResult.isServiceable ? 200 : 400
    });

  } catch (error: unknown) {
    console.error('Address validation API error:', error);

    // Handle known Maps errors
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

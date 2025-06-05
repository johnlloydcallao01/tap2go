/**
 * Restaurants API Route - Hybrid Database Approach
 * Uses Prisma for standard operations and Direct SQL for performance-critical queries
 */

import { NextRequest, NextResponse } from 'next/server';
import { RestaurantOperations } from '@/lib/database/operations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query = searchParams.get('q');
    const latitude = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const longitude = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 10;
    const cuisineTypes = searchParams.get('cuisine')?.split(',');
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const maxDeliveryFee = searchParams.get('maxDeliveryFee') ? parseFloat(searchParams.get('maxDeliveryFee')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const popular = searchParams.get('popular') === 'true';

    let restaurants;

    if (popular) {
      // Use direct SQL for performance-critical popular restaurants query
      restaurants = await RestaurantOperations.getPopularRestaurants(limit, offset);
    } else if (query || latitude || longitude || cuisineTypes || minRating || maxDeliveryFee) {
      // Use direct SQL for complex search with filters
      restaurants = await RestaurantOperations.searchRestaurants({
        query,
        latitude,
        longitude,
        radius,
        cuisineTypes,
        minRating,
        maxDeliveryFee,
        limit,
        offset
      });
    } else {
      // Use Prisma for simple listing (fallback)
      restaurants = await RestaurantOperations.getPopularRestaurants(limit, offset);
    }

    return NextResponse.json({
      success: true,
      data: restaurants,
      pagination: {
        limit,
        offset,
        hasMore: restaurants.length === limit
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Restaurants GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch restaurants',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['vendorId', 'name', 'slug', 'cuisineType', 'address', 'operatingHours'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Create restaurant using Prisma (for transaction safety)
    const restaurant = await RestaurantOperations.createRestaurant({
      vendorId: body.vendorId,
      name: body.name,
      slug: body.slug,
      description: body.description,
      cuisineType: body.cuisineType,
      address: body.address,
      coordinates: body.coordinates,
      operatingHours: body.operatingHours,
      deliverySettings: body.deliverySettings || {
        deliveryRadius: 5.0,
        minimumOrderValue: 0,
        deliveryFee: 0,
        estimatedDeliveryTime: "30-45 min"
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant
    }, { status: 201 });

  } catch (error) {
    console.error('Restaurant POST error:', error);
    
    // Handle unique constraint violations
    if (error.message?.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Restaurant already exists',
          message: 'A restaurant with this slug already exists'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create restaurant',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Restaurants API Route - Hybrid Database Approach
 * Uses Firestore for restaurant operations and Prisma for CMS content
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRestaurants, searchRestaurants, createRestaurant } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const query = searchParams.get('q');
    const cuisineTypes = searchParams.get('cuisine')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let restaurants;

    if (query || cuisineTypes) {
      // Use Firestore search for filtering
      restaurants = await searchRestaurants(
        query || '',
        cuisineTypes && cuisineTypes.length > 0 ? cuisineTypes[0] : undefined
      );
    } else {
      // Use Firestore for standard restaurant listing
      restaurants = await getRestaurants(limit);
    }

    // Handle different return types from search vs getRestaurants
    const restaurantList = Array.isArray(restaurants) ? restaurants : restaurants?.restaurants || [];
    const hasMore = Array.isArray(restaurants) ? restaurants.length === limit : restaurants?.hasMore || false;

    return NextResponse.json({
      success: true,
      data: restaurantList,
      pagination: {
        limit,
        offset,
        hasMore
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

    // Create restaurant using Firestore
    const restaurantId = await createRestaurant({
      ownerId: body.vendorId,
      name: body.name,
      description: body.description,
      cuisine: body.cuisineType,
      address: body.address,
      phone: body.phone || '',
      email: body.email || '',
      image: body.image || '',
      coverImage: body.coverImage || '',
      openingHours: body.operatingHours || {
        monday: { open: '09:00', close: '22:00', isClosed: false },
        tuesday: { open: '09:00', close: '22:00', isClosed: false },
        wednesday: { open: '09:00', close: '22:00', isClosed: false },
        thursday: { open: '09:00', close: '22:00', isClosed: false },
        friday: { open: '09:00', close: '22:00', isClosed: false },
        saturday: { open: '09:00', close: '22:00', isClosed: false },
        sunday: { open: '09:00', close: '22:00', isClosed: false }
      },
      deliveryFee: body.deliverySettings?.deliveryFee || 0,
      minimumOrder: body.deliverySettings?.minimumOrderValue || 0,
      deliveryTime: body.deliverySettings?.estimatedDeliveryTime || "30-45 min",
      rating: 0,
      reviewCount: 0,
      isOpen: true,
      featured: false,
      status: 'pending',
      commissionRate: 0.15,
      totalOrders: 0,
      totalRevenue: 0,
      averagePreparationTime: 30
    });

    return NextResponse.json({
      success: true,
      message: 'Restaurant created successfully',
      data: { id: restaurantId }
    }, { status: 201 });

  } catch (error) {
    console.error('Restaurant POST error:', error);
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message?.includes('Unique constraint')) {
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

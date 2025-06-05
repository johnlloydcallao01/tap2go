/**
 * Restaurant Detail API Route - Hybrid Database Approach
 * Uses Prisma for detailed restaurant data with relations
 */

import { NextRequest, NextResponse } from 'next/server';
import { RestaurantOperations } from '@/lib/database/operations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Use Prisma for detailed restaurant data with relations
    const restaurant = await RestaurantOperations.getRestaurantWithMenu(restaurantId);

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: restaurant,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Restaurant detail GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch restaurant details',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const body = await request.json();

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Use Prisma for update operations
    const updatedRestaurant = await RestaurantOperations.updateRestaurant(restaurantId, body);

    return NextResponse.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: updatedRestaurant
    });

  } catch (error) {
    console.error('Restaurant PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update restaurant',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Soft delete - set isActive to false
    const deletedRestaurant = await RestaurantOperations.updateRestaurant(restaurantId, {
      isActive: false
    });

    return NextResponse.json({
      success: true,
      message: 'Restaurant deleted successfully',
      data: deletedRestaurant
    });

  } catch (error) {
    console.error('Restaurant DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete restaurant',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Restaurant Detail API Route - Firestore Implementation
 * Uses Firestore for restaurant data and menu relations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantById, updateRestaurant } from '@/lib/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Use Firestore for restaurant data
    const restaurant = await getRestaurantById(restaurantId);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;
    const body = await request.json();

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Use Firestore for update operations
    await updateRestaurant(restaurantId, body);
    const updatedRestaurant = await getRestaurantById(restaurantId);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Soft delete - set status to inactive
    await updateRestaurant(restaurantId, {
      status: 'inactive'
    });
    const deletedRestaurant = await getRestaurantById(restaurantId);

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

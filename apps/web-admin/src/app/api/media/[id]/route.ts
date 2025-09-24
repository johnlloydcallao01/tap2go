/**
 * Media ID API Route (Non-functional - Demo Only)
 * Preserves endpoint structure without authentication functionality
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Simulate successful media fetch response (non-functional)
    return NextResponse.json({
      success: true,
      message: 'Demo mode - media API disabled',
      data: {
        id: id,
        url: `/demo-image-${id}.jpg`,
        name: `Demo Image ${id}`,
        type: 'image/jpeg'
      }
    });

  } catch (error) {
    console.error('Media ID API error:', error);
    return NextResponse.json(
      { error: 'Demo mode - media API disabled' },
      { status: 200 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const _body = await request.json();
    
    // Simulate successful media update response (non-functional)
    return NextResponse.json({
      success: true,
      message: 'Demo mode - media update disabled',
      data: {
        id: id,
        updated: true
      }
    });

  } catch (error) {
    console.error('Media update API error:', error);
    return NextResponse.json(
      { error: 'Demo mode - media update disabled' },
      { status: 200 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Simulate successful media delete response (non-functional)
    return NextResponse.json({
      success: true,
      message: 'Demo mode - media delete disabled',
      deletedId: id
    });

  } catch (error) {
    console.error('Media delete API error:', error);
    return NextResponse.json(
      { error: 'Demo mode - media delete disabled' },
      { status: 200 }
    );
  }
}

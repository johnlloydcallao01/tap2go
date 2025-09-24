/**
 * Media API Route (Non-functional - Demo Only)
 * Preserves endpoint structure without authentication functionality
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Simulate successful media fetch response (non-functional)
    return NextResponse.json({
      success: true,
      message: 'Demo mode - media API disabled',
      data: []
    });

  } catch (error) {
    console.error('Media API error:', error);
    return NextResponse.json(
      { error: 'Demo mode - media API disabled' },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const _body = await request.json();
    
    // Simulate successful media upload response (non-functional)
    return NextResponse.json({
      success: true,
      message: 'Demo mode - media upload disabled',
      data: {
        id: 'demo-media-' + Date.now(),
        url: '/demo-image.jpg'
      }
    });

  } catch (error) {
    console.error('Media upload API error:', error);
    return NextResponse.json(
      { error: 'Demo mode - media upload disabled' },
      { status: 200 }
    );
  }
}

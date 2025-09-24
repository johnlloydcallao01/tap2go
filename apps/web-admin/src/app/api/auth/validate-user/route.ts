/**
 * Admin User Validation API Route (Non-functional - Demo Only)
 * Preserves endpoint structure without authentication functionality
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const _body = await request.json();
    
    // Simulate successful validation response (non-functional)
    return NextResponse.json({
      success: true,
      message: 'Demo mode - user validation disabled',
      valid: true
    });

  } catch (error) {
    console.error('Validate user API error:', error);
    return NextResponse.json(
      { error: 'Demo mode - user validation disabled' },
      { status: 200 }
    );
  }
}

/**
 * Admin Logout API Route (Non-functional - Demo Only)
 * Preserves endpoint structure without authentication functionality
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    // Simulate successful logout response (non-functional)
    return NextResponse.json({
      success: true,
      message: 'Demo mode - logout simulated'
    });

  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'Demo mode - logout simulated' },
      { status: 200 }
    );
  }
}

/**
 * Admin Auth Verify API Route (Non-functional - Demo Only)
 * Preserves endpoint structure without authentication functionality
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Simulate successful verification response (non-functional)
    return NextResponse.json({
      success: true,
      message: 'Demo mode - authentication disabled',
      user: {
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo Admin',
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('Verify API error:', error);
    return NextResponse.json(
      { error: 'Demo mode - authentication disabled' },
      { status: 200 }
    );
  }
}

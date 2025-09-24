/**
 * Test CMS API Route (Non-functional - Demo Only)
 * Preserves endpoint structure without authentication functionality
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Simulate successful CMS test response (non-functional)
    return NextResponse.json({
      success: true,
      message: 'Demo mode - CMS test disabled',
      status: 'connected',
      timestamp: new Date().toISOString(),
      version: 'demo-v1.0.0'
    });

  } catch (error) {
    console.error('Test CMS API error:', error);
    return NextResponse.json(
      { error: 'Demo mode - CMS test disabled' },
      { status: 200 }
    );
  }
}

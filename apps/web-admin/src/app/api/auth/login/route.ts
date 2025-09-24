/**
 * Admin Login API Route (Non-functional - Demo Only)
 * Preserves endpoint structure without authentication functionality
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation for UI purposes
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Simulate successful login response (non-functional)
    return NextResponse.json({
      success: true,
      message: 'Demo mode - authentication disabled',
      user: {
        id: 'demo-user',
        email: email,
        name: 'Demo Admin',
        role: 'admin'
      },
      token: 'demo-token-' + Date.now()
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Demo mode - authentication disabled' },
      { status: 200 }
    );
  }
}

/**
 * @file apps/web/src/app/api/users/[userId]/active-address/route.ts
 * @description API routes for managing user's active address
 * Proxies requests to PayloadCMS backend with proper authentication
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.grandlinemaritime.com';

/**
 * GET /api/users/[userId]/active-address
 * Get user's active address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get user token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Forward request to PayloadCMS
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/active-address`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to get active address' },
        { status: response.status }
      );
    }

    // Transform the response to match frontend expectations
    return NextResponse.json({
      success: true,
      address: data.data?.activeAddress || null,
    });

  } catch (error) {
    console.error('Error getting active address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[userId]/active-address
 * Set user's active address
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const body = await request.json();

    // Get user token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Forward request to PayloadCMS
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/active-address`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to set active address' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Active address updated successfully',
    });

  } catch (error) {
    console.error('Error setting active address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
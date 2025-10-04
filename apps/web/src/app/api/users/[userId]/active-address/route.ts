/**
 * @file apps/web/src/app/api/users/[userId]/active-address/route.ts
 * @description API routes for managing user's active address
 * Proxies requests to PayloadCMS backend with proper authentication
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';

/**
 * GET /api/users/[userId]/active-address
 * Get user's active address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

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
    const response = await fetch(`${API_BASE_URL}/users/${userId}/active-address`, {
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
  { params }: { params: Promise<{ userId: string }> }
) {
  const requestId = Math.random().toString(36).substr(2, 9);
  const startTime = Date.now();
  
  console.log(`🔄 [${requestId}] === PATCH ACTIVE ADDRESS API STARTED ===`);
  
  try {
    const { userId } = await params;
    console.log(`📋 [${requestId}] Route Parameters:`, { userId });
    
    let body;
    try {
      body = await request.json();
      console.log(`📦 [${requestId}] Request Body:`, body);
    } catch (parseError) {
      console.error(`❌ [${requestId}] Failed to parse request body:`, parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Get user token from Authorization header
    console.log(`🔑 [${requestId}] Checking authorization header...`);
    const authHeader = request.headers.get('authorization');
    console.log(`🔑 [${requestId}] Auth header present:`, !!authHeader);
    console.log(`🔑 [${requestId}] Auth header format:`, authHeader ? `${authHeader.substring(0, 20)}...` : 'None');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error(`❌ [${requestId}] No valid authorization token provided`);
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    console.log(`✅ [${requestId}] Authorization token extracted successfully`);

    // Forward request to PayloadCMS
    const cmsUrl = `${API_BASE_URL}/users/${userId}/active-address`;
    console.log(`🌐 [${requestId}] Forwarding to CMS:`, {
      url: cmsUrl,
      method: 'PATCH',
      hasToken: !!token,
      bodyData: body
    });

    const cmsStartTime = Date.now();
    const response = await fetch(cmsUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const cmsResponseTime = Date.now() - cmsStartTime;
    console.log(`📡 [${requestId}] CMS Response:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      responseTime: `${cmsResponseTime}ms`,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });

    let data;
    try {
      data = await response.json();
      console.log(`📄 [${requestId}] CMS Response Data:`, data);
    } catch (parseError) {
      console.error(`❌ [${requestId}] Failed to parse CMS response:`, parseError);
      const responseText = await response.text();
      console.error(`📄 [${requestId}] Raw CMS Response:`, responseText);
      return NextResponse.json(
        { error: 'Invalid response from backend service' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error(`❌ [${requestId}] CMS request failed:`, {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        data
      });
      return NextResponse.json(
        { error: data.error || 'Failed to set active address' },
        { status: response.status }
      );
    }

    const totalResponseTime = Date.now() - startTime;
    console.log(`✅ [${requestId}] === PATCH ACTIVE ADDRESS SUCCESS ===`, {
      totalResponseTime: `${totalResponseTime}ms`,
      cmsResponseTime: `${cmsResponseTime}ms`
    });

    return NextResponse.json({
      success: true,
      message: 'Active address updated successfully',
    });

  } catch (error) {
    const totalResponseTime = Date.now() - startTime;
    console.error(`💥 [${requestId}] === PATCH ACTIVE ADDRESS ERROR ===`);
    console.error(`❌ [${requestId}] Error Details:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
      totalResponseTime: `${totalResponseTime}ms`
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
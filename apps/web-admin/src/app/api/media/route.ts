/**
 * Media API Proxy Endpoint
 * Proxies media requests to the CMS server with proper authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'https://tap2go-cms.vercel.app';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  cmsToken: string;
  iat: number;
  exp: number;
}

/**
 * GET /api/media - List media files
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Forward request to CMS
    const cmsResponse = await fetch(`${CMS_BASE_URL}/api/media${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `JWT ${payload.cmsToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!cmsResponse.ok) {
      const errorText = await cmsResponse.text();
      console.error('CMS media fetch error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch media from CMS' },
        { status: cmsResponse.status }
      );
    }

    const mediaData = await cmsResponse.json();
    return NextResponse.json(mediaData);

  } catch (error) {
    console.error('Media API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/media - Upload media file
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Basic validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Forward request to CMS
    const cmsResponse = await fetch(`${CMS_BASE_URL}/api/media`, {
      method: 'POST',
      headers: {
        'Authorization': `JWT ${payload.cmsToken}`,
        // Don't set Content-Type for FormData
      },
      body: formData,
    });

    if (!cmsResponse.ok) {
      const errorText = await cmsResponse.text();
      console.error('CMS media upload error:', cmsResponse.status, errorText);
      return NextResponse.json(
        { error: 'Failed to upload media to CMS' },
        { status: cmsResponse.status }
      );
    }

    const uploadResult = await cmsResponse.json();
    return NextResponse.json(uploadResult);

  } catch (error) {
    console.error('Media upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

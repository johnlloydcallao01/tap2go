/**
 * Individual Media File API Proxy Endpoint
 * Handles GET, PATCH, DELETE operations for individual media files
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
 * GET /api/media/[id] - Get single media file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Forward request to CMS
    const cmsResponse = await fetch(`${CMS_BASE_URL}/api/media/${params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `JWT ${payload.cmsToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!cmsResponse.ok) {
      const errorText = await cmsResponse.text();
      console.error('CMS media get error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get media from CMS' },
        { status: cmsResponse.status }
      );
    }

    const mediaData = await cmsResponse.json();
    return NextResponse.json(mediaData);

  } catch (error) {
    console.error('Media get API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/media/[id] - Update media file metadata
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get request body
    const body = await request.json();

    // Forward request to CMS
    const cmsResponse = await fetch(`${CMS_BASE_URL}/api/media/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `JWT ${payload.cmsToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!cmsResponse.ok) {
      const errorText = await cmsResponse.text();
      console.error('CMS media update error:', errorText);
      return NextResponse.json(
        { error: 'Failed to update media in CMS' },
        { status: cmsResponse.status }
      );
    }

    const updateResult = await cmsResponse.json();
    return NextResponse.json(updateResult);

  } catch (error) {
    console.error('Media update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/media/[id] - Delete media file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Forward request to CMS
    const cmsResponse = await fetch(`${CMS_BASE_URL}/api/media/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `JWT ${payload.cmsToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!cmsResponse.ok) {
      const errorText = await cmsResponse.text();
      console.error('CMS media delete error:', errorText);
      return NextResponse.json(
        { error: 'Failed to delete media from CMS' },
        { status: cmsResponse.status }
      );
    }

    // Return success response
    return NextResponse.json({ message: 'Media deleted successfully' });

  } catch (error) {
    console.error('Media delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

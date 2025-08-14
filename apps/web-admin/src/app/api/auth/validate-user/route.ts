/**
 * User Validation API Endpoint
 * Lightweight endpoint to check if user still exists and has admin role
 * Used for real-time validation without full token verification
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:3000';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  cmsToken: string;
  iat: number;
  exp: number;
}

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required', valid: false },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token', valid: false },
        { status: 401 }
      );
    }

    // Quick validation against CMS using the /users/me endpoint
    try {
      const cmsResponse = await fetch(`${CMS_BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `JWT ${payload.cmsToken}`,
        },
      });

      if (!cmsResponse.ok) {
        // User no longer exists or CMS token is invalid
        return NextResponse.json(
          { error: 'User no longer exists', valid: false },
          { status: 404 }
        );
      }

      const cmsData = await cmsResponse.json();
      const userData = cmsData.user;

      // Check if user still has admin role and is active
      if (userData.role !== 'admin') {
        return NextResponse.json(
          { error: 'User no longer has admin privileges', valid: false },
          { status: 403 }
        );
      }

      if (userData.isActive === false) {
        return NextResponse.json(
          { error: 'User account is inactive', valid: false },
          { status: 403 }
        );
      }

      // User is valid
      return NextResponse.json({
        valid: true,
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          isActive: userData.isActive,
        },
      });

    } catch (cmsError) {
      console.error('CMS validation error:', cmsError);
      
      // If CMS is unavailable, we can't validate - return invalid for security
      return NextResponse.json(
        { error: 'Unable to validate user. Please login again.', valid: false },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('User validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed', valid: false },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}

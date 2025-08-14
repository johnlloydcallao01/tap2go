/**
 * Admin Token Verification API Endpoint
 * Verifies admin JWT tokens and returns user data
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

interface CMSUser {
  id: number;
  email: string;
  role: 'admin' | 'driver' | 'vendor' | 'customer';
  firstName: string;
  lastName: string;
  phone?: string | null;
  isActive?: boolean | null;
  isVerified?: boolean | null;
}

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

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

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

    // Verify user still has admin role by checking with CMS
    try {
      const cmsResponse = await fetch(`${CMS_BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `JWT ${payload.cmsToken}`,
        },
      });

      if (!cmsResponse.ok) {
        // CMS token is invalid, user needs to re-login
        return NextResponse.json(
          { error: 'Session expired. Please login again.' },
          { status: 401 }
        );
      }

      const userData: { user: CMSUser } = await cmsResponse.json();

      // Verify user still has admin role
      if (userData.user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }

      // Check if user is still active
      if (userData.user.isActive === false) {
        return NextResponse.json(
          { error: 'Account is inactive. Please contact an administrator.' },
          { status: 403 }
        );
      }

      // Return current user data
      return NextResponse.json({
        user: {
          id: userData.user.id,
          email: userData.user.email,
          role: userData.user.role,
          firstName: userData.user.firstName,
          lastName: userData.user.lastName,
          phone: userData.user.phone,
          isActive: userData.user.isActive,
          isVerified: userData.user.isVerified,
        },
      });

    } catch (cmsError) {
      console.error('CMS verification error:', cmsError);
      
      // If CMS is unavailable, we can still trust our JWT for a short time
      // But we should return minimal data
      if (Date.now() / 1000 - payload.iat < 3600) { // Token is less than 1 hour old
        return NextResponse.json({
          user: {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
            firstName: '', // We don't have this in JWT
            lastName: '',
            phone: null,
            isActive: true, // Assume active if we can't verify
            isVerified: true,
          },
        });
      } else {
        return NextResponse.json(
          { error: 'Unable to verify session. Please login again.' },
          { status: 503 }
        );
      }
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}

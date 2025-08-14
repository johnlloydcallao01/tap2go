/**
 * Admin Logout API Endpoint
 * Handles admin user logout
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
      // No token provided, consider it already logged out
      return NextResponse.json({ message: 'Logged out successfully' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify and decode JWT token to get CMS token
    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
      // Invalid token, consider it already logged out
      return NextResponse.json({ message: 'Logged out successfully' });
    }

    // Attempt to logout from CMS (optional, as CMS might not have logout endpoint)
    try {
      await fetch(`${CMS_BASE_URL}/api/users/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `JWT ${payload.cmsToken}`,
        },
      });
    } catch (cmsError) {
      // CMS logout failed, but we can still consider local logout successful
      console.warn('CMS logout failed:', cmsError);
    }

    // Return success (token invalidation happens on client side)
    return NextResponse.json({ 
      message: 'Logged out successfully' 
    });

  } catch (error) {
    console.error('Logout API error:', error);
    
    // Even if there's an error, we should still allow logout
    return NextResponse.json({ 
      message: 'Logged out successfully' 
    });
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

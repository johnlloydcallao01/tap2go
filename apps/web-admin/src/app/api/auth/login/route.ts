/**
 * Admin Login API Endpoint
 * Authenticates admin users against the CMS backend
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// CMS API configuration
const CMS_BASE_URL = process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

interface LoginRequest {
  email: string;
  password: string;
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

interface CMSLoginResponse {
  user: CMSUser;
  token: string;
  exp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate with CMS
    const cmsResponse = await fetch(`${CMS_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!cmsResponse.ok) {
      const errorData = await cmsResponse.json().catch(() => ({}));
      
      if (cmsResponse.status === 401) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: errorData.message || 'Authentication failed' },
        { status: cmsResponse.status }
      );
    }

    const cmsData: CMSLoginResponse = await cmsResponse.json();

    // Verify user has admin role
    if (cmsData.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Check if user is active
    if (cmsData.user.isActive === false) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact an administrator.' },
        { status: 403 }
      );
    }

    // Create our own JWT token for the admin session
    const adminToken = jwt.sign(
      {
        userId: cmsData.user.id,
        email: cmsData.user.email,
        role: cmsData.user.role,
        cmsToken: cmsData.token, // Store CMS token for API calls
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data and token
    return NextResponse.json({
      user: {
        id: cmsData.user.id,
        email: cmsData.user.email,
        role: cmsData.user.role,
        firstName: cmsData.user.firstName,
        lastName: cmsData.user.lastName,
        phone: cmsData.user.phone,
        isActive: cmsData.user.isActive,
        isVerified: cmsData.user.isVerified,
      },
      token: adminToken,
    });

  } catch (error) {
    console.error('Login API error:', error);
    
    // Handle network errors or CMS unavailable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Unable to connect to authentication service. Please try again later.' },
        { status: 503 }
      );
    }

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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

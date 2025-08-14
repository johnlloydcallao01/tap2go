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
        {
          error: 'Email and password are required',
          errorType: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: 'Please enter a valid email address',
          errorType: 'INVALID_EMAIL'
        },
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
          {
            error: 'Invalid email or password. Please check your credentials and try again.',
            errorType: 'INVALID_CREDENTIALS'
          },
          { status: 401 }
        );
      }

      if (cmsResponse.status === 429) {
        return NextResponse.json(
          {
            error: 'Too many login attempts. Please wait a few minutes before trying again.',
            errorType: 'RATE_LIMITED'
          },
          { status: 429 }
        );
      }

      if (cmsResponse.status >= 500) {
        return NextResponse.json(
          {
            error: 'Server error. Please try again later.',
            errorType: 'SERVER_ERROR'
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          error: errorData.message || 'Authentication failed. Please try again.',
          errorType: 'AUTH_FAILED'
        },
        { status: cmsResponse.status }
      );
    }

    const cmsData: CMSLoginResponse = await cmsResponse.json();

    // Verify user has admin role
    if (cmsData.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Access denied. This account does not have administrator privileges.',
          errorType: 'INSUFFICIENT_PRIVILEGES'
        },
        { status: 403 }
      );
    }

    // Check if user is active
    if (cmsData.user.isActive === false) {
      return NextResponse.json(
        {
          error: 'Your account has been deactivated. Please contact an administrator for assistance.',
          errorType: 'ACCOUNT_INACTIVE'
        },
        { status: 403 }
      );
    }

    // Create our own JWT token for the admin session (shorter expiry for security)
    const adminToken = jwt.sign(
      {
        userId: cmsData.user.id,
        email: cmsData.user.email,
        role: cmsData.user.role,
        cmsToken: cmsData.token, // Store CMS token for API calls
      },
      JWT_SECRET,
      { expiresIn: '2h' } // Reduced from 24h to 2h for better security
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
        {
          error: 'Unable to connect to authentication service. Please check your internet connection and try again.',
          errorType: 'NETWORK_ERROR'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again later.',
        errorType: 'INTERNAL_ERROR'
      },
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

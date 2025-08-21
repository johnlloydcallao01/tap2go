/**
 * Test CMS Connection
 * Simple endpoint to test if we can connect to the CMS
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
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Test 1: Basic CMS connection
    console.log('🧪 Testing CMS connection...');
    const healthResponse = await fetch(`${CMS_BASE_URL}/api/media`, {
      method: 'GET',
      headers: {
        'Authorization': `JWT ${payload.cmsToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('CMS response status:', healthResponse.status);
    
    if (!healthResponse.ok) {
      const errorText = await healthResponse.text();
      console.error('CMS connection error:', errorText);
      return NextResponse.json({
        success: false,
        error: 'CMS connection failed',
        details: errorText,
        status: healthResponse.status
      });
    }

    const mediaData = await healthResponse.json();
    
    return NextResponse.json({
      success: true,
      message: 'CMS connection successful',
      mediaCount: mediaData.totalDocs || 0,
      cmsUrl: CMS_BASE_URL,
      hasToken: !!payload.cmsToken
    });

  } catch (error) {
    console.error('Test CMS error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

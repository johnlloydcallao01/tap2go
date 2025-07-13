import { NextRequest, NextResponse } from 'next/server';
import { verifyDriverAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'No authorization header' },
        { status: 401 }
      );
    }

    const result = await verifyDriverAuth(authHeader);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Driver authenticated successfully',
      user: result.user
    });

  } catch (error) {
    console.error('Driver auth API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

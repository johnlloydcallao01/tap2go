import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.message },
        { status: 401 }
      );
    }

    // This is a test endpoint to verify admin authentication is working
    return NextResponse.json({
      success: true,
      message: 'Admin authentication is working!',
      user: {
        uid: authResult.user?.uid,
        email: authResult.user?.email,
        role: authResult.user?.role
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in admin test endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Test failed' 
      },
      { status: 500 }
    );
  }
}

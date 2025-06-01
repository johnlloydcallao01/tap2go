import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminGetDriverAnalytics } from '@/server/services/drivers';

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

    // Get driver analytics using admin service
    const analytics = await adminGetDriverAnalytics();

    return NextResponse.json({ 
      success: true, 
      data: analytics 
    });

  } catch (error) {
    console.error('Error fetching driver analytics:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to fetch driver analytics' 
      },
      { status: 500 }
    );
  }
}

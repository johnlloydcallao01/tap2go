import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminGetVendorAnalytics } from '@/server/services/vendors';

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

    // Get vendor analytics using admin service
    const analytics = await adminGetVendorAnalytics();

    return NextResponse.json({ 
      success: true, 
      data: analytics 
    });

  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to fetch vendor analytics' 
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminGetOrderAnalytics } from '@/server/services/orders';

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Prepare date range if provided
    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    // Get order analytics using admin service
    const analytics = await adminGetOrderAnalytics(dateRange);

    return NextResponse.json({ 
      success: true, 
      data: analytics 
    });

  } catch (error) {
    console.error('Error fetching order analytics:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to fetch order analytics' 
      },
      { status: 500 }
    );
  }
}

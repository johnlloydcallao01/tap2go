import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminGetPendingDrivers } from '@/server/services/drivers';

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

    // Get pending drivers using admin service
    const pendingDrivers = await adminGetPendingDrivers();

    return NextResponse.json({ 
      success: true, 
      data: pendingDrivers 
    });

  } catch (error) {
    console.error('Error fetching pending drivers:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to fetch pending drivers' 
      },
      { status: 500 }
    );
  }
}

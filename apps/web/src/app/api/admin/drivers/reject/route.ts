import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminRejectDriver } from '@/server/services/drivers';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.message },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { driverUid, reason } = body;

    if (!driverUid) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'driverUid is required' },
        { status: 400 }
      );
    }

    // Reject driver using admin service
    await adminRejectDriver(driverUid, reason || 'No reason provided');

    return NextResponse.json({ 
      success: true, 
      message: 'Driver rejected successfully' 
    });

  } catch (error) {
    console.error('Error rejecting driver:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to reject driver' 
      },
      { status: 500 }
    );
  }
}

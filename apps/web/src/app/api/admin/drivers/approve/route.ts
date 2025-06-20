import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminApproveDriver } from '@/server/services/drivers';

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
    const { driverUid } = body;

    if (!driverUid) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'driverUid is required' },
        { status: 400 }
      );
    }

    // Approve driver using admin service
    await adminApproveDriver(driverUid, authResult.user!.uid);

    return NextResponse.json({ 
      success: true, 
      message: 'Driver approved successfully' 
    });

  } catch (error) {
    console.error('Error approving driver:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to approve driver' 
      },
      { status: 500 }
    );
  }
}

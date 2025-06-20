import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminRejectVendor } from '@/server/services/vendors';

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
    const { vendorUid, reason } = body;

    if (!vendorUid) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'vendorUid is required' },
        { status: 400 }
      );
    }

    // Reject vendor using admin service
    await adminRejectVendor(vendorUid, reason || 'No reason provided');

    return NextResponse.json({ 
      success: true, 
      message: 'Vendor rejected successfully' 
    });

  } catch (error) {
    console.error('Error rejecting vendor:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to reject vendor' 
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminApproveVendor } from '@/server/services/vendors';

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
    const { vendorUid } = body;

    if (!vendorUid) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'vendorUid is required' },
        { status: 400 }
      );
    }

    // Approve vendor using admin service
    await adminApproveVendor(vendorUid, authResult.user!.uid);

    return NextResponse.json({ 
      success: true, 
      message: 'Vendor approved successfully' 
    });

  } catch (error) {
    console.error('Error approving vendor:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to approve vendor' 
      },
      { status: 500 }
    );
  }
}

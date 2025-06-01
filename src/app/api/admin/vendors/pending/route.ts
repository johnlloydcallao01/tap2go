import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminGetPendingVendors } from '@/server/services/vendors';

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

    // Get pending vendors using admin service
    const pendingVendors = await adminGetPendingVendors();

    return NextResponse.json({ 
      success: true, 
      data: pendingVendors 
    });

  } catch (error) {
    console.error('Error fetching pending vendors:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to fetch pending vendors' 
      },
      { status: 500 }
    );
  }
}

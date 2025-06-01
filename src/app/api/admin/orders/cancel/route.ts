import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminCancelOrder } from '@/server/services/orders';

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
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'orderId is required' },
        { status: 400 }
      );
    }

    // Cancel order using admin service
    await adminCancelOrder(orderId, reason || 'Cancelled by admin', authResult.user!.uid);

    return NextResponse.json({ 
      success: true, 
      message: 'Order cancelled successfully' 
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to cancel order' 
      },
      { status: 500 }
    );
  }
}

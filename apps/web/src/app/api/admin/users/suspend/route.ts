import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminSuspendUser } from '@/server/services/users';

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
    const { userUid, reason } = body;

    if (!userUid) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'userUid is required' },
        { status: 400 }
      );
    }

    // Suspend user using admin service
    await adminSuspendUser(userUid, reason || 'No reason provided', authResult.user!.uid);

    return NextResponse.json({ 
      success: true, 
      message: 'User suspended successfully' 
    });

  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to suspend user' 
      },
      { status: 500 }
    );
  }
}

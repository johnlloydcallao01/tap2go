import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { adminSearchUsers } from '@/server/services/users';

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
    const searchTerm = searchParams.get('q');

    if (!searchTerm) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Search query (q) is required' },
        { status: 400 }
      );
    }

    // Search users using admin service
    const users = await adminSearchUsers(searchTerm);

    return NextResponse.json({ 
      success: true, 
      data: users 
    });

  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to search users' 
      },
      { status: 500 }
    );
  }
}

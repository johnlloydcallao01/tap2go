import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';

/**
 * GET - Fetch users for admin panel
 */
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // For now, return mock data to prevent endless loading
    // TODO: Replace with actual database queries
    const mockUsers = [
      {
        id: '1',
        email: 'john.doe@email.com',
        name: 'John Doe',
        role: 'customer',
        isActive: true,
        isVerified: true,
        createdAt: '2024-01-15T10:30:00Z',
        lastLoginAt: '2024-01-20T09:15:00Z',
      },
      {
        id: '2',
        email: 'jane.smith@email.com',
        name: 'Jane Smith',
        role: 'vendor',
        isActive: true,
        isVerified: true,
        createdAt: '2024-01-10T14:20:00Z',
        lastLoginAt: '2024-01-19T16:45:00Z',
      },
      {
        id: '3',
        email: 'mike.johnson@email.com',
        name: 'Mike Johnson',
        role: 'driver',
        isActive: true,
        isVerified: true,
        createdAt: '2024-01-08T11:00:00Z',
        lastLoginAt: '2024-01-20T08:30:00Z',
      },
      {
        id: '4',
        email: 'sarah.davis@email.com',
        name: 'Sarah Davis',
        role: 'driver',
        isActive: false,
        isVerified: true,
        createdAt: '2024-01-12T09:15:00Z',
        lastLoginAt: '2024-01-18T12:20:00Z',
      },
      {
        id: '5',
        email: 'admin@tap2go.com',
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        isVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: '2024-01-20T10:00:00Z',
      },
    ];

    // Apply filters
    let filteredUsers = mockUsers;
    
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    if (status && status !== 'all') {
      if (status === 'active') {
        filteredUsers = filteredUsers.filter(user => user.isActive);
      } else if (status === 'inactive') {
        filteredUsers = filteredUsers.filter(user => !user.isActive);
      } else if (status === 'verified') {
        filteredUsers = filteredUsers.filter(user => user.isVerified);
      } else if (status === 'unverified') {
        filteredUsers = filteredUsers.filter(user => !user.isVerified);
      }
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit)
      },
      stats: {
        totalUsers: mockUsers.length,
        activeUsers: mockUsers.filter(u => u.isActive).length,
        verifiedUsers: mockUsers.filter(u => u.isVerified).length,
        customerCount: mockUsers.filter(u => u.role === 'customer').length,
        vendorCount: mockUsers.filter(u => u.role === 'vendor').length,
        driverCount: mockUsers.filter(u => u.role === 'driver').length,
        adminCount: mockUsers.filter(u => u.role === 'admin').length,
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to fetch users' 
      },
      { status: 500 }
    );
  }
}

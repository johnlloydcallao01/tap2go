import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';

/**
 * GET - Fetch orders for admin panel
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
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // For now, return mock data to prevent endless loading
    // TODO: Replace with actual database queries
    const mockOrders = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        customerName: 'John Doe',
        vendorName: 'Pizza Palace',
        driverName: 'Mike Johnson',
        status: 'delivered',
        total: 24.99,
        createdAt: '2024-01-20T10:30:00Z',
        estimatedDelivery: '2024-01-20T11:15:00Z',
        items: 3,
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        customerName: 'Jane Smith',
        vendorName: 'Burger Barn',
        status: 'preparing',
        total: 18.50,
        createdAt: '2024-01-20T11:00:00Z',
        estimatedDelivery: '2024-01-20T11:45:00Z',
        items: 2,
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        customerName: 'Bob Wilson',
        vendorName: 'Sweet Treats Cafe',
        driverName: 'Sarah Davis',
        status: 'picked_up',
        total: 12.75,
        createdAt: '2024-01-20T11:15:00Z',
        estimatedDelivery: '2024-01-20T12:00:00Z',
        items: 1,
      },
      {
        id: '4',
        orderNumber: 'ORD-004',
        customerName: 'Alice Brown',
        vendorName: 'Pizza Palace',
        status: 'pending',
        total: 31.25,
        createdAt: '2024-01-20T11:30:00Z',
        items: 4,
      },
    ];

    // Apply filters
    let filteredOrders = mockOrders;
    
    if (status && status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower) ||
        order.vendorName.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedOrders,
      pagination: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit)
      },
      stats: {
        totalOrders: mockOrders.length,
        activeOrders: mockOrders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length,
        completedOrders: mockOrders.filter(o => o.status === 'delivered').length,
        cancelledOrders: mockOrders.filter(o => o.status === 'cancelled').length
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'Failed to fetch orders' 
      },
      { status: 500 }
    );
  }
}

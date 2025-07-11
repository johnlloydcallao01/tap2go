'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'delivered' | 'cancelled' | 'refunded';
  orderDate: string;
  deliveryDate?: string;
  paymentMethod: string;
  deliveryAddress: string;
  notes?: string;
  rating?: number;
  review?: string;
}

const mockOrderHistory: OrderHistoryItem[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'John Smith',
    customerPhone: '+1-555-0123',
    items: [
      { name: 'Margherita Pizza', quantity: 1, price: 16.99 },
      { name: 'Caesar Salad', quantity: 1, price: 12.99 },
    ],
    totalAmount: 32.97,
    status: 'delivered',
    orderDate: '2024-01-20T10:30:00Z',
    deliveryDate: '2024-01-20T11:15:00Z',
    paymentMethod: 'Credit Card',
    deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
    rating: 5,
    review: 'Excellent food and fast delivery!',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: 'Sarah Johnson',
    customerPhone: '+1-555-0124',
    items: [
      { name: 'Pepperoni Pizza', quantity: 2, price: 18.99 },
      { name: 'Chicken Wings', quantity: 1, price: 13.99 },
    ],
    totalAmount: 54.96,
    status: 'delivered',
    orderDate: '2024-01-20T14:45:00Z',
    deliveryDate: '2024-01-20T15:30:00Z',
    paymentMethod: 'PayPal',
    deliveryAddress: '456 Oak Ave, Brooklyn, NY 11201',
    rating: 4,
    review: 'Good food, delivery was a bit slow.',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customerName: 'Mike Davis',
    customerPhone: '+1-555-0125',
    items: [
      { name: 'Hawaiian Pizza', quantity: 1, price: 19.99 },
    ],
    totalAmount: 22.98,
    status: 'cancelled',
    orderDate: '2024-01-19T19:20:00Z',
    paymentMethod: 'Credit Card',
    deliveryAddress: '789 Pine St, Queens, NY 11375',
    notes: 'Customer cancelled due to long wait time',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customerName: 'Emily Wilson',
    customerPhone: '+1-555-0126',
    items: [
      { name: 'Vegetarian Pizza', quantity: 1, price: 17.99 },
      { name: 'Garlic Bread', quantity: 2, price: 5.99 },
      { name: 'Tiramisu', quantity: 1, price: 7.99 },
    ],
    totalAmount: 39.95,
    status: 'delivered',
    orderDate: '2024-01-19T16:10:00Z',
    deliveryDate: '2024-01-19T17:00:00Z',
    paymentMethod: 'Cash',
    deliveryAddress: '321 Elm St, Manhattan, NY 10002',
    rating: 5,
    review: 'Amazing pizza and dessert!',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customerName: 'David Brown',
    customerPhone: '+1-555-0127',
    items: [
      { name: 'Meat Lovers Pizza', quantity: 1, price: 21.99 },
    ],
    totalAmount: 25.98,
    status: 'refunded',
    orderDate: '2024-01-18T20:30:00Z',
    paymentMethod: 'Credit Card',
    deliveryAddress: '654 Maple Dr, Bronx, NY 10451',
    notes: 'Order arrived cold, full refund issued',
  },
];

export default function VendorOrderHistory() {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('last_30_days');
  // Removed unused variable: selectedOrder, setSelectedOrder

  useEffect(() => {
    const loadOrderHistory = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(mockOrderHistory);
      } catch (error) {
        console.error('Error loading order history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrderHistory();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      case 'refunded':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
              <p className="text-gray-600">View and manage your completed orders</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/orders" className="btn-secondary">
                Back to Orders
              </Link>
              <button className="btn-secondary flex items-center">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Refunded</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'refunded').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="last_7_days">Last 7 days</option>
                <option value="last_30_days">Last 30 days</option>
                <option value="last_90_days">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{filteredOrders.length} orders found</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
        </div>
        <div className="p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                        {order.rating && (
                          <div className="flex items-center space-x-1">
                            {renderStars(order.rating)}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Customer: <span className="font-medium text-gray-900">{order.customerName}</span></p>
                          <p className="text-sm text-gray-600">Phone: <span className="font-medium text-gray-900">{order.customerPhone}</span></p>
                          <p className="text-sm text-gray-600">Payment: <span className="font-medium text-gray-900">{order.paymentMethod}</span></p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Ordered: <span className="font-medium text-gray-900">{formatDate(order.orderDate)}</span></p>
                          {order.deliveryDate && (
                            <p className="text-sm text-gray-600">Delivered: <span className="font-medium text-gray-900">{formatDate(order.deliveryDate)}</span></p>
                          )}
                          <p className="text-sm text-gray-600">Total: <span className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</span></p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Items:</p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item.quantity}x {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {order.review && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <p className="text-sm text-blue-800">&quot;{order.review}&quot;</p>
                        </div>
                      )}
                      
                      {order.notes && (
                        <div className="bg-yellow-50 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">{order.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => console.log('View order details:', order.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

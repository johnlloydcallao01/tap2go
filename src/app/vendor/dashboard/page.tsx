'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { VendorAnalytics, Order } from '@/types';

// Mock data for vendor dashboard
const mockAnalytics: VendorAnalytics = {
  restaurantId: '1',
  period: 'today',
  totalOrders: 45,
  totalRevenue: 1250.75,
  averageOrderValue: 27.79,
  topSellingItems: [
    { itemId: '1', itemName: 'Margherita Pizza', quantity: 12, revenue: 203.88 },
    { itemId: '2', itemName: 'Pepperoni Pizza', quantity: 8, revenue: 151.92 },
    { itemId: '3', itemName: 'Caesar Salad', quantity: 6, revenue: 77.94 }
  ],
  ordersByStatus: {
    pending: 3,
    confirmed: 5,
    preparing: 7,
    ready: 2,
    driver_assigned: 4,
    picked_up: 1,
    out_for_delivery: 8,
    delivered: 15,
    cancelled: 0,
    refunded: 0
  },
  revenueByDay: [
    { date: '2024-01-01', revenue: 850, orders: 32 },
    { date: '2024-01-02', revenue: 920, orders: 35 },
    { date: '2024-01-03', revenue: 1100, orders: 42 },
    { date: '2024-01-04', revenue: 980, orders: 38 },
    { date: '2024-01-05', revenue: 1250, orders: 45 }
  ],
  customerRatings: {
    average: 4.5,
    total: 128,
    breakdown: {
      5: 85,
      4: 28,
      3: 12,
      2: 2,
      1: 1
    }
  }
};

const mockRecentOrders: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'cust1',
    restaurantId: 'rest1',
    driverId: 'driver1',
    items: [],
    status: 'preparing',
    subtotal: 25.99,
    deliveryFee: 3.99,
    tax: 2.08,
    platformFee: 1.50,
    vendorEarnings: 22.49,
    driverEarnings: 3.99,
    total: 33.56,
    deliveryAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    restaurantAddress: {
      street: '456 Restaurant Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'USA'
    },
    paymentMethod: { type: 'card', cardLast4: '1234', cardBrand: 'Visa' },
    paymentStatus: 'paid',
    estimatedDeliveryTime: new Date(Date.now() + 1800000),
    orderNumber: 'ORD-001',
    trackingUpdates: [],
    createdAt: new Date(Date.now() - 900000),
    updatedAt: new Date(Date.now() - 300000)
  }
];

export default function VendorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<VendorAnalytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (user.role !== 'vendor') {
      router.push('/');
      return;
    }

    // Load vendor data
    const loadVendorData = async () => {
      try {
        // In a real app, this would fetch data from API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnalytics(mockAnalytics);
        setRecentOrders(mockRecentOrders);
      } catch (error) {
        console.error('Error loading vendor data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVendorData();
  }, [user, router]);

  if (!user || user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be a vendor to access this page.</p>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-24 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-64 bg-gray-300 rounded-lg"></div>
              <div className="h-64 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}!</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/vendor/restaurant/edit" className="btn-secondary">
                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                Restaurant Settings
              </Link>
              <Link href="/vendor/menu" className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Manage Menu
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today&apos;s Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today&apos;s Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${analytics?.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">${analytics?.averageOrderValue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(analytics?.ordersByStatus.preparing || 0) +
                   (analytics?.ordersByStatus.ready || 0) +
                   (analytics?.ordersByStatus.confirmed || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/vendor/orders" className="text-orange-600 hover:text-orange-700 font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">#{order.orderNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {order.createdAt.toLocaleTimeString()} • ${order.total.toFixed(2)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {order.items.length} items
                    </span>
                    <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Selling Items</h2>
            <div className="space-y-4">
              {analytics?.topSellingItems.map((item, index) => (
                <div key={item.itemId} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium text-orange-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.itemName}</p>
                      <p className="text-sm text-gray-500">{item.quantity} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${item.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
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
  const { } = useAuth();
  const [analytics, setAnalytics] = useState<VendorAnalytics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Good morning! 👋</h1>
            <p className="text-orange-100">Here&apos;s what&apos;s happening with your restaurant today</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/vendor/restaurant"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <Cog6ToothIcon className="h-4 w-4 mr-2" />
              Settings
            </Link>
            <Link
              href="/vendor/menu"
              className="bg-white text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Manage Menu
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Today&apos;s Orders</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.totalOrders}</p>
              <p className="text-sm text-green-600 font-medium mt-1">↗ +12% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Today&apos;s Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${analytics?.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-green-600 font-medium mt-1">↗ +8% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900">${analytics?.averageOrderValue.toFixed(2)}</p>
              <p className="text-sm text-orange-600 font-medium mt-1">↗ +5% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Orders</p>
              <p className="text-3xl font-bold text-gray-900">
                {(analytics?.ordersByStatus.preparing || 0) +
                 (analytics?.ordersByStatus.ready || 0) +
                 (analytics?.ordersByStatus.confirmed || 0)}
              </p>
              <p className="text-sm text-purple-600 font-medium mt-1">Need attention</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link
                href="/vendor/orders"
                className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <ShoppingBagIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.createdAt.toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Top Selling Items</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics?.topSellingItems.map((item, index) => (
                <div key={item.itemId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.itemName}</p>
                      <p className="text-sm text-gray-500">{item.quantity} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${item.revenue.toFixed(2)}</p>
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

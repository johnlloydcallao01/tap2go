'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartPieIcon,
  ChartBarIcon,
  ClockIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  peakHours: Array<{ hour: number; orders: number }>;
  topItems: Array<{ name: string; orders: number; revenue: number }>;
  ordersByDay: Array<{ day: string; orders: number; revenue: number }>;
  customerSatisfaction: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Array<{ rating: number; count: number }>;
  };
  deliveryPerformance: {
    onTimeDeliveries: number;
    lateDeliveries: number;
    averageDeliveryTime: number;
  };
}

const mockAnalytics: OrderAnalytics = {
  totalOrders: 1247,
  completedOrders: 1156,
  cancelledOrders: 91,
  averageOrderValue: 28.45,
  totalRevenue: 32890.20,
  averageDeliveryTime: 32,
  peakHours: [
    { hour: 11, orders: 45 },
    { hour: 12, orders: 78 },
    { hour: 13, orders: 65 },
    { hour: 17, orders: 52 },
    { hour: 18, orders: 89 },
    { hour: 19, orders: 95 },
    { hour: 20, orders: 67 },
  ],
  topItems: [
    { name: 'Margherita Pizza', orders: 156, revenue: 2649.44 },
    { name: 'Pepperoni Pizza', orders: 134, revenue: 2544.66 },
    { name: 'Caesar Salad', orders: 98, revenue: 1273.02 },
    { name: 'Chicken Wings', orders: 87, revenue: 1217.13 },
    { name: 'Hawaiian Pizza', orders: 76, revenue: 1519.24 },
  ],
  ordersByDay: [
    { day: 'Monday', orders: 145, revenue: 4123.50 },
    { day: 'Tuesday', orders: 167, revenue: 4756.30 },
    { day: 'Wednesday', orders: 189, revenue: 5378.90 },
    { day: 'Thursday', orders: 201, revenue: 5712.45 },
    { day: 'Friday', orders: 234, revenue: 6656.80 },
    { day: 'Saturday', orders: 198, revenue: 5634.25 },
    { day: 'Sunday', orders: 113, revenue: 3628.00 },
  ],
  customerSatisfaction: {
    averageRating: 4.3,
    totalReviews: 892,
    ratingDistribution: [
      { rating: 5, count: 456 },
      { rating: 4, count: 267 },
      { rating: 3, count: 123 },
      { rating: 2, count: 34 },
      { rating: 1, count: 12 },
    ],
  },
  deliveryPerformance: {
    onTimeDeliveries: 1034,
    lateDeliveries: 122,
    averageDeliveryTime: 32,
  },
};

export default function VendorOrderAnalytics() {
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Error loading order analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const calculateCompletionRate = () => {
    if (!analytics) return 0;
    return ((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1);
  };

  const calculateOnTimeRate = () => {
    if (!analytics) return 0;
    const total = analytics.deliveryPerformance.onTimeDeliveries + analytics.deliveryPerformance.lateDeliveries;
    return ((analytics.deliveryPerformance.onTimeDeliveries / total) * 100).toFixed(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Order Analytics</h1>
              <p className="text-gray-600">Detailed insights into your order performance</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/orders" className="btn-secondary">
                Back to Orders
              </Link>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPeriod('week')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === 'week'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setSelectedPeriod('month')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === 'month'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setSelectedPeriod('quarter')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === 'quarter'
                      ? 'bg-orange-100 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Quarter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalOrders.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">+12.5%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{calculateCompletionRate()}%</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">+2.1%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ChartPieIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900">${analytics.averageOrderValue.toFixed(2)}</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">+5.8%</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.averageDeliveryTime}min</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingDownIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-600">-3.2min</span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Day */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Day</h3>
          <div className="space-y-3">
            {analytics.ordersByDay.map((day) => (
              <div key={day.day} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-16 text-sm font-medium text-gray-900">{day.day}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(day.orders / Math.max(...analytics.ordersByDay.map(d => d.orders))) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{day.orders} orders</p>
                  <p className="text-xs text-gray-500">${day.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours</h3>
          <div className="space-y-3">
            {analytics.peakHours.map((hour) => (
              <div key={hour.hour} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-16 text-sm font-medium text-gray-900">
                    {hour.hour}:00
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(hour.orders / Math.max(...analytics.peakHours.map(h => h.orders))) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{hour.orders} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Items and Customer Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
          <div className="space-y-4">
            {analytics.topItems.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-orange-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">{item.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${item.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Satisfaction</h3>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              {renderStars(analytics.customerSatisfaction.averageRating)}
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.customerSatisfaction.averageRating}</p>
            <p className="text-sm text-gray-500">Based on {analytics.customerSatisfaction.totalReviews} reviews</p>
          </div>
          
          <div className="space-y-2">
            {analytics.customerSatisfaction.ratingDistribution.map((rating) => (
              <div key={rating.rating} className="flex items-center space-x-3">
                <span className="w-8 text-sm font-medium text-gray-900">{rating.rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ 
                      width: `${(rating.count / analytics.customerSatisfaction.totalReviews) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="w-12 text-sm text-gray-500 text-right">{rating.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Performance */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TruckIcon className="h-5 w-5 mr-2 text-orange-500" />
          Delivery Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 bg-green-100 rounded-lg inline-block mb-3">
              <TruckIcon className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{calculateOnTimeRate()}%</p>
            <p className="text-sm text-gray-600">On-time deliveries</p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.deliveryPerformance.onTimeDeliveries} of {analytics.deliveryPerformance.onTimeDeliveries + analytics.deliveryPerformance.lateDeliveries} deliveries
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-4 bg-orange-100 rounded-lg inline-block mb-3">
              <ClockIcon className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.deliveryPerformance.averageDeliveryTime}min</p>
            <p className="text-sm text-gray-600">Average delivery time</p>
            <p className="text-xs text-gray-500 mt-1">3 minutes faster than last month</p>
          </div>
          
          <div className="text-center">
            <div className="p-4 bg-red-100 rounded-lg inline-block mb-3">
              <CalendarDaysIcon className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.deliveryPerformance.lateDeliveries}</p>
            <p className="text-sm text-gray-600">Late deliveries</p>
            <p className="text-xs text-gray-500 mt-1">
              {((analytics.deliveryPerformance.lateDeliveries / (analytics.deliveryPerformance.onTimeDeliveries + analytics.deliveryPerformance.lateDeliveries)) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

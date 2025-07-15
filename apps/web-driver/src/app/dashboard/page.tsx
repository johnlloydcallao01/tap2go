'use client';

import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  CurrencyDollarIcon,
  StarIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DriverAnalytics {
  todayEarnings: number;
  todayDeliveries: number;
  averageRating: number;
  totalDistance: number;
  activeHours: number;
  completionRate: number;
}

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  distance: string;
  estimatedTime: string;
  payment: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  priority: 'normal' | 'urgent';
  createdAt: Date;
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<DriverAnalytics | null>(null);
  const [currentDeliveries, setCurrentDeliveries] = useState<DeliveryOrder[]>([]);
  const [availableOrders, setAvailableOrders] = useState<DeliveryOrder[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading driver data
    setTimeout(() => {
      setAnalytics({
        todayEarnings: 127.50,
        todayDeliveries: 8,
        averageRating: 4.8,
        totalDistance: 45.2,
        activeHours: 6.5,
        completionRate: 98.5,
      });

      setCurrentDeliveries([
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          customerName: 'John Smith',
          pickupAddress: '123 Restaurant St',
          deliveryAddress: '456 Customer Ave',
          distance: '2.3 km',
          estimatedTime: '15 min',
          payment: 12.50,
          status: 'picked_up',
          priority: 'normal',
          createdAt: new Date(),
        },
      ]);

      setAvailableOrders([
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          customerName: 'Sarah Johnson',
          pickupAddress: '789 Pizza Place',
          deliveryAddress: '321 Home St',
          distance: '1.8 km',
          estimatedTime: '12 min',
          payment: 15.75,
          status: 'assigned',
          priority: 'urgent',
          createdAt: new Date(),
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          customerName: 'Mike Wilson',
          pickupAddress: '555 Burger Joint',
          deliveryAddress: '777 Office Blvd',
          distance: '3.1 km',
          estimatedTime: '18 min',
          payment: 18.25,
          status: 'assigned',
          priority: 'normal',
          createdAt: new Date(),
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Driver Dashboard</h1>
            <p className="text-blue-100 mt-1">
              Welcome back, Driver! 🚚
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isOnline
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isOnline ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
              <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Today's Earnings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Today&apos;s Earnings</p>
              <p className="text-3xl font-bold text-gray-900">${analytics?.todayEarnings.toFixed(2)}</p>
              <p className="text-sm text-green-600 font-medium mt-1">↗ +15% from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Today's Deliveries */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Today&apos;s Deliveries</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.todayDeliveries}</p>
              <p className="text-sm text-blue-600 font-medium mt-1">↗ +2 from yesterday</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.averageRating}</p>
              <p className="text-sm text-yellow-600 font-medium mt-1">⭐ Excellent service</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Deliveries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Current Deliveries</h2>
              <Link
                href="/orders"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {currentDeliveries.length > 0 ? (
              <div className="space-y-4">
                {currentDeliveries.map((delivery) => (
                  <div key={delivery.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <TruckIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{delivery.orderNumber}</p>
                          <p className="text-sm text-gray-500">{delivery.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${delivery.payment.toFixed(2)}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          delivery.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
                          delivery.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {delivery.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>From: {delivery.pickupAddress}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>To: {delivery.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-gray-500">{delivery.distance} • {delivery.estimatedTime}</span>
                        <Link
                          href={`/orders/${delivery.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No active deliveries</p>
                <p className="text-gray-400 text-sm">Check available orders to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Available Orders</h2>
              <Link
                href="/orders/available"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {availableOrders.length > 0 ? (
              <div className="space-y-4">
                {availableOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          order.priority === 'urgent' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          {order.priority === 'urgent' ? (
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                          ) : (
                            <TruckIcon className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">{order.customerName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${order.payment.toFixed(2)}</p>
                        {order.priority === 'urgent' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>From: {order.pickupAddress}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span>To: {order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-gray-500">{order.distance} • {order.estimatedTime}</span>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Accept Order
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No available orders</p>
                <p className="text-gray-400 text-sm">New orders will appear here when available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

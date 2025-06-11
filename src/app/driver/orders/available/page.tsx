'use client';

import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface AvailableOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  distance: string;
  estimatedTime: string;
  payment: number;
  priority: 'normal' | 'urgent';
  createdAt: Date;
  expiresIn: number; // minutes
  items: number;
}

export default function AvailableOrders() {
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingOrder, setAcceptingOrder] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading available orders
    setTimeout(() => {
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD-2024-004',
          customerName: 'Sarah Johnson',
          pickupAddress: '789 Pizza Place, Mall Area',
          deliveryAddress: '321 Home St, Unit 5',
          distance: '1.8 km',
          estimatedTime: '12 min',
          payment: 15.00,
          priority: 'urgent',
          createdAt: new Date(),
          expiresIn: 3,
          items: 2,
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-005',
          customerName: 'Mike Wilson',
          pickupAddress: '555 Burger Joint, City Center',
          deliveryAddress: '777 Office Blvd, Floor 12',
          distance: '3.1 km',
          estimatedTime: '18 min',
          payment: 18.75,
          priority: 'normal',
          createdAt: new Date(),
          expiresIn: 8,
          items: 3,
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-006',
          customerName: 'Emily Davis',
          pickupAddress: '123 Sushi Bar, Downtown',
          deliveryAddress: '456 Residential Ave',
          distance: '2.5 km',
          estimatedTime: '15 min',
          payment: 16.50,
          priority: 'normal',
          createdAt: new Date(),
          expiresIn: 12,
          items: 4,
        },
        {
          id: '4',
          orderNumber: 'ORD-2024-007',
          customerName: 'David Brown',
          pickupAddress: '999 Coffee Shop, Main St',
          deliveryAddress: '111 Park View, Apt 3A',
          distance: '1.2 km',
          estimatedTime: '8 min',
          payment: 12.25,
          priority: 'urgent',
          createdAt: new Date(),
          expiresIn: 5,
          items: 1,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    setAcceptingOrder(orderId);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Accepting order:', orderId);
      setOrders(prev => prev.filter(order => order.id !== orderId));
      setAcceptingOrder(null);
      // Here you would typically redirect to the current delivery page
    }, 1500);
  };

  const handleDeclineOrder = (orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent' ? 'text-red-600' : 'text-gray-600';
  };

  const getPriorityBg = (priority: string) => {
    return priority === 'urgent' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Orders</h1>
          <p className="text-gray-600">Accept orders that match your preferences.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {orders.length} Available
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                All Orders
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors">
                Urgent Only
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors">
                Nearby (≤2km)
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Auto-refresh in 30s
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className={`rounded-lg shadow-sm border p-6 transition-all hover:shadow-md ${getPriorityBg(order.priority)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
                    {order.priority === 'urgent' && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{order.customerName} • {order.items} items</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">${order.payment.toFixed(2)}</p>
                <p className={`text-sm font-medium ${getPriorityColor(order.priority)}`}>
                  {order.priority.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pickup</p>
                    <p className="text-sm text-gray-600">{order.pickupAddress}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Delivery</p>
                    <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>{order.estimatedTime}</span>
                </div>
                <span>•</span>
                <span>{order.distance}</span>
                <span>•</span>
                <span className={order.expiresIn <= 5 ? 'text-red-600 font-medium' : ''}>
                  Expires in {order.expiresIn}m
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleDeclineOrder(order.id)}
                  className="flex items-center space-x-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={() => handleAcceptOrder(order.id)}
                  disabled={acceptingOrder === order.id}
                  className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {acceptingOrder === order.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Accepting...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span>Accept</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Orders</h3>
          <p className="text-gray-500 mb-6">
            There are no orders available in your area right now. Check back in a few minutes.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Refresh Orders
          </button>
        </div>
      )}
    </div>
  );
}

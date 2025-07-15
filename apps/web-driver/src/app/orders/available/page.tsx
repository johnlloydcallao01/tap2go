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
  const [sortBy, setSortBy] = useState('distance');

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
          pickupAddress: '222 Taco Shop, West Side',
          deliveryAddress: '444 Apartment Complex, Apt 7C',
          distance: '2.5 km',
          estimatedTime: '15 min',
          payment: 14.50,
          priority: 'normal',
          createdAt: new Date(),
          expiresIn: 5,
          items: 1,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAcceptOrder = (orderId: string) => {
    console.log('Accepting order:', orderId);
    // Here you would call the API to accept the order
    // Then remove it from the available orders list
    setOrders(orders.filter(order => order.id !== orderId));
  };

  const handleRejectOrder = (orderId: string) => {
    console.log('Rejecting order:', orderId);
    // Here you would call the API to reject the order
    // Then remove it from the available orders list
    setOrders(orders.filter(order => order.id !== orderId));
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortBy === 'distance') {
      return parseFloat(a.distance) - parseFloat(b.distance);
    } else if (sortBy === 'payment') {
      return b.payment - a.payment;
    } else if (sortBy === 'expiry') {
      return a.expiresIn - b.expiresIn;
    }
    return 0;
  });

  const getPriorityBg = (priority: string) => {
    return priority === 'urgent' 
      ? 'border-red-200 bg-red-50' 
      : 'border-gray-200 bg-white';
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Sort by:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSortBy('distance')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  sortBy === 'distance' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Nearest
              </button>
              <button
                onClick={() => setSortBy('payment')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  sortBy === 'payment' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Highest Paying
              </button>
              <button
                onClick={() => setSortBy('expiry')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  sortBy === 'expiry' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Expiring Soon
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            Auto-refresh in 30s
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {sortedOrders.map((order) => (
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
                <p className="text-sm text-red-500 font-medium">
                  Expires in {order.expiresIn} min
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="font-medium">Pickup:</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">{order.pickupAddress}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Delivery:</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">{order.deliveryAddress}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{order.distance}</span>
                <span>•</span>
                <span>{order.estimatedTime}</span>
                {order.priority === 'urgent' && (
                  <>
                    <span>•</span>
                    <span className="text-red-600 font-medium">URGENT</span>
                  </>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRejectOrder(order.id)}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={() => handleAcceptOrder(order.id)}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <CheckIcon className="h-4 w-4" />
                  <span>Accept Order</span>
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

'use client';

import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  completed: boolean;
  current: boolean;
}

interface ActiveOrder {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantImage: string;
  customerName: string;
  deliveryAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered';
  estimatedDeliveryTime: Date;
  driverName?: string;
  driverPhone?: string;
  driverImage?: string;
  trackingSteps: TrackingStep[];
}

export default function TrackOrderContent() {
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading order data
    setTimeout(() => {
      setActiveOrder({
        id: '1',
        orderNumber: 'ORD-2024-003',
        restaurantName: 'Pizza Palace',
        restaurantImage: '/api/placeholder/80/80',
        customerName: 'John Doe',
        deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
        items: [
          { name: 'Margherita Pizza', quantity: 1, price: 18.99 },
          { name: 'Garlic Bread', quantity: 2, price: 6.99 },
          { name: 'Caesar Salad', quantity: 1, price: 8.99 },
        ],
        total: 34.97,
        status: 'on_the_way',
        estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
        driverName: 'Mike Johnson',
        driverPhone: '+1 (555) 123-4567',
        driverImage: '/api/placeholder/60/60',
        trackingSteps: [
          {
            id: '1',
            title: 'Order Confirmed',
            description: 'Your order has been confirmed by the restaurant',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            completed: true,
            current: false,
          },
          {
            id: '2',
            title: 'Preparing Your Order',
            description: 'The restaurant is preparing your delicious meal',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            completed: true,
            current: false,
          },
          {
            id: '3',
            title: 'Ready for Pickup',
            description: 'Your order is ready and waiting for the driver',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            completed: true,
            current: false,
          },
          {
            id: '4',
            title: 'Out for Delivery',
            description: 'Your order is on its way to you',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            completed: true,
            current: true,
          },
          {
            id: '5',
            title: 'Delivered',
            description: 'Enjoy your meal!',
            timestamp: new Date(Date.now() + 15 * 60 * 1000),
            completed: false,
            current: false,
          },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstimatedDeliveryText = (estimatedTime: Date) => {
    const now = new Date();
    const diffInMinutes = Math.ceil((estimatedTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffInMinutes <= 0) return 'Delivered';
    if (diffInMinutes <= 5) return 'Arriving soon';
    return `${diffInMinutes} minutes`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!activeOrder) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Orders</h3>
          <p className="text-gray-500 mb-6">You don&apos;t have any orders to track right now.</p>
          <a
            href="/restaurants"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Start Ordering
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
            <p className="text-gray-600">Order #{activeOrder.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Estimated delivery</p>
            <p className="text-lg font-semibold text-orange-600">
              {getEstimatedDeliveryText(activeOrder.estimatedDeliveryTime)}
            </p>
          </div>
        </div>

        {/* Order Status Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <TruckIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">Your order is on the way!</p>
              <p className="text-sm text-blue-700">
                {activeOrder.driverName} is delivering your order from {activeOrder.restaurantName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Tracking */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Order Progress</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {activeOrder.trackingSteps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.current ? 'bg-blue-600' : 'bg-green-600'
                      }`}>
                        <CheckCircleIcon className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${
                        step.completed ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </h3>
                      {step.completed && (
                        <span className="text-sm text-gray-500">
                          {formatTime(step.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      step.completed ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {index < activeOrder.trackingSteps.length - 1 && (
                    <div className="absolute left-10 mt-8 w-0.5 h-6 bg-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details & Driver Info */}
        <div className="space-y-6">
          {/* Driver Information */}
          {activeOrder.driverName && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Driver</h3>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">
                    {activeOrder.driverName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activeOrder.driverName}</p>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">4.8 rating</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Call
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Message
                </button>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              {activeOrder.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">${item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${activeOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
            <div className="flex items-start space-x-3">
              <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
              <p className="text-gray-600">{activeOrder.deliveryAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

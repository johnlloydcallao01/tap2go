'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import {
  TruckIcon,
  ClockIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function CurrentDelivery() {
  const [currentOrder] = useState({
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'John Smith',
    customerPhone: '+1 (555) 123-4567',
    pickupAddress: '123 Pizza Palace, Downtown Mall',
    deliveryAddress: '456 Customer Ave, Apt 2B, Uptown',
    distance: '2.3 km',
    estimatedTime: '15 min',
    payment: 12.50,
    status: 'picked_up',
    priority: 'normal',
    items: [
      { name: 'Large Pepperoni Pizza', quantity: 1, price: 18.99 },
      { name: 'Garlic Bread', quantity: 2, price: 4.99 },
      { name: 'Coca Cola 500ml', quantity: 2, price: 2.99 },
    ],
    specialInstructions: 'Ring doorbell twice. Leave at door if no answer.',
    orderTime: '2:30 PM',
    pickupTime: '2:45 PM',
    estimatedDelivery: '3:00 PM',
  });

  const handleStatusUpdate = (newStatus: string) => {
    console.log('Updating status to:', newStatus);
    // Here you would update the order status
  };

  const handleCallCustomer = () => {
    console.log('Calling customer:', currentOrder.customerPhone);
  };

  const handleMessageCustomer = () => {
    console.log('Opening chat with customer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Current Delivery</h1>
          <p className="text-gray-600">Track and manage your active delivery.</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            In Progress
          </div>
        </div>
      </div>

      {currentOrder ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TruckIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">#{currentOrder.orderNumber}</h2>
                    <p className="text-sm text-gray-500">Ordered at {currentOrder.orderTime}</p>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {currentOrder.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Customer Info */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{currentOrder.customerName}</p>
                    <p className="text-sm text-gray-500">{currentOrder.customerPhone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCallCustomer}
                      className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <PhoneIcon className="h-4 w-4" />
                      <span>Call</span>
                    </button>
                    <button
                      onClick={handleMessageCustomer}
                      className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Delivery Route</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-orange-600 font-bold text-sm">P</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Pickup Location</p>
                    <p className="text-gray-600">{currentOrder.pickupAddress}</p>
                    <p className="text-sm text-gray-500">Picked up at {currentOrder.pickupTime}</p>
                  </div>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                
                <div className="ml-4 border-l-2 border-dashed border-gray-300 h-6"></div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-blue-600 font-bold text-sm">D</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Delivery Location</p>
                    <p className="text-gray-600">{currentOrder.deliveryAddress}</p>
                    <p className="text-sm text-gray-500">ETA: {currentOrder.estimatedDelivery}</p>
                  </div>
                  <ClockIcon className="h-5 w-5 text-blue-500" />
                </div>
              </div>

              {currentOrder.specialInstructions && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Special Instructions</p>
                      <p className="text-sm text-yellow-700">{currentOrder.specialInstructions}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {currentOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                        {item.quantity}
                      </span>
                      <span className="text-gray-900">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Your Earnings</span>
                    <span className="font-bold text-green-600">${currentOrder.payment.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            {/* Status Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Update Status</h3>
              <div className="space-y-3">
                {currentOrder.status === 'picked_up' && (
                  <button
                    onClick={() => handleStatusUpdate('in_transit')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Start Delivery
                  </button>
                )}
                {currentOrder.status === 'in_transit' && (
                  <button
                    onClick={() => handleStatusUpdate('delivered')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                  View on Map
                </button>
                <button className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors">
                  Report Issue
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Delivery Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-medium">{currentOrder.distance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Est. Time</span>
                  <span className="font-medium">{currentOrder.estimatedTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Priority</span>
                  <span className={`font-medium ${currentOrder.priority === 'urgent' ? 'text-red-600' : 'text-gray-900'}`}>
                    {currentOrder.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment</span>
                  <span className="font-bold text-green-600">${currentOrder.payment.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Delivery</h3>
          <p className="text-gray-500 mb-6">You don&apos;t have any active deliveries at the moment.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Find Available Orders
          </button>
        </div>
      )}
    </div>
  );
}

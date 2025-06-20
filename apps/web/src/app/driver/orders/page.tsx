'use client';

import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  distance: string;
  estimatedTime: string;
  payment: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  priority: 'normal' | 'urgent';
  createdAt: Date;
  items: Array<{
    name: string;
    quantity: number;
  }>;
}

export default function DriverOrders() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    // Simulate loading orders
    setTimeout(() => {
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          customerName: 'John Smith',
          customerPhone: '+1 (555) 123-4567',
          pickupAddress: '123 Restaurant St, Downtown',
          deliveryAddress: '456 Customer Ave, Apt 2B',
          distance: '2.3 km',
          estimatedTime: '15 min',
          payment: 12.50,
          status: 'picked_up',
          priority: 'normal',
          createdAt: new Date(),
          items: [
            { name: 'Burger Combo', quantity: 2 },
            { name: 'Fries', quantity: 1 },
          ],
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          customerName: 'Sarah Johnson',
          customerPhone: '+1 (555) 987-6543',
          pickupAddress: '789 Pizza Place, Mall Area',
          deliveryAddress: '321 Home St, Unit 5',
          distance: '1.8 km',
          estimatedTime: '12 min',
          payment: 15.00,
          status: 'assigned',
          priority: 'urgent',
          createdAt: new Date(),
          items: [
            { name: 'Large Pizza', quantity: 1 },
            { name: 'Garlic Bread', quantity: 1 },
          ],
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          customerName: 'Mike Wilson',
          customerPhone: '+1 (555) 456-7890',
          pickupAddress: '555 Burger Joint, City Center',
          deliveryAddress: '777 Office Blvd, Floor 12',
          distance: '3.1 km',
          estimatedTime: '18 min',
          payment: 18.75,
          status: 'in_transit',
          priority: 'normal',
          createdAt: new Date(),
          items: [
            { name: 'Chicken Sandwich', quantity: 1 },
            { name: 'Salad', quantity: 1 },
            { name: 'Drink', quantity: 2 },
          ],
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked_up':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === 'urgent' ? (
      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
    ) : null;
  };

  const getStatusAction = (status: string) => {
    switch (status) {
      case 'assigned':
        return (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Start Pickup
          </button>
        );
      case 'picked_up':
        return (
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Start Delivery
          </button>
        );
      case 'in_transit':
        return (
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Mark Delivered
          </button>
        );
      case 'delivered':
        return (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Completed
          </div>
        );
      default:
        return null;
    }
  };

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

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
          <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
          <p className="text-gray-600">Manage your assigned delivery orders.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {orders.filter(o => o.status === 'assigned' || o.status === 'picked_up' || o.status === 'in_transit').length} Active
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {orders.filter(o => o.status === 'delivered').length} Completed
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <div className="flex space-x-2">
            {['all', 'assigned', 'picked_up', 'in_transit', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TruckIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
                    {getPriorityIcon(order.priority)}
                  </div>
                  <p className="text-sm text-gray-500">{order.customerName} • {order.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="font-semibold text-lg text-gray-900">${order.payment.toFixed(2)}</span>
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
                <span>{order.items.length} items</span>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center text-gray-600 hover:text-gray-800 text-sm">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View Details
                </button>
                {getStatusAction(order.status)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">
            {selectedStatus === 'all' 
              ? 'You have no delivery orders at the moment.' 
              : `No orders with status "${selectedStatus.replace('_', ' ')}" found.`}
          </p>
        </div>
      )}
    </div>
  );
}

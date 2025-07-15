'use client';

import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface MyDelivery {
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
  acceptedAt: Date;
  estimatedDelivery: string;
  items: number;
}

export default function MyDeliveries() {
  const [deliveries, setDeliveries] = useState<MyDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Simulate loading my deliveries
    setTimeout(() => {
      setDeliveries([
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          customerName: 'John Smith',
          customerPhone: '+1 (555) 123-4567',
          pickupAddress: '123 Pizza Palace, Downtown Mall',
          deliveryAddress: '456 Customer Ave, Apt 2B',
          distance: '2.3 km',
          estimatedTime: '15 min',
          payment: 12.50,
          status: 'in_transit',
          priority: 'normal',
          acceptedAt: new Date(),
          estimatedDelivery: '3:00 PM',
          items: 2,
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          customerName: 'Sarah Johnson',
          customerPhone: '+1 (555) 987-6543',
          pickupAddress: '789 Burger Joint, City Center',
          deliveryAddress: '321 Home St, Unit 5',
          distance: '1.8 km',
          estimatedTime: '12 min',
          payment: 15.75,
          status: 'picked_up',
          priority: 'urgent',
          acceptedAt: new Date(),
          estimatedDelivery: '2:45 PM',
          items: 3,
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          customerName: 'Mike Wilson',
          customerPhone: '+1 (555) 456-7890',
          pickupAddress: '555 Taco Shop, West Side',
          deliveryAddress: '777 Office Blvd, Floor 12',
          distance: '3.1 km',
          estimatedTime: '18 min',
          payment: 18.25,
          status: 'assigned',
          priority: 'normal',
          acceptedAt: new Date(),
          estimatedDelivery: '3:15 PM',
          items: 1,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <ClockIcon className="h-4 w-4" />;
      case 'picked_up':
        return <TruckIcon className="h-4 w-4" />;
      case 'in_transit':
        return <TruckIcon className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['assigned', 'picked_up', 'in_transit'].includes(delivery.status);
    if (filter === 'completed') return delivery.status === 'delivered';
    return true;
  });

  const handleCallCustomer = (phone: string) => {
    console.log('Calling customer:', phone);
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
          <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
          <p className="text-gray-600">Track and manage your accepted deliveries.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {filteredDeliveries.length} Orders
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 font-medium">Filter:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({deliveries.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'active' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active ({deliveries.filter(d => ['assigned', 'picked_up', 'in_transit'].includes(d.status)).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'completed' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Completed ({deliveries.filter(d => d.status === 'delivered').length})
            </button>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filteredDeliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  {getStatusIcon(delivery.status)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">#{delivery.orderNumber}</h3>
                    {delivery.priority === 'urgent' && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{delivery.customerName} • {delivery.items} items</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">${delivery.payment.toFixed(2)}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                  {delivery.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="font-medium">Pickup:</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">{delivery.pickupAddress}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Delivery:</span>
                </div>
                <p className="text-sm text-gray-900 ml-6">{delivery.deliveryAddress}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{delivery.distance}</span>
                <span>•</span>
                <span>ETA: {delivery.estimatedDelivery}</span>
                {delivery.priority === 'urgent' && (
                  <>
                    <span>•</span>
                    <span className="text-red-600 font-medium">URGENT</span>
                  </>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCallCustomer(delivery.customerPhone)}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>Call</span>
                </button>
                <Link
                  href={`/orders/${delivery.id}`}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span>View Details</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="text-center py-12">
          <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No Deliveries' : `No ${filter} Deliveries`}
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === 'all'
              ? "You haven't accepted any deliveries yet. Check available orders to get started."
              : `You don't have any ${filter} deliveries at the moment.`
            }
          </p>
          <Link
            href="/orders/available"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            View Available Orders
          </Link>
        </div>
      )}
    </div>
  );
}

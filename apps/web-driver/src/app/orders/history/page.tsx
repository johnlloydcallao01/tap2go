'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface DeliveryHistory {
  id: string;
  orderNumber: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  distance: string;
  payment: number;
  status: 'delivered' | 'cancelled';
  completedAt: Date;
  rating?: number;
  feedback?: string;
  items: number;
  duration: string;
}

export default function DeliveryHistory() {
  const [history, setHistory] = useState<DeliveryHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delivery history
    setTimeout(() => {
      setHistory([
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          customerName: 'John Smith',
          pickupAddress: '123 Pizza Palace',
          deliveryAddress: '456 Customer Ave',
          distance: '2.3 km',
          payment: 12.50,
          status: 'delivered',
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          rating: 5,
          feedback: 'Great service! Very fast delivery.',
          items: 2,
          duration: '18 min',
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          customerName: 'Sarah Johnson',
          pickupAddress: '789 Burger Joint',
          deliveryAddress: '321 Home St',
          distance: '1.8 km',
          payment: 15.75,
          status: 'delivered',
          completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          rating: 4,
          items: 3,
          duration: '15 min',
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          customerName: 'Mike Wilson',
          pickupAddress: '555 Taco Shop',
          deliveryAddress: '777 Office Blvd',
          distance: '3.1 km',
          payment: 18.25,
          status: 'cancelled',
          completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          items: 1,
          duration: '0 min',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    return status === 'delivered' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (status: string) => {
    return status === 'delivered' 
      ? <CheckCircleIcon className="h-4 w-4" />
      : <XCircleIcon className="h-4 w-4" />;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate stats
  const totalEarnings = history
    .filter(d => d.status === 'delivered')
    .reduce((sum, d) => sum + d.payment, 0);

  const deliveriesWithRating = history.filter(d => d.status === 'delivered' && d.rating);
  const averageRating = deliveriesWithRating.length > 0 
    ? deliveriesWithRating.reduce((sum, d) => sum + (d.rating || 0), 0) / deliveriesWithRating.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery History</h1>
          <p className="text-gray-600">View your completed and cancelled deliveries.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {history.length} Records
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {history.filter(d => d.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <StarIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {history.map((delivery) => (
          <div
            key={delivery.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  delivery.status === 'delivered' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {getStatusIcon(delivery.status)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">#{delivery.orderNumber}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{delivery.customerName} • {delivery.items} items</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">${delivery.payment.toFixed(2)}</p>
                <div className="flex items-center justify-end mt-1">
                  <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-sm text-gray-500">{formatDate(delivery.completedAt)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Route</p>
                <p className="text-sm text-gray-900">
                  {delivery.pickupAddress} → {delivery.deliveryAddress}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Distance</p>
                  <p className="text-sm text-gray-900">{delivery.distance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="text-sm text-gray-900">{delivery.duration}</p>
                </div>
                {delivery.rating && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rating</p>
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 mr-1">{delivery.rating}</p>
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {delivery.feedback && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Customer Feedback</p>
                <p className="text-sm text-gray-900">&ldquo;{delivery.feedback}&rdquo;</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {history.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Delivery History</h3>
          <p className="text-gray-500 mb-6">
            You haven&apos;t completed any deliveries yet.
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  CheckCircleIcon,
  StarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface DeliveryHistory {
  id: string;
  orderNumber: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  distance: string;
  payment: number;
  rating: number;
  tips: number;
  completedAt: Date;
  duration: string;
  items: number;
}

export default function DeliveryHistory() {
  const [history, setHistory] = useState<DeliveryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

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
          rating: 5,
          tips: 3.00,
          completedAt: new Date('2024-01-15T14:30:00'),
          duration: '18 min',
          items: 2,
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          customerName: 'Sarah Johnson',
          pickupAddress: '789 Burger Joint',
          deliveryAddress: '321 Home St',
          distance: '1.8 km',
          payment: 15.00,
          rating: 4,
          tips: 2.50,
          completedAt: new Date('2024-01-15T13:45:00'),
          duration: '15 min',
          items: 3,
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          customerName: 'Mike Wilson',
          pickupAddress: '555 Sushi Bar',
          deliveryAddress: '777 Office Blvd',
          distance: '3.1 km',
          payment: 18.75,
          rating: 5,
          tips: 5.00,
          completedAt: new Date('2024-01-15T12:20:00'),
          duration: '22 min',
          items: 4,
        },
        {
          id: '4',
          orderNumber: 'ORD-2024-004',
          customerName: 'Emily Davis',
          pickupAddress: '999 Coffee Shop',
          deliveryAddress: '111 Park View',
          distance: '1.2 km',
          payment: 12.25,
          rating: 4,
          tips: 1.75,
          completedAt: new Date('2024-01-14T16:10:00'),
          duration: '12 min',
          items: 1,
        },
        {
          id: '5',
          orderNumber: 'ORD-2024-005',
          customerName: 'David Brown',
          pickupAddress: '222 Taco Place',
          deliveryAddress: '333 Residential St',
          distance: '2.7 km',
          payment: 16.50,
          rating: 5,
          tips: 4.00,
          completedAt: new Date('2024-01-14T15:30:00'),
          duration: '19 min',
          items: 3,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredHistory = history.filter(delivery =>
    delivery.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEarnings = filteredHistory.reduce((sum, delivery) => sum + delivery.payment + delivery.tips, 0);
  const averageRating = filteredHistory.reduce((sum, delivery) => sum + delivery.rating, 0) / filteredHistory.length;
  const totalDeliveries = filteredHistory.length;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
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
          <h1 className="text-2xl font-bold text-gray-900">Delivery History</h1>
          <p className="text-gray-600">View your completed deliveries and earnings.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {totalDeliveries} Completed
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <TruckIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <StarIcon className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Completed Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalDeliveries}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Period:</span>
            <div className="flex space-x-2">
              {['today', 'week', 'month', 'all'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map((delivery) => (
          <div key={delivery.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">#{delivery.orderNumber}</h3>
                  <p className="text-sm text-gray-500">{delivery.customerName} • {formatDate(delivery.completedAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">${(delivery.payment + delivery.tips).toFixed(2)}</p>
                <div className="flex items-center space-x-1">
                  {renderStars(delivery.rating)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Pickup</p>
                <p className="text-sm text-gray-600">{delivery.pickupAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Delivery</p>
                <p className="text-sm text-gray-600">{delivery.deliveryAddress}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{delivery.distance}</span>
                <span>•</span>
                <span>{delivery.duration}</span>
                <span>•</span>
                <span>{delivery.items} items</span>
                {delivery.tips > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 font-medium">+${delivery.tips.toFixed(2)} tip</span>
                  </>
                )}
              </div>
              <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                <EyeIcon className="h-4 w-4 mr-1" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery history found</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? `No deliveries match "${searchQuery}"`
              : 'You haven\'t completed any deliveries yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

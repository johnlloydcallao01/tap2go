'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  StarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantImage: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: 'delivered' | 'preparing' | 'on_the_way' | 'cancelled';
  orderDate: Date;
  deliveryTime: string;
  deliveryAddress: string;
  paymentMethod: string;
  rating?: number;
  canReorder: boolean;
}

export default function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    // Simulate loading order history
    setTimeout(() => {
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          restaurantName: 'Pizza Palace',
          restaurantImage: '/api/placeholder/60/60',
          items: [
            { name: 'Margherita Pizza', quantity: 1, price: 18.99 },
            { name: 'Garlic Bread', quantity: 2, price: 4.99 },
            { name: 'Coca Cola 500ml', quantity: 1, price: 2.99 },
          ],
          subtotal: 26.97,
          deliveryFee: 2.99,
          tax: 2.40,
          total: 32.36,
          status: 'delivered',
          orderDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          deliveryTime: '25 min',
          deliveryAddress: '123 Main St, Apt 4B',
          paymentMethod: 'Credit Card ****1234',
          rating: 5,
          canReorder: true,
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          restaurantName: 'Burger Junction',
          restaurantImage: '/api/placeholder/60/60',
          items: [
            { name: 'Classic Burger', quantity: 2, price: 12.99 },
            { name: 'French Fries', quantity: 1, price: 4.99 },
          ],
          subtotal: 30.97,
          deliveryFee: 3.99,
          tax: 2.78,
          total: 37.74,
          status: 'preparing',
          orderDate: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          deliveryTime: '35-45 min',
          deliveryAddress: '123 Main St, Apt 4B',
          paymentMethod: 'Credit Card ****1234',
          canReorder: true,
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          restaurantName: 'Sushi Zen',
          restaurantImage: '/api/placeholder/60/60',
          items: [
            { name: 'California Roll', quantity: 2, price: 8.99 },
            { name: 'Salmon Sashimi', quantity: 1, price: 15.99 },
          ],
          subtotal: 33.97,
          deliveryFee: 4.99,
          tax: 3.12,
          total: 42.08,
          status: 'on_the_way',
          orderDate: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
          deliveryTime: '10-15 min',
          deliveryAddress: '123 Main St, Apt 4B',
          paymentMethod: 'PayPal',
          canReorder: true,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'preparing':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'on_the_way':
        return <TruckIcon className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_the_way':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const filteredOrders = orders.filter(order => {
    if (selectedFilter === 'all') return true;
    return order.status === selectedFilter;
  });

  const handleReorder = (order: Order) => {
    console.log('Reordering:', order.orderNumber);
    // Implement reorder logic
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Order History</h1>
            <p className="text-gray-600">Track and manage your past orders</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {orders.length} Total Orders
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'preparing', label: 'Preparing' },
            { key: 'on_the_way', label: 'On the Way' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ShoppingBagIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
                    {getStatusIcon(order.status)}
                  </div>
                  <p className="text-sm text-gray-600">{order.restaurantName}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.orderDate)}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
                <p className="text-lg font-bold text-gray-900 mt-1">${order.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.quantity}x {item.name}</span>
                    <span className="text-gray-900">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                {order.status === 'delivered' && order.rating && (
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${
                          i < order.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
                {(order.status === 'preparing' || order.status === 'on_the_way') && (
                  <Link
                    href="/account/orders/track"
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center"
                  >
                    <TruckIcon className="h-4 w-4 mr-1" />
                    Track Order
                  </Link>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {order.canReorder && (
                  <button
                    onClick={() => handleReorder(order)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center text-sm"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Reorder
                  </button>
                )}
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">
            {selectedFilter === 'all' 
              ? 'You haven\'t placed any orders yet.' 
              : `No orders with status "${selectedFilter.replace('_', ' ')}" found.`}
          </p>
          <Link
            href="/restaurants"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Start Ordering
          </Link>
        </div>
      )}
    </div>
  );
}

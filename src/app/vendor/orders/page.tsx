'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Order, OrderStatus } from '@/types';

// Mock orders data for vendor
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'cust1',
    restaurantId: 'rest1',
    driverId: 'driver1',
    items: [
      {
        id: 'item1',
        menuItem: {
          id: '1',
          slug: 'margherita-pizza',
          restaurantId: 'rest1',
          name: 'Margherita Pizza',
          description: 'Classic pizza with fresh mozzarella',
          price: 16.99,
          image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=200&fit=crop',
          category: 'Pizza',
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: false,
          isSpicy: false,
          ingredients: ['Mozzarella', 'Tomato Sauce', 'Basil'],
          allergens: ['Gluten', 'Dairy'],
          available: true,
          preparationTime: 15,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        quantity: 2,
        specialInstructions: 'Extra cheese please',
        totalPrice: 33.98
      }
    ],
    status: 'confirmed',
    subtotal: 33.98,
    deliveryFee: 3.99,
    tax: 2.72,
    platformFee: 1.70,
    vendorEarnings: 29.38,
    driverEarnings: 3.99,
    total: 42.39,
    deliveryAddress: {
      street: '123 Main St, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    restaurantAddress: {
      street: '456 Restaurant Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'USA'
    },
    paymentMethod: { type: 'card', cardLast4: '1234', cardBrand: 'Visa' },
    paymentStatus: 'paid',
    specialInstructions: 'Please ring doorbell twice',
    estimatedDeliveryTime: new Date(Date.now() + 1800000),
    orderNumber: 'ORD-001',
    trackingUpdates: [],
    createdAt: new Date(Date.now() - 900000),
    updatedAt: new Date(Date.now() - 300000)
  },
  {
    id: 'ORD-002',
    customerId: 'cust2',
    restaurantId: 'rest1',
    items: [
      {
        id: 'item2',
        menuItem: {
          id: '2',
          slug: 'pepperoni-pizza',
          restaurantId: 'rest1',
          name: 'Pepperoni Pizza',
          description: 'Traditional pepperoni pizza',
          price: 18.99,
          image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop',
          category: 'Pizza',
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          isSpicy: false,
          ingredients: ['Pepperoni', 'Mozzarella', 'Tomato Sauce'],
          allergens: ['Gluten', 'Dairy'],
          available: true,
          preparationTime: 15,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        quantity: 1,
        totalPrice: 18.99
      }
    ],
    status: 'preparing',
    subtotal: 18.99,
    deliveryFee: 3.99,
    tax: 1.84,
    platformFee: 0.95,
    vendorEarnings: 16.44,
    driverEarnings: 3.99,
    total: 25.77,
    deliveryAddress: {
      street: '789 Oak Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      country: 'USA'
    },
    restaurantAddress: {
      street: '456 Restaurant Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'USA'
    },
    paymentMethod: { type: 'card', cardLast4: '5678', cardBrand: 'Mastercard' },
    paymentStatus: 'paid',
    estimatedDeliveryTime: new Date(Date.now() + 2100000),
    orderNumber: 'ORD-002',
    trackingUpdates: [],
    createdAt: new Date(Date.now() - 600000),
    updatedAt: new Date(Date.now() - 120000)
  }
];

export default function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  useEffect(() => {
    // Load orders - removed authentication restrictions for demo
    const loadOrders = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(mockOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // In a real app, this would call an API
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date() }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'preparing';
      case 'preparing':
        return 'ready';
      default:
        return null;
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  // Removed access restrictions for demo purposes

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600">Manage incoming orders and track their progress</p>
            </div>
            <Link href="/vendor/dashboard" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['all', 'pending', 'confirmed', 'preparing', 'ready'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status as 'all' | OrderStatus)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    filter === status
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {status === 'all' ? 'All Orders' : status.replace('_', ' ')}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {status === 'all'
                      ? orders.length
                      : orders.filter(o => o.status === status).length
                    }
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <ClockIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h2>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'No orders have been placed yet.'
                : `No ${filter} orders at the moment.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      Placed {order.createdAt.toLocaleString()} • ${order.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                        className="btn-primary text-sm"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Mark as {getNextStatus(order.status)?.replace('_', ' ')}
                      </button>
                    )}
                    <button className="btn-outline text-sm">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Order Items:</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.quantity}x {item.menuItem.name}</span>
                          {item.specialInstructions && (
                            <p className="text-sm text-gray-600">Note: {item.specialInstructions}</p>
                          )}
                        </div>
                        <span className="font-medium">${item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        Delivery Address
                      </h5>
                      <p className="text-gray-600 text-sm">
                        {order.deliveryAddress.street}<br />
                        {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                      </p>
                      {order.specialInstructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Special Instructions:</strong> {order.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Order Summary</h5>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Your Earnings:</span>
                          <span className="font-medium text-green-600">${order.vendorEarnings.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

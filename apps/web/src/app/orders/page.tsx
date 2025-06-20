'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import MobileFooterNav from '@/components/MobileFooterNav';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types';
import { ClockIcon, CheckCircleIcon, TruckIcon } from '@heroicons/react/24/outline';

// Mock orders data
const mockOrders: Order[] = [
  {
    id: '1',
    customerId: 'user1',
    restaurantId: '1',
    items: [],
    status: 'delivered',
    subtotal: 25.98,
    deliveryFee: 2.99,
    tax: 2.08,
    platformFee: 1.50,
    vendorEarnings: 22.48,
    driverEarnings: 4.49,
    total: 31.05,
    deliveryAddress: {
      street: '123 Main St',
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
    paymentMethod: {
      type: 'card',
      cardLast4: '1234',
      cardBrand: 'Visa'
    },
    paymentStatus: 'paid',
    estimatedDeliveryTime: new Date(Date.now() - 3600000), // 1 hour ago
    actualDeliveryTime: new Date(Date.now() - 3600000),
    orderNumber: 'ORD-001',
    trackingUpdates: [],
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    updatedAt: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    customerId: 'user1',
    restaurantId: '2',
    items: [],
    status: 'out_for_delivery',
    subtotal: 18.99,
    deliveryFee: 3.49,
    tax: 1.52,
    platformFee: 1.20,
    vendorEarnings: 16.79,
    driverEarnings: 4.69,
    total: 24.00,
    deliveryAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    restaurantAddress: {
      street: '789 Pizza St',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      country: 'USA'
    },
    paymentMethod: {
      type: 'card',
      cardLast4: '5678',
      cardBrand: 'Mastercard'
    },
    paymentStatus: 'paid',
    estimatedDeliveryTime: new Date(Date.now() + 900000), // 15 minutes from now
    orderNumber: 'ORD-002',
    trackingUpdates: [],
    createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
    updatedAt: new Date(Date.now() - 300000) // 5 minutes ago
  }
];

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case 'out_for_delivery':
      return <TruckIcon className="h-5 w-5 text-blue-500" />;
    default:
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
  }
};

const getStatusText = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'Order Placed';
    case 'confirmed':
      return 'Confirmed';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready for Pickup';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
      return 'text-green-600 bg-green-50';
    case 'out_for_delivery':
      return 'text-blue-600 bg-blue-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-yellow-600 bg-yellow-50';
  }
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;

      try {
        // In a real app, this would fetch orders from the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(mockOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  // FAST LOADING: Don't block page render for auth loading

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Header />
        <div className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your orders</h1>
            <Link href="/auth/signin" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
        <MobileFooterNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />

      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>

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
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">When you place your first order, it will appear here.</p>
            <Link href="/" className="btn-primary">
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id}
                    </h3>
                    <p className="text-gray-600">
                      Placed on {order.createdAt.toLocaleDateString()} at {order.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      ${order.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.paymentMethod.cardBrand} •••• {order.paymentMethod.cardLast4}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Delivery Address:</span>
                      <p className="text-gray-600">
                        {order.deliveryAddress.street}<br />
                        {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Order Total:</span>
                      <div className="text-gray-600">
                        <div>Subtotal: ${order.subtotal.toFixed(2)}</div>
                        <div>Delivery: ${order.deliveryFee.toFixed(2)}</div>
                        <div>Tax: ${order.tax.toFixed(2)}</div>
                      </div>
                    </div>
                    <div>
                      {order.status === 'out_for_delivery' && (
                        <>
                          <span className="font-medium text-gray-900">Estimated Delivery:</span>
                          <p className="text-gray-600">
                            {order.estimatedDeliveryTime.toLocaleTimeString()}
                          </p>
                        </>
                      )}
                      {order.status === 'delivered' && order.actualDeliveryTime && (
                        <>
                          <span className="font-medium text-gray-900">Delivered At:</span>
                          <p className="text-gray-600">
                            {order.actualDeliveryTime.toLocaleTimeString()}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <button className="text-orange-600 hover:text-orange-700 font-medium">
                    View Details
                  </button>
                  <div className="space-x-2">
                    {order.status === 'delivered' && (
                      <button className="btn-outline text-sm">
                        Reorder
                      </button>
                    )}
                    <button className="btn-outline text-sm">
                      Get Help
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MobileFooterNav />
    </div>
  );
}

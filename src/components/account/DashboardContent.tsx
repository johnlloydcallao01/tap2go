'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShoppingBagIcon,
  HeartIcon,
  StarIcon,
  GiftIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  favoriteRestaurants: number;
  averageRating: number;
  savedAddresses: number;
  monthlySpending: number;
  spendingChange: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantImage: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  total: number;
  status: 'delivered' | 'preparing' | 'on_the_way' | 'cancelled';
  orderDate: Date;
  deliveryTime?: string;
}

interface FavoriteRestaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
}

export default function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<FavoriteRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading customer data
    setTimeout(() => {
      setStats({
        totalOrders: 47,
        totalSpent: 1247.85,
        loyaltyPoints: 2340,
        favoriteRestaurants: 12,
        averageRating: 4.6,
        savedAddresses: 3,
        monthlySpending: 285.50,
        spendingChange: 12.5,
      });

      setRecentOrders([
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          restaurantName: 'Pizza Palace',
          restaurantImage: '/api/placeholder/60/60',
          items: [
            { name: 'Margherita Pizza', quantity: 1 },
            { name: 'Garlic Bread', quantity: 2 },
          ],
          total: 24.99,
          status: 'delivered',
          orderDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          deliveryTime: '25 min',
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          restaurantName: 'Burger Junction',
          restaurantImage: '/api/placeholder/60/60',
          items: [
            { name: 'Classic Burger', quantity: 2 },
            { name: 'Fries', quantity: 1 },
          ],
          total: 18.50,
          status: 'delivered',
          orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          deliveryTime: '30 min',
        },
      ]);

      setFavoriteRestaurants([
        {
          id: '1',
          name: 'Pizza Palace',
          image: '/api/placeholder/80/80',
          cuisine: 'Italian',
          rating: 4.8,
          deliveryTime: '20-30 min',
          deliveryFee: 2.99,
        },
        {
          id: '2',
          name: 'Sushi Zen',
          image: '/api/placeholder/80/80',
          cuisine: 'Japanese',
          rating: 4.9,
          deliveryTime: '25-35 min',
          deliveryFee: 3.99,
        },
        {
          id: '3',
          name: 'Taco Fiesta',
          image: '/api/placeholder/80/80',
          cuisine: 'Mexican',
          rating: 4.7,
          deliveryTime: '15-25 min',
          deliveryFee: 1.99,
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

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
    return `${diffInDays}d ago`;
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back! 👋</h1>
            <p className="text-orange-100">
              Hi {user?.name || user?.email?.split('@')[0]}, ready to order something delicious?
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/restaurants"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <ShoppingBagIcon className="h-4 w-4 mr-2" />
              Order Now
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders}</p>
              <p className="text-sm text-green-600 font-medium mt-1">Since joining</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900">${stats?.totalSpent.toFixed(2)}</p>
              <p className="text-sm text-purple-600 font-medium mt-1">Lifetime value</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Loyalty Points */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Loyalty Points</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.loyaltyPoints}</p>
              <p className="text-sm text-orange-600 font-medium mt-1">Gold member</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <GiftIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Monthly Spending */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">This Month</p>
              <p className="text-3xl font-bold text-gray-900">${stats?.monthlySpending.toFixed(2)}</p>
              <div className="flex items-center mt-1">
                <ArrowUpIcon className="h-3 w-3 text-green-600 mr-1" />
                <p className="text-sm text-green-600 font-medium">+{stats?.spendingChange}%</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link
                href="/account/orders"
                className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center"
              >
                View All →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <ShoppingBagIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900">{order.restaurantName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{formatDate(order.orderDate)}</span>
                        <span className="font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Restaurants */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Favorites</h2>
              <Link
                href="/account/favorites"
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {favoriteRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <HeartIcon className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 ml-1">{restaurant.rating}</span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600">{restaurant.deliveryTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/account/orders/track"
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Track Order</span>
          </Link>

          <Link
            href="/account/addresses"
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
              <MapPinIcon className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Addresses</span>
          </Link>

          <Link
            href="/account/loyalty"
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
              <GiftIcon className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Rewards</span>
          </Link>

          <Link
            href="/account/support"
            className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

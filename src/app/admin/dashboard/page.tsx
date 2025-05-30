'use client';

import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalDrivers: number;
  totalOrders: number;
  totalRevenue: number;
  activeOrders: number;
  pendingVendors: number;
  pendingDrivers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVendors: 0,
    totalDrivers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    pendingVendors: 0,
    pendingDrivers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      try {
        // In a real app, you would fetch this data from your database
        await new Promise(resolve => setTimeout(resolve, 1000));

        setStats({
          totalUsers: 1247,
          totalVendors: 89,
          totalDrivers: 156,
          totalOrders: 3421,
          totalRevenue: 125430.50,
          activeOrders: 23,
          pendingVendors: 5,
          pendingDrivers: 12,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: UsersIcon,
      change: '+12%',
      changeType: 'increase',
      color: 'bg-blue-500',
    },
    {
      name: 'Total Vendors',
      value: stats.totalVendors.toLocaleString(),
      icon: BuildingStorefrontIcon,
      change: '+8%',
      changeType: 'increase',
      color: 'bg-green-500',
    },
    {
      name: 'Total Drivers',
      value: stats.totalDrivers.toLocaleString(),
      icon: TruckIcon,
      change: '+15%',
      changeType: 'increase',
      color: 'bg-purple-500',
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBagIcon,
      change: '+23%',
      changeType: 'increase',
      color: 'bg-orange-500',
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      change: '+18%',
      changeType: 'increase',
      color: 'bg-emerald-500',
    },
    {
      name: 'Active Orders',
      value: stats.activeOrders.toLocaleString(),
      icon: ChartBarIcon,
      change: '-5%',
      changeType: 'decrease',
      color: 'bg-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm lg:text-base text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your platform.</p>
        </div>
        <div className="text-xs lg:text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs lg:text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-2 lg:p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
            <div className="mt-3 lg:mt-4 flex items-center">
              {stat.changeType === 'increase' ? (
                <ArrowUpIcon className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 lg:h-4 lg:w-4 text-red-500" />
              )}
              <span
                className={`text-xs lg:text-sm font-medium ml-1 ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-xs lg:text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">Pending Approvals</h3>
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center justify-between p-3 lg:p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <BuildingStorefrontIcon className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-600 mr-2 lg:mr-3" />
                <span className="text-xs lg:text-sm font-medium text-gray-900">Vendor Applications</span>
              </div>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 lg:px-2.5 py-0.5 rounded-full">
                {stats.pendingVendors} pending
              </span>
            </div>
            <div className="flex items-center justify-between p-3 lg:p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <TruckIcon className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600 mr-2 lg:mr-3" />
                <span className="text-xs lg:text-sm font-medium text-gray-900">Driver Applications</span>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 lg:px-2.5 py-0.5 rounded-full">
                {stats.pendingDrivers} pending
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <span className="text-xs lg:text-sm text-gray-600 block">New vendor &quot;Pizza Palace&quot; approved</span>
                <span className="text-xs text-gray-400">2 min ago</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <span className="text-xs lg:text-sm text-gray-600 block">Driver John D. completed verification</span>
                <span className="text-xs text-gray-400">15 min ago</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <span className="text-xs lg:text-sm text-gray-600 block">Order #1234 disputed by customer</span>
                <span className="text-xs text-gray-400">1 hour ago</span>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <span className="text-xs lg:text-sm text-gray-600 block">System maintenance completed</span>
                <span className="text-xs text-gray-400">3 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import type { DashboardData } from '@/lib/dashboard-types';
import {
  MetricCard,
  RevenueChart,
  OrderStatusChart,
  TopMerchantsChart,
  RecentOrdersTable,
  TopVendorsTable,
} from '@/components/dashboard';
import { DollarSign, ShoppingCart, Store } from '@/components/ui/IconWrapper';

function DashboardSkeleton() {
  return (
    <div className="space-y-6 py-5 px-2.5 animate-pulse">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="h-7 w-32 bg-gray-200 dark:bg-[#262626] rounded" />
        <div className="h-4 w-64 bg-gray-200 dark:bg-[#262626] rounded" />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 dark:bg-[#262626] rounded" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-[#262626] rounded" />
              </div>
              <div className="w-10 h-10 bg-gray-200 dark:bg-[#262626] rounded-xl" />
            </div>
            <div className="h-3 w-16 bg-gray-200 dark:bg-[#262626] rounded" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-xl p-5">
            <div className="h-5 w-32 bg-gray-200 dark:bg-[#262626] rounded mb-4" />
            <div className="h-64 bg-gray-100 dark:bg-[#262626] rounded-lg border border-gray-200 dark:border-[#262626]" />
            <div className="flex gap-2 mt-3">
              <div className="h-3 w-16 bg-gray-200 dark:bg-[#262626] rounded" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-[#262626] rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Top Merchants Chart */}
      <div className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-xl p-5">
        <div className="h-5 w-36 bg-gray-200 dark:bg-[#262626] rounded mb-4" />
        <div className="h-64 bg-gray-100 dark:bg-[#262626] rounded-lg border border-gray-200 dark:border-[#262626]" />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-xl p-5">
          <div className="h-5 w-32 bg-gray-200 dark:bg-[#262626] rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-[#262626] rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-gray-200 dark:bg-[#262626] rounded" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-[#262626] rounded" />
                </div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-[#262626] rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-[#171717] border border-gray-200 dark:border-[#262626] rounded-xl p-5">
          <div className="h-5 w-28 bg-gray-200 dark:bg-[#262626] rounded mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-[#262626] rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-[#262626] rounded" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-[#262626] rounded" />
                </div>
                <div className="h-3 w-8 bg-gray-200 dark:bg-[#262626] rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, revenueChart, orderStatusChart, topMerchants, topVendors, recentOrders } = data;

  return (
    <div className="space-y-6 py-5 px-2.5">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1">Overview of your platform performance</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₱${metrics.totalRevenue.toLocaleString()}`}
          change={metrics.revenueChange}
          icon={<DollarSign className="w-5 h-5 text-white" />}
          iconBg="bg-green-500"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          change={metrics.ordersChange}
          icon={<ShoppingCart className="w-5 h-5 text-white" />}
          iconBg="bg-blue-500"
        />
        <MetricCard
          title="Active Merchants"
          value={metrics.activeMerchants.toLocaleString()}
          change={metrics.merchantsChange}
          icon={<Store className="w-5 h-5 text-white" />}
          iconBg="bg-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart data={revenueChart} />
        <OrderStatusChart data={orderStatusChart} />
      </div>

      {/* Top Merchants Chart */}
      <TopMerchantsChart data={topMerchants} />

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={recentOrders} />
        </div>
        <div>
          <TopVendorsTable vendors={topVendors} />
        </div>
      </div>
    </div>
  );
}

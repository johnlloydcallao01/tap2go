'use client';

import React, { useState, useEffect } from 'react';
import type { MerchantDashboardData } from '@/lib/dashboard-types';
import {
  MetricCard,
  RevenueChart,
  OrderStatusChart,
  OutletStatusGrid,
  TopProductsChart,
  PendingOrdersTable,
  ActiveDeliveriesList,
  RecentOrdersTable,
} from '@/components/dashboard';
import { DollarSign, ShoppingCart, Clock, Loader2 } from '@/components/ui/IconWrapper';

export default function DashboardPage() {
  const [data, setData] = useState<MerchantDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/merchant-dashboard');
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
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">Loading dashboard...</p>
        </div>
      </div>
    );
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

  const { metrics, outlets, revenueChart, orderStatusChart, topProducts, activeDeliveries, pendingOrders, recentOrders } = data;

  return (
    <div className="space-y-6 py-5 px-2.5">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Business Overview</h1>
        <p className="text-sm text-gray-500 dark:text-[#a1a1aa] mt-1">Performance across all your outlets</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Revenue"
          value={`₱${metrics.todayRevenue.toLocaleString()}`}
          change={metrics.revenueChange}
          icon={<DollarSign className="w-5 h-5 text-white" />}
          iconBg="bg-green-500"
        />
        <MetricCard
          title="Pending Orders"
          value={metrics.pendingOrders.toLocaleString()}
          change={0}
          icon={<Clock className="w-5 h-5 text-white" />}
          iconBg="bg-amber-500"
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toLocaleString()}
          change={metrics.ordersChange}
          icon={<ShoppingCart className="w-5 h-5 text-white" />}
          iconBg="bg-blue-500"
        />
        <MetricCard
          title="Total Revenue"
          value={`₱${metrics.totalRevenue.toLocaleString()}`}
          change={metrics.revenueChange}
          icon={<DollarSign className="w-5 h-5 text-white" />}
          iconBg="bg-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart data={revenueChart} />
        <OrderStatusChart data={orderStatusChart} />
      </div>

      {/* Outlets Status */}
      <OutletStatusGrid outlets={outlets} />

      {/* Top Products & Active Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProductsChart data={topProducts} />
        <ActiveDeliveriesList deliveries={activeDeliveries} />
      </div>

      {/* Pending Orders & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PendingOrdersTable orders={pendingOrders} />
        <RecentOrdersTable orders={recentOrders} />
      </div>
    </div>
  );
}

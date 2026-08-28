'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { DollarSign, ShoppingCart, Clock, RefreshCw, AlertCircle } from '@/components/ui/IconWrapper';

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="text-center max-w-md">
        <div className="h-14 w-14 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7 text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Failed to load dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 py-5 px-2.5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded w-56" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-72" />
        </div>
        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-32" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 [&>:last-child:nth-child(odd)]:col-span-full lg:[&>:last-child:nth-child(odd)]:col-span-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-5 shadow-sm">
            <div className="space-y-3">
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20" />
              <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded w-12" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4 h-80">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36 mb-4" />
          <div className="flex items-end gap-3 h-64">
            {[55, 70, 40, 85, 50, 65, 45, 75].map((h, i) => (
              <div key={i} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4 h-80">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36 mb-4" />
          <div className="flex items-center justify-center h-64">
            <div className="relative h-40 w-40">
              <div className="h-full w-full rounded-full bg-gray-100 dark:bg-gray-800" />
              <div className="absolute inset-5 rounded-full bg-white dark:bg-[var(--card-background)]" />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4 h-44">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-200 dark:border-[var(--card-border)] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-2 w-2 bg-gray-100 dark:bg-gray-800 rounded-full" />
              </div>
              <div className="flex gap-4">
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-4 h-80">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32 mb-4" />
          <div className="flex items-end gap-3 h-64">
            {[40, 60, 35, 75, 50].map((h, i) => (
              <div key={i} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-t" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)]">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-36" />
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)]">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" />
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-[var(--card-border)]">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-32" />
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<MerchantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/merchant-dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error && !data) {
    return (
      <div className="p-4 sm:p-6">
        <DashboardError message={error} onRetry={load} />
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) return null;

  const { metrics, outlets, revenueChart, orderStatusChart, topProducts, activeDeliveries, pendingOrders, recentOrders } = data;

  return (
    <div className="space-y-6 py-5 px-2.5">
      {/* Page Header */}
      <div>
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">My Business Overview</h1>
        <p className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-500 dark:text-gray-400">Performance across all your outlets</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 [&>:last-child:nth-child(odd)]:col-span-full lg:[&>:last-child:nth-child(odd)]:col-span-1">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueChart} />
        <OrderStatusChart data={orderStatusChart} />
      </div>

      {/* Outlets Status */}
      <OutletStatusGrid outlets={outlets} />

      {/* Top Products & Active Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsChart data={topProducts} />
        <ActiveDeliveriesList deliveries={activeDeliveries} />
      </div>

      {/* Pending Orders & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingOrdersTable orders={pendingOrders} />
        <RecentOrdersTable orders={recentOrders} />
      </div>
    </div>
  );
}

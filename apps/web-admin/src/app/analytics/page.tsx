'use client';

// Force dynamic rendering - avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TruckIcon,
  ShoppingBagIcon,
  MapPinIcon,
  ClockIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Import analytics components
import AdminRevenueCharts from '@/components/analytics/admin/AdminRevenueCharts';
import AdminOrderCharts from '@/components/analytics/admin/AdminOrderCharts';
import AdminAdvancedCharts from '@/components/analytics/admin/AdminAdvancedCharts';
import DirectChartsExamples from '@/components/analytics/DirectChartsExamples';

// Import chart components
import BaseChart, { TAP2GO_COLORS } from '@/components/analytics/BaseChart';
import { RealTimeDirectChart } from '@/components/analytics/DirectECharts';
import type { EChartsOption } from 'echarts';

// Define proper types for analytics data
interface RevenueDataItem {
  date: string;
  value: number;
}

interface OrderDataItem {
  date: string;
  value: number;
}

interface RevenueData {
  totalRevenue: number;
  platformRevenue: number;
  vendorRevenue: number;
  driverRevenue: number;
  revenueByPeriod: RevenueDataItem[];
  revenueBreakdown: {
    platformFees: number;
    commissions: number;
    deliveryFees: number;
  };
}

interface OrderData {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  ordersByHour: { x: string | number | Date; y: number; label?: string; color?: string; }[];
  orderStatusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  averageOrderValue: number;
  orderTrends: OrderDataItem[];
}

type AnalyticsSection = 'overview' | 'revenue' | 'orders' | 'users' | 'geographic' | 'realtime' | 'advanced';

export default function AdminAnalytics() {
  const [activeSection, setActiveSection] = useState<AnalyticsSection>('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  // Generate demo data
  const [revenueData] = useState<RevenueData>(() => ({
    totalRevenue: 2847563,
    platformRevenue: 854269,
    vendorRevenue: 1708138,
    driverRevenue: 285156,
    revenueByPeriod: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100000) + 50000,
    })),
    revenueBreakdown: {
      platformFees: 854269,
      commissions: 427135,
      deliveryFees: 285156,
    },
  }));

  const [orderData] = useState<OrderData>(() => ({
    totalOrders: 15847,
    completedOrders: 14263,
    cancelledOrders: 792,
    pendingOrders: 792,
    ordersByHour: Array.from({ length: 24 }, (_, i) => ({
      x: `${i}:00`,
      y: Math.floor(Math.random() * 200) + 50,
    })),
    orderStatusDistribution: [
      { status: 'Completed', count: 14263, percentage: 90.0 },
      { status: 'Pending', count: 792, percentage: 5.0 },
      { status: 'Cancelled', count: 792, percentage: 5.0 },
    ],
    averageOrderValue: 485.50,
    orderTrends: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 800) + 400,
    })),
  }));

  // Analytics navigation items
  const analyticsNavigation = [
    { id: 'overview', name: 'Overview Dashboard', icon: ChartBarIcon, color: 'text-orange-600' },
    { id: 'revenue', name: 'Revenue Analytics', icon: CurrencyDollarIcon, color: 'text-green-600' },
    { id: 'orders', name: 'Order Analytics', icon: ShoppingBagIcon, color: 'text-blue-600' },
    { id: 'users', name: 'User Analytics', icon: UsersIcon, color: 'text-purple-600' },
    { id: 'geographic', name: 'Geographic Analytics', icon: MapPinIcon, color: 'text-red-600' },
    { id: 'realtime', name: 'Real-time Analytics', icon: ClockIcon, color: 'text-indigo-600' },
    { id: 'advanced', name: 'Advanced Visualizations', icon: ArrowTrendingUpIcon, color: 'text-pink-600' },
  ];

  // Date range options
  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  const handleSectionChange = (section: AnalyticsSection) => {
    setIsLoading(true);
    setActiveSection(section);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleExportData = () => {
    // Simulate export functionality
    console.log('Exporting analytics data...');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive analytics and insights powered by ECharts</p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>

            {/* Filter Button */}
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
              {analyticsNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id as AnalyticsSection)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeSection === item.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${activeSection === item.id ? item.color : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-600">Loading analytics...</span>
          </div>
        )}

        {/* Content Sections */}
        {!isLoading && (
          <div className="space-y-6">
            {activeSection === 'overview' && <OverviewDashboard revenueData={revenueData} orderData={orderData} />}
            {activeSection === 'revenue' && <RevenueAnalyticsSection data={revenueData} />}
            {activeSection === 'orders' && <OrderAnalyticsSection data={orderData} />}
            {activeSection === 'users' && <UserAnalyticsSection />}
            {activeSection === 'geographic' && <GeographicAnalyticsSection />}
            {activeSection === 'realtime' && <RealTimeAnalyticsSection />}
            {activeSection === 'advanced' && <AdvancedVisualizationsSection />}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Overview Dashboard Component
const OverviewDashboard: React.FC<{ revenueData: RevenueData; orderData: OrderData }> = ({ revenueData, orderData }) => {
  // Overview metrics chart
  const overviewMetricsOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: revenueData.revenueByPeriod.slice(-7).map(item =>
        new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Revenue (₱)',
        position: 'left',
        axisLabel: {
          color: '#6b7280',
          formatter: (value: number) => `₱${(value / 1000).toFixed(0)}K`,
        },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      {
        type: 'value',
        name: 'Orders',
        position: 'right',
        axisLabel: { color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitLine: { show: false },
      }
    ],
    series: [
      {
        name: 'Revenue',
        type: 'line',
        yAxisIndex: 0,
        data: revenueData.revenueByPeriod.slice(-7).map(item => item.value),
        lineStyle: { color: TAP2GO_COLORS.primary, width: 3 },
        itemStyle: { color: TAP2GO_COLORS.primary },
        smooth: true,
        areaStyle: { color: 'rgba(243, 168, 35, 0.3)' },
      },
      {
        name: 'Orders',
        type: 'bar',
        yAxisIndex: 1,
        data: orderData.orderTrends.slice(-7).map(item => item.value),
        itemStyle: { color: TAP2GO_COLORS.info },
        barWidth: '40%',
      }
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const paramsArray = params as Array<{ seriesName: string; value: number; axisValue: string }>;
        let result = `<b>${paramsArray[0].axisValue}</b><br/>`;
        paramsArray.forEach((param) => {
          if (param.seriesName === 'Revenue') {
            result += `${param.seriesName}: ₱${param.value.toLocaleString()}<br/>`;
          } else {
            result += `${param.seriesName}: ${param.value}<br/>`;
          }
        });
        return result;
      },
    },
    legend: {
      data: ['Revenue', 'Orders'],
      bottom: 0,
    },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 opacity-80" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Total Revenue</p>
              <p className="text-2xl font-bold">₱{(revenueData.totalRevenue / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <ShoppingBagIcon className="h-8 w-8 opacity-80" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Total Orders</p>
              <p className="text-2xl font-bold">{orderData.totalOrders.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 opacity-80" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Active Users</p>
              <p className="text-2xl font-bold">12.5K</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 opacity-80" />
            <div className="ml-4">
              <p className="text-sm opacity-90">Avg Order Value</p>
              <p className="text-2xl font-bold">₱{orderData.averageOrderValue.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Chart */}
      <BaseChart
        option={overviewMetricsOption}
        config={{
          title: 'Revenue & Orders Overview',
          subtitle: 'Last 7 days performance metrics',
          height: 400,
          showLegend: true,
        }}
      />
    </div>
  );
};

// Revenue Analytics Section
const RevenueAnalyticsSection: React.FC<{ data: RevenueData }> = ({ data }) => {
  // Convert RevenueData to format expected by AdminRevenueCharts
  const revenueChartData = data.revenueByPeriod.map(item => ({
    date: item.date,
    revenue: item.value,
    orders: Math.floor(item.value / 485), // Simulate orders based on AOV
    averageOrderValue: 485,
    commission: item.value * 0.15,
    refunds: item.value * 0.02,
    netRevenue: item.value * 0.83,
  }));

  return <AdminRevenueCharts data={revenueChartData} />;
};

// Order Analytics Section
const OrderAnalyticsSection: React.FC<{ data: OrderData }> = ({ data }) => {
  // Convert OrderData to format expected by AdminOrderCharts
  const orderChartData = data.orderTrends.map(item => ({
    date: item.date,
    totalOrders: item.value,
    completedOrders: Math.floor(item.value * 0.9),
    cancelledOrders: Math.floor(item.value * 0.05),
    averageDeliveryTime: 28 + Math.random() * 10,
    customerSatisfaction: 4.2 + Math.random() * 0.6,
  }));

  return <AdminOrderCharts data={orderChartData} />;
};

// User Analytics Section
const UserAnalyticsSection: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Analytics</h3>
      <p className="text-gray-600">User analytics implementation coming soon...</p>
    </div>
  );
};

// Geographic Analytics Section
const GeographicAnalyticsSection: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Analytics</h3>
      <p className="text-gray-600">Geographic analytics implementation coming soon...</p>
    </div>
  );
};

// Real-time Analytics Section
const RealTimeAnalyticsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Order Monitoring</h3>
        <RealTimeDirectChart
          title="Live Order Volume"
          subtitle="Orders per minute (updates every 2 seconds)"
        />
      </div>
    </div>
  );
};

// Advanced Visualizations Section
const AdvancedVisualizationsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <AdminAdvancedCharts />
      <DirectChartsExamples />
    </div>
  );
};

'use client';

// Force dynamic rendering - avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
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

// Import demo data generators


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
  );
}

// Overview Dashboard Component
const OverviewDashboard: React.FC<{ revenueData: RevenueData; orderData: OrderData }> = ({ revenueData, orderData }) => {
  // Key metrics data
  const keyMetrics = [
    {
      title: 'Total Revenue',
      value: `₱${revenueData.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: orderData.totalOrders.toLocaleString(),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Users',
      value: '24,847',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: UsersIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Drivers',
      value: '1,247',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: TruckIcon,
      color: 'bg-orange-500',
    },
  ];

  // Quick overview charts options
  const revenueOverviewOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: revenueData.revenueByPeriod.slice(-7).map((item: RevenueDataItem) =>
        new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      axisLabel: { color: '#6b7280', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    grid: {
      left: 0,
      right: 0,
      top: 10,
      bottom: 20,
    },
    series: [{
      data: revenueData.revenueByPeriod.slice(-7).map((item: RevenueDataItem) => item.value),
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: TAP2GO_COLORS.success, width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
          ]
        }
      },
    }],
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const data = (params as Array<{ value: number }>)[0];
        return `Revenue: ₱${data.value.toLocaleString()}`;
      },
    },
  };

  const ordersOverviewOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: orderData.orderTrends.slice(-7).map((item: OrderDataItem) =>
        new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      axisLabel: { color: '#6b7280', fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    grid: {
      left: 0,
      right: 0,
      top: 10,
      bottom: 20,
    },
    series: [{
      data: orderData.orderTrends.slice(-7).map((item: OrderDataItem) => item.value),
      type: 'bar',
      itemStyle: { color: TAP2GO_COLORS.info },
      barWidth: '60%',
    }],
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const data = (params as Array<{ value: number }>)[0];
        return `Orders: ${data.value}`;
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`${metric.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className={`text-sm ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change} from last month
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Overview Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (7 Days)</h3>
          <div style={{ height: 200 }}>
            <BaseChart option={revenueOverviewOption} config={{ height: 200 }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Volume (7 Days)</h3>
          <div style={{ height: 200 }}>
            <BaseChart option={ordersOverviewOption} config={{ height: 200 }} />
          </div>
        </div>
      </div>

      {/* Platform Health Indicators */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Health Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900">System Status</h4>
            <p className="text-green-600 font-medium">All Systems Operational</p>
            <p className="text-sm text-gray-500 mt-1">99.9% uptime this month</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <ClockIcon className="w-8 h-8 text-blue-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Avg Delivery Time</h4>
            <p className="text-blue-600 font-medium">28.5 minutes</p>
            <p className="text-sm text-gray-500 mt-1">2 min faster than last week</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <TruckIcon className="w-8 h-8 text-orange-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Driver Utilization</h4>
            <p className="text-orange-600 font-medium">87.3%</p>
            <p className="text-sm text-gray-500 mt-1">Optimal efficiency range</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Revenue Analytics Section
const RevenueAnalyticsSection: React.FC<{ data: RevenueData }> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
          <p className="text-gray-600">Comprehensive revenue tracking and financial analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            React ECharts Implementation
          </span>
        </div>
      </div>
      <AdminRevenueCharts data={data} />
    </div>
  );
};

// Order Analytics Section
const OrderAnalyticsSection: React.FC<{ data: OrderData }> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Analytics</h2>
          <p className="text-gray-600">Monitor order volumes, completion rates, and patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            React ECharts Implementation
          </span>
        </div>
      </div>
      <AdminOrderCharts data={data} />
    </div>
  );
};

// User Analytics Section
const UserAnalyticsSection: React.FC = () => {
  // User analytics data
  const userGrowthOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [
      {
        name: 'New Users',
        type: 'bar',
        data: [1200, 1800, 1500, 2200, 2800, 3200],
        itemStyle: { color: TAP2GO_COLORS.primary },
      },
      {
        name: 'Returning Users',
        type: 'bar',
        data: [800, 1200, 1000, 1500, 1800, 2100],
        itemStyle: { color: TAP2GO_COLORS.info },
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
  };

  const userTypeDistributionOption: EChartsOption = {
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 15847, name: 'Customers', itemStyle: { color: TAP2GO_COLORS.primary } },
        { value: 2847, name: 'Vendors', itemStyle: { color: TAP2GO_COLORS.success } },
        { value: 1247, name: 'Drivers', itemStyle: { color: TAP2GO_COLORS.info } },
        { value: 847, name: 'Admins', itemStyle: { color: TAP2GO_COLORS.warning } },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      label: {
        show: true,
        formatter: '{b}: {c} ({d}%)',
      },
    }],
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} users ({d}%)',
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Analytics</h2>
          <p className="text-gray-600">User growth, engagement, and demographic insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Mixed Implementation
          </span>
        </div>
      </div>

      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Users</h3>
          <p className="text-2xl font-bold">20,788</p>
          <p className="text-xs opacity-75">+12.5% this month</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Active Users</h3>
          <p className="text-2xl font-bold">18,247</p>
          <p className="text-xs opacity-75">87.8% activity rate</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">New Signups</h3>
          <p className="text-2xl font-bold">3,247</p>
          <p className="text-xs opacity-75">This month</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Retention Rate</h3>
          <p className="text-2xl font-bold">78.5%</p>
          <p className="text-xs opacity-75">30-day retention</p>
        </div>
      </div>

      {/* User Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BaseChart
          option={userGrowthOption}
          config={{
            title: 'User Growth Trends',
            subtitle: 'New vs Returning Users',
            height: 400,
            showLegend: true,
          }}
        />

        <BaseChart
          option={userTypeDistributionOption}
          config={{
            title: 'User Type Distribution',
            subtitle: 'Platform user categories',
            height: 400,
            showLegend: true,
          }}
        />
      </div>
    </div>
  );
};

// Geographic Analytics Section
const GeographicAnalyticsSection: React.FC = () => {
  // Geographic data visualization
  const deliveryZonesOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: ['Makati CBD', 'BGC', 'Ortigas', 'Quezon City', 'Mandaluyong', 'Pasig'],
      axisLabel: { color: '#6b7280', rotate: 45 },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Orders',
        position: 'left',
        axisLabel: { color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      {
        type: 'value',
        name: 'Avg Time (min)',
        position: 'right',
        axisLabel: { color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      }
    ],
    series: [
      {
        name: 'Orders',
        type: 'bar',
        data: [1245, 1089, 987, 856, 743, 654],
        itemStyle: { color: TAP2GO_COLORS.primary },
        yAxisIndex: 0,
      },
      {
        name: 'Avg Delivery Time',
        type: 'line',
        data: [25.2, 30.1, 28.8, 32.5, 27.3, 29.7],
        itemStyle: { color: TAP2GO_COLORS.error },
        lineStyle: { width: 3 },
        yAxisIndex: 1,
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
  };

  // Heatmap simulation data
  const heatmapOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'],
      axisLabel: { color: '#6b7280' },
    },
    yAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: { color: '#6b7280' },
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#f3f4f6', TAP2GO_COLORS.primary, TAP2GO_COLORS.secondary]
      }
    },
    series: [{
      name: 'Order Density',
      type: 'heatmap',
      data: [
        [0, 0, 5], [1, 0, 8], [2, 0, 12], [3, 0, 25], [4, 0, 45], [5, 0, 38], [6, 0, 65], [7, 0, 42],
        [0, 1, 7], [1, 1, 10], [2, 1, 15], [3, 1, 28], [4, 1, 48], [5, 1, 42], [6, 1, 68], [7, 1, 45],
        [0, 2, 6], [1, 2, 9], [2, 2, 14], [3, 2, 27], [4, 2, 47], [5, 2, 40], [6, 2, 67], [7, 2, 44],
        [0, 3, 8], [1, 3, 12], [2, 3, 18], [3, 3, 32], [4, 3, 52], [5, 3, 45], [6, 3, 72], [7, 3, 48],
        [0, 4, 12], [1, 4, 18], [2, 4, 25], [3, 4, 42], [4, 4, 68], [5, 4, 58], [6, 4, 85], [7, 4, 62],
        [0, 5, 15], [1, 5, 22], [2, 5, 32], [3, 5, 48], [4, 5, 75], [5, 5, 65], [6, 5, 92], [7, 5, 68],
        [0, 6, 10], [1, 6, 15], [2, 6, 22], [3, 6, 35], [4, 6, 58], [5, 6, 48], [6, 6, 78], [7, 6, 55],
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }],
    tooltip: {
      position: 'top',
      formatter: (params: unknown) => {
        const data = (params as { data: [number, number, number] }).data;
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const hours = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
        return `${days[data[1]]} ${hours[data[0]]}<br/>Orders: ${data[2]}`;
      }
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Geographic Analytics</h2>
          <p className="text-gray-600">Delivery zones, heatmaps, and location-based insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            React ECharts Implementation
          </span>
        </div>
      </div>

      {/* Geographic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <MapPinIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Zones</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
              <p className="text-sm text-green-600">+3 new zones</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Coverage Area</p>
              <p className="text-2xl font-bold text-gray-900">847 km²</p>
              <p className="text-sm text-blue-600">Metro Manila</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Distance</p>
              <p className="text-2xl font-bold text-gray-900">4.2 km</p>
              <p className="text-sm text-orange-600">Per delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BaseChart
          option={deliveryZonesOption}
          config={{
            title: 'Delivery Zones Performance',
            subtitle: 'Orders vs Average delivery time by zone',
            height: 400,
            showLegend: true,
          }}
        />

        <BaseChart
          option={heatmapOption}
          config={{
            title: 'Order Density Heatmap',
            subtitle: 'Orders by day and time',
            height: 400,
          }}
        />
      </div>
    </div>
  );
};

// Real-time Analytics Section
const RealTimeAnalyticsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-time Analytics</h2>
          <p className="text-gray-600">Live data streaming and real-time monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Direct ECharts Implementation
          </span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Orders</p>
              <p className="text-2xl font-bold text-blue-600">247</p>
            </div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online Drivers</p>
              <p className="text-2xl font-bold text-green-600">89</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-purple-600">1,847</p>
            </div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue Today</p>
              <p className="text-2xl font-bold text-orange-600">₱84,247</p>
            </div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Order Stream</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600">Updating every 2s</span>
            </div>
          </div>
          <RealTimeDirectChart
            title=""
            subtitle=""
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span>67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Database Load</span>
                <span>23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>API Response Time</span>
                <span>125ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced Visualizations Section
const AdvancedVisualizationsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Visualizations</h2>
          <p className="text-gray-600">Complex chart types showcasing ECharts capabilities</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
            Direct ECharts Implementation
          </span>
        </div>
      </div>

      {/* Advanced Charts Showcase */}
      <AdminAdvancedCharts />

      {/* Direct Charts Examples */}
      <DirectChartsExamples />

      {/* Implementation Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">ECharts Implementation Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">React ECharts Wrapper</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Easy integration with React components</li>
              <li>• Automatic cleanup and lifecycle management</li>
              <li>• Good for standard chart types</li>
              <li>• Simplified event handling</li>
              <li>• Used in Revenue & Order Analytics</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">Direct ECharts Implementation</h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li>• Maximum control and performance</li>
              <li>• Access to all ECharts features</li>
              <li>• Better for complex visualizations</li>
              <li>• Optimized for real-time updates</li>
              <li>• Used in Advanced & Real-time sections</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

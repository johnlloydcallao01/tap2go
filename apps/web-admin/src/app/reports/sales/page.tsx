'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import ReactECharts from 'echarts-for-react';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface SalesData {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  commission: number;
  refunds: number;
  netRevenue: number;
  growthRate: number;
}

interface TopPerformer {
  id: string;
  name: string;
  type: 'restaurant' | 'category' | 'item';
  revenue: number;
  orders: number;
  growthRate: number;
}

export default function SalesReports() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockSalesData: SalesData[] = [
          {
            period: '2024-01-15',
            totalRevenue: 45680.50,
            totalOrders: 1234,
            averageOrderValue: 37.02,
            commission: 4568.05,
            refunds: 890.25,
            netRevenue: 40222.20,
            growthRate: 12.5,
          },
          {
            period: '2024-01-14',
            totalRevenue: 42350.75,
            totalOrders: 1156,
            averageOrderValue: 36.64,
            commission: 4235.08,
            refunds: 756.80,
            netRevenue: 37358.87,
            growthRate: 8.7,
          },
          {
            period: '2024-01-13',
            totalRevenue: 48920.25,
            totalOrders: 1345,
            averageOrderValue: 36.38,
            commission: 4892.03,
            refunds: 1234.50,
            netRevenue: 42793.72,
            growthRate: 15.2,
          },
          {
            period: '2024-01-12',
            totalRevenue: 39875.00,
            totalOrders: 1089,
            averageOrderValue: 36.62,
            commission: 3987.50,
            refunds: 678.90,
            netRevenue: 35208.60,
            growthRate: -3.4,
          },
          {
            period: '2024-01-11',
            totalRevenue: 52340.80,
            totalOrders: 1456,
            averageOrderValue: 35.94,
            commission: 5234.08,
            refunds: 945.75,
            netRevenue: 46160.97,
            growthRate: 18.9,
          },
          {
            period: '2024-01-10',
            totalRevenue: 46780.25,
            totalOrders: 1278,
            averageOrderValue: 36.61,
            commission: 4678.03,
            refunds: 823.40,
            netRevenue: 41278.82,
            growthRate: 6.8,
          },
          {
            period: '2024-01-09',
            totalRevenue: 44560.50,
            totalOrders: 1198,
            averageOrderValue: 37.21,
            commission: 4456.05,
            refunds: 712.30,
            netRevenue: 39392.15,
            growthRate: 4.2,
          },
        ];

        const mockTopPerformers: TopPerformer[] = [
          {
            id: '1',
            name: 'Pizza Palace',
            type: 'restaurant',
            revenue: 15680.50,
            orders: 456,
            growthRate: 12.5,
          },
          {
            id: '2',
            name: 'Burger Barn',
            type: 'restaurant',
            revenue: 12340.75,
            orders: 389,
            growthRate: 8.7,
          },
          {
            id: '3',
            name: 'Sushi Zen',
            type: 'restaurant',
            revenue: 10890.25,
            orders: 234,
            growthRate: 15.2,
          },
          {
            id: '4',
            name: 'Italian Cuisine',
            type: 'category',
            revenue: 8750.00,
            orders: 298,
            growthRate: 6.8,
          },
          {
            id: '5',
            name: 'Margherita Pizza',
            type: 'item',
            revenue: 5680.25,
            orders: 189,
            growthRate: 22.1,
          },
        ];

        setSalesData(mockSalesData);
        setTopPerformers(mockTopPerformers);
      } catch (error) {
        console.error('Error loading sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, [dateRange]);

  // Calculate totals and averages
  const totalRevenue = salesData.reduce((sum, d) => sum + d.totalRevenue, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.totalOrders, 0);
  const totalCommission = salesData.reduce((sum, d) => sum + d.commission, 0);
  const averageGrowthRate = salesData.length > 0 
    ? salesData.reduce((sum, d) => sum + d.growthRate, 0) / salesData.length 
    : 0;

  // Export data function
  const exportData = () => {
    const csvContent = [
      ['Date', 'Revenue', 'Orders', 'AOV', 'Commission', 'Refunds', 'Net Revenue', 'Growth Rate'],
      ...salesData.map(d => [
        d.period,
        d.totalRevenue,
        d.totalOrders,
        d.averageOrderValue,
        d.commission,
        d.refunds,
        d.netRevenue,
        d.growthRate,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ECharts options for revenue trend
  const revenueChartOption = {
    title: {
      text: 'Revenue Trend',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#374151',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const data = (params as Array<{ name: string; value: number }>)[0];
        return `${data.name}<br/>Revenue: $${data.value.toLocaleString()}`;
      },
    },
    xAxis: {
      type: 'category',
      data: salesData.slice().reverse().map(d => 
        new Date(d.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      axisLine: {
        lineStyle: {
          color: '#E5E7EB',
        },
      },
      axisLabel: {
        color: '#6B7280',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#6B7280',
        formatter: (value: number) => `$${(value / 1000).toFixed(0)}K`,
      },
      splitLine: {
        lineStyle: {
          color: '#F3F4F6',
        },
      },
    },
    series: [
      {
        data: salesData.slice().reverse().map(d => d.totalRevenue),
        type: 'line',
        smooth: true,
        lineStyle: {
          color: '#F97316',
          width: 3,
        },
        itemStyle: {
          color: '#F97316',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(249, 115, 22, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(249, 115, 22, 0.05)',
              },
            ],
          },
        },
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
  };

  // ECharts options for revenue breakdown pie chart
  const revenueBreakdownOption = {
    title: {
      text: 'Revenue Breakdown',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#374151',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ${c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#6B7280',
      },
    },
    series: [
      {
        name: 'Revenue',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { 
            value: totalRevenue - totalCommission - salesData.reduce((sum, d) => sum + d.refunds, 0), 
            name: 'Net Revenue',
            itemStyle: { color: '#10B981' }
          },
          { 
            value: totalCommission, 
            name: 'Commission',
            itemStyle: { color: '#F59E0B' }
          },
          { 
            value: salesData.reduce((sum, d) => sum + d.refunds, 0), 
            name: 'Refunds',
            itemStyle: { color: '#EF4444' }
          },
        ],
      },
    ],
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Sales Reports</h1>
            <p className="text-sm lg:text-base text-gray-600">Comprehensive sales analytics and revenue insights.</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={exportData}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-lg font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {averageGrowthRate >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${averageGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {averageGrowthRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-lg font-semibold text-gray-900">{totalOrders.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  Avg: {totalOrders > 0 ? (totalOrders / salesData.length).toFixed(0) : 0}/day
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}
                </p>
                <p className="text-xs text-gray-500">Per order</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Commission</p>
                <p className="text-lg font-semibold text-gray-900">${totalCommission.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {totalRevenue > 0 ? ((totalCommission / totalRevenue) * 100).toFixed(1) : 0}% of revenue
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="revenue">Revenue</option>
                <option value="orders">Orders</option>
                <option value="aov">Average Order Value</option>
              </select>
            </div>

            <ReactECharts
              option={revenueChartOption}
              style={{ height: '300px' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>

          {/* Revenue Breakdown Pie Chart */}
          <div className="bg-white rounded-lg shadow border p-6">
            <ReactECharts
              option={revenueBreakdownOption}
              style={{ height: '300px' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow border p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{index + 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{performer.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{performer.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${performer.revenue.toLocaleString()}</p>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-1">{performer.orders} orders</span>
                    {performer.growthRate >= 0 ? (
                      <ArrowTrendingUpIcon className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ml-1 ${performer.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {performer.growthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Sales Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Detailed Sales Data</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AOV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refunds
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salesData.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(data.period).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${data.totalRevenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.totalOrders.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${data.averageOrderValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${data.commission.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      ${data.refunds.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${data.netRevenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {data.growthRate >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={data.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {data.growthRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Revenue Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Gross Revenue:</span>
                <span className="font-medium">${totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Commission:</span>
                <span className="text-red-600">-${totalCommission.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Refunds:</span>
                <span className="text-red-600">-${salesData.reduce((sum, d) => sum + d.refunds, 0).toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm font-medium">
                <span className="text-gray-900">Net Revenue:</span>
                <span className="text-green-600">${salesData.reduce((sum, d) => sum + d.netRevenue, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Performance Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Best Day:</span>
                <span className="font-medium">
                  {salesData.reduce((max, d) => d.totalRevenue > max.totalRevenue ? d : max, salesData[0])?.period
                    ? new Date(salesData.reduce((max, d) => d.totalRevenue > max.totalRevenue ? d : max, salesData[0]).period).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Peak Revenue:</span>
                <span className="font-medium text-green-600">
                  ${Math.max(...salesData.map(d => d.totalRevenue)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Peak Orders:</span>
                <span className="font-medium text-blue-600">
                  {Math.max(...salesData.map(d => d.totalOrders)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Growth:</span>
                <span className={`font-medium ${averageGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {averageGrowthRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-3">
              <button className="w-full bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 text-sm">
                Generate Monthly Report
              </button>
              <button className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 text-sm">
                Compare with Last Period
              </button>
              <button className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 text-sm">
                Schedule Automated Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

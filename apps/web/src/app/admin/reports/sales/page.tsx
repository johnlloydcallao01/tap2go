'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,

  CurrencyDollarIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,

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

export default function AdminSalesReports() {
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
            totalRevenue: 45670.50,
            totalOrders: 892,
            averageOrderValue: 51.20,
            commission: 6850.58,
            refunds: 1234.75,
            netRevenue: 44435.75,
            growthRate: 12.5,
          },
          {
            period: '2024-01-14',
            totalRevenue: 38920.25,
            totalOrders: 756,
            averageOrderValue: 51.50,
            commission: 5838.04,
            refunds: 890.50,
            netRevenue: 38029.75,
            growthRate: 8.3,
          },
          {
            period: '2024-01-13',
            totalRevenue: 42150.75,
            totalOrders: 823,
            averageOrderValue: 51.22,
            commission: 6322.61,
            refunds: 1050.25,
            netRevenue: 41100.50,
            growthRate: -2.1,
          },
          {
            period: '2024-01-12',
            totalRevenue: 39875.00,
            totalOrders: 789,
            averageOrderValue: 50.54,
            commission: 5981.25,
            refunds: 1200.00,
            netRevenue: 38675.00,
            growthRate: 15.7,
          },
          {
            period: '2024-01-11',
            totalRevenue: 48230.80,
            totalOrders: 945,
            averageOrderValue: 51.05,
            commission: 7234.62,
            refunds: 980.40,
            netRevenue: 47250.40,
            growthRate: 22.4,
          },
          {
            period: '2024-01-10',
            totalRevenue: 35670.25,
            totalOrders: 698,
            averageOrderValue: 51.12,
            commission: 5350.54,
            refunds: 1120.75,
            netRevenue: 34549.50,
            growthRate: -5.8,
          },
          {
            period: '2024-01-09',
            totalRevenue: 41890.50,
            totalOrders: 812,
            averageOrderValue: 51.59,
            commission: 6283.58,
            refunds: 1340.25,
            netRevenue: 40550.25,
            growthRate: 9.2,
          },
        ];

        const mockTopPerformers: TopPerformer[] = [
          {
            id: '1',
            name: 'Pizza Palace',
            type: 'restaurant',
            revenue: 28450.75,
            orders: 567,
            growthRate: 18.5,
          },
          {
            id: '2',
            name: 'Burger Barn',
            type: 'restaurant',
            revenue: 22340.50,
            orders: 445,
            growthRate: 12.3,
          },
          {
            id: '3',
            name: 'Italian Cuisine',
            type: 'category',
            revenue: 45670.25,
            orders: 892,
            growthRate: 15.7,
          },
          {
            id: '4',
            name: 'Margherita Pizza',
            type: 'item',
            revenue: 8920.00,
            orders: 234,
            growthRate: 25.4,
          },
          {
            id: '5',
            name: 'Sushi Zen',
            type: 'restaurant',
            revenue: 19875.25,
            orders: 378,
            growthRate: 8.9,
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

  const totalRevenue = salesData.reduce((sum, data) => sum + data.totalRevenue, 0);
  const totalOrders = salesData.reduce((sum, data) => sum + data.totalOrders, 0);
  const totalCommission = salesData.reduce((sum, data) => sum + data.commission, 0);
  const averageGrowthRate = salesData.length > 0 
    ? salesData.reduce((sum, data) => sum + data.growthRate, 0) / salesData.length 
    : 0;

  const exportData = () => {
    const csvContent = [
      ['Date', 'Revenue', 'Orders', 'AOV', 'Commission', 'Refunds', 'Net Revenue', 'Growth Rate'],
      ...salesData.map(data => [
        data.period,
        data.totalRevenue.toFixed(2),
        data.totalOrders.toString(),
        data.averageOrderValue.toFixed(2),
        data.commission.toFixed(2),
        data.refunds.toFixed(2),
        data.netRevenue.toFixed(2),
        `${data.growthRate.toFixed(1)}%`,
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

  if (loading) {
    return (
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
    );
  }

  return (
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

          {/* Simple Chart Representation */}
          <div className="space-y-3">
            {salesData.slice().reverse().map((data, index) => {
              const maxValue = Math.max(...salesData.map(d =>
                selectedMetric === 'revenue' ? d.totalRevenue :
                selectedMetric === 'orders' ? d.totalOrders :
                d.averageOrderValue
              ));
              const value = selectedMetric === 'revenue' ? data.totalRevenue :
                           selectedMetric === 'orders' ? data.totalOrders :
                           data.averageOrderValue;
              const percentage = (value / maxValue) * 100;

              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-16 text-xs text-gray-600">
                    {new Date(data.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                    <div
                      className="bg-orange-500 h-4 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-20 text-xs text-gray-900 text-right">
                    {selectedMetric === 'revenue' ? `$${value.toLocaleString()}` :
                     selectedMetric === 'orders' ? value.toLocaleString() :
                     `$${value.toFixed(2)}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow border p-6">
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
  );
}

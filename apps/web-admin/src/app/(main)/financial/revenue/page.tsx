'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface RevenueData {
  period: string;
  grossRevenue: number;
  netRevenue: number;
  commission: number;
  refunds: number;
  taxes: number;
  processingFees: number;
  orderCount: number;
  averageOrderValue: number;
  growthRate: number;
}

interface RevenueBySource {
  source: string;
  revenue: number;
  percentage: number;
  orders: number;
  growthRate: number;
}

interface RevenueByCategory {
  category: string;
  revenue: number;
  percentage: number;
  orders: number;
  averageOrderValue: number;
}

export default function AdminRevenueAnalytics() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [revenueBySource, setRevenueBySource] = useState<RevenueBySource[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<RevenueByCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    const loadRevenueData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockRevenueData: RevenueData[] = [
          {
            period: '2024-01-15',
            grossRevenue: 125670.50,
            netRevenue: 118420.75,
            commission: 18850.58,
            refunds: 3240.75,
            taxes: 12567.05,
            processingFees: 2514.34,
            orderCount: 2456,
            averageOrderValue: 51.20,
            growthRate: 12.5,
          },
          {
            period: '2024-01-14',
            grossRevenue: 118920.25,
            netRevenue: 112030.45,
            commission: 17838.04,
            refunds: 2890.50,
            taxes: 11892.03,
            processingFees: 2378.41,
            orderCount: 2298,
            averageOrderValue: 51.75,
            growthRate: 8.3,
          },
          {
            period: '2024-01-13',
            grossRevenue: 132150.75,
            netRevenue: 124542.21,
            commission: 19822.61,
            refunds: 4050.25,
            taxes: 13215.08,
            processingFees: 2643.02,
            orderCount: 2587,
            averageOrderValue: 51.10,
            growthRate: -2.1,
          },
          {
            period: '2024-01-12',
            grossRevenue: 109875.00,
            netRevenue: 103581.25,
            commission: 16481.25,
            refunds: 2200.00,
            taxes: 10987.50,
            processingFees: 2197.50,
            orderCount: 2145,
            averageOrderValue: 51.22,
            growthRate: 15.7,
          },
          {
            period: '2024-01-11',
            grossRevenue: 148230.80,
            netRevenue: 139617.26,
            commission: 22234.62,
            refunds: 2980.40,
            taxes: 14823.08,
            processingFees: 2964.62,
            orderCount: 2901,
            averageOrderValue: 51.09,
            growthRate: 22.4,
          },
        ];

        const mockRevenueBySource: RevenueBySource[] = [
          {
            source: 'Mobile App',
            revenue: 456780.25,
            percentage: 68.5,
            orders: 8945,
            growthRate: 15.2,
          },
          {
            source: 'Website',
            revenue: 189340.50,
            percentage: 28.4,
            orders: 3678,
            growthRate: 8.7,
          },
          {
            source: 'Partner APIs',
            revenue: 20670.75,
            percentage: 3.1,
            orders: 412,
            growthRate: -2.3,
          },
        ];

        const mockRevenueByCategory: RevenueByCategory[] = [
          {
            category: 'Italian',
            revenue: 189450.75,
            percentage: 28.4,
            orders: 3789,
            averageOrderValue: 50.01,
          },
          {
            category: 'Asian',
            revenue: 156780.25,
            percentage: 23.5,
            orders: 3124,
            averageOrderValue: 50.19,
          },
          {
            category: 'American',
            revenue: 134560.50,
            percentage: 20.2,
            orders: 2691,
            averageOrderValue: 50.00,
          },
          {
            category: 'Mexican',
            revenue: 98340.75,
            percentage: 14.8,
            orders: 1967,
            averageOrderValue: 50.02,
          },
          {
            category: 'Mediterranean',
            revenue: 87659.25,
            percentage: 13.1,
            orders: 1752,
            averageOrderValue: 50.03,
          },
        ];

        setRevenueData(mockRevenueData);
        setRevenueBySource(mockRevenueBySource);
        setRevenueByCategory(mockRevenueByCategory);
      } catch (error) {
        console.error('Error loading revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRevenueData();
  }, [dateRange]);

  const totalGrossRevenue = revenueData.reduce((sum, data) => sum + data.grossRevenue, 0);
  const totalNetRevenue = revenueData.reduce((sum, data) => sum + data.netRevenue, 0);
  const totalCommission = revenueData.reduce((sum, data) => sum + data.commission, 0);
  const totalOrders = revenueData.reduce((sum, data) => sum + data.orderCount, 0);
  const averageOrderValue = totalOrders > 0 ? totalGrossRevenue / totalOrders : 0;
  const averageGrowthRate = revenueData.length > 0 
    ? revenueData.reduce((sum, data) => sum + data.growthRate, 0) / revenueData.length 
    : 0;

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
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Revenue Analytics</h1>
            <p className="text-sm lg:text-base text-gray-600">Comprehensive revenue analysis and financial insights.</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
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
                <p className="text-sm font-medium text-gray-600">Gross Revenue</p>
                <p className="text-lg font-semibold text-gray-900">${totalGrossRevenue.toLocaleString()}</p>
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
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Net Revenue</p>
                <p className="text-lg font-semibold text-gray-900">${totalNetRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500">After fees & taxes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BuildingStorefrontIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Commission</p>
                <p className="text-lg font-semibold text-gray-900">${totalCommission.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Platform earnings</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-lg font-semibold text-gray-900">${averageOrderValue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{totalOrders} orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue by Source */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Source</h3>
            <div className="space-y-4">
              {revenueBySource.map((source, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{source.source}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">{source.percentage}%</span>
                      <div className="flex items-center">
                        {source.growthRate >= 0 ? (
                          <ArrowTrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs ${source.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {source.growthRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    <div>
                      <span className="block font-medium">${source.revenue.toLocaleString()}</span>
                      <span>Revenue</span>
                    </div>
                    <div>
                      <span className="block font-medium">{source.orders.toLocaleString()}</span>
                      <span>Orders</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Category */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Category</h3>
            <div className="space-y-4">
              {revenueByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{category.category}</span>
                      <span className="text-sm font-semibold text-gray-900">{category.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="block font-medium">${category.revenue.toLocaleString()}</span>
                        <span>Revenue</span>
                      </div>
                      <div>
                        <span className="block font-medium">{category.orders}</span>
                        <span>Orders</span>
                      </div>
                      <div>
                        <span className="block font-medium">${category.averageOrderValue.toFixed(2)}</span>
                        <span>AOV</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Revenue Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Daily Revenue Breakdown</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AOV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refunds
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueData.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(data.period).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${data.grossRevenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      ${data.netRevenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      ${data.commission.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.orderCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${data.averageOrderValue.toFixed(2)}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      ${data.refunds.toLocaleString()}
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
            <h4 className="text-md font-medium text-gray-900 mb-3">Revenue Insights</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Best Day:</span>
                <span className="font-medium">
                  {revenueData.reduce((max, d) => d.grossRevenue > max.grossRevenue ? d : max, revenueData[0])?.period
                    ? new Date(revenueData.reduce((max, d) => d.grossRevenue > max.grossRevenue ? d : max, revenueData[0]).period).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Refunds:</span>
                <span className="font-medium text-red-600">
                  ${revenueData.reduce((sum, d) => sum + d.refunds, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing Fees:</span>
                <span className="font-medium">
                  ${revenueData.reduce((sum, d) => sum + d.processingFees, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Performance Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Revenue Growth:</span>
                <span className={`font-medium ${averageGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {averageGrowthRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Commission Rate:</span>
                <span className="font-medium">
                  {totalGrossRevenue > 0 ? ((totalCommission / totalGrossRevenue) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Refund Rate:</span>
                <span className="font-medium">
                  {totalGrossRevenue > 0 ? ((revenueData.reduce((sum, d) => sum + d.refunds, 0) / totalGrossRevenue) * 100).toFixed(2) : '0'}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-3">
              <button className="w-full bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 text-sm">
                Generate Revenue Report
              </button>
              <button className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 text-sm">
                Analyze Trends
              </button>
              <button className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 text-sm">
                Export Financial Data
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

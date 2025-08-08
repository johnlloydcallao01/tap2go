'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import ReactECharts from 'echarts-for-react';
import {
  UserGroupIcon,
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserPlusIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface UserMetrics {
  period: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  churnedUsers: number;
  retentionRate: number;
  averageSessionDuration: number;
  averageOrdersPerUser: number;
  averageSpendPerUser: number;
}

interface UserSegment {
  id: string;
  name: string;
  userCount: number;
  percentage: number;
  averageSpend: number;
  retentionRate: number;
  growthRate: number;
}

interface UserDemographic {
  category: string;
  segments: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

export default function UserReports() {
  const [userMetrics, setUserMetrics] = useState<UserMetrics[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [demographics, setDemographics] = useState<UserDemographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUserMetrics: UserMetrics[] = [
          {
            period: '2024-01-15',
            totalUsers: 15420,
            newUsers: 234,
            activeUsers: 8920,
            churnedUsers: 45,
            retentionRate: 87.5,
            averageSessionDuration: 12.5,
            averageOrdersPerUser: 2.3,
            averageSpendPerUser: 45.80,
          },
          {
            period: '2024-01-14',
            totalUsers: 15186,
            newUsers: 189,
            activeUsers: 8756,
            churnedUsers: 52,
            retentionRate: 86.8,
            averageSessionDuration: 11.8,
            averageOrdersPerUser: 2.1,
            averageSpendPerUser: 43.20,
          },
          {
            period: '2024-01-13',
            totalUsers: 14997,
            newUsers: 267,
            activeUsers: 8634,
            churnedUsers: 38,
            retentionRate: 88.2,
            averageSessionDuration: 13.2,
            averageOrdersPerUser: 2.4,
            averageSpendPerUser: 47.90,
          },
          {
            period: '2024-01-12',
            totalUsers: 14730,
            newUsers: 198,
            activeUsers: 8445,
            churnedUsers: 61,
            retentionRate: 85.9,
            averageSessionDuration: 10.9,
            averageOrdersPerUser: 2.0,
            averageSpendPerUser: 41.50,
          },
          {
            period: '2024-01-11',
            totalUsers: 14532,
            newUsers: 312,
            activeUsers: 8789,
            churnedUsers: 29,
            retentionRate: 89.1,
            averageSessionDuration: 14.1,
            averageOrdersPerUser: 2.6,
            averageSpendPerUser: 52.30,
          },
        ];

        const mockUserSegments: UserSegment[] = [
          {
            id: '1',
            name: 'New Users (0-30 days)',
            userCount: 2340,
            percentage: 15.2,
            averageSpend: 28.50,
            retentionRate: 45.8,
            growthRate: 12.5,
          },
          {
            id: '2',
            name: 'Regular Users (31-90 days)',
            userCount: 4680,
            percentage: 30.4,
            averageSpend: 52.30,
            retentionRate: 78.2,
            growthRate: 8.7,
          },
          {
            id: '3',
            name: 'Loyal Users (91-365 days)',
            userCount: 5850,
            percentage: 38.0,
            averageSpend: 68.90,
            retentionRate: 89.5,
            growthRate: 5.2,
          },
          {
            id: '4',
            name: 'VIP Users (365+ days)',
            userCount: 2550,
            percentage: 16.5,
            averageSpend: 125.80,
            retentionRate: 95.3,
            growthRate: 3.1,
          },
        ];

        const mockDemographics: UserDemographic[] = [
          {
            category: 'Age Groups',
            segments: [
              { name: '18-24', count: 3084, percentage: 20.0 },
              { name: '25-34', count: 5568, percentage: 36.1 },
              { name: '35-44', count: 4326, percentage: 28.1 },
              { name: '45-54', count: 1851, percentage: 12.0 },
              { name: '55+', count: 591, percentage: 3.8 },
            ],
          },
          {
            category: 'Device Types',
            segments: [
              { name: 'Mobile', count: 10794, percentage: 70.0 },
              { name: 'Desktop', count: 3084, percentage: 20.0 },
              { name: 'Tablet', count: 1542, percentage: 10.0 },
            ],
          },
          {
            category: 'Order Frequency',
            segments: [
              { name: 'Daily', count: 771, percentage: 5.0 },
              { name: 'Weekly', count: 4626, percentage: 30.0 },
              { name: 'Monthly', count: 6168, percentage: 40.0 },
              { name: 'Occasional', count: 3855, percentage: 25.0 },
            ],
          },
        ];

        setUserMetrics(mockUserMetrics);
        setUserSegments(mockUserSegments);
        setDemographics(mockDemographics);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [dateRange]);

  // Calculate totals and averages
  const totalUsers = userMetrics.length > 0 ? userMetrics[0].totalUsers : 0;
  const totalNewUsers = userMetrics.reduce((sum, d) => sum + d.newUsers, 0);
  const averageRetention = userMetrics.length > 0 
    ? userMetrics.reduce((sum, d) => sum + d.retentionRate, 0) / userMetrics.length 
    : 0;
  const averageSpend = userMetrics.length > 0 
    ? userMetrics.reduce((sum, d) => sum + d.averageSpendPerUser, 0) / userMetrics.length 
    : 0;

  // Calculate growth rates
  const userGrowth = userMetrics.length >= 2 
    ? ((userMetrics[0].totalUsers - userMetrics[1].totalUsers) / userMetrics[1].totalUsers) * 100 
    : 0;
  const newUserGrowth = userMetrics.length >= 2 
    ? ((userMetrics[0].newUsers - userMetrics[1].newUsers) / userMetrics[1].newUsers) * 100 
    : 0;

  // Export data function
  const exportData = () => {
    const csvContent = [
      ['Date', 'Total Users', 'New Users', 'Active Users', 'Churned Users', 'Retention Rate', 'Avg Session Duration', 'Avg Orders/User', 'Avg Spend/User'],
      ...userMetrics.map(d => [
        d.period,
        d.totalUsers,
        d.newUsers,
        d.activeUsers,
        d.churnedUsers,
        d.retentionRate,
        d.averageSessionDuration,
        d.averageOrdersPerUser,
        d.averageSpendPerUser,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-report-${dateRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ECharts options for user growth trend
  const userGrowthChartOption = {
    title: {
      text: 'User Growth Trend',
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#374151',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const paramsArray = params as Array<{ name: string; seriesName: string; value: number }>;
        const date = paramsArray[0].name;
        let result = `${date}<br/>`;
        paramsArray.forEach((param) => {
          result += `${param.seriesName}: ${param.value.toLocaleString()}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ['Total Users', 'New Users', 'Active Users'],
      bottom: 0,
      textStyle: {
        color: '#6B7280',
      },
    },
    xAxis: {
      type: 'category',
      data: userMetrics.slice().reverse().map(d => 
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
        formatter: (value: number) => `${(value / 1000).toFixed(0)}K`,
      },
      splitLine: {
        lineStyle: {
          color: '#F3F4F6',
        },
      },
    },
    series: [
      {
        name: 'Total Users',
        type: 'line',
        data: userMetrics.slice().reverse().map(d => d.totalUsers),
        lineStyle: {
          color: '#3B82F6',
          width: 3,
        },
        itemStyle: {
          color: '#3B82F6',
        },
        smooth: true,
      },
      {
        name: 'New Users',
        type: 'bar',
        data: userMetrics.slice().reverse().map(d => d.newUsers),
        itemStyle: {
          color: '#10B981',
        },
        barWidth: '30%',
      },
      {
        name: 'Active Users',
        type: 'line',
        data: userMetrics.slice().reverse().map(d => d.activeUsers),
        lineStyle: {
          color: '#F59E0B',
          width: 3,
        },
        itemStyle: {
          color: '#F59E0B',
        },
        smooth: true,
      },
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
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
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">User Reports</h1>
            <p className="text-sm lg:text-base text-gray-600">Customer analytics, retention, and user behavior insights.</p>
          </div>
          <div className="flex items-center space-x-2">
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-lg font-semibold text-gray-900">{totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {userGrowth >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {userGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlusIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">New Users</p>
                <p className="text-lg font-semibold text-gray-900">{totalNewUsers.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  {newUserGrowth >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${newUserGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {newUserGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                <p className="text-lg font-semibold text-gray-900">{averageRetention.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Average</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Spend/User</p>
                <p className="text-lg font-semibold text-gray-900">${averageSpend.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Per user</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow border p-6 mb-6">
          <ReactECharts
            option={userGrowthChartOption}
            style={{ height: '400px' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>

        {/* User Segments and Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Segments */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Segments</h3>
            <div className="space-y-4">
              {userSegments.map((segment) => (
                <div key={segment.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{segment.name}</h4>
                    <span className="text-sm font-semibold text-orange-600">{segment.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${segment.percentage}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                    <div>
                      <span className="block font-medium">{segment.userCount.toLocaleString()}</span>
                      <span>Users</span>
                    </div>
                    <div>
                      <span className="block font-medium">${segment.averageSpend}</span>
                      <span>Avg Spend</span>
                    </div>
                    <div>
                      <span className="block font-medium">{segment.retentionRate}%</span>
                      <span>Retention</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demographics */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Demographics</h3>
            <div className="space-y-6">
              {demographics.map((demographic, index) => (
                <div key={index}>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">{demographic.category}</h4>
                  <div className="space-y-2">
                    {demographic.segments.map((segment, segIndex) => (
                      <div key={segIndex} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-sm text-gray-600 w-16">{segment.name}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${segment.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <span className="text-sm font-medium text-gray-900">{segment.count.toLocaleString()}</span>
                          <span className="text-xs text-gray-500 block">{segment.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed User Metrics Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Detailed User Metrics</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Retention Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Spend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Churned
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userMetrics.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(data.period).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {data.totalUsers.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {data.newUsers.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {data.activeUsers.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.retentionRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.averageSessionDuration.toFixed(1)}m
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${data.averageSpendPerUser.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {data.churnedUsers}
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
            <h4 className="text-md font-medium text-gray-900 mb-3">User Engagement</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Session Duration:</span>
                <span className="font-medium">
                  {(userMetrics.reduce((sum, d) => sum + d.averageSessionDuration, 0) / userMetrics.length).toFixed(1)}m
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Orders per User:</span>
                <span className="font-medium">
                  {(userMetrics.reduce((sum, d) => sum + d.averageOrdersPerUser, 0) / userMetrics.length).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Best Retention Day:</span>
                <span className="font-medium">
                  {userMetrics.reduce((max, d) => d.retentionRate > max.retentionRate ? d : max, userMetrics[0])?.period
                    ? new Date(userMetrics.reduce((max, d) => d.retentionRate > max.retentionRate ? d : max, userMetrics[0]).period).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Growth Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">User Growth Rate:</span>
                <span className={`font-medium ${userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {userGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New User Growth:</span>
                <span className={`font-medium ${newUserGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {newUserGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Churned:</span>
                <span className="font-medium text-red-600">
                  {userMetrics.reduce((sum, d) => sum + d.churnedUsers, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-3">
              <button className="w-full bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 text-sm">
                Generate Retention Report
              </button>
              <button className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 text-sm">
                Analyze User Segments
              </button>
              <button className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 text-sm">
                Export User Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
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

export default function AdminUserReports() {
  const [userMetrics, setUserMetrics] = useState<UserMetrics[]>([]);
  const [userSegments, setUserSegments] = useState<UserSegment[]>([]);
  const [demographics, setDemographics] = useState<UserDemographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  // Removed unused variables: selectedView, setSelectedView

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

  const latestMetrics = userMetrics[0] || {
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    churnedUsers: 0,
    retentionRate: 0,
    averageSessionDuration: 0,
    averageOrdersPerUser: 0,
    averageSpendPerUser: 0,
  };

  const totalNewUsers = userMetrics.reduce((sum, m) => sum + m.newUsers, 0);
  const totalChurnedUsers = userMetrics.reduce((sum, m) => sum + m.churnedUsers, 0);
  const averageRetention = userMetrics.length > 0 
    ? userMetrics.reduce((sum, m) => sum + m.retentionRate, 0) / userMetrics.length 
    : 0;

  const exportData = () => {
    const csvContent = [
      ['Date', 'Total Users', 'New Users', 'Active Users', 'Churned Users', 'Retention Rate', 'Avg Session', 'Avg Orders/User', 'Avg Spend/User'],
      ...userMetrics.map(metric => [
        metric.period,
        metric.totalUsers.toString(),
        metric.newUsers.toString(),
        metric.activeUsers.toString(),
        metric.churnedUsers.toString(),
        `${metric.retentionRate.toFixed(1)}%`,
        `${metric.averageSessionDuration.toFixed(1)} min`,
        metric.averageOrdersPerUser.toFixed(1),
        `$${metric.averageSpendPerUser.toFixed(2)}`,
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">User Reports</h1>
          <p className="text-sm lg:text-base text-gray-600">Comprehensive user analytics and behavior insights.</p>
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
              <p className="text-lg font-semibold text-gray-900">{latestMetrics.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {latestMetrics.activeUsers.toLocaleString()} active
              </p>
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
              <p className="text-xs text-gray-500">
                {userMetrics.length > 0 ? (totalNewUsers / userMetrics.length).toFixed(0) : 0}/day avg
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
              <p className="text-sm font-medium text-gray-600">Retention Rate</p>
              <p className="text-lg font-semibold text-gray-900">{averageRetention.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">30-day average</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Spend/User</p>
              <p className="text-lg font-semibold text-gray-900">${latestMetrics.averageSpendPerUser.toFixed(2)}</p>
              <p className="text-xs text-gray-500">
                {latestMetrics.averageOrdersPerUser.toFixed(1)} orders avg
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Segments</h3>
          <div className="space-y-4">
            {userSegments.map((segment) => (
              <div key={segment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{segment.name}</h4>
                  <div className="flex items-center">
                    {segment.growthRate >= 0 ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${segment.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {segment.growthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Users</p>
                    <p className="font-medium">{segment.userCount.toLocaleString()} ({segment.percentage.toFixed(1)}%)</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Spend</p>
                    <p className="font-medium">${segment.averageSpend.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Retention</p>
                    <p className="font-medium">{segment.retentionRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Share</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${segment.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                        <span className="text-sm text-gray-700 w-16">{segment.name}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${segment.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-sm font-medium text-gray-900">{segment.count.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{segment.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Metrics Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">User Metrics Over Time</h3>
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
                  Orders/User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spend/User
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userMetrics.map((metric, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(metric.period).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {metric.totalUsers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    +{metric.newUsers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {metric.activeUsers.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      metric.retentionRate >= 85 ? 'text-green-600' :
                      metric.retentionRate >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {metric.retentionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {metric.averageSessionDuration.toFixed(1)} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {metric.averageOrdersPerUser.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${metric.averageSpendPerUser.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">User Growth</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">New Users (Period):</span>
              <span className="font-medium text-green-600">+{totalNewUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Churned Users:</span>
              <span className="font-medium text-red-600">-{totalChurnedUsers.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-medium">
              <span className="text-gray-900">Net Growth:</span>
              <span className={totalNewUsers - totalChurnedUsers >= 0 ? 'text-green-600' : 'text-red-600'}>
                {totalNewUsers - totalChurnedUsers >= 0 ? '+' : ''}{(totalNewUsers - totalChurnedUsers).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Engagement Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Users:</span>
              <span className="font-medium">{latestMetrics.activeUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Activity Rate:</span>
              <span className="font-medium">
                {latestMetrics.totalUsers > 0 ? ((latestMetrics.activeUsers / latestMetrics.totalUsers) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Session:</span>
              <span className="font-medium">{latestMetrics.averageSessionDuration.toFixed(1)} min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Orders per User:</span>
              <span className="font-medium">{latestMetrics.averageOrdersPerUser.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-3">
            <button className="w-full bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 text-sm">
              Create User Segment
            </button>
            <button className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 text-sm">
              Launch Retention Campaign
            </button>
            <button className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 text-sm">
              Export User Cohorts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

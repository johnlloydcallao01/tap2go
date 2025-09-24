'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface ReportCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  reportCount: number;
  lastGenerated?: string;
  href: string;
}

interface RecentReport {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  generatedBy: string;
  size: string;
  downloads: number;
}

interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function ReportsOverview() {
  const [reportCategories, setReportCategories] = useState<ReportCategory[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportsData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockReportCategories: ReportCategory[] = [
          {
            id: 'sales',
            name: 'Sales Reports',
            description: 'Revenue, orders, and sales performance analytics',
            icon: CurrencyDollarIcon,
            color: 'bg-green-100 text-green-600',
            reportCount: 12,
            lastGenerated: '2024-01-15T09:00:00Z',
            href: '/reports/sales',
          },
          {
            id: 'users',
            name: 'User Reports',
            description: 'Customer analytics, retention, and user behavior',
            icon: UserGroupIcon,
            color: 'bg-blue-100 text-blue-600',
            reportCount: 8,
            lastGenerated: '2024-01-15T08:30:00Z',
            href: '/reports/users',
          },
          {
            id: 'performance',
            name: 'Performance Reports',
            description: 'System performance, uptime, and operational metrics',
            icon: CpuChipIcon,
            color: 'bg-purple-100 text-purple-600',
            reportCount: 6,
            lastGenerated: '2024-01-15T10:15:00Z',
            href: '/reports/performance',
          },
          {
            id: 'custom',
            name: 'Custom Reports',
            description: 'Build and schedule custom reports for specific needs',
            icon: DocumentTextIcon,
            color: 'bg-orange-100 text-orange-600',
            reportCount: 15,
            lastGenerated: '2024-01-15T07:45:00Z',
            href: '/reports/custom',
          },
        ];

        const mockRecentReports: RecentReport[] = [
          {
            id: '1',
            name: 'Weekly Sales Summary',
            type: 'Sales Report',
            generatedAt: '2024-01-15T09:00:00Z',
            generatedBy: 'John Smith',
            size: '2.4 MB',
            downloads: 12,
          },
          {
            id: '2',
            name: 'Customer Retention Analysis',
            type: 'User Report',
            generatedAt: '2024-01-15T08:30:00Z',
            generatedBy: 'Lisa Wilson',
            size: '1.8 MB',
            downloads: 8,
          },
          {
            id: '3',
            name: 'System Performance Dashboard',
            type: 'Performance Report',
            generatedAt: '2024-01-15T10:15:00Z',
            generatedBy: 'David Brown',
            size: '3.2 MB',
            downloads: 15,
          },
          {
            id: '4',
            name: 'Marketing Campaign ROI',
            type: 'Custom Report',
            generatedAt: '2024-01-15T07:45:00Z',
            generatedBy: 'Emily Rodriguez',
            size: '1.5 MB',
            downloads: 6,
          },
          {
            id: '5',
            name: 'Monthly Financial Overview',
            type: 'Sales Report',
            generatedAt: '2024-01-14T16:30:00Z',
            generatedBy: 'Mike Chen',
            size: '4.1 MB',
            downloads: 23,
          },
        ];

        const mockQuickStats: QuickStat[] = [
          {
            label: 'Reports Generated',
            value: '156',
            change: '+12%',
            trend: 'up',
            icon: DocumentChartBarIcon,
            color: 'text-blue-600',
          },
          {
            label: 'Total Downloads',
            value: '2,340',
            change: '+8%',
            trend: 'up',
            icon: ArrowDownTrayIcon,
            color: 'text-green-600',
          },
          {
            label: 'Active Schedules',
            value: '24',
            change: '+3',
            trend: 'up',
            icon: CalendarIcon,
            color: 'text-purple-600',
          },
          {
            label: 'Avg Generation Time',
            value: '2.3s',
            change: '-0.5s',
            trend: 'down',
            icon: ClockIcon,
            color: 'text-orange-600',
          },
        ];

        setReportCategories(mockReportCategories);
        setRecentReports(mockRecentReports);
        setQuickStats(mockQuickStats);
      } catch (error) {
        console.error('Error loading reports data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReportsData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm lg:text-base text-gray-600">Generate, schedule, and manage comprehensive business reports.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/reports/custom"
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
            >
              <DocumentChartBarIcon className="h-4 w-4 mr-2" />
              Create Custom Report
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                    <p className={`text-xs ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {reportCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link key={category.id} href={category.href}>
                <div className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{category.reportCount} reports</span>
                    {category.lastGenerated && (
                      <span className="text-gray-500">
                        Last: {new Date(category.lastGenerated).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
              <Link href="/reports/custom" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                View All Reports
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Downloads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.generatedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.downloads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-orange-600 hover:text-orange-900">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}

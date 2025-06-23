'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {

  ArrowDownTrayIcon,
  ClockIcon,

  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

interface PerformanceMetrics {
  period: string;
  orderFulfillmentRate: number;
  averageDeliveryTime: number;
  customerSatisfactionScore: number;
  restaurantResponseTime: number;
  driverUtilizationRate: number;
  systemUptime: number;
  apiResponseTime: number;
  errorRate: number;
  peakOrdersPerHour: number;
}

interface SystemHealth {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastIncident?: string;
}

interface KPITarget {
  metric: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export default function AdminPerformanceReports() {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [kpiTargets, setKpiTargets] = useState<KPITarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('24h');
  // Removed unused variables: selectedView, setSelectedView

  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockPerformanceData: PerformanceMetrics[] = [
          {
            period: '2024-01-15T14:00:00Z',
            orderFulfillmentRate: 96.8,
            averageDeliveryTime: 28.5,
            customerSatisfactionScore: 4.6,
            restaurantResponseTime: 3.2,
            driverUtilizationRate: 78.5,
            systemUptime: 99.9,
            apiResponseTime: 145,
            errorRate: 0.12,
            peakOrdersPerHour: 1250,
          },
          {
            period: '2024-01-15T13:00:00Z',
            orderFulfillmentRate: 97.2,
            averageDeliveryTime: 26.8,
            customerSatisfactionScore: 4.7,
            restaurantResponseTime: 2.9,
            driverUtilizationRate: 82.1,
            systemUptime: 99.9,
            apiResponseTime: 138,
            errorRate: 0.08,
            peakOrdersPerHour: 1180,
          },
          {
            period: '2024-01-15T12:00:00Z',
            orderFulfillmentRate: 95.5,
            averageDeliveryTime: 31.2,
            customerSatisfactionScore: 4.5,
            restaurantResponseTime: 4.1,
            driverUtilizationRate: 85.3,
            systemUptime: 99.8,
            apiResponseTime: 162,
            errorRate: 0.15,
            peakOrdersPerHour: 1420,
          },
          {
            period: '2024-01-15T11:00:00Z',
            orderFulfillmentRate: 98.1,
            averageDeliveryTime: 25.4,
            customerSatisfactionScore: 4.8,
            restaurantResponseTime: 2.7,
            driverUtilizationRate: 79.8,
            systemUptime: 99.9,
            apiResponseTime: 132,
            errorRate: 0.06,
            peakOrdersPerHour: 980,
          },
        ];

        const mockSystemHealth: SystemHealth[] = [
          {
            component: 'Order Processing API',
            status: 'healthy',
            uptime: 99.95,
            responseTime: 145,
            errorRate: 0.12,
          },
          {
            component: 'Payment Gateway',
            status: 'healthy',
            uptime: 99.98,
            responseTime: 89,
            errorRate: 0.03,
          },
          {
            component: 'Driver Tracking System',
            status: 'warning',
            uptime: 99.2,
            responseTime: 234,
            errorRate: 0.45,
            lastIncident: '2024-01-14T08:30:00Z',
          },
          {
            component: 'Restaurant Portal',
            status: 'healthy',
            uptime: 99.87,
            responseTime: 178,
            errorRate: 0.08,
          },
          {
            component: 'Customer Mobile App',
            status: 'healthy',
            uptime: 99.92,
            responseTime: 156,
            errorRate: 0.15,
          },
          {
            component: 'Database Cluster',
            status: 'critical',
            uptime: 98.5,
            responseTime: 456,
            errorRate: 1.2,
            lastIncident: '2024-01-15T02:15:00Z',
          },
        ];

        const mockKpiTargets: KPITarget[] = [
          {
            metric: 'Order Fulfillment Rate',
            current: 96.8,
            target: 98.0,
            unit: '%',
            trend: 'down',
            status: 'warning',
          },
          {
            metric: 'Average Delivery Time',
            current: 28.5,
            target: 25.0,
            unit: 'min',
            trend: 'up',
            status: 'warning',
          },
          {
            metric: 'Customer Satisfaction',
            current: 4.6,
            target: 4.5,
            unit: '/5',
            trend: 'up',
            status: 'good',
          },
          {
            metric: 'System Uptime',
            current: 99.9,
            target: 99.9,
            unit: '%',
            trend: 'stable',
            status: 'good',
          },
          {
            metric: 'API Response Time',
            current: 145,
            target: 150,
            unit: 'ms',
            trend: 'down',
            status: 'good',
          },
          {
            metric: 'Error Rate',
            current: 0.12,
            target: 0.1,
            unit: '%',
            trend: 'up',
            status: 'warning',
          },
        ];

        setPerformanceData(mockPerformanceData);
        setSystemHealth(mockSystemHealth);
        setKpiTargets(mockKpiTargets);
      } catch (error) {
        console.error('Error loading performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPerformanceData();
  }, [dateRange]);

  const latestMetrics = performanceData[0] || {
    orderFulfillmentRate: 0,
    averageDeliveryTime: 0,
    customerSatisfactionScore: 0,
    systemUptime: 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'good':
        return CheckCircleIcon;
      case 'warning':
      case 'critical':
        return ExclamationTriangleIcon;
      default:
        return ClockIcon;
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Time', 'Fulfillment Rate', 'Delivery Time', 'Satisfaction', 'Response Time', 'Uptime', 'API Response', 'Error Rate'],
      ...performanceData.map(data => [
        new Date(data.period).toLocaleString(),
        `${data.orderFulfillmentRate.toFixed(1)}%`,
        `${data.averageDeliveryTime.toFixed(1)} min`,
        data.customerSatisfactionScore.toFixed(1),
        `${data.restaurantResponseTime.toFixed(1)} min`,
        `${data.systemUptime.toFixed(1)}%`,
        `${data.apiResponseTime} ms`,
        `${data.errorRate.toFixed(2)}%`,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${dateRange}.csv`;
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Performance Reports</h1>
          <p className="text-sm lg:text-base text-gray-600">System performance metrics and operational KPIs.</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
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

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Fulfillment Rate</p>
              <p className="text-lg font-semibold text-gray-900">{latestMetrics.orderFulfillmentRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Target: 98%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
              <p className="text-lg font-semibold text-gray-900">{latestMetrics.averageDeliveryTime.toFixed(1)} min</p>
              <p className="text-xs text-gray-500">Target: 25 min</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
              <p className="text-lg font-semibold text-gray-900">{latestMetrics.customerSatisfactionScore.toFixed(1)}/5</p>
              <p className="text-xs text-gray-500">Target: 4.5/5</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CpuChipIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-lg font-semibold text-gray-900">{latestMetrics.systemUptime.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Target: 99.9%</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Targets vs Actual */}
      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">KPI Performance vs Targets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiTargets.map((kpi, index) => {
            const StatusIcon = getStatusIcon(kpi.status);
            const isTargetMet = kpi.unit === 'min' || kpi.unit === 'ms' || kpi.unit === '%' && kpi.metric.includes('Error')
              ? kpi.current <= kpi.target
              : kpi.current >= kpi.target;

            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{kpi.metric}</h4>
                  <StatusIcon className={`h-5 w-5 ${kpi.status === 'good' ? 'text-green-500' : kpi.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current:</span>
                    <span className={`text-lg font-semibold ${isTargetMet ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.current.toFixed(kpi.unit === '%' ? 1 : kpi.unit === '/5' ? 1 : 0)}{kpi.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Target:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {kpi.target.toFixed(kpi.unit === '%' ? 1 : kpi.unit === '/5' ? 1 : 0)}{kpi.unit}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${isTargetMet ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{
                        width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%`
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full ${getStatusColor(kpi.status)}`}>
                      {kpi.status.toUpperCase()}
                    </span>
                    <div className="flex items-center">
                      {kpi.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
                      ) : kpi.trend === 'down' ? (
                        <ArrowTrendingDownIcon className="h-3 w-3 text-red-500 mr-1" />
                      ) : (
                        <div className="h-3 w-3 bg-gray-400 rounded-full mr-1"></div>
                      )}
                      <span className="text-gray-500">{kpi.trend}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Health Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Health Status</h3>
          <div className="space-y-4">
            {systemHealth.map((system, index) => {
              const StatusIcon = getStatusIcon(system.status);
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`h-5 w-5 ${
                      system.status === 'healthy' ? 'text-green-500' :
                      system.status === 'warning' ? 'text-yellow-500' :
                      'text-red-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{system.component}</p>
                      <p className="text-xs text-gray-500">
                        Uptime: {system.uptime.toFixed(2)}% | Response: {system.responseTime}ms
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(system.status)}`}>
                    {system.status.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trends</h3>
          <div className="space-y-4">
            {performanceData.slice(0, 4).map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(data.period).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.peakOrdersPerHour} orders/hour peak
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {data.orderFulfillmentRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.averageDeliveryTime.toFixed(1)}min avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Performance Table */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detailed Performance Metrics</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fulfillment Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Satisfaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver Utilization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  API Response
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peak Orders/Hr
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(data.period).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      data.orderFulfillmentRate >= 98 ? 'text-green-600' :
                      data.orderFulfillmentRate >= 95 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {data.orderFulfillmentRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      data.averageDeliveryTime <= 25 ? 'text-green-600' :
                      data.averageDeliveryTime <= 30 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {data.averageDeliveryTime.toFixed(1)} min
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      data.customerSatisfactionScore >= 4.5 ? 'text-green-600' :
                      data.customerSatisfactionScore >= 4.0 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {data.customerSatisfactionScore.toFixed(1)}/5
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {data.driverUtilizationRate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      data.apiResponseTime <= 150 ? 'text-green-600' :
                      data.apiResponseTime <= 200 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {data.apiResponseTime} ms
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      data.errorRate <= 0.1 ? 'text-green-600' :
                      data.errorRate <= 0.2 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {data.errorRate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {data.peakOrdersPerHour.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Critical Issues</h4>
          <div className="space-y-2">
            {systemHealth.filter(s => s.status === 'critical').map((system, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                <span className="text-red-600">{system.component}</span>
              </div>
            ))}
            {systemHealth.filter(s => s.status === 'critical').length === 0 && (
              <p className="text-sm text-green-600">No critical issues</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Performance Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Fulfillment:</span>
              <span className="font-medium">
                {performanceData.length > 0
                  ? (performanceData.reduce((sum, d) => sum + d.orderFulfillmentRate, 0) / performanceData.length).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Delivery:</span>
              <span className="font-medium">
                {performanceData.length > 0
                  ? (performanceData.reduce((sum, d) => sum + d.averageDeliveryTime, 0) / performanceData.length).toFixed(1)
                  : 0} min
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Avg Satisfaction:</span>
              <span className="font-medium">
                {performanceData.length > 0
                  ? (performanceData.reduce((sum, d) => sum + d.customerSatisfactionScore, 0) / performanceData.length).toFixed(1)
                  : 0}/5
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-3">
            <button className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 text-sm">
              View System Alerts
            </button>
            <button className="w-full bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 text-sm">
              Generate SLA Report
            </button>
            <button className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 text-sm">
              Schedule Health Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import ReactECharts from 'echarts-for-react';
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

export default function PerformanceReports() {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [kpiTargets, setKpiTargets] = useState<KPITarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('24h');

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

  // Calculate averages
  const averageFulfillmentRate = performanceData.length > 0 
    ? performanceData.reduce((sum, d) => sum + d.orderFulfillmentRate, 0) / performanceData.length 
    : 0;
  const averageDeliveryTime = performanceData.length > 0 
    ? performanceData.reduce((sum, d) => sum + d.averageDeliveryTime, 0) / performanceData.length 
    : 0;
  const averageSatisfactionScore = performanceData.length > 0 
    ? performanceData.reduce((sum, d) => sum + d.customerSatisfactionScore, 0) / performanceData.length 
    : 0;
  const averageUptime = performanceData.length > 0 
    ? performanceData.reduce((sum, d) => sum + d.systemUptime, 0) / performanceData.length 
    : 0;

  // Export data function
  const exportData = () => {
    const csvContent = [
      ['Time', 'Fulfillment Rate', 'Delivery Time', 'Satisfaction Score', 'Response Time', 'Driver Utilization', 'System Uptime', 'API Response Time', 'Error Rate'],
      ...performanceData.map(d => [
        d.period,
        d.orderFulfillmentRate,
        d.averageDeliveryTime,
        d.customerSatisfactionScore,
        d.restaurantResponseTime,
        d.driverUtilizationRate,
        d.systemUptime,
        d.apiResponseTime,
        d.errorRate,
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

  // ECharts options for performance metrics
  const performanceChartOption = {
    title: {
      text: 'Performance Metrics Over Time',
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
        const time = paramsArray[0].name;
        let result = `${time}<br/>`;
        paramsArray.forEach((param) => {
          result += `${param.seriesName}: ${param.value}${param.seriesName.includes('Rate') || param.seriesName.includes('Uptime') ? '%' : param.seriesName.includes('Time') ? 'min' : ''}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: ['Fulfillment Rate', 'Delivery Time', 'Satisfaction Score', 'System Uptime'],
      bottom: 0,
      textStyle: {
        color: '#6B7280',
      },
    },
    xAxis: {
      type: 'category',
      data: performanceData.slice().reverse().map(d => 
        new Date(d.period).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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
    yAxis: [
      {
        type: 'value',
        name: 'Percentage (%)',
        position: 'left',
        min: 90,
        max: 100,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#6B7280',
          formatter: (value: number) => `${value}%`,
        },
        splitLine: {
          lineStyle: {
            color: '#F3F4F6',
          },
        },
      },
      {
        type: 'value',
        name: 'Time (min) / Score',
        position: 'right',
        min: 0,
        max: 40,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#6B7280',
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: 'Fulfillment Rate',
        type: 'line',
        yAxisIndex: 0,
        data: performanceData.slice().reverse().map(d => d.orderFulfillmentRate),
        lineStyle: {
          color: '#10B981',
          width: 3,
        },
        itemStyle: {
          color: '#10B981',
        },
        smooth: true,
      },
      {
        name: 'System Uptime',
        type: 'line',
        yAxisIndex: 0,
        data: performanceData.slice().reverse().map(d => d.systemUptime),
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
        name: 'Delivery Time',
        type: 'bar',
        yAxisIndex: 1,
        data: performanceData.slice().reverse().map(d => d.averageDeliveryTime),
        itemStyle: {
          color: '#F59E0B',
        },
        barWidth: '30%',
      },
      {
        name: 'Satisfaction Score',
        type: 'line',
        yAxisIndex: 1,
        data: performanceData.slice().reverse().map(d => d.customerSatisfactionScore * 8), // Scale to fit
        lineStyle: {
          color: '#EF4444',
          width: 3,
        },
        itemStyle: {
          color: '#EF4444',
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
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Performance Reports</h1>
            <p className="text-sm lg:text-base text-gray-600">System performance, uptime, and operational metrics.</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="1h">Last hour</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
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
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Fulfillment Rate</p>
                <p className="text-lg font-semibold text-gray-900">{averageFulfillmentRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Average</p>
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
                <p className="text-lg font-semibold text-gray-900">{averageDeliveryTime.toFixed(1)}m</p>
                <p className="text-xs text-gray-500">Minutes</p>
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
                <p className="text-lg font-semibold text-gray-900">{averageSatisfactionScore.toFixed(1)}/5</p>
                <p className="text-xs text-gray-500">Customer rating</p>
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
                <p className="text-lg font-semibold text-gray-900">{averageUptime.toFixed(2)}%</p>
                <p className="text-xs text-gray-500">Availability</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow border p-6 mb-6">
          <ReactECharts
            option={performanceChartOption}
            style={{ height: '400px' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>

        {/* System Health and KPI Targets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* System Health */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              {systemHealth.map((system, index) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'healthy': return 'text-green-600 bg-green-100';
                    case 'warning': return 'text-yellow-600 bg-yellow-100';
                    case 'critical': return 'text-red-600 bg-red-100';
                    default: return 'text-gray-600 bg-gray-100';
                  }
                };

                const getStatusIcon = (status: string) => {
                  switch (status) {
                    case 'healthy': return CheckCircleIcon;
                    case 'warning': return ExclamationTriangleIcon;
                    case 'critical': return ExclamationTriangleIcon;
                    default: return CheckCircleIcon;
                  }
                };

                const StatusIcon = getStatusIcon(system.status);

                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{system.component}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(system.status)}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                      <div>
                        <span className="block font-medium">{system.uptime}%</span>
                        <span>Uptime</span>
                      </div>
                      <div>
                        <span className="block font-medium">{system.responseTime}ms</span>
                        <span>Response Time</span>
                      </div>
                      <div>
                        <span className="block font-medium">{system.errorRate}%</span>
                        <span>Error Rate</span>
                      </div>
                    </div>
                    {system.lastIncident && (
                      <div className="mt-2 text-xs text-red-600">
                        Last incident: {new Date(system.lastIncident).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* KPI Targets */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">KPI Targets</h3>
            <div className="space-y-4">
              {kpiTargets.map((kpi, index) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'good': return 'text-green-600';
                    case 'warning': return 'text-yellow-600';
                    case 'critical': return 'text-red-600';
                    default: return 'text-gray-600';
                  }
                };

                const getTrendIcon = (trend: string) => {
                  switch (trend) {
                    case 'up': return ArrowTrendingUpIcon;
                    case 'down': return ArrowTrendingDownIcon;
                    default: return ClockIcon;
                  }
                };

                const TrendIcon = getTrendIcon(kpi.trend);
                const progress = (kpi.current / kpi.target) * 100;

                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{kpi.metric}</h4>
                      <div className="flex items-center space-x-1">
                        <TrendIcon className={`h-3 w-3 ${getStatusColor(kpi.status)}`} />
                        <span className={`text-xs font-medium ${getStatusColor(kpi.status)}`}>
                          {kpi.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {kpi.current}{kpi.unit} / {kpi.target}{kpi.unit}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          kpi.status === 'good' ? 'bg-green-500' :
                          kpi.status === 'warning' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Performance Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Detailed Performance Data</h3>
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
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Utilization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System Uptime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceData.map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(data.period).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {data.orderFulfillmentRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.averageDeliveryTime.toFixed(1)}m
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.customerSatisfactionScore.toFixed(1)}/5
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.restaurantResponseTime.toFixed(1)}m
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {data.driverUtilizationRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {data.systemUptime.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {data.errorRate.toFixed(2)}%
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
            <h4 className="text-md font-medium text-gray-900 mb-3">Performance Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Best Fulfillment Rate:</span>
                <span className="font-medium text-green-600">
                  {Math.max(...performanceData.map(d => d.orderFulfillmentRate)).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fastest Delivery:</span>
                <span className="font-medium text-blue-600">
                  {Math.min(...performanceData.map(d => d.averageDeliveryTime)).toFixed(1)}m
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Peak Orders/Hour:</span>
                <span className="font-medium text-purple-600">
                  {Math.max(...performanceData.map(d => d.peakOrdersPerHour)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">System Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Healthy Components:</span>
                <span className="font-medium text-green-600">
                  {systemHealth.filter(s => s.status === 'healthy').length}/{systemHealth.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Warning Components:</span>
                <span className="font-medium text-yellow-600">
                  {systemHealth.filter(s => s.status === 'warning').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Critical Components:</span>
                <span className="font-medium text-red-600">
                  {systemHealth.filter(s => s.status === 'critical').length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-3">
              <button className="w-full bg-orange-100 text-orange-700 px-4 py-2 rounded-md hover:bg-orange-200 text-sm">
                Generate Performance Report
              </button>
              <button className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 text-sm">
                System Health Check
              </button>
              <button className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 text-sm">
                Schedule Monitoring Alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

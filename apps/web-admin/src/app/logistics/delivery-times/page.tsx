'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  ClockIcon,
  TruckIcon,
  MapPinIcon,

  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface DeliveryTimeData {
  zoneId: string;
  zoneName: string;
  estimatedTime: { min: number; max: number };
  actualAverageTime: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  totalDeliveries: number;
  performanceScore: number;
  trend: 'improving' | 'declining' | 'stable';
  peakHours: { hour: number; averageTime: number }[];
  lastUpdated: string;
}

export default function AdminDeliveryTimes() {
  const [deliveryTimeData, setDeliveryTimeData] = useState<DeliveryTimeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeliveryTimeData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockData: DeliveryTimeData[] = [
          {
            zoneId: 'zone_001',
            zoneName: 'Downtown Core',
            estimatedTime: { min: 20, max: 35 },
            actualAverageTime: 28,
            onTimeDeliveries: 2205,
            lateDeliveries: 251,
            totalDeliveries: 2456,
            performanceScore: 89.8,
            trend: 'improving',
            peakHours: [
              { hour: 12, averageTime: 32 },
              { hour: 13, averageTime: 35 },
              { hour: 19, averageTime: 31 },
              { hour: 20, averageTime: 29 },
            ],
            lastUpdated: '2024-01-15T10:30:00Z',
          },
          {
            zoneId: 'zone_002',
            zoneName: 'Residential North',
            estimatedTime: { min: 30, max: 45 },
            actualAverageTime: 38,
            onTimeDeliveries: 1651,
            lateDeliveries: 183,
            totalDeliveries: 1834,
            performanceScore: 90.0,
            trend: 'stable',
            peakHours: [
              { hour: 12, averageTime: 42 },
              { hour: 13, averageTime: 45 },
              { hour: 19, averageTime: 40 },
              { hour: 20, averageTime: 36 },
            ],
            lastUpdated: '2024-01-15T10:30:00Z',
          },
          {
            zoneId: 'zone_003',
            zoneName: 'Industrial South',
            estimatedTime: { min: 35, max: 50 },
            actualAverageTime: 42,
            onTimeDeliveries: 758,
            lateDeliveries: 134,
            totalDeliveries: 892,
            performanceScore: 85.0,
            trend: 'declining',
            peakHours: [
              { hour: 12, averageTime: 48 },
              { hour: 13, averageTime: 52 },
              { hour: 18, averageTime: 45 },
              { hour: 19, averageTime: 41 },
            ],
            lastUpdated: '2024-01-15T10:30:00Z',
          },
        ];

        setDeliveryTimeData(mockData);
      } catch (error) {
        console.error('Error loading delivery time data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeliveryTimeData();
  }, []);

  const totalDeliveries = deliveryTimeData.reduce((sum, data) => sum + data.totalDeliveries, 0);
  const totalOnTime = deliveryTimeData.reduce((sum, data) => sum + data.onTimeDeliveries, 0);
  const overallOnTimeRate = totalDeliveries > 0 ? (totalOnTime / totalDeliveries * 100) : 0;
  const averageDeliveryTime = deliveryTimeData.length > 0 
    ? deliveryTimeData.reduce((sum, data) => sum + data.actualAverageTime, 0) / deliveryTimeData.length 
    : 0;

  const getTrendIcon = (trend: DeliveryTimeData['trend']) => {
    switch (trend) {
      case 'improving': return ArrowTrendingUpIcon;
      case 'declining': return ArrowTrendingDownIcon;
      default: return ClockIcon;
    }
  };

  const getTrendColor = (trend: DeliveryTimeData['trend']) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
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
        <div className="mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Delivery Times</h1>
          <p className="text-sm lg:text-base text-gray-600">Monitor delivery performance and time analytics across all zones.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
                <p className="text-lg font-semibold text-gray-900">{averageDeliveryTime.toFixed(0)}m</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
                <p className="text-lg font-semibold text-gray-900">{overallOnTimeRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TruckIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-lg font-semibold text-gray-900">{totalDeliveries.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Late Deliveries</p>
                <p className="text-lg font-semibold text-gray-900">
                  {deliveryTimeData.reduce((sum, data) => sum + data.lateDeliveries, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Performance Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Zone Performance</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual Average
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    On-Time Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Deliveries
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveryTimeData.map((data) => {
                  const TrendIcon = getTrendIcon(data.trend);
                  const onTimeRate = (data.onTimeDeliveries / data.totalDeliveries * 100);

                  return (
                    <tr key={data.zoneId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <MapPinIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{data.zoneName}</div>
                            <div className="text-sm text-gray-500">{data.zoneId}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.estimatedTime.min}-{data.estimatedTime.max} min
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{data.actualAverageTime} min</div>
                        <div className={`text-xs ${
                          data.actualAverageTime <= data.estimatedTime.max ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {data.actualAverageTime <= data.estimatedTime.max ? 'Within target' : 'Over target'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{onTimeRate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">
                          {data.onTimeDeliveries}/{data.totalDeliveries}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getPerformanceColor(data.performanceScore)}`}>
                          {data.performanceScore.toFixed(1)}%
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TrendIcon className={`h-4 w-4 mr-2 ${getTrendColor(data.trend)}`} />
                          <span className={`text-sm capitalize ${getTrendColor(data.trend)}`}>
                            {data.trend}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.totalDeliveries.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

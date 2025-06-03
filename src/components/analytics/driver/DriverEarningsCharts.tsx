/**
 * Driver Earnings Analytics Charts
 * Earnings tracking and performance for driver panel
 */

'use client';

import React from 'react';
import BaseChart, { TAP2GO_COLORS } from '../BaseChart';
import { DriverEarningsAnalytics, DriverDeliveryAnalytics } from '../types';

interface DriverEarningsChartsProps {
  earningsData: DriverEarningsAnalytics;
  deliveryData: DriverDeliveryAnalytics;
  className?: string;
}

const DriverEarningsCharts: React.FC<DriverEarningsChartsProps> = ({ 
  earningsData, 
  deliveryData, 
  className = '' 
}) => {
  // Daily Earnings Trend
  const dailyEarningsData: Plotly.Data[] = [
    {
      x: earningsData.dailyEarnings.map(item => item.date),
      y: earningsData.dailyEarnings.map(item => item.value),
      type: 'scatter' as const,
      mode: 'lines+markers',
      name: 'Daily Earnings',
      line: {
        color: TAP2GO_COLORS.success,
        width: 3,
      },
      marker: {
        color: TAP2GO_COLORS.success,
        size: 6,
      },
      fill: 'tonexty',
      fillcolor: 'rgba(16, 185, 129, 0.1)',
      hovertemplate: '<b>%{x}</b><br>Earnings: ₱%{y:,.2f}<extra></extra>',
    },
  ];

  // Earnings Breakdown Pie Chart
  const earningsBreakdownData: Plotly.Data[] = [
    {
      values: [
        earningsData.earningsBreakdown.basePay,
        earningsData.earningsBreakdown.tips,
        earningsData.earningsBreakdown.bonuses,
        earningsData.earningsBreakdown.incentives,
      ],
      labels: ['Base Pay', 'Tips', 'Bonuses', 'Incentives'],
      type: 'pie' as const,
      hole: 0.4,
      marker: {
        colors: [TAP2GO_COLORS.primary, TAP2GO_COLORS.success, TAP2GO_COLORS.info, TAP2GO_COLORS.warning],
      },
      textinfo: 'label+percent',
      textposition: 'outside',
      hovertemplate: '<b>%{label}</b><br>Amount: ₱%{value:,.2f}<br>Percentage: %{percent}<extra></extra>',
    },
  ];

  // Earnings by Time of Day
  const earningsByTimeData: Plotly.Data[] = [
    {
      x: earningsData.earningsByTimeOfDay.map(item => item.x),
      y: earningsData.earningsByTimeOfDay.map(item => item.y),
      type: 'bar' as const,
      marker: {
        color: earningsData.earningsByTimeOfDay.map(item => item.y),
        colorscale: [
          [0, '#dcfce7'],
          [0.5, TAP2GO_COLORS.success],
          [1, '#065f46'],
        ],
        showscale: true,
        colorbar: {
          title: 'Earnings (₱)',
          titleside: 'right',
        },
      },
      text: earningsData.earningsByTimeOfDay.map(item => `₱${item.y.toFixed(0)}`),
      textposition: 'auto',
      hovertemplate: '<b>%{x}:00</b><br>Earnings: ₱%{y:,.2f}<extra></extra>',
    },
  ];

  // Delivery Performance Metrics
  const deliveryMetricsData: Plotly.Data[] = [
    {
      x: ['Deliveries', 'Avg Time (min)', 'Avg Distance (km)', 'Completion Rate (%)'],
      y: [
        deliveryData.deliveryMetrics.totalDeliveries,
        deliveryData.deliveryMetrics.averageDeliveryTime,
        deliveryData.deliveryMetrics.averageDistance,
        deliveryData.deliveryMetrics.completionRate * 100,
      ],
      type: 'bar' as const,
      marker: {
        color: [TAP2GO_COLORS.info, TAP2GO_COLORS.warning, TAP2GO_COLORS.secondary, TAP2GO_COLORS.success],
      },
      text: [
        deliveryData.deliveryMetrics.totalDeliveries.toString(),
        `${deliveryData.deliveryMetrics.averageDeliveryTime.toFixed(1)} min`,
        `${deliveryData.deliveryMetrics.averageDistance.toFixed(1)} km`,
        `${(deliveryData.deliveryMetrics.completionRate * 100).toFixed(1)}%`,
      ],
      textposition: 'auto',
      hovertemplate: '<b>%{x}</b><br>Value: %{text}<extra></extra>',
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Earnings</h3>
          <p className="text-2xl font-bold">₱{earningsData.totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Deliveries</h3>
          <p className="text-2xl font-bold">{deliveryData.deliveryMetrics.totalDeliveries}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Avg per Delivery</h3>
          <p className="text-2xl font-bold">₱{earningsData.averageEarningsPerDelivery.toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Performance Rating</h3>
          <p className="text-2xl font-bold">{deliveryData.performanceRating.toFixed(1)}</p>
          <p className="text-xs opacity-75">⭐ out of 5.0</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Earnings Trend */}
        <BaseChart
          data={dailyEarningsData}
          config={{
            title: 'Daily Earnings Trend',
            subtitle: 'Track your daily earnings performance',
            xAxisTitle: 'Date',
            yAxisTitle: 'Earnings (₱)',
            height: 400,
          }}
          layout={{
            yaxis: {
              tickformat: '₱,.0f',
            },
          }}
        />

        {/* Earnings Breakdown */}
        <BaseChart
          data={earningsBreakdownData}
          config={{
            title: 'Earnings Breakdown',
            subtitle: 'Distribution of your earnings by source',
            showLegend: true,
            height: 400,
          }}
        />

        {/* Earnings by Time of Day */}
        <BaseChart
          data={earningsByTimeData}
          config={{
            title: 'Earnings by Hour',
            subtitle: 'Peak earning hours throughout the day',
            xAxisTitle: 'Hour of Day',
            yAxisTitle: 'Earnings (₱)',
            height: 400,
          }}
          layout={{
            yaxis: {
              tickformat: '₱,.0f',
            },
          }}
        />

        {/* Delivery Performance Metrics */}
        <BaseChart
          data={deliveryMetricsData}
          config={{
            title: 'Delivery Performance',
            subtitle: 'Key performance indicators',
            xAxisTitle: 'Metrics',
            yAxisTitle: 'Value',
            height: 400,
          }}
        />
      </div>

      {/* Performance Insights */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Tips Earned</p>
                <p className="text-2xl font-bold text-green-600">₱{earningsData.earningsBreakdown.tips.toLocaleString()}</p>
                <p className="text-xs text-gray-500">This period</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Avg Delivery Time</p>
                <p className="text-2xl font-bold text-blue-600">{deliveryData.deliveryMetrics.averageDeliveryTime.toFixed(0)}</p>
                <p className="text-xs text-gray-500">minutes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Avg Distance</p>
                <p className="text-2xl font-bold text-orange-600">{deliveryData.deliveryMetrics.averageDistance.toFixed(1)}</p>
                <p className="text-xs text-gray-500">kilometers</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{(deliveryData.deliveryMetrics.completionRate * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Success rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverEarningsCharts;

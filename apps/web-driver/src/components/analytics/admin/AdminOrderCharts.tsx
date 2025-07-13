/**
 * Admin Order Analytics Charts
 * Comprehensive order tracking and analysis for admin panel
 */

'use client';


import React from 'react';
import BaseChart, { TAP2GO_COLORS, CHART_COLOR_PALETTE } from '../BaseChart';
import { OrderAnalytics } from '../types';
import type { EChartsOption } from 'echarts';

interface AdminOrderChartsProps {
  data: OrderAnalytics;
  className?: string;
}

const AdminOrderCharts: React.FC<AdminOrderChartsProps> = ({ data, className = '' }) => {
  // Order Status Distribution Pie Chart
  const orderStatusOption: EChartsOption = {
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: data.orderStatusDistribution.map((item, index) => ({
        value: item.count,
        name: item.status,
        itemStyle: { color: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length] },
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      label: {
        show: true,
        formatter: '{b}: {d}%',
      },
    }],
    tooltip: {
      trigger: 'item',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        return `<b>${params.name}</b><br/>Orders: ${params.value}<br/>Percentage: ${params.percent}%`;
      },
    },
  };

  // Orders by Hour Bar Chart
  const ordersByHourOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: data.ordersByHour.map(item => `${item.x}:00`),
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [{
      data: data.ordersByHour.map(item => ({
        value: item.y,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: TAP2GO_COLORS.primary },
              { offset: 1, color: TAP2GO_COLORS.secondary }
            ]
          }
        }
      })),
      type: 'bar',
      label: {
        show: true,
        position: 'top',
      },
    }],
    tooltip: {
      trigger: 'axis',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0];
        return `<b>${data.axisValue}</b><br/>Orders: ${data.value}`;
      },
    },
  };

  // Order Trends Line Chart
  const orderTrendsOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: data.orderTrends.map(item => item.date),
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [{
      data: data.orderTrends.map(item => item.value),
      type: 'line',
      smooth: true,
      lineStyle: { color: TAP2GO_COLORS.info, width: 3 },
      itemStyle: { color: TAP2GO_COLORS.info },
      symbol: 'circle',
      symbolSize: 6,
    }],
    tooltip: {
      trigger: 'axis',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0];
        return `<b>${data.axisValue}</b><br/>Orders: ${data.value}`;
      },
    },
  };

  // Order Completion Funnel
  const orderFunnelOption: EChartsOption = {
    series: [{
      type: 'funnel',
      left: '10%',
      top: 60,
      bottom: 60,
      width: '80%',
      min: 0,
      max: data.totalOrders,
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside',
      },
      labelLine: {
        length: 10,
        lineStyle: {
          width: 1,
          type: 'solid'
        }
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1
      },
      emphasis: {
        label: {
          fontSize: 20
        }
      },
      data: [
        { value: data.totalOrders, name: 'Orders Placed', itemStyle: { color: TAP2GO_COLORS.info } },
        { value: data.totalOrders - data.cancelledOrders, name: 'Orders Confirmed', itemStyle: { color: TAP2GO_COLORS.warning } },
        { value: data.completedOrders + data.pendingOrders, name: 'Orders Prepared', itemStyle: { color: TAP2GO_COLORS.secondary } },
        { value: data.completedOrders, name: 'Orders Delivered', itemStyle: { color: TAP2GO_COLORS.success } },
      ]
    }],
    tooltip: {
      trigger: 'item',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const percentage = ((params.value / data.totalOrders) * 100).toFixed(1);
        return `<b>${params.name}</b><br/>Count: ${params.value}<br/>Percentage: ${percentage}%`;
      },
    },
  };

  // Order Performance Metrics
  const completionRate = ((data.completedOrders / data.totalOrders) * 100).toFixed(1);
  const cancellationRate = ((data.cancelledOrders / data.totalOrders) * 100).toFixed(1);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Orders</h3>
          <p className="text-2xl font-bold">{data.totalOrders.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Completed</h3>
          <p className="text-2xl font-bold">{data.completedOrders.toLocaleString()}</p>
          <p className="text-xs opacity-75">{completionRate}% completion rate</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Pending</h3>
          <p className="text-2xl font-bold">{data.pendingOrders.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Cancelled</h3>
          <p className="text-2xl font-bold">{data.cancelledOrders.toLocaleString()}</p>
          <p className="text-xs opacity-75">{cancellationRate}% cancellation rate</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Avg Order Value</h3>
          <p className="text-2xl font-bold">₱{data.averageOrderValue.toFixed(0)}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <BaseChart
          option={orderStatusOption}
          config={{
            title: 'Order Status Distribution',
            subtitle: 'Current breakdown of orders by status',
            showLegend: true,
            height: 400,
          }}
        />

        {/* Orders by Hour */}
        <BaseChart
          option={ordersByHourOption}
          config={{
            title: 'Orders by Hour of Day',
            subtitle: 'Peak ordering times throughout the day',
            height: 400,
          }}
        />

        {/* Order Trends */}
        <BaseChart
          option={orderTrendsOption}
          config={{
            title: 'Order Volume Trends',
            subtitle: 'Daily order volume over time',
            height: 400,
          }}
        />

        {/* Order Completion Funnel */}
        <BaseChart
          option={orderFunnelOption}
          config={{
            title: 'Order Completion Funnel',
            subtitle: 'Order flow from placement to delivery',
            height: 400,
          }}
        />
      </div>

      {/* Performance Insights */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Cancellation Rate</p>
                <p className="text-2xl font-bold text-red-600">{cancellationRate}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Avg Order Value</p>
                <p className="text-2xl font-bold text-blue-600">₱{data.averageOrderValue.toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderCharts;

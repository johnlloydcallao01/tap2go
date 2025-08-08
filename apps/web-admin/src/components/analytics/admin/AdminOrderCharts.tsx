/**
 * Admin Order Analytics Charts
 * Comprehensive order tracking and analysis for admin panel
 */

'use client';


import React from 'react';
import BaseChart, { TAP2GO_COLORS } from '../BaseChart';
import { OrderData } from '../types';
import type { EChartsOption } from 'echarts';

interface AdminOrderChartsProps {
  data: OrderData[];
  className?: string;
}

const AdminOrderCharts: React.FC<AdminOrderChartsProps> = ({ data, className = '' }) => {
  // Calculate totals
  const totalOrders = data.reduce((sum, item) => sum + item.totalOrders, 0);
  const completedOrders = data.reduce((sum, item) => sum + item.completedOrders, 0);
  const cancelledOrders = data.reduce((sum, item) => sum + item.cancelledOrders, 0);
  const averageDeliveryTime = data.length > 0 
    ? data.reduce((sum, item) => sum + item.averageDeliveryTime, 0) / data.length 
    : 0;


  // Order Status Distribution Pie Chart
  const orderStatusOption: EChartsOption = {
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        {
          value: completedOrders,
          name: 'Completed',
          itemStyle: { color: TAP2GO_COLORS.success },
        },
        {
          value: cancelledOrders,
          name: 'Cancelled',
          itemStyle: { color: TAP2GO_COLORS.error },
        },
        {
          value: totalOrders - completedOrders - cancelledOrders,
          name: 'Pending',
          itemStyle: { color: TAP2GO_COLORS.warning },
        },
      ],
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
      formatter: (params: unknown) => {
        const data = params as { name: string; value: number; percent: number };
        return `<b>${data.name}</b><br/>Orders: ${data.value}<br/>Percentage: ${data.percent}%`;
      },
    },
  };

  // Orders by Hour Bar Chart (simulated data)
  const ordersByHourData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    orders: Math.floor(Math.random() * 200) + 50,
  }));

  const ordersByHourOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: ordersByHourData.map(item => `${item.hour}:00`),
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
      data: ordersByHourData.map(item => ({
        value: item.orders,
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
      formatter: (params: unknown) => {
        const data = (params as Array<{ axisValue: string; value: number }>)[0];
        return `<b>${data.axisValue}</b><br/>Orders: ${data.value}`;
      },
    },
  };

  // Order Trends Line Chart
  const orderTrendsOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: data.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
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
      data: data.map(item => item.totalOrders),
      type: 'line',
      smooth: true,
      lineStyle: { color: TAP2GO_COLORS.info, width: 3 },
      itemStyle: { color: TAP2GO_COLORS.info },
      symbol: 'circle',
      symbolSize: 6,
    }],
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const data = (params as Array<{ axisValue: string; value: number }>)[0];
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
      max: totalOrders,
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
        { value: totalOrders, name: 'Orders Placed', itemStyle: { color: TAP2GO_COLORS.info } },
        { value: totalOrders - cancelledOrders, name: 'Orders Confirmed', itemStyle: { color: TAP2GO_COLORS.warning } },
        { value: completedOrders + (totalOrders - completedOrders - cancelledOrders), name: 'Orders Prepared', itemStyle: { color: TAP2GO_COLORS.secondary } },
        { value: completedOrders, name: 'Orders Delivered', itemStyle: { color: TAP2GO_COLORS.success } },
      ]
    }],
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const data = params as { name: string; value: number };
        const percentage = ((data.value / totalOrders) * 100).toFixed(1);
        return `<b>${data.name}</b><br/>Count: ${data.value}<br/>Percentage: ${percentage}%`;
      },
    },
  };

  // Order Performance Metrics
  const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0';
  const cancellationRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : '0';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Orders</h3>
          <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Completed</h3>
          <p className="text-2xl font-bold">{completedOrders.toLocaleString()}</p>
          <p className="text-xs opacity-75">{completionRate}% completion rate</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Pending</h3>
          <p className="text-2xl font-bold">{(totalOrders - completedOrders - cancelledOrders).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Cancelled</h3>
          <p className="text-2xl font-bold">{cancelledOrders.toLocaleString()}</p>
          <p className="text-xs opacity-75">{cancellationRate}% cancellation rate</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Avg Delivery</h3>
          <p className="text-2xl font-bold">{averageDeliveryTime.toFixed(0)}m</p>
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
    </div>
  );
};

export default AdminOrderCharts;

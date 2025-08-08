/**
 * Admin Revenue Analytics Charts
 * Comprehensive revenue tracking and analysis for admin panel
 */

'use client';


import React from 'react';
import BaseChart, { TAP2GO_COLORS } from '../BaseChart';
import { RevenueData } from '../types';
import type { EChartsOption } from 'echarts';

interface AdminRevenueChartsProps {
  data: RevenueData[];
  className?: string;
}

const AdminRevenueCharts: React.FC<AdminRevenueChartsProps> = ({ data, className = '' }) => {
  // Calculate totals
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const totalCommission = data.reduce((sum, item) => sum + item.commission, 0);
  const totalRefunds = data.reduce((sum, item) => sum + item.refunds, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue Trend Line Chart
  const revenueTrendOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: data.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#6b7280',
        formatter: (value: number) => `₱${value.toLocaleString()}`,
      },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [{
      data: data.map(item => item.revenue),
      type: 'line',
      smooth: true,
      lineStyle: { color: TAP2GO_COLORS.primary, width: 3 },
      itemStyle: { color: TAP2GO_COLORS.primary },
      symbol: 'circle',
      symbolSize: 6,
    }],
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const data = (params as Array<{ axisValue: string; value: number }>)[0];
        return `<b>${data.axisValue}</b><br/>Revenue: ₱${data.value.toLocaleString()}`;
      },
    },
  };

  // Revenue Breakdown Pie Chart
  const revenueBreakdownOption: EChartsOption = {
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        {
          value: totalRevenue - totalCommission - totalRefunds,
          name: 'Net Revenue',
          itemStyle: { color: TAP2GO_COLORS.success },
        },
        {
          value: totalCommission,
          name: 'Commission',
          itemStyle: { color: TAP2GO_COLORS.primary },
        },
        {
          value: totalRefunds,
          name: 'Refunds',
          itemStyle: { color: TAP2GO_COLORS.error },
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
        return `<b>${data.name}</b><br/>Amount: ₱${data.value.toLocaleString()}<br/>Percentage: ${data.percent}%`;
      },
    },
  };

  // Revenue Growth Area Chart
  const revenueGrowthOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: data.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#6b7280',
        formatter: (value: number) => `₱${value.toLocaleString()}`,
      },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [{
      data: data.map(item => item.revenue),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: 'rgba(243, 168, 35, 0.3)',
      },
      lineStyle: { color: TAP2GO_COLORS.primary, width: 2 },
      itemStyle: { color: TAP2GO_COLORS.primary },
    }],
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const data = (params as Array<{ axisValue: string; value: number }>)[0];
        return `<b>${data.axisValue}</b><br/>Revenue: ₱${data.value.toLocaleString()}`;
      },
    },
  };

  // Orders vs Revenue Dual Axis Chart
  const ordersRevenueOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: data.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Revenue (₱)',
        position: 'left',
        axisLabel: {
          color: '#6b7280',
          formatter: (value: number) => `₱${value.toLocaleString()}`,
        },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      {
        type: 'value',
        name: 'Orders',
        position: 'right',
        axisLabel: { color: '#6b7280' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitLine: { show: false },
      }
    ],
    series: [
      {
        name: 'Revenue',
        type: 'line',
        yAxisIndex: 0,
        data: data.map(item => item.revenue),
        lineStyle: { color: TAP2GO_COLORS.primary, width: 3 },
        itemStyle: { color: TAP2GO_COLORS.primary },
        smooth: true,
      },
      {
        name: 'Orders',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map(item => item.orders),
        itemStyle: { color: TAP2GO_COLORS.info },
        barWidth: '40%',
      }
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const paramsArray = params as Array<{ seriesName: string; value: number; axisValue: string }>;
        let result = `<b>${paramsArray[0].axisValue}</b><br/>`;
        paramsArray.forEach((param) => {
          if (param.seriesName === 'Revenue') {
            result += `${param.seriesName}: ₱${param.value.toLocaleString()}<br/>`;
          } else {
            result += `${param.seriesName}: ${param.value}<br/>`;
          }
        });
        return result;
      },
    },
    legend: {
      data: ['Revenue', 'Orders'],
      bottom: 0,
    },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
          <p className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Orders</h3>
          <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Avg Order Value</h3>
          <p className="text-2xl font-bold">₱{averageOrderValue.toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Commission</h3>
          <p className="text-2xl font-bold">₱{totalCommission.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <BaseChart
          option={revenueTrendOption}
          config={{
            title: 'Revenue Trend Over Time',
            subtitle: 'Track revenue performance across different time periods',
            height: 400,
          }}
        />

        {/* Revenue Breakdown Pie Chart */}
        <BaseChart
          option={revenueBreakdownOption}
          config={{
            title: 'Revenue Breakdown',
            subtitle: 'Distribution of revenue by source',
            showLegend: true,
            height: 400,
          }}
        />

        {/* Revenue Growth Area Chart */}
        <BaseChart
          option={revenueGrowthOption}
          config={{
            title: 'Revenue Growth Pattern',
            subtitle: 'Visual representation of revenue growth over time',
            height: 400,
          }}
        />

        {/* Orders vs Revenue Chart */}
        <BaseChart
          option={ordersRevenueOption}
          config={{
            title: 'Orders vs Revenue Correlation',
            subtitle: 'Relationship between order volume and revenue',
            height: 400,
            showLegend: true,
          }}
        />
      </div>
    </div>
  );
};

export default AdminRevenueCharts;

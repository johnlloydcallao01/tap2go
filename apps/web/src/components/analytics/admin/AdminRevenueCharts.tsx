/**
 * Admin Revenue Analytics Charts
 * Comprehensive revenue tracking and analysis for admin panel
 */

'use client';

import React from 'react';
import BaseChart, { TAP2GO_COLORS } from '../BaseChart';
import { RevenueAnalytics } from '../types';
import type { EChartsOption } from 'echarts';

interface AdminRevenueChartsProps {
  data: RevenueAnalytics;
  className?: string;
}

const AdminRevenueCharts: React.FC<AdminRevenueChartsProps> = ({ data, className = '' }) => {
  // Revenue Trend Line Chart
  const revenueTrendOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: data.revenueByPeriod.map(item => item.date),
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
      data: data.revenueByPeriod.map(item => item.value),
      type: 'line',
      smooth: true,
      lineStyle: { color: TAP2GO_COLORS.primary, width: 3 },
      itemStyle: { color: TAP2GO_COLORS.primary },
      symbol: 'circle',
      symbolSize: 6,
    }],
    tooltip: {
      trigger: 'axis',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0];
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
          value: data.revenueBreakdown.platformFees,
          name: 'Platform Fees',
          itemStyle: { color: TAP2GO_COLORS.primary },
        },
        {
          value: data.revenueBreakdown.commissions,
          name: 'Vendor Commissions',
          itemStyle: { color: TAP2GO_COLORS.secondary },
        },
        {
          value: data.revenueBreakdown.deliveryFees,
          name: 'Delivery Fees',
          itemStyle: { color: TAP2GO_COLORS.success },
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        return `<b>${params.name}</b><br/>Amount: ₱${params.value.toLocaleString()}<br/>Percentage: ${params.percent}%`;
      },
    },
  };

  // Revenue Distribution Bar Chart
  const revenueDistributionOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: ['Platform Revenue', 'Vendor Revenue', 'Driver Revenue'],
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
      data: [
        { value: data.platformRevenue, itemStyle: { color: TAP2GO_COLORS.primary } },
        { value: data.vendorRevenue, itemStyle: { color: TAP2GO_COLORS.secondary } },
        { value: data.driverRevenue, itemStyle: { color: TAP2GO_COLORS.success } },
      ],
      type: 'bar',
      label: {
        show: true,
        position: 'top',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => `₱${params.value.toLocaleString()}`,
      },
    }],
    tooltip: {
      trigger: 'axis',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0];
        return `<b>${data.axisValue}</b><br/>Amount: ₱${data.value.toLocaleString()}`;
      },
    },
  };

  // Revenue Growth Area Chart
  const revenueGrowthOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: data.revenueByPeriod.map(item => item.date),
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
      data: data.revenueByPeriod.map(item => item.value),
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0];
        return `<b>${data.axisValue}</b><br/>Revenue: ₱${data.value.toLocaleString()}`;
      },
    },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
          <p className="text-2xl font-bold">₱{data.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Platform Revenue</h3>
          <p className="text-2xl font-bold">₱{data.platformRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Vendor Revenue</h3>
          <p className="text-2xl font-bold">₱{data.vendorRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Driver Revenue</h3>
          <p className="text-2xl font-bold">₱{data.driverRevenue.toLocaleString()}</p>
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

        {/* Revenue Distribution Bar Chart */}
        <BaseChart
          option={revenueDistributionOption}
          config={{
            title: 'Revenue Distribution by Stakeholder',
            subtitle: 'Revenue allocation across platform participants',
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
      </div>
    </div>
  );
};

export default AdminRevenueCharts;

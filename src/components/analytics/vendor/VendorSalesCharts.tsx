/**
 * Vendor Sales Analytics Charts
 * Sales performance tracking for vendor panel
 */

'use client';

import React from 'react';
import BaseChart, { TAP2GO_COLORS, CHART_COLOR_PALETTE } from '../BaseChart';
import { VendorSalesAnalytics } from '../types';
import type { EChartsOption } from 'echarts';

interface VendorSalesChartsProps {
  data: VendorSalesAnalytics;
  className?: string;
}

const VendorSalesCharts: React.FC<VendorSalesChartsProps> = ({ data, className = '' }) => {
  // Daily Sales Trend Chart
  const dailySalesOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: data.dailySales.map(item => item.date),
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
      data: data.dailySales.map(item => item.value),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: 'rgba(243, 168, 35, 0.3)',
      },
      lineStyle: { color: TAP2GO_COLORS.primary, width: 3 },
      itemStyle: { color: TAP2GO_COLORS.primary },
    }],
    tooltip: {
      trigger: 'axis',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0];
        return `<b>${data.axisValue}</b><br/>Sales: ₱${data.value.toLocaleString()}`;
      },
    },
  };

  // Top Selling Items Bar Chart
  const topItemsOption: EChartsOption = {
    xAxis: {
      type: 'value',
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    yAxis: {
      type: 'category',
      data: data.topSellingItems.map(item => item.itemName),
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    series: [{
      data: data.topSellingItems.map((item, index) => ({
        value: item.quantity,
        itemStyle: { color: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length] },
      })),
      type: 'bar',
      label: {
        show: true,
        position: 'right',
      },
    }],
    tooltip: {
      trigger: 'axis',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0];
        return `<b>${data.axisValue}</b><br/>Quantity: ${data.value}`;
      },
    },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
          <p className="text-2xl font-bold">₱{data.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Order Count</h3>
          <p className="text-2xl font-bold">{data.orderCount.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Avg Order Value</h3>
          <p className="text-2xl font-bold">₱{data.averageOrderValue.toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Top Items</h3>
          <p className="text-2xl font-bold">{data.topSellingItems.length}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <BaseChart
          option={dailySalesOption}
          config={{
            title: 'Daily Sales Trend',
            subtitle: 'Revenue performance over time',
            height: 400,
          }}
        />

        {/* Top Selling Items */}
        <BaseChart
          option={topItemsOption}
          config={{
            title: 'Top Selling Items',
            subtitle: 'Best performing menu items',
            height: 400,
          }}
        />
      </div>
    </div>
  );
};

export default VendorSalesCharts;

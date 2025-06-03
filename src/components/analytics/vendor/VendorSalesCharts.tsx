/**
 * Vendor Sales Analytics Charts
 * Sales performance tracking for vendor panel
 */

'use client';

import React from 'react';
import BaseChart, { TAP2GO_COLORS, CHART_COLOR_PALETTE } from '../BaseChart';
import { VendorSalesAnalytics } from '../types';

interface VendorSalesChartsProps {
  data: VendorSalesAnalytics;
  className?: string;
}

const VendorSalesCharts: React.FC<VendorSalesChartsProps> = ({ data, className = '' }) => {
  // Daily Sales Trend
  const dailySalesData: Plotly.Data[] = [
    {
      x: data.dailySales.map(item => item.date),
      y: data.dailySales.map(item => item.value),
      type: 'scatter' as const,
      mode: 'lines+markers',
      name: 'Daily Sales',
      line: {
        color: TAP2GO_COLORS.primary,
        width: 3,
      },
      marker: {
        color: TAP2GO_COLORS.primary,
        size: 6,
      },
      fill: 'tonexty',
      fillcolor: 'rgba(243, 168, 35, 0.1)',
      hovertemplate: '<b>%{x}</b><br>Sales: ₱%{y:,.2f}<extra></extra>',
    },
  ];

  // Top Selling Items Bar Chart
  const topItemsData: Plotly.Data[] = [
    {
      x: data.topSellingItems.map(item => item.revenue),
      y: data.topSellingItems.map(item => item.itemName),
      type: 'bar' as const,
      orientation: 'h',
      marker: {
        color: CHART_COLOR_PALETTE,
      },
      text: data.topSellingItems.map(item => `₱${item.revenue.toLocaleString()}`),
      textposition: 'auto',
      hovertemplate: '<b>%{y}</b><br>Revenue: ₱%{x:,.2f}<br>Quantity: %{customdata}<extra></extra>',
      customdata: data.topSellingItems.map(item => item.quantity),
    },
  ];

  // Sales by Time of Day Heatmap
  const salesByTimeData: Plotly.Data[] = [
    {
      x: data.salesByTimeOfDay.map(item => item.x),
      y: data.salesByTimeOfDay.map(item => item.y),
      type: 'bar' as const,
      marker: {
        color: data.salesByTimeOfDay.map(item => item.y),
        colorscale: [
          [0, '#fef3c7'],
          [0.5, TAP2GO_COLORS.warning],
          [1, TAP2GO_COLORS.primary],
        ],
        showscale: true,
        colorbar: {
          title: 'Sales (₱)',
          titleside: 'right',
        },
      },
      text: data.salesByTimeOfDay.map(item => `₱${item.y.toLocaleString()}`),
      textposition: 'auto',
      hovertemplate: '<b>%{x}:00</b><br>Sales: ₱%{y:,.2f}<extra></extra>',
    },
  ];

  // Sales Performance Gauge
  const salesTargetPercentage = Math.min((data.totalRevenue / 100000) * 100, 100); // Assuming 100k target
  const salesGaugeData: Plotly.Data[] = [
    {
      type: 'indicator' as const,
      mode: 'gauge+number+delta',
      value: salesTargetPercentage,
      domain: { x: [0, 1], y: [0, 1] },
      title: { text: 'Sales Target Achievement' },
      delta: { reference: 80 },
      gauge: {
        axis: { range: [null, 100] },
        bar: { color: TAP2GO_COLORS.primary },
        steps: [
          { range: [0, 50], color: '#fee2e2' },
          { range: [50, 80], color: '#fef3c7' },
          { range: [80, 100], color: '#d1fae5' },
        ],
        threshold: {
          line: { color: TAP2GO_COLORS.error, width: 4 },
          thickness: 0.75,
          value: 90,
        },
      },
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
          <p className="text-2xl font-bold">₱{data.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Orders</h3>
          <p className="text-2xl font-bold">{data.orderCount.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Avg Order Value</h3>
          <p className="text-2xl font-bold">₱{data.averageOrderValue.toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Best Selling Item</h3>
          <p className="text-lg font-bold">{data.topSellingItems[0]?.itemName || 'N/A'}</p>
          <p className="text-xs opacity-75">{data.topSellingItems[0]?.quantity || 0} sold</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <BaseChart
          data={dailySalesData}
          config={{
            title: 'Daily Sales Trend',
            subtitle: 'Track your daily sales performance',
            xAxisTitle: 'Date',
            yAxisTitle: 'Sales (₱)',
            height: 400,
          }}
          layout={{
            yaxis: {
              tickformat: '₱,.0f',
            },
          }}
        />

        {/* Sales Performance Gauge */}
        <BaseChart
          data={salesGaugeData}
          config={{
            title: 'Sales Target Progress',
            subtitle: 'Current progress towards monthly sales target',
            height: 400,
          }}
        />

        {/* Top Selling Items */}
        <BaseChart
          data={topItemsData}
          config={{
            title: 'Top Selling Menu Items',
            subtitle: 'Your best performing menu items by revenue',
            xAxisTitle: 'Revenue (₱)',
            yAxisTitle: 'Menu Items',
            height: 400,
          }}
          layout={{
            xaxis: {
              tickformat: '₱,.0f',
            },
            margin: {
              l: 150,
              r: 30,
              t: 60,
              b: 50,
            },
          }}
        />

        {/* Sales by Time of Day */}
        <BaseChart
          data={salesByTimeData}
          config={{
            title: 'Sales by Hour',
            subtitle: 'Peak sales hours throughout the day',
            xAxisTitle: 'Hour of Day',
            yAxisTitle: 'Sales (₱)',
            height: 400,
          }}
          layout={{
            yaxis: {
              tickformat: '₱,.0f',
            },
          }}
        />
      </div>

      {/* Performance Insights */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Growth Rate</p>
                <p className="text-2xl font-bold text-green-600">+12.5%</p>
                <p className="text-xs text-gray-500">vs last month</p>
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
                <p className="text-sm font-medium text-gray-900">Peak Hour</p>
                <p className="text-2xl font-bold text-blue-600">
                  {String(data.salesByTimeOfDay.reduce((max, item) => item.y > max.y ? item : max, data.salesByTimeOfDay[0])?.x || 'N/A')}:00
                </p>
                <p className="text-xs text-gray-500">Highest sales</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Target Progress</p>
                <p className="text-2xl font-bold text-orange-600">{salesTargetPercentage.toFixed(0)}%</p>
                <p className="text-xs text-gray-500">Monthly target</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSalesCharts;

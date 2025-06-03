/**
 * Admin Revenue Analytics Charts
 * Comprehensive revenue tracking and analysis for admin panel
 */

'use client';

import React from 'react';
import BaseChart, { TAP2GO_COLORS } from '../BaseChart';
import { RevenueAnalytics } from '../types';

interface AdminRevenueChartsProps {
  data: RevenueAnalytics;
  className?: string;
}

const AdminRevenueCharts: React.FC<AdminRevenueChartsProps> = ({ data, className = '' }) => {
  // Revenue Trend Line Chart
  const revenueTrendData: Plotly.Data[] = [
    {
      x: data.revenueByPeriod.map(item => item.date),
      y: data.revenueByPeriod.map(item => item.value),
      type: 'scatter' as const,
      mode: 'lines+markers',
      name: 'Total Revenue',
      line: {
        color: TAP2GO_COLORS.primary,
        width: 3,
      },
      marker: {
        color: TAP2GO_COLORS.primary,
        size: 6,
      },
      hovertemplate: '<b>%{x}</b><br>Revenue: ₱%{y:,.2f}<extra></extra>',
    },
  ];

  // Revenue Breakdown Pie Chart
  const revenueBreakdownData: Plotly.Data[] = [
    {
      values: [
        data.revenueBreakdown.platformFees,
        data.revenueBreakdown.commissions,
        data.revenueBreakdown.deliveryFees,
      ],
      labels: ['Platform Fees', 'Vendor Commissions', 'Delivery Fees'],
      type: 'pie' as const,
      hole: 0.4,
      marker: {
        colors: [TAP2GO_COLORS.primary, TAP2GO_COLORS.secondary, TAP2GO_COLORS.success],
      },
      textinfo: 'label+percent',
      textposition: 'outside',
      hovertemplate: '<b>%{label}</b><br>Amount: ₱%{value:,.2f}<br>Percentage: %{percent}<extra></extra>',
    },
  ];

  // Revenue Distribution Bar Chart
  const revenueDistributionData: Plotly.Data[] = [
    {
      x: ['Platform Revenue', 'Vendor Revenue', 'Driver Revenue'],
      y: [data.platformRevenue, data.vendorRevenue, data.driverRevenue],
      type: 'bar' as const,
      marker: {
        color: [TAP2GO_COLORS.primary, TAP2GO_COLORS.secondary, TAP2GO_COLORS.success],
      },
      text: [
        `₱${data.platformRevenue.toLocaleString()}`,
        `₱${data.vendorRevenue.toLocaleString()}`,
        `₱${data.driverRevenue.toLocaleString()}`,
      ],
      textposition: 'auto',
      hovertemplate: '<b>%{x}</b><br>Amount: ₱%{y:,.2f}<extra></extra>',
    },
  ];

  // Revenue Growth Area Chart
  const revenueGrowthData: Plotly.Data[] = [
    {
      x: data.revenueByPeriod.map(item => item.date),
      y: data.revenueByPeriod.map(item => item.value),
      fill: 'tonexty',
      type: 'scatter' as const,
      mode: 'none',
      name: 'Revenue Growth',
      fillcolor: `rgba(243, 168, 35, 0.3)`,
      line: { color: 'transparent' },
      hovertemplate: '<b>%{x}</b><br>Revenue: ₱%{y:,.2f}<extra></extra>',
    },
    {
      x: data.revenueByPeriod.map(item => item.date),
      y: data.revenueByPeriod.map(item => item.value),
      type: 'scatter' as const,
      mode: 'lines',
      name: 'Revenue Trend',
      line: {
        color: TAP2GO_COLORS.primary,
        width: 2,
      },
      hovertemplate: '<b>%{x}</b><br>Revenue: ₱%{y:,.2f}<extra></extra>',
    },
  ];

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
          data={revenueTrendData}
          config={{
            title: 'Revenue Trend Over Time',
            subtitle: 'Track revenue performance across different time periods',
            xAxisTitle: 'Date',
            yAxisTitle: 'Revenue (₱)',
            height: 400,
          }}
          layout={{
            yaxis: {
              tickformat: '₱,.0f',
            },
          }}
        />

        {/* Revenue Breakdown Pie Chart */}
        <BaseChart
          data={revenueBreakdownData}
          config={{
            title: 'Revenue Breakdown',
            subtitle: 'Distribution of revenue by source',
            showLegend: true,
            height: 400,
          }}
        />

        {/* Revenue Distribution Bar Chart */}
        <BaseChart
          data={revenueDistributionData}
          config={{
            title: 'Revenue Distribution by Stakeholder',
            subtitle: 'Revenue allocation across platform participants',
            xAxisTitle: 'Stakeholder',
            yAxisTitle: 'Revenue (₱)',
            height: 400,
          }}
          layout={{
            yaxis: {
              tickformat: '₱,.0f',
            },
          }}
        />

        {/* Revenue Growth Area Chart */}
        <BaseChart
          data={revenueGrowthData}
          config={{
            title: 'Revenue Growth Pattern',
            subtitle: 'Visual representation of revenue growth over time',
            xAxisTitle: 'Date',
            yAxisTitle: 'Revenue (₱)',
            height: 400,
          }}
          layout={{
            yaxis: {
              tickformat: '₱,.0f',
            },
          }}
        />
      </div>
    </div>
  );
};

export default AdminRevenueCharts;

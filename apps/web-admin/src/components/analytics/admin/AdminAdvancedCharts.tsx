/**
 * Advanced Admin Analytics Charts
 * Showcase complex ECharts visualizations for admin panel
 */

'use client';


import React from 'react';
import { DirectChart } from '../DirectECharts';
import { TAP2GO_COLORS, CHART_COLOR_PALETTE } from '../BaseChart';
import type { EChartsOption } from 'echarts';

interface AdminAdvancedChartsProps {
  className?: string;
}

const AdminAdvancedCharts: React.FC<AdminAdvancedChartsProps> = ({ className = '' }) => {

  // Sankey Diagram - Order Flow
  const sankeyOption: EChartsOption = {
    series: {
      type: 'sankey',
      emphasis: {
        focus: 'adjacency'
      },
      data: [
        { name: 'Orders Placed' },
        { name: 'Payment Processing' },
        { name: 'Restaurant Confirmed' },
        { name: 'Preparing' },
        { name: 'Ready for Pickup' },
        { name: 'Driver Assigned' },
        { name: 'In Transit' },
        { name: 'Delivered' },
        { name: 'Cancelled' },
        { name: 'Failed Payment' },
      ],
      links: [
        { source: 'Orders Placed', target: 'Payment Processing', value: 1000 },
        { source: 'Payment Processing', target: 'Restaurant Confirmed', value: 950 },
        { source: 'Payment Processing', target: 'Failed Payment', value: 50 },
        { source: 'Restaurant Confirmed', target: 'Preparing', value: 920 },
        { source: 'Restaurant Confirmed', target: 'Cancelled', value: 30 },
        { source: 'Preparing', target: 'Ready for Pickup', value: 900 },
        { source: 'Preparing', target: 'Cancelled', value: 20 },
        { source: 'Ready for Pickup', target: 'Driver Assigned', value: 880 },
        { source: 'Ready for Pickup', target: 'Cancelled', value: 20 },
        { source: 'Driver Assigned', target: 'In Transit', value: 860 },
        { source: 'Driver Assigned', target: 'Cancelled', value: 20 },
        { source: 'In Transit', target: 'Delivered', value: 840 },
        { source: 'In Transit', target: 'Cancelled', value: 20 },
      ],
      itemStyle: {
        color: TAP2GO_COLORS.primary,
      },
      lineStyle: {
        color: 'source',
        curveness: 0.5,
      },
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: unknown) => {
        const data = params as { dataType?: string; data?: { source?: string; target?: string; value?: number; name?: string } };
        if (data.dataType === 'edge' && data.data) {
          return `${data.data.source} → ${data.data.target}<br/>Orders: ${data.data.value}`;
        }
        return data.data?.name || 'Unknown';
      }
    },
  };

  // Radar Chart - Platform Performance
  const radarOption: EChartsOption = {
    radar: {
      indicator: [
        { name: 'Order Volume', max: 100 },
        { name: 'Delivery Speed', max: 100 },
        { name: 'Customer Satisfaction', max: 100 },
        { name: 'Driver Efficiency', max: 100 },
        { name: 'Revenue Growth', max: 100 },
        { name: 'Platform Stability', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: '#6b7280',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(243, 168, 35, 0.1)', 'rgba(243, 168, 35, 0.05)'],
        },
      },
    },
    series: [
      {
        name: 'Current Performance',
        type: 'radar',
        data: [
          {
            value: [85, 78, 92, 73, 88, 95],
            name: 'Current Month',
            itemStyle: { color: TAP2GO_COLORS.primary },
            areaStyle: { color: 'rgba(243, 168, 35, 0.3)' },
          },
          {
            value: [75, 72, 88, 68, 82, 90],
            name: 'Previous Month',
            itemStyle: { color: TAP2GO_COLORS.info },
            areaStyle: { color: 'rgba(59, 130, 246, 0.2)' },
          },
        ],
      },
    ],
    legend: {
      data: ['Current Month', 'Previous Month'],
      bottom: 0,
    },
    tooltip: {
      trigger: 'item',
    },
  };

  // Funnel Chart - Customer Journey
  const funnelOption: EChartsOption = {
    series: [
      {
        name: 'Customer Journey',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: 100,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}: {c}%',
          color: 'white',
          fontSize: 14,
          fontWeight: 'bold',
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 16,
          },
        },
        data: [
          { value: 100, name: 'App Downloads', itemStyle: { color: CHART_COLOR_PALETTE[0] } },
          { value: 85, name: 'Account Registration', itemStyle: { color: CHART_COLOR_PALETTE[1] } },
          { value: 68, name: 'Browse Restaurants', itemStyle: { color: CHART_COLOR_PALETTE[2] } },
          { value: 45, name: 'Add to Cart', itemStyle: { color: CHART_COLOR_PALETTE[3] } },
          { value: 32, name: 'Checkout', itemStyle: { color: CHART_COLOR_PALETTE[4] } },
          { value: 28, name: 'Payment Complete', itemStyle: { color: CHART_COLOR_PALETTE[5] } },
          { value: 25, name: 'Order Delivered', itemStyle: { color: CHART_COLOR_PALETTE[6] } },
        ],
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%',
    },
  };

  // Tree Map - Revenue by Category
  const treemapOption: EChartsOption = {
    series: [
      {
        name: 'Revenue by Category',
        type: 'treemap',
        data: [
          {
            name: 'Food Categories',
            children: [
              { name: 'Fast Food', value: 1200000, itemStyle: { color: CHART_COLOR_PALETTE[0] } },
              { name: 'Asian Cuisine', value: 980000, itemStyle: { color: CHART_COLOR_PALETTE[1] } },
              { name: 'Italian', value: 750000, itemStyle: { color: CHART_COLOR_PALETTE[2] } },
              { name: 'Desserts', value: 450000, itemStyle: { color: CHART_COLOR_PALETTE[3] } },
              { name: 'Beverages', value: 320000, itemStyle: { color: CHART_COLOR_PALETTE[4] } },
            ]
          }
        ],
        label: {
          show: true,
          formatter: '{b}\n₱{c}',
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
      },
    ],
    tooltip: {
      formatter: (params: unknown) => {
        const data = params as { name: string; value: number };
        return `<b>${data.name}</b><br/>Revenue: ₱${data.value.toLocaleString()}`;
      },
    },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Advanced Charts Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sankey Diagram */}
        <DirectChart
          option={sankeyOption}
          config={{
            title: 'Order Flow Analysis',
            subtitle: 'Sankey diagram showing order progression',
            height: 400,
          }}
        />

        {/* Radar Chart */}
        <DirectChart
          option={radarOption}
          config={{
            title: 'Platform Performance Radar',
            subtitle: 'Multi-dimensional performance comparison',
            height: 400,
          }}
        />

        {/* Funnel Chart */}
        <DirectChart
          option={funnelOption}
          config={{
            title: 'Customer Journey Funnel',
            subtitle: 'Conversion rates through customer journey',
            height: 400,
          }}
        />

        {/* Tree Map */}
        <DirectChart
          option={treemapOption}
          config={{
            title: 'Revenue by Category',
            subtitle: 'Hierarchical view of revenue distribution',
            height: 400,
          }}
        />
      </div>

      {/* Implementation Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">ECharts Implementation Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">React ECharts Wrapper</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Easy integration with React components</li>
              <li>• Automatic cleanup and lifecycle management</li>
              <li>• Good for standard chart types</li>
              <li>• Simplified event handling</li>
              <li>• Used in Revenue & Order Analytics</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">Direct ECharts Implementation</h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li>• Maximum control and performance</li>
              <li>• Access to all ECharts features</li>
              <li>• Better for complex visualizations</li>
              <li>• Optimized for real-time updates</li>
              <li>• Used in Advanced & Real-time sections</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdvancedCharts;

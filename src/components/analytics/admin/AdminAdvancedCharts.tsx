/**
 * Advanced Admin Analytics Charts
 * Showcase complex ECharts visualizations for admin panel
 */

'use client';

import React, { useState, useCallback } from 'react';
import { DirectChart } from '../DirectECharts';
import { TAP2GO_COLORS, CHART_COLOR_PALETTE } from '../BaseChart';
import type { EChartsOption } from 'echarts';

interface AdminAdvancedChartsProps {
  className?: string;
}

const AdminAdvancedCharts: React.FC<AdminAdvancedChartsProps> = ({ className = '' }) => {
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

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
              { name: 'Filipino Cuisine', value: 450000, itemStyle: { color: CHART_COLOR_PALETTE[0] } },
              { name: 'Fast Food', value: 380000, itemStyle: { color: CHART_COLOR_PALETTE[1] } },
              { name: 'Asian Cuisine', value: 320000, itemStyle: { color: CHART_COLOR_PALETTE[2] } },
              { name: 'Western Food', value: 280000, itemStyle: { color: CHART_COLOR_PALETTE[3] } },
              { name: 'Desserts', value: 150000, itemStyle: { color: CHART_COLOR_PALETTE[4] } },
              { name: 'Beverages', value: 120000, itemStyle: { color: CHART_COLOR_PALETTE[5] } },
            ],
          },
        ],
        label: {
          show: true,
          formatter: '{b}\n₱{c}',
          fontSize: 12,
          fontWeight: 'bold',
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ₱{c}',
    },
  };

  const handleChartClick = useCallback((chartType: string) => {
    setSelectedChart(chartType);
  }, []);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced ECharts Visualizations</h2>
        <p className="text-gray-600">
          Complex chart types demonstrating the full power of ECharts for enterprise analytics
        </p>
      </div>

      {/* Chart Selection Info */}
      {selectedChart && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">Selected Chart: {selectedChart}</h3>
          <p className="text-sm text-orange-700">
            Click on different charts to see their implementation details and use cases.
          </p>
        </div>
      )}

      {/* Advanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sankey Diagram */}
        <div onClick={() => handleChartClick('Sankey Diagram')}>
          <DirectChart
            option={sankeyOption}
            config={{
              title: 'Order Flow Analysis (Sankey)',
              subtitle: 'Visualize order processing flow and drop-off points',
              height: 400,
            }}
          />
        </div>

        {/* Radar Chart */}
        <div onClick={() => handleChartClick('Radar Chart')}>
          <DirectChart
            option={radarOption}
            config={{
              title: 'Platform Performance Radar',
              subtitle: 'Multi-dimensional performance comparison',
              height: 400,
            }}
          />
        </div>

        {/* Funnel Chart */}
        <div onClick={() => handleChartClick('Funnel Chart')}>
          <DirectChart
            option={funnelOption}
            config={{
              title: 'Customer Journey Funnel',
              subtitle: 'Conversion rates through customer journey',
              height: 400,
            }}
          />
        </div>

        {/* Tree Map */}
        <div onClick={() => handleChartClick('Tree Map')}>
          <DirectChart
            option={treemapOption}
            config={{
              title: 'Revenue by Category (TreeMap)',
              subtitle: 'Hierarchical revenue visualization',
              height: 400,
            }}
          />
        </div>
      </div>

      {/* Chart Types Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Chart Types Explained</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Sankey Diagram</h4>
              <p className="text-sm text-gray-600">Perfect for visualizing flow processes, order journeys, and identifying bottlenecks in the system.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Radar Chart</h4>
              <p className="text-sm text-gray-600">Ideal for comparing multiple metrics simultaneously and showing performance across different dimensions.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Funnel Chart</h4>
              <p className="text-sm text-gray-600">Essential for conversion analysis, showing how users progress through different stages of the customer journey.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Tree Map</h4>
              <p className="text-sm text-gray-600">Excellent for hierarchical data visualization, showing proportional relationships in nested categories.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdvancedCharts;

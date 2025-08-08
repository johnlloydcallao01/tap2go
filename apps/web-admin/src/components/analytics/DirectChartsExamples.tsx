/**
 * Direct Charts Examples
 * Showcase of direct ECharts implementation examples
 */

'use client';


import React from 'react';
import { DirectChart } from './DirectECharts';
import { TAP2GO_COLORS } from './BaseChart';
import type { EChartsOption } from 'echarts';

interface DirectChartsExamplesProps {
  className?: string;
}

const DirectChartsExamples: React.FC<DirectChartsExamplesProps> = ({ className = '' }) => {
  // Gauge Chart - System Performance
  const gaugeOption: EChartsOption = {
    series: [
      {
        name: 'System Performance',
        type: 'gauge',
        progress: {
          show: true,
          width: 18,
        },
        axisLine: {
          lineStyle: {
            width: 18,
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          length: 15,
          lineStyle: {
            width: 2,
            color: '#999',
          },
        },
        axisLabel: {
          distance: 25,
          color: '#999',
          fontSize: 20,
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 25,
          itemStyle: {
            borderWidth: 10,
          },
        },
        title: {
          show: false,
        },
        detail: {
          valueAnimation: true,
          fontSize: 80,
          offsetCenter: [0, '70%'],
        },
        data: [
          {
            value: 87.5,
            name: 'Performance Score',
          },
        ],
      },
    ],
  };

  // Scatter Plot - Order Value vs Delivery Time
  const scatterOption: EChartsOption = {
    xAxis: {
      type: 'value',
      name: 'Order Value (₱)',
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    yAxis: {
      type: 'value',
      name: 'Delivery Time (min)',
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [
      {
        symbolSize: 20,
        data: Array.from({ length: 50 }, () => [
          Math.random() * 2000 + 200,
          Math.random() * 40 + 15,
        ]),
        type: 'scatter',
        itemStyle: {
          color: TAP2GO_COLORS.primary,
          opacity: 0.7,
        },
      },
    ],
    tooltip: {
      formatter: (params: unknown) => {
        const data = params as { data: [number, number] };
        return `Order Value: ₱${data.data[0].toFixed(0)}<br/>Delivery Time: ${data.data[1].toFixed(1)} min`;
      },
    },
  };

  // Candlestick Chart - Revenue Trends
  const candlestickData = Array.from({ length: 20 }, () => {
    const open = Math.random() * 50000 + 30000;
    const close = open + (Math.random() - 0.5) * 10000;
    const high = Math.max(open, close) + Math.random() * 5000;
    const low = Math.min(open, close) - Math.random() * 5000;
    return [open, close, low, high];
  });

  const candlestickOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: Array.from({ length: 20 }, (_, i) => `Day ${i + 1}`),
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
    series: [
      {
        type: 'candlestick',
        data: candlestickData,
        itemStyle: {
          color: TAP2GO_COLORS.success,
          color0: TAP2GO_COLORS.error,
          borderColor: TAP2GO_COLORS.success,
          borderColor0: TAP2GO_COLORS.error,
        },
      },
    ],
    tooltip: {
      formatter: (params: unknown) => {
        const data = params as { data: [number, number, number, number]; name: string };
        return `
          <b>${data.name}</b><br/>
          Open: ₱${data.data[0].toLocaleString()}<br/>
          Close: ₱${data.data[1].toLocaleString()}<br/>
          Low: ₱${data.data[2].toLocaleString()}<br/>
          High: ₱${data.data[3].toLocaleString()}
        `;
      },
    },
  };

  // Parallel Coordinates - Multi-dimensional Analysis
  const parallelOption: EChartsOption = {
    parallelAxis: [
      { dim: 0, name: 'Revenue', max: 100000 },
      { dim: 1, name: 'Orders', max: 1000 },
      { dim: 2, name: 'Rating', max: 5 },
      { dim: 3, name: 'Delivery Time', max: 60 },
      { dim: 4, name: 'Customer Satisfaction', max: 100 },
    ],
    series: {
      type: 'parallel',
      lineStyle: {
        width: 2,
        opacity: 0.7,
      },
      data: Array.from({ length: 20 }, () => [
        Math.random() * 100000,
        Math.random() * 1000,
        Math.random() * 2 + 3,
        Math.random() * 30 + 15,
        Math.random() * 40 + 60,
      ]),
    },
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Direct ECharts Examples</h3>
        <p className="text-gray-600 mb-6">
          Advanced chart types using direct ECharts implementation for maximum flexibility and performance.
        </p>

        {/* Direct Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gauge Chart */}
          <DirectChart
            option={gaugeOption}
            config={{
              title: 'System Performance Gauge',
              subtitle: 'Real-time performance monitoring',
              height: 350,
            }}
          />

          {/* Scatter Plot */}
          <DirectChart
            option={scatterOption}
            config={{
              title: 'Order Value vs Delivery Time',
              subtitle: 'Correlation analysis scatter plot',
              height: 350,
            }}
          />

          {/* Candlestick Chart */}
          <DirectChart
            option={candlestickOption}
            config={{
              title: 'Revenue Trends (Candlestick)',
              subtitle: 'Financial-style revenue analysis',
              height: 350,
            }}
          />

          {/* Parallel Coordinates */}
          <DirectChart
            option={parallelOption}
            config={{
              title: 'Multi-dimensional Analysis',
              subtitle: 'Parallel coordinates for complex data',
              height: 350,
            }}
          />
        </div>

        {/* Technical Notes */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Technical Implementation Notes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Direct ECharts Benefits:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Full access to ECharts API</li>
                <li>• Better performance for complex charts</li>
                <li>• Custom event handling</li>
                <li>• Advanced chart types support</li>
                <li>• Real-time data updates</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 mb-2">Use Cases:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time monitoring dashboards</li>
                <li>• Complex multi-dimensional data</li>
                <li>• Custom interactive features</li>
                <li>• High-performance requirements</li>
                <li>• Advanced chart customization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectChartsExamples;

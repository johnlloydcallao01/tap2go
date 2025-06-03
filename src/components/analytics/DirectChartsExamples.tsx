/**
 * Direct ECharts Examples
 * Showcase different chart types using direct ECharts implementation
 */

'use client';

import React, { useState, useCallback } from 'react';
import { DirectChart, RealTimeDirectChart } from './DirectECharts';
import { TAP2GO_COLORS } from './BaseChart';
import { ECharts } from './types';
import type { EChartsOption } from 'echarts';

interface DirectChartsExamplesProps {
  className?: string;
}

const DirectChartsExamples: React.FC<DirectChartsExamplesProps> = ({ className = '' }) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState<{
    type: string;
    month?: string;
    value?: number;
    status?: string;
    count?: number;
    percentage?: number;
  } | null>(null);

  // Revenue Trend Chart (Direct Implementation)
  const revenueOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#6b7280',
        formatter: (value: number) => `₱${value}K`,
      },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110],
      type: 'line',
      smooth: true,
      lineStyle: { color: TAP2GO_COLORS.primary, width: 4 },
      itemStyle: { color: TAP2GO_COLORS.primary },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(243, 168, 35, 0.8)' },
            { offset: 1, color: 'rgba(243, 168, 35, 0.1)' }
          ]
        }
      },
      markPoint: {
        data: [
          { type: 'max', name: 'Max' },
          { type: 'min', name: 'Min' }
        ]
      },
      markLine: {
        data: [
          { type: 'average', name: 'Avg' }
        ]
      }
    }],
    tooltip: {
      trigger: 'axis',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0];
        return `<b>${data.axisValue}</b><br/>Revenue: ₱${data.value}K`;
      },
    },
    animation: true,
    animationDuration: 2000,
  };

  // Order Distribution Pie Chart (Direct Implementation)
  const orderDistributionOption: EChartsOption = {
    series: [{
      type: 'pie',
      radius: ['30%', '70%'],
      center: ['50%', '50%'],
      data: [
        { value: 335, name: 'Delivered', itemStyle: { color: TAP2GO_COLORS.success } },
        { value: 310, name: 'In Progress', itemStyle: { color: TAP2GO_COLORS.warning } },
        { value: 234, name: 'Pending', itemStyle: { color: TAP2GO_COLORS.info } },
        { value: 135, name: 'Cancelled', itemStyle: { color: TAP2GO_COLORS.error } },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      label: {
        show: true,
        formatter: '{b}: {c} ({d}%)',
        fontSize: 12,
      },
      labelLine: {
        show: true,
        length: 15,
        length2: 10,
      },
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: () => Math.random() * 200,
    }],
    tooltip: {
      trigger: 'item',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        return `<b>${params.name}</b><br/>Orders: ${params.value}<br/>Percentage: ${params.percent}%`;
      },
    },
  };

  // Driver Performance Gauge (Direct Implementation)
  const driverPerformanceOption: EChartsOption = {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      center: ['50%', '75%'],
      radius: '90%',
      min: 0,
      max: 100,
      splitNumber: 10,
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.3, '#FF6E76'],
            [0.7, '#FDDD60'],
            [1, '#7CFFB2']
          ]
        }
      },
      pointer: {
        icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
        length: '12%',
        width: 20,
        offsetCenter: [0, '-60%'],
        itemStyle: {
          color: 'auto'
        }
      },
      axisTick: {
        length: 12,
        lineStyle: {
          color: 'auto',
          width: 2
        }
      },
      splitLine: {
        length: 20,
        lineStyle: {
          color: 'auto',
          width: 5
        }
      },
      axisLabel: {
        color: '#464646',
        fontSize: 20,
        distance: -60,
        rotate: 'tangential',
        formatter: function (value: number) {
          if (value === 87.5) return 'A+';
          if (value === 62.5) return 'B';
          if (value === 37.5) return 'C';
          if (value === 12.5) return 'D';
          return '';
        }
      },
      title: {
        offsetCenter: [0, '-10%'],
        fontSize: 20
      },
      detail: {
        fontSize: 30,
        offsetCenter: [0, '-35%'],
        valueAnimation: true,
        formatter: function (value: number) {
          return Math.round(value) + '%';
        },
        color: 'inherit'
      },
      data: [{
        value: 85,
        name: 'Performance Score'
      }],
      animation: true,
      animationDuration: 4000,
      animationEasing: 'cubicInOut'
    }]
  };

  // Handle chart interactions
  const handleRevenueChartReady = useCallback((chartInstance: ECharts) => {
    chartInstance.on('click', (params) => {
      setSelectedDataPoint({
        type: 'Revenue',
        month: params.name,
        value: Array.isArray(params.value) ? (params.value[0] as number) || 0 : (params.value as number) || 0,
      });
    });

    chartInstance.on('mouseover', (params) => {
      // Custom hover effects
      chartInstance.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: params.dataIndex
      });
    });
  }, []);

  const handlePieChartReady = useCallback((chartInstance: ECharts) => {
    chartInstance.on('click', (params) => {
      setSelectedDataPoint({
        type: 'Order Status',
        status: params.name,
        count: Array.isArray(params.value) ? (params.value[0] as number) || 0 : (params.value as number) || 0,
        percentage: params.percent,
      });
    });
  }, []);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Section Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Direct ECharts Implementation</h2>
        <p className="text-gray-600">
          Professional approach using ECharts directly for maximum control and performance
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium text-blue-700">No React Wrapper • Direct Control • Better Performance</span>
        </div>
      </div>

      {/* Interactive Data Display */}
      {selectedDataPoint && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 mb-2">Chart Interaction Data:</h3>
          <pre className="text-sm text-orange-700">
            {JSON.stringify(selectedDataPoint, null, 2)}
          </pre>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend with Advanced Features */}
        <DirectChart
          option={revenueOption}
          config={{
            title: 'Revenue Trend (Direct ECharts)',
            subtitle: 'Advanced features: Mark points, lines, animations',
            height: 400,
          }}
          onChartReady={handleRevenueChartReady}
        />

        {/* Order Distribution with Custom Animations */}
        <DirectChart
          option={orderDistributionOption}
          config={{
            title: 'Order Distribution (Direct ECharts)',
            subtitle: 'Custom animations and interactions',
            height: 400,
          }}
          onChartReady={handlePieChartReady}
        />

        {/* Driver Performance Gauge */}
        <DirectChart
          option={driverPerformanceOption}
          config={{
            title: 'Driver Performance Gauge',
            subtitle: 'Complex gauge chart with custom styling',
            height: 350,
          }}
        />

        {/* Real-time Chart */}
        <RealTimeDirectChart
          title="Real-time Orders"
          subtitle="Live data updates every 2 seconds"
        />
      </div>

      {/* Performance Benefits */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Direct ECharts Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-bold">⚡</span>
              </div>
              <h4 className="font-medium">Better Performance</h4>
            </div>
            <p className="text-sm text-gray-600">Direct control over chart lifecycle and memory management</p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold">🎛️</span>
              </div>
              <h4 className="font-medium">Full Control</h4>
            </div>
            <p className="text-sm text-gray-600">Access to all ECharts features and advanced customizations</p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 font-bold">🔄</span>
              </div>
              <h4 className="font-medium">Real-time Ready</h4>
            </div>
            <p className="text-sm text-gray-600">Optimized for live data updates and streaming</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectChartsExamples;

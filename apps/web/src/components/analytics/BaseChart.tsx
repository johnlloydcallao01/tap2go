/**
 * Base Chart Component for Tap2Go Analytics
 * Optimized ECharts wrapper with performance optimizations
 */

'use client';


import React, { memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ChartConfig, CallbackDataParams, ChartDataPoint } from './types';
import type { EChartsOption } from 'echarts';

// Dynamic import for better performance - only load when needed
const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  ),
});

interface BaseChartProps {
  option: EChartsOption;
  config?: ChartConfig;
  className?: string;
  onChartClick?: (params: CallbackDataParams) => void;
  onChartHover?: (params: CallbackDataParams) => void;
}

const BaseChart: React.FC<BaseChartProps> = memo(({
  option,
  config,
  className = '',
  onChartClick,
  onChartHover,
}) => {
  // Memoized chart option with Tap2Go theming
  const chartOption = useMemo(() => {
    const defaultOption: EChartsOption = {
      title: {
        text: config?.title || '',
        textStyle: {
          fontSize: 16,
          fontFamily: 'Inter, sans-serif',
          color: '#1f2937',
          fontWeight: 'bold',
        },
        left: 'center',
        top: 10,
      },
      grid: {
        left: '10%',
        right: '10%',
        top: config?.title ? '15%' : '10%',
        bottom: '15%',
        containLabel: true,
      },
      textStyle: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
        color: '#6b7280',
      },
      backgroundColor: 'transparent',
      legend: {
        show: config?.showLegend ?? true,
        bottom: 0,
        textStyle: {
          fontSize: 11,
          color: '#6b7280',
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1f2937',
        borderColor: '#374151',
        textStyle: {
          color: 'white',
          fontSize: 11,
        },
        borderRadius: 6,
        padding: [8, 12],
      },
      ...option,
    };

    return defaultOption;
  }, [config, option]);

  // Event handlers
  const handleEvents = useMemo(() => ({
    click: (params: CallbackDataParams) => {
      if (onChartClick) {
        onChartClick(params);
      }
    },
    mouseover: (params: CallbackDataParams) => {
      if (onChartHover) {
        onChartHover(params);
      }
    },
  }), [onChartClick, onChartHover]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      {config?.subtitle && (
        <p className="text-sm text-gray-600 mb-4">{config.subtitle}</p>
      )}
      <div style={{ height: config?.height || 400, width: '100%' }}>
        <ReactECharts
          option={chartOption}
          style={{ width: '100%', height: '100%' }}
          onEvents={handleEvents}
          opts={{
            renderer: 'canvas',
          }}
        />
      </div>
    </div>
  );
});

BaseChart.displayName = 'BaseChart';

export default BaseChart;

// Tap2Go brand colors for ECharts
export const TAP2GO_COLORS = {
  primary: '#f3a823',
  secondary: '#ef7b06',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  gray: '#6b7280',
};

export const CHART_COLOR_PALETTE = [
  TAP2GO_COLORS.primary,
  TAP2GO_COLORS.secondary,
  TAP2GO_COLORS.success,
  TAP2GO_COLORS.info,
  TAP2GO_COLORS.warning,
  TAP2GO_COLORS.error,
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#f97316',
];

// ECharts utility functions
export const createLineChartOption = (data: ChartDataPoint[]): EChartsOption => ({
  xAxis: {
    type: 'category',
    data: data.map(item => String(item.x)),
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
    data: data.map(item => item.y),
    type: 'line',
    smooth: true,
    lineStyle: { color: TAP2GO_COLORS.primary, width: 3 },
    itemStyle: { color: TAP2GO_COLORS.primary },
  }],
});

export const createBarChartOption = (data: ChartDataPoint[]): EChartsOption => ({
  xAxis: {
    type: 'category',
    data: data.map(item => String(item.x)),
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
    data: data.map(item => item.y),
    type: 'bar',
    itemStyle: { color: TAP2GO_COLORS.primary },
  }],
});

export const createPieChartOption = (data: { name: string; value: number }[]): EChartsOption => ({
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    data: data.map((item, index) => ({
      value: item.value,
      name: item.name,
      itemStyle: { color: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length] },
    })),
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
  }],
});

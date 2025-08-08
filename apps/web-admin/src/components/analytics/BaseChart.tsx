/**
 * Base Chart Component for Tap2Go Admin
 * Professional ECharts wrapper with consistent styling
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChartConfig, ECharts } from './types';
import type { EChartsOption } from 'echarts';

// Tap2Go Brand Colors
export const TAP2GO_COLORS = {
  primary: '#f3a823',    // Orange
  secondary: '#f97316',  // Orange variant
  success: '#10b981',    // Green
  warning: '#f59e0b',    // Amber
  error: '#ef4444',      // Red
  info: '#3b82f6',       // Blue
  dark: '#1f2937',       // Dark gray
  light: '#f9fafb',      // Light gray
};

// Chart Color Palette
export const CHART_COLOR_PALETTE = [
  TAP2GO_COLORS.primary,
  TAP2GO_COLORS.info,
  TAP2GO_COLORS.success,
  TAP2GO_COLORS.warning,
  TAP2GO_COLORS.error,
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
];

interface BaseChartProps {
  option: EChartsOption;
  config?: ChartConfig;
  className?: string;
  onChartReady?: (chartInstance: ECharts) => void;
}

const BaseChart: React.FC<BaseChartProps> = ({
  option,
  config,
  className = '',
  onChartReady,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !chartRef.current) return;

    let chartInstance: ECharts | null = null;

    const initChart = async () => {
      try {
        // Import ECharts
        const echarts = await import('echarts');

        if (!chartRef.current) return;

        // Create chart
        chartInstance = echarts.init(chartRef.current);

        // Merge with default options
        const defaultOption: EChartsOption = {
          backgroundColor: 'transparent',
          textStyle: {
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#374151',
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: 'transparent',
            textStyle: {
              color: '#ffffff',
            },
            ...option.tooltip,
          },
          legend: {
            textStyle: {
              color: '#6b7280',
            },
            ...option.legend,
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: config?.showLegend ? '15%' : '3%',
            containLabel: true,
            ...option.grid,
          },
        };

        const mergedOption = {
          ...defaultOption,
          ...option,
        };

        // Set option
        if (chartInstance) {
          chartInstance.setOption(mergedOption);
        }

        // Handle resize
        const handleResize = () => {
          if (chartInstance) {
            chartInstance.resize();
          }
        };

        window.addEventListener('resize', handleResize);

        // Call ready callback
        if (onChartReady && chartInstance) {
          onChartReady(chartInstance);
        }

        return () => {
          window.removeEventListener('resize', handleResize);
          if (chartInstance) {
            chartInstance.dispose();
          }
        };
      } catch (error) {
        console.error('Failed to initialize ECharts:', error);
      }
    };

    const cleanup = initChart();

    return () => {
      if (cleanup) {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
  }, [isClient, option, config?.showLegend, onChartReady]);

  if (!isClient) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        {config?.title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{config.title}</h3>
        )}
        {config?.subtitle && (
          <p className="text-sm text-gray-600 mb-4 text-center">{config.subtitle}</p>
        )}
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-gray-600">Loading chart...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      {config?.title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{config.title}</h3>
      )}
      {config?.subtitle && (
        <p className="text-sm text-gray-600 mb-4 text-center">{config.subtitle}</p>
      )}

      <div
        ref={chartRef}
        style={{
          height: config?.height || 400,
          width: '100%',
        }}
      />
    </div>
  );
};

export default BaseChart;

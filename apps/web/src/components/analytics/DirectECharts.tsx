/**
 * Direct ECharts Implementation
 * Professional approach using ECharts directly without React wrapper
 */

'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChartConfig, ECharts } from './types';
import { TAP2GO_COLORS } from './BaseChart';
import type { EChartsOption } from 'echarts';

// Simple working Direct Chart Component
interface DirectChartProps {
  option: EChartsOption;
  config?: ChartConfig;
  className?: string;
  onChartReady?: (chartInstance: ECharts) => void;
}

export const DirectChart: React.FC<DirectChartProps> = ({
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

        // Set option
        if (chartInstance) {
          chartInstance.setOption(option);
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
  }, [isClient, option, onChartReady]);

  if (!isClient) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        {config?.subtitle && (
          <p className="text-sm text-gray-600 mb-4">{config.subtitle}</p>
        )}
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="ml-2 text-gray-600">Loading direct ECharts...</span>
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

// Real-time Chart Component
export const RealTimeDirectChart: React.FC<{
  title: string;
  subtitle?: string;
  className?: string;
}> = ({ title, subtitle, className = '' }) => {
  const [data, setData] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();
      const value = Math.floor(Math.random() * 100) + 50;

      setData(prev => [...prev.slice(-19), value]);
      setTimestamps(prev => [...prev.slice(-19), timeStr]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const option: EChartsOption = {
    xAxis: {
      type: 'category',
      data: timestamps,
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
      data: data,
      type: 'line',
      smooth: true,
      lineStyle: { color: TAP2GO_COLORS.primary, width: 3 },
      itemStyle: { color: TAP2GO_COLORS.primary },
      areaStyle: { color: 'rgba(243, 168, 35, 0.3)' },
    }],
    tooltip: {
      trigger: 'axis',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0];
        return `<b>${data.axisValue}</b><br/>Orders: ${data.value}`;
      },
    },
  };

  return (
    <DirectChart
      option={option}
      config={{ title, subtitle, height: 350 }}
      className={className}
    />
  );
};

export default DirectChart;

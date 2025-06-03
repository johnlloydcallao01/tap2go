/**
 * Base Chart Component for Tap2Go Analytics
 * Optimized Plotly.js wrapper with performance optimizations
 */

'use client';

import React, { memo, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ChartConfig } from './types';
import type { PlotParams } from 'react-plotly.js';
import type { PlotMouseEvent, PlotHoverEvent } from 'plotly.js';

// Dynamic import for better performance - only load when needed
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  ),
}) as React.ComponentType<PlotParams>;

interface BaseChartProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  config?: ChartConfig;
  className?: string;
  onChartClick?: (event: Readonly<PlotMouseEvent>) => void;
  onChartHover?: (event: Readonly<PlotHoverEvent>) => void;
}

const BaseChart: React.FC<BaseChartProps> = memo(({
  data,
  layout = {},
  config,
  className = '',
  onChartClick,
  onChartHover,
}) => {
  // Memoized layout configuration for performance
  const chartLayout = useMemo(() => {
    const defaultLayout: Partial<Plotly.Layout> = {
      title: {
        text: config?.title || '',
        font: {
          size: 16,
          family: 'Inter, sans-serif',
          color: '#1f2937',
        },
      },
      font: {
        family: 'Inter, sans-serif',
        size: 12,
        color: '#6b7280',
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: {
        l: 50,
        r: 30,
        t: config?.title ? 60 : 30,
        b: 50,
      },
      showlegend: config?.showLegend ?? true,
      legend: {
        orientation: 'h',
        x: 0,
        y: -0.2,
        font: {
          size: 11,
        },
      },
      xaxis: {
        title: {
          text: config?.xAxisTitle || '',
          font: {
            size: 12,
            color: '#6b7280',
          },
        },
        gridcolor: '#f3f4f6',
        linecolor: '#e5e7eb',
        tickfont: {
          size: 10,
          color: '#6b7280',
        },
      },
      yaxis: {
        title: {
          text: config?.yAxisTitle || '',
          font: {
            size: 12,
            color: '#6b7280',
          },
        },
        gridcolor: '#f3f4f6',
        linecolor: '#e5e7eb',
        tickfont: {
          size: 10,
          color: '#6b7280',
        },
      },
      hovermode: 'closest',
      hoverlabel: {
        bgcolor: '#1f2937',
        bordercolor: '#374151',
        font: {
          color: 'white',
          size: 11,
        },
      },
      ...layout,
    };

    return defaultLayout;
  }, [config, layout]);

  // Memoized plot configuration
  const plotConfig = useMemo((): Partial<Plotly.Config> => ({
    displayModeBar: true,
    modeBarButtonsToRemove: [
      'pan2d' as Plotly.ModeBarDefaultButtons,
      'lasso2d' as Plotly.ModeBarDefaultButtons,
      'select2d' as Plotly.ModeBarDefaultButtons,
      'autoScale2d' as Plotly.ModeBarDefaultButtons,
      'hoverClosestCartesian' as Plotly.ModeBarDefaultButtons,
      'hoverCompareCartesian' as Plotly.ModeBarDefaultButtons,
      'toggleSpikelines' as Plotly.ModeBarDefaultButtons,
    ],
    displaylogo: false,
    responsive: config?.responsive ?? true,
    toImageButtonOptions: {
      format: 'png' as const,
      filename: config?.title?.replace(/\s+/g, '_').toLowerCase() || 'chart',
      height: config?.height || 400,
      width: config?.width || 800,
      scale: 2,
    },
  }), [config]);

  // Event handlers
  const handleClick = (event: Readonly<PlotMouseEvent>) => {
    if (onChartClick) {
      onChartClick(event);
    }
  };

  const handleHover = (event: Readonly<PlotHoverEvent>) => {
    if (onChartHover) {
      onChartHover(event);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      {config?.subtitle && (
        <p className="text-sm text-gray-600 mb-4">{config.subtitle}</p>
      )}
      <div style={{ height: config?.height || 400, width: '100%' }}>
        <Plot
          data={data}
          layout={chartLayout}
          config={plotConfig}
          style={{ width: '100%', height: '100%' }}
          onClick={handleClick}
          onHover={handleHover}
          useResizeHandler={true}
        />
      </div>
    </div>
  );
});

BaseChart.displayName = 'BaseChart';

export default BaseChart;

// Chart color palettes for consistent theming
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

// Common chart configurations
export const CHART_CONFIGS = {
  revenue: {
    title: 'Revenue Analytics',
    colors: [TAP2GO_COLORS.primary, TAP2GO_COLORS.success],
    height: 400,
  },
  orders: {
    title: 'Order Analytics',
    colors: [TAP2GO_COLORS.info, TAP2GO_COLORS.secondary],
    height: 350,
  },
  performance: {
    title: 'Performance Metrics',
    colors: CHART_COLOR_PALETTE,
    height: 300,
  },
  geographic: {
    title: 'Geographic Analysis',
    height: 500,
  },
};

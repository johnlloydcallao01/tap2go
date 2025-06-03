/**
 * Driver Earnings Analytics Charts
 * Earnings tracking and performance analysis for driver panel
 */

'use client';

import React from 'react';
import BaseChart, { TAP2GO_COLORS } from '../BaseChart';
import { DriverEarningsAnalytics, DriverDeliveryAnalytics } from '../types';
import type { EChartsOption } from 'echarts';

interface DriverEarningsChartsProps {
  earningsData: DriverEarningsAnalytics;
  deliveryData: DriverDeliveryAnalytics;
  className?: string;
}

const DriverEarningsCharts: React.FC<DriverEarningsChartsProps> = ({ 
  earningsData, 
  deliveryData, 
  className = '' 
}) => {
  // Daily Earnings Line Chart
  const dailyEarningsOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: earningsData.dailyEarnings.map(item => item.date),
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
    series: [{
      data: earningsData.dailyEarnings.map(item => item.value),
      type: 'line',
      smooth: true,
      lineStyle: { color: TAP2GO_COLORS.success, width: 3 },
      itemStyle: { color: TAP2GO_COLORS.success },
      symbol: 'circle',
      symbolSize: 6,
    }],
    tooltip: {
      trigger: 'axis',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0];
        return `<b>${data.axisValue}</b><br/>Earnings: ₱${data.value.toLocaleString()}`;
      },
    },
  };

  // Earnings Breakdown Pie Chart
  const earningsBreakdownOption: EChartsOption = {
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        {
          value: earningsData.earningsBreakdown.basePay,
          name: 'Base Pay',
          itemStyle: { color: TAP2GO_COLORS.primary },
        },
        {
          value: earningsData.earningsBreakdown.tips,
          name: 'Tips',
          itemStyle: { color: TAP2GO_COLORS.success },
        },
        {
          value: earningsData.earningsBreakdown.bonuses,
          name: 'Bonuses',
          itemStyle: { color: TAP2GO_COLORS.warning },
        },
        {
          value: earningsData.earningsBreakdown.incentives,
          name: 'Incentives',
          itemStyle: { color: TAP2GO_COLORS.info },
        },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      label: {
        show: true,
        formatter: '{b}: {d}%',
      },
    }],
    tooltip: {
      trigger: 'item',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        return `<b>${params.name}</b><br/>Amount: ₱${params.value.toLocaleString()}<br/>Percentage: ${params.percent}%`;
      },
    },
  };

  // Performance Gauge Chart
  const performanceGaugeOption: EChartsOption = {
    series: [{
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      center: ['50%', '75%'],
      radius: '90%',
      min: 0,
      max: 5,
      splitNumber: 5,
      axisLine: {
        lineStyle: {
          width: 6,
          color: [
            [0.25, '#FF6E76'],
            [0.5, '#FDDD60'],
            [0.75, '#58D9F9'],
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
          if (value === 5) return 'Excellent';
          if (value === 4) return 'Good';
          if (value === 3) return 'Average';
          if (value === 2) return 'Poor';
          if (value === 1) return 'Bad';
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
          return (Math.round(value * 100) / 100).toString();
        },
        color: 'inherit'
      },
      data: [{
        value: deliveryData.performanceRating,
        name: 'Performance Rating'
      }]
    }]
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Earnings</h3>
          <p className="text-2xl font-bold">₱{earningsData.totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Deliveries</h3>
          <p className="text-2xl font-bold">{deliveryData.deliveryMetrics.totalDeliveries}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Avg per Delivery</h3>
          <p className="text-2xl font-bold">₱{earningsData.averageEarningsPerDelivery.toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Rating</h3>
          <p className="text-2xl font-bold">{deliveryData.performanceRating.toFixed(1)}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Earnings Trend */}
        <BaseChart
          option={dailyEarningsOption}
          config={{
            title: 'Daily Earnings Trend',
            subtitle: 'Track your earnings over time',
            height: 400,
          }}
        />

        {/* Earnings Breakdown */}
        <BaseChart
          option={earningsBreakdownOption}
          config={{
            title: 'Earnings Breakdown',
            subtitle: 'Sources of your income',
            showLegend: true,
            height: 400,
          }}
        />

        {/* Performance Rating Gauge */}
        <div className="lg:col-span-2">
          <BaseChart
            option={performanceGaugeOption}
            config={{
              title: 'Performance Rating',
              subtitle: 'Your current performance score',
              height: 300,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DriverEarningsCharts;

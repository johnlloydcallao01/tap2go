/**
 * Customer Order Analytics Charts
 * Order tracking and spending analysis for customer interface
 */

'use client';

import React from 'react';
import BaseChart, { TAP2GO_COLORS, CHART_COLOR_PALETTE } from '../BaseChart';
import { CustomerOrderHistory, CustomerSpendingAnalytics, CustomerPreferences } from '../types';
import type { EChartsOption } from 'echarts';

interface CustomerOrderChartsProps {
  orderHistory: CustomerOrderHistory;
  spendingData: CustomerSpendingAnalytics;
  preferences: CustomerPreferences;
  className?: string;
}

const CustomerOrderCharts: React.FC<CustomerOrderChartsProps> = ({ 
  orderHistory, 
  spendingData, 
  preferences, 
  className = '' 
}) => {
  // Order Pattern Timeline
  const orderPatternsOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: orderHistory.orderPatterns.map(item => item.date),
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
      data: orderHistory.orderPatterns.map(item => item.value),
      type: 'line',
      smooth: true,
      lineStyle: { color: TAP2GO_COLORS.primary, width: 2 },
      itemStyle: { color: TAP2GO_COLORS.primary },
      symbol: 'circle',
      symbolSize: 4,
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

  // Monthly Spending Trend
  const monthlySpendingOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: spendingData.monthlySpending.map(item => item.date),
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
      data: spendingData.monthlySpending.map(item => item.value),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: 'rgba(16, 185, 129, 0.1)',
      },
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
        return `<b>${data.axisValue}</b><br/>Spent: ₱${data.value.toLocaleString()}`;
      },
    },
  };

  // Spending Breakdown Pie Chart
  const spendingBreakdownOption: EChartsOption = {
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        {
          value: spendingData.spendingBreakdown.food,
          name: 'Food',
          itemStyle: { color: TAP2GO_COLORS.primary },
        },
        {
          value: spendingData.spendingBreakdown.deliveryFees,
          name: 'Delivery Fees',
          itemStyle: { color: TAP2GO_COLORS.info },
        },
        {
          value: spendingData.spendingBreakdown.tips,
          name: 'Tips',
          itemStyle: { color: TAP2GO_COLORS.success },
        },
        {
          value: spendingData.spendingBreakdown.taxes,
          name: 'Taxes',
          itemStyle: { color: TAP2GO_COLORS.warning },
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

  // Favorite Restaurants Bar Chart
  const favoriteRestaurantsOption: EChartsOption = {
    xAxis: {
      type: 'value',
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    yAxis: {
      type: 'category',
      data: orderHistory.favoriteRestaurants.slice(0, 5).map(item => item.restaurantName),
      axisLabel: { color: '#6b7280' },
      axisLine: { lineStyle: { color: '#e5e7eb' } },
    },
    series: [{
      data: orderHistory.favoriteRestaurants.slice(0, 5).map((item, index) => ({
        value: item.orderCount,
        itemStyle: { color: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length] },
      })),
      type: 'bar',
      label: {
        show: true,
        position: 'right',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => `${params.value} orders`,
      },
    }],
    tooltip: {
      trigger: 'axis',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const data = params[0];
        const restaurant = orderHistory.favoriteRestaurants.slice(0, 5)[data.dataIndex];
        return `<b>${data.axisValue}</b><br/>Orders: ${data.value}<br/>Total Spent: ₱${restaurant.totalSpent.toLocaleString()}`;
      },
    },
  };

  // Cuisine Preferences Donut Chart
  const cuisinePreferencesOption: EChartsOption = {
    series: [{
      type: 'pie',
      radius: ['50%', '80%'],
      data: preferences.cuisinePreferences.map((item, index) => ({
        value: item.orderCount,
        name: item.cuisine,
        itemStyle: { color: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length] },
      })),
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
        return `<b>${params.name}</b><br/>Orders: ${params.value}<br/>Percentage: ${params.percent}%`;
      },
    },
  };

  // Order Time Preferences
  const timePreferencesOption: EChartsOption = {
    xAxis: {
      type: 'category',
      data: preferences.timePreferences.map(item => `${item.x}:00`),
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
      data: preferences.timePreferences.map(item => ({
        value: item.y,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: TAP2GO_COLORS.primary },
              { offset: 1, color: TAP2GO_COLORS.warning }
            ]
          }
        }
      })),
      type: 'bar',
      label: {
        show: true,
        position: 'top',
      },
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
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Spent</h3>
          <p className="text-2xl font-bold">₱{spendingData.totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Orders</h3>
          <p className="text-2xl font-bold">{orderHistory.orderHistory.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Avg Order Value</h3>
          <p className="text-2xl font-bold">₱{spendingData.averageOrderValue.toFixed(0)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90">Savings</h3>
          <p className="text-2xl font-bold">₱{spendingData.savingsFromPromotions.toLocaleString()}</p>
          <p className="text-xs opacity-75">From promotions</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Patterns */}
        <BaseChart
          option={orderPatternsOption}
          config={{
            title: 'Your Order History',
            subtitle: 'Track your ordering patterns over time',
            height: 350,
          }}
        />

        {/* Monthly Spending */}
        <BaseChart
          option={monthlySpendingOption}
          config={{
            title: 'Monthly Spending Trend',
            subtitle: 'Your spending patterns over time',
            height: 350,
          }}
        />

        {/* Spending Breakdown */}
        <BaseChart
          option={spendingBreakdownOption}
          config={{
            title: 'Spending Breakdown',
            subtitle: 'Where your money goes',
            showLegend: true,
            height: 350,
          }}
        />

        {/* Favorite Restaurants */}
        <BaseChart
          option={favoriteRestaurantsOption}
          config={{
            title: 'Your Favorite Restaurants',
            subtitle: 'Most ordered restaurants',
            height: 350,
          }}
        />

        {/* Cuisine Preferences */}
        <BaseChart
          option={cuisinePreferencesOption}
          config={{
            title: 'Cuisine Preferences',
            subtitle: 'Your favorite types of food',
            showLegend: true,
            height: 350,
          }}
        />

        {/* Order Time Preferences */}
        <BaseChart
          option={timePreferencesOption}
          config={{
            title: 'Preferred Order Times',
            subtitle: 'When you usually order food',
            height: 350,
          }}
        />
      </div>

      {/* Order Progress Tracker */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Order Status</h3>
        <div className="space-y-4">
          {orderHistory.orderHistory.slice(0, 3).map((order) => (
            <div key={order.orderId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {order.status === 'delivered' ? '✓' : 
                     order.status === 'cancelled' ? '✗' : '⏳'}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.restaurantName}</p>
                  <p className="text-sm text-gray-500">Order #{order.orderId.slice(-6)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">₱{order.totalAmount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">{order.orderDate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Food Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Favorite Cuisine</p>
                <p className="text-lg font-bold text-orange-600">
                  {preferences.cuisinePreferences[0]?.cuisine || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Peak Order Time</p>
                <p className="text-lg font-bold text-blue-600">
                  {String(preferences.timePreferences.reduce((max, item) => item.y > max.y ? item : max, preferences.timePreferences[0])?.x || 'N/A')}:00
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Money Saved</p>
                <p className="text-lg font-bold text-green-600">₱{spendingData.savingsFromPromotions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderCharts;

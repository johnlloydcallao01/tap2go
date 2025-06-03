/**
 * Customer Order Analytics Charts
 * Order tracking and spending analysis for customer interface
 */

'use client';

import React from 'react';
import BaseChart, { TAP2GO_COLORS, CHART_COLOR_PALETTE } from '../BaseChart';
import { CustomerOrderHistory, CustomerSpendingAnalytics, CustomerPreferences } from '../types';

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
  const orderPatternsData: Plotly.Data[] = [
    {
      x: orderHistory.orderPatterns.map(item => item.date),
      y: orderHistory.orderPatterns.map(item => item.value),
      type: 'scatter' as const,
      mode: 'lines+markers',
      name: 'Orders',
      line: {
        color: TAP2GO_COLORS.primary,
        width: 2,
      },
      marker: {
        color: TAP2GO_COLORS.primary,
        size: 4,
      },
      hovertemplate: '<b>%{x}</b><br>Orders: %{y}<extra></extra>',
    },
  ];

  // Monthly Spending Trend
  const monthlySpendingData: Plotly.Data[] = [
    {
      x: spendingData.monthlySpending.map(item => item.date),
      y: spendingData.monthlySpending.map(item => item.value),
      type: 'scatter' as const,
      mode: 'lines+markers',
      name: 'Monthly Spending',
      line: {
        color: TAP2GO_COLORS.success,
        width: 3,
      },
      marker: {
        color: TAP2GO_COLORS.success,
        size: 6,
      },
      fill: 'tonexty',
      fillcolor: 'rgba(16, 185, 129, 0.1)',
      hovertemplate: '<b>%{x}</b><br>Spent: ₱%{y:,.2f}<extra></extra>',
    },
  ];

  // Spending Breakdown Pie Chart
  const spendingBreakdownData: Plotly.Data[] = [
    {
      values: [
        spendingData.spendingBreakdown.food,
        spendingData.spendingBreakdown.deliveryFees,
        spendingData.spendingBreakdown.tips,
        spendingData.spendingBreakdown.taxes,
      ],
      labels: ['Food', 'Delivery Fees', 'Tips', 'Taxes'],
      type: 'pie' as const,
      hole: 0.4,
      marker: {
        colors: [TAP2GO_COLORS.primary, TAP2GO_COLORS.info, TAP2GO_COLORS.success, TAP2GO_COLORS.warning],
      },
      textinfo: 'label+percent',
      textposition: 'outside',
      hovertemplate: '<b>%{label}</b><br>Amount: ₱%{value:,.2f}<br>Percentage: %{percent}<extra></extra>',
    },
  ];

  // Favorite Restaurants Bar Chart
  const favoriteRestaurantsData: Plotly.Data[] = [
    {
      x: orderHistory.favoriteRestaurants.slice(0, 5).map(item => item.orderCount),
      y: orderHistory.favoriteRestaurants.slice(0, 5).map(item => item.restaurantName),
      type: 'bar' as const,
      orientation: 'h',
      marker: {
        color: CHART_COLOR_PALETTE.slice(0, 5),
      },
      text: orderHistory.favoriteRestaurants.slice(0, 5).map(item => `${item.orderCount} orders`),
      textposition: 'auto',
      hovertemplate: '<b>%{y}</b><br>Orders: %{x}<br>Total Spent: ₱%{customdata:,.2f}<extra></extra>',
      customdata: orderHistory.favoriteRestaurants.slice(0, 5).map(item => item.totalSpent),
    },
  ];

  // Cuisine Preferences Donut Chart
  const cuisinePreferencesData: Plotly.Data[] = [
    {
      values: preferences.cuisinePreferences.map(item => item.orderCount),
      labels: preferences.cuisinePreferences.map(item => item.cuisine),
      type: 'pie' as const,
      hole: 0.6,
      marker: {
        colors: CHART_COLOR_PALETTE,
      },
      textinfo: 'label+percent',
      textposition: 'outside',
      hovertemplate: '<b>%{label}</b><br>Orders: %{value}<br>Percentage: %{percent}<extra></extra>',
    },
  ];

  // Order Time Preferences
  const timePreferencesData: Plotly.Data[] = [
    {
      x: preferences.timePreferences.map(item => item.x),
      y: preferences.timePreferences.map(item => item.y),
      type: 'bar' as const,
      marker: {
        color: preferences.timePreferences.map(item => item.y),
        colorscale: [
          [0, '#fef3c7'],
          [0.5, TAP2GO_COLORS.warning],
          [1, TAP2GO_COLORS.primary],
        ],
        showscale: true,
        colorbar: {
          title: 'Orders',
          titleside: 'right',
        },
      },
      text: preferences.timePreferences.map(item => item.y.toString()),
      textposition: 'auto',
      hovertemplate: '<b>%{x}:00</b><br>Orders: %{y}<extra></extra>',
    },
  ];

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
          data={orderPatternsData}
          config={{
            title: 'Your Order History',
            subtitle: 'Track your ordering patterns over time',
            xAxisTitle: 'Date',
            yAxisTitle: 'Number of Orders',
            height: 350,
          }}
        />

        {/* Monthly Spending */}
        <BaseChart
          data={monthlySpendingData}
          config={{
            title: 'Monthly Spending Trend',
            subtitle: 'Your spending patterns over time',
            xAxisTitle: 'Month',
            yAxisTitle: 'Amount Spent (₱)',
            height: 350,
          }}
          layout={{
            yaxis: {
              tickformat: '₱,.0f',
            },
          }}
        />

        {/* Spending Breakdown */}
        <BaseChart
          data={spendingBreakdownData}
          config={{
            title: 'Spending Breakdown',
            subtitle: 'Where your money goes',
            showLegend: true,
            height: 350,
          }}
        />

        {/* Favorite Restaurants */}
        <BaseChart
          data={favoriteRestaurantsData}
          config={{
            title: 'Your Favorite Restaurants',
            subtitle: 'Most ordered restaurants',
            xAxisTitle: 'Number of Orders',
            yAxisTitle: 'Restaurant',
            height: 350,
          }}
          layout={{
            margin: {
              l: 120,
              r: 30,
              t: 60,
              b: 50,
            },
          }}
        />

        {/* Cuisine Preferences */}
        <BaseChart
          data={cuisinePreferencesData}
          config={{
            title: 'Cuisine Preferences',
            subtitle: 'Your favorite types of food',
            showLegend: true,
            height: 350,
          }}
        />

        {/* Order Time Preferences */}
        <BaseChart
          data={timePreferencesData}
          config={{
            title: 'Preferred Order Times',
            subtitle: 'When you usually order food',
            xAxisTitle: 'Hour of Day',
            yAxisTitle: 'Number of Orders',
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

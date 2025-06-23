'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import {
  ChartBarIcon,
  TruckIcon,
  ClockIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

export default function DriverAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  const [analytics] = useState({
    performance: {
      deliveryRate: 98.5,
      onTimeRate: 94.2,
      customerRating: 4.8,
      acceptanceRate: 89.3,
    },
    earnings: {
      hourlyAverage: 21.50,
      dailyAverage: 127.80,
      weeklyAverage: 894.60,
      monthlyAverage: 3578.40,
    },
    productivity: {
      deliveriesPerHour: 2.3,
      averageDeliveryTime: 18.5,
      peakHours: ['12:00-14:00', '18:00-21:00'],
      bestDays: ['Friday', 'Saturday', 'Sunday'],
    },
    trends: {
      earningsChange: 12.5,
      deliveriesChange: 8.3,
      ratingChange: 0.2,
      efficiencyChange: -2.1,
    }
  });

  const [weeklyData] = useState([
    { day: 'Mon', deliveries: 8, earnings: 112.50, hours: 6.5 },
    { day: 'Tue', deliveries: 12, earnings: 156.75, hours: 8.0 },
    { day: 'Wed', deliveries: 10, earnings: 142.30, hours: 7.0 },
    { day: 'Thu', deliveries: 15, earnings: 198.45, hours: 9.5 },
    { day: 'Fri', deliveries: 18, earnings: 234.60, hours: 10.0 },
    { day: 'Sat', deliveries: 22, earnings: 287.80, hours: 11.5 },
    { day: 'Sun', deliveries: 16, earnings: 208.90, hours: 9.0 },
  ]);

  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    } else if (change < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Analytics</h1>
          <p className="text-gray-600">Track your performance and identify improvement opportunities.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <TruckIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(analytics.trends.deliveriesChange)}
              <span className={`text-sm font-medium ${getTrendColor(analytics.trends.deliveriesChange)}`}>
                {analytics.trends.deliveriesChange > 0 ? '+' : ''}{analytics.trends.deliveriesChange}%
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.performance.deliveryRate}%</p>
          <p className="text-sm text-gray-500">Delivery Success Rate</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(analytics.trends.efficiencyChange)}
              <span className={`text-sm font-medium ${getTrendColor(analytics.trends.efficiencyChange)}`}>
                {analytics.trends.efficiencyChange > 0 ? '+' : ''}{analytics.trends.efficiencyChange}%
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.performance.onTimeRate}%</p>
          <p className="text-sm text-gray-500">On-Time Delivery</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <StarIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(analytics.trends.ratingChange)}
              <span className={`text-sm font-medium ${getTrendColor(analytics.trends.ratingChange)}`}>
                {analytics.trends.ratingChange > 0 ? '+' : ''}{analytics.trends.ratingChange}
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.performance.customerRating}</p>
          <p className="text-sm text-gray-500">Customer Rating</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(analytics.trends.earningsChange)}
              <span className={`text-sm font-medium ${getTrendColor(analytics.trends.earningsChange)}`}>
                {analytics.trends.earningsChange > 0 ? '+' : ''}{analytics.trends.earningsChange}%
              </span>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">${analytics.earnings.hourlyAverage}</p>
          <p className="text-sm text-gray-500">Hourly Average</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Performance</h3>
          <div className="space-y-4">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 w-8">{day.day}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(day.deliveries / 25) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{day.deliveries} deliveries</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${day.earnings.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{day.hours}h worked</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Deliveries per Hour</p>
                <p className="text-sm text-blue-700">Your efficiency rate</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">{analytics.productivity.deliveriesPerHour}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">Avg Delivery Time</p>
                <p className="text-sm text-green-700">Time per delivery</p>
              </div>
              <span className="text-2xl font-bold text-green-600">{analytics.productivity.averageDeliveryTime}m</span>
            </div>

            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="font-medium text-orange-900 mb-2">Peak Hours</p>
              <div className="flex flex-wrap gap-2">
                {analytics.productivity.peakHours.map((hour, index) => (
                  <span key={index} className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">
                    {hour}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="font-medium text-purple-900 mb-2">Best Days</p>
              <div className="flex flex-wrap gap-2">
                {analytics.productivity.bestDays.map((day, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full">
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.performance.acceptanceRate}%</p>
            <p className="text-sm text-gray-500">Order Acceptance Rate</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">${analytics.earnings.dailyAverage}</p>
            <p className="text-sm text-gray-500">Daily Average Earnings</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TruckIcon className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">${analytics.earnings.weeklyAverage}</p>
            <p className="text-sm text-gray-500">Weekly Average Earnings</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">${analytics.earnings.monthlyAverage}</p>
            <p className="text-sm text-gray-500">Monthly Average Earnings</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Performance Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🕐 Optimize Your Schedule</h4>
            <p className="text-sm text-gray-600">
              Work during peak hours (12-2 PM, 6-9 PM) to maximize earnings. Your best days are Friday-Sunday.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">⚡ Improve Efficiency</h4>
            <p className="text-sm text-gray-600">
              Your delivery time is slightly above average. Consider optimizing routes to reduce delivery time.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">⭐ Maintain Quality</h4>
            <p className="text-sm text-gray-600">
              Great job maintaining a 4.8 rating! Keep providing excellent customer service.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📈 Growth Opportunity</h4>
            <p className="text-sm text-gray-600">
              Consider increasing your acceptance rate to 95%+ to unlock bonus incentives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

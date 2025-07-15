'use client';

import React, { useState } from 'react';
import {
  ArrowTrendingUpIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TruckIcon,
  StarIcon,
  ChartBarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export default function Analytics() {
  const [period, setPeriod] = useState('week');
  const [chartType, setChartType] = useState('earnings');

  // Mock data for charts
  const earningsData = {
    week: [65, 78, 52, 91, 43, 87, 53],
    month: [65, 78, 52, 91, 43, 87, 53, 42, 65, 78, 52, 91, 43, 87, 53, 42, 65, 78, 52, 91, 43, 87, 53, 42, 65, 78, 52, 91, 43, 87],
    year: [420, 380, 450, 520, 490, 550, 580, 620, 480, 510, 540, 590],
  };

  const deliveriesData = {
    week: [5, 7, 4, 8, 3, 6, 5],
    month: [5, 7, 4, 8, 3, 6, 5, 4, 5, 7, 4, 8, 3, 6, 5, 4, 5, 7, 4, 8, 3, 6, 5, 4, 5, 7, 4, 8, 3, 6],
    year: [25, 22, 28, 32, 30, 35, 38, 40, 28, 32, 36, 42],
  };

  const hoursData = {
    week: [4, 6, 3, 7, 4, 5, 4],
    month: [4, 6, 3, 7, 4, 5, 4, 3, 4, 6, 3, 7, 4, 5, 4, 3, 4, 6, 3, 7, 4, 5, 4, 3, 4, 6, 3, 7, 4, 5],
    year: [20, 18, 22, 25, 24, 28, 30, 32, 22, 26, 28, 34],
  };

  const distanceData = {
    week: [25, 32, 18, 40, 22, 35, 28],
    month: [25, 32, 18, 40, 22, 35, 28, 20, 25, 32, 18, 40, 22, 35, 28, 20, 25, 32, 18, 40, 22, 35, 28, 20, 25, 32, 18, 40, 22, 35],
    year: [120, 110, 130, 150, 140, 160, 170, 180, 140, 150, 160, 175],
  };

  const getChartData = () => {
    switch (chartType) {
      case 'earnings': return earningsData[period as keyof typeof earningsData];
      case 'deliveries': return deliveriesData[period as keyof typeof deliveriesData];
      case 'hours': return hoursData[period as keyof typeof hoursData];
      case 'distance': return distanceData[period as keyof typeof distanceData];
      default: return earningsData[period as keyof typeof earningsData];
    }
  };

  const getChartLabels = () => {
    if (period === 'week') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (period === 'month') {
      return Array.from({ length: 30 }, (_, i) => (i + 1).toString());
    } else {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
  };

  const getChartColor = () => {
    switch (chartType) {
      case 'earnings': return 'bg-green-500';
      case 'deliveries': return 'bg-blue-500';
      case 'hours': return 'bg-purple-500';
      case 'distance': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  const getChartIcon = () => {
    switch (chartType) {
      case 'earnings': return <CurrencyDollarIcon className="h-5 w-5 text-green-600" />;
      case 'deliveries': return <TruckIcon className="h-5 w-5 text-blue-600" />;
      case 'hours': return <ClockIcon className="h-5 w-5 text-purple-600" />;
      case 'distance': return <MapPinIcon className="h-5 w-5 text-orange-600" />;
      default: return <CurrencyDollarIcon className="h-5 w-5 text-green-600" />;
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'earnings': return 'Earnings';
      case 'deliveries': return 'Deliveries';
      case 'hours': return 'Hours Worked';
      case 'distance': return 'Distance Traveled';
      default: return 'Earnings';
    }
  };

  const getChartUnit = () => {
    switch (chartType) {
      case 'earnings': return '$';
      case 'deliveries': return '';
      case 'hours': return 'h';
      case 'distance': return 'km';
      default: return '$';
    }
  };

  const getChartMax = () => {
    const data = getChartData();
    return Math.max(...data) * 1.2;
  };

  const getChartAverage = () => {
    const data = getChartData();
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
  };

  const getChartTotal = () => {
    const data = getChartData();
    return data.reduce((a, b) => a + b, 0);
  };

  // Performance metrics
  const performanceMetrics = [
    { name: 'Average Rating', value: '4.8', icon: StarIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { name: 'Completion Rate', value: '98%', icon: ChartBarIcon, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { name: 'On-Time Rate', value: '95%', icon: ClockIcon, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { name: 'Acceptance Rate', value: '87%', icon: TruckIcon, color: 'text-green-600', bgColor: 'bg-green-100' },
  ];

  // Top performing days
  const topDays = [
    { day: 'Saturday', earnings: 91, deliveries: 8 },
    { day: 'Friday', earnings: 87, deliveries: 6 },
    { day: 'Thursday', earnings: 78, deliveries: 7 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your performance and earnings over time.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <ArrowTrendingUpIcon className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Chart:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('earnings')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  chartType === 'earnings' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Earnings
              </button>
              <button
                onClick={() => setChartType('deliveries')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  chartType === 'deliveries' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Deliveries
              </button>
              <button
                onClick={() => setChartType('hours')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  chartType === 'hours' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Hours
              </button>
              <button
                onClick={() => setChartType('distance')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  chartType === 'distance' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Distance
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Period:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPeriod('week')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  period === 'week' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  period === 'month' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setPeriod('year')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  period === 'year' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getChartColor().replace('bg-', 'bg-opacity-20 bg-')}`}>
                  {getChartIcon()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{getChartTitle()} ({period})</h3>
                  <p className="text-sm text-gray-500">
                    {period === 'week' ? 'Last 7 days' : period === 'month' ? 'Last 30 days' : 'Last 12 months'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-gray-900">{getChartUnit()}{getChartTotal().toFixed(chartType === 'earnings' ? 2 : 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Average</p>
                  <p className="font-bold text-gray-900">{getChartUnit()}{getChartAverage().toFixed(chartType === 'earnings' ? 2 : 1)}</p>
                </div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="h-64 relative">
              <div className="absolute inset-0 flex items-end">
                {getChartData().map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className={`${getChartColor()} rounded-t-sm w-4/5`}
                      style={{
                        height: `${(value / getChartMax()) * 100}%`,
                        minHeight: '4px'
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                {getChartLabels().slice(0, getChartData().length).map((label, index) => (
                  <div key={index} className="flex-1 text-center">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {performanceMetrics.map((metric) => (
                <div key={metric.name} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${metric.bgColor}`}>
                      <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Total Earnings</span>
                </div>
                <span className="font-bold text-gray-900">${getChartTotal().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TruckIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Total Deliveries</span>
                </div>
                <span className="font-bold text-gray-900">{deliveriesData[period as keyof typeof deliveriesData].reduce((a, b) => a + b, 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ClockIcon className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Hours Worked</span>
                </div>
                <span className="font-bold text-gray-900">{hoursData[period as keyof typeof hoursData].reduce((a, b) => a + b, 0)}h</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Distance</span>
                </div>
                <span className="font-bold text-gray-900">{distanceData[period as keyof typeof distanceData].reduce((a, b) => a + b, 0)} km</span>
              </div>
            </div>
          </div>

          {/* Top Performing Days */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top Performing Days</h3>
            <div className="space-y-4">
              {topDays.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{day.day}</p>
                      <p className="text-sm text-gray-500">{day.deliveries} deliveries</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${day.earnings}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Custom Date Range</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">Select date range for detailed analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

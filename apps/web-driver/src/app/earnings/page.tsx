'use client';

import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

interface EarningsData {
  today: number;
  week: number;
  month: number;
  total: number;
  todayDeliveries: number;
  weekDeliveries: number;
  monthDeliveries: number;
  averagePerDelivery: number;
  hoursWorked: number;
  hourlyRate: number;
}

interface EarningsHistory {
  id: string;
  date: string;
  deliveries: number;
  earnings: number;
  hours: number;
  tips: number;
}

export default function EarningsOverview() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [history, setHistory] = useState<EarningsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    // Simulate loading earnings data
    setTimeout(() => {
      setEarnings({
        today: 127.50,
        week: 894.60,
        month: 3578.40,
        total: 15420.80,
        todayDeliveries: 8,
        weekDeliveries: 42,
        monthDeliveries: 168,
        averagePerDelivery: 15.94,
        hoursWorked: 6.5,
        hourlyRate: 19.62,
      });

      setHistory([
        {
          id: '1',
          date: '2024-01-15',
          deliveries: 8,
          earnings: 127.50,
          hours: 6.5,
          tips: 24.50,
        },
        {
          id: '2',
          date: '2024-01-14',
          deliveries: 12,
          earnings: 189.75,
          hours: 8.0,
          tips: 31.25,
        },
        {
          id: '3',
          date: '2024-01-13',
          deliveries: 6,
          earnings: 95.25,
          hours: 5.0,
          tips: 18.75,
        },
        {
          id: '4',
          date: '2024-01-12',
          deliveries: 10,
          earnings: 156.80,
          hours: 7.5,
          tips: 28.30,
        },
        {
          id: '5',
          date: '2024-01-11',
          deliveries: 9,
          earnings: 142.60,
          hours: 6.8,
          tips: 26.40,
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getEarningsForPeriod = () => {
    if (!earnings) return 0;
    switch (selectedPeriod) {
      case 'today': return earnings.today;
      case 'week': return earnings.week;
      case 'month': return earnings.month;
      default: return earnings.today;
    }
  };

  const getDeliveriesForPeriod = () => {
    if (!earnings) return 0;
    switch (selectedPeriod) {
      case 'today': return earnings.todayDeliveries;
      case 'week': return earnings.weekDeliveries;
      case 'month': return earnings.monthDeliveries;
      default: return earnings.todayDeliveries;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Earnings Overview</h1>
          <p className="text-gray-600">Track your delivery earnings and performance.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Request Payout
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 font-medium">View:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPeriod('today')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedPeriod === 'today' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedPeriod === 'week' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedPeriod === 'month' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Period Earnings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Earnings
              </p>
              <p className="text-3xl font-bold text-gray-900">${getEarningsForPeriod().toFixed(2)}</p>
              <p className="text-sm text-green-600 font-medium mt-1">↗ +12% from last {selectedPeriod}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Period Deliveries */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Deliveries
              </p>
              <p className="text-3xl font-bold text-gray-900">{getDeliveriesForPeriod()}</p>
              <p className="text-sm text-blue-600 font-medium mt-1">↗ +8% from last {selectedPeriod}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Average per Delivery */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Avg per Delivery</p>
              <p className="text-3xl font-bold text-gray-900">${earnings?.averagePerDelivery.toFixed(2)}</p>
              <p className="text-sm text-purple-600 font-medium mt-1">↗ +5% from last week</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Hourly Rate */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Hourly Rate</p>
              <p className="text-3xl font-bold text-gray-900">${earnings?.hourlyRate.toFixed(2)}</p>
              <p className="text-sm text-orange-600 font-medium mt-1">↗ +3% from last week</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Total Earnings Summary */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Total Lifetime Earnings</h2>
            <p className="text-3xl font-bold">${earnings?.total.toFixed(2)}</p>
            <p className="text-green-100 mt-1">Keep up the great work! 🚚</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <BanknotesIcon className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Earnings History</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {history.map((day) => (
              <div key={day.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(day.date)}</p>
                    <p className="text-sm text-gray-500">{day.deliveries} deliveries • {day.hours}h worked</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${day.earnings.toFixed(2)}</p>
                  <p className="text-sm text-green-600">+${day.tips.toFixed(2)} tips</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

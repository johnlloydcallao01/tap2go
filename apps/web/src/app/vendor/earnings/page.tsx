'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  ClockIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface EarningsData {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  thisWeekEarnings: number;
  thisMonthEarnings: number;
  commissionRate: number;
  recentPayouts: Array<{
    id: string;
    amount: number;
    date: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    method: string;
  }>;
  earningsBreakdown: Array<{
    date: string;
    orders: number;
    grossRevenue: number;
    commission: number;
    netEarnings: number;
  }>;
}

const mockEarnings: EarningsData = {
  totalEarnings: 15420.75,
  pendingEarnings: 1250.30,
  paidEarnings: 14170.45,
  thisWeekEarnings: 2850.60,
  thisMonthEarnings: 8920.40,
  commissionRate: 15.5,
  recentPayouts: [
    {
      id: 'PAY-001',
      amount: 2450.80,
      date: new Date('2024-01-15'),
      status: 'completed',
      method: 'Bank Transfer'
    },
    {
      id: 'PAY-002',
      amount: 1890.25,
      date: new Date('2024-01-08'),
      status: 'completed',
      method: 'Bank Transfer'
    },
    {
      id: 'PAY-003',
      amount: 3120.50,
      date: new Date('2024-01-01'),
      status: 'processing',
      method: 'Bank Transfer'
    }
  ],
  earningsBreakdown: [
    {
      date: '2024-01-15',
      orders: 45,
      grossRevenue: 1250.75,
      commission: 193.87,
      netEarnings: 1056.88
    },
    {
      date: '2024-01-14',
      orders: 38,
      grossRevenue: 980.50,
      commission: 151.98,
      netEarnings: 828.52
    },
    {
      date: '2024-01-13',
      orders: 52,
      grossRevenue: 1420.30,
      commission: 220.15,
      netEarnings: 1200.15
    },
    {
      date: '2024-01-12',
      orders: 41,
      grossRevenue: 1150.80,
      commission: 178.37,
      netEarnings: 972.43
    },
    {
      date: '2024-01-11',
      orders: 35,
      grossRevenue: 890.25,
      commission: 137.99,
      netEarnings: 752.26
    }
  ]
};

export default function VendorEarnings() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEarnings(mockEarnings);
      } catch (error) {
        console.error('Error loading earnings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEarnings();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-32 bg-gray-300 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-300 rounded-lg"></div>
          <div className="h-96 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load earnings data.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
              <p className="text-gray-600">Track your revenue and payouts</p>
            </div>
            <div className="flex space-x-4">
              <button className="btn-secondary">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export Report
              </button>
              <button className="btn-primary">
                Request Payout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Earnings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(earnings.totalEarnings)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">All time earnings</p>
        </div>

        {/* Pending Earnings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(earnings.pendingEarnings)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Awaiting payout</p>
        </div>

        {/* This Week */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(earnings.thisWeekEarnings)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Last 7 days</p>
        </div>

        {/* Commission Rate */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commission Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {earnings.commissionRate}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Platform fee</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payouts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Payouts</h2>
          <div className="space-y-4">
            {earnings.recentPayouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <BanknotesIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{payout.id}</p>
                    <p className="text-sm text-gray-500">{formatDate(payout.date)} • {payout.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(payout.amount)}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payout.status)}`}>
                    {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Breakdown</h2>
          <div className="space-y-4">
            {earnings.earningsBreakdown.map((day) => (
              <div key={day.date} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{formatDate(day.date)}</span>
                  <span className="text-sm text-gray-500">{day.orders} orders</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Gross Revenue</p>
                    <p className="font-medium text-gray-900">{formatCurrency(day.grossRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Commission</p>
                    <p className="font-medium text-red-600">-{formatCurrency(day.commission)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Net Earnings</p>
                    <p className="font-medium text-green-600">{formatCurrency(day.netEarnings)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

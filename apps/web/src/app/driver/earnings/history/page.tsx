'use client';

import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  TruckIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface PaymentHistory {
  id: string;
  date: string;
  type: 'delivery' | 'tip' | 'bonus' | 'withdrawal';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  orderNumber?: string;
  paymentMethod?: string;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    // Simulate loading payment history
    setTimeout(() => {
      setPayments([
        {
          id: '1',
          date: '2024-01-15',
          type: 'delivery',
          description: 'Delivery payment for order #ORD-2024-001',
          amount: 12.50,
          status: 'completed',
          orderNumber: 'ORD-2024-001',
        },
        {
          id: '2',
          date: '2024-01-15',
          type: 'tip',
          description: 'Customer tip for order #ORD-2024-001',
          amount: 3.00,
          status: 'completed',
          orderNumber: 'ORD-2024-001',
        },
        {
          id: '3',
          date: '2024-01-14',
          type: 'delivery',
          description: 'Delivery payment for order #ORD-2024-002',
          amount: 15.00,
          status: 'completed',
          orderNumber: 'ORD-2024-002',
        },
        {
          id: '4',
          date: '2024-01-14',
          type: 'bonus',
          description: 'Peak hour bonus (6-8 PM)',
          amount: 5.00,
          status: 'completed',
        },
        {
          id: '5',
          date: '2024-01-13',
          type: 'withdrawal',
          description: 'Bank transfer to ****1234',
          amount: -150.00,
          status: 'completed',
          paymentMethod: 'Bank Transfer',
        },
        {
          id: '6',
          date: '2024-01-13',
          type: 'delivery',
          description: 'Delivery payment for order #ORD-2024-003',
          amount: 18.75,
          status: 'completed',
          orderNumber: 'ORD-2024-003',
        },
        {
          id: '7',
          date: '2024-01-12',
          type: 'tip',
          description: 'Customer tip for order #ORD-2024-003',
          amount: 5.00,
          status: 'completed',
          orderNumber: 'ORD-2024-003',
        },
        {
          id: '8',
          date: '2024-01-12',
          type: 'delivery',
          description: 'Delivery payment for order #ORD-2024-004',
          amount: 12.25,
          status: 'pending',
          orderNumber: 'ORD-2024-004',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || payment.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalEarnings = filteredPayments
    .filter(p => p.amount > 0)
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalWithdrawals = Math.abs(filteredPayments
    .filter(p => p.amount < 0)
    .reduce((sum, payment) => sum + payment.amount, 0));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return <TruckIcon className="h-4 w-4" />;
      case 'tip':
        return <CurrencyDollarIcon className="h-4 w-4" />;
      case 'bonus':
        return <ClockIcon className="h-4 w-4" />;
      case 'withdrawal':
        return <ArrowDownTrayIcon className="h-4 w-4" />;
      default:
        return <CurrencyDollarIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'delivery':
        return 'text-blue-600 bg-blue-50';
      case 'tip':
        return 'text-green-600 bg-green-50';
      case 'bonus':
        return 'text-purple-600 bg-purple-50';
      case 'withdrawal':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
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
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600">Track all your earnings and withdrawals.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Withdrawals</p>
              <p className="text-2xl font-bold text-gray-900">${totalWithdrawals.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <ArrowDownTrayIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Net Balance</p>
              <p className="text-2xl font-bold text-gray-900">${(totalEarnings - totalWithdrawals).toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <TruckIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="delivery">Delivery</option>
                <option value="tip">Tips</option>
                <option value="bonus">Bonus</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Period:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Payment History List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(payment.type)}`}>
                    {getTypeIcon(payment.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{payment.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">{formatDate(payment.date)}</span>
                      {payment.orderNumber && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">{payment.orderNumber}</span>
                        </>
                      )}
                      {payment.paymentMethod && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">{payment.paymentMethod}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${payment.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {payment.amount >= 0 ? '+' : ''}${payment.amount.toFixed(2)}
                  </p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? `No transactions match "${searchQuery}"`
              : 'No transactions found for the selected filters.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

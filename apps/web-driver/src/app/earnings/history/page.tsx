'use client';

import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  GiftIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

interface Payment {
  id: string;
  date: string;
  type: 'delivery' | 'tip' | 'bonus' | 'withdrawal';
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  orderNumber?: string;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
          type: 'delivery',
          description: 'Delivery payment for order #ORD-2024-003',
          amount: 18.25,
          status: 'completed',
          orderNumber: 'ORD-2024-003',
        },
        {
          id: '6',
          date: '2024-01-13',
          type: 'withdrawal',
          description: 'Weekly payout to bank account',
          amount: -127.50,
          status: 'completed',
        },
        {
          id: '7',
          date: '2024-01-12',
          type: 'tip',
          description: 'Customer tip for order #ORD-2024-004',
          amount: 4.50,
          status: 'completed',
          orderNumber: 'ORD-2024-004',
        },
        {
          id: '8',
          date: '2024-01-12',
          type: 'bonus',
          description: 'Weekend bonus',
          amount: 10.00,
          status: 'pending',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'delivery':
        return 'bg-blue-100';
      case 'tip':
        return 'bg-green-100';
      case 'bonus':
        return 'bg-purple-100';
      case 'withdrawal':
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />;
      case 'tip':
        return <GiftIcon className="h-5 w-5 text-green-600" />;
      case 'bonus':
        return <BanknotesIcon className="h-5 w-5 text-purple-600" />;
      case 'withdrawal':
        return <ArrowDownTrayIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
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
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    if (filter === 'income') return payment.amount > 0;
    if (filter === 'withdrawals') return payment.amount < 0;
    return payment.type === filter;
  });

  const totalIncome = payments
    .filter(p => p.amount > 0 && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalWithdrawals = Math.abs(payments
    .filter(p => p.amount < 0 && p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0));

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">${totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ArrowDownTrayIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Withdrawals</p>
              <p className="text-2xl font-bold text-gray-900">${totalWithdrawals.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">${pendingAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <span className="text-gray-700 font-medium">Filter:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('income')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'income' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilter('delivery')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'delivery' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Deliveries
            </button>
            <button
              onClick={() => setFilter('tip')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'tip' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tips
            </button>
            <button
              onClick={() => setFilter('bonus')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'bonus' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bonuses
            </button>
            <button
              onClick={() => setFilter('withdrawals')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === 'withdrawals' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Withdrawals
            </button>
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
                      <p className="text-sm text-gray-500">{formatDate(payment.date)} • {formatTime(payment.date)}</p>
                      {payment.orderNumber && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-sm text-blue-600">{payment.orderNumber}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className={`text-lg font-bold ${payment.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {payment.amount >= 0 ? '+' : ''}${Math.abs(payment.amount).toFixed(2)}
                    </p>
                    {getStatusIcon(payment.status)}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
          <p className="text-gray-500 mb-6">
            {filter !== 'all'
              ? `No ${filter} transactions found. Try changing your filter.`
              : "You don't have any payment history yet."}
          </p>
          <button
            onClick={() => setFilter('all')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Payout {
  id: string;
  payoutId: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payoutDate: string;
  completedDate?: string;
  paymentMethod: string;
  accountDetails: string;
  orderCount: number;
  periodStart: string;
  periodEnd: string;
  notes?: string;
}

interface PayoutSummary {
  totalEarnings: number;
  totalCommission: number;
  netPayouts: number;
  pendingAmount: number;
  nextPayoutDate: string;
  averageOrderValue: number;
}

const mockPayouts: Payout[] = [
  {
    id: '1',
    payoutId: 'PAY-2024-001',
    amount: 2450.75,
    commission: 245.08,
    netAmount: 2205.67,
    status: 'completed',
    payoutDate: '2024-01-15',
    completedDate: '2024-01-16',
    paymentMethod: 'Bank Transfer',
    accountDetails: '****1234',
    orderCount: 89,
    periodStart: '2024-01-01',
    periodEnd: '2024-01-14',
  },
  {
    id: '2',
    payoutId: 'PAY-2024-002',
    amount: 3125.40,
    commission: 312.54,
    netAmount: 2812.86,
    status: 'processing',
    payoutDate: '2024-01-22',
    paymentMethod: 'Bank Transfer',
    accountDetails: '****1234',
    orderCount: 112,
    periodStart: '2024-01-15',
    periodEnd: '2024-01-21',
    notes: 'Processing with bank, expected completion in 1-2 business days',
  },
  {
    id: '3',
    payoutId: 'PAY-2024-003',
    amount: 1875.20,
    commission: 187.52,
    netAmount: 1687.68,
    status: 'pending',
    payoutDate: '2024-01-29',
    paymentMethod: 'Bank Transfer',
    accountDetails: '****1234',
    orderCount: 67,
    periodStart: '2024-01-22',
    periodEnd: '2024-01-28',
  },
  {
    id: '4',
    payoutId: 'PAY-2023-045',
    amount: 2890.15,
    commission: 289.02,
    netAmount: 2601.13,
    status: 'completed',
    payoutDate: '2023-12-31',
    completedDate: '2024-01-02',
    paymentMethod: 'Bank Transfer',
    accountDetails: '****1234',
    orderCount: 98,
    periodStart: '2023-12-24',
    periodEnd: '2023-12-30',
  },
  {
    id: '5',
    payoutId: 'PAY-2023-044',
    amount: 1456.80,
    commission: 145.68,
    netAmount: 1311.12,
    status: 'failed',
    payoutDate: '2023-12-24',
    paymentMethod: 'Bank Transfer',
    accountDetails: '****1234',
    orderCount: 52,
    periodStart: '2023-12-17',
    periodEnd: '2023-12-23',
    notes: 'Failed due to incorrect bank details. Please update your banking information.',
  },
];

const mockSummary: PayoutSummary = {
  totalEarnings: 12798.30,
  totalCommission: 1279.84,
  netPayouts: 11518.46,
  pendingAmount: 1687.68,
  nextPayoutDate: '2024-02-05',
  averageOrderValue: 28.45,
};

export default function VendorPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');

  useEffect(() => {
    const loadPayouts = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPayouts(mockPayouts);
        setSummary(mockSummary);
      } catch (error) {
        console.error('Error loading payouts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPayouts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'processing':
        return <ClockIcon className="h-4 w-4" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
              <p className="text-gray-600">Track your earnings and payout history</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/earnings" className="btn-secondary">
                View Earnings
              </Link>
              <button className="btn-secondary flex items-center">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </button>
              <Link href="/vendor/settings/banking" className="btn-primary flex items-center">
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Banking Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BanknotesIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${summary.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Payouts</p>
                <p className="text-2xl font-bold text-gray-900">${summary.netPayouts.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">${summary.pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CalendarDaysIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Next Payout</p>
                <p className="text-2xl font-bold text-gray-900">{formatDate(summary.nextPayoutDate)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Schedule Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CalendarDaysIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Payout Schedule</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• Payouts are processed weekly on Mondays</p>
              <p>• Funds typically arrive within 1-3 business days</p>
              <p>• Commission rate: 10% of gross sales</p>
              <p>• Minimum payout amount: $50.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payouts List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Payout History</h2>
              <p className="text-gray-600 mt-1">Your recent payouts and their status</p>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="last_7_days">Last 7 days</option>
              <option value="last_30_days">Last 30 days</option>
              <option value="last_90_days">Last 90 days</option>
              <option value="all_time">All time</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payout ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payout.payoutId}</div>
                      <div className="text-sm text-gray-500">{payout.orderCount} orders</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${payout.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    -${payout.commission.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${payout.netAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                      {getStatusIcon(payout.status)}
                      <span className="ml-1 capitalize">{payout.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(payout.payoutDate)}</div>
                    {payout.completedDate && (
                      <div className="text-sm text-gray-500">Completed: {formatDate(payout.completedDate)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-orange-600 hover:text-orange-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failed Payouts Alert */}
      {payouts.some(p => p.status === 'failed') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Failed Payouts Require Attention</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>You have {payouts.filter(p => p.status === 'failed').length} failed payout(s) that need to be resolved.</p>
                <p className="mt-1">Please check your banking details and contact support if needed.</p>
              </div>
              <div className="mt-3">
                <Link
                  href="/vendor/settings/banking"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Update Banking Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

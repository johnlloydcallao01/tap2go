'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,

  ArrowDownTrayIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,

} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface CommissionReport {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  totalOrders: number;
  grossRevenue: number;
  commissionRate: number;
  commissionAmount: number;
  netEarnings: number;
  averageOrderValue: number;
  status: 'draft' | 'finalized' | 'paid';
  generatedDate: string;
}

interface CommissionBreakdown {
  category: string;
  orders: number;
  revenue: number;
  commission: number;
  percentage: number;
}

const mockReports: CommissionReport[] = [
  {
    id: '1',
    period: 'January 2024',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    totalOrders: 456,
    grossRevenue: 12890.50,
    commissionRate: 10,
    commissionAmount: 1289.05,
    netEarnings: 11601.45,
    averageOrderValue: 28.27,
    status: 'paid',
    generatedDate: '2024-02-01',
  },
  {
    id: '2',
    period: 'December 2023',
    startDate: '2023-12-01',
    endDate: '2023-12-31',
    totalOrders: 523,
    grossRevenue: 14567.80,
    commissionRate: 10,
    commissionAmount: 1456.78,
    netEarnings: 13111.02,
    averageOrderValue: 27.85,
    status: 'paid',
    generatedDate: '2024-01-01',
  },
  {
    id: '3',
    period: 'November 2023',
    startDate: '2023-11-01',
    endDate: '2023-11-30',
    totalOrders: 398,
    grossRevenue: 11234.20,
    commissionRate: 10,
    commissionAmount: 1123.42,
    netEarnings: 10110.78,
    averageOrderValue: 28.23,
    status: 'paid',
    generatedDate: '2023-12-01',
  },
  {
    id: '4',
    period: 'October 2023',
    startDate: '2023-10-01',
    endDate: '2023-10-31',
    totalOrders: 467,
    grossRevenue: 13456.90,
    commissionRate: 10,
    commissionAmount: 1345.69,
    netEarnings: 12111.21,
    averageOrderValue: 28.81,
    status: 'finalized',
    generatedDate: '2023-11-01',
  },
];

const mockBreakdown: CommissionBreakdown[] = [
  { category: 'Pizza', orders: 156, revenue: 4234.50, commission: 423.45, percentage: 32.8 },
  { category: 'Main Courses', orders: 98, revenue: 2890.20, commission: 289.02, percentage: 22.4 },
  { category: 'Appetizers', orders: 87, revenue: 1567.80, commission: 156.78, percentage: 12.2 },
  { category: 'Salads', orders: 65, revenue: 1234.60, commission: 123.46, percentage: 9.6 },
  { category: 'Desserts', orders: 50, revenue: 963.40, commission: 96.34, percentage: 7.5 },
];

export default function VendorCommissionReports() {
  const [reports, setReports] = useState<CommissionReport[]>([]);
  const [breakdown, setBreakdown] = useState<CommissionBreakdown[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadReports = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setReports(mockReports);
        setBreakdown(mockBreakdown);
      } catch (error) {
        console.error('Error loading commission reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'finalized':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const currentReport = reports[0]; // Most recent report

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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Commission Reports</h1>
              <p className="text-gray-600">Track your commission payments and earnings breakdown</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/earnings" className="btn-secondary">
                View Earnings
              </Link>
              <button className="btn-secondary flex items-center">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Current Period Summary */}
      {currentReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{currentReport.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gross Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${currentReport.grossRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commission ({currentReport.commissionRate}%)</p>
                <p className="text-2xl font-bold text-gray-900">${currentReport.commissionAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${currentReport.netEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commission Breakdown */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Commission Breakdown by Category</h2>
          <p className="text-gray-600 mt-1">Current month commission distribution</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {breakdown.map((item) => (
              <div key={item.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-orange-600">{item.percentage}%</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.category}</h3>
                    <p className="text-sm text-gray-600">{item.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${item.revenue.toFixed(2)}</p>
                  <p className="text-sm text-red-600">-${item.commission.toFixed(2)} commission</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reports History */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Commission Reports History</h2>
          <p className="text-gray-600 mt-1">Historical commission reports and payments</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.period}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(report.startDate)} - {formatDate(report.endDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.totalOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${report.grossRevenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ${report.commissionAmount.toFixed(2)} ({report.commissionRate}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${report.netEarnings.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-orange-600 hover:text-orange-900 mr-3">
                      Download
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <DocumentTextIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Commission Structure</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• Platform commission: 10% of gross sales</p>
              <p>• Commission is calculated on total order value including taxes</p>
              <p>• Reports are generated monthly and finalized within 5 business days</p>
              <p>• Payments are processed after report finalization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

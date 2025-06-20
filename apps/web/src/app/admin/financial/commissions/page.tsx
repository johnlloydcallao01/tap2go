'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartPieIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

interface CommissionRule {
  id: string;
  name: string;
  type: 'vendor' | 'driver' | 'platform';
  category: string;
  rate: number;
  rateType: 'percentage' | 'fixed';
  minAmount?: number;
  maxAmount?: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  description: string;
}

interface CommissionEarning {
  id: string;
  ruleId: string;
  ruleName: string;
  entityId: string;
  entityName: string;
  entityType: 'vendor' | 'driver';
  orderId: string;
  orderValue: number;
  commissionAmount: number;
  commissionRate: number;
  status: 'pending' | 'paid' | 'disputed' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  period: string;
}

interface CommissionStats {
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  disputedCommissions: number;
  vendorCommissions: number;
  driverCommissions: number;
  platformRevenue: number;
  avgCommissionRate: number;
}

export default function CommissionsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'earnings' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CommissionStats>({
    totalCommissions: 0,
    pendingCommissions: 0,
    paidCommissions: 0,
    disputedCommissions: 0,
    vendorCommissions: 0,
    driverCommissions: 0,
    platformRevenue: 0,
    avgCommissionRate: 0,
  });
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [earnings, setEarnings] = useState<CommissionEarning[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  // Removed unused variables: currentPage, setCurrentPage, itemsPerPage

  useEffect(() => {
    const loadCommissionData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock commission statistics
        setStats({
          totalCommissions: 45678.90,
          pendingCommissions: 8934.50,
          paidCommissions: 36744.40,
          disputedCommissions: 1234.75,
          vendorCommissions: 32456.80,
          driverCommissions: 13222.10,
          platformRevenue: 89456.25,
          avgCommissionRate: 12.5,
        });

        // Mock commission rules
        const mockRules: CommissionRule[] = [
          {
            id: 'rule_001',
            name: 'Standard Vendor Commission',
            type: 'vendor',
            category: 'Food & Beverage',
            rate: 15,
            rateType: 'percentage',
            minAmount: 0,
            maxAmount: 1000,
            status: 'active',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-20T14:30:00Z',
            description: 'Standard commission rate for food and beverage vendors',
          },
          {
            id: 'rule_002',
            name: 'Premium Vendor Commission',
            type: 'vendor',
            category: 'Premium Restaurants',
            rate: 12,
            rateType: 'percentage',
            minAmount: 0,
            maxAmount: 2000,
            status: 'active',
            createdAt: '2024-01-10T09:00:00Z',
            updatedAt: '2024-01-25T16:45:00Z',
            description: 'Reduced commission rate for premium restaurant partners',
          },
          {
            id: 'rule_003',
            name: 'Driver Delivery Commission',
            type: 'driver',
            category: 'Standard Delivery',
            rate: 8,
            rateType: 'percentage',
            minAmount: 2,
            maxAmount: 50,
            status: 'active',
            createdAt: '2024-01-05T11:30:00Z',
            updatedAt: '2024-01-22T13:15:00Z',
            description: 'Commission for standard delivery services',
          },
          {
            id: 'rule_004',
            name: 'Express Delivery Commission',
            type: 'driver',
            category: 'Express Delivery',
            rate: 12,
            rateType: 'percentage',
            minAmount: 3,
            maxAmount: 75,
            status: 'active',
            createdAt: '2024-01-08T15:20:00Z',
            updatedAt: '2024-01-28T10:00:00Z',
            description: 'Higher commission rate for express delivery services',
          },
          {
            id: 'rule_005',
            name: 'New Vendor Promotion',
            type: 'vendor',
            category: 'New Partners',
            rate: 8,
            rateType: 'percentage',
            minAmount: 0,
            maxAmount: 500,
            status: 'active',
            createdAt: '2024-02-01T08:00:00Z',
            updatedAt: '2024-02-01T08:00:00Z',
            description: 'Promotional commission rate for new vendor partners (first 3 months)',
          },
          {
            id: 'rule_006',
            name: 'Bulk Order Commission',
            type: 'vendor',
            category: 'Corporate Orders',
            rate: 10,
            rateType: 'percentage',
            minAmount: 100,
            maxAmount: 5000,
            status: 'active',
            createdAt: '2024-01-20T12:00:00Z',
            updatedAt: '2024-02-05T14:30:00Z',
            description: 'Special commission rate for corporate and bulk orders',
          },
        ];

        setRules(mockRules);

        // Mock commission earnings
        const mockEarnings: CommissionEarning[] = [
          {
            id: 'earning_001',
            ruleId: 'rule_001',
            ruleName: 'Standard Vendor Commission',
            entityId: 'vendor_123',
            entityName: 'Bella Vista Restaurant',
            entityType: 'vendor',
            orderId: 'ORD-2024-001234',
            orderValue: 85.50,
            commissionAmount: 12.83,
            commissionRate: 15,
            status: 'paid',
            createdAt: '2024-02-10T14:30:00Z',
            paidAt: '2024-02-12T10:00:00Z',
            period: '2024-02',
          },
          {
            id: 'earning_002',
            ruleId: 'rule_003',
            ruleName: 'Driver Delivery Commission',
            entityId: 'driver_456',
            entityName: 'John Martinez',
            entityType: 'driver',
            orderId: 'ORD-2024-001235',
            orderValue: 65.25,
            commissionAmount: 5.22,
            commissionRate: 8,
            status: 'pending',
            createdAt: '2024-02-11T16:45:00Z',
            period: '2024-02',
          },
          {
            id: 'earning_003',
            ruleId: 'rule_002',
            ruleName: 'Premium Vendor Commission',
            entityId: 'vendor_789',
            entityName: 'The Golden Spoon',
            entityType: 'vendor',
            orderId: 'ORD-2024-001236',
            orderValue: 125.75,
            commissionAmount: 15.09,
            commissionRate: 12,
            status: 'paid',
            createdAt: '2024-02-09T12:20:00Z',
            paidAt: '2024-02-11T15:30:00Z',
            period: '2024-02',
          },
          {
            id: 'earning_004',
            ruleId: 'rule_004',
            ruleName: 'Express Delivery Commission',
            entityId: 'driver_321',
            entityName: 'Sarah Chen',
            entityType: 'driver',
            orderId: 'ORD-2024-001237',
            orderValue: 45.80,
            commissionAmount: 5.50,
            commissionRate: 12,
            status: 'pending',
            createdAt: '2024-02-11T18:15:00Z',
            period: '2024-02',
          },
          {
            id: 'earning_005',
            ruleId: 'rule_005',
            ruleName: 'New Vendor Promotion',
            entityId: 'vendor_654',
            entityName: 'Fresh Bites Cafe',
            entityType: 'vendor',
            orderId: 'ORD-2024-001238',
            orderValue: 38.90,
            commissionAmount: 3.11,
            commissionRate: 8,
            status: 'disputed',
            createdAt: '2024-02-10T20:30:00Z',
            period: '2024-02',
          },
        ];

        setEarnings(mockEarnings);
      } catch (error) {
        console.error('Error loading commission data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCommissionData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      disputed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vendor':
        return <BuildingStorefrontIcon className="h-4 w-4" />;
      case 'driver':
        return <TruckIcon className="h-4 w-4" />;
      default:
        return <ChartPieIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Commission Management</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage commission rules, track earnings, and analyze performance across vendors and drivers.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center text-sm">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
            <PencilIcon className="h-4 w-4 mr-2" />
            New Rule
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Commissions</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCommissions)}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +12.5% from last month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Vendor Commissions</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.vendorCommissions)}</p>
              <p className="text-sm text-blue-600">
                {((stats.vendorCommissions / stats.totalCommissions) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TruckIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Driver Commissions</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.driverCommissions)}</p>
              <p className="text-sm text-purple-600">
                {((stats.driverCommissions / stats.totalCommissions) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartPieIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Commission Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgCommissionRate}%</p>
              <p className="text-sm text-orange-600">
                Platform standard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: ChartPieIcon },
              { key: 'rules', label: 'Commission Rules', icon: CurrencyDollarIcon },
              { key: 'earnings', label: 'Earnings', icon: BuildingStorefrontIcon },
              { key: 'analytics', label: 'Analytics', icon: ArrowUpIcon },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'overview' | 'rules' | 'earnings' | 'analytics')}
                className={`${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Pending Commissions</p>
                      <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.pendingCommissions)}</p>
                    </div>
                    <div className="bg-green-200 rounded-full p-3">
                      <CalendarIcon className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Paid This Month</p>
                      <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.paidCommissions)}</p>
                    </div>
                    <div className="bg-blue-200 rounded-full p-3">
                      <CurrencyDollarIcon className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Platform Revenue</p>
                      <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.platformRevenue)}</p>
                    </div>
                    <div className="bg-purple-200 rounded-full p-3">
                      <ChartPieIcon className="h-6 w-6 text-purple-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Commission Activity</h3>
                <div className="space-y-4">
                  {earnings.slice(0, 5).map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getTypeIcon(earning.entityType)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{earning.entityName}</p>
                          <p className="text-xs text-gray-500">{earning.ruleName} • Order #{earning.orderId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(earning.commissionAmount)}</p>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(earning.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search commission rules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Types</option>
                    <option value="vendor">Vendor</option>
                    <option value="driver">Driver</option>
                    <option value="platform">Platform</option>
                  </select>
                </div>
              </div>

              {/* Rules Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Range</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                            <div className="text-sm text-gray-500">{rule.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTypeIcon(rule.type)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">{rule.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {rule.rate}{rule.rateType === 'percentage' ? '%' : ' USD'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(rule.minAmount || 0)} - {formatCurrency(rule.maxAmount || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(rule.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(rule.updatedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-orange-600 hover:text-orange-900">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-blue-600 hover:text-blue-900">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              {/* Earnings Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-xs text-yellow-800">Pending</p>
                      <p className="text-lg font-bold text-yellow-900">{formatCurrency(stats.pendingCommissions)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-xs text-green-800">Paid</p>
                      <p className="text-lg font-bold text-green-900">{formatCurrency(stats.paidCommissions)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center">
                    <ArrowDownIcon className="h-5 w-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-xs text-red-800">Disputed</p>
                      <p className="text-lg font-bold text-red-900">{formatCurrency(stats.disputedCommissions)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center">
                    <ChartPieIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-xs text-blue-800">Total</p>
                      <p className="text-lg font-bold text-blue-900">{formatCurrency(stats.totalCommissions)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earnings Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {earnings.map((earning) => (
                      <tr key={earning.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTypeIcon(earning.entityType)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{earning.entityName}</div>
                              <div className="text-sm text-gray-500 capitalize">{earning.entityType}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{earning.orderId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{earning.ruleName}</div>
                          <div className="text-sm text-gray-500">{earning.commissionRate}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(earning.orderValue)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(earning.commissionAmount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(earning.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(earning.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <ChartPieIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Commission Analytics</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Advanced analytics and reporting features coming soon.
                </p>
                <div className="mt-6">
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                    Request Analytics Feature
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  EyeIcon,
  ChartBarIcon,
  UserGroupIcon,
  TruckIcon,

} from '@heroicons/react/24/outline';

interface CommissionStructure {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorType: 'restaurant' | 'grocery' | 'pharmacy' | 'retail';
  commissionRate: number;
  minimumCommission: number;
  maximumCommission?: number;
  deliveryFeeShare: number;
  serviceFeeShare: number;
  effectiveDate: string;
  status: 'active' | 'pending' | 'expired';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  monthlyVolume: number;
  totalCommissionEarned: number;
  lastUpdated: string;
}

interface CommissionEarnings {
  period: string;
  vendorId: string;
  vendorName: string;
  grossRevenue: number;
  commissionEarned: number;
  deliveryFees: number;
  serviceFees: number;
  orderCount: number;
  averageOrderValue: number;
  commissionRate: number;
}

export default function AdminCommissions() {
  const [commissionStructures, setCommissionStructures] = useState<CommissionStructure[]>([]);
  const [commissionEarnings, setCommissionEarnings] = useState<CommissionEarnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'structures' | 'earnings'>('structures');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const loadCommissionData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockCommissionStructures: CommissionStructure[] = [
          {
            id: 'comm_001',
            vendorId: 'vendor_001',
            vendorName: 'Pizza Palace',
            vendorType: 'restaurant',
            commissionRate: 15.0,
            minimumCommission: 2.50,
            maximumCommission: 25.00,
            deliveryFeeShare: 80.0,
            serviceFeeShare: 100.0,
            effectiveDate: '2024-01-01T00:00:00Z',
            status: 'active',
            tier: 'gold',
            monthlyVolume: 125000.00,
            totalCommissionEarned: 18750.00,
            lastUpdated: '2024-01-15T10:30:00Z',
          },
          {
            id: 'comm_002',
            vendorId: 'vendor_002',
            vendorName: 'Burger Barn',
            vendorType: 'restaurant',
            commissionRate: 18.0,
            minimumCommission: 2.00,
            maximumCommission: 30.00,
            deliveryFeeShare: 75.0,
            serviceFeeShare: 100.0,
            effectiveDate: '2024-01-01T00:00:00Z',
            status: 'active',
            tier: 'silver',
            monthlyVolume: 89000.00,
            totalCommissionEarned: 16020.00,
            lastUpdated: '2024-01-10T14:20:00Z',
          },
          {
            id: 'comm_003',
            vendorId: 'vendor_003',
            vendorName: 'Sushi Zen',
            vendorType: 'restaurant',
            commissionRate: 12.0,
            minimumCommission: 3.00,
            maximumCommission: 20.00,
            deliveryFeeShare: 85.0,
            serviceFeeShare: 100.0,
            effectiveDate: '2024-01-01T00:00:00Z',
            status: 'active',
            tier: 'platinum',
            monthlyVolume: 156000.00,
            totalCommissionEarned: 18720.00,
            lastUpdated: '2024-01-12T09:15:00Z',
          },
          {
            id: 'comm_004',
            vendorId: 'vendor_004',
            vendorName: 'Fresh Market',
            vendorType: 'grocery',
            commissionRate: 8.0,
            minimumCommission: 1.50,
            maximumCommission: 15.00,
            deliveryFeeShare: 90.0,
            serviceFeeShare: 100.0,
            effectiveDate: '2024-01-01T00:00:00Z',
            status: 'active',
            tier: 'platinum',
            monthlyVolume: 234000.00,
            totalCommissionEarned: 18720.00,
            lastUpdated: '2024-01-14T16:45:00Z',
          },
          {
            id: 'comm_005',
            vendorId: 'vendor_005',
            vendorName: 'Quick Pharmacy',
            vendorType: 'pharmacy',
            commissionRate: 10.0,
            minimumCommission: 2.00,
            maximumCommission: 12.00,
            deliveryFeeShare: 95.0,
            serviceFeeShare: 100.0,
            effectiveDate: '2024-01-01T00:00:00Z',
            status: 'pending',
            tier: 'bronze',
            monthlyVolume: 45000.00,
            totalCommissionEarned: 4500.00,
            lastUpdated: '2024-01-13T11:30:00Z',
          },
        ];

        const mockCommissionEarnings: CommissionEarnings[] = [
          {
            period: '2024-01-15',
            vendorId: 'vendor_001',
            vendorName: 'Pizza Palace',
            grossRevenue: 4250.00,
            commissionEarned: 637.50,
            deliveryFees: 340.00,
            serviceFees: 85.00,
            orderCount: 85,
            averageOrderValue: 50.00,
            commissionRate: 15.0,
          },
          {
            period: '2024-01-15',
            vendorId: 'vendor_002',
            vendorName: 'Burger Barn',
            grossRevenue: 3200.00,
            commissionEarned: 576.00,
            deliveryFees: 256.00,
            serviceFees: 64.00,
            orderCount: 64,
            averageOrderValue: 50.00,
            commissionRate: 18.0,
          },
          {
            period: '2024-01-15',
            vendorId: 'vendor_003',
            vendorName: 'Sushi Zen',
            grossRevenue: 5600.00,
            commissionEarned: 672.00,
            deliveryFees: 448.00,
            serviceFees: 112.00,
            orderCount: 112,
            averageOrderValue: 50.00,
            commissionRate: 12.0,
          },
        ];

        setCommissionStructures(mockCommissionStructures);
        setCommissionEarnings(mockCommissionEarnings);
      } catch (error) {
        console.error('Error loading commission data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCommissionData();
  }, []);

  const filteredStructures = commissionStructures.filter(structure => {
    const matchesSearch = 
      structure.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      structure.vendorId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTier = selectedTier === 'all' || structure.tier === selectedTier;
    const matchesStatus = selectedStatus === 'all' || structure.status === selectedStatus;
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  const getTierBadge = (tier: CommissionStructure['tier']) => {
    const badges = {
      bronze: 'bg-orange-100 text-orange-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-purple-100 text-purple-800',
    };
    
    return badges[tier] || badges.bronze;
  };

  const getStatusBadge = (status: CommissionStructure['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
    };
    
    return badges[status] || badges.pending;
  };

  const getVendorTypeIcon = (type: CommissionStructure['vendorType']) => {
    const icons = {
      restaurant: BuildingStorefrontIcon,
      grocery: BuildingStorefrontIcon,
      pharmacy: BuildingStorefrontIcon,
      retail: BuildingStorefrontIcon,
    };
    
    return icons[type] || BuildingStorefrontIcon;
  };

  const totalCommissionEarned = commissionStructures.reduce((sum, structure) => sum + structure.totalCommissionEarned, 0);
  const averageCommissionRate = commissionStructures.length > 0 
    ? commissionStructures.reduce((sum, structure) => sum + structure.commissionRate, 0) / commissionStructures.length 
    : 0;
  const totalMonthlyVolume = commissionStructures.reduce((sum, structure) => sum + structure.monthlyVolume, 0);
  const activeVendors = commissionStructures.filter(s => s.status === 'active').length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Commission Management</h1>
            <p className="text-sm lg:text-base text-gray-600">Manage vendor commission structures and track earnings.</p>
          </div>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Commission</p>
                <p className="text-lg font-semibold text-gray-900">${totalCommissionEarned.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Commission Rate</p>
                <p className="text-lg font-semibold text-gray-900">{averageCommissionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                <p className="text-lg font-semibold text-gray-900">{activeVendors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TruckIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Monthly Volume</p>
                <p className="text-lg font-semibold text-gray-900">${(totalMonthlyVolume / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('structures')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'structures'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Commission Structures ({commissionStructures.length})
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'earnings'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Commission Earnings ({commissionEarnings.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Commission Structures Tab */}
            {activeTab === 'structures' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                  {/* Search */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search vendors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  {/* Tier Filter */}
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Tiers</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                {/* Commission Structures Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commission Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monthly Volume
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commission Earned
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStructures.map((structure) => {
                        const VendorIcon = getVendorTypeIcon(structure.vendorType);

                        return (
                          <tr key={structure.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="p-2 bg-gray-100 rounded-lg">
                                    <VendorIcon className="h-5 w-5 text-gray-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{structure.vendorName}</div>
                                  <div className="text-sm text-gray-500">{structure.vendorId}</div>
                                  <div className="text-xs text-gray-400 capitalize">{structure.vendorType}</div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{structure.commissionRate}%</div>
                              <div className="text-xs text-gray-500">
                                Min: ${structure.minimumCommission}
                              </div>
                              {structure.maximumCommission && (
                                <div className="text-xs text-gray-500">
                                  Max: ${structure.maximumCommission}
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getTierBadge(structure.tier)}`}>
                                {structure.tier}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${structure.monthlyVolume.toLocaleString()}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-600">
                                ${structure.totalCommissionEarned.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {structure.monthlyVolume > 0
                                  ? ((structure.totalCommissionEarned / structure.monthlyVolume) * 100).toFixed(1)
                                  : '0'}% of volume
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(structure.status)}`}>
                                {structure.status}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-orange-600 hover:text-orange-900 mr-3">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button className="text-blue-600 hover:text-blue-900">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Commission Earnings Tab */}
            {activeTab === 'earnings' && (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gross Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commission Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Commission Earned
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AOV
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {commissionEarnings.map((earning, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(earning.period).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{earning.vendorName}</div>
                            <div className="text-sm text-gray-500">{earning.vendorId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${earning.grossRevenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {earning.commissionRate}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            ${earning.commissionEarned.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {earning.orderCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${earning.averageOrderValue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

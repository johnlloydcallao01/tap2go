'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  GiftIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'free_delivery' | 'bogo';
  value: number;
  status: 'active' | 'inactive' | 'expired' | 'scheduled' | 'paused';
  usage: {
    totalLimit: number;
    perUserLimit: number;
    used: number;
    remaining: number;
  };
  conditions: {
    minOrderValue?: number;
    maxDiscount?: number;
    firstTimeOnly?: boolean;
    newUsersOnly?: boolean;
    applicableCategories?: string[];
  };
  validity: {
    startDate: string;
    endDate?: string;
    validHours?: {
      start: string;
      end: string;
    };
  };
  targeting: {
    userSegments: string[];
    locations?: string[];
    estimatedReach: number;
  };
  performance: {
    totalRedemptions: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    roi: number;
  };
  createdAt: string;
  createdBy: string;
  lastModified: string;
}

export default function MarketingCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockCoupons: Coupon[] = [
          {
            id: 'coup_001',
            code: 'WELCOME20',
            name: 'Welcome New Users',
            description: '20% off for first-time users on orders above $15',
            type: 'percentage',
            value: 20,
            status: 'active',
            usage: {
              totalLimit: 1000,
              perUserLimit: 1,
              used: 234,
              remaining: 766,
            },
            conditions: {
              minOrderValue: 15.00,
              maxDiscount: 10.00,
              firstTimeOnly: true,
            },
            validity: {
              startDate: '2024-01-01T00:00:00Z',
              endDate: '2024-12-31T23:59:59Z',
            },
            targeting: {
              userSegments: ['new_users'],
              estimatedReach: 5000,
            },
            performance: {
              totalRedemptions: 234,
              totalRevenue: 4680.50,
              averageOrderValue: 20.00,
              conversionRate: 4.68,
              roi: 156.2,
            },
            createdAt: '2023-12-15T10:00:00Z',
            createdBy: 'John Smith',
            lastModified: '2024-01-15T14:30:00Z',
          },
          {
            id: 'coup_002',
            code: 'LUNCH15',
            name: 'Lunch Hour Special',
            description: '15% off during lunch hours (11 AM - 3 PM)',
            type: 'percentage',
            value: 15,
            status: 'active',
            usage: {
              totalLimit: 2000,
              perUserLimit: 3,
              used: 567,
              remaining: 1433,
            },
            conditions: {
              minOrderValue: 10.00,
              maxDiscount: 8.00,
            },
            validity: {
              startDate: '2024-01-10T00:00:00Z',
              endDate: '2024-06-30T23:59:59Z',
              validHours: {
                start: '11:00',
                end: '15:00',
              },
            },
            targeting: {
              userSegments: ['lunch_customers', 'office_workers'],
              locations: ['Business District', 'Downtown'],
              estimatedReach: 8000,
            },
            performance: {
              totalRedemptions: 567,
              totalRevenue: 8505.75,
              averageOrderValue: 15.00,
              conversionRate: 7.09,
              roi: 283.5,
            },
            createdAt: '2024-01-05T09:30:00Z',
            createdBy: 'Lisa Wilson',
            lastModified: '2024-01-20T11:15:00Z',
          },
          {
            id: 'coup_003',
            code: 'FREEDEL',
            name: 'Free Delivery Weekend',
            description: 'Free delivery on all orders this weekend',
            type: 'free_delivery',
            value: 0,
            status: 'scheduled',
            usage: {
              totalLimit: 500,
              perUserLimit: 2,
              used: 0,
              remaining: 500,
            },
            conditions: {
              minOrderValue: 12.00,
            },
            validity: {
              startDate: '2024-01-27T00:00:00Z',
              endDate: '2024-01-28T23:59:59Z',
            },
            targeting: {
              userSegments: ['weekend_customers'],
              estimatedReach: 3000,
            },
            performance: {
              totalRedemptions: 0,
              totalRevenue: 0,
              averageOrderValue: 0,
              conversionRate: 0,
              roi: 0,
            },
            createdAt: '2024-01-12T16:45:00Z',
            createdBy: 'David Brown',
            lastModified: '2024-01-18T09:30:00Z',
          },
          {
            id: 'coup_004',
            code: 'VIP20',
            name: 'VIP Member Exclusive',
            description: '$20 off for VIP members on orders above $50',
            type: 'fixed_amount',
            value: 20,
            status: 'active',
            usage: {
              totalLimit: 100,
              perUserLimit: 2,
              used: 67,
              remaining: 33,
            },
            conditions: {
              minOrderValue: 50.00,
            },
            validity: {
              startDate: '2024-01-01T00:00:00Z',
              endDate: '2024-12-31T23:59:59Z',
            },
            targeting: {
              userSegments: ['vip_members'],
              estimatedReach: 450,
            },
            performance: {
              totalRedemptions: 67,
              totalRevenue: 8934.50,
              averageOrderValue: 133.35,
              conversionRate: 14.89,
              roi: 298.2,
            },
            createdAt: '2023-12-30T14:20:00Z',
            createdBy: 'Emily Rodriguez',
            lastModified: '2024-01-10T16:15:00Z',
          },
        ];

        setCoupons(mockCoupons);
      } catch (error) {
        console.error('Error loading coupons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCoupons();
  }, []);

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = 
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || coupon.status === selectedStatus;
    const matchesType = selectedType === 'all' || coupon.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: Coupon['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800',
      paused: 'bg-yellow-100 text-yellow-800',
    };
    
    return badges[status] || badges.inactive;
  };

  const getStatusIcon = (status: Coupon['status']) => {
    const icons = {
      active: CheckCircleIcon,
      inactive: XCircleIcon,
      expired: XCircleIcon,
      scheduled: ClockIcon,
      paused: ClockIcon,
    };
    
    return icons[status] || XCircleIcon;
  };

  const getTypeLabel = (type: Coupon['type']) => {
    const labels = {
      percentage: 'Percentage Off',
      fixed_amount: 'Fixed Amount',
      free_delivery: 'Free Delivery',
      bogo: 'Buy One Get One',
    };
    
    return labels[type] || type;
  };

  const formatCouponValue = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% OFF`;
      case 'fixed_amount':
        return `$${coupon.value} OFF`;
      case 'free_delivery':
        return 'FREE DELIVERY';
      case 'bogo':
        return `${coupon.value}% OFF 2nd Item`;
      default:
        return `${coupon.value}`;
    }
  };

  const totalRedemptions = coupons.reduce((sum, c) => sum + c.performance.totalRedemptions, 0);
  const totalRevenue = coupons.reduce((sum, c) => sum + c.performance.totalRevenue, 0);
  const activeCoupons = coupons.filter(c => c.status === 'active').length;
  const averageROI = coupons.length > 0 
    ? coupons.reduce((sum, c) => sum + c.performance.roi, 0) / coupons.length 
    : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                </div>
              ))}
            </div>
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
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Coupon Management</h1>
            <p className="text-sm lg:text-base text-gray-600">Create and manage discount coupons and promotional codes.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Coupon
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Coupons</p>
                <p className="text-lg font-semibold text-gray-900">{activeCoupons}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GiftIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Redemptions</p>
                <p className="text-lg font-semibold text-gray-900">{totalRedemptions.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TagIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Revenue Generated</p>
                <p className="text-lg font-semibold text-gray-900">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Average ROI</p>
                <p className="text-lg font-semibold text-gray-900">{averageROI.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow border mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search coupons by code, name, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="scheduled">Scheduled</option>
                <option value="paused">Paused</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <TagIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage Off</option>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="free_delivery">Free Delivery</option>
                <option value="bogo">Buy One Get One</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coupons List */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Coupons ({filteredCoupons.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredCoupons.map((coupon) => {
              const StatusIcon = getStatusIcon(coupon.status);
              const usagePercentage = coupon.usage.totalLimit
                ? (coupon.usage.used / coupon.usage.totalLimit) * 100
                : 0;

              return (
                <div key={coupon.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <GiftIcon className="h-8 w-8 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{coupon.name}</h4>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            {coupon.code}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Created by {coupon.createdBy}</span>
                          <span>•</span>
                          <span>{new Date(coupon.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{getTypeLabel(coupon.type)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{formatCouponValue(coupon)}</p>
                        <p className="text-xs text-gray-500">Discount Value</p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(coupon.status)}`}>
                        <StatusIcon className="h-4 w-4 inline mr-1" />
                        {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  {coupon.usage.totalLimit && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Usage Progress</span>
                        <span className="text-gray-900">
                          {coupon.usage.used} / {coupon.usage.totalLimit} used ({usagePercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Coupon Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conditions</p>
                      <div className="text-sm text-gray-900">
                        {coupon.conditions.minOrderValue && (
                          <p>Min Order: ${coupon.conditions.minOrderValue}</p>
                        )}
                        {coupon.conditions.maxDiscount && (
                          <p>Max Discount: ${coupon.conditions.maxDiscount}</p>
                        )}
                        {coupon.conditions.firstTimeOnly && (
                          <p className="text-blue-600">First-time users only</p>
                        )}
                        {coupon.conditions.newUsersOnly && (
                          <p className="text-green-600">New users only</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Validity</p>
                      <div className="text-sm text-gray-900">
                        <p>From: {new Date(coupon.validity.startDate).toLocaleDateString()}</p>
                        {coupon.validity.endDate && (
                          <p>To: {new Date(coupon.validity.endDate).toLocaleDateString()}</p>
                        )}
                        {coupon.validity.validHours && (
                          <p>Hours: {coupon.validity.validHours.start} - {coupon.validity.validHours.end}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Targeting</p>
                      <div className="text-sm text-gray-900">
                        <p>Segments: {coupon.targeting.userSegments.join(', ')}</p>
                        <p>Est. Reach: {coupon.targeting.estimatedReach.toLocaleString()}</p>
                        {coupon.targeting.locations && (
                          <p>Locations: {coupon.targeting.locations.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  {coupon.performance.totalRedemptions > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Redemptions</p>
                        <p className="text-lg font-semibold text-gray-900">{coupon.performance.totalRedemptions}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-lg font-semibold text-green-600">${coupon.performance.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Avg Order</p>
                        <p className="text-lg font-semibold text-gray-900">${coupon.performance.averageOrderValue.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Conversion</p>
                        <p className="text-lg font-semibold text-blue-600">{coupon.performance.conversionRate.toFixed(2)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">ROI</p>
                        <p className="text-lg font-semibold text-purple-600">{coupon.performance.roi.toFixed(1)}%</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                        <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                        Duplicate
                      </button>

                      {coupon.status === 'active' && (
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700">
                          Pause
                        </button>
                      )}

                      {(coupon.status === 'inactive' || coupon.status === 'paused') && (
                        <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Activate
                        </button>
                      )}

                      <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700">
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>

                    <div className="text-xs text-gray-500">
                      Last modified: {new Date(coupon.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCoupons.length === 0 && (
            <div className="p-12 text-center">
              <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
              >
                Create Your First Coupon
              </button>
            </div>
          )}
        </div>

        {/* Create Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Coupon</h3>
              <p className="text-gray-600 mb-4">Coupon creation functionality will be implemented here.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

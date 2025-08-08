'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Image from 'next/image';
import {
  MegaphoneIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  TagIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'bogo' | 'free_delivery' | 'cashback' | 'bundle';
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  code?: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'scheduled' | 'expired' | 'paused';
  targetAudience: 'all' | 'new_customers' | 'returning_customers' | 'vip';
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  restaurants: string[];
  categories: string[];
  createdAt: string;
  createdBy: string;
  imageUrl?: string;
}

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockPromotions: Promotion[] = [
          {
            id: '1',
            title: 'New Year Special - 30% Off',
            description: 'Celebrate the New Year with 30% off on all orders above $25',
            type: 'discount',
            discountValue: 30,
            discountType: 'percentage',
            code: 'NEWYEAR30',
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2024-01-31T23:59:59Z',
            status: 'active',
            targetAudience: 'all',
            minOrderValue: 25,
            maxDiscount: 15,
            usageLimit: 1000,
            usedCount: 234,
            restaurants: ['Pizza Palace', 'Burger Barn', 'Sushi Zen'],
            categories: ['Italian', 'American', 'Japanese'],
            createdAt: '2023-12-25T10:00:00Z',
            createdBy: 'John Smith',
            imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
          },
          {
            id: '2',
            title: 'Free Delivery Weekend',
            description: 'Enjoy free delivery on all orders this weekend',
            type: 'free_delivery',
            discountValue: 0,
            discountType: 'fixed',
            code: 'FREEDEL',
            startDate: '2024-01-20T00:00:00Z',
            endDate: '2024-01-21T23:59:59Z',
            status: 'scheduled',
            targetAudience: 'all',
            minOrderValue: 15,
            usageLimit: 500,
            usedCount: 0,
            restaurants: ['All Restaurants'],
            categories: ['All Categories'],
            createdAt: '2024-01-10T14:30:00Z',
            createdBy: 'Lisa Wilson',
          },
          {
            id: '3',
            title: 'VIP Customer Cashback',
            description: 'Get 10% cashback on your next order as a VIP customer',
            type: 'cashback',
            discountValue: 10,
            discountType: 'percentage',
            code: 'VIPCASH10',
            startDate: '2024-01-15T00:00:00Z',
            endDate: '2024-02-15T23:59:59Z',
            status: 'active',
            targetAudience: 'vip',
            minOrderValue: 30,
            maxDiscount: 20,
            usageLimit: 200,
            usedCount: 45,
            restaurants: ['Premium Partners'],
            categories: ['All Categories'],
            createdAt: '2024-01-08T11:20:00Z',
            createdBy: 'Mike Johnson',
            imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
          },
          {
            id: '4',
            title: 'Buy One Get One Pizza',
            description: 'Order any large pizza and get a medium pizza absolutely free!',
            type: 'bogo',
            discountValue: 0,
            discountType: 'fixed',
            code: 'BOGOPIZZA',
            startDate: '2024-01-22T00:00:00Z',
            endDate: '2024-01-28T23:59:59Z',
            status: 'draft',
            targetAudience: 'all',
            minOrderValue: 20,
            usageLimit: 300,
            usedCount: 0,
            restaurants: ['Pizza Palace', 'Italian Corner'],
            categories: ['Italian'],
            createdAt: '2024-01-18T16:45:00Z',
            createdBy: 'Sarah Davis',
            imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
          },
        ];

        setPromotions(mockPromotions);
      } catch (error) {
        console.error('Error loading promotions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, []);

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (promotion.code && promotion.code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || promotion.status === selectedStatus;
    const matchesType = selectedType === 'all' || promotion.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
      paused: 'bg-yellow-100 text-yellow-800',
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      discount: 'bg-orange-100 text-orange-800',
      bogo: 'bg-purple-100 text-purple-800',
      free_delivery: 'bg-blue-100 text-blue-800',
      cashback: 'bg-green-100 text-green-800',
      bundle: 'bg-pink-100 text-pink-800',
    };
    return badges[type as keyof typeof badges] || badges.discount;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUsagePercentage = (used: number, limit?: number) => {
    if (!limit) return 0;
    return Math.round((used / limit) * 100);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gray-300 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
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
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Promotions Management</h1>
            <p className="text-sm lg:text-base text-gray-600">Create and manage promotional campaigns and discount codes.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-orange-500 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm lg:text-base">
              <PlusIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Create Promotion
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-lg font-semibold text-gray-900">
                  {promotions.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-lg font-semibold text-gray-900">
                  {promotions.filter(p => p.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <PencilIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-lg font-semibold text-gray-900">
                  {promotions.filter(p => p.status === 'draft').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TagIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-lg font-semibold text-gray-900">
                  {promotions.filter(p => p.status === 'expired').length}
                </p>
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
                  placeholder="Search promotions..."
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
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
                <option value="paused">Paused</option>
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
                <option value="discount">Discount</option>
                <option value="bogo">Buy One Get One</option>
                <option value="free_delivery">Free Delivery</option>
                <option value="cashback">Cashback</option>
                <option value="bundle">Bundle</option>
              </select>
            </div>
          </div>
        </div>

        {/* Promotions List */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Promotions ({filteredPromotions.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredPromotions.map((promotion) => (
              <div key={promotion.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Promotion Image */}
                    <div className="flex-shrink-0">
                      {promotion.imageUrl ? (
                        <Image
                          src={promotion.imageUrl}
                          alt={promotion.title}
                          width={80}
                          height={80}
                          className="h-20 w-20 object-cover rounded-lg"
                          unoptimized
                        />
                      ) : (
                        <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <MegaphoneIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Promotion Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-900 truncate">{promotion.title}</h4>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(promotion.status)}`}>
                            {promotion.status}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(promotion.type)}`}>
                            {promotion.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2">{promotion.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Code:</span>
                          <span className="ml-1 text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                            {promotion.code || 'No code'}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Discount:</span>
                          <span className="ml-1 text-gray-600">
                            {promotion.discountType === 'percentage'
                              ? `${promotion.discountValue}%`
                              : `$${promotion.discountValue}`}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Valid:</span>
                          <span className="ml-1 text-gray-600">
                            {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium text-gray-700">Usage:</span>
                          <span className="ml-1 text-gray-600">
                            {promotion.usedCount}{promotion.usageLimit ? `/${promotion.usageLimit}` : ''}
                            {promotion.usageLimit && (
                              <span className="ml-1 text-xs text-gray-500">
                                ({getUsagePercentage(promotion.usedCount, promotion.usageLimit)}%)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Usage Progress Bar */}
                      {promotion.usageLimit && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Usage Progress</span>
                            <span>{getUsagePercentage(promotion.usedCount, promotion.usageLimit)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getUsagePercentage(promotion.usedCount, promotion.usageLimit)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Target: {promotion.targetAudience.replace('_', ' ')}</span>
                          <span>Min Order: ${promotion.minOrderValue || 0}</span>
                          {promotion.maxDiscount && <span>Max Discount: ${promotion.maxDiscount}</span>}
                          <span>Created by {promotion.createdBy}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="text-blue-600 hover:text-blue-900 p-2">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900 p-2">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900 p-2">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPromotions.length === 0 && (
            <div className="p-12 text-center">
              <MegaphoneIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria, or create your first promotion.</p>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                Create Your First Promotion
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

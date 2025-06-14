'use client';

import React, { useState, useEffect } from 'react';
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
  const [showCreateModal, setShowCreateModal] = useState(false);

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
            title: 'Buy One Get One Pizza',
            description: 'Order any large pizza and get a medium pizza free',
            type: 'bogo',
            discountValue: 50,
            discountType: 'percentage',
            code: 'BOGOPIZZA',
            startDate: '2024-01-15T00:00:00Z',
            endDate: '2024-01-25T23:59:59Z',
            status: 'active',
            targetAudience: 'returning_customers',
            minOrderValue: 20,
            usageLimit: 200,
            usedCount: 45,
            restaurants: ['Pizza Palace', 'Tony\'s Pizzeria'],
            categories: ['Italian'],
            createdAt: '2024-01-12T09:15:00Z',
            createdBy: 'David Brown',
            imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
          },
          {
            id: '4',
            title: 'VIP Customer Cashback',
            description: 'Get 10% cashback on your next order (VIP members only)',
            type: 'cashback',
            discountValue: 10,
            discountType: 'percentage',
            code: 'VIPCASH10',
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2024-12-31T23:59:59Z',
            status: 'active',
            targetAudience: 'vip',
            minOrderValue: 30,
            maxDiscount: 20,
            usageLimit: 100,
            usedCount: 67,
            restaurants: ['All Restaurants'],
            categories: ['All Categories'],
            createdAt: '2023-12-30T16:45:00Z',
            createdBy: 'Emily Rodriguez',
          },
          {
            id: '5',
            title: 'Student Discount',
            description: '15% off for students with valid ID',
            type: 'discount',
            discountValue: 15,
            discountType: 'percentage',
            code: 'STUDENT15',
            startDate: '2023-09-01T00:00:00Z',
            endDate: '2024-06-30T23:59:59Z',
            status: 'paused',
            targetAudience: 'new_customers',
            minOrderValue: 12,
            maxDiscount: 10,
            usageLimit: 500,
            usedCount: 123,
            restaurants: ['All Restaurants'],
            categories: ['All Categories'],
            createdAt: '2023-08-25T11:20:00Z',
            createdBy: 'Mike Chen',
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
    const matchesSearch = 
      promotion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promotion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (promotion.code && promotion.code.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || promotion.status === selectedStatus;
    const matchesType = selectedType === 'all' || promotion.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: Promotion['status']) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      expired: 'bg-red-100 text-red-800',
      paused: 'bg-yellow-100 text-yellow-800',
    };
    
    return badges[status] || badges.draft;
  };

  const getTypeBadge = (type: Promotion['type']) => {
    const badges = {
      discount: 'bg-purple-100 text-purple-800',
      bogo: 'bg-orange-100 text-orange-800',
      free_delivery: 'bg-blue-100 text-blue-800',
      cashback: 'bg-green-100 text-green-800',
      bundle: 'bg-pink-100 text-pink-800',
    };
    
    return badges[type] || badges.discount;
  };

  const formatDiscountValue = (promotion: Promotion) => {
    if (promotion.type === 'free_delivery') return 'Free Delivery';
    if (promotion.type === 'bogo') return 'Buy One Get One';
    
    return promotion.discountType === 'percentage' 
      ? `${promotion.discountValue}% OFF`
      : `$${promotion.discountValue} OFF`;
  };

  const handleStatusChange = (promotionId: string, newStatus: Promotion['status']) => {
    setPromotions(prev => 
      prev.map(promotion => 
        promotion.id === promotionId ? { ...promotion, status: newStatus } : promotion
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Promotions Management</h1>
          <p className="text-sm lg:text-base text-gray-600">Create and manage promotional campaigns and discount codes.</p>
        </div>
        <button
          onClick={() => console.log('Create promotion modal would open')}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Promotion
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-lg font-semibold text-gray-900">
                {promotions.reduce((sum, p) => sum + p.usedCount, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MegaphoneIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg font-semibold text-gray-900">{promotions.length}</p>
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
                placeholder="Search promotions by title, description, or code..."
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
                <div className="flex-1">
                  {/* Promotion Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {promotion.imageUrl && (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={promotion.imageUrl}
                            alt={promotion.title}
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                        </>
                      )}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{promotion.title}</h4>
                        <p className="text-sm text-gray-600">{promotion.description}</p>
                        {promotion.code && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Code: {promotion.code}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(promotion.status)}`}>
                        {promotion.status.charAt(0).toUpperCase() + promotion.status.slice(1).replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeBadge(promotion.type)}`}>
                        {promotion.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Promotion Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Discount Value</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {formatDiscountValue(promotion)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Usage</p>
                      <p className="text-sm text-gray-900">
                        {promotion.usedCount} / {promotion.usageLimit || '∞'} used
                      </p>
                      {promotion.usageLimit && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min((promotion.usedCount / promotion.usageLimit) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Valid Period</p>
                      <p className="text-sm text-gray-900">
                        {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <span><strong>Target:</strong> {promotion.targetAudience.replace('_', ' ')}</span>
                    {promotion.minOrderValue && (
                      <span><strong>Min Order:</strong> ${promotion.minOrderValue}</span>
                    )}
                    {promotion.maxDiscount && (
                      <span><strong>Max Discount:</strong> ${promotion.maxDiscount}</span>
                    )}
                    <span><strong>Created by:</strong> {promotion.createdBy}</span>
                  </div>

                  {/* Restaurants & Categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {promotion.restaurants.slice(0, 3).map((restaurant, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {restaurant}
                      </span>
                    ))}
                    {promotion.restaurants.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{promotion.restaurants.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>

                    {promotion.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(promotion.id, 'paused')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700"
                      >
                        Pause
                      </button>
                    )}

                    {promotion.status === 'paused' && (
                      <button
                        onClick={() => handleStatusChange(promotion.id, 'active')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                      >
                        Activate
                      </button>
                    )}

                    {promotion.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange(promotion.id, 'active')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Publish
                      </button>
                    )}

                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700">
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPromotions.length === 0 && (
          <div className="p-12 text-center">
            <MegaphoneIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            >
              Create Your First Promotion
            </button>
          </div>
        )}
      </div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Promotion</h3>
            <p className="text-gray-600 mb-4">Promotion creation functionality will be implemented here.</p>
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
  );
}

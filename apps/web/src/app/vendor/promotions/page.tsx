'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  MegaphoneIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  TagIcon,

  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'buy_one_get_one' | 'free_delivery';
  value: number;
  minimumOrderValue?: number;
  applicableItems: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
  promoCode?: string;
  createdAt: string;
  performance: {
    ordersGenerated: number;
    revenueGenerated: number;
    conversionRate: number;
  };
}

const mockPromotions: Promotion[] = [
  {
    id: '1',
    name: 'Weekend Special',
    description: '20% off all pizzas during weekends',
    type: 'percentage',
    value: 20,
    minimumOrderValue: 25,
    applicableItems: ['Pizza'],
    startDate: '2024-01-20',
    endDate: '2024-02-20',
    isActive: true,
    usageCount: 156,
    maxUsage: 500,
    promoCode: 'WEEKEND20',
    createdAt: '2024-01-15',
    performance: {
      ordersGenerated: 156,
      revenueGenerated: 3420.50,
      conversionRate: 12.5,
    },
  },
  {
    id: '2',
    name: 'Free Delivery Monday',
    description: 'Free delivery on all orders every Monday',
    type: 'free_delivery',
    value: 0,
    minimumOrderValue: 15,
    applicableItems: ['All'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    usageCount: 89,
    promoCode: 'FREEMON',
    createdAt: '2024-01-01',
    performance: {
      ordersGenerated: 89,
      revenueGenerated: 2156.75,
      conversionRate: 8.3,
    },
  },
  {
    id: '3',
    name: 'Buy 2 Get 1 Free Appetizers',
    description: 'Buy any 2 appetizers and get the cheapest one free',
    type: 'buy_one_get_one',
    value: 1,
    applicableItems: ['Appetizers'],
    startDate: '2024-01-10',
    endDate: '2024-01-31',
    isActive: false,
    usageCount: 45,
    maxUsage: 100,
    promoCode: 'APPETIZER3',
    createdAt: '2024-01-08',
    performance: {
      ordersGenerated: 45,
      revenueGenerated: 892.30,
      conversionRate: 15.2,
    },
  },
  {
    id: '4',
    name: 'New Customer Discount',
    description: '$5 off first order for new customers',
    type: 'fixed_amount',
    value: 5,
    minimumOrderValue: 20,
    applicableItems: ['All'],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true,
    usageCount: 234,
    promoCode: 'WELCOME5',
    createdAt: '2024-01-01',
    performance: {
      ordersGenerated: 234,
      revenueGenerated: 5678.90,
      conversionRate: 22.1,
    },
  },
];

export default function VendorPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed unused variables: showCreateModal, setShowCreateModal, selectedPromotion, setSelectedPromotion

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPromotions(mockPromotions);
      } catch (error) {
        console.error('Error loading promotions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, []);

  const togglePromotionStatus = (promotionId: string) => {
    setPromotions(promos =>
      promos.map(promo =>
        promo.id === promotionId ? { ...promo, isActive: !promo.isActive } : promo
      )
    );
  };

  const deletePromotion = (promotionId: string) => {
    if (confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
      setPromotions(promos => promos.filter(promo => promo.id !== promotionId));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'bg-blue-100 text-blue-800';
      case 'fixed_amount':
        return 'bg-green-100 text-green-800';
      case 'buy_one_get_one':
        return 'bg-purple-100 text-purple-800';
      case 'free_delivery':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'Percentage Off';
      case 'fixed_amount':
        return 'Fixed Amount';
      case 'buy_one_get_one':
        return 'BOGO';
      case 'free_delivery':
        return 'Free Delivery';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isPromotionExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
              <p className="text-gray-600">Create and manage promotional campaigns</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
              <button
                onClick={() => console.log('Create promotion modal would open')}
                className="btn-primary flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Promotion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MegaphoneIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Promotions</p>
              <p className="text-2xl font-bold text-gray-900">{promotions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Promotions</p>
              <p className="text-2xl font-bold text-gray-900">
                {promotions.filter(p => p.isActive && !isPromotionExpired(p.endDate)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenue Generated</p>
              <p className="text-2xl font-bold text-gray-900">
                ${promotions.reduce((sum, p) => sum + p.performance.revenueGenerated, 0).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Promotions List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Promotions</h2>
          <p className="text-gray-600 mt-1">Manage your promotional campaigns and track their performance</p>
        </div>
        <div className="p-6">
          {promotions.length === 0 ? (
            <div className="text-center py-12">
              <MegaphoneIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No promotions created yet</p>
              <button
                onClick={() => console.log('Create promotion modal would open')}
                className="mt-4 btn-primary"
              >
                Create Your First Promotion
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promotion) => (
                <div key={promotion.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{promotion.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(promotion.type)}`}>
                          {getTypeLabel(promotion.type)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          promotion.isActive && !isPromotionExpired(promotion.endDate)
                            ? 'bg-green-100 text-green-800'
                            : isPromotionExpired(promotion.endDate)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isPromotionExpired(promotion.endDate) ? 'Expired' : promotion.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {promotion.promoCode && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Code: {promotion.promoCode}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{promotion.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Value</p>
                          <p className="font-medium text-gray-900">
                            {promotion.type === 'percentage' ? `${promotion.value}%` :
                             promotion.type === 'fixed_amount' ? `$${promotion.value}` :
                             promotion.type === 'free_delivery' ? 'Free Delivery' :
                             `Buy ${promotion.value + 1} Get 1`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Period</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Usage</p>
                          <p className="font-medium text-gray-900">
                            {promotion.usageCount}{promotion.maxUsage ? `/${promotion.maxUsage}` : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Min. Order</p>
                          <p className="font-medium text-gray-900">
                            {promotion.minimumOrderValue ? `$${promotion.minimumOrderValue}` : 'None'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Performance Metrics */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Orders Generated</p>
                            <p className="text-lg font-semibold text-gray-900">{promotion.performance.ordersGenerated}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Revenue Generated</p>
                            <p className="text-lg font-semibold text-gray-900">${promotion.performance.revenueGenerated.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Conversion Rate</p>
                            <p className="text-lg font-semibold text-gray-900">{promotion.performance.conversionRate}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex items-center space-x-2">
                      <button
                        onClick={() => togglePromotionStatus(promotion.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          promotion.isActive 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={promotion.isActive ? 'Deactivate promotion' : 'Activate promotion'}
                      >
                        {promotion.isActive ? (
                          <EyeIcon className="h-5 w-5" />
                        ) : (
                          <EyeSlashIcon className="h-5 w-5" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => console.log('Edit promotion:', promotion.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit promotion"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => deletePromotion(promotion.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete promotion"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => console.log('Create promotion modal would open')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
            >
              <PlusIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Create New Promotion</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <ChartBarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">View Analytics</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center">
              <TagIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Promotion Templates</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

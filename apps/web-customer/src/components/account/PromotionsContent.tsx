'use client';

import React, { useState, useEffect } from 'react';
import {
  GiftIcon,
  TagIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  StarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: string;
  type: 'percentage' | 'fixed' | 'free_delivery' | 'bogo';
  minOrder?: number;
  maxDiscount?: number;
  validUntil: Date;
  isActive: boolean;
  isUsed: boolean;
  usageCount?: number;
  maxUsage?: number;
  restaurants?: string[];
  featured?: boolean;
}

export default function PromotionsContent() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading promotions data
    setTimeout(() => {
      setPromotions([
        {
          id: '1',
          title: 'Welcome Bonus',
          description: 'Get 20% off your first order with us!',
          code: 'WELCOME20',
          discount: '20%',
          type: 'percentage',
          minOrder: 15,
          maxDiscount: 10,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
          isUsed: false,
          featured: true,
        },
        {
          id: '2',
          title: 'Free Delivery Weekend',
          description: 'Enjoy free delivery on all orders this weekend',
          code: 'FREEDEL',
          discount: 'Free Delivery',
          type: 'free_delivery',
          validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          isActive: true,
          isUsed: false,
          featured: true,
        },
        {
          id: '3',
          title: '$5 Off Large Orders',
          description: 'Save $5 on orders over $30',
          code: 'SAVE5',
          discount: '$5',
          type: 'fixed',
          minOrder: 30,
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          isActive: true,
          isUsed: false,
        },
        {
          id: '4',
          title: 'Buy One Get One Pizza',
          description: 'Buy any pizza and get another one free!',
          code: 'BOGOPIZZA',
          discount: 'BOGO',
          type: 'bogo',
          validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          isActive: true,
          isUsed: false,
          restaurants: ['Pizza Palace', 'Tony\'s Pizzeria'],
        },
        {
          id: '5',
          title: 'Student Discount',
          description: '15% off for students with valid ID',
          code: 'STUDENT15',
          discount: '15%',
          type: 'percentage',
          maxDiscount: 8,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
          isUsed: true,
          usageCount: 1,
          maxUsage: 3,
        },
        {
          id: '6',
          title: 'Holiday Special',
          description: '25% off all orders during holidays',
          code: 'HOLIDAY25',
          discount: '25%',
          type: 'percentage',
          minOrder: 25,
          validUntil: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Expired
          isActive: false,
          isUsed: false,
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'percentage':
      case 'fixed':
        return TagIcon;
      case 'free_delivery':
        return GiftIcon;
      case 'bogo':
        return StarIcon;
      default:
        return TagIcon;
    }
  };

  const getPromotionColor = (promotion: Promotion) => {
    if (!promotion.isActive) return 'border-gray-200 bg-gray-50';
    if (promotion.featured) return 'border-orange-200 bg-orange-50';
    return 'border-gray-200 bg-white';
  };

  const getStatusBadge = (promotion: Promotion) => {
    if (!promotion.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Expired</span>;
    }
    if (promotion.isUsed && promotion.maxUsage && promotion.usageCount === promotion.maxUsage) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Used</span>;
    }
    if (promotion.featured) {
      return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Featured</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  const getDaysRemaining = (validUntil: Date) => {
    const now = new Date();
    const diffTime = validUntil.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `${diffDays} days left`;
  };

  const filteredPromotions = promotions.filter(promotion => {
    switch (filter) {
      case 'active':
        return promotion.isActive && !promotion.isUsed;
      case 'used':
        return promotion.isUsed;
      case 'expired':
        return !promotion.isActive;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Promotions & Offers</h1>
            <p className="text-gray-600">Save money with exclusive deals and discount codes</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-600">
              {promotions.filter(p => p.isActive && !p.isUsed).length}
            </p>
            <p className="text-sm text-gray-500">Available Offers</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All Offers', count: promotions.length },
            { key: 'active', label: 'Active', count: promotions.filter(p => p.isActive && !p.isUsed).length },
            { key: 'used', label: 'Used', count: promotions.filter(p => p.isUsed).length },
            { key: 'expired', label: 'Expired', count: promotions.filter(p => !p.isActive).length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as 'all' | 'active' | 'used' | 'expired')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPromotions.length > 0 ? (
          filteredPromotions.map((promotion) => {
            const PromotionIcon = getPromotionIcon(promotion.type);
            const isExpiringSoon = promotion.isActive && 
              new Date(promotion.validUntil).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000;
            
            return (
              <div
                key={promotion.id}
                className={`rounded-xl border-2 p-6 transition-all hover:shadow-md ${getPromotionColor(promotion)}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      promotion.isActive ? 'bg-orange-100' : 'bg-gray-200'
                    }`}>
                      <PromotionIcon className={`h-5 w-5 ${
                        promotion.isActive ? 'text-orange-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        promotion.isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {promotion.title}
                      </h3>
                      <p className="text-lg font-bold text-orange-600">{promotion.discount} OFF</p>
                    </div>
                  </div>
                  {getStatusBadge(promotion)}
                </div>

                {/* Description */}
                <p className={`text-sm mb-4 ${
                  promotion.isActive ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {promotion.description}
                </p>

                {/* Conditions */}
                {(promotion.minOrder || promotion.maxDiscount || promotion.restaurants) && (
                  <div className="mb-4 space-y-1">
                    {promotion.minOrder && (
                      <p className="text-xs text-gray-500">
                        • Minimum order: ${promotion.minOrder}
                      </p>
                    )}
                    {promotion.maxDiscount && (
                      <p className="text-xs text-gray-500">
                        • Maximum discount: ${promotion.maxDiscount}
                      </p>
                    )}
                    {promotion.restaurants && (
                      <p className="text-xs text-gray-500">
                        • Valid at: {promotion.restaurants.join(', ')}
                      </p>
                    )}
                    {promotion.maxUsage && (
                      <p className="text-xs text-gray-500">
                        • Can be used {promotion.maxUsage} times
                        {promotion.usageCount && ` (${promotion.usageCount} used)`}
                      </p>
                    )}
                  </div>
                )}

                {/* Expiry Warning */}
                {isExpiringSoon && (
                  <div className="flex items-center space-x-2 mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs text-yellow-800 font-medium">
                      {getDaysRemaining(promotion.validUntil)}
                    </span>
                  </div>
                )}

                {/* Code and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <code className={`px-3 py-1 rounded font-mono text-sm border ${
                      promotion.isActive 
                        ? 'bg-gray-100 border-gray-300 text-gray-900' 
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}>
                      {promotion.code}
                    </code>
                    {promotion.isActive && (
                      <button
                        onClick={() => copyToClipboard(promotion.code)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === promotion.code ? (
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{getDaysRemaining(promotion.validUntil)}</span>
                  </div>
                </div>

                {/* Use Button */}
                {promotion.isActive && !promotion.isUsed && (
                  <button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                    Use This Offer
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Check back later for new offers and deals!'
                : `No ${filter} promotions available.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  StarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  GiftIcon,
  TrophyIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface LoyaltyTier {
  id: string;
  name: string;
  description: string;
  minPoints: number;
  maxPoints?: number;
  benefits: {
    discountPercentage?: number;
    freeDelivery?: boolean;
    prioritySupport?: boolean;
    exclusiveOffers?: boolean;
    birthdayBonus?: number;
    pointsMultiplier?: number;
  };
  color: string;
  icon: string;
  memberCount: number;
  averageSpend: number;
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'free_item' | 'free_delivery' | 'cashback' | 'experience';
  pointsCost: number;
  value: number;
  status: 'active' | 'inactive' | 'limited_time';
  availability: {
    totalStock?: number;
    remainingStock?: number;
    unlimited: boolean;
  };
  restrictions: {
    minOrderValue?: number;
    validTiers?: string[];
    expiryDays?: number;
  };
  redemptions: {
    total: number;
    thisMonth: number;
    revenue: number;
  };
  createdAt: string;
  expiresAt?: string;
}

interface LoyaltyMember {
  id: string;
  customerName: string;
  email: string;
  currentTier: string;
  totalPoints: number;
  availablePoints: number;
  lifetimeSpend: number;
  joinedAt: string;
  lastActivity: string;
  totalRedemptions: number;
  status: 'active' | 'inactive' | 'suspended';
}

export default function MarketingLoyalty() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tiers' | 'rewards' | 'members'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([]);
  const [loyaltyRewards, setLoyaltyRewards] = useState<LoyaltyReward[]>([]);
  const [loyaltyMembers, setLoyaltyMembers] = useState<LoyaltyMember[]>([]);

  useEffect(() => {
    const loadLoyaltyData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockTiers: LoyaltyTier[] = [
          {
            id: 'tier_bronze',
            name: 'Bronze',
            description: 'Entry level with basic benefits',
            minPoints: 0,
            maxPoints: 499,
            benefits: {
              discountPercentage: 5,
              pointsMultiplier: 1,
            },
            color: '#CD7F32',
            icon: '🥉',
            memberCount: 8450,
            averageSpend: 28.50,
          },
          {
            id: 'tier_silver',
            name: 'Silver',
            description: 'Enhanced benefits for regular customers',
            minPoints: 500,
            maxPoints: 1499,
            benefits: {
              discountPercentage: 10,
              freeDelivery: true,
              pointsMultiplier: 1.5,
              birthdayBonus: 100,
            },
            color: '#C0C0C0',
            icon: '🥈',
            memberCount: 3250,
            averageSpend: 45.75,
          },
          {
            id: 'tier_gold',
            name: 'Gold',
            description: 'Premium benefits for loyal customers',
            minPoints: 1500,
            maxPoints: 2999,
            benefits: {
              discountPercentage: 15,
              freeDelivery: true,
              prioritySupport: true,
              exclusiveOffers: true,
              pointsMultiplier: 2,
              birthdayBonus: 250,
            },
            color: '#FFD700',
            icon: '🥇',
            memberCount: 1200,
            averageSpend: 78.25,
          },
          {
            id: 'tier_platinum',
            name: 'Platinum',
            description: 'VIP treatment for our most valued customers',
            minPoints: 3000,
            benefits: {
              discountPercentage: 20,
              freeDelivery: true,
              prioritySupport: true,
              exclusiveOffers: true,
              pointsMultiplier: 3,
              birthdayBonus: 500,
            },
            color: '#E5E4E2',
            icon: '💎',
            memberCount: 450,
            averageSpend: 125.80,
          },
        ];

        const mockRewards: LoyaltyReward[] = [
          {
            id: 'reward_001',
            name: '$5 Off Next Order',
            description: 'Get $5 discount on your next order of $25 or more',
            type: 'discount',
            pointsCost: 500,
            value: 5,
            status: 'active',
            availability: {
              unlimited: true,
            },
            restrictions: {
              minOrderValue: 25,
              expiryDays: 30,
            },
            redemptions: {
              total: 2340,
              thisMonth: 456,
              revenue: 11700,
            },
            createdAt: '2023-06-15T10:00:00Z',
          },
          {
            id: 'reward_002',
            name: 'Free Delivery',
            description: 'Free delivery on any order',
            type: 'free_delivery',
            pointsCost: 200,
            value: 4.99,
            status: 'active',
            availability: {
              unlimited: true,
            },
            restrictions: {
              expiryDays: 14,
            },
            redemptions: {
              total: 5670,
              thisMonth: 890,
              revenue: 28300.30,
            },
            createdAt: '2023-07-01T09:00:00Z',
          },
          {
            id: 'reward_003',
            name: 'Free Dessert',
            description: 'Get a free dessert with any main course order',
            type: 'free_item',
            pointsCost: 300,
            value: 8.99,
            status: 'active',
            availability: {
              totalStock: 1000,
              remainingStock: 234,
              unlimited: false,
            },
            restrictions: {
              minOrderValue: 20,
              validTiers: ['gold', 'platinum'],
              expiryDays: 7,
            },
            redemptions: {
              total: 766,
              thisMonth: 123,
              revenue: 6888.34,
            },
            createdAt: '2023-08-10T14:30:00Z',
          },
        ];

        const mockMembers: LoyaltyMember[] = [
          {
            id: 'member_001',
            customerName: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            currentTier: 'Gold',
            totalPoints: 2450,
            availablePoints: 1200,
            lifetimeSpend: 1850.75,
            joinedAt: '2023-03-15T10:00:00Z',
            lastActivity: '2024-01-18T14:30:00Z',
            totalRedemptions: 12,
            status: 'active',
          },
          {
            id: 'member_002',
            customerName: 'Mike Chen',
            email: 'mike.chen@email.com',
            currentTier: 'Platinum',
            totalPoints: 4200,
            availablePoints: 850,
            lifetimeSpend: 3250.50,
            joinedAt: '2023-01-20T09:15:00Z',
            lastActivity: '2024-01-19T11:45:00Z',
            totalRedemptions: 28,
            status: 'active',
          },
          {
            id: 'member_003',
            customerName: 'Emily Rodriguez',
            email: 'emily.r@email.com',
            currentTier: 'Silver',
            totalPoints: 890,
            availablePoints: 450,
            lifetimeSpend: 675.25,
            joinedAt: '2023-06-10T16:20:00Z',
            lastActivity: '2024-01-17T19:15:00Z',
            totalRedemptions: 6,
            status: 'active',
          },
        ];

        setLoyaltyTiers(mockTiers);
        setLoyaltyRewards(mockRewards);
        setLoyaltyMembers(mockMembers);
      } catch (error) {
        console.error('Error loading loyalty data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLoyaltyData();
  }, []);

  const totalMembers = loyaltyMembers.length;
  const activeMembers = loyaltyMembers.filter(m => m.status === 'active').length;
  const totalPointsIssued = loyaltyMembers.reduce((sum, m) => sum + m.totalPoints, 0);
  const totalRedemptions = loyaltyRewards.reduce((sum, r) => sum + r.redemptions.total, 0);
  const totalRevenueFromLoyalty = loyaltyRewards.reduce((sum, r) => sum + r.redemptions.revenue, 0);

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
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Loyalty Program</h1>
            <p className="text-sm lg:text-base text-gray-600">Manage loyalty tiers, rewards, and member engagement.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-orange-500 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm lg:text-base">
              <PlusIcon className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Add Reward
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-lg font-semibold text-gray-900">{totalMembers.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-lg font-semibold text-gray-900">{activeMembers.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <StarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Points Issued</p>
                <p className="text-lg font-semibold text-gray-900">{totalPointsIssued.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <GiftIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Redemptions</p>
                <p className="text-lg font-semibold text-gray-900">{totalRedemptions.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
                <p className="text-lg font-semibold text-gray-900">${totalRevenueFromLoyalty.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5" />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('tiers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tiers'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrophyIcon className="w-5 h-5" />
                  <span>Tiers ({loyaltyTiers.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('rewards')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rewards'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <GiftIcon className="w-5 h-5" />
                  <span>Rewards ({loyaltyRewards.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="w-5 h-5" />
                  <span>Members ({totalMembers})</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tier Distribution */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Member Distribution by Tier</h3>
                    <div className="space-y-3">
                      {loyaltyTiers.map((tier) => {
                        const percentage = totalMembers > 0 ? (tier.memberCount / totalMembers) * 100 : 0;
                        return (
                          <div key={tier.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{tier.icon}</span>
                              <div>
                                <p className="font-medium text-gray-900">{tier.name}</p>
                                <p className="text-sm text-gray-500">{tier.memberCount.toLocaleString()} members</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{percentage.toFixed(1)}%</p>
                              <p className="text-sm text-gray-500">Avg: ${tier.averageSpend}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Rewards */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Most Popular Rewards</h3>
                    <div className="space-y-3">
                      {loyaltyRewards
                        .sort((a, b) => b.redemptions.total - a.redemptions.total)
                        .slice(0, 3)
                        .map((reward) => (
                          <div key={reward.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <GiftIcon className="h-5 w-5 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{reward.name}</p>
                                <p className="text-sm text-gray-500">{reward.pointsCost} points</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{reward.redemptions.total}</p>
                              <p className="text-sm text-gray-500">redemptions</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tiers Tab */}
            {activeTab === 'tiers' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Loyalty Tiers</h3>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Tier
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {loyaltyTiers.map((tier) => (
                    <div key={tier.id} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors">
                      <div className="text-center mb-4">
                        <span className="text-4xl mb-2 block">{tier.icon}</span>
                        <h4 className="text-xl font-bold text-gray-900">{tier.name}</h4>
                        <p className="text-sm text-gray-600">{tier.description}</p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Points Range:</span>
                          <span className="font-medium">
                            {tier.minPoints}{tier.maxPoints ? ` - ${tier.maxPoints}` : '+'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Members:</span>
                          <span className="font-medium">{tier.memberCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Avg Spend:</span>
                          <span className="font-medium">${tier.averageSpend}</span>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Benefits:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {tier.benefits.discountPercentage && (
                            <li>• {tier.benefits.discountPercentage}% discount</li>
                          )}
                          {tier.benefits.freeDelivery && <li>• Free delivery</li>}
                          {tier.benefits.prioritySupport && <li>• Priority support</li>}
                          {tier.benefits.exclusiveOffers && <li>• Exclusive offers</li>}
                          {tier.benefits.pointsMultiplier && (
                            <li>• {tier.benefits.pointsMultiplier}x points multiplier</li>
                          )}
                          {tier.benefits.birthdayBonus && (
                            <li>• {tier.benefits.birthdayBonus} birthday bonus points</li>
                          )}
                        </ul>
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <button className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                          <PencilIcon className="h-4 w-4 inline mr-1" />
                          Edit
                        </button>
                        <button className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                          <EyeIcon className="h-4 w-4 inline mr-1" />
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Loyalty Rewards</h3>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Reward
                  </button>
                </div>

                <div className="space-y-4">
                  {loyaltyRewards.map((reward) => (
                    <div key={reward.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <GiftIcon className="h-8 w-8 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{reward.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Type: {reward.type.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>Cost: {reward.pointsCost} points</span>
                              <span>•</span>
                              <span>Value: ${reward.value}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            reward.status === 'active' ? 'bg-green-100 text-green-800' :
                            reward.status === 'limited_time' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reward.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">Total Redemptions</p>
                          <p className="text-lg font-semibold text-gray-900">{reward.redemptions.total}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">This Month</p>
                          <p className="text-lg font-semibold text-blue-600">{reward.redemptions.thisMonth}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
                          <p className="text-lg font-semibold text-green-600">${reward.redemptions.revenue.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">Stock</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {reward.availability.unlimited ? '∞' : reward.availability.remainingStock}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View Details
                          </button>
                          <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700">
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>

                        <div className="text-xs text-gray-500">
                          Created: {new Date(reward.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <h3 className="text-lg font-medium text-gray-900">Loyalty Members</h3>

                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="all">All Members</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Member
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tier
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Points
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lifetime Spend
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Activity
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
                        {loyaltyMembers.map((member) => (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{member.customerName}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {member.currentTier}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{member.availablePoints.toLocaleString()} available</div>
                              <div className="text-sm text-gray-500">{member.totalPoints.toLocaleString()} total</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${member.lifetimeSpend.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(member.lastActivity).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                member.status === 'active' ? 'bg-green-100 text-green-800' :
                                member.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {member.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

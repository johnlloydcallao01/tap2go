'use client';

import React, { useState, useEffect } from 'react';
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
// Removed unused import: StarIcon as StarIconSolid

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

export default function AdminMarketingLoyalty() {
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
          {
            id: 'reward_004',
            name: '$20 Cashback',
            description: 'Get $20 cashback on orders over $100',
            type: 'cashback',
            pointsCost: 2000,
            value: 20,
            status: 'limited_time',
            availability: {
              totalStock: 500,
              remainingStock: 89,
              unlimited: false,
            },
            restrictions: {
              minOrderValue: 100,
              validTiers: ['platinum'],
              expiryDays: 60,
            },
            redemptions: {
              total: 411,
              thisMonth: 67,
              revenue: 8220,
            },
            createdAt: '2024-01-01T00:00:00Z',
            expiresAt: '2024-02-29T23:59:59Z',
          },
          {
            id: 'reward_005',
            name: 'Chef\'s Table Experience',
            description: 'Exclusive dining experience with our partner restaurants',
            type: 'experience',
            pointsCost: 5000,
            value: 150,
            status: 'active',
            availability: {
              totalStock: 50,
              remainingStock: 12,
              unlimited: false,
            },
            restrictions: {
              validTiers: ['platinum'],
              expiryDays: 90,
            },
            redemptions: {
              total: 38,
              thisMonth: 3,
              revenue: 5700,
            },
            createdAt: '2023-12-01T10:00:00Z',
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
          {
            id: 'member_004',
            customerName: 'David Wilson',
            email: 'david.w@email.com',
            currentTier: 'Bronze',
            totalPoints: 320,
            availablePoints: 320,
            lifetimeSpend: 245.80,
            joinedAt: '2023-11-05T12:30:00Z',
            lastActivity: '2024-01-10T15:20:00Z',
            totalRedemptions: 0,
            status: 'active',
          },
          {
            id: 'member_005',
            customerName: 'Lisa Thompson',
            email: 'lisa.t@email.com',
            currentTier: 'Gold',
            totalPoints: 1850,
            availablePoints: 200,
            lifetimeSpend: 1420.90,
            joinedAt: '2023-04-22T08:45:00Z',
            lastActivity: '2023-12-15T13:10:00Z',
            totalRedemptions: 15,
            status: 'inactive',
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Loyalty Program</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage customer loyalty tiers, rewards, and member engagement.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
            <PlusIcon className="h-4 w-4 mr-2" />
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
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Revenue Impact</p>
              <p className="text-lg font-semibold text-gray-900">${totalRevenueFromLoyalty.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'tiers', name: 'Loyalty Tiers', icon: TrophyIcon },
              { id: 'rewards', name: 'Rewards', icon: GiftIcon },
              { id: 'members', name: 'Members', icon: UserGroupIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'tiers' | 'rewards' | 'members')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Program Overview</h3>

              {/* Tier Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Member Distribution by Tier</h4>
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
                            <p className="font-medium text-gray-900">{percentage.toFixed(1)}%</p>
                            <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: tier.color
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Top Performing Rewards</h4>
                  <div className="space-y-3">
                    {loyaltyRewards
                      .sort((a, b) => b.redemptions.thisMonth - a.redemptions.thisMonth)
                      .slice(0, 5)
                      .map((reward) => (
                        <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{reward.name}</p>
                            <p className="text-sm text-gray-500">{reward.pointsCost} points</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{reward.redemptions.thisMonth}</p>
                            <p className="text-sm text-gray-500">this month</p>
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Loyalty Tiers</h3>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Tier
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loyaltyTiers.map((tier) => (
                  <div key={tier.id} className="bg-white border-2 rounded-lg p-6 hover:shadow-lg transition-shadow"
                       style={{ borderColor: tier.color }}>
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

                    <div className="space-y-2 mb-4">
                      <h5 className="font-medium text-gray-900">Benefits:</h5>
                      {tier.benefits.discountPercentage && (
                        <p className="text-sm text-gray-600">• {tier.benefits.discountPercentage}% discount</p>
                      )}
                      {tier.benefits.freeDelivery && (
                        <p className="text-sm text-gray-600">• Free delivery</p>
                      )}
                      {tier.benefits.prioritySupport && (
                        <p className="text-sm text-gray-600">• Priority support</p>
                      )}
                      {tier.benefits.exclusiveOffers && (
                        <p className="text-sm text-gray-600">• Exclusive offers</p>
                      )}
                      {tier.benefits.pointsMultiplier && (
                        <p className="text-sm text-gray-600">• {tier.benefits.pointsMultiplier}x points</p>
                      )}
                      {tier.benefits.birthdayBonus && (
                        <p className="text-sm text-gray-600">• {tier.benefits.birthdayBonus} birthday points</p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                        Edit
                      </button>
                      <button className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200">
                        Delete
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Loyalty Rewards</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search rewards..."
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
                    <option value="all">All Rewards</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="limited_time">Limited Time</option>
                  </select>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Reward
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loyaltyRewards
                  .filter(reward => {
                    const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        reward.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesFilter = selectedFilter === 'all' || reward.status === selectedFilter;
                    return matchesSearch && matchesFilter;
                  })
                  .map((reward) => (
                    <div key={reward.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{reward.name}</h4>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          reward.status === 'active' ? 'bg-green-100 text-green-800' :
                          reward.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {reward.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Points Cost</p>
                          <p className="text-lg font-semibold text-orange-600">{reward.pointsCost}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Value</p>
                          <p className="text-lg font-semibold text-green-600">${reward.value}</p>
                        </div>
                      </div>

                      {!reward.availability.unlimited && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Stock</span>
                            <span>{reward.availability.remainingStock} / {reward.availability.totalStock}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{
                                width: `${((reward.availability.remainingStock || 0) / (reward.availability.totalStock || 1)) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-semibold">{reward.redemptions.total}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">This Month</p>
                          <p className="font-semibold">{reward.redemptions.thisMonth}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Revenue</p>
                          <p className="font-semibold">${reward.redemptions.revenue.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                          <EyeIcon className="h-4 w-4 inline mr-1" />
                          View
                        </button>
                        <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200">
                          <PencilIcon className="h-4 w-4 inline mr-1" />
                          Edit
                        </button>
                        <button className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200">
                          <TrashIcon className="h-4 w-4 inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
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
                    <option value="all">All Tiers</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
              </div>

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
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loyaltyMembers
                      .filter(member => {
                        const matchesSearch = member.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            member.email.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesFilter = selectedFilter === 'all' || member.currentTier === selectedFilter;
                        return matchesSearch && matchesFilter;
                      })
                      .map((member) => {
                        const tier = loyaltyTiers.find(t => t.name === member.currentTier);
                        return (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {member.customerName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{member.customerName}</div>
                                  <div className="text-sm text-gray-500">{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-lg mr-2">{tier?.icon}</span>
                                <span className="text-sm font-medium" style={{ color: tier?.color }}>
                                  {member.currentTier}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{member.availablePoints.toLocaleString()}</div>
                              <div className="text-sm text-gray-500">of {member.totalPoints.toLocaleString()} total</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${member.lifetimeSpend.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                member.status === 'active' ? 'bg-green-100 text-green-800' :
                                member.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {member.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(member.lastActivity).toLocaleDateString()}
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
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  GiftIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  ClockIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface LoyaltyData {
  currentPoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  nextTier: string;
  pointsToNextTier: number;
  totalEarned: number;
  totalRedeemed: number;
  expiringPoints: number;
  expirationDate: Date;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  value: string;
  category: 'discount' | 'free_item' | 'free_delivery' | 'cashback';
  available: boolean;
  expiresAt?: Date;
  image?: string;
}

interface PointsHistory {
  id: string;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description: string;
  date: Date;
  orderNumber?: string;
}

export default function LoyaltyContent() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');

  useEffect(() => {
    // Simulate loading loyalty data
    setTimeout(() => {
      setLoyaltyData({
        currentPoints: 2340,
        tier: 'Gold',
        nextTier: 'Platinum',
        pointsToNextTier: 660,
        totalEarned: 4580,
        totalRedeemed: 2240,
        expiringPoints: 150,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });

      setRewards([
        {
          id: '1',
          title: '$5 Off Your Order',
          description: 'Get $5 off any order over $25',
          pointsCost: 500,
          value: '$5.00',
          category: 'discount',
          available: true,
        },
        {
          id: '2',
          title: 'Free Delivery',
          description: 'Free delivery on your next order',
          pointsCost: 200,
          value: 'Up to $4.99',
          category: 'free_delivery',
          available: true,
        },
        {
          id: '3',
          title: 'Free Appetizer',
          description: 'Get a free appetizer with any main course',
          pointsCost: 800,
          value: 'Up to $12.99',
          category: 'free_item',
          available: true,
        },
        {
          id: '4',
          title: '$10 Off Your Order',
          description: 'Get $10 off any order over $50',
          pointsCost: 1000,
          value: '$10.00',
          category: 'discount',
          available: true,
        },
        {
          id: '5',
          title: '20% Cashback',
          description: 'Get 20% cashback on your next order (max $15)',
          pointsCost: 1500,
          value: 'Up to $15.00',
          category: 'cashback',
          available: true,
        },
        {
          id: '6',
          title: 'Free Premium Meal',
          description: 'Get a free premium meal from select restaurants',
          pointsCost: 2500,
          value: 'Up to $25.00',
          category: 'free_item',
          available: false, // Not enough points
        },
      ]);

      setPointsHistory([
        {
          id: '1',
          type: 'earned',
          points: 25,
          description: 'Order completed',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          orderNumber: 'ORD-2024-001',
        },
        {
          id: '2',
          type: 'redeemed',
          points: -500,
          description: 'Redeemed $5 off coupon',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: '3',
          type: 'earned',
          points: 18,
          description: 'Order completed',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          orderNumber: 'ORD-2024-002',
        },
        {
          id: '4',
          type: 'earned',
          points: 50,
          description: 'Bonus points for review',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          id: '5',
          type: 'expired',
          points: -100,
          description: 'Points expired',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'text-amber-600 bg-amber-50';
      case 'Silver': return 'text-gray-600 bg-gray-50';
      case 'Gold': return 'text-yellow-600 bg-yellow-50';
      case 'Platinum': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Bronze': return StarIcon;
      case 'Silver': return StarIcon;
      case 'Gold': return TrophyIcon;
      case 'Platinum': return FireIcon;
      default: return StarIcon;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discount': return CurrencyDollarIcon;
      case 'free_delivery': return ArrowRightIcon;
      case 'free_item': return GiftIcon;
      case 'cashback': return CurrencyDollarIcon;
      default: return GiftIcon;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!loyaltyData) return null;

  const TierIcon = getTierIcon(loyaltyData.tier);
  const progressPercentage = ((loyaltyData.currentPoints) / (loyaltyData.currentPoints + loyaltyData.pointsToNextTier)) * 100;

  return (
    <div className="space-y-6">
      {/* Header & Tier Status */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Loyalty Rewards</h1>
            <p className="text-orange-100">Earn points with every order and unlock amazing rewards!</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${getTierColor(loyaltyData.tier)} text-sm font-medium flex items-center`}>
            <TierIcon className="h-4 w-4 mr-2" />
            {loyaltyData.tier} Member
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold">{loyaltyData.currentPoints.toLocaleString()}</p>
            <p className="text-orange-100">Available Points</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{loyaltyData.totalEarned.toLocaleString()}</p>
            <p className="text-orange-100">Total Earned</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{loyaltyData.pointsToNextTier}</p>
            <p className="text-orange-100">To {loyaltyData.nextTier}</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to {loyaltyData.nextTier}</span>
            <span>{loyaltyData.pointsToNextTier} points needed</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Expiring Points Alert */}
      {loyaltyData.expiringPoints > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium text-yellow-800">
                {loyaltyData.expiringPoints} points expiring soon!
              </p>
              <p className="text-sm text-yellow-700">
                Use them before {formatDate(loyaltyData.expirationDate)} to avoid losing them.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'rewards', label: 'Available Rewards', icon: GiftIcon },
              { key: 'history', label: 'Points History', icon: ClockIcon },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'rewards' | 'history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.key
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'rewards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => {
                const CategoryIcon = getCategoryIcon(reward.category);
                const canRedeem = loyaltyData.currentPoints >= reward.pointsCost;
                
                return (
                  <div
                    key={reward.id}
                    className={`border rounded-xl p-6 transition-all ${
                      canRedeem
                        ? 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        canRedeem ? 'bg-orange-100' : 'bg-gray-200'
                      }`}>
                        <CategoryIcon className={`h-5 w-5 ${
                          canRedeem ? 'text-orange-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${
                        canRedeem ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {reward.pointsCost} pts
                      </span>
                    </div>
                    
                    <h3 className={`font-semibold mb-2 ${
                      canRedeem ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {reward.title}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      canRedeem ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {reward.description}
                    </p>
                    <p className={`text-sm font-medium mb-4 ${
                      canRedeem ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                      Value: {reward.value}
                    </p>
                    
                    <button
                      disabled={!canRedeem}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        canRedeem
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canRedeem ? 'Redeem Now' : 'Not Enough Points'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {pointsHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      entry.type === 'earned' ? 'bg-green-100' :
                      entry.type === 'redeemed' ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      {entry.type === 'earned' ? (
                        <ArrowRightIcon className="h-4 w-4 text-green-600 rotate-180" />
                      ) : entry.type === 'redeemed' ? (
                        <GiftIcon className="h-4 w-4 text-blue-600" />
                      ) : (
                        <ClockIcon className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{entry.description}</p>
                      {entry.orderNumber && (
                        <p className="text-sm text-gray-500">Order #{entry.orderNumber}</p>
                      )}
                      <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    entry.type === 'earned' ? 'text-green-600' :
                    entry.type === 'redeemed' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {entry.type === 'earned' ? '+' : ''}{entry.points}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

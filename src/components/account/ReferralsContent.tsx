'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlusIcon,
  GiftIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  UsersIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  referralBonus: number;
  friendBonus: number;
}

interface Referral {
  id: string;
  friendName: string;
  friendEmail: string;
  status: 'pending' | 'completed' | 'expired';
  dateReferred: Date;
  dateCompleted?: Date;
  earnings: number;
  orderCount: number;
}

export default function ReferralsContent() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [] = useState<'email' | 'sms' | 'social' | null>(null);

  useEffect(() => {
    // Simulate loading referral data
    setTimeout(() => {
      setReferralData({
        referralCode: 'JOHN2024',
        totalReferrals: 8,
        totalEarnings: 120.00,
        pendingEarnings: 25.00,
        referralBonus: 15.00,
        friendBonus: 10.00,
      });

      setReferrals([
        {
          id: '1',
          friendName: 'Sarah Johnson',
          friendEmail: 'sarah.j@email.com',
          status: 'completed',
          dateReferred: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          dateCompleted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          earnings: 15.00,
          orderCount: 5,
        },
        {
          id: '2',
          friendName: 'Mike Chen',
          friendEmail: 'mike.chen@email.com',
          status: 'completed',
          dateReferred: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          dateCompleted: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
          earnings: 15.00,
          orderCount: 3,
        },
        {
          id: '3',
          friendName: 'Emily Davis',
          friendEmail: 'emily.d@email.com',
          status: 'pending',
          dateReferred: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          earnings: 0,
          orderCount: 0,
        },
        {
          id: '4',
          friendName: 'Alex Rodriguez',
          friendEmail: 'alex.r@email.com',
          status: 'completed',
          dateReferred: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          dateCompleted: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          earnings: 15.00,
          orderCount: 8,
        },
        {
          id: '5',
          friendName: 'Lisa Wang',
          friendEmail: 'lisa.w@email.com',
          status: 'expired',
          dateReferred: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          earnings: 0,
          orderCount: 0,
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const copyReferralCode = async () => {
    if (!referralData) return;
    
    try {
      await navigator.clipboard.writeText(referralData.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral code:', err);
    }
  };

  const shareReferral = (method: 'email' | 'sms' | 'social') => {
    if (!referralData) return;

    const referralLink = `https://tap2go.com/signup?ref=${referralData.referralCode}`;
    const message = `Hey! I've been using Tap2Go for food delivery and thought you'd love it too. Use my referral code "${referralData.referralCode}" and we'll both get $${referralData.friendBonus} off our next orders! Sign up here: ${referralLink}`;

    switch (method) {
      case 'email':
        window.open(`mailto:?subject=Join me on Tap2Go!&body=${encodeURIComponent(message)}`);
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(message)}`);
        break;
      case 'social':
        // In a real app, this would integrate with social media APIs
        navigator.clipboard.writeText(message);
        alert('Message copied to clipboard! You can now paste it on your favorite social platform.');
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (!referralData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Refer Friends & Earn</h1>
            <p className="text-purple-100">
              Share the love and earn ${referralData.referralBonus} for every friend who joins!
            </p>
          </div>
          <div className="text-center">
            <TrophyIcon className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
            <p className="text-sm text-purple-100">Referral Champion</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{referralData.totalReferrals}</p>
            <p className="text-purple-100 text-sm">Friends Referred</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">${referralData.totalEarnings.toFixed(2)}</p>
            <p className="text-purple-100 text-sm">Total Earned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">${referralData.pendingEarnings.toFixed(2)}</p>
            <p className="text-purple-100 text-sm">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">${referralData.referralBonus.toFixed(2)}</p>
            <p className="text-purple-100 text-sm">Per Referral</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShareIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">1. Share Your Code</h3>
            <p className="text-sm text-gray-600">
              Share your unique referral code with friends and family
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserPlusIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">2. Friend Signs Up</h3>
            <p className="text-sm text-gray-600">
              Your friend creates an account using your referral code
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <GiftIcon className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">3. Both Get Rewards</h3>
            <p className="text-sm text-gray-600">
              You both receive ${referralData.friendBonus} off your next orders!
            </p>
          </div>
        </div>
      </div>

      {/* Referral Code & Sharing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Code</h2>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <code className="text-2xl font-bold text-orange-600 tracking-wider">
                {referralData.referralCode}
              </code>
              <button
                onClick={copyReferralCode}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy code"
              >
                {copiedCode ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <DocumentDuplicateIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => shareReferral('email')}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>📧</span>
            <span className="font-medium">Share via Email</span>
          </button>
          <button
            onClick={() => shareReferral('sms')}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>💬</span>
            <span className="font-medium">Share via SMS</span>
          </button>
          <button
            onClick={() => shareReferral('social')}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>🌐</span>
            <span className="font-medium">Share on Social</span>
          </button>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Referral History</h2>
        </div>
        <div className="p-6">
          {referrals.length > 0 ? (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <UsersIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{referral.friendName}</h3>
                      <p className="text-sm text-gray-500">{referral.friendEmail}</p>
                      <p className="text-xs text-gray-400">
                        Referred on {formatDate(referral.dateReferred)}
                        {referral.dateCompleted && ` • Completed on ${formatDate(referral.dateCompleted)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </span>
                    {referral.status === 'completed' && (
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        +${referral.earnings.toFixed(2)}
                      </p>
                    )}
                    {referral.orderCount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {referral.orderCount} orders placed
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
              <p className="text-gray-500">Start sharing your referral code to earn rewards!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

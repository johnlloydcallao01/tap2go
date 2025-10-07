'use client'

import React, { useState } from 'react'

interface Subscription {
  id: string
  name: string
  description: string
  price: number
  duration: string
  features: string[]
  isActive: boolean
  nextBilling?: string
  discount?: number
  popular?: boolean
}

interface ActiveSubscription {
  id: string
  name: string
  startDate: string
  nextBilling: string
  status: 'active' | 'paused' | 'cancelled'
  autoRenew: boolean
}

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'my-subscriptions'>('available')

  // Mock data for available subscriptions
  const availableSubscriptions: Subscription[] = [
    {
      id: '1',
      name: 'Tap2Go Premium',
      description: 'Unlimited free delivery, exclusive deals, and priority support',
      price: 299,
      duration: 'month',
      features: ['Free delivery on all orders', 'Exclusive member deals', 'Priority customer support', 'Early access to new restaurants'],
      isActive: false,
      discount: 20,
      popular: true
    },
    {
      id: '2',
      name: 'Tap2Go Plus',
      description: 'Enhanced experience with special perks and benefits',
      price: 149,
      duration: 'month',
      features: ['Free delivery on orders ₱500+', 'Member-only promotions', 'Extended support hours'],
      isActive: false
    },
    {
      id: '3',
      name: 'Annual Premium',
      description: 'Best value with 12 months of premium benefits',
      price: 2999,
      duration: 'year',
      features: ['All Premium features', '2 months free', 'Exclusive annual member gifts', 'VIP customer service'],
      isActive: false,
      discount: 30
    }
  ]

  // Mock data for active subscriptions
  const mySubscriptions: ActiveSubscription[] = [
    {
      id: '1',
      name: 'Tap2Go Premium',
      startDate: '2024-01-15',
      nextBilling: '2024-02-15',
      status: 'active',
      autoRenew: true
    }
  ]

  const handleSubscribe = (subscriptionId: string) => {
    console.log('Subscribe to:', subscriptionId)
  }

  const handleManageSubscription = (subscriptionId: string) => {
    console.log('Manage subscription:', subscriptionId)
  }

  const handleCancelSubscription = (subscriptionId: string) => {
    console.log('Cancel subscription:', subscriptionId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="px-2.5 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
              <p className="text-gray-600 mt-1">Manage your subscription plans and benefits</p>
            </div>
            <button
              onClick={() => console.log('View benefits')}
              className="px-4 py-2 bg-white text-[#eba236] border border-[#eba236] rounded-lg hover:bg-[#eba236] hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              View Benefits
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('available')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'available'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Available Plans
            </button>
            <button
              onClick={() => setActiveTab('my-subscriptions')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'my-subscriptions'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Subscriptions
            </button>
          </div>
        </div>
      </div>

      <div className="px-2.5 pb-6">
        {activeTab === 'available' && (
          <div className="space-y-4">
            {availableSubscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-white rounded-lg p-6 relative">
                {subscription.popular && (
                  <div className="absolute -top-2 left-6">
                    <span className="bg-[#eba236] text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-crown w-5 h-5 text-[#eba236]" />
                      <h3 className="text-lg font-semibold text-gray-900">{subscription.name}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{subscription.description}</p>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-gray-900">₱{subscription.price}</span>
                      <span className="text-gray-600">/{subscription.duration}</span>
                      {subscription.discount && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          {subscription.discount}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Features included:</h4>
                  <ul className="space-y-2">
                    {subscription.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-[#eba236] rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(subscription.id)}
                  className="w-full py-3 bg-white text-[#eba236] border border-[#eba236] rounded-lg hover:bg-[#eba236] hover:text-white transition-colors duration-200 font-medium"
                >
                  Subscribe Now
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'my-subscriptions' && (
          <div className="space-y-4">
            {mySubscriptions.length > 0 ? (
              mySubscriptions.map((subscription) => (
                <div key={subscription.id} className="bg-white rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-shield-alt w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{subscription.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          subscription.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : subscription.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-calendar w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Started</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{formatDate(subscription.startDate)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <i className="fas fa-clock w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Next Billing</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{formatDate(subscription.nextBilling)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-bolt w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Auto-renewal</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      subscription.autoRenew ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleManageSubscription(subscription.id)}
                      className="flex-1 py-2 bg-white text-[#eba236] border border-[#eba236] rounded-lg hover:bg-[#eba236] hover:text-white transition-colors duration-200 text-sm font-medium"
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => handleCancelSubscription(subscription.id)}
                      className="flex-1 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-200 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <i className="fas fa-crown w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscriptions</h3>
                <p className="text-gray-600 mb-6">Subscribe to a plan to enjoy exclusive benefits and features.</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-6 py-2 bg-white text-[#eba236] border border-[#eba236] rounded-lg hover:bg-[#eba236] hover:text-white transition-colors duration-200 font-medium"
                >
                  Browse Plans
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => console.log('Compare plans')}
              className="flex items-center justify-center gap-2 py-3 bg-white text-[#eba236] border border-[#eba236] rounded-lg hover:bg-[#eba236] hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              <i className="fas fa-star w-4 h-4" />
              Compare Plans
            </button>
            <button
              onClick={() => console.log('Gift subscription')}
              className="flex items-center justify-center gap-2 py-3 bg-white text-[#eba236] border border-[#eba236] rounded-lg hover:bg-[#eba236] hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              <i className="fas fa-gift w-4 h-4" />
              Gift Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
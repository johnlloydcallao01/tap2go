'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import {
  BellIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function DriverSettings() {
  const [settings, setSettings] = useState({
    notifications: {
      newOrders: true,
      orderUpdates: true,
      earnings: true,
      promotions: false,
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
    },
    location: {
      shareLocation: true,
      autoAcceptNearby: false,
      maxDistance: 10,
    },
    earnings: {
      autoWithdraw: false,
      withdrawalThreshold: 100,
      preferredPaymentMethod: 'bank',
    },
    privacy: {
      showRating: true,
      showEarnings: false,
      shareStats: true,
    },
    app: {
      language: 'en',
      theme: 'light',
      soundEffects: true,
    },
  });

  const handleToggle = (section: keyof typeof settings, key: string) => {
    setSettings(prev => {
      const sectionData = prev[section] as Record<string, boolean | number | string>;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [key]: !sectionData[key]
        }
      };
    });
  };

  const handleValueChange = (section: keyof typeof settings, key: string, value: string | number) => {
    setSettings(prev => {
      const sectionData = prev[section] as Record<string, boolean | number | string>;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [key]: value
        }
      };
    });
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Driver Settings</h1>
        <p className="text-gray-600">Manage your preferences and account settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <BellIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">New Orders</p>
                <p className="text-sm text-gray-500">Get notified when new orders are available</p>
              </div>
              <ToggleSwitch
                enabled={settings.notifications.newOrders}
                onToggle={() => handleToggle('notifications', 'newOrders')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Order Updates</p>
                <p className="text-sm text-gray-500">Updates about your current deliveries</p>
              </div>
              <ToggleSwitch
                enabled={settings.notifications.orderUpdates}
                onToggle={() => handleToggle('notifications', 'orderUpdates')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Earnings</p>
                <p className="text-sm text-gray-500">Daily and weekly earnings summaries</p>
              </div>
              <ToggleSwitch
                enabled={settings.notifications.earnings}
                onToggle={() => handleToggle('notifications', 'earnings')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive push notifications on your device</p>
              </div>
              <ToggleSwitch
                enabled={settings.notifications.pushNotifications}
                onToggle={() => handleToggle('notifications', 'pushNotifications')}
              />
            </div>
          </div>
        </div>

        {/* Location Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <MapPinIcon className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Location & Orders</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Share Location</p>
                <p className="text-sm text-gray-500">Allow customers to track your location</p>
              </div>
              <ToggleSwitch
                enabled={settings.location.shareLocation}
                onToggle={() => handleToggle('location', 'shareLocation')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-Accept Nearby Orders</p>
                <p className="text-sm text-gray-500">Automatically accept orders within range</p>
              </div>
              <ToggleSwitch
                enabled={settings.location.autoAcceptNearby}
                onToggle={() => handleToggle('location', 'autoAcceptNearby')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Delivery Distance (km)
              </label>
              <select
                value={settings.location.maxDistance}
                onChange={(e) => handleValueChange('location', 'maxDistance', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={15}>15 km</option>
                <option value={20}>20 km</option>
                <option value={25}>25 km</option>
              </select>
            </div>
          </div>
        </div>

        {/* Earnings Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <CurrencyDollarIcon className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Earnings & Payments</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto Withdrawal</p>
                <p className="text-sm text-gray-500">Automatically withdraw earnings</p>
              </div>
              <ToggleSwitch
                enabled={settings.earnings.autoWithdraw}
                onToggle={() => handleToggle('earnings', 'autoWithdraw')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Threshold ($)
              </label>
              <input
                type="number"
                value={settings.earnings.withdrawalThreshold}
                onChange={(e) => handleValueChange('earnings', 'withdrawalThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="50"
                max="1000"
                step="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Payment Method
              </label>
              <select
                value={settings.earnings.preferredPaymentMethod}
                onChange={(e) => handleValueChange('earnings', 'preferredPaymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bank">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-5 w-5 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Privacy</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Show Rating</p>
                <p className="text-sm text-gray-500">Display your rating to customers</p>
              </div>
              <ToggleSwitch
                enabled={settings.privacy.showRating}
                onToggle={() => handleToggle('privacy', 'showRating')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Share Statistics</p>
                <p className="text-sm text-gray-500">Share performance stats with platform</p>
              </div>
              <ToggleSwitch
                enabled={settings.privacy.shareStats}
                onToggle={() => handleToggle('privacy', 'shareStats')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}

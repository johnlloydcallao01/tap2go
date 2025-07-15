'use client';

import React, { useState } from 'react';
import {
  BellIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onToggle }) => {
  return (
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
};

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

  // Type-safe toggle handler
  const handleToggle = (section: keyof typeof settings, setting: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toggleSetting = (sectionObj: any) => {
      return {
        ...sectionObj,
        [setting]: !sectionObj[setting]
      };
    };

    if (section === 'notifications') {
      setSettings(prev => ({
        ...prev,
        notifications: toggleSetting(prev.notifications)
      }));
    } else if (section === 'location') {
      setSettings(prev => ({
        ...prev,
        location: toggleSetting(prev.location)
      }));
    } else if (section === 'privacy') {
      setSettings(prev => ({
        ...prev,
        privacy: toggleSetting(prev.privacy)
      }));
    } else if (section === 'app') {
      setSettings(prev => ({
        ...prev,
        app: toggleSetting(prev.app)
      }));
    } else if (section === 'earnings') {
      setSettings(prev => ({
        ...prev,
        earnings: toggleSetting(prev.earnings)
      }));
    }
  };

  // Type-safe input change handler
  const handleInputChange = (section: keyof typeof settings, setting: string, value: string | number) => {
    if (section === 'notifications') {
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [setting]: value
        }
      }));
    } else if (section === 'location') {
      setSettings(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [setting]: value
        }
      }));
    } else if (section === 'privacy') {
      setSettings(prev => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          [setting]: value
        }
      }));
    } else if (section === 'app') {
      setSettings(prev => ({
        ...prev,
        app: {
          ...prev.app,
          [setting]: value
        }
      }));
    } else if (section === 'earnings') {
      setSettings(prev => ({
        ...prev,
        earnings: {
          ...prev.earnings,
          [setting]: value
        }
      }));
    }
  };

  const saveSettings = () => {
    console.log('Saving settings:', settings);
    // Here you would typically save to your backend
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your app preferences and account settings.</p>
        </div>
        <button
          onClick={saveSettings}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
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
                <p className="text-sm text-gray-500">Notifications about order status changes</p>
              </div>
              <ToggleSwitch
                enabled={settings.notifications.orderUpdates}
                onToggle={() => handleToggle('notifications', 'orderUpdates')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Earnings</p>
                <p className="text-sm text-gray-500">Payment confirmations and earnings updates</p>
              </div>
              <ToggleSwitch
                enabled={settings.notifications.earnings}
                onToggle={() => handleToggle('notifications', 'earnings')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Promotions</p>
                <p className="text-sm text-gray-500">Special offers and promotional campaigns</p>
              </div>
              <ToggleSwitch
                enabled={settings.notifications.promotions}
                onToggle={() => handleToggle('notifications', 'promotions')}
              />
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Delivery Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Push Notifications</span>
                  <ToggleSwitch
                    enabled={settings.notifications.pushNotifications}
                    onToggle={() => handleToggle('notifications', 'pushNotifications')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Email Notifications</span>
                  <ToggleSwitch
                    enabled={settings.notifications.emailNotifications}
                    onToggle={() => handleToggle('notifications', 'emailNotifications')}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">SMS Notifications</span>
                  <ToggleSwitch
                    enabled={settings.notifications.smsNotifications}
                    onToggle={() => handleToggle('notifications', 'smsNotifications')}
                  />
                </div>
              </div>
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
                <p className="text-sm text-gray-500">Allow the app to track your location</p>
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
                Maximum Distance (km)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.location.maxDistance}
                onChange={(e) => handleInputChange('location', 'maxDistance', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum distance for order notifications</p>
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
                min="10"
                max="1000"
                value={settings.earnings.withdrawalThreshold}
                onChange={(e) => handleInputChange('earnings', 'withdrawalThreshold', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum amount before auto-withdrawal</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Payment Method
              </label>
              <select
                value={settings.earnings.preferredPaymentMethod}
                onChange={(e) => handleInputChange('earnings', 'preferredPaymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bank">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="card">Debit Card</option>
                <option value="wallet">Digital Wallet</option>
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
                <p className="font-medium text-gray-900">Show Earnings</p>
                <p className="text-sm text-gray-500">Share earnings data for analytics</p>
              </div>
              <ToggleSwitch
                enabled={settings.privacy.showEarnings}
                onToggle={() => handleToggle('privacy', 'showEarnings')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Share Statistics</p>
                <p className="text-sm text-gray-500">Allow sharing of performance stats</p>
              </div>
              <ToggleSwitch
                enabled={settings.privacy.shareStats}
                onToggle={() => handleToggle('privacy', 'shareStats')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <Cog6ToothIcon className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">App Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.app.language}
              onChange={(e) => handleInputChange('app', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={settings.app.theme}
              onChange={(e) => handleInputChange('app', 'theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
          <div className="flex items-center justify-between md:col-span-2">
            <div>
              <p className="font-medium text-gray-900">Sound Effects</p>
              <p className="text-sm text-gray-500">Play sounds for notifications and actions</p>
            </div>
            <ToggleSwitch
              enabled={settings.app.soundEffects}
              onToggle={() => handleToggle('app', 'soundEffects')}
            />
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <DevicePhoneMobileIcon className="h-5 w-5 text-red-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Account Actions</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
              Change Password
            </button>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
              Two-Factor Authentication
            </button>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg transition-colors">
              Log Out of All Devices
            </button>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-lg transition-colors">
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

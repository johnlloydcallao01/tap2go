'use client';

import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface NotificationSetting {
  id: string;
  category: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'push';
  value: string;
  isVerified: boolean;
  isPrimary: boolean;
}

const mockNotificationSettings: NotificationSetting[] = [
  {
    id: '1',
    category: 'Orders',
    title: 'New Orders',
    description: 'Get notified when you receive a new order',
    email: true,
    push: true,
    sms: true,
    inApp: true,
  },
  {
    id: '2',
    category: 'Orders',
    title: 'Order Cancellations',
    description: 'Get notified when a customer cancels an order',
    email: true,
    push: true,
    sms: false,
    inApp: true,
  },
  {
    id: '3',
    category: 'Orders',
    title: 'Order Updates',
    description: 'Get notified about order status changes',
    email: false,
    push: true,
    sms: false,
    inApp: true,
  },
  {
    id: '4',
    category: 'Payments',
    title: 'Payment Received',
    description: 'Get notified when payments are processed',
    email: true,
    push: false,
    sms: false,
    inApp: true,
  },
  {
    id: '5',
    category: 'Payments',
    title: 'Payout Notifications',
    description: 'Get notified about payout status and transfers',
    email: true,
    push: true,
    sms: true,
    inApp: true,
  },
  {
    id: '6',
    category: 'Reviews',
    title: 'New Reviews',
    description: 'Get notified when customers leave reviews',
    email: true,
    push: true,
    sms: false,
    inApp: true,
  },
  {
    id: '7',
    category: 'Reviews',
    title: 'Review Responses',
    description: 'Get notified when customers respond to your replies',
    email: false,
    push: true,
    sms: false,
    inApp: true,
  },
  {
    id: '8',
    category: 'Marketing',
    title: 'Promotion Updates',
    description: 'Get notified about promotion performance and updates',
    email: true,
    push: false,
    sms: false,
    inApp: true,
  },
  {
    id: '9',
    category: 'System',
    title: 'System Maintenance',
    description: 'Get notified about scheduled maintenance and updates',
    email: true,
    push: false,
    sms: false,
    inApp: true,
  },
  {
    id: '10',
    category: 'System',
    title: 'Security Alerts',
    description: 'Get notified about security-related activities',
    email: true,
    push: true,
    sms: true,
    inApp: true,
  },
];

const mockChannels: NotificationChannel[] = [
  {
    id: '1',
    type: 'email',
    value: 'restaurant@example.com',
    isVerified: true,
    isPrimary: true,
  },
  {
    id: '2',
    type: 'sms',
    value: '+1-555-0123',
    isVerified: true,
    isPrimary: true,
  },
];

export default function VendorNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSettings(mockNotificationSettings);
        setChannels(mockChannels);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = (settingId: string, channel: keyof NotificationSetting, value: boolean) => {
    setSettings(settings.map(setting =>
      setting.id === settingId ? { ...setting, [channel]: value } : setting
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Notification settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, NotificationSetting[]>);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
              <p className="text-gray-600">Manage how and when you receive notifications</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/settings" className="btn-secondary">
                Back to Settings
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Notification Channels</h2>
          <p className="text-gray-600 mt-1">Configure your notification delivery methods</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channels.map((channel) => (
              <div key={channel.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {channel.type === 'email' && <EnvelopeIcon className="h-5 w-5 text-blue-600" />}
                      {channel.type === 'sms' && <DevicePhoneMobileIcon className="h-5 w-5 text-blue-600" />}
                      {channel.type === 'push' && <BellIcon className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">{channel.type}</h3>
                      <p className="text-sm text-gray-600">{channel.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {channel.isVerified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                        Unverified
                      </span>
                    )}
                    {channel.isPrimary && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button className="btn-secondary">
              Add Notification Channel
            </button>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
          <p className="text-gray-600 mt-1">Choose which notifications you want to receive and how</p>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{category}</h3>
                <div className="space-y-4">
                  {categorySettings.map((setting) => (
                    <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{setting.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                        </div>
                        <div className="ml-6 flex items-center space-x-6">
                          {/* Email */}
                          <div className="flex items-center space-x-2">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                            <input
                              type="checkbox"
                              checked={setting.email}
                              onChange={(e) => updateSetting(setting.id, 'email', e.target.checked)}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                          </div>
                          
                          {/* Push */}
                          <div className="flex items-center space-x-2">
                            <BellIcon className="h-4 w-4 text-gray-400" />
                            <input
                              type="checkbox"
                              checked={setting.push}
                              onChange={(e) => updateSetting(setting.id, 'push', e.target.checked)}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                          </div>
                          
                          {/* SMS */}
                          <div className="flex items-center space-x-2">
                            <DevicePhoneMobileIcon className="h-4 w-4 text-gray-400" />
                            <input
                              type="checkbox"
                              checked={setting.sms}
                              onChange={(e) => updateSetting(setting.id, 'sms', e.target.checked)}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                          </div>
                          
                          {/* In-App */}
                          <div className="flex items-center space-x-2">
                            <ComputerDesktopIcon className="h-4 w-4 text-gray-400" />
                            <input
                              type="checkbox"
                              checked={setting.inApp}
                              onChange={(e) => updateSetting(setting.id, 'inApp', e.target.checked)}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Methods</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Email</span>
          </div>
          <div className="flex items-center space-x-2">
            <BellIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Push Notification</span>
          </div>
          <div className="flex items-center space-x-2">
            <DevicePhoneMobileIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">SMS</span>
          </div>
          <div className="flex items-center space-x-2">
            <ComputerDesktopIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">In-App</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
              <BellIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Enable All Notifications</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Disable All Notifications</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <CheckCircleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Reset to Defaults</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

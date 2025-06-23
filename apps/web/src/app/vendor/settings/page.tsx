'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserIcon,
  BellIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface VendorSettings {
  account: {
    businessName: string;
    contactEmail: string;
    contactPhone: string;
    timezone: string;
    language: string;
  };
  notifications: {
    newOrders: boolean;
    orderUpdates: boolean;
    payouts: boolean;
    promotions: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  banking: {
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: Date;
  };
}

const mockSettings: VendorSettings = {
  account: {
    businessName: "Mario's Italian Kitchen",
    contactEmail: "info@mariositalian.com",
    contactPhone: "+1 (555) 123-4567",
    timezone: "America/New_York",
    language: "en"
  },
  notifications: {
    newOrders: true,
    orderUpdates: true,
    payouts: true,
    promotions: false,
    emailNotifications: true,
    smsNotifications: true
  },
  banking: {
    accountHolderName: "Mario's Italian Kitchen LLC",
    accountNumber: "****1234",
    routingNumber: "****5678",
    bankName: "Chase Bank"
  },
  security: {
    twoFactorEnabled: false,
    lastPasswordChange: new Date('2024-01-01')
  }
};

export default function VendorSettings() {
  const { } = useAuth();
  const [settings, setSettings] = useState<VendorSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'banking' | 'security'>('account');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSettings(mockSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const tabs = [
    { id: 'account', name: 'Account', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'banking', name: 'Banking', icon: CreditCardIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="h-64 bg-gray-300 rounded-lg"></div>
          <div className="lg:col-span-3 h-96 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load settings.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
            {hasChanges && (
              <button
                onClick={handleSave}
                className="btn-primary"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'account' | 'notifications' | 'banking' | 'security')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'account' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={settings.account.businessName}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          account: { ...settings.account, businessName: e.target.value }
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={settings.account.contactEmail}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            account: { ...settings.account, contactEmail: e.target.value }
                          });
                          setHasChanges(true);
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={settings.account.contactPhone}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            account: { ...settings.account, contactPhone: e.target.value }
                          });
                          setHasChanges(true);
                        }}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.account.timezone}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          account: { ...settings.account, timezone: e.target.value }
                        });
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Notifications</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'newOrders', label: 'New Orders', description: 'Get notified when you receive new orders' },
                      { key: 'orderUpdates', label: 'Order Updates', description: 'Get notified about order status changes' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                            onChange={(e) => {
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  [item.key]: e.target.checked
                                }
                              });
                              setHasChanges(true);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Methods</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                      { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via text message' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                            onChange={(e) => {
                              setSettings({
                                ...settings,
                                notifications: {
                                  ...settings.notifications,
                                  [item.key]: e.target.checked
                                }
                              });
                              setHasChanges(true);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'banking' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Banking Information</h2>
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Your banking information is encrypted and secure. This is used for payouts only.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={settings.banking.accountHolderName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={settings.banking.bankName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={settings.banking.accountNumber}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      value={settings.banking.routingNumber}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      disabled
                    />
                  </div>
                </div>
                <button className="btn-secondary">
                  Update Banking Information
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button className="btn-primary">
                      {settings.security.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-500">
                        Last changed: {settings.security.lastPasswordChange.toLocaleDateString()}
                      </p>
                    </div>
                    <button className="btn-secondary">
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">API Keys</h3>
                      <p className="text-sm text-gray-500">Manage API access for integrations</p>
                    </div>
                    <button className="btn-secondary">
                      Manage Keys
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

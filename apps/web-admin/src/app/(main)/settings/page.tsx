'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,

  BellIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CheckIcon,

} from '@heroicons/react/24/outline';

interface GeneralSettings {
  platform: {
    name: string;
    description: string;
    logo: string;
    favicon: string;
    supportEmail: string;
    supportPhone: string;
    website: string;
  };
  localization: {
    defaultLanguage: string;
    defaultCurrency: string;
    defaultTimezone: string;
    dateFormat: string;
    timeFormat: string;
  };
  business: {
    operatingHours: {
      start: string;
      end: string;
      days: string[];
    };
    minimumOrderAmount: number;
    maximumOrderAmount: number;
    deliveryRadius: number;
    commissionRate: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    orderUpdates: boolean;
    promotionalEmails: boolean;
    systemAlerts: boolean;
  };
  features: {
    multiLanguage: boolean;
    realTimeTracking: boolean;
    loyaltyProgram: boolean;
    referralProgram: boolean;
    scheduledOrders: boolean;
    groupOrders: boolean;
  };
}

export default function AdminGeneralSettings() {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('platform');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockSettings: GeneralSettings = {
          platform: {
            name: 'Tap2Go',
            description: 'Your favorite food delivery platform',
            logo: '/logo.png',
            favicon: '/favicon.ico',
            supportEmail: 'support@tap2go.com',
            supportPhone: '+63 2 8123 4567',
            website: 'https://tap2go.com',
          },
          localization: {
            defaultLanguage: 'en',
            defaultCurrency: 'PHP',
            defaultTimezone: 'Asia/Manila',
            dateFormat: 'MM/DD/YYYY',
            timeFormat: '12h',
          },
          business: {
            operatingHours: {
              start: '06:00',
              end: '23:00',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            },
            minimumOrderAmount: 100.00,
            maximumOrderAmount: 5000.00,
            deliveryRadius: 15.0,
            commissionRate: 15.0,
          },
          notifications: {
            emailNotifications: true,
            smsNotifications: true,
            pushNotifications: true,
            orderUpdates: true,
            promotionalEmails: false,
            systemAlerts: true,
          },
          features: {
            multiLanguage: true,
            realTimeTracking: true,
            loyaltyProgram: true,
            referralProgram: true,
            scheduledOrders: false,
            groupOrders: false,
          },
        };

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
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Simulate save success
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'platform', name: 'Platform Info', icon: CogIcon },
    { id: 'localization', name: 'Localization', icon: GlobeAltIcon },
    { id: 'business', name: 'Business Rules', icon: CurrencyDollarIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'features', name: 'Features', icon: ShieldCheckIcon },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
          <p className="text-gray-600">Failed to load settings.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">General Settings</h1>
            <p className="text-sm lg:text-base text-gray-600">Configure platform settings and business rules.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50 flex items-center text-sm"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow border p-4">
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        activeSection === section.id
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {section.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow border p-6">
              {/* Platform Info Section */}
              {activeSection === 'platform' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Platform Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        value={settings.platform.name}
                        onChange={(e) => setSettings({
                          ...settings,
                          platform: { ...settings.platform, name: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={settings.platform.supportEmail}
                        onChange={(e) => setSettings({
                          ...settings,
                          platform: { ...settings.platform, supportEmail: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Phone
                      </label>
                      <input
                        type="tel"
                        value={settings.platform.supportPhone}
                        onChange={(e) => setSettings({
                          ...settings,
                          platform: { ...settings.platform, supportPhone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={settings.platform.website}
                        onChange={(e) => setSettings({
                          ...settings,
                          platform: { ...settings.platform, website: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Description
                    </label>
                    <textarea
                      value={settings.platform.description}
                      onChange={(e) => setSettings({
                        ...settings,
                        platform: { ...settings.platform, description: e.target.value }
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Localization Section */}
              {activeSection === 'localization' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Localization Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Language
                      </label>
                      <select
                        value={settings.localization.defaultLanguage}
                        onChange={(e) => setSettings({
                          ...settings,
                          localization: { ...settings.localization, defaultLanguage: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="en">English</option>
                        <option value="fil">Filipino</option>
                        <option value="es">Spanish</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Currency
                      </label>
                      <select
                        value={settings.localization.defaultCurrency}
                        onChange={(e) => setSettings({
                          ...settings,
                          localization: { ...settings.localization, defaultCurrency: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="PHP">Philippine Peso (₱)</option>
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Timezone
                      </label>
                      <select
                        value={settings.localization.defaultTimezone}
                        onChange={(e) => setSettings({
                          ...settings,
                          localization: { ...settings.localization, defaultTimezone: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="Asia/Manila">Asia/Manila</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select
                        value={settings.localization.dateFormat}
                        onChange={(e) => setSettings({
                          ...settings,
                          localization: { ...settings.localization, dateFormat: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Rules Section */}
              {activeSection === 'business' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Business Rules</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Order Amount (₱)
                      </label>
                      <input
                        type="number"
                        value={settings.business.minimumOrderAmount}
                        onChange={(e) => setSettings({
                          ...settings,
                          business: { ...settings.business, minimumOrderAmount: parseFloat(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Order Amount (₱)
                      </label>
                      <input
                        type="number"
                        value={settings.business.maximumOrderAmount}
                        onChange={(e) => setSettings({
                          ...settings,
                          business: { ...settings.business, maximumOrderAmount: parseFloat(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Radius (km)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.business.deliveryRadius}
                        onChange={(e) => setSettings({
                          ...settings,
                          business: { ...settings.business, deliveryRadius: parseFloat(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commission Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={settings.business.commissionRate}
                        onChange={(e) => setSettings({
                          ...settings,
                          business: { ...settings.business, commissionRate: parseFloat(e.target.value) }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operating Hours
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={settings.business.operatingHours.start}
                          onChange={(e) => setSettings({
                            ...settings,
                            business: {
                              ...settings.business,
                              operatingHours: { ...settings.business.operatingHours, start: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Time</label>
                        <input
                          type="time"
                          value={settings.business.operatingHours.end}
                          onChange={(e) => setSettings({
                            ...settings,
                            business: {
                              ...settings.business,
                              operatingHours: { ...settings.business.operatingHours, end: e.target.value }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>

                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center">
                          {key === 'emailNotifications' && <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />}
                          {key === 'smsNotifications' && <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-3" />}
                          {key === 'pushNotifications' && <BellIcon className="h-5 w-5 text-gray-400 mr-3" />}
                          {!['emailNotifications', 'smsNotifications', 'pushNotifications'].includes(key) && <BellIcon className="h-5 w-5 text-gray-400 mr-3" />}
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {key === 'emailNotifications' && 'Send notifications via email'}
                              {key === 'smsNotifications' && 'Send notifications via SMS'}
                              {key === 'pushNotifications' && 'Send push notifications to mobile apps'}
                              {key === 'orderUpdates' && 'Notify users about order status changes'}
                              {key === 'promotionalEmails' && 'Send promotional and marketing emails'}
                              {key === 'systemAlerts' && 'Send system alerts and maintenance notifications'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, [key]: !value }
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-orange-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features Section */}
              {activeSection === 'features' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Platform Features</h3>

                  <div className="space-y-4">
                    {Object.entries(settings.features).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {key === 'multiLanguage' && 'Enable multiple language support'}
                              {key === 'realTimeTracking' && 'Enable real-time order tracking'}
                              {key === 'loyaltyProgram' && 'Enable customer loyalty program'}
                              {key === 'referralProgram' && 'Enable customer referral program'}
                              {key === 'scheduledOrders' && 'Allow customers to schedule orders'}
                              {key === 'groupOrders' && 'Enable group ordering functionality'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSettings({
                            ...settings,
                            features: { ...settings.features, [key]: !value }
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-orange-500' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

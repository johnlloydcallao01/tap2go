'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  MapPinIcon,

  CheckCircleIcon,

} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DeliverySettings {
  deliveryRadius: number;
  minimumOrderValue: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  estimatedDeliveryTime: {
    min: number;
    max: number;
  };
  deliveryZones: DeliveryZone[];
  specialInstructions: string;
  enableContactlessDelivery: boolean;
  enableScheduledDelivery: boolean;
  maxAdvanceOrderDays: number;
}

interface DeliveryZone {
  id: string;
  name: string;
  radius: number;
  deliveryFee: number;
  estimatedTime: {
    min: number;
    max: number;
  };
  isActive: boolean;
}

const mockDeliverySettings: DeliverySettings = {
  deliveryRadius: 5,
  minimumOrderValue: 15,
  deliveryFee: 2.99,
  freeDeliveryThreshold: 50,
  estimatedDeliveryTime: { min: 25, max: 40 },
  specialInstructions: 'Please call upon arrival. Ring doorbell twice.',
  enableContactlessDelivery: true,
  enableScheduledDelivery: true,
  maxAdvanceOrderDays: 7,
  deliveryZones: [
    { id: '1', name: 'Zone 1 - City Center', radius: 2, deliveryFee: 1.99, estimatedTime: { min: 15, max: 25 }, isActive: true },
    { id: '2', name: 'Zone 2 - Suburbs', radius: 5, deliveryFee: 2.99, estimatedTime: { min: 25, max: 40 }, isActive: true },
    { id: '3', name: 'Zone 3 - Extended Area', radius: 8, deliveryFee: 4.99, estimatedTime: { min: 35, max: 55 }, isActive: false },
  ]
};

export default function VendorDeliverySettings() {
  const [settings, setSettings] = useState<DeliverySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSettings(mockDeliverySettings);
      } catch (error) {
        console.error('Error loading delivery settings:', error);
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
      console.log('Delivery settings saved');
    } catch (error) {
      console.error('Error saving delivery settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (field: keyof DeliverySettings, value: unknown) => {
    if (settings) {
      setSettings({ ...settings, [field]: value });
    }
  };

  const updateZone = (zoneId: string, field: keyof DeliveryZone, value: unknown) => {
    if (settings) {
      const updatedZones = settings.deliveryZones.map(zone =>
        zone.id === zoneId ? { ...zone, [field]: value } : zone
      );
      setSettings({ ...settings, deliveryZones: updatedZones });
    }
  };

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

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load delivery settings.</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Delivery Settings</h1>
              <p className="text-gray-600">Configure your restaurant&apos;s delivery options and zones</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/restaurant" className="btn-secondary">
                Back to Restaurant
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

      {/* Basic Delivery Settings */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <TruckIcon className="h-5 w-5 mr-2 text-orange-500" />
            Basic Delivery Configuration
          </h2>
          <p className="text-gray-600 mt-1">Set your basic delivery parameters</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Radius (km)
              </label>
              <input
                type="number"
                value={settings.deliveryRadius}
                onChange={(e) => updateSettings('deliveryRadius', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                min="1"
                max="20"
                step="0.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Value ($)
              </label>
              <input
                type="number"
                value={settings.minimumOrderValue}
                onChange={(e) => updateSettings('minimumOrderValue', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standard Delivery Fee ($)
              </label>
              <input
                type="number"
                value={settings.deliveryFee}
                onChange={(e) => updateSettings('deliveryFee', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Delivery Threshold ($)
              </label>
              <input
                type="number"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => updateSettings('freeDeliveryThreshold', parseFloat(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Delivery Time (minutes)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={settings.estimatedDeliveryTime.min}
                onChange={(e) => updateSettings('estimatedDeliveryTime', {
                  ...settings.estimatedDeliveryTime,
                  min: parseInt(e.target.value)
                })}
                className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                min="5"
                max="120"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                value={settings.estimatedDeliveryTime.max}
                onChange={(e) => updateSettings('estimatedDeliveryTime', {
                  ...settings.estimatedDeliveryTime,
                  max: parseInt(e.target.value)
                })}
                className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                min="5"
                max="120"
              />
              <span className="text-gray-500">minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Options */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delivery Options</h2>
          <p className="text-gray-600 mt-1">Configure additional delivery features</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Contactless Delivery</h3>
                <p className="text-sm text-gray-600">Allow customers to request contactless delivery</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableContactlessDelivery}
                onChange={(e) => updateSettings('enableContactlessDelivery', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Scheduled Delivery</h3>
                <p className="text-sm text-gray-600">Allow customers to schedule delivery for later</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableScheduledDelivery}
                onChange={(e) => updateSettings('enableScheduledDelivery', e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
            </div>
            
            {settings.enableScheduledDelivery && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum advance order days
                </label>
                <input
                  type="number"
                  value={settings.maxAdvanceOrderDays}
                  onChange={(e) => updateSettings('maxAdvanceOrderDays', parseInt(e.target.value))}
                  className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  min="1"
                  max="30"
                />
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Delivery Instructions
            </label>
            <textarea
              value={settings.specialInstructions}
              onChange={(e) => updateSettings('specialInstructions', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter any special instructions for delivery drivers..."
            />
          </div>
        </div>
      </div>

      {/* Delivery Zones */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-orange-500" />
            Delivery Zones
          </h2>
          <p className="text-gray-600 mt-1">Configure different delivery zones with custom pricing</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {settings.deliveryZones.map((zone) => (
              <div key={zone.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={zone.isActive}
                      onChange={(e) => updateZone(zone.id, 'isActive', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <h3 className="font-medium text-gray-900">{zone.name}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    zone.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {zone.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Radius (km)
                    </label>
                    <input
                      type="number"
                      value={zone.radius}
                      onChange={(e) => updateZone(zone.id, 'radius', parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                      min="0.5"
                      step="0.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Fee ($)
                    </label>
                    <input
                      type="number"
                      value={zone.deliveryFee}
                      onChange={(e) => updateZone(zone.id, 'deliveryFee', parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Time (min)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={zone.estimatedTime.min}
                        onChange={(e) => updateZone(zone.id, 'estimatedTime', {
                          ...zone.estimatedTime,
                          min: parseInt(e.target.value)
                        })}
                        className="w-16 border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                        min="5"
                      />
                      <span className="text-gray-500 text-sm">-</span>
                      <input
                        type="number"
                        value={zone.estimatedTime.max}
                        onChange={(e) => updateZone(zone.id, 'estimatedTime', {
                          ...zone.estimatedTime,
                          max: parseInt(e.target.value)
                        })}
                        className="w-16 border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                        min="5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

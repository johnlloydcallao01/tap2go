'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,

} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface OperatingHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
  hasBreak: boolean;
}

interface SpecialHours {
  id: string;
  date: string;
  reason: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

const mockOperatingHours: OperatingHours[] = [
  { day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '22:00', hasBreak: true, breakStart: '14:00', breakEnd: '15:00' },
  { day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '22:00', hasBreak: true, breakStart: '14:00', breakEnd: '15:00' },
  { day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '22:00', hasBreak: true, breakStart: '14:00', breakEnd: '15:00' },
  { day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '22:00', hasBreak: true, breakStart: '14:00', breakEnd: '15:00' },
  { day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '23:00', hasBreak: false },
  { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '23:00', hasBreak: false },
  { day: 'Sunday', isOpen: true, openTime: '10:00', closeTime: '21:00', hasBreak: false },
];

const mockSpecialHours: SpecialHours[] = [
  { id: '1', date: '2024-12-25', reason: 'Christmas Day', isOpen: false },
  { id: '2', date: '2024-12-31', reason: 'New Year\'s Eve', isOpen: true, openTime: '10:00', closeTime: '18:00' },
  { id: '3', date: '2024-01-01', reason: 'New Year\'s Day', isOpen: false },
];

export default function VendorOperatingHours() {
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSpecialHours, setShowAddSpecialHours] = useState(false);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOperatingHours(mockOperatingHours);
        setSpecialHours(mockSpecialHours);
      } catch (error) {
        console.error('Error loading operating hours:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In real app, save to API
      console.log('Operating hours saved');
    } catch (error) {
      console.error('Error saving operating hours:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateOperatingHours = (index: number, field: keyof OperatingHours, value: unknown) => {
    const updated = [...operatingHours];
    updated[index] = { ...updated[index], [field]: value };
    setOperatingHours(updated);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
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
              <h1 className="text-3xl font-bold text-gray-900">Operating Hours</h1>
              <p className="text-gray-600">Manage your restaurant&apos;s operating schedule</p>
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
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Regular Operating Hours */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />
            Weekly Schedule
          </h2>
          <p className="text-gray-600 mt-1">Set your regular operating hours for each day of the week</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {operatingHours.map((hours, index) => (
              <div key={hours.day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-24">
                    <span className="font-medium text-gray-900">{hours.day}</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hours.isOpen}
                      onChange={(e) => updateOperatingHours(index, 'isOpen', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Open</span>
                  </div>
                </div>
                
                {hours.isOpen && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={hours.openTime}
                        onChange={(e) => updateOperatingHours(index, 'openTime', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={hours.closeTime}
                        onChange={(e) => updateOperatingHours(index, 'closeTime', e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hours.hasBreak}
                        onChange={(e) => updateOperatingHours(index, 'hasBreak', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">Break</span>
                    </div>
                    
                    {hours.hasBreak && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={hours.breakStart || ''}
                          onChange={(e) => updateOperatingHours(index, 'breakStart', e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={hours.breakEnd || ''}
                          onChange={(e) => updateOperatingHours(index, 'breakEnd', e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {!hours.isOpen && (
                  <div className="text-red-600 font-medium">Closed</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Hours */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Special Hours & Holidays</h2>
              <p className="text-gray-600 mt-1">Set special operating hours for holidays and events</p>
            </div>
            <button
              onClick={() => setShowAddSpecialHours(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Special Hours
            </button>
          </div>
        </div>
        <div className="p-6">
          {specialHours.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No special hours set</p>
            </div>
          ) : (
            <div className="space-y-3">
              {specialHours.map((special) => (
                <div key={special.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{special.reason}</p>
                    <p className="text-sm text-gray-600">{new Date(special.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {special.isOpen ? (
                      <span className="text-green-600 font-medium">
                        {special.openTime} - {special.closeTime}
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">Closed</span>
                    )}
                    <button className="text-red-600 hover:text-red-800">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Special Hours Modal Placeholder */}
      {showAddSpecialHours && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Special Hours</h3>
            <p className="text-gray-600 mb-4">Special hours functionality will be implemented here.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddSpecialHours(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

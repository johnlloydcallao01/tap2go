'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React from 'react';
import { BellIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

export default function AdminNotifications() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications Management</h1>
        <p className="text-gray-600">Manage platform notifications and communication settings.</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <BellIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications System Coming Soon</h3>
        <p className="text-gray-600 mb-6">
          We&apos;re developing a comprehensive notification system for email, SMS, and push notifications.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <EnvelopeIcon className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-600 mt-2">Manage email templates and campaigns</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <DevicePhoneMobileIcon className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900">SMS Alerts</h4>
            <p className="text-sm text-gray-600 mt-2">Configure SMS notifications and alerts</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <BellIcon className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900">Push Notifications</h4>
            <p className="text-sm text-gray-600 mt-2">Mobile app push notification management</p>
          </div>
        </div>
      </div>
    </div>
  );
}

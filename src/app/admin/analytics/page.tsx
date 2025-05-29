'use client';

import React from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, CurrencyDollarIcon, UsersIcon } from '@heroicons/react/24/outline';

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">View detailed analytics and insights about your platform performance.</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard Coming Soon</h3>
        <p className="text-gray-600 mb-6">
          We're working on comprehensive analytics features including revenue tracking, user behavior insights, and performance metrics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <ArrowTrendingUpIcon className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900">Revenue Analytics</h4>
            <p className="text-sm text-gray-600 mt-2">Track revenue trends and growth metrics</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <UsersIcon className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900">User Insights</h4>
            <p className="text-sm text-gray-600 mt-2">Understand user behavior and engagement</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <CurrencyDollarIcon className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900">Financial Reports</h4>
            <p className="text-sm text-gray-600 mt-2">Detailed financial reporting and insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}

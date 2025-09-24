'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React from 'react';
import { CurrencyDollarIcon, BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function AdminPayouts() {
  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts Management</h1>
          <p className="text-gray-600">Manage vendor and driver payouts and financial transactions.</p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CurrencyDollarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payouts System Coming Soon</h3>
          <p className="text-gray-600 mb-6">
            We&apos;re building a comprehensive payout system for automated vendor and driver payments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <BanknotesIcon className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900">Vendor Payouts</h4>
              <p className="text-sm text-gray-600 mt-2">Automated vendor commission payments</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <CreditCardIcon className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900">Driver Earnings</h4>
              <p className="text-sm text-gray-600 mt-2">Driver payment and earnings management</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <CurrencyDollarIcon className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900">Financial Reports</h4>
              <p className="text-sm text-gray-600 mt-2">Detailed payout reports and analytics</p>
            </div>
          </div>
        </div>
      </div>
  );
}

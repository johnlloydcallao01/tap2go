'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { ExclamationTriangleIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function AdminDisputes() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disputes Management</h1>
          <p className="text-gray-600">Handle customer disputes and resolution cases.</p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Disputes Management Coming Soon</h3>
          <p className="text-gray-600 mb-6">
            We&apos;re building a comprehensive dispute resolution system to handle customer complaints and vendor issues.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <ClockIcon className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900">Pending Cases</h4>
              <p className="text-sm text-gray-600 mt-2">Track and manage pending dispute cases</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900">Resolution Tools</h4>
              <p className="text-sm text-gray-600 mt-2">Tools for efficient dispute resolution</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900">Escalation System</h4>
              <p className="text-sm text-gray-600 mt-2">Automated escalation for complex cases</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

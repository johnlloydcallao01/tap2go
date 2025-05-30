'use client';

import React from 'react';
import { DocumentTextIcon, ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline';

export default function AdminReports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Generate and view detailed platform reports.</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Reports System Coming Soon</h3>
        <p className="text-gray-600 mb-6">
          We&apos;re developing comprehensive reporting tools for business intelligence and data analysis.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <ChartBarIcon className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900">Sales Reports</h4>
            <p className="text-sm text-gray-600 mt-2">Detailed sales and revenue reports</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <TableCellsIcon className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900">Performance Metrics</h4>
            <p className="text-sm text-gray-600 mt-2">Platform performance and KPI tracking</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <DocumentTextIcon className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900">Custom Reports</h4>
            <p className="text-sm text-gray-600 mt-2">Build custom reports and exports</p>
          </div>
        </div>
      </div>
    </div>
  );
}

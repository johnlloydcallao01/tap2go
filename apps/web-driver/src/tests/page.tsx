'use client';

import React from 'react';
import Link from 'next/link';

export default function TestsIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Tap2Go Testing Infrastructure
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive testing suite for authentication, notifications, business logic, 
            integrations, and utilities. Organized for maximum efficiency and maintainability.
          </p>
        </div>

        {/* Environment Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="text-blue-500 text-2xl mr-4">ℹ️</div>
            <div>
              <h3 className="text-blue-900 font-semibold text-lg">Development Environment Only</h3>
              <p className="text-blue-700">
                This testing infrastructure is only available in development mode with 
                <code className="bg-blue-100 px-2 py-1 rounded mx-1">ENABLE_TEST_ROUTES=true</code> 
                in your .env.local file.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/tests/dashboard"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-4">📊</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Test Dashboard</h3>
                <p className="text-gray-600 text-sm">Interactive testing interface</p>
              </div>
            </div>
            <p className="text-gray-700">
              Access all test categories, run individual tests, and view results in a 
              comprehensive dashboard interface.
            </p>
          </Link>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-4">📚</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Documentation</h3>
                <p className="text-gray-600 text-sm">Complete testing guide</p>
              </div>
            </div>
            <p className="text-gray-700">
              Comprehensive documentation for all testing procedures, best practices, 
              and troubleshooting guides.
            </p>
          </div>
        </div>

        {/* Test Categories Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">🎯 Test Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">🔐</span>
                <h4 className="font-semibold text-red-900">Authentication</h4>
              </div>
              <p className="text-red-700 text-sm">Critical security testing</p>
              <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                HIGH Priority
              </span>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">📱</span>
                <h4 className="font-semibold text-red-900">Notifications</h4>
              </div>
              <p className="text-red-700 text-sm">FCM push notifications</p>
              <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                HIGH Priority
              </span>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">🏪</span>
                <h4 className="font-semibold text-red-900">Business Logic</h4>
              </div>
              <p className="text-red-700 text-sm">Core business functionality</p>
              <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                HIGH Priority
              </span>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">🔗</span>
                <h4 className="font-semibold text-yellow-900">Integrations</h4>
              </div>
              <p className="text-yellow-700 text-sm">Third-party services</p>
              <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                MEDIUM Priority
              </span>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">🛠️</span>
                <h4 className="font-semibold text-green-900">Utilities</h4>
              </div>
              <p className="text-green-700 text-sm">Development tools</p>
              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                LOW Priority
              </span>
            </div>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">⚡ Quick Commands</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">NPM Scripts</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-50 p-2 rounded font-mono">npm run test:dashboard</div>
                <div className="bg-gray-50 p-2 rounded font-mono">npm run test:auth</div>
                <div className="bg-gray-50 p-2 rounded font-mono">npm run test:notifications</div>
                <div className="bg-gray-50 p-2 rounded font-mono">npm run test:business</div>
                <div className="bg-gray-50 p-2 rounded font-mono">npm run test:all</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Environment Control</h4>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-50 p-2 rounded font-mono">npm run test:enable</div>
                <div className="bg-gray-50 p-2 rounded font-mono">npm run test:disable</div>
                <div className="bg-gray-50 p-2 rounded font-mono">npm run supabase:test</div>
                <div className="bg-gray-50 p-2 rounded font-mono">npm run email:dev-test</div>
                <div className="bg-gray-50 p-2 rounded font-mono">npm run ai:test</div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-orange-900 mb-4">⚠️ Important Notes</h3>
          <ul className="text-orange-800 space-y-2 text-sm">
            <li>• <strong>Never delete authentication tests</strong> - Critical for security</li>
            <li>• <strong>Never delete notification tests</strong> - Critical for customer experience</li>
            <li>• <strong>Never delete business logic tests</strong> - Critical for core functionality</li>
            <li>• <strong>Utility tests can be disabled in production</strong> - Development convenience only</li>
            <li>• <strong>Tests are automatically hidden in production</strong> - No manual intervention needed</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex justify-center space-x-6 mb-4">
            <Link 
              href="/tests/dashboard" 
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🚀 Open Test Dashboard
            </Link>
            <Link 
              href="/" 
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🏠 Back to App
            </Link>
          </div>
          <p className="text-gray-500 text-sm">
            Testing infrastructure organized for maximum efficiency and maintainability
          </p>
        </div>
      </div>
    </div>
  );
}

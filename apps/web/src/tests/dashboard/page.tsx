'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface TestCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  critical: 'HIGH' | 'MEDIUM' | 'LOW';
  tests: TestItem[];
}

interface TestItem {
  id: string;
  name: string;
  path: string;
  description: string;
  status?: 'passing' | 'failing' | 'unknown';
}

const testCategories: TestCategory[] = [
  {
    id: 'auth',
    name: 'Authentication',
    description: 'User authentication, authorization, and session management',
    icon: '🔐',
    critical: 'HIGH',
    tests: [
      {
        id: 'test-auth',
        name: 'Auth Flow Testing',
        path: '/tests/pages/auth/test-auth',
        description: 'Complete authentication flow with SSR/hydration testing'
      },
      {
        id: 'test-auth-flow',
        name: 'Auth Integration',
        path: '/tests/pages/auth/test-auth-flow',
        description: 'Authentication integration across components'
      },

    ]
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'FCM push notifications, email notifications, real-time updates',
    icon: '📱',
    critical: 'HIGH',
    tests: [
      {
        id: 'test-all-notifications',
        name: 'All Notification Types',
        path: '/tests/pages/notifications/test-all-notifications',
        description: 'Test all FCM notification types (payment, order, delivery)'
      },
      {
        id: 'test-notifications',
        name: 'Basic Notifications',
        path: '/tests/pages/notifications/test-notifications',
        description: 'Basic push notification functionality'
      }
    ]
  },
  {
    id: 'business',
    name: 'Business Logic',
    description: 'Customer management, restaurant operations, order workflows',
    icon: '🏪',
    critical: 'HIGH',
    tests: [
      {
        id: 'test-customer',
        name: 'Customer Management',
        path: '/tests/pages/business/test-customer',
        description: 'Customer data, profiles, loyalty system'
      },
      {
        id: 'test-restaurant',
        name: 'Restaurant Operations',
        path: '/tests/pages/business/test-restaurant',
        description: 'Restaurant management and menu operations'
      },
      {
        id: 'test-vendor',
        name: 'Vendor Panel',
        path: '/tests/pages/business/test-vendor',
        description: 'Vendor dashboard and management features'
      },
      {
        id: 'test-complete-flow',
        name: 'Complete Order Flow',
        path: '/tests/pages/business/test-complete-flow',
        description: 'End-to-end order processing workflow'
      }
    ]
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Third-party services: webhooks, email, AI chatbot',
    icon: '🔗',
    critical: 'MEDIUM',
    tests: [
      {
        id: 'test-webhook',
        name: 'Webhook Testing',
        path: '/tests/pages/integrations/test-webhook',
        description: 'External webhook integrations'
      },
      {
        id: 'test-chat',
        name: 'AI Chatbot',
        path: '/tests/pages/integrations/test-chat',
        description: 'Google AI chatbot functionality'
      }
    ]
  },
  {
    id: 'utilities',
    name: 'Utilities',
    description: 'General testing utilities and admin tools',
    icon: '🛠️',
    critical: 'LOW',
    tests: [
      {
        id: 'test-simple',
        name: 'Simple Tests',
        path: '/tests/pages/utilities/test-simple',
        description: 'Basic functionality testing'
      },

    ]
  }
];

export default function TestDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getCriticalityColor = (critical: string) => {
    switch (critical) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Tap2Go Testing Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive testing infrastructure for authentication, notifications, business logic, 
            integrations, and utilities. All tests are organized by criticality and functionality.
          </p>
        </div>

        {/* Environment Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="text-blue-500 text-xl mr-3">ℹ️</div>
            <div>
              <h3 className="text-blue-900 font-semibold">Development Environment</h3>
              <p className="text-blue-700 text-sm">
                This testing dashboard is only available in development mode. 
                Tests are automatically hidden in production builds.
              </p>
            </div>
          </div>
        </div>

        {/* Test Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{category.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCriticalityColor(category.critical)}`}>
                  {category.critical}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              
              <div className="space-y-2">
                {category.tests.map((test) => (
                  <Link
                    key={test.id}
                    href={test.path}
                    className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 text-sm">{test.name}</span>
                      <span className="text-orange-500 text-xs">→</span>
                    </div>
                    <p className="text-gray-600 text-xs mt-1">{test.description}</p>
                  </Link>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  {category.tests.length} test{category.tests.length !== 1 ? 's' : ''} available
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Quick Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/tests/pages/auth/test-auth"
              className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <div className="text-red-600 font-semibold text-sm">🔐 Test Authentication</div>
              <div className="text-red-500 text-xs mt-1">Critical security testing</div>
            </Link>
            
            <Link
              href="/tests/pages/notifications/test-all-notifications"
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="text-blue-600 font-semibold text-sm">📱 Test Notifications</div>
              <div className="text-blue-500 text-xs mt-1">FCM push notifications</div>
            </Link>
            
            <Link
              href="/tests/pages/business/test-complete-flow"
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="text-green-600 font-semibold text-sm">🏪 Test Order Flow</div>
              <div className="text-green-500 text-xs mt-1">End-to-end business logic</div>
            </Link>
            

          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            📚 <Link href="/tests" className="text-orange-500 hover:text-orange-600">View Documentation</Link> | 
            🏠 <Link href="/" className="text-orange-500 hover:text-orange-600 ml-2">Back to App</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

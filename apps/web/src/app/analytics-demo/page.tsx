/**
 * Comprehensive Analytics Demo Page
 * Showcases ECharts analytics with 90/10 strategy for Tap2Go platform
 */

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { ChartBarIcon, CurrencyDollarIcon, TruckIcon, UserIcon, BuildingStorefrontIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

// Import analytics components
import VendorSalesCharts from '@/components/analytics/vendor/VendorSalesCharts';
import DriverEarningsCharts from '@/components/analytics/driver/DriverEarningsCharts';
import CustomerOrderCharts from '@/components/analytics/customer/CustomerOrderCharts';
import DirectChartsExamples from '@/components/analytics/DirectChartsExamples';

// Import demo data generators
import {
  generateVendorSalesData,
  generateDriverEarningsData,
  generateDriverDeliveryData,
  generateCustomerOrderHistory,
  generateCustomerSpendingData,
  generateCustomerPreferences,
} from '@/components/analytics/demoData';

type DemoSection = 'vendor' | 'driver' | 'customer' | 'direct-echarts';

export default function AnalyticsDemoPage() {
  const [activeSection, setActiveSection] = useState<DemoSection>('vendor');

  // Generate demo data
  const vendorSalesData = generateVendorSalesData();
  const driverEarningsData = generateDriverEarningsData();
  const driverDeliveryData = generateDriverDeliveryData();
  const customerOrderHistory = generateCustomerOrderHistory();
  const customerSpendingData = generateCustomerSpendingData();
  const customerPreferences = generateCustomerPreferences();

  const sections = [
    {
      id: 'vendor' as DemoSection,
      title: 'Vendor Sales Analytics',
      description: 'Restaurant sales performance and insights',
      icon: BuildingStorefrontIcon,
      color: 'bg-green-500',
    },
    {
      id: 'driver' as DemoSection,
      title: 'Driver Earnings Analytics',
      description: 'Driver performance and earnings tracking',
      icon: TruckIcon,
      color: 'bg-purple-500',
    },
    {
      id: 'customer' as DemoSection,
      title: 'Customer Order Analytics',
      description: 'Customer ordering patterns and preferences',
      icon: UserIcon,
      color: 'bg-pink-500',
    },
    {
      id: 'direct-echarts' as DemoSection,
      title: 'Direct ECharts Implementation',
      description: 'Professional approach using ECharts directly',
      icon: CodeBracketIcon,
      color: 'bg-indigo-500',
    },
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'vendor':
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Vendor Sales Analytics</h2>
              <p className="text-gray-600 mt-2">
                Track restaurant sales performance, top-selling menu items, peak hours, and sales targets.
                Optimize menu offerings and identify growth opportunities.
              </p>
            </div>
            <VendorSalesCharts data={vendorSalesData} />
          </div>
        );

      case 'driver':
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Driver Earnings Analytics</h2>
              <p className="text-gray-600 mt-2">
                Monitor driver earnings, delivery performance, completion rates, and zone-based analytics.
                Track tips, bonuses, and performance metrics.
              </p>
            </div>
            <DriverEarningsCharts 
              earningsData={driverEarningsData} 
              deliveryData={driverDeliveryData} 
            />
          </div>
        );

      case 'customer':
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Customer Order Analytics</h2>
              <p className="text-gray-600 mt-2">
                Analyze customer ordering patterns, spending habits, favorite restaurants, and cuisine preferences.
                Track order history and provide personalized insights.
              </p>
            </div>
            <CustomerOrderCharts
              orderHistory={customerOrderHistory}
              spendingData={customerSpendingData}
              preferences={customerPreferences}
            />
          </div>
        );

      case 'direct-echarts':
        return (
          <div>
            <DirectChartsExamples />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Tap2Go Analytics Demo
                </h1>
                <p className="text-gray-600 mt-2">
                  Comprehensive analytics suite powered by ECharts for FoodPanda-scale platform
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  ECharts Powered
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Real-time Analytics
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Sections</h3>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${section.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{section.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{section.description}</p>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Features List */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Analytics Features</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Interactive Charts
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Real-time Updates
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Export Capabilities
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Mobile Responsive
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Professional Design
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Tap2Go Analytics Demo - Powered by ECharts |
              <span className="font-medium text-orange-600"> Professional Food Delivery Platform</span>
            </p>
            <p className="text-xs mt-1">
              Hybrid Implementation Reference: React Wrapper + Direct ECharts • Complete Analytics Suite
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  currentPrice: number;
  originalPrice: number;
  costPrice: number;
  profitMargin: number;
  isOnSale: boolean;
  salePrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  popularity: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

interface PricingRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  applicableCategories: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    category: 'Pizza',
    currentPrice: 16.99,
    originalPrice: 16.99,
    costPrice: 6.50,
    profitMargin: 61.7,
    isOnSale: false,
    popularity: 'high',
    lastUpdated: '2024-01-20',
  },
  {
    id: '2',
    name: 'Pepperoni Pizza',
    category: 'Pizza',
    currentPrice: 15.99,
    originalPrice: 18.99,
    costPrice: 7.25,
    profitMargin: 54.7,
    isOnSale: true,
    salePrice: 15.99,
    saleStartDate: '2024-01-15',
    saleEndDate: '2024-01-31',
    popularity: 'high',
    lastUpdated: '2024-01-15',
  },
  {
    id: '3',
    name: 'Caesar Salad',
    category: 'Salads',
    currentPrice: 12.99,
    originalPrice: 12.99,
    costPrice: 4.50,
    profitMargin: 65.4,
    isOnSale: false,
    popularity: 'medium',
    lastUpdated: '2024-01-18',
  },
  {
    id: '4',
    name: 'Chicken Wings',
    category: 'Appetizers',
    currentPrice: 13.99,
    originalPrice: 13.99,
    costPrice: 5.75,
    profitMargin: 58.9,
    isOnSale: false,
    popularity: 'high',
    lastUpdated: '2024-01-19',
  },
  {
    id: '5',
    name: 'Tiramisu',
    category: 'Desserts',
    currentPrice: 6.99,
    originalPrice: 7.99,
    costPrice: 2.25,
    profitMargin: 67.8,
    isOnSale: true,
    salePrice: 6.99,
    saleStartDate: '2024-01-10',
    saleEndDate: '2024-01-25',
    popularity: 'low',
    lastUpdated: '2024-01-10',
  },
];

const mockPricingRules: PricingRule[] = [
  {
    id: '1',
    name: 'Weekend Special',
    type: 'percentage',
    value: 10,
    applicableCategories: ['Pizza', 'Main Courses'],
    startDate: '2024-01-20',
    endDate: '2024-01-21',
    isActive: true,
  },
  {
    id: '2',
    name: 'Happy Hour Drinks',
    type: 'fixed',
    value: 2.00,
    applicableCategories: ['Beverages'],
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    isActive: true,
  },
];

export default function VendorMenuPricing() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  // Removed unused variable: showBulkEdit, setShowBulkEdit

  const categories = ['all', 'Pizza', 'Salads', 'Appetizers', 'Main Courses', 'Desserts', 'Beverages'];

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMenuItems(mockMenuItems);
        setPricingRules(mockPricingRules);
      } catch (error) {
        console.error('Error loading pricing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updateItemPrice = (itemId: string, newPrice: number) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === itemId 
          ? { 
              ...item, 
              currentPrice: newPrice,
              profitMargin: ((newPrice - item.costPrice) / newPrice) * 100,
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : item
      )
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
              <p className="text-gray-600">Manage menu item prices and profit margins</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/menu" className="btn-secondary">
                Back to Menu
              </Link>
              <button
                onClick={() => setShowBulkEdit(true)}
                className="btn-secondary flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Bulk Edit
              </button>
              <button className="btn-primary flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Pricing Rule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Item Price</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(menuItems.reduce((sum, item) => sum + item.currentPrice, 0) / menuItems.length).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900">
                {(menuItems.reduce((sum, item) => sum + item.profitMargin, 0) / menuItems.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TagIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Items on Sale</p>
              <p className="text-2xl font-bold text-gray-900">
                {menuItems.filter(item => item.isOnSale).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">
                {pricingRules.filter(rule => rule.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by category:</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items Pricing */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Menu Item Prices</h2>
          <p className="text-gray-600 mt-1">Manage individual item pricing and margins</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit Margin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Popularity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">Updated: {new Date(item.lastUpdated).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={item.currentPrice}
                        onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value))}
                        className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-orange-500 focus:border-orange-500"
                        step="0.01"
                        min="0"
                      />
                      {item.isOnSale && item.originalPrice !== item.currentPrice && (
                        <span className="text-xs text-gray-500 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.costPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${
                        item.profitMargin >= 60 ? 'text-green-600' :
                        item.profitMargin >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {item.profitMargin.toFixed(1)}%
                      </span>
                      {item.profitMargin >= 60 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 ml-1" />
                      ) : item.profitMargin < 40 ? (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 ml-1" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPopularityColor(item.popularity)}`}>
                      {item.popularity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.isOnSale ? (
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          On Sale
                        </span>
                        {item.saleEndDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Until {new Date(item.saleEndDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Regular
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-orange-600 hover:text-orange-900 mr-3">
                      Edit
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      Sale
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Pricing Rules */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Active Pricing Rules</h2>
              <p className="text-gray-600 mt-1">Automated pricing rules and promotions</p>
            </div>
            <button className="btn-primary flex items-center">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Rule
            </button>
          </div>
        </div>
        <div className="p-6">
          {pricingRules.length === 0 ? (
            <div className="text-center py-8">
              <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pricing rules configured</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pricingRules.map((rule) => (
                <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{rule.name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>
                          {rule.type === 'percentage' ? `${rule.value}% discount` : `$${rule.value} off`}
                        </span>
                        <span>Categories: {rule.applicableCategories.join(', ')}</span>
                        <span>
                          {new Date(rule.startDate).toLocaleDateString()} - {new Date(rule.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Edit Modal Placeholder */}
      {showBulkEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Edit Pricing</h3>
            <p className="text-gray-600 mb-4">Bulk pricing functionality will be implemented here.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkEdit(false)}
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

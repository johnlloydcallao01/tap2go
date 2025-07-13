'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  FolderIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface MenuCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  itemCount: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

const mockCategories: MenuCategory[] = [
  {
    id: '1',
    name: 'Appetizers',
    description: 'Start your meal with our delicious appetizers and small plates',
    isActive: true,
    sortOrder: 1,
    itemCount: 8,
    image: '/api/placeholder/150/100',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    name: 'Main Courses',
    description: 'Hearty main dishes featuring fresh ingredients and bold flavors',
    isActive: true,
    sortOrder: 2,
    itemCount: 15,
    image: '/api/placeholder/150/100',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-18',
  },
  {
    id: '3',
    name: 'Pizza',
    description: 'Hand-tossed pizzas with premium toppings and artisanal sauces',
    isActive: true,
    sortOrder: 3,
    itemCount: 12,
    image: '/api/placeholder/150/100',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-22',
  },
  {
    id: '4',
    name: 'Salads',
    description: 'Fresh, crisp salads with seasonal vegetables and house-made dressings',
    isActive: true,
    sortOrder: 4,
    itemCount: 6,
    image: '/api/placeholder/150/100',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-19',
  },
  {
    id: '5',
    name: 'Desserts',
    description: 'Sweet endings to complete your dining experience',
    isActive: true,
    sortOrder: 5,
    itemCount: 7,
    image: '/api/placeholder/150/100',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-21',
  },
  {
    id: '6',
    name: 'Beverages',
    description: 'Refreshing drinks, coffee, and specialty beverages',
    isActive: false,
    sortOrder: 6,
    itemCount: 10,
    image: '/api/placeholder/150/100',
    createdAt: '2024-01-17',
    updatedAt: '2024-01-17',
  },
];

export default function VendorMenuCategories() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCategories(mockCategories.sort((a, b) => a.sortOrder - b.sortOrder));
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const toggleCategoryStatus = (categoryId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };

  const moveCategoryUp = (categoryId: string) => {
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex > 0) {
      const newCategories = [...categories];
      [newCategories[categoryIndex], newCategories[categoryIndex - 1]] = 
      [newCategories[categoryIndex - 1], newCategories[categoryIndex]];
      
      // Update sort orders
      newCategories.forEach((cat, index) => {
        cat.sortOrder = index + 1;
      });
      
      setCategories(newCategories);
    }
  };

  const moveCategoryDown = (categoryId: string) => {
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex < categories.length - 1) {
      const newCategories = [...categories];
      [newCategories[categoryIndex], newCategories[categoryIndex + 1]] = 
      [newCategories[categoryIndex + 1], newCategories[categoryIndex]];
      
      // Update sort orders
      newCategories.forEach((cat, index) => {
        cat.sortOrder = index + 1;
      });
      
      setCategories(newCategories);
    }
  };

  const deleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Menu Categories</h1>
              <p className="text-gray-600">Organize your menu items into categories</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/menu" className="btn-secondary">
                Back to Menu
              </Link>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(cat => cat.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FolderIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.reduce((sum, cat) => sum + cat.itemCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <EyeSlashIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(cat => !cat.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Category Management</h2>
          <p className="text-gray-600 mt-1">Manage your menu categories and their display order</p>
        </div>
        <div className="p-6">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No categories created yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 btn-primary"
              >
                Create Your First Category
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category, index) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {category.image && (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </>
                      )}
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">{category.name}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {category.itemCount} items
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{category.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Order: #{category.sortOrder}</span>
                          <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                          <span>Updated: {new Date(category.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Sort Order Controls */}
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => moveCategoryUp(category.id)}
                          disabled={index === 0}
                          className={`p-1 rounded ${
                            index === 0 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <ArrowUpIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveCategoryDown(category.id)}
                          disabled={index === categories.length - 1}
                          className={`p-1 rounded ${
                            index === categories.length - 1 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <ArrowDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Action Buttons */}
                      <button
                        onClick={() => toggleCategoryStatus(category.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          category.isActive 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={category.isActive ? 'Hide category' : 'Show category'}
                      >
                        {category.isActive ? (
                          <EyeIcon className="h-4 w-4" />
                        ) : (
                          <EyeSlashIcon className="h-4 w-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => console.log('Edit category:', category.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center">
              <PlusIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Add New Category</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <FolderIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Bulk Import Categories</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center">
              <ArrowUpIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Reorder Categories</p>
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3>
            <p className="text-gray-600 mb-4">Category creation functionality will be implemented here.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
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

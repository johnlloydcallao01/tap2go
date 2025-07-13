'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  AdjustmentsHorizontalIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ModifierOption {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

interface ModifierGroup {
  id: string;
  name: string;
  description: string;
  type: 'single' | 'multiple';
  isRequired: boolean;
  isActive: boolean;
  minSelections: number;
  maxSelections: number;
  options: ModifierOption[];
  createdAt: string;
  updatedAt: string;
}

const mockModifierGroups: ModifierGroup[] = [
  {
    id: '1',
    name: 'Pizza Size',
    description: 'Choose your pizza size',
    type: 'single',
    isRequired: true,
    isActive: true,
    minSelections: 1,
    maxSelections: 1,
    options: [
      { id: '1a', name: 'Small (10")', price: 0, isDefault: true },
      { id: '1b', name: 'Medium (12")', price: 3.00 },
      { id: '1c', name: 'Large (14")', price: 6.00 },
      { id: '1d', name: 'Extra Large (16")', price: 9.00 },
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    name: 'Pizza Toppings',
    description: 'Add extra toppings to your pizza',
    type: 'multiple',
    isRequired: false,
    isActive: true,
    minSelections: 0,
    maxSelections: 5,
    options: [
      { id: '2a', name: 'Extra Cheese', price: 1.50 },
      { id: '2b', name: 'Pepperoni', price: 2.00 },
      { id: '2c', name: 'Mushrooms', price: 1.25 },
      { id: '2d', name: 'Bell Peppers', price: 1.25 },
      { id: '2e', name: 'Italian Sausage', price: 2.50 },
      { id: '2f', name: 'Olives', price: 1.00 },
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-22',
  },
  {
    id: '3',
    name: 'Drink Size',
    description: 'Choose your drink size',
    type: 'single',
    isRequired: true,
    isActive: true,
    minSelections: 1,
    maxSelections: 1,
    options: [
      { id: '3a', name: 'Small', price: 0, isDefault: true },
      { id: '3b', name: 'Medium', price: 0.75 },
      { id: '3c', name: 'Large', price: 1.50 },
    ],
    createdAt: '2024-01-16',
    updatedAt: '2024-01-18',
  },
  {
    id: '4',
    name: 'Salad Dressing',
    description: 'Choose your salad dressing',
    type: 'single',
    isRequired: false,
    isActive: true,
    minSelections: 0,
    maxSelections: 1,
    options: [
      { id: '4a', name: 'Ranch', price: 0 },
      { id: '4b', name: 'Italian', price: 0 },
      { id: '4c', name: 'Caesar', price: 0 },
      { id: '4d', name: 'Balsamic Vinaigrette', price: 0 },
      { id: '4e', name: 'Blue Cheese', price: 0.50 },
    ],
    createdAt: '2024-01-17',
    updatedAt: '2024-01-19',
  },
  {
    id: '5',
    name: 'Spice Level',
    description: 'How spicy would you like it?',
    type: 'single',
    isRequired: false,
    isActive: false,
    minSelections: 0,
    maxSelections: 1,
    options: [
      { id: '5a', name: 'Mild', price: 0, isDefault: true },
      { id: '5b', name: 'Medium', price: 0 },
      { id: '5c', name: 'Hot', price: 0 },
      { id: '5d', name: 'Extra Hot', price: 0 },
    ],
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
  },
];

export default function VendorMenuModifiers() {
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
  // Removed unused variables: showAddModal, setShowAddModal, editingGroup, setEditingGroup

  useEffect(() => {
    const loadModifiers = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setModifierGroups(mockModifierGroups);
      } catch (error) {
        console.error('Error loading modifiers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModifiers();
  }, []);

  const toggleGroupStatus = (groupId: string) => {
    setModifierGroups(groups =>
      groups.map(group =>
        group.id === groupId ? { ...group, isActive: !group.isActive } : group
      )
    );
  };

  const deleteGroup = (groupId: string) => {
    if (confirm('Are you sure you want to delete this modifier group? This action cannot be undone.')) {
      setModifierGroups(groups => groups.filter(group => group.id !== groupId));
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `+$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="bg-white rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Menu Modifiers</h1>
              <p className="text-gray-600">Manage customization options for your menu items</p>
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
                Add Modifier Group
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modifier Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AdjustmentsHorizontalIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{modifierGroups.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Groups</p>
              <p className="text-2xl font-bold text-gray-900">
                {modifierGroups.filter(group => group.isActive).length}
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
              <p className="text-sm font-medium text-gray-600">Total Options</p>
              <p className="text-2xl font-bold text-gray-900">
                {modifierGroups.reduce((sum, group) => sum + group.options.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <AdjustmentsHorizontalIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Required Groups</p>
              <p className="text-2xl font-bold text-gray-900">
                {modifierGroups.filter(group => group.isRequired).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modifier Groups List */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Modifier Groups</h2>
          <p className="text-gray-600 mt-1">Manage your modifier groups and their options</p>
        </div>
        <div className="p-6">
          {modifierGroups.length === 0 ? (
            <div className="text-center py-12">
              <AdjustmentsHorizontalIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No modifier groups created yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 btn-primary"
              >
                Create Your First Modifier Group
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {modifierGroups.map((group) => (
                <div key={group.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          group.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {group.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          group.isRequired 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {group.isRequired ? 'Required' : 'Optional'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {group.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{group.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          Selections: {group.minSelections}-{group.maxSelections === 999 ? '∞' : group.maxSelections}
                        </span>
                        <span>{group.options.length} options</span>
                        <span>Updated: {new Date(group.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleGroupStatus(group.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          group.isActive 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={group.isActive ? 'Deactivate group' : 'Activate group'}
                      >
                        {group.isActive ? (
                          <EyeIcon className="h-4 w-4" />
                        ) : (
                          <EyeSlashIcon className="h-4 w-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => setEditingGroup(group)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit group"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteGroup(group.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete group"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Options List */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.options.map((option) => (
                        <div key={option.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                          <div className="flex items-center space-x-2">
                            {option.isDefault && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full" title="Default option"></span>
                            )}
                            <span className="font-medium text-gray-900">{option.name}</span>
                          </div>
                          <span className={`text-sm font-medium ${
                            option.price === 0 ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {formatPrice(option.price)}
                          </span>
                        </div>
                      ))}
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
            <button 
              onClick={() => setShowAddModal(true)}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
            >
              <PlusIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Add New Group</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
              <AdjustmentsHorizontalIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Bulk Import Modifiers</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center">
              <TagIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Modifier Templates</p>
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Modifier Group</h3>
            <p className="text-gray-600 mb-4">Modifier group creation functionality will be implemented here.</p>
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

      {/* Edit Modal Placeholder */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Modifier Group</h3>
            <p className="text-gray-600 mb-4">Editing {editingGroup.name}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingGroup(null)}
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

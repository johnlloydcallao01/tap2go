'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { MenuItem } from '@/types';

// Mock menu items for vendor
const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    restaurantId: 'rest1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=300&h=200&fit=crop',
    category: 'Pizza',
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    ingredients: ['Mozzarella', 'Tomato Sauce', 'Fresh Basil', 'Olive Oil'],
    allergens: ['Gluten', 'Dairy'],
    available: true,
    preparationTime: 15,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    restaurantId: 'rest1',
    name: 'Pepperoni Pizza',
    description: 'Traditional pepperoni pizza with mozzarella and tomato sauce',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop',
    category: 'Pizza',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    ingredients: ['Pepperoni', 'Mozzarella', 'Tomato Sauce'],
    allergens: ['Gluten', 'Dairy'],
    available: true,
    preparationTime: 15,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    restaurantId: 'rest1',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=200&fit=crop',
    category: 'Salads',
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    ingredients: ['Romaine Lettuce', 'Caesar Dressing', 'Croutons', 'Parmesan'],
    allergens: ['Gluten', 'Dairy'],
    available: false,
    preparationTime: 10,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function VendorMenu() {
  const { user } = useAuth();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (user.role !== 'vendor') {
      router.push('/');
      return;
    }

    // Load menu items
    const loadMenuItems = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMenuItems(mockMenuItems);
      } catch (error) {
        console.error('Error loading menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
  }, [user, router]);

  const toggleItemAvailability = async (itemId: string) => {
    try {
      setMenuItems(prev => prev.map(item =>
        item.id === itemId
          ? { ...item, available: !item.available, updatedAt: new Date() }
          : item
      ));
    } catch (error) {
      console.error('Error updating item availability:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        setMenuItems(prev => prev.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  if (!user || user.role !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be a vendor to access this page.</p>
          <Link href="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="text-gray-600">Manage your restaurant&apos;s menu items and categories</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/vendor/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
              <Link href="/vendor/menu/add" className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New Item
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category === 'all' ? 'All Items' : category}
                <span className="ml-2 text-xs">
                  ({category === 'all'
                    ? menuItems.length
                    : menuItems.filter(item => item.category === category).length
                  })
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <PhotoIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No menu items found</h2>
            <p className="text-gray-600 mb-8">
              {selectedCategory === 'all'
                ? 'Start building your menu by adding your first item.'
                : `No items found in the ${selectedCategory} category.`
              }
            </p>
            <Link href="/vendor/menu/add" className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Your First Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className={`card overflow-hidden ${!item.available ? 'opacity-75' : ''}`}>
                {/* Item Image */}
                <div className="relative h-48">
                  {imageErrors[item.id] ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <PhotoIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  ) : (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={() => setImageErrors(prev => ({...prev, [item.id]: true}))}
                    />
                  )}

                  {/* Availability Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-800">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                    <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{item.description}</p>

                  {/* Dietary Info */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.isVegetarian && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Vegetarian</span>
                    )}
                    {item.isVegan && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Vegan</span>
                    )}
                    {item.isGlutenFree && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Gluten Free</span>
                    )}
                    {item.isSpicy && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Spicy</span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Prep time: {item.preparationTime} min
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`flex-1 text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                        item.available
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {item.available ? (
                        <>
                          <EyeSlashIcon className="h-4 w-4 inline mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <EyeIcon className="h-4 w-4 inline mr-1" />
                          Show
                        </>
                      )}
                    </button>
                    <Link
                      href={`/vendor/menu/edit/${item.id}`}
                      className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium py-2 px-3 rounded-lg transition-colors text-center"
                    >
                      <PencilIcon className="h-4 w-4 inline mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
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
  );
}

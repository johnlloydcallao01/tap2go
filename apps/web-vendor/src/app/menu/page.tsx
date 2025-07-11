'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { MenuItem } from '@/types';

// Professional dummy menu items for visual demonstration
const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    slug: 'margherita-pizza',
    restaurantId: 'rest1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil',
    price: 16.99,
    image: '/api/placeholder/300/200',
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
    slug: 'pepperoni-pizza',
    restaurantId: 'rest1',
    name: 'Pepperoni Pizza',
    description: 'Traditional pepperoni pizza with mozzarella and tomato sauce',
    price: 18.99,
    image: '/api/placeholder/300/200',
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
    slug: 'hawaiian-pizza',
    restaurantId: 'rest1',
    name: 'Hawaiian Pizza',
    description: 'Sweet and savory pizza with ham, pineapple, and mozzarella',
    price: 19.99,
    image: '/api/placeholder/300/200',
    category: 'Pizza',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    ingredients: ['Ham', 'Pineapple', 'Mozzarella', 'Tomato Sauce'],
    allergens: ['Gluten', 'Dairy'],
    available: true,
    preparationTime: 18,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    slug: 'meat-lovers-pizza',
    restaurantId: 'rest1',
    name: 'Meat Lovers Pizza',
    description: 'Loaded with pepperoni, sausage, bacon, and ham',
    price: 22.99,
    image: '/api/placeholder/300/200',
    category: 'Pizza',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    ingredients: ['Pepperoni', 'Italian Sausage', 'Bacon', 'Ham', 'Mozzarella'],
    allergens: ['Gluten', 'Dairy'],
    available: true,
    preparationTime: 20,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    slug: 'caesar-salad',
    restaurantId: 'rest1',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
    price: 12.99,
    image: '/api/placeholder/300/200',
    category: 'Salads',
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    ingredients: ['Romaine Lettuce', 'Caesar Dressing', 'Croutons', 'Parmesan'],
    allergens: ['Gluten', 'Dairy'],
    available: true,
    preparationTime: 10,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    slug: 'greek-salad',
    restaurantId: 'rest1',
    name: 'Greek Salad',
    description: 'Mixed greens with feta cheese, olives, tomatoes, and Greek dressing',
    price: 13.99,
    image: '/api/placeholder/300/200',
    category: 'Salads',
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isSpicy: false,
    ingredients: ['Mixed Greens', 'Feta Cheese', 'Kalamata Olives', 'Tomatoes', 'Red Onion'],
    allergens: ['Dairy'],
    available: true,
    preparationTime: 8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '7',
    slug: 'chicken-wings',
    restaurantId: 'rest1',
    name: 'Buffalo Chicken Wings',
    description: 'Crispy chicken wings tossed in spicy buffalo sauce',
    price: 13.99,
    image: '/api/placeholder/300/200',
    category: 'Appetizers',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isSpicy: true,
    ingredients: ['Chicken Wings', 'Buffalo Sauce', 'Celery', 'Blue Cheese Dip'],
    allergens: ['Dairy'],
    available: true,
    preparationTime: 12,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '8',
    slug: 'mozzarella-sticks',
    restaurantId: 'rest1',
    name: 'Mozzarella Sticks',
    description: 'Golden fried mozzarella sticks served with marinara sauce',
    price: 9.99,
    image: '/api/placeholder/300/200',
    category: 'Appetizers',
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    ingredients: ['Mozzarella Cheese', 'Breadcrumbs', 'Marinara Sauce'],
    allergens: ['Gluten', 'Dairy'],
    available: true,
    preparationTime: 8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '9',
    slug: 'chicken-alfredo',
    restaurantId: 'rest1',
    name: 'Chicken Alfredo Pasta',
    description: 'Grilled chicken breast over fettuccine with creamy alfredo sauce',
    price: 17.99,
    image: '/api/placeholder/300/200',
    category: 'Main Courses',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    ingredients: ['Grilled Chicken', 'Fettuccine', 'Alfredo Sauce', 'Parmesan'],
    allergens: ['Gluten', 'Dairy'],
    available: true,
    preparationTime: 18,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '10',
    slug: 'beef-burger',
    restaurantId: 'rest1',
    name: 'Classic Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
    price: 14.99,
    image: '/api/placeholder/300/200',
    category: 'Main Courses',
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    ingredients: ['Beef Patty', 'Lettuce', 'Tomato', 'Onion', 'Special Sauce', 'Brioche Bun'],
    allergens: ['Gluten', 'Dairy'],
    available: true,
    preparationTime: 15,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '11',
    slug: 'chocolate-cake',
    restaurantId: 'rest1',
    name: 'Chocolate Fudge Cake',
    description: 'Rich chocolate cake with fudge frosting and chocolate chips',
    price: 7.99,
    image: '/api/placeholder/300/200',
    category: 'Desserts',
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    ingredients: ['Chocolate Cake', 'Fudge Frosting', 'Chocolate Chips'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    available: true,
    preparationTime: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '12',
    slug: 'tiramisu',
    restaurantId: 'rest1',
    name: 'Classic Tiramisu',
    description: 'Traditional Italian dessert with coffee-soaked ladyfingers and mascarpone',
    price: 8.99,
    image: '/api/placeholder/300/200',
    category: 'Desserts',
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    ingredients: ['Ladyfingers', 'Mascarpone', 'Coffee', 'Cocoa Powder'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    available: false,
    preparationTime: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function VendorMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // Load menu items - removed authentication restrictions for demo purposes
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
  }, []);

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

  // Removed access restrictions for demo purposes - showing professional dummy content

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="text-gray-600">Manage your restaurant&apos;s menu items and categories</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/vendor/dashboard" className="btn-secondary">
                Back to Dashboard
              </Link>
              <Link href="/vendor/menu/categories" className="btn-secondary">
                Manage Categories
              </Link>
              <button className="btn-primary flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add New Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PhotoIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{menuItems.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {menuItems.filter(item => item.available).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <PhotoIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(menuItems.map(item => item.category)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <EyeSlashIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unavailable</p>
              <p className="text-2xl font-bold text-gray-900">
                {menuItems.filter(item => !item.available).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Filter by Category</h2>
            <span className="text-sm text-gray-500">{filteredItems.length} items</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
      </div>

      {/* Menu Items */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
          <p className="text-gray-600 mt-1">Manage your restaurant&apos;s menu items</p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="border border-gray-200 rounded-lg animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-t-lg"></div>
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
              <button className="btn-primary flex items-center mx-auto">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Your First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${!item.available ? 'opacity-75' : ''}`}>
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
    </div>
  );
}

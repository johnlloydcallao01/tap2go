'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import MenuItem from '@/components/MenuItem';
import { Restaurant, MenuItem as MenuItemType } from '@/types';
import {
  StarIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/solid';

// Mock data for demonstration
const mockRestaurant: Restaurant = {
  id: '1',
  name: 'Pizza Palace',
  description: 'Authentic Italian pizza with fresh ingredients and traditional recipes passed down through generations.',
  image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=300&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop',
  cuisine: ['Italian', 'Pizza'],
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  phone: '+1-555-0123',
  email: 'info@pizzapalace.com',
  ownerId: 'owner1',
  rating: 4.5,
  reviewCount: 128,
  deliveryTime: '25-35 min',
  deliveryFee: 2.99,
  minimumOrder: 15.00,
  isOpen: true,
  openingHours: {
    monday: { open: '11:00', close: '22:00', isClosed: false },
    tuesday: { open: '11:00', close: '22:00', isClosed: false },
    wednesday: { open: '11:00', close: '22:00', isClosed: false },
    thursday: { open: '11:00', close: '22:00', isClosed: false },
    friday: { open: '11:00', close: '23:00', isClosed: false },
    saturday: { open: '11:00', close: '23:00', isClosed: false },
    sunday: { open: '12:00', close: '21:00', isClosed: false }
  },
  featured: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockMenuItems: MenuItemType[] = [
  {
    id: '1',
    restaurantId: '1',
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
    restaurantId: '1',
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
    restaurantId: '1',
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
    available: true,
    preparationTime: 10,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function RestaurantPage() {
  const params = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        // In a real app, this would fetch data based on params.id
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRestaurant(mockRestaurant);
        setMenuItems(mockMenuItems);
      } catch (error) {
        console.error('Error loading restaurant data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-300 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h1>
            <p className="text-gray-600">The restaurant you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const categories = [...new Set(menuItems.map(item => item.category))];
  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80">
        <Image
          src={restaurant.coverImage || restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-lg opacity-90">{restaurant.description}</p>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-2">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="font-semibold">{restaurant.rating}</span>
              <span className="text-gray-600">({restaurant.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-5 w-5 text-gray-400" />
              <span>${restaurant.deliveryFee ? restaurant.deliveryFee.toFixed(2) : '0.00'} delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Min order: ${restaurant.minimumOrder ? restaurant.minimumOrder.toFixed(2) : '0.00'}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.cuisine.map((cuisine, index) => (
                <span
                  key={index}
                  className="inline-block bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full"
                >
                  {cuisine}
                </span>
              ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4" />
                <span>{restaurant.address.street}, {restaurant.address.city}</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-4 w-4" />
                <span>{restaurant.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="container-custom py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          {filteredMenuItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

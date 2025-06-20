'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartIcon,
  StarIcon,
  ClockIcon,
  TruckIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';

interface FavoriteRestaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  isOpen: boolean;
  description: string;
  distance: string;
}

interface FavoriteItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  image: string;
  price: number;
  description: string;
  category: string;
}

export default function FavoritesContent() {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<FavoriteRestaurant[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'items'>('restaurants');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading favorites
    setTimeout(() => {
      setFavoriteRestaurants([
        {
          id: '1',
          name: 'Pizza Palace',
          image: '/api/placeholder/300/200',
          cuisine: 'Italian',
          rating: 4.8,
          reviewCount: 324,
          deliveryTime: '20-30 min',
          deliveryFee: 2.99,
          isOpen: true,
          description: 'Authentic Italian pizza with fresh ingredients',
          distance: '1.2 km',
        },
        {
          id: '2',
          name: 'Sushi Zen',
          image: '/api/placeholder/300/200',
          cuisine: 'Japanese',
          rating: 4.9,
          reviewCount: 567,
          deliveryTime: '25-35 min',
          deliveryFee: 3.99,
          isOpen: true,
          description: 'Fresh sushi and traditional Japanese cuisine',
          distance: '2.1 km',
        },
        {
          id: '3',
          name: 'Burger Junction',
          image: '/api/placeholder/300/200',
          cuisine: 'American',
          rating: 4.6,
          reviewCount: 189,
          deliveryTime: '15-25 min',
          deliveryFee: 1.99,
          isOpen: false,
          description: 'Gourmet burgers and crispy fries',
          distance: '0.8 km',
        },
      ]);

      setFavoriteItems([
        {
          id: '1',
          restaurantId: '1',
          restaurantName: 'Pizza Palace',
          name: 'Margherita Pizza',
          image: '/api/placeholder/150/150',
          price: 18.99,
          description: 'Fresh tomatoes, mozzarella, and basil',
          category: 'Pizza',
        },
        {
          id: '2',
          restaurantId: '2',
          restaurantName: 'Sushi Zen',
          name: 'California Roll',
          image: '/api/placeholder/150/150',
          price: 8.99,
          description: 'Crab, avocado, and cucumber',
          category: 'Sushi',
        },
        {
          id: '3',
          restaurantId: '3',
          restaurantName: 'Burger Junction',
          name: 'Classic Burger',
          image: '/api/placeholder/150/150',
          price: 12.99,
          description: 'Beef patty, lettuce, tomato, and special sauce',
          category: 'Burgers',
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const removeFavoriteRestaurant = (restaurantId: string) => {
    setFavoriteRestaurants(prev => prev.filter(restaurant => restaurant.id !== restaurantId));
  };

  const removeFavoriteItem = (itemId: string) => {
    setFavoriteItems(prev => prev.filter(item => item.id !== itemId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Favorites</h1>
            <p className="text-gray-600">Your favorite restaurants and dishes</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {favoriteRestaurants.length + favoriteItems.length} Favorites
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'restaurants'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Restaurants ({favoriteRestaurants.length})
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'items'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dishes ({favoriteItems.length})
          </button>
        </div>
      </div>

      {/* Favorite Restaurants */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          {favoriteRestaurants.length > 0 ? (
            favoriteRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 relative">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
                          {!restaurant.isOpen && (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                              Closed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{restaurant.cuisine} • {restaurant.distance}</p>
                        <p className="text-sm text-gray-500 mb-3">{restaurant.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span>{restaurant.rating}</span>
                            <span className="ml-1">({restaurant.reviewCount})</span>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span>{restaurant.deliveryTime}</span>
                          </div>
                          <div className="flex items-center">
                            <TruckIcon className="h-4 w-4 mr-1" />
                            <span>${restaurant.deliveryFee}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeFavoriteRestaurant(restaurant.id)}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <HeartSolidIcon className="h-5 w-5" />
                        </button>
                        <Link
                          href={`/restaurants/${restaurant.id}`}
                          className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          Order Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite restaurants yet</h3>
              <p className="text-gray-500 mb-6">Start exploring and add restaurants to your favorites</p>
              <Link
                href="/restaurants"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Browse Restaurants
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Favorite Items */}
      {activeTab === 'items' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteItems.length > 0 ? (
            favoriteItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="relative">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => removeFavoriteItem(item.id)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
                  >
                    <HeartSolidIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{item.restaurantName}</p>
                  <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">${item.price}</span>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-1 px-3 rounded-lg transition-colors text-sm flex items-center">
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite dishes yet</h3>
              <p className="text-gray-500 mb-6">Add dishes to your favorites for quick ordering</p>
              <Link
                href="/restaurants"
                className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Browse Menu
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MobileFooterNav from '@/components/MobileFooterNav';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  cuisineTypes: string[];
  isOpen: boolean;
  distance: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');

  const cuisineTypes = ['all', 'Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'Thai', 'Japanese', 'Filipino'];

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        // Load restaurants from Firestore
        const restaurantsRef = collection(db, 'restaurants');
        const restaurantsQuery = query(restaurantsRef, limit(20));
        const restaurantsSnapshot = await getDocs(restaurantsQuery);

        const restaurantsData = restaurantsSnapshot.docs.map(doc => {
          const data = doc.data();
          // Transform database fields to match component interface
          return {
            id: doc.id,
            name: data.outletName || data.name || '',
            description: data.description || '',
            image: data.coverImageUrl || data.image || '/api/placeholder/300/200',
            rating: data.avgRating || data.rating || 0,
            deliveryTime: data.estimatedDeliveryRange || data.deliveryTime || 'N/A',
            deliveryFee: data.deliveryFees?.base || data.deliveryFee || 0,
            minimumOrder: data.minOrderValue || data.minimumOrder || 0,
            cuisineTypes: data.cuisineTags || data.cuisine || [],
            isOpen: data.isAcceptingOrders !== undefined ? data.isAcceptingOrders : (data.isOpen !== undefined ? data.isOpen : true),
            distance: '1.5 km', // Default distance for now
          };
        }) as Restaurant[];

        setRestaurants(restaurantsData);
      } catch (error) {
        console.error('Error loading restaurants:', error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisineTypes.includes(selectedCuisine);

    return matchesSearch && matchesCuisine;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <MobileFooterNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />

      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">All Restaurants</h1>
          <p className="text-gray-600">Discover amazing restaurants and food outlets near you</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#f3a823' } as React.CSSProperties}
            />
          </div>

          {/* Cuisine Filter */}
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {cuisineTypes.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCuisine === cuisine
                    ? 'text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
                style={selectedCuisine === cuisine ? { backgroundColor: '#f3a823' } : {}}
              >
                {cuisine === 'all' ? 'All Cuisines' : cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/restaurant/${restaurant.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image</span>
                </div>
                {!restaurant.isOpen && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">Closed</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center space-x-1">
                  <StarIconSolid className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">{restaurant.rating}</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{restaurant.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{restaurant.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{restaurant.distance}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Min. order: ${restaurant.minimumOrder}
                  </span>
                  <span className="text-gray-600">
                    Delivery: ${restaurant.deliveryFee}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {restaurant.cuisineTypes.map((cuisine) => (
                    <span
                      key={cuisine}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      <MobileFooterNav />
    </div>
  );
}

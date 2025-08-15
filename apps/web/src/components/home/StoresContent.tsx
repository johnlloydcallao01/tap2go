'use client';

import React, { useState, useEffect } from 'react';
import RestaurantCard from '@/components/RestaurantCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Restaurant } from '@/types';
// Firestore imports removed - use PayloadCMS collections instead

export default function StoresContent() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');

  const cuisineTypes = ['all', 'Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'Thai', 'Japanese', 'Filipino'];

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        // TODO: Replace with PayloadCMS API call
        // Use PayloadCMS collections for restaurant data
        console.log('Firestore removed - implement PayloadCMS restaurant loading');
        setRestaurants([]);
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
    const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisine.includes(selectedCuisine);

    return matchesSearch && matchesCuisine;
  });

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <section className="py-8 bg-white border border-gray-200 rounded-lg">
          <div className="px-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-300 rounded"></div>
                <div className="flex space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-300 rounded-full w-20"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Loading Grid */}
        <section className="py-8 bg-white border border-gray-200 rounded-lg">
          <div className="px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
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
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="py-8 bg-white border border-gray-200 rounded-lg">
        <div className="px-6">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">All Restaurants</h1>
            <p className="text-gray-600">Discover amazing restaurants and food outlets near you</p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
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
        </div>
      </section>

      {/* Restaurants Grid Section */}
      <section className="py-8 bg-white border border-gray-200 rounded-lg">
        <div className="px-6">
          {filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 rounded-lg">
        <div className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f3a823' }}>
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold">Tap2Go</span>
              </div>
              <p className="text-gray-400">
                Your favorite food delivery platform. Fast, reliable, and delicious.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Restaurants</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Partner with Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Restaurant Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Support</a></li>
                <li><a href="/analytics-demo" className="hover:text-orange-400 transition-colors font-medium">📊 Analytics Demo</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tap2Go. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import MobileFooterNav from '@/components/MobileFooterNav';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: 'restaurant' | 'dish';
  name: string;
  description: string;
  image: string;
  rating?: number;
  price?: number;
  restaurantName?: string;
  deliveryTime?: string;
  cuisineTypes?: string[];
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const filters = [
    { id: 'all', name: 'All' },
    { id: 'restaurant', name: 'Restaurants' },
    { id: 'dish', name: 'Dishes' },
  ];

  const popularSearches = [
    'Pizza', 'Burger', 'Sushi', 'Tacos', 'Chinese Food', 'Italian', 'Thai', 'Indian'
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'restaurant',
          name: 'Pizza Palace',
          description: 'Authentic Italian pizza and pasta',
          image: '/api/placeholder/300/200',
          rating: 4.5,
          deliveryTime: '25-35 min',
          cuisineTypes: ['Italian'],
        },
        {
          id: '2',
          type: 'dish',
          name: 'Margherita Pizza',
          description: 'Classic tomato, mozzarella, and basil',
          image: '/api/placeholder/300/200',
          price: 14.99,
          restaurantName: 'Pizza Palace',
        },
        {
          id: '3',
          type: 'restaurant',
          name: 'Dragon Garden',
          description: 'Traditional Chinese cuisine',
          image: '/api/placeholder/300/200',
          rating: 4.3,
          deliveryTime: '30-40 min',
          cuisineTypes: ['Chinese'],
        },
        {
          id: '4',
          type: 'dish',
          name: 'Kung Pao Chicken',
          description: 'Spicy stir-fried chicken with peanuts',
          image: '/api/placeholder/300/200',
          price: 16.99,
          restaurantName: 'Dragon Garden',
        },
      ];

      // Filter results based on search query and selected filter
      const filtered = mockResults.filter(result => {
        const matchesQuery = result.name.toLowerCase().includes(query.toLowerCase()) ||
                           result.description.toLowerCase().includes(query.toLowerCase());
        const matchesFilter = selectedFilter === 'all' || result.type === selectedFilter;
        return matchesQuery && matchesFilter;
      });

      setResults(filtered);

      // Add to recent searches
      if (query.trim() && !recentSearches.includes(query)) {
        const updated = [query, ...recentSearches.slice(0, 4)];
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />

      <div className="container-custom py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Search</h1>
          <p className="text-gray-600">Find your favorite restaurants and dishes</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for restaurants, dishes, cuisines..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
              autoFocus
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            <FunnelIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === filter.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-gray-600">Searching...</span>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results ({results.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.type === 'restaurant' ? `/restaurant/${result.id}` : `/restaurant/${result.id}#${result.name}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Image</span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.type === 'restaurant'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {result.type === 'restaurant' ? 'Restaurant' : 'Dish'}
                      </span>
                    </div>
                    {result.rating && (
                      <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center space-x-1">
                        <StarIconSolid className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium">{result.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{result.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{result.description}</p>

                    {result.type === 'restaurant' && result.deliveryTime && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>{result.deliveryTime}</span>
                      </div>
                    )}

                    {result.type === 'dish' && (
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-orange-500">
                          ${result.price}
                        </span>
                        <span className="text-sm text-gray-500">
                          from {result.restaurantName}
                        </span>
                      </div>
                    )}

                    {result.cuisineTypes && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {result.cuisineTypes.map((cuisine) => (
                          <span
                            key={cuisine}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && searchQuery && results.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try searching for something else</p>
          </div>
        )}

        {/* Recent Searches & Popular Searches */}
        {!searchQuery && (
          <div className="space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Searches</h2>
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-orange-500 hover:text-orange-600"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Searches</h2>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-50 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <MobileFooterNav />
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import RestaurantCard from '@/components/RestaurantCard';
import { Restaurant, Category } from '@/types';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { transformRestaurantsData } from '@/lib/transformers/restaurant';
import ProfessionalMap from '@/components/ProfessionalMap';

export default function HomeContent() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Professional map state
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number; lng: number; address: string} | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories from Firestore
        const categoriesRef = collection(db(), 'categories');
        const categoriesQuery = query(categoriesRef, orderBy('sortOrder'));
        const categoriesSnapshot = await getDocs(categoriesQuery);

        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];

        setCategories(categoriesData);

        // Load restaurants from Firestore
        const restaurantsRef = collection(db(), 'restaurants');
        const restaurantsQuery = query(restaurantsRef, limit(12));
        const restaurantsSnapshot = await getDocs(restaurantsQuery);

        // Use centralized transformer for consistency
        const restaurantsData = transformRestaurantsData(restaurantsSnapshot.docs);

        setRestaurants(restaurantsData);

      } catch (error) {
        console.error('Error loading data:', error);
        // Set empty arrays if Firestore fails
        setRestaurants([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = !searchQuery ||
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory ||
      restaurant.cuisine.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Professional map handlers
  const handleLocationSelect = (location: {lat: number; lng: number; address: string}) => {
    setSelectedLocation(location);
    console.log('Location selected:', location);
  };

  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  return (
    <div className="space-y-8">
      {/* Professional Map Section */}
      <section className="py-8 bg-white border border-gray-200 rounded-lg">
        <div className="px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Explore Locations</h2>
              <p className="text-gray-600 mt-1">
                {selectedLocation
                  ? `Selected: ${selectedLocation.address}`
                  : 'Search and explore any location in the Philippines'
                }
              </p>
            </div>
            <button
              onClick={toggleMapView}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showMap
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>

          {showMap && (
            <div className="bg-gray-50 rounded-lg p-4">
              <ProfessionalMap
                height="500px"
                className="w-full"
                onLocationSelect={handleLocationSelect}
                center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : undefined}
              />

              <div className="mt-4 text-sm text-gray-600 text-center">
                <p>Search any location • Click on the map to select • Drag markers to adjust position • Professional Google Maps integration</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-8 bg-white border border-gray-200 rounded-lg">
          <div className="px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={selectedCategory === '' ? { backgroundColor: '#f3a823' } : {}}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === category.name
                      ? 'text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  style={selectedCategory === category.name ? { backgroundColor: '#f3a823' } : {}}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Restaurants */}
      <section className="py-8 bg-white border border-gray-200 rounded-lg">
        <div className="px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {searchQuery || selectedCategory ? 'Search Results' : 'Restaurants'}
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
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
          ) : filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants available yet</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || selectedCategory
                  ? 'No restaurants found matching your criteria. Try adjusting your search or filters.'
                  : 'We\'re working on adding amazing restaurants to your area. Check back soon!'
                }
              </p>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              )}
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

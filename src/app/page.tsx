'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import MobileFooterNav from '@/components/MobileFooterNav';
import RestaurantCard from '@/components/RestaurantCard';
import { Restaurant, Category } from '@/types';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// No mock data - using real Firestore data only

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories from Firestore
        const categoriesRef = collection(db, 'categories');
        const categoriesQuery = query(categoriesRef, orderBy('sortOrder'));
        const categoriesSnapshot = await getDocs(categoriesQuery);

        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];

        setCategories(categoriesData);

        // Load restaurants from Firestore
        const restaurantsRef = collection(db, 'restaurants');
        const restaurantsQuery = query(restaurantsRef, limit(12));
        const restaurantsSnapshot = await getDocs(restaurantsQuery);

        const restaurantsData = restaurantsSnapshot.docs.map(doc => {
          const data = doc.data();
          // Transform database fields to match TypeScript interface
          return {
            id: doc.id,
            name: data.outletName || data.name || '',
            description: data.description || '',
            image: data.coverImageUrl || data.image || '',
            coverImage: data.coverImageUrl || data.image || '',
            cuisine: data.cuisineTags || data.cuisine || [],
            address: data.address || {},
            phone: data.outletPhone || data.phone || '',
            email: data.email || '',
            ownerId: data.vendorRef || data.ownerId || '',
            rating: data.avgRating || data.rating || 0,
            reviewCount: data.totalReviews || data.reviewCount || 0,
            deliveryTime: data.estimatedDeliveryRange || data.deliveryTime || 'N/A',
            deliveryFee: data.deliveryFees?.base || data.deliveryFee || 0,
            minimumOrder: data.minOrderValue || data.minimumOrder || 0,
            isOpen: data.isAcceptingOrders !== undefined ? data.isAcceptingOrders : (data.isOpen !== undefined ? data.isOpen : true),
            openingHours: data.operatingHours || data.openingHours || {},
            featured: data.featured || false,
            status: data.platformStatus || data.status || 'active',
            commissionRate: data.commissionRate || 15,
            totalOrders: data.totalOrders || 0,
            totalRevenue: data.totalRevenue || 0,
            averagePreparationTime: data.preparationTime?.average || data.averagePreparationTime || 20,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          };
        }) as Restaurant[];

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />

      {/* Hero Section */}
      <section className="text-white py-16" style={{ background: 'linear-gradient(to right, #f3a823, #ef7b06)' }}>
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Delicious food, delivered fast
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Order from your favorite restaurants and get it delivered to your doorstep
            </p>

            {/* Search and Location */}
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search restaurants, cuisines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#f3a823' } as React.CSSProperties}
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter delivery address"
                    className="w-full pl-10 pr-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#f3a823' } as React.CSSProperties}
                  />
                </div>
                <button
                  className="text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: '#f3a823' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ef7b06'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3a823'}
                >
                  Find Food
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12">
          <div className="container-custom">
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
      <section className="py-12">
        <div className="container-custom">
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-custom">
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
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tap2Go. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <MobileFooterNav />
    </div>
  );
}

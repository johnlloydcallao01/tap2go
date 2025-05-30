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
import Link from 'next/link';

interface Vendor {
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

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');

  const cuisineTypes = ['all', 'Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'Thai', 'Japanese'];

  useEffect(() => {
    const loadVendors = async () => {
      try {
        // Simulate loading vendors data
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockVendors: Vendor[] = [
          {
            id: '1',
            name: 'Pizza Palace',
            description: 'Authentic Italian pizza and pasta',
            image: '/api/placeholder/300/200',
            rating: 4.5,
            deliveryTime: '25-35 min',
            deliveryFee: 2.99,
            minimumOrder: 15,
            cuisineTypes: ['Italian'],
            isOpen: true,
            distance: '1.2 km',
          },
          {
            id: '2',
            name: 'Dragon Garden',
            description: 'Traditional Chinese cuisine',
            image: '/api/placeholder/300/200',
            rating: 4.3,
            deliveryTime: '30-40 min',
            deliveryFee: 3.49,
            minimumOrder: 20,
            cuisineTypes: ['Chinese'],
            isOpen: true,
            distance: '2.1 km',
          },
          {
            id: '3',
            name: 'Taco Fiesta',
            description: 'Fresh Mexican street food',
            image: '/api/placeholder/300/200',
            rating: 4.7,
            deliveryTime: '20-30 min',
            deliveryFee: 2.49,
            minimumOrder: 12,
            cuisineTypes: ['Mexican'],
            isOpen: false,
            distance: '0.8 km',
          },
          {
            id: '4',
            name: 'Spice Route',
            description: 'Authentic Indian flavors',
            image: '/api/placeholder/300/200',
            rating: 4.4,
            deliveryTime: '35-45 min',
            deliveryFee: 3.99,
            minimumOrder: 18,
            cuisineTypes: ['Indian'],
            isOpen: true,
            distance: '1.5 km',
          },
        ];

        setVendors(mockVendors);
      } catch (error) {
        console.error('Error loading vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, []);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || vendor.cuisineTypes.includes(selectedCuisine);

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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">All Vendors</h1>
          <p className="text-gray-600">Discover amazing restaurants and food vendors near you</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cuisine === 'all' ? 'All Cuisines' : cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/restaurant/${vendor.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Image</span>
                </div>
                {!vendor.isOpen && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">Closed</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center space-x-1">
                  <StarIconSolid className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">{vendor.rating}</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{vendor.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{vendor.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{vendor.deliveryTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{vendor.distance}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Min. order: ${vendor.minimumOrder}
                  </span>
                  <span className="text-gray-600">
                    Delivery: ${vendor.deliveryFee}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {vendor.cuisineTypes.map((cuisine) => (
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

        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      <MobileFooterNav />
    </div>
  );
}

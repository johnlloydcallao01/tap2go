'use client';

import React, { useState } from 'react';
import Image from '@/components/ui/ImageWrapper';

/**
 * Recently Viewed Page - Display user's recently viewed items
 * Professional and modern design with comprehensive item management
 */

// Mock recently viewed data
const mockRecentlyViewed = [
  {
    id: 1,
    title: "Artisan Sourdough Bread",
    category: "Bakery",
    price: "$8.99",
    originalPrice: "$10.99",
    image: "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.9,
    reviews: "342",
    merchant: "Golden Crust Bakery",
    brand: "Artisan Delights",
    viewedAt: "2 hours ago",
    isOnSale: true,
    isAvailable: true
  },
  {
    id: 2,
    title: "Fresh Atlantic Salmon",
    category: "Seafood",
    price: "$18.99",
    originalPrice: "$22.99",
    image: "https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.8,
    reviews: "156",
    merchant: "Ocean Fresh Market",
    brand: "Premium Catch",
    viewedAt: "4 hours ago",
    isOnSale: true,
    isAvailable: true
  },
  {
    id: 3,
    title: "Organic Avocados (Pack of 6)",
    category: "Produce",
    price: "$12.99",
    originalPrice: null,
    image: "https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.7,
    reviews: "89",
    merchant: "Green Valley Farms",
    brand: "Organic Select",
    viewedAt: "6 hours ago",
    isOnSale: false,
    isAvailable: true
  },
  {
    id: 4,
    title: "Gourmet Pizza Margherita",
    category: "Ready Meals",
    price: "$15.99",
    originalPrice: "$18.99",
    image: "https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.6,
    reviews: "234",
    merchant: "Bella Italia Kitchen",
    brand: "Chef's Choice",
    viewedAt: "1 day ago",
    isOnSale: true,
    isAvailable: false
  },
  {
    id: 5,
    title: "Premium Coffee Beans - Dark Roast",
    category: "Beverages",
    price: "$24.99",
    originalPrice: null,
    image: "https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.9,
    reviews: "567",
    merchant: "Mountain Peak Coffee",
    brand: "Roaster's Select",
    viewedAt: "2 days ago",
    isOnSale: false,
    isAvailable: true
  },
  {
    id: 6,
    title: "Grass-Fed Beef Steaks",
    category: "Meat",
    price: "$32.99",
    originalPrice: "$38.99",
    image: "https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.8,
    reviews: "123",
    merchant: "Prime Cuts Butchery",
    brand: "Ranch Select",
    viewedAt: "3 days ago",
    isOnSale: true,
    isAvailable: true
  },
  {
    id: 7,
    title: "Artisan Cheese Selection",
    category: "Dairy",
    price: "$28.99",
    originalPrice: null,
    image: "https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.7,
    reviews: "78",
    merchant: "Countryside Creamery",
    brand: "Artisan Collection",
    viewedAt: "4 days ago",
    isOnSale: false,
    isAvailable: true
  },
  {
    id: 8,
    title: "Fresh Herb Garden Kit",
    category: "Garden",
    price: "$19.99",
    originalPrice: "$24.99",
    image: "https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 4.5,
    reviews: "145",
    merchant: "Green Thumb Nursery",
    brand: "Garden Pro",
    viewedAt: "1 week ago",
    isOnSale: true,
    isAvailable: true
  }
];

const filterOptions = [
  { id: 'all', label: 'All Items', count: mockRecentlyViewed.length },
  { id: 'available', label: 'Available', count: mockRecentlyViewed.filter(item => item.isAvailable).length },
  { id: 'on_sale', label: 'On Sale', count: mockRecentlyViewed.filter(item => item.isOnSale).length },
  { id: 'today', label: 'Today', count: mockRecentlyViewed.filter(item => item.viewedAt.includes('hours')).length }
];

export default function RecentlyViewedPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on active filter and search query
  const filteredItems = mockRecentlyViewed.filter(item => {
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'available' && item.isAvailable) ||
      (activeFilter === 'on_sale' && item.isOnSale) ||
      (activeFilter === 'today' && item.viewedAt.includes('hours'));
    
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleAddToCart = (itemId: number) => {
    console.log('Adding item to cart:', itemId);
    // Add to cart logic here
  };

  const handleRemoveFromHistory = (itemId: number) => {
    console.log('Removing item from history:', itemId);
    // Remove from history logic here
  };

  const clearAllHistory = () => {
    console.log('Clearing all history');
    // Clear all history logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="w-full px-2.5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Recently Viewed</h1>
              <p className="text-gray-600 mt-1 text-base">Items you&apos;ve recently browsed</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={clearAllHistory}
                className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
              >
                <i className="fas fa-trash mr-2"></i>
                Clear History
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-2.5 py-4">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search recently viewed items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    activeFilter === filter.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                  <span className="ml-1 text-xs opacity-75">({filter.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Item Image */}
                <div className="relative">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  {item.isOnSale && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Sale
                    </div>
                  )}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Out of Stock</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFromHistory(item.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                  >
                    <i className="fas fa-times text-gray-600 text-xs"></i>
                  </button>
                </div>

                {/* Item Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-500 mb-3 font-medium">{item.category} • {item.merchant}</p>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star text-xs ${
                            i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        ></i>
                      ))}
                    </div>
                    <span className="text-xs text-gray-600 ml-1 font-medium">
                      {item.rating} ({item.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-base">{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">{item.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  {/* Viewed Time */}
                  <p className="text-xs text-gray-500 mb-4 font-medium">
                    <i className="fas fa-clock mr-1"></i>
                    Viewed {item.viewedAt}
                  </p>

                  {/* Action Button */}
                  <button
                    onClick={() => handleAddToCart(item.id)}
                    disabled={!item.isAvailable}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                      item.isAvailable
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <i className="fas fa-shopping-cart mr-2"></i>
                        Add to Cart
                      </>
                    ) : (
                      'Out of Stock'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="fas fa-history text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {searchQuery ? 'No items found' : 'No recently viewed items'}
              </h3>
              <p className="text-gray-600 mb-6 text-base">
                {searchQuery 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Items you browse will appear here for easy access'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-md"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

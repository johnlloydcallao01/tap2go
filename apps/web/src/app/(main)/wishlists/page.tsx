'use client';

import React, { useState } from 'react';
import ImageWrapper from '@/components/ui/ImageWrapper';

/**
 * Wishlists Page - Display user's saved food items and restaurants
 * Features professional food delivery wishlist with filtering and management
 */
export default function WishlistsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock wishlist data with food items and restaurants
  const wishlistItems = [
    {
      id: 1,
      type: 'food',
      title: "Truffle Mushroom Pizza",
      restaurant: "Bella Italia",
      category: "Italian",
      price: 24.99,
      originalPrice: 29.99,
      image: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
      rating: 4.8,
      reviews: 342,
      cookingTime: "25-35 min",
      isOnSale: true,
      description: "Wood-fired pizza with truffle oil, wild mushrooms, and fresh mozzarella"
    },
    {
      id: 2,
      type: 'food',
      title: "Wagyu Beef Burger",
      restaurant: "Gourmet Burgers Co.",
      category: "American",
      price: 18.50,
      originalPrice: null,
      image: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
      rating: 4.9,
      reviews: 567,
      cookingTime: "15-20 min",
      isOnSale: false,
      description: "Premium wagyu beef patty with aged cheddar, caramelized onions, and truffle aioli"
    },
    {
      id: 3,
      type: 'food',
      title: "Dragon Roll Sushi",
      restaurant: "Sakura Sushi",
      category: "Japanese",
      price: 16.99,
      originalPrice: 19.99,
      image: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg",
      rating: 4.7,
      reviews: 234,
      cookingTime: "10-15 min",
      isOnSale: true,
      description: "Fresh eel and cucumber roll topped with avocado and spicy mayo"
    },
    {
      id: 4,
      type: 'restaurant',
      title: "Ocean's Bounty",
      category: "Seafood",
      rating: 4.6,
      reviews: 1234,
      image: "https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg",
      deliveryTime: "30-45 min",
      deliveryFee: 2.99,
      minOrder: 25.00,
      description: "Fresh seafood restaurant specializing in sustainable catch and coastal cuisine"
    },
    {
      id: 5,
      type: 'food',
      title: "Pad Thai Noodles",
      restaurant: "Thai Garden",
      category: "Thai",
      price: 13.99,
      originalPrice: null,
      image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
      rating: 4.5,
      reviews: 445,
      cookingTime: "20-25 min",
      isOnSale: false,
      description: "Traditional stir-fried rice noodles with shrimp, tofu, bean sprouts, and tamarind sauce"
    },
    {
      id: 6,
      type: 'restaurant',
      title: "Mediterranean Delights",
      category: "Mediterranean",
      rating: 4.8,
      reviews: 892,
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
      deliveryTime: "25-40 min",
      deliveryFee: 1.99,
      minOrder: 20.00,
      description: "Authentic Mediterranean cuisine with fresh ingredients and traditional recipes"
    }
  ];

  const categories = ['all', 'food', 'restaurant'];
  const cuisineTypes = ['All', 'Italian', 'American', 'Japanese', 'Seafood', 'Thai', 'Mediterranean'];

  const filteredItems = wishlistItems.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.restaurant && item.restaurant.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRemoveFromWishlist = (id: number) => {
    console.log(`Removing item ${id} from wishlist`);
  };

  const handleAddToCart = (id: number) => {
    console.log(`Adding item ${id} to cart`);
  };

  const handleOrderFromRestaurant = (id: number) => {
    console.log(`Opening restaurant ${id} menu`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white">
        <div className="w-full px-2.5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Wishlists</h1>
              <p className="mt-1 text-sm text-gray-600">{filteredItems.length} items saved for later</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                style={{
                  border: '1px solid #eba236',
                  color: '#eba236',
                  backgroundColor: 'white'
                }}
              >
                <i className="fas fa-share-alt mr-2"></i>
                Share List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white">
        <div className="w-full px-2.5 py-3">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Search your wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
              style={{'--tw-ring-color': '#eba236'} as any}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white rounded-r-lg px-3 hover:opacity-90 transition-colors"
                style={{backgroundColor: '#eba236'}}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={activeFilter === filter ? {backgroundColor: '#eba236'} : {}}
              >
                {filter === 'all' ? 'All Items' : filter === 'food' ? 'Food Items' : 'Restaurants'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wishlist Content */}
      <div className="w-full px-2.5 py-4">
        {filteredItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-heart text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No items found' : 'Your wishlist is empty'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'Start adding your favorite foods and restaurants!'}
            </p>
            {searchQuery ? (
              <button
                onClick={handleClearSearch}
                className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors font-medium"
                style={{backgroundColor: '#eba236'}}
              >
                Clear Search
              </button>
            ) : (
              <button 
                className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors font-medium"
                style={{backgroundColor: '#eba236'}}
              >
                Browse Menu
              </button>
            )}
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div className="flex">
                  {/* Image */}
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <ImageWrapper
                      src={item.image}
                      alt={item.title}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                    {item.type === 'food' && item.isOnSale && (
                      <div className="absolute top-2 left-2 text-white px-2 py-1 rounded text-xs font-semibold" style={{backgroundColor: '#eba236'}}>
                        SALE
                      </div>
                    )}
                    <button 
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <i className="fas fa-heart text-red-500 text-sm"></i>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-white px-2 py-1 rounded" style={{backgroundColor: '#eba236'}}>
                            {item.category}
                          </span>
                          <div className="flex items-center text-yellow-400">
                            <i className="fas fa-star text-xs"></i>
                            <span className="text-xs text-gray-600 ml-1">{item.rating}</span>
                            <span className="text-xs text-gray-500 ml-1">({item.reviews})</span>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {item.title}
                        </h3>
                        
                        {item.restaurant && (
                          <p className="text-xs text-gray-600 mb-1">
                            from {item.restaurant}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Info and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {item.type === 'food' ? (
                          <>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-bold text-gray-900">${item.price}</span>
                              {item.originalPrice && (
                                <span className="text-xs text-gray-500 line-through">${item.originalPrice}</span>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <i className="fas fa-clock mr-1"></i>
                              {item.cookingTime}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <i className="fas fa-motorcycle mr-1"></i>
                              {item.deliveryTime}
                            </div>
                            <div className="text-xs text-gray-500">
                              Min order: ${item.minOrder} • Fee: ${item.deliveryFee}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {item.type === 'food' ? (
                          <button 
                            onClick={() => handleAddToCart(item.id)}
                            className="px-3 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                            style={{
                              border: '1px solid #eba236',
                              color: '#eba236',
                              backgroundColor: 'white'
                            }}
                          >
                            <i className="fas fa-plus mr-1"></i>
                            Add to Cart
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleOrderFromRestaurant(item.id)}
                            className="text-white px-3 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-colors"
                            style={{backgroundColor: '#eba236'}}
                          >
                            <i className="fas fa-utensils mr-1"></i>
                            Order Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {filteredItems.length > 0 && (
          <div className="mt-8 text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                className="text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-colors"
                style={{backgroundColor: '#eba236'}}
              >
                <i className="fas fa-shopping-cart mr-2"></i>
                Add All Food to Cart
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                <i className="fas fa-trash mr-2"></i>
                Clear Wishlist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

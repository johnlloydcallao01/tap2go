'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import MenuItem from '@/components/MenuItem';
import { Restaurant, MenuItem as MenuItemType } from '@/types';
import {
  StarIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/solid';
// Firestore imports removed - use PayloadCMS collections instead

// Mock menu items data with professional slugs - replace with actual data fetching
const getMenuItemsForRestaurant = (restaurantId: string): MenuItemType[] => {
  return [
    {
      id: '1',
      slug: 'margherita-pizza',
      name: 'Margherita Pizza',
      description: 'Fresh tomatoes, mozzarella cheese, basil leaves',
      price: 12.99,
      image: '/images/pizza-margherita.jpg',
      category: 'Pizza',
      available: true,
      restaurantId: restaurantId,
      preparationTime: 15,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      ingredients: ['tomatoes', 'mozzarella cheese', 'basil leaves', 'pizza dough'],
      allergens: ['gluten', 'dairy'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      slug: 'pepperoni-pizza',
      name: 'Pepperoni Pizza',
      description: 'Pepperoni, mozzarella cheese, tomato sauce',
      price: 15.99,
      image: '/images/pizza-pepperoni.jpg',
      category: 'Pizza',
      available: true,
      restaurantId: restaurantId,
      preparationTime: 18,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      ingredients: ['pepperoni', 'mozzarella cheese', 'tomato sauce', 'pizza dough'],
      allergens: ['gluten', 'dairy'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      slug: 'caesar-salad',
      name: 'Caesar Salad',
      description: 'Romaine lettuce, parmesan cheese, croutons, caesar dressing',
      price: 8.99,
      image: '/images/caesar-salad.jpg',
      category: 'Salads',
      available: true,
      restaurantId: restaurantId,
      preparationTime: 10,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      ingredients: ['romaine lettuce', 'parmesan cheese', 'croutons', 'caesar dressing'],
      allergens: ['gluten', 'dairy'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      slug: 'buffalo-chicken-wings',
      name: 'Buffalo Chicken Wings',
      description: 'Crispy chicken wings with spicy buffalo sauce',
      price: 11.99,
      image: '/images/chicken-wings.jpg',
      category: 'Appetizers',
      available: true,
      restaurantId: restaurantId,
      preparationTime: 20,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isSpicy: true,
      ingredients: ['chicken wings', 'buffalo sauce', 'celery salt', 'spices'],
      allergens: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      slug: 'chocolate-lava-cake',
      name: 'Chocolate Lava Cake',
      description: 'Rich chocolate cake with molten chocolate center',
      price: 6.99,
      image: '/images/chocolate-cake.jpg',
      category: 'Desserts',
      available: true,
      restaurantId: restaurantId,
      preparationTime: 5,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      ingredients: ['dark chocolate', 'flour', 'eggs', 'butter', 'sugar', 'vanilla'],
      allergens: ['gluten', 'dairy', 'eggs'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
};

export default function RestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!params?.id) {
        setLoading(false);
        return;
      }

      try {
        // Load restaurant data from Firestore
        const restaurantRef = doc(db, 'restaurants', params.id as string);
        const restaurantSnap = await getDoc(restaurantRef);

        if (restaurantSnap.exists()) {
          // Use centralized transformer for consistency
          const restaurantData = transformRestaurantData(restaurantSnap);

          setRestaurant(restaurantData);

          // Load menu items for this restaurant
          const menuItems = getMenuItemsForRestaurant(params.id as string);
          setMenuItems(menuItems);
        } else {
          console.log('Restaurant not found');
          setRestaurant(null);
          setMenuItems([]);
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error);
        setRestaurant(null);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, [params?.id]);

  // Handle back navigation
  const handleBackClick = () => {
    router.push('/restaurants');
  };

  const handleHomeClick = () => {
    router.push('/home');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h1>
        <p className="text-gray-600 mb-6">The restaurant you&apos;re looking for doesn&apos;t exist.</p>
        <button
          onClick={handleBackClick}
          className="btn-primary"
        >
          Back to Restaurants
        </button>
      </div>
    );
  }

  const categories = [...new Set(menuItems.map(item => item.category))];
  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  return (
    <div className="space-y-6">
      {/* Professional Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Restaurants</span>
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
          <button
            onClick={handleHomeClick}
            className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
          >
            <HomeIcon className="h-4 w-4" />
            <span>Home</span>
          </button>
          <span>/</span>
          <button
            onClick={handleBackClick}
            className="hover:text-gray-700 transition-colors"
          >
            Restaurants
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{restaurant.name}</span>
        </nav>
      </div>

      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
        <Image
          src={restaurant.coverImage || restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold">{restaurant.name}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                restaurant.isOpen
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {restaurant.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <p className="text-lg opacity-90">{restaurant.description}</p>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white shadow-sm rounded-lg p-6">
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
            <span className="text-gray-600">Min. order: ${restaurant.minimumOrder ? restaurant.minimumOrder.toFixed(2) : '0.00'}</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-4 w-4" />
              <span>
                {restaurant.address?.street && restaurant.address?.city
                  ? `${restaurant.address.street}, ${restaurant.address.city}`
                  : 'Metro Manila, Philippines'
                }
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <PhoneIcon className="h-4 w-4" />
              <span>{restaurant.phone || 'Contact restaurant'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Items
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Menu Items */}
          {filteredMenuItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMenuItems.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No menu items available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleBackClick}
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Browse More Restaurants
          </button>
          <button
            onClick={() => router.push('/cart')}
            className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
}

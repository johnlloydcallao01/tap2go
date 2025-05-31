'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import MobileFooterNav from '@/components/MobileFooterNav';
import MenuItem from '@/components/MenuItem';
import { Restaurant, MenuItem as MenuItemType } from '@/types';
import {
  StarIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/solid';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { transformRestaurantData } from '@/lib/transformers/restaurant';

// FoodPanda-style menu items for each restaurant
const getMenuItemsForRestaurant = (restaurantId: string): MenuItemType[] => {
  const baseItems: Record<string, MenuItemType[]> = {
    'jollibee-sm-moa': [
      {
        id: 'jb-1',
        restaurantId,
        name: 'Chickenjoy (1pc)',
        description: 'World-famous crispy fried chicken with signature gravy',
        price: 89,
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300&h=200&fit=crop',
        category: 'Chicken',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        ingredients: ['Chicken', 'Special Breading', 'Gravy'],
        allergens: ['Gluten'],
        available: true,
        preparationTime: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'jb-2',
        restaurantId,
        name: 'Yumburger',
        description: 'Juicy beef patty with special sauce, lettuce, and cheese',
        price: 45,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
        category: 'Burgers',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        ingredients: ['Beef Patty', 'Bun', 'Cheese', 'Lettuce', 'Special Sauce'],
        allergens: ['Gluten', 'Dairy'],
        available: true,
        preparationTime: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'jb-3',
        restaurantId,
        name: 'Jolly Spaghetti',
        description: 'Sweet-style spaghetti with hotdog slices and cheese',
        price: 65,
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop',
        category: 'Pasta',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        ingredients: ['Spaghetti', 'Sweet Sauce', 'Hotdog', 'Cheese'],
        allergens: ['Gluten', 'Dairy'],
        available: true,
        preparationTime: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    'mcdonalds-ayala-triangle': [
      {
        id: 'mc-1',
        restaurantId,
        name: 'Big Mac',
        description: 'Two all-beef patties, special sauce, lettuce, cheese, pickles, onions on a sesame seed bun',
        price: 185,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
        category: 'Burgers',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        ingredients: ['Beef Patties', 'Special Sauce', 'Lettuce', 'Cheese', 'Pickles', 'Onions', 'Sesame Bun'],
        allergens: ['Gluten', 'Dairy'],
        available: true,
        preparationTime: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mc-2',
        restaurantId,
        name: 'McChicken',
        description: 'Crispy chicken fillet with lettuce and mayo',
        price: 125,
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300&h=200&fit=crop',
        category: 'Chicken',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        ingredients: ['Chicken Fillet', 'Lettuce', 'Mayo', 'Bun'],
        allergens: ['Gluten', 'Dairy'],
        available: true,
        preparationTime: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'mc-3',
        restaurantId,
        name: 'World Famous Fries (Large)',
        description: 'Golden, crispy fries made from premium potatoes',
        price: 85,
        image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=300&h=200&fit=crop',
        category: 'Sides',
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: false,
        isSpicy: false,
        ingredients: ['Potatoes', 'Salt', 'Oil'],
        allergens: [],
        available: true,
        preparationTime: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    'pizza-hut-greenbelt': [
      {
        id: 'ph-1',
        restaurantId,
        name: 'Pepperoni Lovers (Large)',
        description: 'Loaded with pepperoni and mozzarella cheese',
        price: 599,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop',
        category: 'Pizza',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        ingredients: ['Pepperoni', 'Mozzarella', 'Pizza Sauce', 'Dough'],
        allergens: ['Gluten', 'Dairy'],
        available: true,
        preparationTime: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'ph-2',
        restaurantId,
        name: 'Meat Lovers (Large)',
        description: 'Pepperoni, sausage, ham, and bacon',
        price: 699,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
        category: 'Pizza',
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        ingredients: ['Pepperoni', 'Sausage', 'Ham', 'Bacon', 'Mozzarella'],
        allergens: ['Gluten', 'Dairy'],
        available: true,
        preparationTime: 18,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  };

  return baseItems[restaurantId] || [
    {
      id: 'default-1',
      restaurantId,
      name: 'Signature Dish',
      description: 'Our restaurant\'s most popular item',
      price: 299,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
      category: 'Main Course',
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      ingredients: ['Fresh Ingredients'],
      allergens: [],
      available: true,
      preparationTime: 15,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
};

export default function RestaurantPage() {
  const params = useParams();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Header />
        <div className="container-custom py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-300 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <MobileFooterNav />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <Header />
        <div className="container-custom py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h1>
            <p className="text-gray-600">The restaurant you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
        <MobileFooterNav />
      </div>
    );
  }

  const categories = [...new Set(menuItems.map(item => item.category))];
  const filteredMenuItems = selectedCategory
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />

      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80">
        <Image
          src={restaurant.coverImage || restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container-custom">
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
      </div>

      {/* Restaurant Info */}
      <div className="bg-white shadow-sm">
        <div className="container-custom py-6">
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
              <span className="text-sm text-gray-600">Min order: ${restaurant.minimumOrder ? restaurant.minimumOrder.toFixed(2) : '0.00'}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 mb-4">
              {restaurant.cuisine.map((cuisine, index) => (
                <span
                  key={index}
                  className="inline-block text-white text-sm px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#f3a823' }}
                >
                  {cuisine}
                </span>
              ))}
            </div>

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
      </div>

      {/* Menu */}
      <div className="container-custom py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Menu</h2>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === ''
                ? 'text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            style={selectedCategory === '' ? { backgroundColor: '#f3a823' } : {}}
          >
            All Items
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={selectedCategory === category ? { backgroundColor: '#f3a823' } : {}}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          {filteredMenuItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      <MobileFooterNav />
    </div>
  );
}

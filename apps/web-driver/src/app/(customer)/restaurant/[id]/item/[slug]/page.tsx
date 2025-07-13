'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Restaurant, MenuItem as MenuItemType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  StarIcon,
  ArrowLeftIcon,
  HomeIcon,
  HeartIcon,
  ShareIcon,
  PlusIcon,
  MinusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/solid';
import {
  HeartIcon as HeartOutlineIcon
} from '@heroicons/react/24/outline';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { transformRestaurantData } from '@/lib/transformers/restaurant';

// Enhanced mock data for demonstration with professional slugs
const getMockMenuItem = (itemSlug: string, restaurantId: string): MenuItemType => {
  const items: { [key: string]: MenuItemType } = {
    'margherita-pizza': {
      id: '1',
      slug: 'margherita-pizza',
      name: 'Margherita Pizza',
      description: 'Fresh tomatoes, mozzarella cheese, basil leaves',
      detailedDescription: 'Our signature Margherita pizza features hand-stretched dough topped with San Marzano tomatoes, fresh mozzarella di bufala, and aromatic basil leaves. Baked in our wood-fired oven at 900°F for the perfect crispy yet chewy crust.',
      price: 12.99,
      image: '/images/pizza-margherita.jpg',
      images: [
        '/images/pizza-margherita.jpg',
        '/images/pizza-margherita-2.jpg',
        '/images/pizza-margherita-3.jpg'
      ],
      category: 'Pizza',
      available: true,
      restaurantId: restaurantId,
      preparationTime: 15,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      isKeto: false,
      isHalal: true,
      spiceLevel: 1,
      servingSize: '12 inch (serves 2-3)',
      cookingMethod: 'Wood-fired oven',
      chefNotes: 'Best enjoyed fresh from the oven. Our dough is fermented for 48 hours for maximum flavor.',
      isPopular: true,
      isChefSpecial: false,
      isMostOrdered: true,
      ingredients: ['San Marzano tomatoes', 'Mozzarella di bufala', 'Fresh basil', 'Extra virgin olive oil', 'Pizza dough', 'Sea salt'],
      allergens: ['gluten', 'dairy'],
      nutritionInfo: {
        calories: 280,
        protein: 14,
        carbs: 35,
        fat: 10,
        fiber: 2,
        sugar: 4,
        sodium: 650
      },
      sizeOptions: [
        { id: 'small', name: 'Small (10")', price: 10.99, description: 'Perfect for 1-2 people' },
        { id: 'medium', name: 'Medium (12")', price: 12.99, description: 'Great for 2-3 people' },
        { id: 'large', name: 'Large (14")', price: 15.99, description: 'Ideal for 3-4 people' }
      ],
      customizations: [
        {
          id: 'crust',
          name: 'Crust Type',
          type: 'single',
          required: true,
          options: [
            { id: 'thin', name: 'Thin Crust', price: 0 },
            { id: 'thick', name: 'Thick Crust', price: 1.50 },
            { id: 'stuffed', name: 'Cheese Stuffed Crust', price: 3.00 }
          ]
        },
        {
          id: 'toppings',
          name: 'Extra Toppings',
          type: 'multiple',
          required: false,
          options: [
            { id: 'cheese', name: 'Extra Cheese', price: 2.00 },
            { id: 'basil', name: 'Extra Basil', price: 1.00 },
            { id: 'tomatoes', name: 'Cherry Tomatoes', price: 1.50 }
          ]
        }
      ],
      addOns: [
        { id: 'garlic-bread', name: 'Garlic Bread', price: 4.99, description: 'Freshly baked with herbs', category: 'Sides' },
        { id: 'caesar-salad', name: 'Caesar Salad', price: 6.99, description: 'Crisp romaine with parmesan', category: 'Salads' },
        { id: 'soda', name: 'Soft Drink', price: 2.99, description: 'Choice of Coke, Sprite, or Orange', category: 'Beverages' }
      ],
      rating: 4.8,
      reviewCount: 127,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    'pepperoni-pizza': {
      id: '2',
      slug: 'pepperoni-pizza',
      name: 'Pepperoni Pizza',
      description: 'Classic pepperoni with mozzarella cheese',
      detailedDescription: 'Our classic pepperoni pizza features premium pepperoni slices, fresh mozzarella cheese, and our signature tomato sauce on hand-stretched dough.',
      price: 15.99,
      image: '/images/pizza-pepperoni.jpg',
      images: ['/images/pizza-pepperoni.jpg', '/images/pizza-pepperoni-2.jpg'],
      category: 'Pizza',
      available: true,
      restaurantId: restaurantId,
      preparationTime: 18,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      isKeto: false,
      isHalal: true,
      spiceLevel: 1,
      servingSize: '12 inch (serves 2-3)',
      cookingMethod: 'Wood-fired oven',
      chefNotes: 'Made with premium pepperoni and aged mozzarella.',
      isPopular: false,
      isChefSpecial: false,
      isMostOrdered: false,
      ingredients: ['Pepperoni', 'Mozzarella cheese', 'Tomato sauce', 'Pizza dough'],
      allergens: ['gluten', 'dairy'],
      nutritionInfo: {
        calories: 320,
        protein: 16,
        carbs: 35,
        fat: 14,
        fiber: 2,
        sugar: 4,
        sodium: 780
      },
      sizeOptions: [
        { id: 'small', name: 'Small (10")', price: 13.99, description: 'Perfect for 1-2 people' },
        { id: 'medium', name: 'Medium (12")', price: 15.99, description: 'Great for 2-3 people' },
        { id: 'large', name: 'Large (14")', price: 18.99, description: 'Ideal for 3-4 people' }
      ],
      rating: 4.6,
      reviewCount: 89,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    'caesar-salad': {
      id: '3',
      slug: 'caesar-salad',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with parmesan and croutons',
      detailedDescription: 'Crisp romaine lettuce tossed with our house-made Caesar dressing, fresh parmesan cheese, and golden croutons.',
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
      isKeto: true,
      isHalal: true,
      servingSize: 'Large bowl',
      cookingMethod: 'Fresh preparation',
      chefNotes: 'Our dressing is made fresh daily with anchovies and aged parmesan.',
      isPopular: false,
      isChefSpecial: true,
      isMostOrdered: false,
      ingredients: ['Romaine lettuce', 'Parmesan cheese', 'Croutons', 'Caesar dressing', 'Anchovies'],
      allergens: ['gluten', 'dairy', 'fish'],
      nutritionInfo: {
        calories: 180,
        protein: 8,
        carbs: 12,
        fat: 12,
        fiber: 4,
        sugar: 3,
        sodium: 450
      },
      rating: 4.4,
      reviewCount: 56,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };

  return items[itemSlug] || items['margherita-pizza'];
};

// Reviews functionality can be added here in the future

export default function FoodItemPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItem, setMenuItem] = useState<MenuItemType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!params?.id || !params?.slug) {
        setLoading(false);
        return;
      }

      try {
        // Load restaurant data
        const restaurantRef = doc(db, 'restaurants', params.id as string);
        const restaurantSnap = await getDoc(restaurantRef);

        if (restaurantSnap.exists()) {
          const restaurantData = transformRestaurantData(restaurantSnap);
          setRestaurant(restaurantData);
        }

        // Load menu item data using slug (mock for now)
        const itemData = getMockMenuItem(params.slug as string, params.id as string);
        setMenuItem(itemData);

        // Set default size
        if (itemData.sizeOptions && itemData.sizeOptions.length > 0) {
          setSelectedSize(itemData.sizeOptions[1]?.id || itemData.sizeOptions[0].id);
        }

        // Reviews can be loaded here if needed in the future

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params?.id, params?.slug]);

  const handleBackClick = () => {
    router.push(`/restaurant/${params?.id}`);
  };

  const handleHomeClick = () => {
    router.push('/home');
  };

  const handleRestaurantClick = () => {
    router.push(`/restaurant/${params?.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!menuItem || !restaurant) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h1>
        <p className="text-gray-600 mb-6">The menu item you&apos;re looking for doesn&apos;t exist.</p>
        <button onClick={handleBackClick} className="btn-primary">
          Back to Restaurant
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Professional Navigation Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Menu</span>
          </button>
        </div>

        {/* Breadcrumb Navigation */}
        <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
          <button onClick={handleHomeClick} className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
            <HomeIcon className="h-4 w-4" />
            <span>Home</span>
          </button>
          <span>/</span>
          <button onClick={() => router.push('/restaurants')} className="hover:text-gray-700 transition-colors">
            Restaurants
          </button>
          <span>/</span>
          <button onClick={handleRestaurantClick} className="hover:text-gray-700 transition-colors">
            {restaurant.name}
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{menuItem.name}</span>
        </nav>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={menuItem.images?.[currentImageIndex] || menuItem.image}
              alt={menuItem.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              priority
            />

            {/* Image Navigation */}
            {menuItem.images && menuItem.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? menuItem.images!.length - 1 : prev - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev === menuItem.images!.length - 1 ? 0 : prev + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </>
            )}


          </div>

          {/* Image Thumbnails */}
          {menuItem.images && menuItem.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {menuItem.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                    currentImageIndex === index ? 'ring-2 ring-orange-500' : ''
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${menuItem.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Item Details */}
        <div className="space-y-6">
          {/* Header Section */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{menuItem.name}</h1>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {menuItem.isPopular && (
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      🔥 Popular
                    </span>
                  )}
                  {menuItem.isMostOrdered && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      ⭐ Most Ordered
                    </span>
                  )}
                  {menuItem.isChefSpecial && (
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      👨‍🍳 Chef&apos;s Special
                    </span>
                  )}
                </div>

                {/* Rating */}
                {menuItem.rating && (
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 font-semibold">{menuItem.rating}</span>
                    </div>
                    <span className="text-gray-600">({menuItem.reviewCount} reviews)</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {isFavorite ? (
                    <HeartIcon className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartOutlineIcon className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <ShareIcon className="h-6 w-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-gray-900 mb-4">
              ${selectedSize && menuItem.sizeOptions ?
                menuItem.sizeOptions.find(s => s.id === selectedSize)?.price.toFixed(2) :
                menuItem.price.toFixed(2)
              }
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4">{menuItem.description}</p>

            {/* Detailed Description */}
            {menuItem.detailedDescription && (
              <p className="text-gray-700 leading-relaxed mb-4">{menuItem.detailedDescription}</p>
            )}

            {/* Chef&apos;s Notes */}
            {menuItem.chefNotes && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-orange-700">
                      <strong>Chef&apos;s Note:</strong> {menuItem.chefNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add to Cart Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-gray-900">Quantity:</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <MinusIcon className="h-5 w-5" />
              </button>
              <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              if (!user) {
                router.push('/auth/signin');
                return;
              }
              alert('Added to cart!');
            }}
            disabled={!menuItem.available}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            {menuItem.available ? (
              <>Add to Cart • ${(menuItem.price * quantity).toFixed(2)}</>
            ) : (
              'Currently Unavailable'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MenuItem as MenuItemType } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon } from '@heroicons/react/24/outline';
import {
  FireIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';

interface MenuItemProps {
  item: MenuItemType;
}

export default function MenuItem({ item }: MenuItemProps) {
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the add button
    e.stopPropagation();

    if (!user) {
      window.location.href = '/auth/signin';
      return;
    }

    if (!item.available) return;

    addToCart(item, 1);
    // You can add a toast notification here
    alert('Added to cart!');
  };

  return (
    <Link href={`/restaurant/${item.restaurantId}/item/${item.slug}`} className="block group">
      <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer relative">
        <div className="flex">
        {/* Item Image */}
        <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
          {imageError ? (
            <div className="w-full h-full bg-gray-200 rounded-l-lg flex items-center justify-center">
              <span className="text-lg font-bold text-gray-500">
                {item.name.charAt(0)}
              </span>
            </div>
          ) : (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover rounded-l-lg"
              sizes="(max-width: 768px) 96px, 128px"
              onError={() => setImageError(true)}
            />
          )}
          {!item.available && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-l-lg">
              <span className="text-white text-xs font-semibold">Unavailable</span>
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
              <div className="flex items-center space-x-2 mb-2">
                {item.isVegetarian && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium" title="Vegetarian">
                    VEG
                  </span>
                )}
                {item.isVegan && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium" title="Vegan">
                    VEGAN
                  </span>
                )}
                {item.isSpicy && (
                  <FireIcon className="h-4 w-4 text-red-500" title="Spicy" />
                )}
                {item.isGlutenFree && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium" title="Gluten Free">
                    GF
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                {item.description}
              </p>
              <div className="text-lg font-bold text-gray-900">
                ${item.price.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Allergens Warning */}
          {item.allergens.length > 0 && (
            <div className="flex items-center space-x-1 mb-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
              <span className="text-xs text-gray-600">
                Contains: {item.allergens.join(', ')}
              </span>
            </div>
          )}

          {/* Preparation Time */}
          <div className="text-xs text-gray-500 mb-3">
            Prep time: {item.preparationTime} min
          </div>

          {/* Professional Card Footer - Like UberEats/FoodPanda */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              {/* Popular Badge */}
              {item.isPopular && (
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                  Popular
                </span>
              )}
              {/* Availability Status */}
              {!item.available && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  Unavailable
                </span>
              )}
            </div>

            {/* Click to view indicator */}
            <div className="text-xs text-gray-400 flex items-center">
              <span>Tap to view</span>
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
        </div>

        {/* Quick Add Button - Appears on Hover (Like UberEats/FoodPanda) */}
        {item.available && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            title="Quick add to cart"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </Link>
  );
}

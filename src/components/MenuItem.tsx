'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MenuItem as MenuItemType } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import {
  FireIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';

interface MenuItemProps {
  item: MenuItemType;
}

export default function MenuItem({ item }: MenuItemProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = '/auth/signin';
      return;
    }

    addToCart(item, quantity, specialInstructions || undefined);
    setQuantity(1);
    setSpecialInstructions('');

    // Show success message (you can implement a toast notification here)
    alert('Item added to cart!');
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="card">
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

          {/* Add to Cart Section */}
          {item.available ? (
            <div className="space-y-3">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={decrementQuantity}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions (optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g., No onions, extra spicy..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full btn-primary text-sm"
              >
                Add to Cart - ${(item.price * quantity).toFixed(2)}
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-gray-500 text-sm">Currently unavailable</span>
            </div>
          )}

          {/* Toggle Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-orange-500 text-sm mt-2 hover:text-orange-600 transition-colors"
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>

          {/* Detailed Information */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
              {item.ingredients.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Ingredients: </span>
                  <span className="text-sm text-gray-600">{item.ingredients.join(', ')}</span>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Category: {item.category}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

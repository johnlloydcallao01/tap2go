'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Restaurant } from '@/types';
import { StarIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/solid';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/restaurant/${restaurant.id}`} className="block">
      <div className="card hover:shadow-lg transition-shadow duration-200">
        {/* Restaurant Image */}
        <div className="relative h-48 w-full">
          {imageError || !restaurant.image ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">
                    {restaurant.name ? restaurant.name.charAt(0) : '?'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{restaurant.name || 'Restaurant'}</p>
              </div>
            </div>
          ) : (
            <Image
              src={restaurant.image}
              alt={restaurant.name || 'Restaurant'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          )}
          {restaurant.featured && (
            <div className="absolute top-2 left-2 text-white px-2 py-1 rounded-md text-xs font-semibold" style={{ backgroundColor: '#f3a823' }}>
              Featured
            </div>
          )}
          {!restaurant.isOpen && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Closed</span>
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center space-x-1 ml-2">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}
              </span>
              <span className="text-sm text-gray-500">
                ({restaurant.reviewCount || 0})
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {restaurant.description}
          </p>

          {/*The Cuisine Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {restaurant.cuisine.slice(0, 3).map((cuisine, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {cuisine}
              </span>
            ))}
            {restaurant.cuisine.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                +{restaurant.cuisine.length - 3} more
              </span>
            )}
          </div>

          {/* Delivery Info */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <ClockIcon className="h-4 w-4" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <TruckIcon className="h-4 w-4" />
                <span>${restaurant.deliveryFee ? restaurant.deliveryFee.toFixed(2) : '0.00'}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Min order</span>
              <div className="font-medium">${restaurant.minimumOrder ? restaurant.minimumOrder.toFixed(2) : '0.00'}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

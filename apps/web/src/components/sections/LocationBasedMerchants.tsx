'use client';

import Image from '@/components/ui/ImageWrapper';
import React, { useState, useEffect, useCallback } from 'react';
import type { Media } from '@/types/merchant';
import { 
  LocationBasedMerchantService, 
  type LocationBasedMerchant 
} from '@/lib/client-services/location-based-merchant-service';
import { useAddressChange } from '@/hooks/useAddressChange';

interface LocationBasedMerchantsProps {
  customerId?: string;
  limit?: number;
}

// Location-based Merchant Card Skeleton
function LocationMerchantCardSkeleton() {
  return (
    <div className="group cursor-pointer animate-pulse">
      <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
        <div className="w-full h-full bg-gray-300"></div>
        {/* Distance badge skeleton */}
        <div className="absolute top-2 left-2 bg-gray-300 rounded-full px-2 py-1">
          <div className="h-3 w-12 bg-gray-400 rounded"></div>
        </div>
        {/* Delivery status skeleton */}
        <div className="absolute top-2 right-2 bg-gray-300 rounded-full px-2 py-1">
          <div className="h-3 w-8 bg-gray-400 rounded"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        {/* Delivery time skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

// Location-based Merchant Card Component
interface LocationMerchantCardProps {
  merchant: LocationBasedMerchant;
}

function LocationMerchantCard({ merchant }: LocationMerchantCardProps) {
  // Get the best available image URL from thumbnail
  const getImageUrl = (media: Media | null | undefined): string | null => {
    if (!media) return null;

    // Priority: cloudinaryURL > url > thumbnailURL
    return media.cloudinaryURL || media.url || media.thumbnailURL || null;
  };

  const thumbnailImageUrl = getImageUrl(merchant.media?.thumbnail);
  const altText = merchant.media?.thumbnail?.alt || `${merchant.outletName} thumbnail`;
  
  // Get vendor logo URL
  const vendorLogoUrl = getImageUrl(merchant.vendor?.logo);

  // Format distance display
  const formatDistance = (distanceKm: number): string => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  };

  // Get delivery status color
  const getDeliveryStatusColor = (isWithinRadius: boolean, operationalStatus: string): string => {
    if (operationalStatus !== 'open') return 'bg-red-500';
    return isWithinRadius ? 'bg-green-500' : 'bg-orange-500';
  };

  // Get delivery status text
  const getDeliveryStatusText = (isWithinRadius: boolean, operationalStatus: string): string => {
    if (operationalStatus !== 'open') return 'Closed';
    return isWithinRadius ? 'Delivers' : 'Too Far';
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-visible mb-6 group-hover:shadow-lg transition-shadow duration-200">
        {thumbnailImageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={thumbnailImageUrl}
              alt={altText}
              fill
              className="object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-merchant.jpg';
              }}
            />
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src="/placeholder-merchant.jpg"
              alt="Merchant placeholder"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}

        {/* Distance Badge */}
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {formatDistance(merchant.distanceKm)}
        </div>

        {/* Delivery Status Badge */}
        <div className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full ${getDeliveryStatusColor(merchant.isWithinDeliveryRadius, merchant.operationalStatus)}`}>
          {getDeliveryStatusText(merchant.isWithinDeliveryRadius, merchant.operationalStatus)}
        </div>

        {/* Vendor Logo Overlay - Professional delivery platform style */}
        {vendorLogoUrl && (
          <div className="absolute -bottom-4 left-0 w-16 h-16 bg-white rounded-full shadow-lg border-2 border-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={vendorLogoUrl}
              alt={`${merchant.vendor?.businessName || 'Vendor'} logo`}
              className="w-full h-full object-contain rounded-full"
              loading="lazy"
              onError={(e) => {
                // Hide logo on error
                const target = e.target as HTMLImageElement;
                const parent = target.parentElement;
                if (parent) {
                  parent.style.display = 'none';
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Merchant Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {merchant.outletName}
        </h3>
        
        {merchant.vendor?.businessName && (
          <p className="text-sm text-gray-600 line-clamp-1">
            {merchant.vendor.businessName}
          </p>
        )}

        {/* Rating and Orders */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {merchant.metrics?.averageRating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span>{merchant.metrics.averageRating.toFixed(1)}</span>
            </div>
          )}
          {merchant.metrics?.totalOrders && (
            <span>({merchant.metrics.totalOrders} orders)</span>
          )}
        </div>

        {/* Delivery Time */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">
            {merchant.estimatedDeliveryTime} min delivery
          </span>
        </div>
      </div>
    </div>
  );
}

// Main LocationBasedMerchants Component
export function LocationBasedMerchants({ customerId, limit = 8 }: LocationBasedMerchantsProps) {
  const [merchants, setMerchants] = useState<LocationBasedMerchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedCustomerId, setResolvedCustomerId] = useState<string | null>(customerId || null);

  // Function to fetch merchants
  const fetchLocationBasedMerchants = useCallback(async (customerIdToUse: string) => {
    console.log('🚀 Starting merchant fetch with customer ID:', customerIdToUse);
    setIsLoading(true);
    setError(null);

    try {
      const locationMerchants = await LocationBasedMerchantService.getLocationBasedMerchants({
        customerId: customerIdToUse,
        limit,
      });
      console.log('✅ Merchants fetched successfully:', locationMerchants.length, 'merchants');
      setMerchants(locationMerchants);
    } catch (err) {
      console.error('❌ Error fetching location-based merchants:', err);
      setError('Failed to load merchants. Please try again.');
    } finally {
      console.log('🏁 Merchant fetch completed, setting loading to false');
      setIsLoading(false);
    }
  }, [limit]);

  // Listen for address changes and refetch merchants
  useAddressChange((addressId: string) => {
    console.log('🔄 LocationBasedMerchants received address change event for:', addressId);
    if (resolvedCustomerId) {
      console.log('🚀 Refetching merchants due to address change...');
      
      // Clear the cache first to ensure fresh data
      console.log('🗑️ Clearing location-based merchants cache...');
      LocationBasedMerchantService.clearCache(resolvedCustomerId);
      
      fetchLocationBasedMerchants(resolvedCustomerId);
    } else {
      console.log('⏳ Customer ID not resolved yet, skipping merchant refetch');
    }
  });

  // Effect to resolve customer ID if not provided
  useEffect(() => {
    const resolveCustomerId = async () => {
      if (customerId) {
        console.log('🆔 Using provided customer ID:', customerId);
        setResolvedCustomerId(customerId);
        return;
      }

      console.log('🔍 No customerId provided, attempting to get from service...');
      try {
        const currentCustomerId = await LocationBasedMerchantService.getCurrentCustomerId();
        console.log('🆔 Retrieved customer ID from service:', currentCustomerId);
        
        if (currentCustomerId) {
          setResolvedCustomerId(currentCustomerId);
        } else {
          console.error('❌ No customer ID available');
          setError('Customer ID is required for location-based merchants');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('❌ Error resolving customer ID:', err);
        setError('Failed to resolve customer information');
        setIsLoading(false);
      }
    };

    resolveCustomerId();
  }, [customerId]);

  // Effect to fetch merchants when customer ID is resolved
  useEffect(() => {
    if (!resolvedCustomerId) {
      console.log('⏳ Waiting for customer ID to be resolved...');
      return;
    }

    fetchLocationBasedMerchants(resolvedCustomerId);
  }, [resolvedCustomerId, fetchLocationBasedMerchants]);

  if (isLoading) {
    return (
      <section className="py-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nearby Restaurants
            </h2>
            <p className="text-gray-600">
              Loading merchants near your location...
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <LocationMerchantCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nearby Restaurants
            </h2>
            <p className="text-gray-600">
              Merchants near your location with delivery information
            </p>
          </div>
          
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unable to load merchants
            </h3>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!merchants || merchants.length === 0) {
    return (
      <section className="py-4 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nearby Restaurants
            </h2>
            <p className="text-gray-600">
              Merchants near your location with delivery information
            </p>
          </div>
          
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No merchants found in your area
            </h3>
            <p className="text-gray-600">
              Try expanding your search radius or check back later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nearby Restaurants
          </h2>
          <p className="text-gray-600">
            {merchants.length} merchants found near your location
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {merchants.map((merchant) => (
            <LocationMerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>

        {/* Show more button if there are many merchants */}
        {merchants.length >= 8 && (
          <div className="text-center mt-8">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              View More Merchants
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default LocationBasedMerchants;
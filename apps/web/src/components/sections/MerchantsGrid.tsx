'use client';

import React from 'react';
import type { Merchant, Media } from '@/types/merchant';

interface MerchantsGridProps {
  merchants: Merchant[]; // Required - provided by ISR
  isLoading?: boolean; // Optional - for backward compatibility
}

// Merchant Card Skeleton
function MerchantCardSkeleton() {
  return (
    <div className="group cursor-pointer animate-pulse">
      <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
        <div className="w-full h-full bg-gray-300"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

// Merchant Card Component
interface MerchantCardProps {
  merchant: Merchant;
}

function MerchantCard({ merchant }: MerchantCardProps) {
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

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-visible mb-6 group-hover:shadow-lg transition-shadow duration-200">
        {thumbnailImageUrl ? (
          <div className="w-full h-full overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailImageUrl}
              alt={altText}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              onError={(e) => {
                // Fallback to placeholder on error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
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
      <div className="space-y-1">
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
          {merchant.outletName}
        </h3>
        {merchant.vendor?.businessName && (
          <p className="text-xs text-gray-500 font-medium">
            {merchant.vendor.businessName}
          </p>
        )}
        {merchant.address && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {`${merchant.address.streetAddress || ''} ${merchant.address.barangay || ''} ${merchant.address.city || ''} ${merchant.address.province || ''}`.trim()}
          </p>
        )}
        {merchant.operationalStatus && (
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-2 h-2 rounded-full ${
              merchant.operationalStatus === 'open' ? 'bg-green-500' : 
              merchant.operationalStatus === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></span>
            <span className="text-xs text-gray-500 capitalize">
              {merchant.operationalStatus}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Merchants Grid Component
export function MerchantsGrid({ merchants, isLoading = false }: MerchantsGridProps) {
  // Remove loading logic since ISR provides data immediately
  // Keep for backward compatibility during migration
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Restaurants</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <MerchantCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Show message if no merchants
  if (!merchants || merchants.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Restaurants</h2>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No merchants available</h3>
          <p className="text-gray-600">Check back later for new merchants.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Available Restaurants</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {merchants.map((merchant) => (
          <MerchantCard
            key={merchant.id}
            merchant={merchant}
          />
        ))}
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { LocationBasedMerchants } from "@/components/sections/LocationBasedMerchants";
import { LocationBasedProductCategoriesCarousel } from "@/components/carousels/LocationBasedProductCategoriesCarousel";

/**
 * Home page component - 100% CSR (Client-Side Rendering)
 * 
 * Location Based Product Categories: 100% CSR (Client-Side Rendering)
 * Location Based Merchants: 100% CSR (Client-Side Rendering)
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      {/* Location Based Product Categories Carousel - 100% CSR */}
      <div className="bg-white border-b border-gray-200">
        <LocationBasedProductCategoriesCarousel 
          customerId={undefined} 
          limit={12} 
          sortBy="popularity" 
        />
      </div>

      {/* Location Based Merchants Section */}
      <LocationBasedMerchants customerId={undefined} limit={8} />
    </div>
  );
}

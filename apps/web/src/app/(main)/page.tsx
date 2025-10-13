"use client";

import React from "react";
import { ProductCategoryCarousel } from "@/components/sections";
import { LocationBasedMerchants } from "@/components/sections/LocationBasedMerchants";

/**
 * Home page component - 100% CSR (Client-Side Rendering)
 * 
 * Product Categories: 100% CSR (Client-Side Rendering)
 * Location Based Merchants: 100% CSR (Client-Side Rendering)
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      {/* Product Category Carousel - 100% CSR */}
      <div className="bg-white border-b border-gray-200">
        <ProductCategoryCarousel />
      </div>

      {/* Location Based Merchants Section */}
      <LocationBasedMerchants customerId={undefined} limit={8} />
    </div>
  );
}

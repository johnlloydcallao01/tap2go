import React from "react";
import { ProductCategoryCarousel } from "@/components/sections";
import { MerchantsGrid } from "@/components/sections/MerchantsGrid";
import { getProductCategories, getMerchants } from "@/server";

// ISR configuration - revalidate every 5 minutes
export const revalidate = 300;

/**
 * Home page component - FULLY ISR OPTIMIZED
 * 
 * PERFORMANCE OPTIMIZED: Categories and merchants are pre-fetched 
 * server-side with ISR. This eliminates all client-side loading states 
 * and provides optimal SEO performance.
 */
export default async function Home() {
  // Fetch product categories and merchants server-side with ISR
  const [productCategories, merchants] = await Promise.all([
    getProductCategories(),
    getMerchants({ isActive: true, limit: 8 })
  ]);

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      {/* Product Category Carousel with ISR data */}
      <div className="bg-white border-b border-gray-200">
        <ProductCategoryCarousel
          categories={productCategories}
        />
      </div>

      {/* Merchants Grid with ISR data - second section after categories */}
      <MerchantsGrid merchants={merchants} />
    </div>
  );
}

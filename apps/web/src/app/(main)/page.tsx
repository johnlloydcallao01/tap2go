"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LocationBasedMerchants } from "@/components/sections/LocationBasedMerchants";
import { LocationBasedProductCategoriesCarousel } from "@/components/carousels/LocationBasedProductCategoriesCarousel";

/**
 * Home page component - 100% CSR (Client-Side Rendering)
 * 
 * Location Based Product Categories: 100% CSR (Client-Side Rendering)
 * Location Based Merchants: 100% CSR (Client-Side Rendering)
 * 
 * Features:
 * - URL-based category filtering (?categoryId=10)
 * - Default view shows all merchants (no filter)
 * - Category clicks update URL and filter merchants
 */
export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Read category filter from URL on mount and when URL changes
  useEffect(() => {
    const categoryId = searchParams.get('categoryId');
    setSelectedCategoryId(categoryId);
  }, [searchParams]);

  // Handle category selection from carousel
  const handleCategorySelect = (categoryId: string | null, categoryName?: string) => {
    console.log('🏷️ Category selected:', { categoryId, categoryName });
    
    // Update URL with category filter
    if (categoryId) {
      router.push(`/?categoryId=${categoryId}`, { scroll: false });
    } else {
      // Remove category filter (show all)
      router.push('/', { scroll: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      {/* Location Based Product Categories Carousel - 100% CSR */}
      <div className="bg-white border-b border-gray-200">
        <LocationBasedProductCategoriesCarousel 
          customerId={undefined} 
          limit={12} 
          sortBy="popularity"
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* Location Based Merchants Section */}
      <LocationBasedMerchants 
        customerId={undefined} 
        limit={8}
        categoryId={selectedCategoryId}
      />
    </div>
  );
}

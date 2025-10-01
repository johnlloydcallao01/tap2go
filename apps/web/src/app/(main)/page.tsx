import React from "react";
import { ProductCategoryCarousel, CoursesGrid } from "@/components/sections";
import { getProductCategories, getCourses } from "@/server";

// ISR configuration - revalidate every 5 minutes
export const revalidate = 300;

/**
 * Home page component - FULLY ISR OPTIMIZED
 * 
 * PERFORMANCE OPTIMIZED: Both categories and courses are pre-fetched 
 * server-side with ISR. This eliminates all client-side loading states 
 * and provides optimal SEO performance.
 */
export default async function Home() {
  // Fetch both product categories and courses server-side with ISR
  const [productCategories, courses] = await Promise.all([
    getProductCategories(),
    getCourses({ status: 'published', limit: 8 })
  ]);

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      {/* Product Category Carousel with ISR data */}
      <div className="bg-white border-b border-gray-200">
        <ProductCategoryCarousel
          categories={productCategories}
        />
      </div>

      {/* Courses Grid with ISR data - no client wrapper needed */}
      <CoursesGrid courses={courses} />
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { ProductCategoryCarousel } from "@/components/sections";
import { MerchantsGrid } from "@/components/sections/MerchantsGrid";
import { getMerchantsClient } from "@/lib/client-services/merchant-client-service";
import type { Merchant } from "@/types/merchant";

/**
 * Home page component - 100% CSR (Client-Side Rendering)
 * 
 * Product Categories: 100% CSR (Client-Side Rendering)
 * Merchants: 100% CSR (Client-Side Rendering) - now matches carousel approach
 */
export default function Home() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch merchants client-side to match CSR approach
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true);
        const fetchedMerchants = await getMerchantsClient({ 
          isActive: true, 
          limit: 8 
        });
        setMerchants(fetchedMerchants);
      } catch (error) {
        console.error('Failed to fetch merchants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
      {/* Product Category Carousel - 100% CSR */}
      <div className="bg-white border-b border-gray-200">
        <ProductCategoryCarousel />
      </div>

      {/* Merchants Grid with CSR data and loading state */}
      <MerchantsGrid merchants={merchants} isLoading={loading} />
    </div>
  );
}

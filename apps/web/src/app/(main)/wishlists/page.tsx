'use client';

import React, { useEffect, useMemo, useState } from 'react';
import LocationMerchantCard from '@/components/cards/LocationMerchantCard';
import {
  getActiveAddressNamesForMerchants,
  type LocationBasedMerchant,
} from '@/lib/client-services/location-based-merchant-service';
import {
  getWishlistDocsForCurrentUser,
} from '@/lib/client-services/wishlist-service';

type WishlistDoc = any;

export default function WishlistsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistDocs, setWishlistDocs] = useState<WishlistDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressMap, setAddressMap] = useState<Record<string, string>>({});
  const [etaMap, setEtaMap] = useState<Record<string, string>>({});
  const [enrichedMerchants, setEnrichedMerchants] = useState<Record<string, LocationBasedMerchant>>({});

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const docs = await getWishlistDocsForCurrentUser();
        if (cancelled) return;
        setWishlistDocs(docs);
        const baseMerchants: LocationBasedMerchant[] = docs
          .map((doc: any) => doc?.merchant)
          .filter((m: any) => m && m.id) as LocationBasedMerchant[];
        const merchantIds = baseMerchants.map((m) => String(m.id));
        let merchantMap: Record<string, LocationBasedMerchant> = {};
        try {
          const { getCurrentCustomerId, getLocationBasedMerchants } = await import('@/lib/client-services/location-based-merchant-service');
          const customerId = await getCurrentCustomerId();
          if (customerId) {
            const locationMerchants = await getLocationBasedMerchants({ customerId, limit: 9999 });
            const map: Record<string, LocationBasedMerchant> = {};
            for (const m of locationMerchants) {
              const mid = String((m as any).id);
              if (merchantIds.includes(mid)) {
                map[mid] = m;
              }
            }
            merchantMap = map;
          }
        } catch {
        }
        const effectiveMerchants: LocationBasedMerchant[] = baseMerchants.map((m) => {
          const mid = String(m.id);
          return merchantMap[mid] || m;
        });
        if (!cancelled) {
          const nextEnriched: Record<string, LocationBasedMerchant> = {};
          effectiveMerchants.forEach((m) => {
            const mid = String((m as any).id);
            nextEnriched[mid] = m;
          });
          setEnrichedMerchants(nextEnriched);
        }
        if (effectiveMerchants.length > 0) {
          const addressNames = await getActiveAddressNamesForMerchants(effectiveMerchants);
          if (!cancelled) {
            setAddressMap(addressNames);
          }
        } else {
          if (!cancelled) {
            setAddressMap({});
          }
        }
        if (!cancelled) {
          const nextEta: Record<string, string> = {};
          effectiveMerchants.forEach((m: any) => {
            const mid = String(m.id);
            const eta =
              (m as any).estimatedDeliveryTime ||
              (m as any).deliverySettings?.estimatedDeliveryTime ||
              '';
            if (eta) nextEta[mid] = String(eta);
          });
          setEtaMap(nextEta);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load wishlist. Please try again.');
          setWishlistDocs([]);
          setAddressMap({});
          setEtaMap({});
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return wishlistDocs.filter((doc: any) => {
      if (!doc?.merchant) return false;
      if (!q) return true;
      const merchant = doc.merchant;
      const merchantName = String(
        merchant?.outletName || merchant?.vendor?.businessName || '',
      ).toLowerCase();
      return merchantName.includes(q);
    });
  }, [wishlistDocs, searchQuery]);

  const handleRemoveFromWishlist = async (docId: number | string) => {
    setWishlistDocs((prev) => prev.filter((doc: any) => doc?.id !== docId));
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`;
      await fetch(`${API_BASE}/wishlists/${docId}`, {
        method: 'DELETE',
        headers,
      });
    } catch {
    }
  };

  const clearAllWishlist = async () => {
    setWishlistDocs([]);
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const apiKey = process.env.NEXT_PUBLIC_PAYLOAD_API_KEY;
      if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`;
      await fetch(`${API_BASE}/wishlists`, {
        method: 'DELETE',
        headers,
      });
    } catch {
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const merchantCount = useMemo(
    () =>
      wishlistDocs.filter(
        (doc: any) => doc?.merchant,
      ).length,
    [wishlistDocs],
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="w-full px-2.5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Wishlists
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {merchantCount} restaurants saved
              </p>
            </div>
            {merchantCount > 0 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={clearAllWishlist}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Clear Wishlist
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="w-full px-2.5 py-3">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              placeholder="Search your wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
              style={{ '--tw-ring-color': '#eba236' } as any}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white rounded-r-lg px-3 hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#eba236' }}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-2.5 py-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="group cursor-pointer animate-pulse">
                <div className="relative aspect-[2/1] bg-gray-200 rounded-lg overflow-hidden mb-3">
                  <div className="w-full h-full bg-gray-300"></div>
                  <div className="absolute top-2 left-2 bg-gray-300 rounded-full px-2 py-1">
                    <div className="h-3 w-12 bg-gray-400 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-3xl text-red-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load wishlist
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-heart text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No restaurants found' : 'Your wishlist is empty'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Start adding your favorite restaurants!'}
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors font-medium"
                style={{ backgroundColor: '#eba236' }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocs.map((doc: any) => {
              if (!doc?.merchant) return null;
              const baseMerchant = doc.merchant;
              const merchantId = String(baseMerchant.id);
              const enriched = enrichedMerchants[merchantId];
              const sourceMerchant = (enriched as any) || (baseMerchant as any);
              const merchantWithEta = {
                ...sourceMerchant,
                estimatedDeliveryTime:
                  etaMap[merchantId] ||
                  (sourceMerchant as any).estimatedDeliveryTime ||
                  (sourceMerchant as any).deliverySettings?.estimatedDeliveryTime ||
                  '',
              };
              return (
                <LocationMerchantCard
                  key={`wishlist-merchant-${doc.id}`}
                  merchant={merchantWithEta as any}
                  isWishlisted={true}
                  onToggleWishlist={() => handleRemoveFromWishlist(doc.id)}
                  addressName={addressMap[merchantId] || null}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

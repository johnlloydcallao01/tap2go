"use client";

import React from "react";
import Image from "@/components/ui/ImageWrapper";
import Link from "next/link";
import type { Media } from "@/types/merchant";
import type { LocationBasedMerchant } from "@/lib/client-services/location-based-merchant-service";

interface LocationMerchantCardProps {
  merchant: LocationBasedMerchant;
  isWishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
  addressName?: string | null;
}

function getImageUrl(media: Media | null | undefined): string | null {
  if (!media) return null;
  return media.cloudinaryURL || media.url || media.thumbnailURL || null;
}

function formatDistanceKm(distanceKm?: number): string | null {
  if (typeof distanceKm !== "number") return null;
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)}m`;
  return `${distanceKm.toFixed(1)}km`;
}

export default function LocationMerchantCard({ merchant, isWishlisted = false, onToggleWishlist, addressName = null }: LocationMerchantCardProps) {
  const thumbnailImageUrl = getImageUrl(merchant.media?.thumbnail);
  const altText = merchant.media?.thumbnail?.alt || `${merchant.outletName} thumbnail`;
  const vendorLogoUrl = getImageUrl(merchant.vendor?.logo);
  const distanceKm = (merchant as any)?.distanceKm as number | undefined;
  const distanceInMeters = (merchant as any)?.distanceInMeters as number | undefined;
  const distanceText = typeof distanceKm === "number" ? formatDistanceKm(distanceKm) : (typeof distanceInMeters === "number" ? formatDistanceKm(distanceInMeters / 1000) : null);
  const rating = typeof merchant.metrics?.averageRating === "number" ? merchant.metrics.averageRating : null;

  return (
    // Cast Link to any to satisfy TypeScript JSX constraints consistent with existing usage
    <>
      {(() => {
        const LinkComponent = Link as any;
        const slug = (merchant.outletName || `${merchant.vendor?.businessName || ''}` || `${merchant.id}`)
          .toString()
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        const slugId = `${slug}-${merchant.id}`;
        return (
          <LinkComponent href={`/merchant/${slugId}`} className="group cursor-pointer block">
            <div className="relative aspect-[2/1] bg-gray-100 rounded-lg overflow-visible mb-6 group-hover:shadow-lg transition-shadow duration-200">
              {thumbnailImageUrl ? (
                <div className="relative w-full h-full">
                  <Image src={thumbnailImageUrl} alt={altText} fill className="object-cover rounded-lg" />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image src="/placeholder-merchant.jpg" alt="Merchant placeholder" fill className="object-cover rounded-lg" />
                </div>
              )}

              {distanceText && (
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  {distanceText}
                </div>
              )}

              <button
                type="button"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={isWishlisted}
                onClick={(e) => {
                  e.preventDefault();
                  onToggleWishlist && onToggleWishlist(merchant.id);
                }}
                className="absolute top-2 right-2 w-[28px] h-[28px] rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                style={{ zIndex: 2 }}
              >
                <i className={`fas fa-heart text-[16px]`} style={{ color: isWishlisted ? "#f3a823" : "#ffffff", WebkitTextStroke: "2px #333" }}></i>
              </button>

              {vendorLogoUrl && (
                <div className="absolute -bottom-4 left-0 w-12 h-12 bg-white rounded-full shadow-lg border-2 border-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vendorLogoUrl}
                    alt={`${merchant.vendor?.businessName || "Vendor"} logo`}
                    className="w-full h-full object-contain rounded-full"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const parent = target.parentElement;
                      if (parent) parent.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {addressName ? `${merchant.outletName} - ${addressName}` : merchant.outletName}
              </h3>
              {merchant.vendor?.businessName && (
                <p className="text-sm text-gray-600 line-clamp-1">{merchant.vendor.businessName}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {typeof rating === "number" && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span>{rating.toFixed(1)}</span>
                  </div>
                )}
                {merchant.metrics?.totalOrders && <span>({merchant.metrics.totalOrders} orders)</span>}
              </div>
              {merchant.estimatedDeliveryTime && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{merchant.estimatedDeliveryTime} min delivery</span>
                </div>
              )}
            </div>
          </LinkComponent>
        );
      })()}
    </>
  );
}

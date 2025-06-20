'use client';

import React from 'react';
import Header from '@/components/Header';
import MobileFooterNav from '@/components/MobileFooterNav';
import { HeartIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container-custom py-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>

          {/* Empty State */}
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Start adding your favorite restaurants and dishes to your wishlist!
            </p>
            <Link
              href="/"
              className="btn-primary inline-block"
            >
              Browse Restaurants
            </Link>
          </div>
        </div>
      </main>

      <MobileFooterNav />
    </div>
  );
}

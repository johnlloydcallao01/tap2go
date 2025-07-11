'use client';

import React from 'react';
import Link from 'next/link';
import { useSSRSafeAuthState } from '@/hooks/useSSRSafeAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import HeaderSearch from '@/components/search/HeaderSearch';
import NotificationBell from '@/components/NotificationBell';
import {
  ShoppingCartIcon,
  UserIcon,
  MapPinIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { signOut } = useAuth();
  const { user, canShowUserContent, canShowGuestContent, shouldWaitForAuth } = useSSRSafeAuthState();
  const { cart } = useCart();
  const currentLocation = 'Manila';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const cartItemsCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50" style={{ background: 'linear-gradient(to right, #f3a823, #ef7b06)' }}>
      {/* Mobile/Tablet Header */}
      <div className="md:hidden">
        {/* Top Row - Logo, Location, Wishlist, Notifications */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left Side - Logo and Location */}
          <div className="flex items-center space-x-3 text-white">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="font-bold text-lg" style={{ color: '#f3a823' }}>T</span>
              </div>
            </Link>

            {/* Location */}
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-6 w-6" />
              <div>
                <div className="text-base font-semibold">Ayala Blvd</div>
                <div className="text-sm opacity-90">{currentLocation}</div>
              </div>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center">
            {/* Wishlist */}
            <Link href="/wishlist" className="p-2">
              <HeartIcon className="h-6 w-6 text-white" />
            </Link>

            {/* Notifications */}
            <NotificationBell
              iconSize="h-6 w-6"
              textColor="text-white"
              hoverColor="hover:text-orange-200"
              className="p-0"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <HeaderSearch
            placeholder="Pizza Hut 50% OFF Flash Sale!"
            isMobile={true}
          />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="font-bold text-lg" style={{ color: '#f3a823' }}>T</span>
              </div>
              <span className="text-xl font-bold text-white">Tap2Go</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="flex flex-1 max-w-lg mx-8">
              <HeaderSearch
                placeholder="Search restaurants, cuisines..."
                isMobile={false}
              />
            </div>

            {/* Navigation - Desktop */}
            <nav className="flex items-center space-x-6">
              {canShowUserContent ? (
                <>
                  {user?.role === 'customer' && (
                    <Link href="/orders" className="text-white hover:text-orange-200 transition-colors">
                      Orders
                    </Link>
                  )}
                  {user?.role === 'vendor' && (
                    <>
                      <Link href="/vendor/dashboard" className="text-white hover:text-orange-200 transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/vendor/orders" className="text-white hover:text-orange-200 transition-colors">
                        Orders
                      </Link>
                      <Link href="/vendor/menu" className="text-white hover:text-orange-200 transition-colors">
                        Menu
                      </Link>
                    </>
                  )}
                  {user?.role === 'driver' && (
                    <>
                      <Link href="/driver/dashboard" className="text-white hover:text-orange-200 transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/driver/orders" className="text-white hover:text-orange-200 transition-colors">
                        Deliveries
                      </Link>
                      <Link href="/driver/earnings" className="text-white hover:text-orange-200 transition-colors">
                        Earnings
                      </Link>
                    </>
                  )}
                  {user?.role === 'driver' && (
                    <>
                      <Link href="/driver/dashboard" className="text-white hover:text-orange-200 transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/driver/deliveries" className="text-white hover:text-orange-200 transition-colors">
                        Deliveries
                      </Link>
                    </>
                  )}

                  {/* Wishlist */}
                  <Link href="/wishlist" className="relative">
                    <HeartIcon className="h-6 w-6 text-white hover:text-orange-200 transition-colors" />
                  </Link>

                  {/* Cart */}
                  <Link href="/cart" className="relative">
                    <ShoppingCartIcon className="h-6 w-6 text-white hover:text-orange-200 transition-colors" />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" style={{ backgroundColor: '#ef7b06' }}>
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>

                  <div className="relative group">
                    <button className="p-2 text-white hover:text-orange-200 hover:bg-white/10 rounded-full transition-all duration-200">
                      <UserIcon className="h-6 w-6" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : canShowGuestContent ? (
                <>
                  <Link href="/auth/signin" className="text-white hover:text-orange-200 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="bg-white hover:bg-orange-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200" style={{ color: '#f3a823' }}>
                    Sign Up
                  </Link>
                </>
              ) : shouldWaitForAuth ? (
                // PROFESSIONAL: Show consistent loading state to prevent layout shifts
                <div className="flex items-center space-x-6">
                  <div className="h-6 w-16 bg-white/20 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-white/20 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                // Fallback - should rarely be seen
                <div className="flex items-center space-x-6">
                  <div className="h-4 w-16 bg-white/20 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-white/20 rounded animate-pulse"></div>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

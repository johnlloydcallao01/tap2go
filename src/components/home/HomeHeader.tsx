'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSSRSafeAuthState } from '@/hooks/useSSRSafeAuth';
import { useCart } from '@/contexts/CartContext';
import {
  BellIcon,
  UserIcon,
  Bars3Icon,
  HeartIcon,
  MapPinIcon,
  ShoppingCartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import HeaderSearch from '@/components/search/HeaderSearch';
import NotificationBell from '@/components/NotificationBell';

interface HomeHeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function HomeHeader({ onMenuClick, sidebarCollapsed = false, onToggleCollapse }: HomeHeaderProps) {
  const { signOut } = useAuth();
  const { canShowUserContent, canShowGuestContent, shouldWaitForAuth } = useSSRSafeAuthState();
  const { cart } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
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
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 z-40">
      {/* Mobile/Tablet Header (767px and below) */}
      <div className="md:hidden" style={{ background: 'linear-gradient(to right, #f3a823, #ef7b06)' }}>
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

      {/* Desktop Header (768px and above) */}
      <div className="hidden md:block">
        <div className="flex min-h-16">
          {/* FIRST DIVISION: Logo + Tap2Go + Chevron (fixed width) */}
          <div className="flex items-center justify-between px-4 lg:px-6 w-64">
            {/* Logo and Tap2Go */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Tap2Go</span>
            </Link>

            {/* Desktop Sidebar Collapse/Expand Button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" />
                )}
              </button>
            )}
          </div>

          {/* SECOND DIVISION: Search + Right Icons */}
          <div className="flex-1 flex items-center justify-between px-4">
            {/* Left side - Mobile menu button and Search */}
            <div className="flex items-center flex-1">
              {/* Mobile menu button */}
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-4"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Search Bar - Desktop */}
              <div className="flex-1 max-w-lg">
                <HeaderSearch
                  placeholder="Search restaurants, cuisines, or dishes..."
                  isMobile={false}
                />
              </div>
            </div>

            {/* Right side - Navigation and User Menu */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {canShowUserContent ? (
                <>
                  {/* Wishlist */}
                  <Link href="/wishlist" className="relative">
                    <HeartIcon className="h-6 w-6 text-gray-400 hover:text-gray-500 transition-colors" />
                  </Link>

                  {/* Cart */}
                  <Link href="/cart" className="relative">
                    <ShoppingCartIcon className="h-6 w-6 text-gray-400 hover:text-gray-500 transition-colors" />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" style={{ backgroundColor: '#ef7b06' }}>
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>

                  {/* Notifications */}
                  <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full">
                    <BellIcon className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                    >
                      <UserIcon className="h-5 w-5 text-white" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
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
                    )}
                  </div>
                </>
              ) : canShowGuestContent ? (
                <>
                  <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                    Sign Up
                  </Link>
                </>
              ) : shouldWaitForAuth ? (
                // PROFESSIONAL: Show consistent loading state to prevent layout shifts
                <div className="flex items-center space-x-6">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                // Fallback - should rarely be seen
                <div className="flex items-center space-x-6">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

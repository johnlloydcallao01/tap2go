'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSSRSafeAuthState } from '@/hooks/useSSRSafeAuth';
import { useCart } from '@/contexts/CartContext';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  UserIcon as UserIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
} from '@heroicons/react/24/solid';

export default function MobileFooterNav() {
  const pathname = usePathname();
  const { user, shouldWaitForAuth } = useSSRSafeAuthState();
  const { cart } = useCart();

  // Don't show footer nav on admin, vendor, driver dashboard, or auth pages
  if (!pathname ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/vendor/') ||
      pathname === '/vendor' ||
      pathname.startsWith('/driver/') ||
      pathname === '/driver' ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/test-')) {
    return null;
  }

  // Don't show for non-customer users when they're on role-specific pages
  if (user && user.role !== 'customer' && user.role !== 'admin') {
    return null;
  }

  const getAccountHref = () => {
    if (shouldWaitForAuth) {
      return '/account'; // SSR-safe default while loading
    }
    if (!user) {
      return '/auth/signin';
    }
    return '/account';
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || (pathname.startsWith('/restaurant/') && !pathname.startsWith('/restaurants'));
    }
    if (href === '/restaurants') {
      return pathname === '/restaurants';
    }
    if (href === '/profile') {
      return pathname === '/account' || pathname === '/profile' || pathname === '/orders' || (!user && pathname === '/auth/signin');
    }
    if (href === '/cart') {
      return pathname === '/cart';
    }
    return pathname.startsWith(href);
  };

  const cartItemsCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5 h-14 relative">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center space-y-0.5 transition-colors ${
            isActive('/') ? 'text-gray-500 hover:text-gray-700' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={isActive('/') ? { color: '#f3a823' } : {}}
        >
          {isActive('/') ? (
            <HomeIconSolid className="h-5 w-5" />
          ) : (
            <HomeIcon className="h-5 w-5" />
          )}
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Stores */}
        <Link
          href="/restaurants"
          className={`flex flex-col items-center justify-center space-y-0.5 transition-colors ${
            isActive('/restaurants') ? 'text-gray-500 hover:text-gray-700' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={isActive('/restaurants') ? { color: '#f3a823' } : {}}
        >
          {isActive('/restaurants') ? (
            <BuildingStorefrontIconSolid className="h-5 w-5" />
          ) : (
            <BuildingStorefrontIcon className="h-5 w-5" />
          )}
          <span className="text-[10px] font-medium">Stores</span>
        </Link>

        {/* Add to Cart - Elevated */}
        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center space-y-0.5 transition-colors relative -top-2 ${
            isActive('/cart') ? 'text-gray-800' : 'text-gray-600'
          }`}
        >
          <div
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center relative"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            {isActive('/cart') ? (
              <ShoppingCartIconSolid className="h-5 w-5 text-gray-800" />
            ) : (
              <ShoppingCartIcon className="h-5 w-5 text-gray-600" />
            )}
            {cartItemsCount > 0 && (
              <span
                className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                style={{ backgroundColor: '#f3a823' }}
              >
                {cartItemsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-gray-500">Cart</span>
        </Link>

        {/* Search */}
        <Link
          href="/search"
          className={`flex flex-col items-center justify-center space-y-0.5 transition-colors ${
            isActive('/search') ? 'text-gray-500 hover:text-gray-700' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={isActive('/search') ? { color: '#f3a823' } : {}}
        >
          {isActive('/search') ? (
            <MagnifyingGlassIconSolid className="h-5 w-5" />
          ) : (
            <MagnifyingGlassIcon className="h-5 w-5" />
          )}
          <span className="text-[10px] font-medium">Search</span>
        </Link>

        {/* Account */}
        <Link
          href={getAccountHref()}
          className={`flex flex-col items-center justify-center space-y-0.5 transition-colors ${
            isActive('/profile') ? 'text-gray-500 hover:text-gray-700' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={isActive('/profile') ? { color: '#f3a823' } : {}}
        >
          {isActive('/profile') ? (
            <UserIconSolid className="h-5 w-5" />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
          <span className="text-[10px] font-medium">Account</span>
        </Link>
      </div>
    </nav>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { user, signOut } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const currentLocation = 'Manila';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const cartItemsCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50" style={{ background: 'linear-gradient(to right, #f3a823, #ef7b06)' }}>
      {/* Mobile/Tablet Header */}
      <div className="md:hidden">
        {/* Top Row - Location, Wishlist, Cart */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Location */}
          <div className="flex items-center space-x-2 text-white">
            <MapPinIcon className="h-6 w-6" />
            <div>
              <div className="text-lg font-semibold">Ayala Blvd</div>
              <div className="text-sm opacity-90">{currentLocation}</div>
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link href="/wishlist" className="p-2">
              <HeartIcon className="h-7 w-7 text-white" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2">
              <ShoppingCartIcon className="h-7 w-7 text-white" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium" style={{ backgroundColor: '#ef7b06' }}>
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <form onSubmit={handleSearch} className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pizza Hut 50% OFF Flash Sale!"
              className="w-full pl-12 pr-4 py-3 bg-white rounded-full text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
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
              <form onSubmit={handleSearch} className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
              </form>
            </div>

            {/* Navigation - Desktop */}
            <nav className="flex items-center space-x-6">
              {user ? (
                <>
                  {user.role === 'customer' && (
                    <Link href="/orders" className="text-white hover:text-orange-200 transition-colors">
                      Orders
                    </Link>
                  )}
                  {user.role === 'vendor' && (
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
                  {user.role === 'driver' && (
                    <>
                      <Link href="/driver/dashboard" className="text-white hover:text-orange-200 transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/driver/deliveries" className="text-white hover:text-orange-200 transition-colors">
                        Deliveries
                      </Link>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-white hover:text-orange-200 transition-colors">
                      Admin Panel
                    </Link>
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
                    <button className="flex items-center space-x-1 text-white hover:text-orange-200 transition-colors">
                      <UserIcon className="h-6 w-6" />
                      <span>{user.name}</span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
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
              ) : (
                <>
                  <Link href="/auth/signin" className="text-white hover:text-orange-200 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="bg-white hover:bg-orange-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200" style={{ color: '#f3a823' }}>
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

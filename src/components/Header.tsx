'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { user, signOut } = useAuth();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const cartItemsCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Tap2Go</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {user.role === 'customer' && (
                  <Link href="/orders" className="text-gray-700 hover:text-orange-500 transition-colors">
                    Orders
                  </Link>
                )}
                {user.role === 'vendor' && (
                  <>
                    <Link href="/vendor/dashboard" className="text-gray-700 hover:text-orange-500 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/vendor/orders" className="text-gray-700 hover:text-orange-500 transition-colors">
                      Orders
                    </Link>
                    <Link href="/vendor/menu" className="text-gray-700 hover:text-orange-500 transition-colors">
                      Menu
                    </Link>
                  </>
                )}
                {user.role === 'driver' && (
                  <>
                    <Link href="/driver/dashboard" className="text-gray-700 hover:text-orange-500 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/driver/deliveries" className="text-gray-700 hover:text-orange-500 transition-colors">
                      Deliveries
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin/dashboard" className="text-gray-700 hover:text-orange-500 transition-colors">
                    Admin Panel
                  </Link>
                )}
                <Link href="/cart" className="relative">
                  <ShoppingCartIcon className="h-6 w-6 text-gray-700 hover:text-orange-500 transition-colors" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition-colors">
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
                <Link href="/auth/signin" className="text-gray-700 hover:text-orange-500 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-orange-500 hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              {user ? (
                <>
                  {user.role === 'customer' && (
                    <Link href="/orders" className="text-gray-700 hover:text-orange-500 transition-colors">
                      Orders
                    </Link>
                  )}
                  {user.role === 'vendor' && (
                    <>
                      <Link href="/vendor/dashboard" className="text-gray-700 hover:text-orange-500 transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/vendor/orders" className="text-gray-700 hover:text-orange-500 transition-colors">
                        Orders
                      </Link>
                      <Link href="/vendor/menu" className="text-gray-700 hover:text-orange-500 transition-colors">
                        Menu
                      </Link>
                    </>
                  )}
                  {user.role === 'driver' && (
                    <>
                      <Link href="/driver/dashboard" className="text-gray-700 hover:text-orange-500 transition-colors">
                        Dashboard
                      </Link>
                      <Link href="/driver/deliveries" className="text-gray-700 hover:text-orange-500 transition-colors">
                        Deliveries
                      </Link>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin/dashboard" className="text-gray-700 hover:text-orange-500 transition-colors">
                      Admin Panel
                    </Link>
                  )}
                  <Link href="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors">
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>Cart ({cartItemsCount})</span>
                  </Link>
                  <Link href="/profile" className="text-gray-700 hover:text-orange-500 transition-colors">
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-left text-gray-700 hover:text-orange-500 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-700 hover:text-orange-500 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="btn-primary inline-block text-center">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

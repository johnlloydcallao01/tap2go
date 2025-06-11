'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BellIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  Bars3Icon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DriverHeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
}

export default function DriverHeader({ onMenuClick, sidebarCollapsed = false }: DriverHeaderProps) {
  const { signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 z-40 transition-all duration-300 ${
      sidebarCollapsed ? 'lg:left-16' : 'lg:left-64'
    }`}>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between min-h-16">
          {/* Left side - Mobile menu button and Search */}
          <div className="flex items-center flex-1">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-4"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Search Bar */}
            <div className="hidden sm:block flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search deliveries, locations..."
                />
              </div>
            </div>
          </div>

          {/* Right side - Status, Notifications and User Menu */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Online Status Toggle */}
            <div className="hidden sm:flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Online</span>
            </div>

            {/* Location Button */}
            <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full">
              <MapPinIcon className="h-6 w-6" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* Settings - Hidden on mobile */}
            <Link
              href="/driver/settings"
              className="hidden sm:block p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
            >
              <Cog6ToothIcon className="h-6 w-6" />
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <TruckIcon className="h-5 w-5 text-white" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link
                    href="/driver/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Driver Profile
                  </Link>
                  <Link
                    href="/driver/settings/account"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Account Settings
                  </Link>
                  {/* Settings link for mobile */}
                  <Link
                    href="/driver/settings"
                    className="sm:hidden block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Settings
                  </Link>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

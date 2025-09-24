'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AuthContext';
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';


interface AdminHeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export default function AdminHeader({ onMenuToggle, isMobileMenuOpen }: AdminHeaderProps) {
  const { user: _user, demoLogout } = useAdminAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDemoLogout = async () => {
    try {
      await demoLogout();
      // Navigation handled by demoLogout function
    } catch (error) {
      console.error('Demo logout error:', error);
      // Fallback navigation
      router.push('/login');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Demo: Would search for:', searchQuery);
      // In a real app, this would trigger search functionality
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 right-0 left-0 z-40">
      <div className="flex min-h-16">
        {/* FIRST DIVISION: Logo + Tap2Go Admin + Mobile Menu (fixed width) */}
        <div className="flex items-center justify-between px-4 lg:px-6 w-64">
          {/* Logo and Tap2Go Admin */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T2G</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Tap2Go Admin</span>
          </div>


        </div>

        {/* SECOND DIVISION: Search + Right Icons */}
        <div className="flex-1 flex items-center justify-between px-4">
          {/* Left side - Mobile menu button and Search */}
          <div className="flex items-center flex-1">
            {/* Mobile menu button */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-4"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders, restaurants, drivers..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Right side - Notifications and User Menu */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* Settings - Hidden on mobile */}
            <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full">
              <Settings className="h-6 w-6" />
            </button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  <User className="h-5 w-5 text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Admin Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDemoLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Search - Shown when menu is not open */}
      <div className={`md:hidden mt-4 ${isMobileMenuOpen ? 'hidden' : 'block'}`}>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500"
            />
          </div>
        </form>
      </div>
    </header>
  );
}

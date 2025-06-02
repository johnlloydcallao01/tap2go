'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import MobileFooterNav from '@/components/MobileFooterNav';
import {
  Cog6ToothIcon,
  DocumentTextIcon,
  HeartIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // FAST LOADING: Don't block page render for loading state

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your account</h1>
            <Link href="/auth/signin" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
        <MobileFooterNav />
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Custom Account Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Account</h1>
            <Link href="/account/settings" className="p-2">
              <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
            </Link>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* User Info Section */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f3a823' }}>
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name || 'User'}</h2>
              <Link href="/profile" className="text-gray-600 text-sm hover:underline">
                View profile
              </Link>
            </div>
          </div>
        </div>



        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <Link href="/orders" className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
            <DocumentTextIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Orders</span>
          </Link>

          <Link href="/wishlist" className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
            <HeartIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Wishlists</span>
          </Link>

          <Link href="/account/addresses" className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
            <MapPinIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Addresses</span>
          </Link>
        </div>

        {/* Tap2Go Wallet */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f3a823' }}>
                <span className="text-white font-bold text-sm">T2G</span>
              </div>
              <span className="font-medium text-gray-900">tap2go wallet</span>
            </div>
            <span className="font-bold text-gray-900">₱ 0.00</span>
          </div>
        </div>



        {/* Sign Out Button */}
        <div className="pt-4">
          <button
            onClick={handleSignOut}
            className="w-full bg-red-50 text-red-600 py-3 px-4 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <MobileFooterNav />
    </div>
  );
}

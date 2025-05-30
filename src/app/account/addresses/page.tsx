'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeftIcon,
  MapPinIcon,
  PlusIcon,
  HomeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function AddressesPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your addresses</h1>
            <Link href="/auth/signin" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Mock addresses data - in real app, this would come from Firestore
  const addresses = [
    {
      id: '1',
      label: 'Home',
      recipientName: 'John Lloyd',
      address: '123 Main Street, Makati City, Metro Manila 1200',
      isDefault: true
    },
    {
      id: '2',
      label: 'Office',
      recipientName: 'John Lloyd',
      address: '456 Business Ave, BGC, Taguig City, Metro Manila 1634',
      isDefault: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/account" className="p-1">
              <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Addresses</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Add New Address Button */}
        <button className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 hover:border-orange-300 transition-colors">
          <div className="flex flex-col items-center text-gray-600">
            <PlusIcon className="h-8 w-8 mb-2" />
            <span className="font-medium">Add new address</span>
          </div>
        </button>

        {/* Addresses List */}
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    {address.label === 'Home' ? (
                      <HomeIcon className="h-5 w-5 text-gray-600" />
                    ) : (
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{address.label}</span>
                      {address.isDefault && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{address.recipientName}</p>
                    <p className="text-sm text-gray-600">{address.address}</p>
                  </div>
                </div>
                <button className="text-orange-600 text-sm font-medium ml-4">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no addresses) */}
        {addresses.length === 0 && (
          <div className="text-center py-12">
            <MapPinIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
            <p className="text-gray-600 mb-6">Add your first delivery address to get started</p>
            <button className="btn-primary">
              Add Address
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

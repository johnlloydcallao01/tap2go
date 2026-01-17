import React from 'react';
import AddressesClient from '@/components/addresses/AddressesClient';

export default function AddressesPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white">
        <div className="w-full px-2.5 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
              <p className="mt-1 text-sm text-gray-600">Manage your delivery locations</p>
            </div>
            <button
              className="px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              style={{
                border: '1px solid #eba236',
                color: '#eba236',
                backgroundColor: 'white',
              }}
            >
              <i className="fas fa-plus mr-2"></i>
              Add Address
            </button>
          </div>
        </div>
      </div>
      <div className="w-full px-2.5 py-4">
        <AddressesClient />
      </div>
    </div>
  );
}

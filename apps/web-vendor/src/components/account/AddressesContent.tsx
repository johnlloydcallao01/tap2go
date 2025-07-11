'use client';

import React, { useState } from 'react';
import {
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

interface Address {
  id: string;
  label: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  apartmentNumber?: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}

export default function AddressesContent() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      recipientName: 'John Lloyd',
      recipientPhone: '+63 917 123 4567',
      street: '123 Main Street',
      city: 'Makati City',
      state: 'Metro Manila',
      zipCode: '1200',
      apartmentNumber: 'Unit 4B',
      deliveryInstructions: 'Ring doorbell twice',
      isDefault: true
    },
    {
      id: '2',
      label: 'Office',
      recipientName: 'John Lloyd',
      recipientPhone: '+63 917 123 4567',
      street: '456 Business Ave',
      city: 'Taguig City',
      state: 'Metro Manila',
      zipCode: '1634',
      apartmentNumber: 'Floor 15',
      deliveryInstructions: 'Call upon arrival',
      isDefault: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  const handleSetDefault = (addressId: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddresses(addresses.filter(addr => addr.id !== addressId));
  };

  const getAddressIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home':
        return <HomeIcon className="h-5 w-5 text-blue-600" />;
      case 'office':
      case 'work':
        return <BuildingOfficeIcon className="h-5 w-5 text-green-600" />;
      default:
        return <MapPinIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Delivery Addresses</h1>
            <p className="text-gray-600">Manage your delivery addresses for faster checkout</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Address
          </button>
        </div>
      </div>

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                  {getAddressIcon(address.label)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{address.label}</h3>
                    {address.isDefault && (
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-gray-600">
                    <p className="font-medium">{address.recipientName}</p>
                    <p>{address.recipientPhone}</p>
                    <p>
                      {address.street}
                      {address.apartmentNumber && `, ${address.apartmentNumber}`}
                    </p>
                    <p>{address.city}, {address.state} {address.zipCode}</p>
                    {address.deliveryInstructions && (
                      <p className="text-sm text-gray-500 italic">
                        Note: {address.deliveryInstructions}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-orange-600 hover:text-orange-700 font-medium text-sm px-3 py-1 rounded-md hover:bg-orange-50 transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses yet</h3>
          <p className="text-gray-600 mb-6">Add your first delivery address to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center mx-auto"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Address
          </button>
        </div>
      )}

      {/* Add Address Form Modal would go here */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>
            <p className="text-gray-600 mb-4">Address form would be implemented here</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

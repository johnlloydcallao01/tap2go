'use client';

import React, { useState } from 'react';
import ImageWrapper from '@/components/ui/ImageWrapper';

/**
 * Addresses Page - Manage delivery addresses
 * Features professional address management with minimal design
 */
export default function AddressesPage() {
  const [selectedAddress, setSelectedAddress] = useState(1);

  // Mock addresses data
  const addresses = [
    {
      id: 1,
      type: 'Home',
      name: 'John Doe',
      address: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phone: '+1 (555) 123-4567',
      isDefault: true,
      instructions: 'Ring doorbell twice, leave at door if no answer'
    },
    {
      id: 2,
      type: 'Work',
      name: 'John Doe',
      address: '456 Business Ave, Suite 200',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      phone: '+1 (555) 987-6543',
      isDefault: false,
      instructions: 'Call when arrived, security desk on ground floor'
    },
    {
      id: 3,
      type: 'Other',
      name: 'Sarah Johnson',
      address: '789 Park Lane, Unit 15',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      phone: '+1 (555) 456-7890',
      isDefault: false,
      instructions: 'Buzz apartment 15, leave with doorman if not home'
    }
  ];

  const handleSetDefault = (id: number) => {
    console.log(`Setting address ${id} as default`);
  };

  const handleEditAddress = (id: number) => {
    console.log(`Editing address ${id}`);
  };

  const handleDeleteAddress = (id: number) => {
    console.log(`Deleting address ${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-2.5 py-3">
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
                backgroundColor: 'white'
              }}
            >
              <i className="fas fa-plus mr-2"></i>
              Add Address
            </button>
          </div>
        </div>
      </div>

      {/* Address List */}
      <div className="max-w-7xl mx-auto px-2.5 py-4">
        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white rounded-lg hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Address Type Icon */}
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className={`fas ${
                        address.type === 'Home' ? 'fa-home' : 
                        address.type === 'Work' ? 'fa-building' : 'fa-map-marker-alt'
                      } text-gray-600`}></i>
                    </div>

                    {/* Address Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{address.type}</h3>
                        {address.isDefault && (
                          <span className="text-xs font-medium text-white px-2 py-1 rounded" style={{backgroundColor: '#eba236'}}>
                            DEFAULT
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="font-medium text-gray-900">{address.name}</p>
                        <p>{address.address}</p>
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p className="flex items-center">
                          <i className="fas fa-phone mr-2 text-gray-400"></i>
                          {address.phone}
                        </p>
                        {address.instructions && (
                          <p className="flex items-start">
                            <i className="fas fa-info-circle mr-2 text-gray-400 mt-0.5"></i>
                            <span className="text-xs">{address.instructions}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
                        style={{
                          border: '1px solid #eba236',
                          color: '#eba236',
                          backgroundColor: 'white'
                        }}
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEditAddress(address.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no addresses) */}
        {addresses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-map-marker-alt text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses yet</h3>
            <p className="text-gray-600 mb-6">Add your first delivery address to get started</p>
            <button 
              className="px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              style={{
                border: '1px solid #eba236',
                color: '#eba236',
                backgroundColor: 'white'
              }}
            >
              <i className="fas fa-plus mr-2"></i>
              Add Your First Address
            </button>
          </div>
        )}

        {/* Quick Actions */}
        {addresses.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-map text-blue-600 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Find on Map</p>
                  <p className="text-xs text-gray-500">View all addresses on map</p>
                </div>
              </button>
              <button className="flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-download text-green-600 text-sm"></i>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Export Addresses</p>
                  <p className="text-xs text-gray-500">Download as PDF or CSV</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
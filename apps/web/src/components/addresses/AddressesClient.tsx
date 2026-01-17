'use client';

import React, { useEffect, useState } from 'react';
import { AddressService } from '@/lib/services/address-service';

interface AddressItem {
  id: string | number;
  formatted_address: string;
  address_type?: 'home' | 'work' | 'other' | string;
  is_default?: boolean;
  notes?: string;
  locality?: string;
  administrative_area_level_1?: string;
  postal_code?: string;
}

export default function AddressesClient() {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAddresses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await AddressService.getUserAddresses(true);
        if (!cancelled && response.success && response.addresses) {
          const items = response.addresses as AddressItem[];
          setAddresses(items);
          const defaultItem = items.find((a) => a.is_default);
          setSelectedAddressId(defaultItem ? defaultItem.id : items[0]?.id ?? null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load addresses');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAddresses();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSetDefault = async (id: string | number) => {
    try {
      setPendingActionId(id);
      setError(null);
      const response = await AddressService.setDefaultAddress(String(id));
      if (!response.success) {
        throw new Error(response.error || 'Failed to set default address');
      }
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          is_default: addr.id === id,
        })),
      );
      setSelectedAddressId(id);
    } catch (e: any) {
      setError(e?.message || 'Failed to set default address');
    } finally {
      setPendingActionId(null);
    }
  };

  const handleDeleteAddress = async (id: string | number) => {
    try {
      setPendingActionId(id);
      setError(null);
      const response = await AddressService.deleteAddress(String(id));
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete address');
      }
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      if (selectedAddressId === id) {
        const remaining = addresses.filter((addr) => addr.id !== id);
        setSelectedAddressId(remaining[0]?.id ?? null);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to delete address');
    } finally {
      setPendingActionId(null);
    }
  };

  const renderAddressBody = (address: AddressItem) => {
    const typeLabel =
      address.address_type === 'home'
        ? 'Home'
        : address.address_type === 'work'
        ? 'Work'
        : 'Other';

    return (
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <h3 className="font-semibold text-gray-900">{typeLabel}</h3>
          {address.is_default && (
            <span
              className="text-xs font-medium text-white px-2 py-1 rounded"
              style={{ backgroundColor: '#eba236' }}
            >
              DEFAULT
            </span>
          )}
        </div>
        <div className="space-y-1 text-sm text-gray-600">
          <p className="font-medium text-gray-900">
            {address.locality || address.administrative_area_level_1 || 'Saved address'}
          </p>
          <p>{address.formatted_address}</p>
          {(address.postal_code || address.administrative_area_level_1) && (
            <p>
              {address.locality && <span>{address.locality}</span>}
              {address.locality && address.administrative_area_level_1 && <span>, </span>}
              {address.administrative_area_level_1 && (
                <span>{address.administrative_area_level_1}</span>
              )}
              {address.postal_code && (
                <span>
                  {' '}
                  {address.postal_code}
                </span>
              )}
            </p>
          )}
          {address.notes && (
            <p className="flex items-start">
              <i className="fas fa-info-circle mr-2 text-gray-400 mt-0.5" />
              <span className="text-xs">{address.notes}</span>
            </p>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-sm animate-pulse h-24"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-600 mb-2">{error}</p>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          style={{
            border: '1px solid #eba236',
            color: '#eba236',
            backgroundColor: 'white',
          }}
          onClick={() => {
            setIsLoading(true);
            setError(null);
            AddressService.getUserAddresses(true)
              .then((response) => {
                if (response.success && response.addresses) {
                  const items = response.addresses as AddressItem[];
                  setAddresses(items);
                  const defaultItem = items.find((a) => a.is_default);
                  setSelectedAddressId(defaultItem ? defaultItem.id : items[0]?.id ?? null);
                }
              })
              .catch((e: any) => {
                setError(e?.message || 'Failed to load addresses');
              })
              .finally(() => setIsLoading(false));
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!addresses.length) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <i className="fas fa-map-marker-alt text-3xl text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses yet</h3>
        <p className="text-gray-600 mb-6">
          Add your first delivery address to get started
        </p>
        <button
          className="px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          style={{
            border: '1px solid #eba236',
            color: '#eba236',
            backgroundColor: 'white',
          }}
        >
          <i className="fas fa-plus mr-2" />
          Add Your First Address
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="bg-white rounded-lg hover:shadow-md transition-shadow duration-200 overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i
                    className={`fas ${
                      address.address_type === 'home'
                        ? 'fa-home'
                        : address.address_type === 'work'
                        ? 'fa-building'
                        : 'fa-map-marker-alt'
                    } text-gray-600`}
                  />
                </div>
                {renderAddressBody(address)}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {!address.is_default && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    disabled={pendingActionId === address.id}
                    className="px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
                    style={{
                      border: '1px solid #eba236',
                      color: '#eba236',
                      backgroundColor: 'white',
                    }}
                  >
                    {pendingActionId === address.id ? 'Saving...' : 'Set Default'}
                  </button>
                )}
                <button
                  onClick={() => setSelectedAddressId(address.id)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    selectedAddressId === address.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Select
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  disabled={pendingActionId === address.id}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-8 bg-white rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <i className="fas fa-map text-blue-600 text-sm" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Find on Map</p>
              <p className="text-xs text-gray-500">View all addresses on map</p>
            </div>
          </button>
          <button className="flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <i className="fas fa-download text-green-600 text-sm" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Export Addresses</p>
              <p className="text-xs text-gray-500">Download as PDF or CSV</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}


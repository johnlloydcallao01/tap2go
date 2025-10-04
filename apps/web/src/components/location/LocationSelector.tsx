'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AddressSearchInput } from '@/components/shared/AddressSearchInput';
import { AddressService } from '@/lib/services/address-service';
import { useUser } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface LocationSelectorProps {
  onLocationSelect?: (location: google.maps.places.PlaceResult) => void;
  className?: string;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect?: (location: google.maps.places.PlaceResult) => void;
  onAddressesChanged?: () => void; // New callback for when addresses are modified
}

// Location Icon Component
function LocationIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
      />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
      />
    </svg>
  );
}

// Location Modal Component
function LocationModal({ isOpen, onClose, onLocationSelect, onAddressesChanged }: LocationModalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [settingActiveId, setSettingActiveId] = useState<string | null>(null);
  const [activeAddressId, setActiveAddressId] = useState<string | null>(null);
  const { user } = useUser();

  // Check if we're on mobile/tablet
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // Below lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const loadUserAddresses = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoadingAddresses(true);
    try {
      // Load user addresses with caching
      const response = await AddressService.getUserAddresses(user.id);
      if (response.success && response.addresses) {
        setUserAddresses(response.addresses);
      } else {
        console.error('Failed to load addresses:', response.error);
        setUserAddresses([]);
      }

      // Load active address to show which one is currently active (with caching)
      try {
        const activeResponse = await AddressService.getActiveAddress(user.id);
        if (activeResponse.success && activeResponse.address) {
          setActiveAddressId(activeResponse.address.id);
        } else {
          setActiveAddressId(null);
        }
      } catch (error) {
        console.error('Error loading active address:', error);
        setActiveAddressId(null);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setUserAddresses([]);
      setActiveAddressId(null);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [user?.id]);

  // Load user addresses when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      loadUserAddresses();
    }
  }, [isOpen, user?.id, loadUserAddresses]);

  const handleDeleteAddress = async (addressId: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this address? This action cannot be undone.');
    
    if (!confirmed) return;

    setDeletingAddressId(addressId);
    try {
      const response = await AddressService.deleteAddress(addressId);
      
      if (response.success) {
        toast.success('Address deleted successfully!');
        
        // Optimistically update UI state - remove the deleted address
        setUserAddresses(prev => prev.filter(addr => addr.id !== addressId));
        
        // If the deleted address was the active one, clear active address
        if (activeAddressId === addressId) {
          setActiveAddressId(null);
        }
        
        // Notify parent component that addresses have changed
        onAddressesChanged?.();
      } else {
        throw new Error(response.error || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete address');
      
      // On error, reload to ensure UI is in sync
      await loadUserAddresses();
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleSetActiveAddress = async (addressId: string) => {
    if (!user?.id) return;
    
    setSettingActiveId(addressId);
    try {
      const response = await AddressService.setActiveAddress(user.id, addressId);
      
      if (response.success) {
        toast.success('Active address updated successfully!');
        
        // Optimistically update UI state - set the new active address
        setActiveAddressId(addressId);
        
        // Notify parent component that addresses have changed
        onAddressesChanged?.();
      } else {
        throw new Error(response.error || 'Failed to set active address');
      }
    } catch (error) {
      console.error('Error setting active address:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to set active address');
      
      // On error, reload to ensure UI is in sync
      await loadUserAddresses();
    } finally {
      setSettingActiveId(null);
    }
  };

  const handleAddressSelect = async (place: google.maps.places.PlaceResult) => {
    setIsSaving(true);
    
    try {
      // Save the address to the database
      const response = await AddressService.saveAddress({
        place,
        address_type: 'home', // Default type - using valid PayloadCMS value
        is_default: false, // User can set default later
      });

      if (response.success) {
        toast.success('Address saved successfully!');
        onLocationSelect?.(place);
        onClose();
      } else {
        throw new Error(response.error || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save address');
      
      // Still allow the UI to update even if saving fails
      onLocationSelect?.(place);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // Handle click outside to close modal (desktop only)
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      const modalContent = document.querySelector('[data-modal-content]');
      if (modalContent && !modalContent.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, isMobile, onClose]);

  // Prevent body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen, isMobile]);

  if (!isOpen) return null;

  const modalElement = (
    <div 
      className={isMobile ? '' : 'fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4'}
      style={isMobile ? { 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100vw', 
        height: '100vh', 
        backgroundColor: 'white', 
        zIndex: 99999 
      } : { position: 'fixed', zIndex: 9999 }}
    >
      {/* Modal - Responsive design */}
      <div 
        data-modal-content
        className={`${
          isMobile 
            ? 'w-full h-full flex flex-col bg-white' // Full height on mobile/tablet with solid white background
            : 'bg-white rounded-2xl shadow-2xl w-full transform transition-all' // Popup style on desktop
        }`} 
        style={isMobile ? { width: '100%', height: '100%', backgroundColor: 'white' } : {}}
      >
        {/* Header */}
        <div className={`${
          isMobile 
            ? 'px-4 py-3 border-b border-gray-100 flex items-center' // Mobile header with back button
            : 'px-6 py-4 border-b border-gray-100' // Desktop header
        }`}>
          {isMobile ? (
            // Mobile header with back button
            <div className="flex items-center w-full">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
              >
                <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-xl font-semibold text-gray-900">
                Addresses
              </h3>
            </div>
          ) : (
            // Desktop header with close button
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Addresses
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Search Section */}
        <div className={`${isMobile ? 'px-4 py-4 flex-1 overflow-y-auto' : 'px-6 py-4 flex-1 overflow-y-auto max-h-96'}`}>
          {isSaving && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-blue-700">Saving address...</span>
            </div>
          )}
          <AddressSearchInput
            placeholder="Search for an address"
            onAddressSelect={handleAddressSelect}
            autoFocus={true}
            inputClassName="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
            fullPage={true}
          />

          {/* Manage Address Section */}
          {user?.id && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Address</h3>
              
              {isLoadingAddresses ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                  <span className="ml-2 text-gray-600">Loading addresses...</span>
                </div>
              ) : userAddresses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No saved addresses found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userAddresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {address.formatted_address}
                          </p>
                          {address.address_type && (
                            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-1">
                              {address.address_type}
                            </span>
                          )}
                          {address.is_default && (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1 ml-2">
                              Default
                            </span>
                          )}
                          {activeAddressId === address.id && (
                            <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full mt-1 ml-2">
                              Active
                            </span>
                          )}
                          {address.notes && (
                            <p className="text-sm text-gray-600 mt-1">{address.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleSetActiveAddress(address.id)}
                            disabled={settingActiveId === address.id || activeAddressId === address.id}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              activeAddressId === address.id
                                ? 'text-purple-600 bg-purple-50 border border-purple-200'
                                : 'text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                            }`}
                          >
                            {settingActiveId === address.id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
                                Setting...
                              </div>
                            ) : activeAddressId === address.id ? (
                              'Currently Active'
                            ) : (
                              'Set as Active'
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            disabled={deletingAddressId === address.id}
                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingAddressId === address.id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600 mr-1"></div>
                                Deleting...
                              </div>
                            ) : (
                              'Delete'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


        </div>
      </div>
    </div>
  );

  return createPortal(modalElement as React.ReactNode, document.body);
}

// Main Location Selector Component
export function LocationSelector({ onLocationSelect, className = '' }: LocationSelectorProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<google.maps.places.PlaceResult | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const { user } = useUser();

  // Check if we're on mobile/tablet
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // Below lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load address from backend only
  const loadAddressFromBackend = useCallback(async () => {
    if (!user?.id) {
      setIsLoadingAddress(false);
      return;
    }

    try {
      // First, try to get user's active address from backend
      const activeAddressResponse = await AddressService.getActiveAddress(user.id);
      if (activeAddressResponse.success && activeAddressResponse.address) {
        const activeAddress = activeAddressResponse.address;
        
        // Convert API address back to Google Places format for display
        const googlePlaceFormat: google.maps.places.PlaceResult = {
          formatted_address: activeAddress.formatted_address,
          place_id: activeAddress.google_place_id,
          name: activeAddress.formatted_address,
          geometry: activeAddress.latitude && activeAddress.longitude ? {
            location: {
              lat: () => activeAddress.latitude,
              lng: () => activeAddress.longitude
            } as google.maps.LatLng
          } : undefined
        };
        
        setSelectedLocation(googlePlaceFormat);
        return; // Exit early, we have the active address
      }

      // Fallback: fetch user's addresses and use default or latest one
      const response = await AddressService.getUserAddresses(user.id);
      if (response.success && response.addresses && response.addresses.length > 0) {
        // Find default address or use the most recent one (latest saved)
        const defaultAddress = response.addresses.find((addr: any) => addr.is_default) || 
                              response.addresses.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (defaultAddress) {
          // Convert API address back to Google Places format for display
          const googlePlaceFormat: google.maps.places.PlaceResult = {
            formatted_address: defaultAddress.formatted_address,
            place_id: defaultAddress.google_place_id,
            name: defaultAddress.formatted_address,
            geometry: defaultAddress.latitude && defaultAddress.longitude ? {
              location: {
                lat: () => defaultAddress.latitude,
                lng: () => defaultAddress.longitude
              } as google.maps.LatLng
            } : undefined
          };
          
          setSelectedLocation(googlePlaceFormat);
        }
      } else {
        // No addresses found - reset selected location
        setSelectedLocation(null);
      }
    } catch (error) {
      console.error('Error loading address from backend:', error);
      setSelectedLocation(null);
    } finally {
      setIsLoadingAddress(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAddressFromBackend();
  }, [loadAddressFromBackend]);

  const handleLocationSelect = (location: google.maps.places.PlaceResult) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  };

  const handleAddressesChanged = () => {
    // Reload the address when addresses are modified
    loadAddressFromBackend();
  };

  const handleClick = () => {
    // Always open modal (full-screen on mobile, popup on desktop)
    setIsModalOpen(true);
  };

  const displayText = isLoadingAddress 
    ? 'Loading...' 
    : (selectedLocation?.name || selectedLocation?.formatted_address || 'Enter Address');

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors ${className}`}
      >
        <LocationIcon className="h-5 w-5 text-gray-500" />
        <span className="truncate max-w-32">{displayText}</span>
      </button>

      {/* Always show modal */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        onAddressesChanged={handleAddressesChanged}
      />
    </>
  );
}

export default LocationSelector;
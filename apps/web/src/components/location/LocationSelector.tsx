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
function LocationModal({ isOpen, onClose, onLocationSelect }: LocationModalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [activeAddressId, setActiveAddressId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
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

  const loadSavedAddresses = useCallback(async () => {
    try {
      setIsLoadingAddresses(true);
      const response = await AddressService.getUserAddresses();
      if (response.success && response.addresses) {
        setSavedAddresses(response.addresses);
        
        // Load active address from backend (persistent)
        if (user?.id) {
          try {
            const activeAddressResponse = await AddressService.getActiveAddress(user.id);
            if (activeAddressResponse.success && activeAddressResponse.address) {
              setActiveAddressId(activeAddressResponse.address.id);
            } else {
              // No active address set, try to migrate from localStorage
              const localAddress = localStorage.getItem('selected_address');
              if (localAddress) {
                try {
                  const parsedAddress = JSON.parse(localAddress);
                  const matchingAddress = response.addresses.find((addr: any) => 
                    addr.google_place_id === parsedAddress.place_id
                  );
                  if (matchingAddress) {
                    // Set this as the active address in the backend
                    await AddressService.setActiveAddress(user.id, matchingAddress.id);
                    setActiveAddressId(matchingAddress.id);
                    console.log('Migrated localStorage address to backend active address');
                  }
                } catch (error) {
                  console.warn('Failed to parse stored address:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error loading active address:', error);
            // Fallback to localStorage behavior
            const localAddress = localStorage.getItem('selected_address');
            if (localAddress) {
              try {
                const parsedAddress = JSON.parse(localAddress);
                const activeAddress = response.addresses.find((addr: any) => 
                  addr.google_place_id === parsedAddress.place_id
                );
                if (activeAddress) {
                  setActiveAddressId(activeAddress.id);
                }
              } catch (error) {
                console.warn('Failed to parse stored address:', error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved addresses:', error);
      toast.error('Failed to load saved addresses');
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [user?.id]);

  // Load saved addresses when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSavedAddresses();
    }
  }, [isOpen, loadSavedAddresses]);

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
        // Reload addresses to show the new one
        await loadSavedAddresses();
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

  const handleAddressSwitch = async (address: any) => {
    const requestId = Math.random().toString(36).substr(2, 9);
    console.log(`🏠 [${requestId}] === ADDRESS SWITCH STARTED ===`);
    console.log(`📋 [${requestId}] Address Switch Details:`, {
      addressId: address.id,
      userId: user?.id,
      userExists: !!user,
      addressData: {
        formatted_address: address.formatted_address,
        google_place_id: address.google_place_id,
        latitude: address.latitude,
        longitude: address.longitude
      }
    });

    try {
      // Set as active address in backend
      if (user?.id) {
        console.log(`🔄 [${requestId}] Calling AddressService.setActiveAddress...`);
        await AddressService.setActiveAddress(user.id, address.id);
        console.log(`✅ [${requestId}] AddressService.setActiveAddress completed successfully`);
      } else {
        console.warn(`⚠️ [${requestId}] No user ID available, skipping backend update`);
      }
      
      // Convert API address back to Google Places format
      console.log(`🗺️ [${requestId}] Converting to Google Places format...`);
      const googlePlaceFormat: google.maps.places.PlaceResult = {
        formatted_address: address.formatted_address,
        place_id: address.google_place_id,
        name: address.formatted_address,
        geometry: address.latitude && address.longitude ? {
          location: {
            lat: () => address.latitude,
            lng: () => address.longitude
          } as google.maps.LatLng
        } : undefined
      };
      
      console.log(`💾 [${requestId}] Updating local state and localStorage...`);
      setActiveAddressId(address.id);
      // Update localStorage for backward compatibility
      localStorage.setItem('selected_address', JSON.stringify(googlePlaceFormat));
      
      console.log(`📞 [${requestId}] Calling onLocationSelect callback...`);
      onLocationSelect?.(googlePlaceFormat);
      
      console.log(`🎉 [${requestId}] Showing success toast and closing modal...`);
      toast.success('Address set as active!');
      onClose();
      
      console.log(`✅ [${requestId}] === ADDRESS SWITCH COMPLETED SUCCESSFULLY ===`);
    } catch (error) {
      console.error(`💥 [${requestId}] === ADDRESS SWITCH ERROR ===`);
      console.error(`❌ [${requestId}] Error Details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
        addressId: address.id,
        userId: user?.id,
        address: address
      });
      toast.error('Failed to set active address');
    }
  };

  const handleAddressDelete = async (addressId: string) => {
    try {
      await AddressService.deleteAddress(addressId);
      toast.success('Address deleted successfully!');
      
      // If deleted address was active, clear active state from backend and localStorage
      if (activeAddressId === addressId) {
        if (user?.id) {
          try {
            await AddressService.setActiveAddress(user.id, null);
          } catch (error) {
            console.error('Error clearing active address from backend:', error);
          }
        }
        setActiveAddressId(null);
        localStorage.removeItem('selected_address');
      }
      
      // Reload addresses
      await loadSavedAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await AddressService.setDefaultAddress(addressId);
      toast.success('Default address updated!');
      // Reload addresses to reflect the change
      await loadSavedAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    }
  };

  const handleAddressUpdate = async (updatedAddress: any) => {
    try {
      const response = await AddressService.updateAddress(updatedAddress.id, {
        address_type: updatedAddress.address_type,
        notes: updatedAddress.notes,
      });
      
      if (response.success) {
        toast.success('Address updated successfully!');
        setEditingAddress(null);
        // Reload addresses to show the changes
        await loadSavedAddresses();
      } else {
        throw new Error(response.error || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
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

          {/* Manage Addresses Section */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Manage Addresses</h4>
            
            {isLoadingAddresses ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                <span className="ml-2 text-gray-600">Loading addresses...</span>
              </div>
            ) : savedAddresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p>No saved addresses yet</p>
                <p className="text-sm">Search and save an address above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`p-4 rounded-lg border transition-all ${
                      activeAddressId === address.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {address.formatted_address}
                          </p>
                          {activeAddressId === address.id && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                          {address.is_default && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 capitalize">
                          {address.address_type} address
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-2">
                      {activeAddressId !== address.id && (
                        <button
                          onClick={() => handleAddressSwitch(address)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          Switch
                        </button>
                      )}
                      
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                          Set Default
                        </button>
                      )}
                      
                      <button
                        onClick={() => setEditingAddress(address)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                      >
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleAddressDelete(address.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Address Modal */}
          {editingAddress && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Address</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Type
                    </label>
                    <select
                      value={editingAddress.address_type}
                      onChange={(e) => setEditingAddress({
                        ...editingAddress,
                        address_type: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="billing">Billing</option>
                      <option value="shipping">Shipping</option>
                      <option value="pickup">Pickup</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={editingAddress.notes || ''}
                      onChange={(e) => setEditingAddress({
                        ...editingAddress,
                        notes: e.target.value
                      })}
                      placeholder="Delivery instructions, landmarks, etc."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setEditingAddress(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddressUpdate(editingAddress)}
                    className="px-4 py-2 text-sm font-medium text-white bg-black border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
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

  // Load persisted address on component mount
  useEffect(() => {
    const loadPersistedAddress = async () => {
      try {
        // First, try to get from localStorage for immediate display
        const localAddress = localStorage.getItem('selected_address');
        if (localAddress) {
          try {
            const parsedAddress = JSON.parse(localAddress);
            setSelectedLocation(parsedAddress);
          } catch (error) {
            console.warn('Failed to parse stored address:', error);
          }
        }

        // Then, fetch user's active address from backend (persistent)
        if (user?.id) {
          try {
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
              // Update localStorage for backward compatibility
              localStorage.setItem('selected_address', JSON.stringify(googlePlaceFormat));
              return; // Exit early, we have the active address
            }
          } catch (error) {
            console.error('Error loading active address:', error);
          }
        }

        // Fallback: fetch user's addresses and use default or first one
        const response = await AddressService.getUserAddresses();
        if (response.success && response.addresses && response.addresses.length > 0) {
          // Find default address or use the first one
          const defaultAddress = response.addresses.find((addr: any) => addr.is_default) || response.addresses[0];
          
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
            // Update localStorage with the fetched address
            localStorage.setItem('selected_address', JSON.stringify(googlePlaceFormat));
            
            // If user is authenticated, set this as active address in backend
            if (user?.id) {
              try {
                await AddressService.setActiveAddress(user.id, defaultAddress.id);
                console.log('Set default address as active in backend');
              } catch (error) {
                console.error('Error setting default address as active:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading persisted address:', error);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    loadPersistedAddress();
  }, [user?.id]);

  const handleLocationSelect = (location: google.maps.places.PlaceResult) => {
    setSelectedLocation(location);
    // Persist to localStorage immediately
    localStorage.setItem('selected_address', JSON.stringify(location));
    onLocationSelect?.(location);
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
      />
    </>
  );
}

export default LocationSelector;
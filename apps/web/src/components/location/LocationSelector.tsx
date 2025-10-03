'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AddressSearchInput } from '@/components/shared/AddressSearchInput';

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

  // Check if we're on mobile/tablet
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // Below lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    onLocationSelect?.(place);
    onClose();
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
          <AddressSearchInput
            placeholder="Search for an address"
            onAddressSelect={handleAddressSelect}
            autoFocus={true}
            inputClassName="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
            fullPage={true}
          />
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

  // Check if we're on mobile/tablet
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // Below lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);



  const handleLocationSelect = (location: google.maps.places.PlaceResult) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  };

  const handleClick = () => {
    // Always open modal (full-screen on mobile, popup on desktop)
    setIsModalOpen(true);
  };

  const displayText = selectedLocation?.name || selectedLocation?.formatted_address || 'Enter Address';

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
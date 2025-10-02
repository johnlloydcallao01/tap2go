'use client';

import { useRouter } from 'next/navigation';
import { AddressSearchInput } from '@/components/shared/AddressSearchInput';

export default function AddressesPage() {
  const router = useRouter();

  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    // Store the selected location in localStorage for the LocationSelector to pick up
    localStorage.setItem('selectedLocation', JSON.stringify(place));
    
    // Navigate back to the previous page
    router.back();
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Addresses</h1>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-4 py-4">
        <AddressSearchInput
          placeholder="Search for an address"
          onAddressSelect={handleAddressSelect}
          autoFocus={true}
          fullPage={true}
        />
      </div>
    </div>
  );
}
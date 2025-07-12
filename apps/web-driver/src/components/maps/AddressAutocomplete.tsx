// Placeholder AddressAutocomplete component
import React from 'react';
import { MapAddress } from '@/lib/maps/types';

interface AddressAutocompleteProps {
  onAddressSelect?: (address: MapAddress) => void;
  placeholder?: string;
  showIcon?: boolean;
  className?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  placeholder = "Search address...",
  showIcon,
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => {
          if (e.target.value) {
            onAddressSelect?.({
              street: e.target.value,
              city: 'Manila',
              state: 'Metro Manila',
              zipCode: '1000',
              country: 'Philippines',
              coordinates: { lat: 14.5995, lng: 120.9842 },
              formattedAddress: e.target.value,
              placeId: 'placeholder-place-id'
            });
          }
        }}
      />
      <div className="absolute right-2 top-2 text-gray-400">
        🔍
      </div>
    </div>
  );
};

export default AddressAutocomplete;

// Placeholder AddressPicker component
import React from 'react';

interface AddressPickerProps {
  onAddressSelect?: (address: string) => void;
  placeholder?: string;
  className?: string;
}

const AddressPicker: React.FC<AddressPickerProps> = ({ 
  onAddressSelect,
  placeholder = "Enter address...",
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => onAddressSelect?.(e.target.value)}
      />
      <div className="absolute right-2 top-2 text-gray-400">
        📍
      </div>
    </div>
  );
};

export default AddressPicker;

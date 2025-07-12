// Placeholder LocationSearch component
import React from 'react';

interface LocationSearchProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
  className?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ 
  onLocationSelect,
  placeholder = "Search location...",
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => {
          // Placeholder functionality
          if (e.target.value) {
            onLocationSelect?.({
              lat: 14.5995,
              lng: 120.9842,
              address: e.target.value
            });
          }
        }}
      />
      <div className="absolute right-2 top-2 text-gray-400">
        📍
      </div>
    </div>
  );
};

export default LocationSearch;

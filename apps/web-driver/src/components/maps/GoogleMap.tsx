// Placeholder GoogleMap component
import React from 'react';

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id?: string;
    lat?: number;
    lng?: number;
    position?: { lat: number; lng: number };
    title?: string;
    infoWindow?: { content: string; isOpen: boolean };
  }>;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  onMarkerClick?: (markerId: string) => void;
  height?: string;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 14.5995, lng: 120.9842 },
  zoom = 13,
  markers,
  onMapClick,
  onMarkerClick,
  height,
  className = "w-full h-96"
}) => {
  return (
    <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
      <div className="text-gray-500 text-center">
        <div className="text-2xl mb-2">🗺️</div>
        <div>Google Map Component</div>
        <div className="text-sm">Placeholder - Map integration needed</div>
      </div>
    </div>
  );
};

export default GoogleMap;

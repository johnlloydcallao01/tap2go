// Placeholder DeliveryTracker component
import React from 'react';

interface DeliveryTrackerProps {
  orderId?: string;
  driverLocation?: { lat: number; lng: number };
  deliveryLocation?: { lat: number; lng: number };
  restaurantLocation?: { lat: number; lng: number };
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  height?: string;
  showRoute?: boolean;
  autoCenter?: boolean;
  className?: string;
}

const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({
  orderId,
  driverLocation,
  deliveryLocation,
  restaurantLocation,
  height,
  showRoute,
  autoCenter,
  className = "w-full h-96"
}) => {
  return (
    <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
      <div className="text-gray-500 text-center">
        <div className="text-2xl mb-2">🚚</div>
        <div>Delivery Tracker</div>
        {orderId && <div className="text-sm">Order: {orderId}</div>}
        <div className="text-sm">Placeholder - Real-time tracking needed</div>
      </div>
    </div>
  );
};

export default DeliveryTracker;

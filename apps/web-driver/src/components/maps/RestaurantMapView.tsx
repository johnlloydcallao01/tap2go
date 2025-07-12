// Placeholder RestaurantMapView component
import React from 'react';
import { Address } from '@/types';

interface Restaurant {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  rating?: number;
  cuisine?: string | string[];
  address?: Address;
}

interface RestaurantMapViewProps {
  restaurant?: Restaurant;
  restaurants?: Restaurant[];
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  onLocationClick?: (coords: { lat: number; lng: number }) => void;
  showDeliveryRadius?: boolean;
  height?: string;
  className?: string;
}

const RestaurantMapView: React.FC<RestaurantMapViewProps> = ({
  restaurant,
  restaurants = [],
  onRestaurantSelect,
  onLocationClick,
  showDeliveryRadius,
  height,
  className = "w-full h-96"
}) => {
  return (
    <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
      <div className="text-gray-500 text-center">
        <div className="text-2xl mb-2">🍽️</div>
        <div>Restaurant Map View</div>
        <div className="text-sm">Showing {restaurants.length} restaurants</div>
        <div className="text-sm">Placeholder - Map integration needed</div>
      </div>
    </div>
  );
};

export default RestaurantMapView;

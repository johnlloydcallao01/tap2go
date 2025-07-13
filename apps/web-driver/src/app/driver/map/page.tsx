'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import {
  MapPinIcon,
  TruckIcon,
  MapIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function LiveMap() {
  const [mapView, setMapView] = useState('standard');
  const [showTraffic, setShowTraffic] = useState(true);
  const [currentLocation] = useState({
    lat: 40.7128,
    lng: -74.0060,
    address: '123 Main St, New York, NY'
  });

  const [activeDeliveries] = useState([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      pickupLocation: { lat: 40.7589, lng: -73.9851, name: 'Pizza Palace' },
      deliveryLocation: { lat: 40.7505, lng: -73.9934, name: 'Customer Address' },
      status: 'picked_up',
      estimatedTime: '12 min',
    }
  ]);

  const [nearbyOrders] = useState([
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      location: { lat: 40.7614, lng: -73.9776, name: 'Burger Joint' },
      distance: '0.8 km',
      payment: 15.50,
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      location: { lat: 40.7549, lng: -73.9840, name: 'Sushi Bar' },
      distance: '1.2 km',
      payment: 18.75,
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Map</h1>
          <p className="text-gray-600">Track your location and navigate to deliveries.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <MapIcon className="h-4 w-4" />
            <span>Navigate</span>
          </button>
          <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Map Controls */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">View:</span>
                    <select
                      value={mapView}
                      onChange={(e) => setMapView(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="standard">Standard</option>
                      <option value="satellite">Satellite</option>
                      <option value="terrain">Terrain</option>
                    </select>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showTraffic}
                      onChange={(e) => setShowTraffic(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Show Traffic</span>
                  </label>
                </div>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search location..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
                  />
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-96 bg-gray-100 relative flex items-center justify-center">
              <div className="text-center">
                <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map</h3>
                <p className="text-gray-500 mb-4">
                  Real-time map with your location, delivery routes, and nearby orders
                </p>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 max-w-sm mx-auto">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Your Location</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Pickup Location</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Delivery Location</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">Available Orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Current Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Current Location</h3>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TruckIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">You are here</p>
                <p className="text-sm text-gray-600">{currentLocation.address}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </p>
              </div>
            </div>
            <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors">
              Update Location
            </button>
          </div>

          {/* Active Delivery */}
          {activeDeliveries.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Active Delivery</h3>
              {activeDeliveries.map((delivery) => (
                <div key={delivery.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">#{delivery.orderNumber}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {delivery.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{delivery.pickupLocation.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{delivery.deliveryLocation.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    <span>ETA: {delivery.estimatedTime}</span>
                  </div>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                    Navigate to Destination
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Nearby Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Nearby Orders</h3>
            <div className="space-y-3">
              {nearbyOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">#{order.orderNumber}</span>
                    <span className="text-sm font-bold text-green-600">${order.payment.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{order.location.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{order.distance} away</span>
                    <button className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded transition-colors">
                      View on Map
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                📍 Share Location
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                🚗 Find Parking
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                ⛽ Find Gas Station
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                🏥 Emergency Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

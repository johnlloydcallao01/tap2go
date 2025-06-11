'use client';

import React, { useState } from 'react';
import {
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

interface RouteStop {
  id: string;
  type: 'pickup' | 'delivery';
  orderNumber: string;
  address: string;
  customerName: string;
  estimatedTime: string;
  payment?: number;
  completed: boolean;
}

export default function RouteOptimization() {
  const [optimizing, setOptimizing] = useState(false);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([
    {
      id: '1',
      type: 'pickup',
      orderNumber: 'ORD-2024-001',
      address: '123 Pizza Palace, Downtown',
      customerName: 'John Smith',
      estimatedTime: '5 min',
      completed: false,
    },
    {
      id: '2',
      type: 'delivery',
      orderNumber: 'ORD-2024-001',
      address: '456 Customer Ave, Apt 2B',
      customerName: 'John Smith',
      estimatedTime: '15 min',
      payment: 12.50,
      completed: false,
    },
    {
      id: '3',
      type: 'pickup',
      orderNumber: 'ORD-2024-002',
      address: '789 Burger Joint, Mall Area',
      customerName: 'Sarah Johnson',
      estimatedTime: '8 min',
      completed: false,
    },
    {
      id: '4',
      type: 'delivery',
      orderNumber: 'ORD-2024-002',
      address: '321 Home St, Unit 5',
      customerName: 'Sarah Johnson',
      estimatedTime: '12 min',
      payment: 15.00,
      completed: false,
    },
  ]);

  const [routeStats] = useState({
    totalDistance: '8.4 km',
    totalTime: '42 min',
    totalEarnings: 27.50,
    fuelCost: 3.20,
    netEarnings: 24.30,
  });

  const handleOptimizeRoute = () => {
    setOptimizing(true);
    // Simulate route optimization
    setTimeout(() => {
      console.log('Route optimized');
      setOptimizing(false);
    }, 2000);
  };

  const handleStartRoute = () => {
    console.log('Starting optimized route');
  };

  const toggleStopCompletion = (stopId: string) => {
    setRouteStops(prev => prev.map(stop => 
      stop.id === stopId ? { ...stop, completed: !stop.completed } : stop
    ));
  };

  const getStopIcon = (type: string, completed: boolean) => {
    if (completed) {
      return <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs">✓</span>
      </div>;
    }
    
    if (type === 'pickup') {
      return <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">P</span>
      </div>;
    } else {
      return <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">D</span>
      </div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Route Optimization</h1>
          <p className="text-gray-600">Optimize your delivery route for maximum efficiency.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleOptimizeRoute}
            disabled={optimizing}
            className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {optimizing ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span>Optimize Route</span>
              </>
            )}
          </button>
          <button
            onClick={handleStartRoute}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <PlayIcon className="h-4 w-4" />
            <span>Start Route</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Route Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{routeStats.totalDistance}</p>
                <p className="text-sm text-gray-500">Total Distance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{routeStats.totalTime}</p>
                <p className="text-sm text-gray-500">Total Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${routeStats.totalEarnings.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Total Earnings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">${routeStats.netEarnings.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Net Earnings</p>
              </div>
            </div>
          </div>

          {/* Route Steps */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Optimized Route</h3>
            <div className="space-y-4">
              {routeStops.map((stop, index) => (
                <div key={stop.id} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    {getStopIcon(stop.type, stop.completed)}
                    {index < routeStops.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {stop.type === 'pickup' ? 'Pickup' : 'Delivery'} #{stop.orderNumber}
                        </span>
                        {stop.payment && (
                          <span className="text-sm font-medium text-green-600">
                            +${stop.payment.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{stop.estimatedTime}</span>
                        <button
                          onClick={() => toggleStopCompletion(stop.id)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            stop.completed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {stop.completed ? 'Completed' : 'Mark Complete'}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{stop.customerName}</p>
                    <p className="text-sm text-gray-500">{stop.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Route Map</h3>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Interactive route map with turn-by-turn directions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Optimization Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Optimization Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="time">Shortest Time</option>
                  <option value="distance">Shortest Distance</option>
                  <option value="earnings">Maximum Earnings</option>
                  <option value="fuel">Fuel Efficient</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="car">Car</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Avoid Tolls</span>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Avoid Highways</span>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Route Efficiency */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Efficiency Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Time Saved</span>
                <span className="text-sm font-medium text-green-600">+8 min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Distance Saved</span>
                <span className="text-sm font-medium text-green-600">+1.2 km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Fuel Saved</span>
                <span className="text-sm font-medium text-green-600">$0.85</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Efficiency Score</span>
                <span className="text-sm font-medium text-blue-600">92%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                📱 Share Route with Customer
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                📧 Export Route Details
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                🔄 Reset Route
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                ⚙️ Route Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  MapPinIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
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
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    }
    return type === 'pickup' 
      ? <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>
      : <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">D</div>;
  };

  const getStopColor = (type: string, completed: boolean) => {
    if (completed) return 'bg-green-50 border-green-200';
    return type === 'pickup' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200';
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

      {/* Route Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center">
            <MapPinIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Distance</p>
              <p className="text-xl font-bold text-gray-900">{routeStats.totalDistance}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Time</p>
              <p className="text-xl font-bold text-gray-900">{routeStats.totalTime}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Earnings</p>
              <p className="text-xl font-bold text-gray-900">${routeStats.totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
              <span className="text-red-600 font-bold text-sm">⛽</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fuel Cost</p>
              <p className="text-xl font-bold text-gray-900">${routeStats.fuelCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Net Profit</p>
              <p className="text-xl font-bold text-green-600">${routeStats.netEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Route List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Optimized Route ({routeStops.length} stops)</h3>
            <div className="space-y-3">
              {routeStops.map((stop, index) => (
                <div key={stop.id} className={`border rounded-lg p-4 transition-colors ${getStopColor(stop.type, stop.completed)}`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                      {getStopIcon(stop.type, stop.completed)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {stop.type === 'pickup' ? 'Pickup' : 'Delivery'} - {stop.orderNumber}
                          </span>
                          {stop.payment && (
                            <span className="text-green-600 font-bold">${stop.payment.toFixed(2)}</span>
                          )}
                        </div>
                        <button
                          onClick={() => toggleStopCompletion(stop.id)}
                          className={`text-xs px-2 py-1 rounded transition-colors ${
                            stop.completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {stop.completed ? 'Completed' : 'Mark Complete'}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{stop.customerName}</p>
                      <p className="text-sm text-gray-500">{stop.address}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">ETA: {stop.estimatedTime}</span>
                      </div>
                    </div>
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
                  Avoid
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Tolls</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Highways</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Traffic</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Route Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Progress</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed Stops</span>
                <span className="text-sm font-medium text-gray-900">
                  {routeStops.filter(stop => stop.completed).length} / {routeStops.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(routeStops.filter(stop => stop.completed).length / routeStops.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Estimated completion</span>
                <span className="font-medium text-gray-900">2:30 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

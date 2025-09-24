'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  CurrencyDollarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'online' | 'offline' | 'busy' | 'break';
  vehicleType: 'motorcycle' | 'bicycle' | 'car' | 'van';
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
  };
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  currentOrder?: {
    orderId: string;
    customerName: string;
    estimatedDelivery: string;
  };
  stats: {
    totalDeliveries: number;
    completedToday: number;
    rating: number;
    earnings: number;
    onTimeRate: number;
  };
  joinedAt: string;
  lastActive: string;
}

export default function AdminFleetManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState('all');

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockDrivers: Driver[] = [
          {
            id: 'driver_001',
            name: 'Juan Santos',
            email: 'juan.santos@tap2go.com',
            phone: '+63 912 345 6789',
            status: 'online',
            vehicleType: 'motorcycle',
            vehicleDetails: {
              make: 'Honda',
              model: 'Click 150i',
              year: 2022,
              licensePlate: 'ABC-1234',
              color: 'Red',
            },
            currentLocation: {
              lat: 14.5995,
              lng: 120.9842,
              address: 'Makati City, Metro Manila',
            },
            currentOrder: {
              orderId: 'ORD-2024-001',
              customerName: 'Maria Garcia',
              estimatedDelivery: '2024-01-15T11:30:00Z',
            },
            stats: {
              totalDeliveries: 1245,
              completedToday: 12,
              rating: 4.8,
              earnings: 2450.75,
              onTimeRate: 94.5,
            },
            joinedAt: '2023-06-15T00:00:00Z',
            lastActive: '2024-01-15T10:45:00Z',
          },
          {
            id: 'driver_002',
            name: 'Carlos Reyes',
            email: 'carlos.reyes@tap2go.com',
            phone: '+63 917 234 5678',
            status: 'busy',
            vehicleType: 'car',
            vehicleDetails: {
              make: 'Toyota',
              model: 'Vios',
              year: 2021,
              licensePlate: 'DEF-5678',
              color: 'White',
            },
            currentLocation: {
              lat: 14.6200,
              lng: 120.9842,
              address: 'Quezon City, Metro Manila',
            },
            currentOrder: {
              orderId: 'ORD-2024-002',
              customerName: 'John Smith',
              estimatedDelivery: '2024-01-15T11:45:00Z',
            },
            stats: {
              totalDeliveries: 892,
              completedToday: 8,
              rating: 4.6,
              earnings: 1890.25,
              onTimeRate: 91.2,
            },
            joinedAt: '2023-08-20T00:00:00Z',
            lastActive: '2024-01-15T10:30:00Z',
          },
          {
            id: 'driver_003',
            name: 'Miguel Torres',
            email: 'miguel.torres@tap2go.com',
            phone: '+63 905 345 6789',
            status: 'offline',
            vehicleType: 'bicycle',
            vehicleDetails: {
              make: 'Trek',
              model: 'FX 3',
              year: 2023,
              licensePlate: 'N/A',
              color: 'Blue',
            },
            stats: {
              totalDeliveries: 567,
              completedToday: 0,
              rating: 4.4,
              earnings: 1234.50,
              onTimeRate: 88.7,
            },
            joinedAt: '2023-10-10T00:00:00Z',
            lastActive: '2024-01-14T18:30:00Z',
          },
          {
            id: 'driver_004',
            name: 'Ana Rodriguez',
            email: 'ana.rodriguez@tap2go.com',
            phone: '+63 918 456 7890',
            status: 'break',
            vehicleType: 'motorcycle',
            vehicleDetails: {
              make: 'Yamaha',
              model: 'NMAX 155',
              year: 2023,
              licensePlate: 'GHI-9012',
              color: 'Black',
            },
            currentLocation: {
              lat: 14.5800,
              lng: 120.9842,
              address: 'Pasay City, Metro Manila',
            },
            stats: {
              totalDeliveries: 1456,
              completedToday: 15,
              rating: 4.9,
              earnings: 3120.80,
              onTimeRate: 96.8,
            },
            joinedAt: '2023-04-05T00:00:00Z',
            lastActive: '2024-01-15T10:15:00Z',
          },
        ];

        setDrivers(mockDrivers);
      } catch (error) {
        console.error('Error loading drivers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDrivers();
  }, []);

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicleDetails.licensePlate.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || driver.status === selectedStatus;
    const matchesVehicle = selectedVehicle === 'all' || driver.vehicleType === selectedVehicle;
    
    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const getStatusBadge = (status: Driver['status']) => {
    const badges = {
      online: 'bg-green-100 text-green-800',
      offline: 'bg-gray-100 text-gray-800',
      busy: 'bg-blue-100 text-blue-800',
      break: 'bg-yellow-100 text-yellow-800',
    };
    
    return badges[status] || badges.offline;
  };

  const getStatusIcon = (status: Driver['status']) => {
    const icons = {
      online: CheckCircleIcon,
      offline: XCircleIcon,
      busy: ClockIcon,
      break: ExclamationTriangleIcon,
    };
    
    return icons[status] || XCircleIcon;
  };



  const onlineDrivers = drivers.filter(d => d.status === 'online' || d.status === 'busy').length;
  const totalDeliveries = drivers.reduce((sum, d) => sum + d.stats.completedToday, 0);
  const averageRating = drivers.length > 0 
    ? drivers.reduce((sum, d) => sum + d.stats.rating, 0) / drivers.length 
    : 0;
  const totalEarnings = drivers.reduce((sum, d) => sum + d.stats.earnings, 0);

  if (loading) {
    return (
      <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Fleet Management</h1>
            <p className="text-sm lg:text-base text-gray-600">Manage drivers, vehicles, and delivery operations.</p>
          </div>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Driver
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Online Drivers</p>
                <p className="text-lg font-semibold text-gray-900">{onlineDrivers}</p>
                <p className="text-xs text-gray-500">of {drivers.length} total</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TruckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Deliveries Today</p>
                <p className="text-lg font-semibold text-gray-900">{totalDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <StarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-lg font-semibold text-gray-900">{averageRating.toFixed(1)}</p>
                <p className="text-xs text-gray-500">out of 5.0</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-lg font-semibold text-gray-900">₱{totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow border mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search drivers by name, email, or license plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="busy">Busy</option>
              <option value="break">On Break</option>
              <option value="offline">Offline</option>
            </select>

            {/* Vehicle Filter */}
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Vehicles</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="bicycle">Bicycle</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
            </select>
          </div>
        </div>

        {/* Drivers Table */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Drivers ({filteredDrivers.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => {
                  const StatusIcon = getStatusIcon(driver.status);


                  return (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <UserIcon className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                            <div className="text-sm text-gray-500">{driver.email}</div>
                            <div className="text-xs text-gray-400">{driver.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {driver.vehicleType}
                            </div>
                            <div className="text-sm text-gray-500">
                              {driver.vehicleDetails.make} {driver.vehicleDetails.model}
                            </div>
                            <div className="text-xs text-gray-400">
                              {driver.vehicleDetails.licensePlate !== 'N/A' && driver.vehicleDetails.licensePlate}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(driver.status)}`}>
                            {driver.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Last active: {new Date(driver.lastActive).toLocaleTimeString()}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {driver.currentOrder ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {driver.currentOrder.orderId}
                            </div>
                            <div className="text-sm text-gray-500">
                              {driver.currentOrder.customerName}
                            </div>
                            <div className="text-xs text-gray-400">
                              ETA: {new Date(driver.currentOrder.estimatedDelivery).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No active order</span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                            <span>{driver.stats.rating.toFixed(1)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {driver.stats.totalDeliveries} total deliveries
                          </div>
                          <div className="text-xs text-gray-500">
                            {driver.stats.onTimeRate.toFixed(1)}% on-time
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          ₱{driver.stats.earnings.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {driver.stats.completedToday} deliveries today
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {driver.currentLocation ? (
                          <div>
                            <div className="flex items-center text-sm text-gray-900">
                              <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span>Active</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {driver.currentLocation.address}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Location unavailable</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredDrivers.length === 0 && (
            <div className="p-12 text-center">
              <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  coordinates: {
    center: { lat: number; lng: number };
    radius: number; // in kilometers
    polygon?: Array<{ lat: number; lng: number }>;
  };
  deliveryFee: {
    base: number;
    perKm?: number;
    minimum?: number;
    maximum?: number;
  };
  estimatedDeliveryTime: {
    min: number; // in minutes
    max: number;
  };
  coverage: {
    area: number; // in square kilometers
    population: number;
    restaurants: number;
    activeDrivers: number;
  };
  restrictions: {
    minOrderValue?: number;
    maxOrderValue?: number;
    allowedVehicles: string[];
    timeRestrictions?: {
      start: string;
      end: string;
    };
  };
  performance: {
    avgDeliveryTime: number;
    successRate: number;
    customerSatisfaction: number;
    totalOrders: number;
    revenue: number;
  };
  createdAt: string;
  lastModified: string;
  createdBy: string;
}

export default function AdminLogisticsZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadZones = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockZones: DeliveryZone[] = [
          {
            id: 'zone_001',
            name: 'Downtown Core',
            description: 'Central business district with high-density restaurants and customers',
            status: 'active',
            coordinates: {
              center: { lat: 40.7589, lng: -73.9851 },
              radius: 2.5,
            },
            deliveryFee: {
              base: 3.99,
              perKm: 0.50,
              minimum: 2.99,
              maximum: 8.99,
            },
            estimatedDeliveryTime: {
              min: 20,
              max: 35,
            },
            coverage: {
              area: 19.6,
              population: 85000,
              restaurants: 245,
              activeDrivers: 45,
            },
            restrictions: {
              minOrderValue: 15.00,
              allowedVehicles: ['bicycle', 'scooter', 'car'],
              timeRestrictions: {
                start: '06:00',
                end: '23:00',
              },
            },
            performance: {
              avgDeliveryTime: 28,
              successRate: 96.5,
              customerSatisfaction: 4.6,
              totalOrders: 12450,
              revenue: 245600.75,
            },
            createdAt: '2023-06-15T10:00:00Z',
            lastModified: '2024-01-10T14:30:00Z',
            createdBy: 'John Smith',
          },
          {
            id: 'zone_002',
            name: 'Suburban North',
            description: 'Residential area with family restaurants and longer delivery distances',
            status: 'active',
            coordinates: {
              center: { lat: 40.8176, lng: -73.9782 },
              radius: 5.0,
            },
            deliveryFee: {
              base: 4.99,
              perKm: 0.75,
              minimum: 3.99,
              maximum: 12.99,
            },
            estimatedDeliveryTime: {
              min: 30,
              max: 50,
            },
            coverage: {
              area: 78.5,
              population: 125000,
              restaurants: 156,
              activeDrivers: 32,
            },
            restrictions: {
              minOrderValue: 20.00,
              allowedVehicles: ['car', 'van'],
              timeRestrictions: {
                start: '07:00',
                end: '22:00',
              },
            },
            performance: {
              avgDeliveryTime: 42,
              successRate: 94.2,
              customerSatisfaction: 4.4,
              totalOrders: 8750,
              revenue: 189300.50,
            },
            createdAt: '2023-07-20T09:15:00Z',
            lastModified: '2024-01-08T11:45:00Z',
            createdBy: 'Lisa Wilson',
          },
          {
            id: 'zone_003',
            name: 'University District',
            description: 'Student area with budget-friendly options and late-night delivery',
            status: 'active',
            coordinates: {
              center: { lat: 40.7282, lng: -73.9942 },
              radius: 1.8,
            },
            deliveryFee: {
              base: 2.99,
              perKm: 0.40,
              minimum: 1.99,
              maximum: 6.99,
            },
            estimatedDeliveryTime: {
              min: 15,
              max: 30,
            },
            coverage: {
              area: 10.2,
              population: 45000,
              restaurants: 89,
              activeDrivers: 28,
            },
            restrictions: {
              minOrderValue: 10.00,
              allowedVehicles: ['bicycle', 'scooter'],
              timeRestrictions: {
                start: '10:00',
                end: '02:00',
              },
            },
            performance: {
              avgDeliveryTime: 22,
              successRate: 97.8,
              customerSatisfaction: 4.7,
              totalOrders: 15600,
              revenue: 156780.25,
            },
            createdAt: '2023-08-10T16:30:00Z',
            lastModified: '2024-01-12T09:20:00Z',
            createdBy: 'David Brown',
          },
          {
            id: 'zone_004',
            name: 'Industrial East',
            description: 'Business parks and office complexes with lunch delivery focus',
            status: 'maintenance',
            coordinates: {
              center: { lat: 40.7505, lng: -73.9934 },
              radius: 3.2,
            },
            deliveryFee: {
              base: 5.99,
              perKm: 0.60,
              minimum: 4.99,
              maximum: 10.99,
            },
            estimatedDeliveryTime: {
              min: 25,
              max: 40,
            },
            coverage: {
              area: 32.2,
              population: 25000,
              restaurants: 67,
              activeDrivers: 15,
            },
            restrictions: {
              minOrderValue: 25.00,
              allowedVehicles: ['car', 'van'],
              timeRestrictions: {
                start: '08:00',
                end: '18:00',
              },
            },
            performance: {
              avgDeliveryTime: 35,
              successRate: 92.1,
              customerSatisfaction: 4.2,
              totalOrders: 4200,
              revenue: 98500.00,
            },
            createdAt: '2023-09-05T11:45:00Z',
            lastModified: '2024-01-15T13:10:00Z',
            createdBy: 'Emily Rodriguez',
          },
          {
            id: 'zone_005',
            name: 'Waterfront South',
            description: 'Coastal area with premium restaurants and tourist destinations',
            status: 'inactive',
            coordinates: {
              center: { lat: 40.7061, lng: -74.0087 },
              radius: 4.1,
            },
            deliveryFee: {
              base: 6.99,
              perKm: 0.85,
              minimum: 5.99,
              maximum: 15.99,
            },
            estimatedDeliveryTime: {
              min: 35,
              max: 55,
            },
            coverage: {
              area: 52.8,
              population: 65000,
              restaurants: 134,
              activeDrivers: 0,
            },
            restrictions: {
              minOrderValue: 30.00,
              allowedVehicles: ['car'],
              timeRestrictions: {
                start: '11:00',
                end: '21:00',
              },
            },
            performance: {
              avgDeliveryTime: 0,
              successRate: 0,
              customerSatisfaction: 0,
              totalOrders: 0,
              revenue: 0,
            },
            createdAt: '2023-10-12T14:20:00Z',
            lastModified: '2023-12-20T16:45:00Z',
            createdBy: 'Mike Chen',
          },
        ];

        setZones(mockZones);
      } catch (error) {
        console.error('Error loading zones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadZones();
  }, []);

  const filteredZones = zones.filter(zone => {
    const matchesSearch = 
      zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || zone.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DeliveryZone['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
    };
    
    return badges[status] || badges.inactive;
  };

  const getStatusIcon = (status: DeliveryZone['status']) => {
    const icons = {
      active: CheckCircleIcon,
      inactive: XCircleIcon,
      maintenance: ClockIcon,
    };
    
    return icons[status] || XCircleIcon;
  };

  const handleStatusChange = (zoneId: string, newStatus: DeliveryZone['status']) => {
    setZones(prev => 
      prev.map(zone => 
        zone.id === zoneId ? { ...zone, status: newStatus, lastModified: new Date().toISOString() } : zone
      )
    );
  };

  const totalCoverage = zones.reduce((sum, z) => sum + z.coverage.area, 0);
  const totalPopulation = zones.reduce((sum, z) => sum + z.coverage.population, 0);
  const totalRestaurants = zones.reduce((sum, z) => sum + z.coverage.restaurants, 0);
  const activeDrivers = zones.reduce((sum, z) => sum + z.coverage.activeDrivers, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Delivery Zones</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage delivery zones, coverage areas, and logistics settings.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Zone
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPinIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Coverage</p>
              <p className="text-lg font-semibold text-gray-900">{totalCoverage.toFixed(1)} km²</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Population Served</p>
              <p className="text-lg font-semibold text-gray-900">{totalPopulation.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Partner Restaurants</p>
              <p className="text-lg font-semibold text-gray-900">{totalRestaurants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TruckIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Drivers</p>
              <p className="text-lg font-semibold text-gray-900">{activeDrivers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search zones by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Zones List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Delivery Zones ({filteredZones.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredZones.map((zone) => {
            const StatusIcon = getStatusIcon(zone.status);
            return (
              <div key={zone.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPinIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{zone.name}</h4>
                      <p className="text-sm text-gray-600">{zone.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Created by {zone.createdBy}</span>
                        <span>•</span>
                        <span>{new Date(zone.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Radius: {zone.coordinates.radius} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(zone.status)}`}>
                      <StatusIcon className="h-4 w-4 inline mr-1" />
                      {zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Zone Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Coverage</p>
                    <p className="text-lg font-semibold text-gray-900">{zone.coverage.area} km²</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Population</p>
                    <p className="text-lg font-semibold text-gray-900">{zone.coverage.population.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Restaurants</p>
                    <p className="text-lg font-semibold text-gray-900">{zone.coverage.restaurants}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                    <p className="text-lg font-semibold text-gray-900">{zone.coverage.activeDrivers}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Avg Delivery</p>
                    <p className="text-lg font-semibold text-gray-900">{zone.performance.avgDeliveryTime || 0} min</p>
                  </div>
                </div>

                {/* Delivery Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivery Fee</p>
                    <p className="text-sm text-gray-900">
                      Base: ${zone.deliveryFee.base}
                      {zone.deliveryFee.perKm && ` + $${zone.deliveryFee.perKm}/km`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Range: ${zone.deliveryFee.minimum} - ${zone.deliveryFee.maximum}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">Delivery Time</p>
                    <p className="text-sm text-gray-900">
                      {zone.estimatedDeliveryTime.min} - {zone.estimatedDeliveryTime.max} minutes
                    </p>
                    {zone.restrictions.timeRestrictions && (
                      <p className="text-xs text-gray-500">
                        Hours: {zone.restrictions.timeRestrictions.start} - {zone.restrictions.timeRestrictions.end}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600">Restrictions</p>
                    <p className="text-sm text-gray-900">
                      Min Order: ${zone.restrictions.minOrderValue || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      Vehicles: {zone.restrictions.allowedVehicles.join(', ')}
                    </p>
                  </div>
                </div>

                {/* Performance Metrics */}
                {zone.status === 'active' && zone.performance.totalOrders > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Success Rate</p>
                      <p className="text-lg font-semibold text-green-600">{zone.performance.successRate}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                      <p className="text-lg font-semibold text-blue-600">{zone.performance.customerSatisfaction}/5</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-lg font-semibold text-gray-900">{zone.performance.totalOrders.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-lg font-semibold text-green-600">${zone.performance.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View Map
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>

                    {zone.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(zone.id, 'inactive')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700"
                      >
                        <XCircleIcon className="h-4 w-4 mr-1" />
                        Deactivate
                      </button>
                    )}

                    {zone.status === 'inactive' && (
                      <button
                        onClick={() => handleStatusChange(zone.id, 'active')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Activate
                      </button>
                    )}

                    {zone.status === 'maintenance' && (
                      <button
                        onClick={() => handleStatusChange(zone.id, 'active')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Resume
                      </button>
                    )}

                    <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700">
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>

                  <div className="text-xs text-gray-500">
                    Last modified: {new Date(zone.lastModified).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredZones.length === 0 && (
          <div className="p-12 text-center">
            <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery zones found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
            >
              Create Your First Zone
            </button>
          </div>
        )}
      </div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Zone</h3>
            <p className="text-gray-600 mb-4">Zone creation functionality will be implemented here.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  TruckIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  priority: number;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: {
    min: number;
    max: number;
  };
  coverage: {
    radius: number;
    centerLat: number;
    centerLng: number;
  };
  boundaries: {
    lat: number;
    lng: number;
  }[];
  restrictions: {
    maxWeight: number;
    maxDimensions: {
      length: number;
      width: number;
      height: number;
    };
    allowedVehicles: string[];
  };
  operatingHours: {
    start: string;
    end: string;
    days: string[];
  };
  activeDrivers: number;
  totalOrders: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
  createdAt: string;
  lastUpdated: string;
}

export default function AdminDeliveryZones() {
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadDeliveryZones = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockDeliveryZones: DeliveryZone[] = [
          {
            id: 'zone_001',
            name: 'Downtown Core',
            description: 'Central business district with high-density coverage',
            status: 'active',
            priority: 1,
            deliveryFee: 2.99,
            minimumOrder: 15.00,
            estimatedDeliveryTime: { min: 20, max: 35 },
            coverage: {
              radius: 3.5,
              centerLat: 14.5995,
              centerLng: 120.9842,
            },
            boundaries: [
              { lat: 14.6050, lng: 120.9800 },
              { lat: 14.6050, lng: 120.9900 },
              { lat: 14.5950, lng: 120.9900 },
              { lat: 14.5950, lng: 120.9800 },
            ],
            restrictions: {
              maxWeight: 25,
              maxDimensions: { length: 60, width: 40, height: 30 },
              allowedVehicles: ['motorcycle', 'bicycle', 'car'],
            },
            operatingHours: {
              start: '06:00',
              end: '23:00',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            },
            activeDrivers: 45,
            totalOrders: 2456,
            averageDeliveryTime: 28,
            customerSatisfaction: 4.6,
            createdAt: '2024-01-01T00:00:00Z',
            lastUpdated: '2024-01-15T10:30:00Z',
          },
          {
            id: 'zone_002',
            name: 'Residential North',
            description: 'Northern residential areas with suburban coverage',
            status: 'active',
            priority: 2,
            deliveryFee: 3.99,
            minimumOrder: 20.00,
            estimatedDeliveryTime: { min: 30, max: 45 },
            coverage: {
              radius: 5.0,
              centerLat: 14.6200,
              centerLng: 120.9842,
            },
            boundaries: [
              { lat: 14.6300, lng: 120.9700 },
              { lat: 14.6300, lng: 120.9950 },
              { lat: 14.6100, lng: 120.9950 },
              { lat: 14.6100, lng: 120.9700 },
            ],
            restrictions: {
              maxWeight: 30,
              maxDimensions: { length: 80, width: 50, height: 40 },
              allowedVehicles: ['motorcycle', 'car', 'van'],
            },
            operatingHours: {
              start: '07:00',
              end: '22:00',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            },
            activeDrivers: 32,
            totalOrders: 1834,
            averageDeliveryTime: 38,
            customerSatisfaction: 4.4,
            createdAt: '2024-01-01T00:00:00Z',
            lastUpdated: '2024-01-12T14:20:00Z',
          },
          {
            id: 'zone_003',
            name: 'Industrial South',
            description: 'Southern industrial and commercial zone',
            status: 'maintenance',
            priority: 3,
            deliveryFee: 4.99,
            minimumOrder: 25.00,
            estimatedDeliveryTime: { min: 35, max: 50 },
            coverage: {
              radius: 4.2,
              centerLat: 14.5800,
              centerLng: 120.9842,
            },
            boundaries: [
              { lat: 14.5900, lng: 120.9700 },
              { lat: 14.5900, lng: 120.9950 },
              { lat: 14.5700, lng: 120.9950 },
              { lat: 14.5700, lng: 120.9700 },
            ],
            restrictions: {
              maxWeight: 40,
              maxDimensions: { length: 100, width: 60, height: 50 },
              allowedVehicles: ['car', 'van', 'truck'],
            },
            operatingHours: {
              start: '08:00',
              end: '20:00',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            },
            activeDrivers: 18,
            totalOrders: 892,
            averageDeliveryTime: 42,
            customerSatisfaction: 4.2,
            createdAt: '2024-01-01T00:00:00Z',
            lastUpdated: '2024-01-10T09:15:00Z',
          },
          {
            id: 'zone_004',
            name: 'Coastal East',
            description: 'Eastern coastal areas with scenic routes',
            status: 'active',
            priority: 4,
            deliveryFee: 5.99,
            minimumOrder: 30.00,
            estimatedDeliveryTime: { min: 40, max: 60 },
            coverage: {
              radius: 6.0,
              centerLat: 14.5995,
              centerLng: 121.0100,
            },
            boundaries: [
              { lat: 14.6100, lng: 121.0000 },
              { lat: 14.6100, lng: 121.0200 },
              { lat: 14.5900, lng: 121.0200 },
              { lat: 14.5900, lng: 121.0000 },
            ],
            restrictions: {
              maxWeight: 35,
              maxDimensions: { length: 90, width: 55, height: 45 },
              allowedVehicles: ['motorcycle', 'car', 'van'],
            },
            operatingHours: {
              start: '09:00',
              end: '21:00',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            },
            activeDrivers: 24,
            totalOrders: 1245,
            averageDeliveryTime: 48,
            customerSatisfaction: 4.3,
            createdAt: '2024-01-01T00:00:00Z',
            lastUpdated: '2024-01-14T16:45:00Z',
          },
          {
            id: 'zone_005',
            name: 'University District',
            description: 'University area with student-focused delivery',
            status: 'inactive',
            priority: 5,
            deliveryFee: 1.99,
            minimumOrder: 10.00,
            estimatedDeliveryTime: { min: 25, max: 40 },
            coverage: {
              radius: 2.8,
              centerLat: 14.6100,
              centerLng: 120.9700,
            },
            boundaries: [
              { lat: 14.6150, lng: 120.9650 },
              { lat: 14.6150, lng: 120.9750 },
              { lat: 14.6050, lng: 120.9750 },
              { lat: 14.6050, lng: 120.9650 },
            ],
            restrictions: {
              maxWeight: 20,
              maxDimensions: { length: 50, width: 35, height: 25 },
              allowedVehicles: ['bicycle', 'motorcycle'],
            },
            operatingHours: {
              start: '10:00',
              end: '24:00',
              days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            },
            activeDrivers: 0,
            totalOrders: 0,
            averageDeliveryTime: 0,
            customerSatisfaction: 0,
            createdAt: '2024-01-01T00:00:00Z',
            lastUpdated: '2024-01-05T11:30:00Z',
          },
        ];

        setDeliveryZones(mockDeliveryZones);
      } catch (error) {
        console.error('Error loading delivery zones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeliveryZones();
  }, []);

  const filteredZones = deliveryZones.filter(zone => {
    const matchesSearch = 
      zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || zone.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DeliveryZone['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
    };
    
    return badges[status] || badges.inactive;
  };

  const getStatusIcon = (status: DeliveryZone['status']) => {
    const icons = {
      active: CheckCircleIcon,
      inactive: XCircleIcon,
      maintenance: ExclamationTriangleIcon,
    };
    
    return icons[status] || XCircleIcon;
  };

  const totalActiveZones = deliveryZones.filter(z => z.status === 'active').length;
  const totalActiveDrivers = deliveryZones.reduce((sum, z) => sum + z.activeDrivers, 0);
  const totalOrders = deliveryZones.reduce((sum, z) => sum + z.totalOrders, 0);
  const averageDeliveryTime = deliveryZones.length > 0 
    ? deliveryZones.reduce((sum, z) => sum + z.averageDeliveryTime, 0) / deliveryZones.length 
    : 0;

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
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Delivery Zones</h1>
            <p className="text-sm lg:text-base text-gray-600">Manage delivery zones, coverage areas, and operational settings.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Zone
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Zones</p>
                <p className="text-lg font-semibold text-gray-900">{totalActiveZones}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TruckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                <p className="text-lg font-semibold text-gray-900">{totalActiveDrivers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-lg font-semibold text-gray-900">{totalOrders.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
                <p className="text-lg font-semibold text-gray-900">{averageDeliveryTime.toFixed(0)}m</p>
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
                placeholder="Search zones by name or description..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Delivery Zones Table */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Delivery Zones ({filteredZones.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coverage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Drivers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredZones.map((zone) => {
                  const StatusIcon = getStatusIcon(zone.status);

                  return (
                    <tr key={zone.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <MapPinIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                            <div className="text-sm text-gray-500">{zone.description}</div>
                            <div className="text-xs text-gray-400">Priority: {zone.priority}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{zone.coverage.radius} km radius</div>
                        <div className="text-xs text-gray-500">
                          Center: {zone.coverage.centerLat.toFixed(4)}, {zone.coverage.centerLng.toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Min Order: ${zone.minimumOrder}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${zone.deliveryFee}</div>
                        <div className="text-xs text-gray-500">Base fee</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {zone.estimatedDeliveryTime.min}-{zone.estimatedDeliveryTime.max} min
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg: {zone.averageDeliveryTime || 'N/A'} min
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{zone.activeDrivers}</div>
                        <div className="text-xs text-gray-500">drivers online</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{zone.totalOrders} orders</div>
                        <div className="text-xs text-gray-500">
                          {zone.customerSatisfaction > 0 ? `${zone.customerSatisfaction}/5 rating` : 'No rating'}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(zone.status)}`}>
                            {zone.status}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-orange-600 hover:text-orange-900 mr-3">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 mr-3">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Delivery Zone</h3>
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

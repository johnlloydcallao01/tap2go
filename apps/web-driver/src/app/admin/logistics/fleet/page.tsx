'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  Battery0Icon,

  ExclamationTriangleIcon,

  EyeIcon,
  PencilIcon,
  PlusIcon,

  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

interface Vehicle {
  id: string;
  licensePlate: string;
  type: 'bicycle' | 'scooter' | 'motorcycle' | 'car' | 'van';
  brand: string;
  model: string;
  year: number;
  status: 'active' | 'inactive' | 'maintenance' | 'offline';
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    zone: string;
  };
  battery?: number; // for electric vehicles
  fuel?: number; // for fuel vehicles
  lastUpdate: string;
  totalDistance: number;
  totalOrders: number;
  rating: number;
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'expiring';
  };
  maintenance: {
    lastService: string;
    nextService: string;
    mileage: number;
    issues: string[];
  };
}

interface FleetStats {
  totalVehicles: number;
  activeVehicles: number;
  availableDrivers: number;
  ongoingDeliveries: number;
  maintenanceRequired: number;
  avgDeliveryTime: number;
  fuelEfficiency: number;
  customerSatisfaction: number;
}

export default function FleetManagementPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FleetStats>({
    totalVehicles: 0,
    activeVehicles: 0,
    availableDrivers: 0,
    ongoingDeliveries: 0,
    maintenanceRequired: 0,
    avgDeliveryTime: 0,
    fuelEfficiency: 0,
    customerSatisfaction: 0,
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  // Removed unused variables: currentPage, setCurrentPage, itemsPerPage

  useEffect(() => {
    const loadFleetData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock fleet statistics
        setStats({
          totalVehicles: 156,
          activeVehicles: 142,
          availableDrivers: 89,
          ongoingDeliveries: 67,
          maintenanceRequired: 8,
          avgDeliveryTime: 28,
          fuelEfficiency: 85.2,
          customerSatisfaction: 4.6,
        });

        // Mock vehicle data
        const mockVehicles: Vehicle[] = [
          {
            id: 'vehicle_001',
            licensePlate: 'ABC-1234',
            type: 'car',
            brand: 'Toyota',
            model: 'Corolla',
            year: 2022,
            status: 'active',
            driverId: 'driver_001',
            driverName: 'John Martinez',
            driverPhone: '+1-555-0123',
            location: {
              lat: 40.7589,
              lng: -73.9851,
              address: '123 Main St, Downtown',
              zone: 'Downtown Core',
            },
            fuel: 85,
            lastUpdate: '2024-02-12T10:30:00Z',
            totalDistance: 15420,
            totalOrders: 1247,
            rating: 4.8,
            insurance: {
              provider: 'SafeGuard Insurance',
              policyNumber: 'SG-2024-001234',
              expiryDate: '2024-12-31',
              status: 'active',
            },
            maintenance: {
              lastService: '2024-01-15',
              nextService: '2024-04-15',
              mileage: 15420,
              issues: [],
            },
          },
          {
            id: 'vehicle_002',
            licensePlate: 'XYZ-5678',
            type: 'scooter',
            brand: 'Honda',
            model: 'PCX 150',
            year: 2023,
            status: 'active',
            driverId: 'driver_002',
            driverName: 'Sarah Chen',
            driverPhone: '+1-555-0456',
            location: {
              lat: 40.8176,
              lng: -73.9782,
              address: '456 Oak Ave, Suburban',
              zone: 'Suburban North',
            },
            fuel: 92,
            lastUpdate: '2024-02-12T10:25:00Z',
            totalDistance: 8750,
            totalOrders: 892,
            rating: 4.9,
            insurance: {
              provider: 'QuickCover',
              policyNumber: 'QC-2024-005678',
              expiryDate: '2024-11-30',
              status: 'active',
            },
            maintenance: {
              lastService: '2024-02-01',
              nextService: '2024-05-01',
              mileage: 8750,
              issues: [],
            },
          },
          {
            id: 'vehicle_003',
            licensePlate: 'DEF-9012',
            type: 'bicycle',
            brand: 'Trek',
            model: 'Electric Cargo',
            year: 2023,
            status: 'active',
            driverId: 'driver_003',
            driverName: 'Mike Johnson',
            driverPhone: '+1-555-0789',
            location: {
              lat: 40.7282,
              lng: -73.9942,
              address: '789 University Blvd',
              zone: 'University District',
            },
            battery: 78,
            lastUpdate: '2024-02-12T10:28:00Z',
            totalDistance: 3420,
            totalOrders: 567,
            rating: 4.7,
            insurance: {
              provider: 'BikeSecure',
              policyNumber: 'BS-2024-009012',
              expiryDate: '2024-10-15',
              status: 'active',
            },
            maintenance: {
              lastService: '2024-01-20',
              nextService: '2024-04-20',
              mileage: 3420,
              issues: [],
            },
          },
          {
            id: 'vehicle_004',
            licensePlate: 'GHI-3456',
            type: 'van',
            brand: 'Ford',
            model: 'Transit Connect',
            year: 2021,
            status: 'maintenance',
            driverId: 'driver_004',
            driverName: 'Lisa Rodriguez',
            driverPhone: '+1-555-0321',
            location: {
              lat: 40.7505,
              lng: -73.9934,
              address: 'Service Center, 321 Repair St',
              zone: 'Service Area',
            },
            fuel: 45,
            lastUpdate: '2024-02-11T16:45:00Z',
            totalDistance: 22150,
            totalOrders: 1876,
            rating: 4.5,
            insurance: {
              provider: 'FleetGuard Pro',
              policyNumber: 'FG-2024-003456',
              expiryDate: '2025-01-15',
              status: 'active',
            },
            maintenance: {
              lastService: '2024-02-10',
              nextService: '2024-05-10',
              mileage: 22150,
              issues: ['Brake pads replacement', 'Oil change', 'Tire rotation'],
            },
          },
          {
            id: 'vehicle_005',
            licensePlate: 'JKL-7890',
            type: 'motorcycle',
            brand: 'Yamaha',
            model: 'NMAX 155',
            year: 2022,
            status: 'inactive',
            location: {
              lat: 40.7614,
              lng: -73.9776,
              address: 'Parking Garage B, Level 2',
              zone: 'Storage',
            },
            fuel: 100,
            lastUpdate: '2024-02-10T08:00:00Z',
            totalDistance: 12890,
            totalOrders: 1034,
            rating: 4.6,
            insurance: {
              provider: 'MotoSafe',
              policyNumber: 'MS-2024-007890',
              expiryDate: '2024-09-30',
              status: 'expiring',
            },
            maintenance: {
              lastService: '2024-01-05',
              nextService: '2024-04-05',
              mileage: 12890,
              issues: [],
            },
          },
          {
            id: 'vehicle_006',
            licensePlate: 'MNO-2468',
            type: 'scooter',
            brand: 'Vespa',
            model: 'Primavera 150',
            year: 2023,
            status: 'active',
            driverId: 'driver_006',
            driverName: 'David Kim',
            driverPhone: '+1-555-0654',
            location: {
              lat: 40.7831,
              lng: -73.9712,
              address: '147 Broadway, Midtown',
              zone: 'Midtown',
            },
            fuel: 67,
            lastUpdate: '2024-02-12T10:32:00Z',
            totalDistance: 6780,
            totalOrders: 723,
            rating: 4.4,
            insurance: {
              provider: 'UrbanRide Insurance',
              policyNumber: 'UR-2024-002468',
              expiryDate: '2024-08-20',
              status: 'active',
            },
            maintenance: {
              lastService: '2024-01-25',
              nextService: '2024-04-25',
              mileage: 6780,
              issues: [],
            },
          },
        ];

        setVehicles(mockVehicles);
      } catch (error) {
        console.error('Error loading fleet data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFleetData();
  }, []);

  // Removed unused functions: formatDate, formatDateTime

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      offline: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Removed unused function: getInsuranceStatusBadge

  const getVehicleIcon = () => {
    // All vehicle types use TruckIcon for simplicity
    return <TruckIcon className="h-4 w-4" />;
  };

  const getFuelBatteryColor = (level: number) => {
    if (level >= 70) return 'text-green-600';
    if (level >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-sm lg:text-base text-gray-600">Monitor and manage your delivery fleet, track vehicles, and optimize operations.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center text-sm">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Fleet Data
          </button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TruckIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
              <p className="text-sm text-blue-600">
                {stats.activeVehicles} active
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.availableDrivers}</p>
              <p className="text-sm text-green-600">
                {stats.ongoingDeliveries} on delivery
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Delivery Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgDeliveryTime} min</p>
              <p className="text-sm text-purple-600">
                {stats.customerSatisfaction}★ rating
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Maintenance Required</p>
              <p className="text-2xl font-bold text-gray-900">{stats.maintenanceRequired}</p>
              <p className="text-sm text-orange-600">
                Needs attention
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vehicles, drivers, or license plates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Types</option>
              <option value="bicycle">Bicycle</option>
              <option value="scooter">Scooter</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Fleet Overview</h3>
          <p className="text-sm text-gray-600">Real-time status and information for all vehicles</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel/Battery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getVehicleIcon()}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{vehicle.licensePlate}</div>
                        <div className="text-sm text-gray-500">{vehicle.brand} {vehicle.model} ({vehicle.year})</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {vehicle.driverName ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{vehicle.driverName}</div>
                        <div className="text-sm text-gray-500">{vehicle.driverPhone}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No driver assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm text-gray-900">{vehicle.location.zone}</div>
                        <div className="text-sm text-gray-500">{vehicle.location.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {vehicle.battery !== undefined ? (
                        <Battery0Icon className={`h-4 w-4 mr-2 ${getFuelBatteryColor(vehicle.battery)}`} />
                      ) : (
                        <div className={`h-4 w-4 mr-2 ${getFuelBatteryColor(vehicle.fuel || 0)}`}>⛽</div>
                      )}
                      <div>
                        <div className={`text-sm font-medium ${getFuelBatteryColor(vehicle.battery || vehicle.fuel || 0)}`}>
                          {vehicle.battery !== undefined ? `${vehicle.battery}%` : `${vehicle.fuel}%`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {vehicle.battery !== undefined ? 'Battery' : 'Fuel'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{vehicle.totalOrders} orders</div>
                    <div className="text-sm text-gray-500">{vehicle.rating}★ • {vehicle.totalDistance.toLocaleString()} km</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vehicle.status)}
                    {vehicle.maintenance.issues.length > 0 && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          {vehicle.maintenance.issues.length} issue{vehicle.maintenance.issues.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {vehicle.driverPhone && (
                        <button className="text-green-600 hover:text-green-900">
                          <PhoneIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button className="text-blue-600 hover:text-blue-900">
                        <ChatBubbleLeftIcon className="h-4 w-4" />
                      </button>
                      <button className="text-orange-600 hover:text-orange-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

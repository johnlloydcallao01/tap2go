'use client';

import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  MapPinIcon,
  TruckIcon,

  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,

  MagnifyingGlassIcon,
  ArrowDownTrayIcon,

  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface DeliveryTimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  zone: string;
  zoneName: string;
  estimatedDuration: number; // in minutes
  maxOrders: number;
  currentOrders: number;
  status: 'active' | 'inactive' | 'full' | 'maintenance';
  deliveryFee: number;
  priority: number;
  restrictions: {
    minOrderValue?: number;
    vehicleTypes: string[];
    weatherDependent: boolean;
  };
  performance: {
    avgDeliveryTime: number;
    onTimeRate: number;
    customerSatisfaction: number;
    totalDeliveries: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface DeliveryStats {
  totalSlots: number;
  activeSlots: number;
  avgDeliveryTime: number;
  onTimeDeliveryRate: number;
  peakHourUtilization: number;
  customerSatisfaction: number;
  totalDeliveriesToday: number;
  delayedDeliveries: number;
}

export default function DeliveryTimesPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DeliveryStats>({
    totalSlots: 0,
    activeSlots: 0,
    avgDeliveryTime: 0,
    onTimeDeliveryRate: 0,
    peakHourUtilization: 0,
    customerSatisfaction: 0,
    totalDeliveriesToday: 0,
    delayedDeliveries: 0,
  });
  const [timeSlots, setTimeSlots] = useState<DeliveryTimeSlot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');
  // Removed unused variables: currentPage, setCurrentPage, itemsPerPage

  useEffect(() => {
    const loadDeliveryData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock delivery statistics
        setStats({
          totalSlots: 48,
          activeSlots: 42,
          avgDeliveryTime: 28,
          onTimeDeliveryRate: 94.5,
          peakHourUtilization: 87.3,
          customerSatisfaction: 4.6,
          totalDeliveriesToday: 1247,
          delayedDeliveries: 68,
        });

        // Mock delivery time slots
        const mockTimeSlots: DeliveryTimeSlot[] = [
          {
            id: 'slot_001',
            name: 'Morning Rush - Downtown',
            startTime: '07:00',
            endTime: '09:00',
            zone: 'zone_001',
            zoneName: 'Downtown Core',
            estimatedDuration: 25,
            maxOrders: 150,
            currentOrders: 142,
            status: 'active',
            deliveryFee: 3.99,
            priority: 1,
            restrictions: {
              minOrderValue: 15.00,
              vehicleTypes: ['bicycle', 'scooter', 'car'],
              weatherDependent: false,
            },
            performance: {
              avgDeliveryTime: 23,
              onTimeRate: 96.8,
              customerSatisfaction: 4.7,
              totalDeliveries: 2847,
            },
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-02-10T14:30:00Z',
          },
          {
            id: 'slot_002',
            name: 'Lunch Peak - Business District',
            startTime: '11:30',
            endTime: '14:00',
            zone: 'zone_001',
            zoneName: 'Downtown Core',
            estimatedDuration: 30,
            maxOrders: 200,
            currentOrders: 187,
            status: 'full',
            deliveryFee: 4.99,
            priority: 1,
            restrictions: {
              minOrderValue: 20.00,
              vehicleTypes: ['scooter', 'car'],
              weatherDependent: false,
            },
            performance: {
              avgDeliveryTime: 28,
              onTimeRate: 94.2,
              customerSatisfaction: 4.5,
              totalDeliveries: 4521,
            },
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-02-11T16:45:00Z',
          },
          {
            id: 'slot_003',
            name: 'Evening Standard - Suburban',
            startTime: '17:00',
            endTime: '20:00',
            zone: 'zone_002',
            zoneName: 'Suburban North',
            estimatedDuration: 45,
            maxOrders: 120,
            currentOrders: 89,
            status: 'active',
            deliveryFee: 5.99,
            priority: 2,
            restrictions: {
              minOrderValue: 25.00,
              vehicleTypes: ['car', 'van'],
              weatherDependent: true,
            },
            performance: {
              avgDeliveryTime: 42,
              onTimeRate: 91.5,
              customerSatisfaction: 4.3,
              totalDeliveries: 1876,
            },
            createdAt: '2024-01-20T09:00:00Z',
            updatedAt: '2024-02-09T12:20:00Z',
          },
          {
            id: 'slot_004',
            name: 'Late Night - University',
            startTime: '20:00',
            endTime: '02:00',
            zone: 'zone_003',
            zoneName: 'University District',
            estimatedDuration: 20,
            maxOrders: 80,
            currentOrders: 34,
            status: 'active',
            deliveryFee: 2.99,
            priority: 3,
            restrictions: {
              minOrderValue: 12.00,
              vehicleTypes: ['bicycle', 'scooter'],
              weatherDependent: false,
            },
            performance: {
              avgDeliveryTime: 18,
              onTimeRate: 97.2,
              customerSatisfaction: 4.8,
              totalDeliveries: 3245,
            },
            createdAt: '2024-01-25T11:30:00Z',
            updatedAt: '2024-02-08T18:15:00Z',
          },
          {
            id: 'slot_005',
            name: 'Weekend Brunch - Downtown',
            startTime: '09:00',
            endTime: '15:00',
            zone: 'zone_001',
            zoneName: 'Downtown Core',
            estimatedDuration: 35,
            maxOrders: 180,
            currentOrders: 156,
            status: 'active',
            deliveryFee: 4.49,
            priority: 1,
            restrictions: {
              minOrderValue: 18.00,
              vehicleTypes: ['bicycle', 'scooter', 'car'],
              weatherDependent: true,
            },
            performance: {
              avgDeliveryTime: 32,
              onTimeRate: 93.7,
              customerSatisfaction: 4.4,
              totalDeliveries: 2156,
            },
            createdAt: '2024-02-01T08:00:00Z',
            updatedAt: '2024-02-10T20:30:00Z',
          },
          {
            id: 'slot_006',
            name: 'Express Delivery - All Zones',
            startTime: '10:00',
            endTime: '22:00',
            zone: 'all',
            zoneName: 'All Zones',
            estimatedDuration: 15,
            maxOrders: 50,
            currentOrders: 23,
            status: 'active',
            deliveryFee: 7.99,
            priority: 1,
            restrictions: {
              minOrderValue: 30.00,
              vehicleTypes: ['car'],
              weatherDependent: false,
            },
            performance: {
              avgDeliveryTime: 14,
              onTimeRate: 98.5,
              customerSatisfaction: 4.9,
              totalDeliveries: 892,
            },
            createdAt: '2024-02-05T12:00:00Z',
            updatedAt: '2024-02-11T10:00:00Z',
          },
        ];

        setTimeSlots(mockTimeSlots);
      } catch (error) {
        console.error('Error loading delivery data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeliveryData();
  }, []);

  const formatTime = (time: string) => {
    return new Date(`2024-01-01T${time}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Removed unused function: formatDate

  const getStatusBadge = (status: string, currentOrders?: number, maxOrders?: number) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      full: 'bg-red-100 text-red-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
    };

    let displayStatus = status;
    if (status === 'active' && currentOrders && maxOrders && currentOrders >= maxOrders) {
      displayStatus = 'full';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[displayStatus as keyof typeof statusStyles] || statusStyles.active}`}>
        {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
      </span>
    );
  };

  const getUtilizationColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Delivery Time Management</h1>
          <p className="text-sm lg:text-base text-gray-600">Configure delivery time slots, monitor performance, and optimize scheduling across all zones.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center text-sm">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Schedule
          </button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Time Slot
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Delivery Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgDeliveryTime} min</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowDownIcon className="h-4 w-4 mr-1" />
                -3 min from last week
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">On-Time Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.onTimeDeliveryRate}%</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +2.1% from last month
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TruckIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Slots</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSlots}/{stats.totalSlots}</p>
              <p className="text-sm text-purple-600">
                {((stats.activeSlots / stats.totalSlots) * 100).toFixed(1)}% utilization
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
              <p className="text-sm font-medium text-gray-500">Delayed Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delayedDeliveries}</p>
              <p className="text-sm text-orange-600">
                {((stats.delayedDeliveries / stats.totalDeliveriesToday) * 100).toFixed(1)}% of total
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
                placeholder="Search time slots..."
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
              <option value="full">Full</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Zones</option>
              <option value="zone_001">Downtown Core</option>
              <option value="zone_002">Suburban North</option>
              <option value="zone_003">University District</option>
            </select>
          </div>
        </div>
      </div>

      {/* Time Slots Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Delivery Time Slots</h3>
          <p className="text-sm text-gray-600">Manage and monitor all delivery time slots across zones</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeSlots.map((slot) => (
                <tr key={slot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{slot.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{slot.zoneName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{slot.estimatedDuration} min</div>
                    <div className="text-sm text-gray-500">${slot.deliveryFee}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{slot.currentOrders}/{slot.maxOrders}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full ${getUtilizationColor(slot.currentOrders, slot.maxOrders)}`}
                            style={{ width: `${(slot.currentOrders / slot.maxOrders) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{slot.performance.avgDeliveryTime} min avg</div>
                    <div className="text-sm text-gray-500">{slot.performance.onTimeRate}% on-time</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(slot.status, slot.currentOrders, slot.maxOrders)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-orange-600 hover:text-orange-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
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

'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TruckIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface Driver {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'active' | 'suspended';
  vehicleType: string;
  licenseNumber: string;
  rating: number;
  totalDeliveries: number;
  createdAt: string;
  isOnline: boolean;
}

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockDrivers: Driver[] = [
          {
            id: '1',
            fullName: 'Mike Johnson',
            email: 'mike.johnson@email.com',
            phone: '+1 (555) 123-4567',
            status: 'active',
            vehicleType: 'motorcycle',
            licenseNumber: 'DL123456789',
            rating: 4.8,
            totalDeliveries: 245,
            createdAt: '2024-01-10',
            isOnline: true,
          },
          {
            id: '2',
            fullName: 'Sarah Davis',
            email: 'sarah.davis@email.com',
            phone: '+1 (555) 987-6543',
            status: 'pending',
            vehicleType: 'car',
            licenseNumber: 'DL987654321',
            rating: 0,
            totalDeliveries: 0,
            createdAt: '2024-01-18',
            isOnline: false,
          },
          {
            id: '3',
            fullName: 'Alex Rodriguez',
            email: 'alex.rodriguez@email.com',
            phone: '+1 (555) 456-7890',
            status: 'active',
            vehicleType: 'bicycle',
            licenseNumber: 'DL456789123',
            rating: 4.6,
            totalDeliveries: 189,
            createdAt: '2024-01-12',
            isOnline: true,
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

  const handleApproveDriver = async (driverId: string) => {
    setDrivers(drivers.map(driver => 
      driver.id === driverId 
        ? { ...driver, status: 'approved' as const }
        : driver
    ));
  };

  const handleRejectDriver = async (driverId: string) => {
    setDrivers(drivers.map(driver => 
      driver.id === driverId 
        ? { ...driver, status: 'suspended' as const }
        : driver
    ));
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || driver.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    return TruckIcon; // You could customize this based on vehicle type
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4">
                <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers Management</h1>
          <p className="text-gray-600">Manage delivery drivers and their applications.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {drivers.filter(d => d.isOnline).length} Online
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {drivers.filter(d => d.status === 'pending').length} Pending
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Drivers ({filteredDrivers.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredDrivers.map((driver) => {
            const VehicleIcon = getVehicleIcon(driver.vehicleType);
            return (
              <div key={driver.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <VehicleIcon className="h-6 w-6 text-white" />
                      </div>
                      {driver.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{driver.fullName}</h4>
                      <p className="text-sm text-gray-500">{driver.email}</p>
                      <p className="text-sm text-gray-500">{driver.phone}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500 capitalize">{driver.vehicleType}</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{driver.licenseNumber}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {driver.rating > 0 ? driver.rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{driver.totalDeliveries} deliveries</p>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(driver.status)}`}>
                        {driver.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        Joined: {new Date(driver.createdAt).toLocaleDateString()}
                      </p>
                      {driver.isOnline && (
                        <p className="text-xs text-green-600 mt-1">● Online</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 p-2">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      
                      {driver.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveDriver(driver.id)}
                            className="text-green-600 hover:text-green-900 p-2"
                            title="Approve Driver"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRejectDriver(driver.id)}
                            className="text-red-600 hover:text-red-900 p-2"
                            title="Reject Driver"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

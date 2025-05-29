'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';

interface Vendor {
  id: string;
  businessName: string;
  email: string;
  businessType: string;
  status: 'pending' | 'approved' | 'active' | 'suspended';
  commissionRate: number;
  createdAt: string;
  address: string;
  phone: string;
}

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const loadVendors = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockVendors: Vendor[] = [
          {
            id: '1',
            businessName: 'Pizza Palace',
            email: 'contact@pizzapalace.com',
            businessType: 'restaurant',
            status: 'pending',
            commissionRate: 15,
            createdAt: '2024-01-15',
            address: '123 Main St, City',
            phone: '+1 (555) 123-4567',
          },
          {
            id: '2',
            businessName: 'Burger Barn',
            email: 'info@burgerbarn.com',
            businessType: 'restaurant',
            status: 'active',
            commissionRate: 15,
            createdAt: '2024-01-10',
            address: '456 Oak Ave, City',
            phone: '+1 (555) 987-6543',
          },
          {
            id: '3',
            businessName: 'Sweet Treats Cafe',
            email: 'hello@sweettreats.com',
            businessType: 'cafe',
            status: 'approved',
            commissionRate: 12,
            createdAt: '2024-01-12',
            address: '789 Pine St, City',
            phone: '+1 (555) 456-7890',
          },
        ];
        
        setVendors(mockVendors);
      } catch (error) {
        console.error('Error loading vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, []);

  const handleApproveVendor = async (vendorId: string) => {
    setVendors(vendors.map(vendor => 
      vendor.id === vendorId 
        ? { ...vendor, status: 'approved' as const }
        : vendor
    ));
  };

  const handleRejectVendor = async (vendorId: string) => {
    setVendors(vendors.map(vendor => 
      vendor.id === vendorId 
        ? { ...vendor, status: 'suspended' as const }
        : vendor
    ));
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || vendor.status === selectedStatus;
    
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4">
                <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Vendors Management</h1>
          <p className="text-gray-600">Manage restaurant vendors and their applications.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {vendors.filter(v => v.status === 'pending').length} Pending Approval
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
                placeholder="Search vendors..."
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

      {/* Vendors List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Vendors ({filteredVendors.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <BuildingStorefrontIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{vendor.businessName}</h4>
                    <p className="text-sm text-gray-500">{vendor.email}</p>
                    <p className="text-sm text-gray-500">{vendor.address}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(vendor.status)}`}>
                      {vendor.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">Commission: {vendor.commissionRate}%</p>
                    <p className="text-xs text-gray-400">Joined: {new Date(vendor.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 p-2">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    
                    {vendor.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveVendor(vendor.id)}
                          className="text-green-600 hover:text-green-900 p-2"
                          title="Approve Vendor"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRejectVendor(vendor.id)}
                          className="text-red-600 hover:text-red-900 p-2"
                          title="Reject Vendor"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

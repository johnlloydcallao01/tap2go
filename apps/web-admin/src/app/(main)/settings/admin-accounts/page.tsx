'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,

  KeyIcon,
} from '@heroicons/react/24/outline';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'support';
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  createdBy: string;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  department: string;
  phone?: string;
}

export default function AdminAccounts() {
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadAdminAccounts = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockAdminAccounts: AdminAccount[] = [
          {
            id: 'admin_001',
            name: 'John Doe',
            email: 'john.doe@tap2go.com',
            role: 'super_admin',
            status: 'active',
            permissions: ['all'],
            lastLogin: '2024-01-15T10:30:00Z',
            createdAt: '2023-01-01T00:00:00Z',
            createdBy: 'system',
            twoFactorEnabled: true,
            loginAttempts: 0,
            department: 'IT',
            phone: '+63 912 345 6789',
          },
          {
            id: 'admin_002',
            name: 'Jane Smith',
            email: 'jane.smith@tap2go.com',
            role: 'admin',
            status: 'active',
            permissions: ['users:read', 'users:write', 'orders:read', 'orders:write', 'restaurants:read'],
            lastLogin: '2024-01-14T16:45:00Z',
            createdAt: '2023-03-15T00:00:00Z',
            createdBy: 'john.doe@tap2go.com',
            twoFactorEnabled: true,
            loginAttempts: 0,
            department: 'Operations',
            phone: '+63 917 234 5678',
          },
          {
            id: 'admin_003',
            name: 'Mike Johnson',
            email: 'mike.johnson@tap2go.com',
            role: 'manager',
            status: 'active',
            permissions: ['orders:read', 'restaurants:read', 'analytics:read'],
            lastLogin: '2024-01-13T14:20:00Z',
            createdAt: '2023-06-10T00:00:00Z',
            createdBy: 'jane.smith@tap2go.com',
            twoFactorEnabled: false,
            loginAttempts: 0,
            department: 'Business',
            phone: '+63 905 345 6789',
          },
          {
            id: 'admin_004',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@tap2go.com',
            role: 'support',
            status: 'active',
            permissions: ['users:read', 'orders:read', 'support:write'],
            lastLogin: '2024-01-15T09:15:00Z',
            createdAt: '2023-09-20T00:00:00Z',
            createdBy: 'jane.smith@tap2go.com',
            twoFactorEnabled: true,
            loginAttempts: 0,
            department: 'Customer Support',
            phone: '+63 918 456 7890',
          },
          {
            id: 'admin_005',
            name: 'David Brown',
            email: 'david.brown@tap2go.com',
            role: 'manager',
            status: 'suspended',
            permissions: ['orders:read', 'restaurants:read'],
            lastLogin: '2024-01-05T11:30:00Z',
            createdAt: '2023-11-01T00:00:00Z',
            createdBy: 'john.doe@tap2go.com',
            twoFactorEnabled: false,
            loginAttempts: 5,
            department: 'Operations',
          },
        ];

        setAdminAccounts(mockAdminAccounts);
      } catch (error) {
        console.error('Error loading admin accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminAccounts();
  }, []);

  const filteredAccounts = adminAccounts.filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || account.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || account.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: AdminAccount['role']) => {
    const badges = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      manager: 'bg-green-100 text-green-800',
      support: 'bg-yellow-100 text-yellow-800',
    };
    
    return badges[role] || badges.support;
  };

  const getStatusBadge = (status: AdminAccount['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    
    return badges[status] || badges.inactive;
  };

  const getStatusIcon = (status: AdminAccount['status']) => {
    const icons = {
      active: CheckCircleIcon,
      inactive: XCircleIcon,
      suspended: XCircleIcon,
    };
    
    return icons[status] || XCircleIcon;
  };

  const getRoleLabel = (role: AdminAccount['role']) => {
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      support: 'Support',
    };
    
    return labels[role] || role;
  };

  const activeAccounts = adminAccounts.filter(a => a.status === 'active').length;
  const totalAccounts = adminAccounts.length;
  const accountsWithTwoFA = adminAccounts.filter(a => a.twoFactorEnabled).length;
  const suspendedAccounts = adminAccounts.filter(a => a.status === 'suspended').length;

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
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Admin Accounts</h1>
            <p className="text-sm lg:text-base text-gray-600">Manage administrator accounts, roles, and permissions.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Admin
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Admins</p>
                <p className="text-lg font-semibold text-gray-900">{totalAccounts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-lg font-semibold text-gray-900">{activeAccounts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">With 2FA</p>
                <p className="text-lg font-semibold text-gray-900">{accountsWithTwoFA}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-lg font-semibold text-gray-900">{suspendedAccounts}</p>
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
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="support">Support</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Admin Accounts Table */}
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Admin Accounts ({filteredAccounts.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    2FA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => {
                  const StatusIcon = getStatusIcon(account.status);

                  return (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <UserIcon className="h-5 w-5 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{account.name}</div>
                            <div className="text-sm text-gray-500">{account.email}</div>
                            {account.phone && (
                              <div className="text-xs text-gray-400">{account.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(account.role)}`}>
                          {getRoleLabel(account.role)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {account.department}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(account.status)}`}>
                            {account.status}
                          </span>
                        </div>
                        {account.loginAttempts > 0 && (
                          <div className="text-xs text-red-500 mt-1">
                            {account.loginAttempts} failed attempts
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <KeyIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className={`text-sm ${account.twoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                            {account.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {account.lastLogin ? (
                          <div>
                            <div>{new Date(account.lastLogin).toLocaleDateString()}</div>
                            <div className="text-xs">{new Date(account.lastLogin).toLocaleTimeString()}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
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

          {filteredAccounts.length === 0 && (
            <div className="p-12 text-center">
              <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No admin accounts found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
              >
                Add First Admin
              </button>
            </div>
          )}
        </div>

        {/* Create Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Admin</h3>
              <p className="text-gray-600 mb-4">Admin creation functionality will be implemented here.</p>
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

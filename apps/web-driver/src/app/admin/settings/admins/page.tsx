'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  UserCircleIcon,
  ShieldCheckIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'support';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  permissions: string[];
  lastLogin: string;
  loginCount: number;
  twoFactorEnabled: boolean;
  createdAt: string;
  createdBy: string;
  department: string;
  phone?: string;
  avatar?: string;
  sessionInfo: {
    currentSessions: number;
    lastIpAddress: string;
    lastUserAgent: string;
  };
}

interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  onlineAdmins: number;
  pendingInvites: number;
  superAdmins: number;
  twoFactorEnabled: number;
  lastWeekLogins: number;
  securityIncidents: number;
}

export default function AdminAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalAdmins: 0,
    activeAdmins: 0,
    onlineAdmins: 0,
    pendingInvites: 0,
    superAdmins: 0,
    twoFactorEnabled: 0,
    lastWeekLogins: 0,
    securityIncidents: 0,
  });


  useEffect(() => {
    const loadAdminData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock admin statistics
        setStats({
          totalAdmins: 12,
          activeAdmins: 10,
          onlineAdmins: 4,
          pendingInvites: 2,
          superAdmins: 2,
          twoFactorEnabled: 8,
          lastWeekLogins: 45,
          securityIncidents: 0,
        });

        // Mock admin users
        const mockAdmins: AdminUser[] = [
          {
            id: 'admin_001',
            name: 'John Smith',
            email: 'john.smith@tap2go.com',
            role: 'super_admin',
            status: 'active',
            permissions: ['*'],
            lastLogin: '2024-02-12T10:30:00Z',
            loginCount: 247,
            twoFactorEnabled: true,
            createdAt: '2024-01-01T00:00:00Z',
            createdBy: 'System',
            department: 'Engineering',
            phone: '+1-555-0123',
            sessionInfo: {
              currentSessions: 2,
              lastIpAddress: '192.168.1.100',
              lastUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            },
          },
          {
            id: 'admin_002',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@tap2go.com',
            role: 'admin',
            status: 'active',
            permissions: ['users:manage', 'orders:manage', 'vendors:manage', 'reports:view'],
            lastLogin: '2024-02-12T09:45:00Z',
            loginCount: 189,
            twoFactorEnabled: true,
            createdAt: '2024-01-15T10:00:00Z',
            createdBy: 'john.smith@tap2go.com',
            department: 'Operations',
            phone: '+1-555-0456',
            sessionInfo: {
              currentSessions: 1,
              lastIpAddress: '10.0.0.25',
              lastUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
          },
          {
            id: 'admin_003',
            name: 'Mike Chen',
            email: 'mike.chen@tap2go.com',
            role: 'manager',
            status: 'active',
            permissions: ['orders:view', 'vendors:view', 'reports:view', 'support:manage'],
            lastLogin: '2024-02-11T16:20:00Z',
            loginCount: 134,
            twoFactorEnabled: false,
            createdAt: '2024-01-20T11:30:00Z',
            createdBy: 'sarah.johnson@tap2go.com',
            department: 'Customer Success',
            phone: '+1-555-0789',
            sessionInfo: {
              currentSessions: 0,
              lastIpAddress: '172.16.0.50',
              lastUserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
            },
          },
          {
            id: 'admin_004',
            name: 'Lisa Rodriguez',
            email: 'lisa.rodriguez@tap2go.com',
            role: 'support',
            status: 'active',
            permissions: ['support:view', 'orders:view', 'users:view'],
            lastLogin: '2024-02-12T08:15:00Z',
            loginCount: 98,
            twoFactorEnabled: true,
            createdAt: '2024-02-01T09:00:00Z',
            createdBy: 'mike.chen@tap2go.com',
            department: 'Customer Support',
            phone: '+1-555-0321',
            sessionInfo: {
              currentSessions: 1,
              lastIpAddress: '203.0.113.42',
              lastUserAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
            },
          },
          {
            id: 'admin_005',
            name: 'David Kim',
            email: 'david.kim@tap2go.com',
            role: 'admin',
            status: 'inactive',
            permissions: ['analytics:view', 'reports:manage', 'vendors:manage'],
            lastLogin: '2024-02-08T14:30:00Z',
            loginCount: 67,
            twoFactorEnabled: true,
            createdAt: '2024-01-25T12:00:00Z',
            createdBy: 'john.smith@tap2go.com',
            department: 'Analytics',
            phone: '+1-555-0654',
            sessionInfo: {
              currentSessions: 0,
              lastIpAddress: '198.51.100.25',
              lastUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
          },
          {
            id: 'admin_006',
            name: 'Emma Wilson',
            email: 'emma.wilson@tap2go.com',
            role: 'manager',
            status: 'pending',
            permissions: ['orders:view', 'vendors:view', 'marketing:manage'],
            lastLogin: '',
            loginCount: 0,
            twoFactorEnabled: false,
            createdAt: '2024-02-10T15:45:00Z',
            createdBy: 'sarah.johnson@tap2go.com',
            department: 'Marketing',
            phone: '+1-555-0987',
            sessionInfo: {
              currentSessions: 0,
              lastIpAddress: '',
              lastUserAgent: '',
            },
          },
        ];

        setAdmins(mockAdmins);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleStyles = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-blue-100 text-blue-800',
      manager: 'bg-purple-100 text-purple-800',
      support: 'bg-green-100 text-green-800',
    };

    const roleLabels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      support: 'Support',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleStyles[role as keyof typeof roleStyles] || roleStyles.support}`}>
        {roleLabels[role as keyof typeof roleLabels] || role}
      </span>
    );
  };

  const getOnlineStatus = (currentSessions: number) => {
    return currentSessions > 0 ? (
      <div className="flex items-center">
        <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
        <span className="text-sm text-green-600">Online</span>
      </div>
    ) : (
      <div className="flex items-center">
        <div className="h-2 w-2 bg-gray-400 rounded-full mr-2"></div>
        <span className="text-sm text-gray-500">Offline</span>
      </div>
    );
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Admin Accounts</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage administrator accounts, roles, and permissions.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center text-sm">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export List
          </button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Invite Admin
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCircleIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
              <p className="text-sm text-blue-600">
                {stats.activeAdmins} active
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
              <p className="text-sm font-medium text-gray-500">Online Now</p>
              <p className="text-2xl font-bold text-gray-900">{stats.onlineAdmins}</p>
              <p className="text-sm text-green-600">
                Currently active
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">2FA Enabled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.twoFactorEnabled}</p>
              <p className="text-sm text-purple-600">
                {((stats.twoFactorEnabled / stats.totalAdmins) * 100).toFixed(0)}% coverage
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
              <p className="text-sm font-medium text-gray-500">Pending Invites</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingInvites}</p>
              <p className="text-sm text-orange-600">
                Awaiting response
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Administrator Accounts</h3>
          <p className="text-sm text-gray-600">Manage admin users and their access permissions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2FA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserCircleIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                        <div className="text-sm text-gray-500">{admin.email}</div>
                        {getOnlineStatus(admin.sessionInfo.currentSessions)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(admin.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{admin.department}</div>
                    <div className="text-sm text-gray-500">{admin.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(admin.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {admin.twoFactorEnabled ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(admin.lastLogin)}</div>
                    <div className="text-sm text-gray-500">{admin.loginCount} total logins</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-orange-600 hover:text-orange-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {admin.role !== 'super_admin' && (
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
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

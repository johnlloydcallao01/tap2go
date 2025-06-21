'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyIcon,
  ShieldCheckIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,

  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface AccessKey {
  id: string;
  name: string;
  key: string;
  type: 'api' | 'webhook' | 'integration' | 'service';
  scope: string[];
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt?: string;
  lastUsed?: string;
  usageCount: number;
  createdBy: string;
  description: string;
  ipRestrictions: string[];
  rateLimit: {
    requests: number;
    period: string;
    current: number;
  };
}

interface KeyStats {
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  revokedKeys: number;
  totalRequests: number;
  rateLimitHits: number;
  securityIncidents: number;
  lastKeyCreated: string;
}

export default function AccessKeysPage() {
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [stats, setStats] = useState<KeyStats>({
    totalKeys: 0,
    activeKeys: 0,
    expiredKeys: 0,
    revokedKeys: 0,
    totalRequests: 0,
    rateLimitHits: 0,
    securityIncidents: 0,
    lastKeyCreated: '',
  });
  const [showKeyValues, setShowKeyValues] = useState<{[key: string]: boolean}>({});


  useEffect(() => {
    const loadKeysData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock key statistics
        setStats({
          totalKeys: 18,
          activeKeys: 14,
          expiredKeys: 2,
          revokedKeys: 2,
          totalRequests: 1247563,
          rateLimitHits: 89,
          securityIncidents: 0,
          lastKeyCreated: '2024-02-10T15:30:00Z',
        });

        // Mock access keys
        const mockKeys: AccessKey[] = [
          {
            id: 'key_001',
            name: 'Production API Key',
            key: 'tap2go_prod_ak_1234567890abcdef1234567890abcdef',
            type: 'api',
            scope: ['orders:read', 'orders:write', 'users:read', 'payments:read'],
            status: 'active',
            createdAt: '2024-01-15T10:00:00Z',
            expiresAt: '2024-12-31T23:59:59Z',
            lastUsed: '2024-02-12T10:30:00Z',
            usageCount: 145678,
            createdBy: 'john.smith@tap2go.com',
            description: 'Main production API key for mobile application',
            ipRestrictions: ['203.0.113.0/24', '198.51.100.0/24'],
            rateLimit: {
              requests: 1000,
              period: 'hour',
              current: 247,
            },
          },
          {
            id: 'key_002',
            name: 'Webhook Integration Key',
            key: 'tap2go_whk_ak_abcdef1234567890abcdef1234567890',
            type: 'webhook',
            scope: ['webhooks:receive', 'events:process'],
            status: 'active',
            createdAt: '2024-01-20T11:30:00Z',
            lastUsed: '2024-02-12T10:28:00Z',
            usageCount: 34567,
            createdBy: 'sarah.johnson@tap2go.com',
            description: 'Webhook endpoint authentication for payment processing',
            ipRestrictions: ['192.0.2.0/24'],
            rateLimit: {
              requests: 2000,
              period: 'hour',
              current: 89,
            },
          },
          {
            id: 'key_003',
            name: 'Analytics Service Key',
            key: 'tap2go_svc_ak_fedcba0987654321fedcba0987654321',
            type: 'service',
            scope: ['analytics:read', 'reports:generate', 'data:export'],
            status: 'active',
            createdAt: '2024-02-01T08:00:00Z',
            lastUsed: '2024-02-12T09:45:00Z',
            usageCount: 8901,
            createdBy: 'mike.chen@tap2go.com',
            description: 'Internal analytics service authentication',
            ipRestrictions: ['10.0.0.0/8'],
            rateLimit: {
              requests: 500,
              period: 'hour',
              current: 23,
            },
          },
          {
            id: 'key_004',
            name: 'Third-party Integration',
            key: 'tap2go_int_ak_1122334455667788990011223344556',
            type: 'integration',
            scope: ['orders:read', 'vendors:read'],
            status: 'active',
            createdAt: '2024-01-25T14:20:00Z',
            expiresAt: '2024-07-25T14:20:00Z',
            lastUsed: '2024-02-11T16:15:00Z',
            usageCount: 12345,
            createdBy: 'lisa.rodriguez@tap2go.com',
            description: 'External partner integration for order management',
            ipRestrictions: ['203.0.113.42'],
            rateLimit: {
              requests: 200,
              period: 'hour',
              current: 45,
            },
          },
          {
            id: 'key_005',
            name: 'Development Testing Key',
            key: 'tap2go_dev_ak_test1234567890abcdeftest1234567890',
            type: 'api',
            scope: ['*'],
            status: 'active',
            createdAt: '2024-02-05T12:00:00Z',
            lastUsed: '2024-02-12T08:30:00Z',
            usageCount: 2456,
            createdBy: 'david.kim@tap2go.com',
            description: 'Development environment testing and debugging',
            ipRestrictions: ['192.168.0.0/16', '10.0.0.0/8'],
            rateLimit: {
              requests: 100,
              period: 'hour',
              current: 12,
            },
          },
          {
            id: 'key_006',
            name: 'Legacy System Key',
            key: 'tap2go_leg_ak_legacy123456789012345678901234567',
            type: 'api',
            scope: ['orders:read', 'users:read'],
            status: 'expired',
            createdAt: '2023-12-01T10:00:00Z',
            expiresAt: '2024-02-01T10:00:00Z',
            lastUsed: '2024-01-30T14:20:00Z',
            usageCount: 78901,
            createdBy: 'emma.wilson@tap2go.com',
            description: 'Legacy system integration (deprecated)',
            ipRestrictions: ['198.51.100.25'],
            rateLimit: {
              requests: 50,
              period: 'hour',
              current: 0,
            },
          },
        ];

        setKeys(mockKeys);
      } catch (error) {
        console.error('Error loading keys data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadKeysData();
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
      expired: 'bg-red-100 text-red-800',
      revoked: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeStyles = {
      api: 'bg-blue-100 text-blue-800',
      webhook: 'bg-purple-100 text-purple-800',
      integration: 'bg-green-100 text-green-800',
      service: 'bg-orange-100 text-orange-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyles[type as keyof typeof typeStyles] || typeStyles.api}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValues(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '•'.repeat(key.length - 12) + key.substring(key.length - 4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Access Keys</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage API keys, service tokens, and integration credentials.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center text-sm">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export Keys
          </button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Generate Key
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <KeyIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Keys</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalKeys}</p>
              <p className="text-sm text-blue-600">
                {stats.activeKeys} active
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">API Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
              <p className="text-sm text-green-600">
                Total processed
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
              <p className="text-sm font-medium text-gray-500">Rate Limit Hits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rateLimitHits}</p>
              <p className="text-sm text-orange-600">
                Last 24 hours
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
              <p className="text-sm font-medium text-gray-500">Expired Keys</p>
              <p className="text-2xl font-bold text-gray-900">{stats.expiredKeys}</p>
              <p className="text-sm text-purple-600">
                Need renewal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Access Keys Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Access Keys</h3>
          <p className="text-sm text-gray-600">Manage API keys and service authentication tokens</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{key.name}</div>
                      <div className="text-sm text-gray-500 font-mono flex items-center">
                        {showKeyValues[key.id] ? key.key : maskKey(key.key)}
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          {showKeyValues[key.id] ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(key.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{key.rateLimit.current}/{key.rateLimit.requests}</div>
                    <div className="text-sm text-gray-500">per {key.rateLimit.period}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(key.status)}
                      {isExpiringSoon(key.expiresAt) && (
                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(key.lastUsed || '')}</div>
                    <div className="text-sm text-gray-500">{key.usageCount.toLocaleString()} total</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {key.expiresAt ? formatDate(key.expiresAt) : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <ArrowPathIcon className="h-4 w-4" />
                      </button>
                      <button className="text-orange-600 hover:text-orange-900">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
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

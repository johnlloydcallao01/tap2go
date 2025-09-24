'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import {
  KeyIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  TrashIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface AccessKey {
  id: string;
  name: string;
  key: string;
  type: 'api' | 'webhook' | 'integration' | 'service';
  permissions: string[];
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  createdBy: string;
  lastUsed?: string;
  expiresAt?: string;
  usageCount: number;
  rateLimit: number;
  allowedIPs?: string[];
  description: string;
}

export default function AdminAccessKeys() {
  const [accessKeys] = useState<AccessKey[]>([
    {
      id: 'key_001',
      name: 'Production API Key',
      key: 'tap2go_live_ak_1234567890abcdef1234567890abcdef',
      type: 'api',
      permissions: ['orders:read', 'orders:write', 'restaurants:read', 'users:read'],
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'john.doe@tap2go.com',
      lastUsed: '2024-01-15T10:30:00Z',
      expiresAt: '2024-12-31T23:59:59Z',
      usageCount: 15420,
      rateLimit: 1000,
      allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
      description: 'Main production API key for mobile app integration',
    },
    {
      id: 'key_002',
      name: 'Webhook Endpoint Key',
      key: 'tap2go_webhook_wk_abcdef1234567890abcdef1234567890',
      type: 'webhook',
      permissions: ['webhooks:receive', 'orders:update'],
      status: 'active',
      createdAt: '2024-01-10T00:00:00Z',
      createdBy: 'jane.smith@tap2go.com',
      lastUsed: '2024-01-15T09:45:00Z',
      usageCount: 2340,
      rateLimit: 500,
      description: 'Webhook key for payment gateway notifications',
    },
    {
      id: 'key_003',
      name: 'Analytics Integration',
      key: 'tap2go_analytics_ik_fedcba0987654321fedcba0987654321',
      type: 'integration',
      permissions: ['analytics:read', 'reports:read'],
      status: 'active',
      createdAt: '2024-01-05T00:00:00Z',
      createdBy: 'mike.johnson@tap2go.com',
      lastUsed: '2024-01-14T18:20:00Z',
      usageCount: 890,
      rateLimit: 200,
      description: 'Integration key for business intelligence dashboard',
    },
    {
      id: 'key_004',
      name: 'Legacy Service Key',
      key: 'tap2go_legacy_sk_0123456789abcdef0123456789abcdef',
      type: 'service',
      permissions: ['orders:read'],
      status: 'revoked',
      createdAt: '2023-06-01T00:00:00Z',
      createdBy: 'system',
      lastUsed: '2023-12-15T09:45:00Z',
      usageCount: 45670,
      rateLimit: 100,
      description: 'Deprecated service key for old order management system',
    },
    {
      id: 'key_005',
      name: 'Development Testing',
      key: 'tap2go_dev_dk_9876543210fedcba9876543210fedcba',
      type: 'api',
      permissions: ['orders:read', 'restaurants:read'],
      status: 'expired',
      createdAt: '2023-12-01T00:00:00Z',
      createdBy: 'sarah.wilson@tap2go.com',
      lastUsed: '2024-01-01T00:00:00Z',
      expiresAt: '2024-01-01T23:59:59Z',
      usageCount: 156,
      rateLimit: 50,
      description: 'Temporary development key for testing new features',
    },
  ]);

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getStatusBadge = (status: AccessKey['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      revoked: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return badges[status];
  };

  const getStatusIcon = (status: AccessKey['status']) => {
    const icons = {
      active: ShieldCheckIcon,
      revoked: ExclamationTriangleIcon,
      expired: ClockIcon,
    };
    return icons[status];
  };

  const getTypeBadge = (type: AccessKey['type']) => {
    const badges = {
      api: 'bg-blue-100 text-blue-800',
      webhook: 'bg-purple-100 text-purple-800',
      integration: 'bg-green-100 text-green-800',
      service: 'bg-orange-100 text-orange-800',
    };
    return badges[type];
  };

  const activeKeys = accessKeys.filter(k => k.status === 'active').length;
  const totalUsage = accessKeys.reduce((sum, k) => sum + k.usageCount, 0);
  const revokedKeys = accessKeys.filter(k => k.status === 'revoked').length;
  const expiredKeys = accessKeys.filter(k => k.status === 'expired').length;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Access Keys</h1>
            <p className="text-sm lg:text-base text-gray-600">Manage API keys, webhooks, and integration access tokens.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Generate Key
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <KeyIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Keys</p>
                <p className="text-lg font-semibold text-gray-900">{activeKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-lg font-semibold text-gray-900">{totalUsage.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Revoked</p>
                <p className="text-lg font-semibold text-gray-900">{revokedKeys}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-lg font-semibold text-gray-900">{expiredKeys}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Access Keys List */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Access Keys ({accessKeys.length})</h3>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {accessKeys.map((accessKey) => {
                const StatusIcon = getStatusIcon(accessKey.status);

                return (
                  <div key={accessKey.id} className="border border-gray-200 rounded-lg p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <KeyIcon className="h-6 w-6 text-gray-400 mr-3" />
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{accessKey.name}</h4>
                          <p className="text-sm text-gray-500">{accessKey.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${getTypeBadge(accessKey.type)}`}>
                          {accessKey.type}
                        </span>
                        <div className="flex items-center">
                          <StatusIcon className="h-4 w-4 mr-1 text-gray-400" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(accessKey.status)}`}>
                            {accessKey.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Key Display */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Access Key</label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-50 rounded px-3 py-2 font-mono text-sm border">
                          {showKeys[accessKey.id] ? accessKey.key : '•'.repeat(accessKey.key.length)}
                        </div>
                        <button
                          onClick={() => toggleKeyVisibility(accessKey.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"
                        >
                          {showKeys[accessKey.id] ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(accessKey.key, accessKey.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"
                        >
                          {copiedKey === accessKey.id ? (
                            <CheckIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          )}
                        </button>
                        {accessKey.status === 'active' && (
                          <button className="p-2 text-red-400 hover:text-red-600 border border-gray-300 rounded">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                      <div className="flex flex-wrap gap-2">
                        {accessKey.permissions.map((permission) => (
                          <span
                            key={permission}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <div className="font-medium">{new Date(accessKey.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">by {accessKey.createdBy}</div>
                      </div>

                      <div>
                        <span className="text-gray-500">Last Used:</span>
                        <div className="font-medium">
                          {accessKey.lastUsed 
                            ? new Date(accessKey.lastUsed).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                        {accessKey.lastUsed && (
                          <div className="text-xs text-gray-400">
                            {new Date(accessKey.lastUsed).toLocaleTimeString()}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-gray-500">Usage Count:</span>
                        <div className="font-medium">{accessKey.usageCount.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Rate limit: {accessKey.rateLimit}/hour</div>
                      </div>

                      <div>
                        <span className="text-gray-500">Expires:</span>
                        <div className="font-medium">
                          {accessKey.expiresAt 
                            ? new Date(accessKey.expiresAt).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                        {accessKey.allowedIPs && (
                          <div className="text-xs text-gray-400">IP restricted</div>
                        )}
                      </div>
                    </div>

                    {/* IP Restrictions */}
                    {accessKey.allowedIPs && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed IP Addresses</label>
                        <div className="flex flex-wrap gap-2">
                          {accessKey.allowedIPs.map((ip, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded font-mono"
                            >
                              {ip}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Create Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New Access Key</h3>
              <p className="text-gray-600 mb-4">Access key generation functionality will be implemented here.</p>
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

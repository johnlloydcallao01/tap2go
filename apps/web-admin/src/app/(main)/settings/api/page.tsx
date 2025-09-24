'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import {
  CodeBracketIcon,
  KeyIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  status: 'active' | 'deprecated' | 'maintenance';
  version: string;
  rateLimit: number;
  authentication: 'required' | 'optional' | 'none';
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: 'active' | 'revoked';
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
}

export default function AdminAPIConfiguration() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const apiEndpoints: APIEndpoint[] = [
    {
      id: 'orders_list',
      name: 'List Orders',
      method: 'GET',
      endpoint: '/api/v1/orders',
      description: 'Retrieve a list of orders with filtering and pagination',
      status: 'active',
      version: 'v1',
      rateLimit: 1000,
      authentication: 'required',
    },
    {
      id: 'orders_create',
      name: 'Create Order',
      method: 'POST',
      endpoint: '/api/v1/orders',
      description: 'Create a new order',
      status: 'active',
      version: 'v1',
      rateLimit: 100,
      authentication: 'required',
    },
    {
      id: 'restaurants_list',
      name: 'List Restaurants',
      method: 'GET',
      endpoint: '/api/v1/restaurants',
      description: 'Retrieve a list of restaurants',
      status: 'active',
      version: 'v1',
      rateLimit: 500,
      authentication: 'optional',
    },
    {
      id: 'users_profile',
      name: 'User Profile',
      method: 'GET',
      endpoint: '/api/v1/users/profile',
      description: 'Get user profile information',
      status: 'active',
      version: 'v1',
      rateLimit: 200,
      authentication: 'required',
    },
  ];

  const apiKeys: APIKey[] = [
    {
      id: 'key_001',
      name: 'Production API Key',
      key: 'tap2go_live_sk_1234567890abcdef',
      permissions: ['orders:read', 'orders:write', 'restaurants:read', 'users:read'],
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      lastUsed: '2024-01-15T10:30:00Z',
      expiresAt: '2024-12-31T23:59:59Z',
    },
    {
      id: 'key_002',
      name: 'Development API Key',
      key: 'tap2go_test_sk_abcdef1234567890',
      permissions: ['orders:read', 'restaurants:read'],
      status: 'active',
      createdAt: '2024-01-10T00:00:00Z',
      lastUsed: '2024-01-14T15:20:00Z',
    },
    {
      id: 'key_003',
      name: 'Legacy API Key',
      key: 'tap2go_old_sk_fedcba0987654321',
      permissions: ['orders:read'],
      status: 'revoked',
      createdAt: '2023-06-01T00:00:00Z',
      lastUsed: '2023-12-15T09:45:00Z',
    },
  ];

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

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      deprecated: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-red-100 text-red-800',
      revoked: 'bg-gray-100 text-gray-800',
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const getMethodBadge = (method: string) => {
    const badges = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
    };
    return badges[method as keyof typeof badges] || badges.GET;
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">API Configuration</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage API endpoints, keys, and access controls.</p>
        </div>

        {/* API Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CodeBracketIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Endpoints</p>
                <p className="text-lg font-semibold text-gray-900">{apiEndpoints.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <KeyIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active API Keys</p>
                <p className="text-lg font-semibold text-gray-900">
                  {apiKeys.filter(k => k.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GlobeAltIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">API Version</p>
                <p className="text-lg font-semibold text-gray-900">v1.0</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Security</p>
                <p className="text-lg font-semibold text-gray-900">OAuth 2.0</p>
              </div>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">API Endpoints</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiEndpoints.map((endpoint) => (
                  <tr key={endpoint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CodeBracketIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
                          <div className="text-sm text-gray-500 font-mono">{endpoint.endpoint}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodBadge(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{endpoint.description}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {endpoint.rateLimit}/hour
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm capitalize ${
                        endpoint.authentication === 'required' ? 'text-red-600' :
                        endpoint.authentication === 'optional' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {endpoint.authentication}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(endpoint.status)}`}>
                        {endpoint.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
            <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 text-sm">
              Generate New Key
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <KeyIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{apiKey.name}</h4>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                          {apiKey.lastUsed && ` • Last used: ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(apiKey.status)}`}>
                      {apiKey.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-50 rounded px-3 py-2 font-mono text-sm">
                        {showKeys[apiKey.id] ? apiKey.key : '•'.repeat(apiKey.key.length)}
                      </div>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        {copiedKey === apiKey.id ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {apiKey.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">API Documentation</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Access comprehensive API documentation, code examples, and integration guides.
          </p>
          <div className="flex space-x-3">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm">
              View Documentation
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm">
              Download OpenAPI Spec
            </button>
          </div>
        </div>
      </div>
  );
}

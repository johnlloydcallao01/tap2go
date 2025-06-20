'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface APIKey {
  id: string;
  name: string;
  key: string;
  type: 'public' | 'private' | 'webhook';
  status: 'active' | 'inactive' | 'expired' | 'revoked' | 'deprecated';
  permissions: string[];
  rateLimit: {
    requests: number;
    period: string;
    current: number;
  };
  usage: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    lastUsed: string;
  };
  createdAt: string;
  expiresAt?: string;
  lastRotated?: string;
  environment: 'production' | 'staging' | 'development';
}

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'active' | 'inactive' | 'deprecated' | 'maintenance';
  version: string;
  description: string;
  rateLimit: number;
  authentication: 'required' | 'optional' | 'none';
  responseTime: number;
  uptime: number;
  totalRequests: number;
  errorRate: number;
}

interface APIStats {
  totalKeys: number;
  activeKeys: number;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  uptime: number;
  rateLimitHits: number;
  securityIncidents: number;
}

export default function APIConfigurationPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<APIStats>({
    totalKeys: 0,
    activeKeys: 0,
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
    uptime: 0,
    rateLimitHits: 0,
    securityIncidents: 0,
  });
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [showKeyValues, setShowKeyValues] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const loadAPIData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock API statistics
        setStats({
          totalKeys: 12,
          activeKeys: 10,
          totalRequests: 2847563,
          successRate: 99.2,
          avgResponseTime: 145,
          uptime: 99.9,
          rateLimitHits: 234,
          securityIncidents: 0,
        });

        // Mock API keys
        const mockAPIKeys: APIKey[] = [
          {
            id: 'key_001',
            name: 'Production API Key',
            key: 'tap2go_prod_sk_1234567890abcdef',
            type: 'private',
            status: 'active',
            permissions: ['orders:read', 'orders:write', 'users:read', 'payments:read'],
            rateLimit: {
              requests: 1000,
              period: 'hour',
              current: 247,
            },
            usage: {
              totalRequests: 145678,
              successfulRequests: 144892,
              failedRequests: 786,
              lastUsed: '2024-02-12T10:30:00Z',
            },
            createdAt: '2024-01-15T10:00:00Z',
            expiresAt: '2024-12-31T23:59:59Z',
            lastRotated: '2024-01-15T10:00:00Z',
            environment: 'production',
          },
          {
            id: 'key_002',
            name: 'Mobile App Public Key',
            key: 'tap2go_pub_pk_abcdef1234567890',
            type: 'public',
            status: 'active',
            permissions: ['restaurants:read', 'menu:read', 'orders:create'],
            rateLimit: {
              requests: 5000,
              period: 'hour',
              current: 1247,
            },
            usage: {
              totalRequests: 892456,
              successfulRequests: 891234,
              failedRequests: 1222,
              lastUsed: '2024-02-12T10:32:00Z',
            },
            createdAt: '2024-01-10T09:00:00Z',
            environment: 'production',
          },
          {
            id: 'key_003',
            name: 'Webhook Endpoint Key',
            key: 'tap2go_whk_wh_fedcba0987654321',
            type: 'webhook',
            status: 'active',
            permissions: ['webhooks:receive', 'events:process'],
            rateLimit: {
              requests: 2000,
              period: 'hour',
              current: 89,
            },
            usage: {
              totalRequests: 34567,
              successfulRequests: 34445,
              failedRequests: 122,
              lastUsed: '2024-02-12T10:28:00Z',
            },
            createdAt: '2024-01-20T11:30:00Z',
            environment: 'production',
          },
          {
            id: 'key_004',
            name: 'Development Testing Key',
            key: 'tap2go_dev_sk_test1234567890ab',
            type: 'private',
            status: 'active',
            permissions: ['*'],
            rateLimit: {
              requests: 100,
              period: 'hour',
              current: 23,
            },
            usage: {
              totalRequests: 5678,
              successfulRequests: 5456,
              failedRequests: 222,
              lastUsed: '2024-02-12T09:45:00Z',
            },
            createdAt: '2024-02-01T08:00:00Z',
            environment: 'development',
          },
          {
            id: 'key_005',
            name: 'Legacy Integration Key',
            key: 'tap2go_leg_sk_legacy123456789',
            type: 'private',
            status: 'deprecated',
            permissions: ['orders:read', 'users:read'],
            rateLimit: {
              requests: 500,
              period: 'hour',
              current: 12,
            },
            usage: {
              totalRequests: 78901,
              successfulRequests: 78234,
              failedRequests: 667,
              lastUsed: '2024-02-10T16:20:00Z',
            },
            createdAt: '2023-12-01T10:00:00Z',
            expiresAt: '2024-03-31T23:59:59Z',
            environment: 'production',
          },
        ];

        setApiKeys(mockAPIKeys);

        // Mock API endpoints
        const mockEndpoints: APIEndpoint[] = [
          {
            id: 'endpoint_001',
            name: 'Get Restaurants',
            path: '/api/v1/restaurants',
            method: 'GET',
            status: 'active',
            version: 'v1',
            description: 'Retrieve list of available restaurants',
            rateLimit: 1000,
            authentication: 'optional',
            responseTime: 120,
            uptime: 99.9,
            totalRequests: 456789,
            errorRate: 0.5,
          },
          {
            id: 'endpoint_002',
            name: 'Create Order',
            path: '/api/v1/orders',
            method: 'POST',
            status: 'active',
            version: 'v1',
            description: 'Create a new food delivery order',
            rateLimit: 500,
            authentication: 'required',
            responseTime: 250,
            uptime: 99.8,
            totalRequests: 234567,
            errorRate: 1.2,
          },
          {
            id: 'endpoint_003',
            name: 'Update Order Status',
            path: '/api/v1/orders/{id}/status',
            method: 'PATCH',
            status: 'active',
            version: 'v1',
            description: 'Update the status of an existing order',
            rateLimit: 200,
            authentication: 'required',
            responseTime: 95,
            uptime: 99.9,
            totalRequests: 123456,
            errorRate: 0.8,
          },
          {
            id: 'endpoint_004',
            name: 'Process Payment',
            path: '/api/v1/payments',
            method: 'POST',
            status: 'active',
            version: 'v1',
            description: 'Process payment for an order',
            rateLimit: 100,
            authentication: 'required',
            responseTime: 450,
            uptime: 99.7,
            totalRequests: 198765,
            errorRate: 2.1,
          },
          {
            id: 'endpoint_005',
            name: 'Get User Profile (Legacy)',
            path: '/api/v0/users/{id}',
            method: 'GET',
            status: 'deprecated',
            version: 'v0',
            description: 'Legacy endpoint for user profile data',
            rateLimit: 50,
            authentication: 'required',
            responseTime: 180,
            uptime: 98.5,
            totalRequests: 45678,
            errorRate: 3.2,
          },
          {
            id: 'endpoint_006',
            name: 'Webhook Receiver',
            path: '/api/webhooks/receive',
            method: 'POST',
            status: 'active',
            version: 'v1',
            description: 'Receive webhook notifications from external services',
            rateLimit: 2000,
            authentication: 'required',
            responseTime: 75,
            uptime: 99.9,
            totalRequests: 67890,
            errorRate: 0.3,
          },
        ];

        setEndpoints(mockEndpoints);
      } catch (error) {
        console.error('Error loading API data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAPIData();
  }, []);

  const formatDate = (dateString: string) => {
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
      deprecated: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-orange-100 text-orange-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getMethodBadge = (method: string) => {
    const methodStyles = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${methodStyles[method as keyof typeof methodStyles] || methodStyles.GET}`}>
        {method}
      </span>
    );
  };

  const getEnvironmentBadge = (environment: string) => {
    const envStyles = {
      production: 'bg-red-100 text-red-800',
      staging: 'bg-yellow-100 text-yellow-800',
      development: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${envStyles[environment as keyof typeof envStyles] || envStyles.development}`}>
        {environment.charAt(0).toUpperCase() + environment.slice(1)}
      </span>
    );
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeyValues(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const maskAPIKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '•'.repeat(key.length - 12) + key.substring(key.length - 4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">API Configuration</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage API keys, endpoints, webhooks, and monitor API performance.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center text-sm">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh Status
          </button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Generate API Key
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
              <p className="text-sm font-medium text-gray-500">Active API Keys</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeKeys}/{stats.totalKeys}</p>
              <p className="text-sm text-blue-600">
                {((stats.activeKeys / stats.totalKeys) * 100).toFixed(1)}% active
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <GlobeAltIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">API Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
              <p className="text-sm text-green-600">
                {stats.successRate}% success rate
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
              <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}ms</p>
              <p className="text-sm text-purple-600">
                {stats.uptime}% uptime
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Security Status</p>
              <p className="text-2xl font-bold text-gray-900">{stats.securityIncidents}</p>
              <p className="text-sm text-orange-600">
                Incidents today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">API Keys Management</h3>
          <p className="text-sm text-gray-600">Manage and monitor all API keys and their usage</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Environment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                      <div className="text-sm text-gray-500 font-mono flex items-center">
                        {showKeyValues[apiKey.id] ? apiKey.key : maskAPIKey(apiKey.key)}
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          {showKeyValues[apiKey.id] ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{apiKey.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEnvironmentBadge(apiKey.environment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{apiKey.rateLimit.current}/{apiKey.rateLimit.requests}</div>
                    <div className="text-sm text-gray-500">per {apiKey.rateLimit.period}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(apiKey.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(apiKey.usage.lastUsed)}
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

      {/* API Endpoints */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">API Endpoints</h3>
          <p className="text-sm text-gray-600">Monitor endpoint performance and status</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {endpoints.map((endpoint) => (
                <tr key={endpoint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{endpoint.name}</div>
                      <div className="text-sm text-gray-500 font-mono">{endpoint.path}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getMethodBadge(endpoint.method)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{endpoint.version}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{endpoint.responseTime}ms avg</div>
                    <div className="text-sm text-gray-500">{endpoint.uptime}% uptime</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(endpoint.status)}
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

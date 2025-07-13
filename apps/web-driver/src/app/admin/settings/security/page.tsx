'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,

  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'password_change' | 'api_access' | 'suspicious_activity' | 'data_export';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  details: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  timestamp: string;
  status: 'resolved' | 'investigating' | 'open' | 'dismissed';
}

interface SecuritySettings {
  twoFactorAuth: {
    enabled: boolean;
    enforced: boolean;
    methods: string[];
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
  };
  sessionManagement: {
    maxSessions: number;
    sessionTimeout: number;
    rememberMeDuration: number;
  };
  ipWhitelist: {
    enabled: boolean;
    addresses: string[];
  };
  auditLogging: {
    enabled: boolean;
    retentionDays: number;
    events: string[];
  };
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  failedLogins: number;
  activeUsers: number;
  secureConnections: number;
  vulnerabilities: number;
  lastSecurityScan: string;
  complianceScore: number;
}

export default function SecurityPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    failedLogins: 0,
    activeUsers: 0,
    secureConnections: 0,
    vulnerabilities: 0,
    lastSecurityScan: '',
    complianceScore: 0,
  });
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [settings] = useState<SecuritySettings>({
    twoFactorAuth: {
      enabled: true,
      enforced: false,
      methods: ['app', 'sms'],
    },
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90,
    },
    sessionManagement: {
      maxSessions: 3,
      sessionTimeout: 30,
      rememberMeDuration: 30,
    },
    ipWhitelist: {
      enabled: false,
      addresses: [],
    },
    auditLogging: {
      enabled: true,
      retentionDays: 365,
      events: ['login', 'logout', 'data_access', 'settings_change'],
    },
  });

  useEffect(() => {
    const loadSecurityData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock security statistics
        setStats({
          totalEvents: 1247,
          criticalEvents: 3,
          failedLogins: 23,
          activeUsers: 89,
          secureConnections: 99.8,
          vulnerabilities: 0,
          lastSecurityScan: '2024-02-12T06:00:00Z',
          complianceScore: 94.5,
        });

        // Mock security events
        const mockEvents: SecurityEvent[] = [
          {
            id: 'event_001',
            type: 'suspicious_activity',
            severity: 'high',
            user: {
              id: 'user_001',
              name: 'Unknown User',
              email: 'unknown@example.com',
              role: 'guest',
            },
            details: 'Multiple failed login attempts from unusual location',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            location: 'New York, US',
            timestamp: '2024-02-12T10:30:00Z',
            status: 'investigating',
          },
          {
            id: 'event_002',
            type: 'login',
            severity: 'low',
            user: {
              id: 'admin_001',
              name: 'John Admin',
              email: 'john@tap2go.com',
              role: 'admin',
            },
            details: 'Successful admin login',
            ipAddress: '10.0.0.5',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            location: 'San Francisco, US',
            timestamp: '2024-02-12T09:45:00Z',
            status: 'resolved',
          },
          {
            id: 'event_003',
            type: 'api_access',
            severity: 'medium',
            user: {
              id: 'api_user_001',
              name: 'API Service',
              email: 'api@tap2go.com',
              role: 'service',
            },
            details: 'Unusual API access pattern detected',
            ipAddress: '203.0.113.42',
            userAgent: 'Tap2Go-API-Client/1.0',
            location: 'London, UK',
            timestamp: '2024-02-12T08:20:00Z',
            status: 'open',
          },
          {
            id: 'event_004',
            type: 'password_change',
            severity: 'low',
            user: {
              id: 'user_456',
              name: 'Sarah Manager',
              email: 'sarah@tap2go.com',
              role: 'manager',
            },
            details: 'Password changed successfully',
            ipAddress: '172.16.0.10',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
            location: 'Los Angeles, US',
            timestamp: '2024-02-11T16:30:00Z',
            status: 'resolved',
          },
          {
            id: 'event_005',
            type: 'failed_login',
            severity: 'medium',
            user: {
              id: 'user_789',
              name: 'Mike Vendor',
              email: 'mike@restaurant.com',
              role: 'vendor',
            },
            details: 'Failed login attempt with incorrect password',
            ipAddress: '198.51.100.25',
            userAgent: 'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/109.0 Firefox/109.0',
            location: 'Chicago, US',
            timestamp: '2024-02-11T14:15:00Z',
            status: 'dismissed',
          },
        ];

        setSecurityEvents(mockEvents);
      } catch (error) {
        console.error('Error loading security data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSecurityData();
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

  const getSeverityBadge = (severity: string) => {
    const severityStyles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityStyles[severity as keyof typeof severityStyles] || severityStyles.low}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      resolved: 'bg-green-100 text-green-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      open: 'bg-red-100 text-red-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.open}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed_login':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'password_change':
        return <LockClosedIcon className="h-4 w-4 text-blue-500" />;
      case 'api_access':
        return <KeyIcon className="h-4 w-4 text-purple-500" />;
      case 'suspicious_activity':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />;
      case 'data_export':
        return <ArrowPathIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <EyeIcon className="h-4 w-4 text-gray-500" />;
    }
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
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Security Center</h1>
          <p className="text-sm lg:text-base text-gray-600">Monitor security events, manage policies, and ensure platform compliance.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center text-sm">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Run Security Scan
          </button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center text-sm">
            <BellIcon className="h-4 w-4 mr-2" />
            Security Alerts
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Security Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.complianceScore}%</p>
              <p className="text-sm text-green-600">
                Excellent security posture
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Critical Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.criticalEvents}</p>
              <p className="text-sm text-red-600">
                Require immediate attention
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              <p className="text-sm text-blue-600">
                Currently online
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <LockClosedIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed Logins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failedLogins}</p>
              <p className="text-sm text-purple-600">
                Last 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Events Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Security Events</h3>
          <p className="text-sm text-gray-600">Monitor and investigate security-related activities</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {securityEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getEventIcon(event.type)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{event.details}</div>
                        <div className="text-sm text-gray-500 capitalize">{event.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{event.user.name}</div>
                      <div className="text-sm text-gray-500">{event.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{event.location}</div>
                      <div className="text-sm text-gray-500">{event.ipAddress}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSeverityBadge(event.severity)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(event.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(event.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-orange-600 hover:text-orange-900">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Cog6ToothIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Authentication Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Two-Factor Authentication</span>
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Session Timeout</span>
                <span className="text-sm font-medium text-gray-900">{settings.sessionManagement.sessionTimeout} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Max Concurrent Sessions</span>
                <span className="text-sm font-medium text-gray-900">{settings.sessionManagement.maxSessions}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Password Policy</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Minimum Length</span>
                <span className="text-sm font-medium text-gray-900">{settings.passwordPolicy.minLength} characters</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Require Uppercase</span>
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Require Numbers</span>
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Password Expiry</span>
                <span className="text-sm font-medium text-gray-900">{settings.passwordPolicy.expiryDays} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

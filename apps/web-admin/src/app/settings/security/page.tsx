'use client';

// Demo-only security settings page - no actual authentication functionality
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,

  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'password_change' | 'api_access' | 'suspicious_activity';
  description: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'resolved' | 'investigating' | 'open';
}

interface ActiveSession {
  id: string;
  userEmail: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  ipAddress: string;
  location: string;
  lastActivity: string;
  loginTime: string;
  isCurrentSession: boolean;
}

export default function AdminSecurity() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    maxAge: 90,
  });

  const securityEvents: SecurityEvent[] = [
    {
      id: 'event_001',
      type: 'login',
      description: 'Successful admin login',
      userEmail: 'admin@tap2go.com',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Manila, Philippines',
      timestamp: '2024-01-15T10:30:00Z',
      severity: 'low',
      status: 'resolved',
    },
    {
      id: 'event_002',
      type: 'failed_login',
      description: 'Multiple failed login attempts',
      userEmail: 'unknown@example.com',
      ipAddress: '203.123.45.67',
      userAgent: 'curl/7.68.0',
      location: 'Unknown',
      timestamp: '2024-01-15T09:45:00Z',
      severity: 'high',
      status: 'investigating',
    },
    {
      id: 'event_003',
      type: 'api_access',
      description: 'Unusual API access pattern detected',
      userEmail: 'api@tap2go.com',
      ipAddress: '10.0.0.50',
      userAgent: 'TapGoApp/1.0',
      location: 'Cebu, Philippines',
      timestamp: '2024-01-15T08:20:00Z',
      severity: 'medium',
      status: 'open',
    },
  ];

  const activeSessions: ActiveSession[] = [
    {
      id: 'session_001',
      userEmail: 'admin@tap2go.com',
      deviceType: 'desktop',
      browser: 'Chrome 120.0',
      ipAddress: '192.168.1.100',
      location: 'Manila, Philippines',
      lastActivity: '2024-01-15T10:30:00Z',
      loginTime: '2024-01-15T08:00:00Z',
      isCurrentSession: true,
    },
    {
      id: 'session_002',
      userEmail: 'manager@tap2go.com',
      deviceType: 'mobile',
      browser: 'Safari 17.0',
      ipAddress: '192.168.1.101',
      location: 'Quezon City, Philippines',
      lastActivity: '2024-01-15T10:15:00Z',
      loginTime: '2024-01-15T09:30:00Z',
      isCurrentSession: false,
    },
  ];

  const getSeverityBadge = (severity: SecurityEvent['severity']) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return badges[severity];
  };

  const getSeverityIcon = (severity: SecurityEvent['severity']) => {
    const icons = {
      low: CheckCircleIcon,
      medium: ExclamationTriangleIcon,
      high: ExclamationTriangleIcon,
      critical: XCircleIcon,
    };
    return icons[severity];
  };

  const getEventTypeIcon = (type: SecurityEvent['type']) => {
    const icons = {
      login: CheckCircleIcon,
      failed_login: XCircleIcon,
      password_change: KeyIcon,
      api_access: ShieldCheckIcon,
      suspicious_activity: ExclamationTriangleIcon,
    };
    return icons[type];
  };

  const getDeviceIcon = (deviceType: ActiveSession['deviceType']) => {
    const icons = {
      desktop: ComputerDesktopIcon,
      mobile: DevicePhoneMobileIcon,
      tablet: DevicePhoneMobileIcon,
    };
    return icons[deviceType];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-sm lg:text-base text-gray-600">Manage security policies, monitor threats, and configure access controls.</p>
        </div>

        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-lg font-semibold text-gray-900">95%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-lg font-semibold text-gray-900">{activeSessions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Security Events</p>
                <p className="text-lg font-semibold text-gray-900">{securityEvents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <LockClosedIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">2FA Status</p>
                <p className="text-lg font-semibold text-gray-900">Enabled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow border p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Security Configuration</h3>
          
          <div className="space-y-6">
            {/* Demo Two-Factor Authentication Settings */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <KeyIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication (Demo)</p>
                  <p className="text-xs text-gray-500">Demo toggle - no actual 2FA functionality</p>
                </div>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  twoFactorEnabled ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Demo Password Policy Settings */}
            <div>
              <div className="flex items-center mb-4">
                <LockClosedIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Password Policy (Demo)</p>
                  <p className="text-xs text-gray-500">Demo settings - no actual password enforcement</p>
                </div>
              </div>
              
              <div className="ml-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Minimum Length
                    </label>
                    <input
                      type="number"
                      value={passwordPolicy.minLength}
                      onChange={(e) => setPasswordPolicy({
                        ...passwordPolicy,
                        minLength: parseInt(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Password Max Age (days)
                    </label>
                    <input
                      type="number"
                      value={passwordPolicy.maxAge}
                      onChange={(e) => setPasswordPolicy({
                        ...passwordPolicy,
                        maxAge: parseInt(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'requireUppercase', label: 'Uppercase' },
                    { key: 'requireLowercase', label: 'Lowercase' },
                    { key: 'requireNumbers', label: 'Numbers' },
                    { key: 'requireSymbols', label: 'Symbols' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={passwordPolicy[key as keyof typeof passwordPolicy] as boolean}
                        onChange={(e) => setPasswordPolicy({
                          ...passwordPolicy,
                          [key]: e.target.checked
                        })}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-xs text-gray-700">{label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Security Events */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Security Events (Demo)</h3>
            <p className="text-sm text-gray-500 mt-1">Demo security events - no actual monitoring</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {securityEvents.map((event) => {
                  const EventIcon = getEventTypeIcon(event.type);
                  const SeverityIcon = getSeverityIcon(event.severity);

                  return (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <EventIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{event.description}</div>
                            <div className="text-sm text-gray-500 capitalize">{event.type.replace('_', ' ')}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event.userEmail}</div>
                        <div className="text-sm text-gray-500">{event.ipAddress}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.location}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <SeverityIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getSeverityBadge(event.severity)}`}>
                            {event.severity}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          event.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          event.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {activeSessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceType);

                return (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <DeviceIcon className="h-8 w-8 text-gray-400 mr-4" />
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{session.userEmail}</span>
                          {session.isCurrentSession && (
                            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Current Session
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.browser} • {session.location}
                        </div>
                        <div className="text-xs text-gray-400">
                          Last active: {new Date(session.lastActivity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {!session.isCurrentSession && (
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        Terminate
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

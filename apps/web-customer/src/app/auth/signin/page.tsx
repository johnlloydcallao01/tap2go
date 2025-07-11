'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Shield, Truck, Eye, EyeOff } from 'lucide-react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [panelType, setPanelType] = useState<'customer' | 'vendor' | 'admin' | 'driver'>('customer');

  const { signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Detect panel type from environment variable (for local dev) or hostname
  useEffect(() => {
    // Check for forced panel type (for local development)
    const forcedPanel = process.env.NEXT_PUBLIC_FORCE_PANEL;
    if (forcedPanel && ['vendor', 'admin', 'driver', 'customer'].includes(forcedPanel)) {
      setPanelType(forcedPanel as 'vendor' | 'admin' | 'driver' | 'customer');
      return;
    }

    // Fallback to hostname detection (for production)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('tap2go-vendor') || hostname.startsWith('vendor.')) {
        setPanelType('vendor');
      } else if (hostname.includes('tap2go-admin') || hostname.startsWith('admin.')) {
        setPanelType('admin');
      } else if (hostname.includes('tap2go-driver') || hostname.startsWith('driver.')) {
        setPanelType('driver');
      } else {
        setPanelType('customer');
      }
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      // Validate user role against panel type
      if (panelType === 'vendor' && user.role !== 'vendor' && user.role !== 'admin') {
        setError('This portal is for restaurant partners only.');
        return;
      }
      if (panelType === 'admin' && user.role !== 'admin') {
        setError('This portal is for administrators only.');
        return;
      }
      if (panelType === 'driver' && user.role !== 'driver' && user.role !== 'admin') {
        setError('This portal is for delivery drivers only.');
        return;
      }

      // Redirect based on role
      switch (user.role) {
        case 'admin':
          router.replace('/admin/dashboard');
          break;
        case 'vendor':
          router.replace('/vendor/dashboard');
          break;
        case 'driver':
          router.replace('/driver/dashboard');
          break;
        default:
          router.replace('/');
          break;
      }
    }
  }, [user, authLoading, router, panelType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (authLoading) {
    const bgColor = panelType === 'vendor' ? 'from-orange-50 to-red-50' :
                   panelType === 'admin' ? 'from-blue-50 to-indigo-50' :
                   panelType === 'driver' ? 'from-green-50 to-emerald-50' :
                   'bg-gray-50';

    return (
      <div className={`min-h-screen bg-gradient-to-br ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Panel-specific styling
  const bgGradient = panelType === 'vendor' ? 'from-orange-50 to-red-50' :
                    panelType === 'admin' ? 'from-blue-50 to-indigo-50' :
                    panelType === 'driver' ? 'from-green-50 to-emerald-50' :
                    'from-gray-50 to-gray-100';

  const primaryColor = panelType === 'vendor' ? 'orange-600' :
                      panelType === 'admin' ? 'blue-600' :
                      panelType === 'driver' ? 'green-600' :
                      'orange-600';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg bg-${primaryColor}`}>
            {panelType === 'vendor' ? <Store className="w-10 h-10 text-white" /> :
             panelType === 'admin' ? <Shield className="w-10 h-10 text-white" /> :
             panelType === 'driver' ? <Truck className="w-10 h-10 text-white" /> :
             <span className="text-white font-bold text-2xl">T</span>}
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            {panelType === 'vendor' ? 'Welcome to Vendor Portal' :
             panelType === 'admin' ? 'Welcome to Admin Portal' :
             panelType === 'driver' ? 'Welcome to Driver Portal' :
             'Sign in to your account'}
          </h2>
          
          <p className="text-lg text-gray-600">
            {panelType === 'vendor' ? 'Manage your restaurant and track orders' :
             panelType === 'admin' ? 'Access platform management dashboard' :
             panelType === 'driver' ? 'Track deliveries and manage earnings' :
             'Welcome back to Tap2Go'}
          </p>
        </div>

        {/* Sign In Form */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {panelType === 'vendor' ? 'Restaurant Email' :
                   panelType === 'admin' ? 'Administrator Email' :
                   panelType === 'driver' ? 'Driver Email' :
                   'Email address'}
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm focus:ring-${primaryColor} focus:border-${primaryColor}`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm focus:ring-${primaryColor} focus:border-${primaryColor}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-${primaryColor} hover:bg-${primaryColor.replace('600', '700')} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${primaryColor.replace('600', '500')} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    panelType === 'vendor' ? 'Sign in to Dashboard' :
                    panelType === 'admin' ? 'Access Admin Dashboard' :
                    panelType === 'driver' ? 'Start Delivering' :
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Tap2Go. All rights reserved.
            {panelType !== 'customer' && (
              <span> | {panelType === 'vendor' ? 'Restaurant Partner Portal' :
                       panelType === 'admin' ? 'Administrator Portal' :
                       'Driver Portal'}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

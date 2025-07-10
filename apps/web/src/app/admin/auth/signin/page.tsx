'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Shield, ArrowLeft, Lock, Activity, Users } from 'lucide-react';

export default function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in with correct role
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        // User has wrong role for admin panel
        setError('This portal is for administrators only. Please use the correct login portal for your account type.');
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Auth context will handle the redirect based on user role
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tap2Go</h1>
                <p className="text-sm text-blue-600 font-medium">Admin Portal</p>
              </div>
            </div>
            <Link href="/" className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to main site
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome to Admin Portal
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Secure access to platform management and monitoring
          </p>
          
          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Secure Administrator Access</span>
            </div>
            <p className="text-xs text-blue-700">
              This portal is monitored and logged. Unauthorized access attempts are tracked.
            </p>
          </div>
          
          {/* Admin Features */}
          <div className="grid grid-cols-1 gap-3 text-left">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">User & vendor management</span>
            </div>
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Platform monitoring</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Security & compliance</span>
            </div>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-blue-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Administrator Email
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
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
                    placeholder="Enter your admin email"
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
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-600 focus:border-blue-600 sm:text-sm"
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

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Authenticating...
                    </div>
                  ) : (
                    'Access Admin Dashboard'
                  )}
                </button>
              </div>
            </form>

            {/* Security Footer */}
            <div className="mt-6">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    All admin activities are logged and monitored for security purposes.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Tap2Go. All rights reserved. | Administrator Portal
          </p>
        </div>
      </div>
    </div>
  );
}

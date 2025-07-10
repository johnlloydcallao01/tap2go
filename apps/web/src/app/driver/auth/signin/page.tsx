'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Truck, ArrowLeft, DollarSign, MapPin, Clock } from 'lucide-react';

export default function DriverSignIn() {
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
      if (user.role === 'driver') {
        router.replace('/driver/dashboard');
      } else if (user.role === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        // User has wrong role for driver panel
        setError('This portal is for delivery drivers only. Please use the correct login portal for your account type.');
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tap2Go</h1>
                <p className="text-sm text-green-600 font-medium">Driver Portal</p>
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
          <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome to Driver Portal
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Track deliveries, manage earnings, and optimize your routes
          </p>
          
          {/* Earnings Highlight */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Earn More with Tap2Go</span>
            </div>
            <p className="text-xs text-green-700">
              Competitive rates • Flexible hours • Weekly payouts
            </p>
          </div>
          
          {/* Driver Features */}
          <div className="grid grid-cols-1 gap-3 text-left">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Real-time delivery tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Earnings & performance insights</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Flexible scheduling</span>
            </div>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-green-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Driver Email
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
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                    placeholder="Enter your driver email"
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
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
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
                  <Link href="/auth/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Start Delivering'
                  )}
                </button>
              </div>
            </form>

            {/* Additional Info */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">New driver?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Want to become a delivery driver?{' '}
                  <Link href="/driver/register" className="font-medium text-green-600 hover:text-green-500">
                    Apply now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 Tap2Go. All rights reserved. | Driver Portal
          </p>
        </div>
      </div>
    </div>
  );
}

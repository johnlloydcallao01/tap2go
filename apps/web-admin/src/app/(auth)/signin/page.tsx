'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from '@/components/ui/ImageWrapper';
import { Eye, EyeOff, AlertCircle, Loader2, Users, BarChart3, Settings, ArrowLeft } from '@/components/ui/IconWrapper';
import { useAuth } from '@/hooks/useAuth';
import { PublicRoute } from '@/components/auth';
import { AuthenticationError } from '@/lib/auth';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const searchParams = useSearchParams();
  const { login, isLoading, error: authError, clearError } = useAuth();

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();

    try {
      await login({ email, password });

      if (redirectTo !== '/dashboard') {
        sessionStorage.setItem('auth:redirectAfterLogin', redirectTo);
      }
    } catch (err: unknown) {
      let errorMessage = 'Authentication failed. Please try again.';

      if (err instanceof AuthenticationError) {
        switch (err.type) {
          case 'ACCESS_DENIED':
            errorMessage = 'Access denied. Only administrators can access this application.';
            break;
          case 'INVALID_CREDENTIALS':
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case 'ACCOUNT_LOCKED':
            errorMessage = 'Account temporarily locked due to multiple failed attempts. Please try again later.';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'Network connection failed. Please check your internet connection and try again.';
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <div className="min-h-screen flex">
        {/* Left Side - Admin Branding (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #111827 0%, #1e293b 50%, #0f172a 100%)' }}>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')`,
            }}></div>
          </div>

          {/* Decorative accent glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 flex flex-col px-12 py-5 text-white w-full">
            <div className="max-w-md">
              {/* Logo & Brand */}
              <div className="mb-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                  <Image
                    src="/logo.png"
                    alt="Tap2Go Logo"
                    width={64}
                    height={64}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <h1 className="text-3xl font-bold mb-2">Tap2Go</h1>
                <p className="text-indigo-300 text-lg">Admin Panel</p>
              </div>

              {/* Tagline */}
              <p className="text-gray-300 text-base leading-relaxed mb-10 max-w-sm">
                Full platform control — manage users, monitor operations, and ensure everything runs smoothly.
              </p>

              {/* Features */}
              <div className="space-y-5">
                <div className="flex items-start space-x-4">
                  <div className="w-9 h-9 bg-indigo-500/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-500/20">
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">User Management</h3>
                    <p className="text-gray-400 text-sm">Manage customers, merchants, and admin accounts</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-9 h-9 bg-indigo-500/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-500/20">
                    <Settings className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">Content Control</h3>
                    <p className="text-gray-400 text-sm">Oversee platform content, menus, and categories</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-9 h-9 bg-indigo-500/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-500/20">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">Platform Analytics</h3>
                    <p className="text-gray-400 text-sm">Real-time insights across the entire platform</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-3/5 flex items-center justify-center px-4 py-8 lg:p-8">
          <div className="w-full max-w-lg md:max-w-xl">
            {/* Mobile Back Button */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {/* Desktop Header */}
              <div className="hidden lg:block text-center mb-8">
                <Image
                  src="/logo.png"
                  alt="Tap2Go Logo"
                  width={56}
                  height={56}
                  className="mx-auto mb-3"
                  style={{ objectFit: 'contain' }}
                />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-500">
                  Sign in to your admin dashboard
                </p>
              </div>

              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-6">
                <Image
                  src="/logo.png"
                  alt="Tap2Go Logo"
                  width={56}
                  height={56}
                  className="mx-auto mb-3"
                  style={{ objectFit: 'contain' }}
                />
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Welcome Back
                </h2>
                <p className="text-gray-500 text-sm">
                  Sign in to your admin dashboard
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400"
                    placeholder="admin@tap2go.com"
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                      disabled={isLoading}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <Link
                    href="/signin/forgot-password"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:scale-[1.01] flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Need help? Contact the platform owner
                </p>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
                &copy; 2025 Tap2Go. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <PublicRoute redirectTo="/dashboard">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </PublicRoute>
  );
}

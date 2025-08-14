'use client';

/**
 * Admin Login Form
 * Professional admin login form using shared components with admin-specific styling
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AuthContext';
import { useAuthForm, type AuthFormConfig } from '@tap2go/shared-ui';
import {
  UserIcon,
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface AdminLoginFormProps {
  onSwitchToSignup?: () => void;
}

export default function AdminLoginForm({ onSwitchToSignup }: AdminLoginFormProps) {
  const router = useRouter();
  const { loading, authError, clearError, signIn } = useAdminAuth();

  // Form configuration
  const formConfig: AuthFormConfig = {
    fields: [
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'Enter your admin email',
        autoComplete: 'email',
        validation: {
          required: true,
          email: true,
        },
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password',
        autoComplete: 'current-password',
        validation: {
          required: true,
          password: {
            minLength: 6,
          },
        },
      },
    ],
    submitButtonText: 'Sign In to Admin Panel',
    loadingText: 'Signing in...',
  };

  const {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
  } = useAuthForm(formConfig);

  // Handle form submission
  const onSubmit = async (data: { [key: string]: string }) => {
    try {
      await signIn(data.email, data.password);
      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (error) {
      // Error is already handled by the auth context
      console.error('Login failed:', error);
    }
  };

  // Clear auth error when form data changes
  React.useEffect(() => {
    if (authError) {
      clearError();
    }
  }, [formData, authError, clearError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>

      <div className="relative flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/3 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-40 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-start pt-16 px-12 xl:px-20">
            <div className="max-w-md">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ShieldCheckIcon className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-white">Tap2Go</h1>
                  <p className="text-blue-100 text-sm">Admin Portal</p>
                </div>
              </div>

              <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                Manage Your
                <span className="block text-blue-200">Food Delivery</span>
                <span className="block text-blue-300">Platform</span>
              </h2>

              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Access comprehensive administrative tools to manage restaurants, drivers, orders, and analytics in one powerful dashboard.
              </p>

              <div className="space-y-4">
                <div className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                  <span>Real-time order monitoring</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                  <span>Driver & restaurant management</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                  <span>Advanced analytics & reporting</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 lg:w-1/2 xl:w-1/3 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Tap2Go Admin</h1>
              <p className="text-slate-400">Sign in to your dashboard</p>
            </div>

            {/* Login Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="hidden lg:block text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-300">Sign in to your admin dashboard</p>
              </div>



              <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="space-y-6">
                {/* Global Error Message */}
                {authError && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ShieldCheckIcon className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-200">
                          Sign In Failed
                        </h3>
                        <div className="mt-1 text-sm text-red-300">
                          {authError}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearError}
                        className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter your admin email"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter your password"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading || isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign In to Admin Panel'
                  )}
                </button>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl backdrop-blur-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-200">
                        Secure Admin Access
                      </h3>
                      <div className="mt-2 text-sm text-blue-300">
                        <p>
                          This portal is restricted to authorized administrators. All access attempts are logged and monitored for security.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                {onSwitchToSignup && (
                  <div className="text-center">
                    <p className="text-sm text-slate-400">
                      Need an admin account?{' '}
                      <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Contact your administrator
                      </button>
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

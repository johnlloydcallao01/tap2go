'use client';

/**
 * Admin Signup Form
 * Note: In production, admin accounts are typically created by other admins
 * This form is provided for development/initial setup purposes
 */

import React from 'react';
import { useAdminAuth } from '@/contexts/AuthContext';
import { useAuthForm, type AuthFormConfig } from 'shared-ui';
import {
  UserIcon,
  KeyIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface AdminSignupFormProps {
  onSwitchToLogin?: () => void;
}

export default function AdminSignupForm({ onSwitchToLogin }: AdminSignupFormProps) {
  const { loading, authError, clearError } = useAdminAuth();

  // Form configuration
  const formConfig: AuthFormConfig = {
    fields: [
      {
        name: 'firstName',
        label: 'First Name',
        type: 'text',
        placeholder: 'Enter your first name',
        autoComplete: 'given-name',
        validation: {
          required: true,
          name: {
            minLength: 2,
            maxLength: 50,
            allowSpaces: false,
          },
        },
      },
      {
        name: 'lastName',
        label: 'Last Name',
        type: 'text',
        placeholder: 'Enter your last name',
        autoComplete: 'family-name',
        validation: {
          required: true,
          name: {
            minLength: 2,
            maxLength: 50,
            allowSpaces: false,
          },
        },
      },
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
        placeholder: 'Create a strong password',
        autoComplete: 'new-password',
        validation: {
          required: true,
          password: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumber: true,
          },
        },
      },
      {
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        placeholder: 'Confirm your password',
        autoComplete: 'new-password',
        validation: {
          required: true,
        },
      },
    ],
    submitButtonText: 'Create Admin Account',
    loadingText: 'Creating account...',
  };

  const {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    setFieldError,
  } = useAuthForm(formConfig);

  // Handle form submission
  const onSubmit = async (data: { [key: string]: string }) => {
    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
      setFieldError('confirmPassword', 'Passwords do not match');
      return;
    }

    try {
      // Note: In a real application, admin creation would be handled differently
      // This is just for demonstration purposes
      console.log('Admin signup attempt:', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
      
      // For now, just redirect to login
      alert('Admin account creation is restricted. Please contact your system administrator.');
      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    } catch (error) {
      console.error('Admin signup error:', error);
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
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/3 bg-gradient-to-br from-amber-600 via-orange-700 to-red-800 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-40 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
            <div className="max-w-md">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ShieldCheckIcon className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-white">Tap2Go</h1>
                  <p className="text-orange-100 text-sm">Admin Setup</p>
                </div>
              </div>

              <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                Join Our
                <span className="block text-orange-200">Administrative</span>
                <span className="block text-orange-300">Team</span>
              </h2>

              <p className="text-orange-100 text-lg mb-8 leading-relaxed">
                Request access to the Tap2Go administrative dashboard. Admin accounts require approval from existing administrators.
              </p>

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-200">
                      Development Mode
                    </h3>
                    <div className="mt-2 text-sm text-yellow-300">
                      <p>
                        In production, admin accounts are created by existing administrators. This form is for development purposes only.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex-1 lg:w-1/2 xl:w-1/3 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-600 rounded-2xl mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Tap2Go Admin</h1>
              <p className="text-slate-400">Request admin access</p>
            </div>

            {/* Signup Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="hidden lg:block text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Admin Account Request</h2>
                <p className="text-slate-300">Fill out the form to request access</p>
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
                          Account Creation Failed
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

                {/* Name Fields Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* First Name Field */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-200 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        required
                        value={formData.firstName || ''}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                        placeholder="First name"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-400">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name Field */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-200 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        required
                        value={formData.lastName || ''}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                        placeholder="Last name"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-400">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
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
                      autoComplete="new-password"
                      required
                      value={formData.password || ''}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Create a strong password"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword || ''}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Confirm your password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading || isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    'Request Admin Account'
                  )}
                </button>

                {/* Footer Link */}
                {onSwitchToLogin && (
                  <div className="text-center">
                    <p className="text-sm text-slate-400">
                      Already have an admin account?{' '}
                      <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="font-medium text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Sign in here
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

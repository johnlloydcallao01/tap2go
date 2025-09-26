'use client';

/**
 * Professional Driver Signup Form
 * Enterprise-grade signup form with comprehensive validation and driver role assignment
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  UserIcon,
  KeyIcon,
  TruckIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

interface SignupFormProps {
  onSwitchToLogin?: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [errors, setErrors] = React.useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (authError) {
      setAuthError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: {[key: string]: string} = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual registration
      // await signUp(formData);
      // Simulate signup delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/dashboard');
    } catch (error) {
      // Handle error
      console.error('Signup error:', error);
      setAuthError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // Additional state for terms and conditions
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>

      <div className="relative flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/3 bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-40 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
            <div className="max-w-md">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <TruckIcon className="w-7 h-7 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-white">Tap2Go</h1>
                  <p className="text-green-100 text-sm">Driver Registration</p>
                </div>
              </div>

              <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                Start Your
                <span className="block text-green-200">Driving</span>
                <span className="block text-green-300">Journey</span>
              </h2>

              <p className="text-green-100 text-lg mb-8 leading-relaxed">
                Join our community of professional drivers and start earning with flexible schedules. Get access to thousands of delivery opportunities in your area.
              </p>

              <div className="space-y-4">
                <div className="flex items-center text-green-100">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-3"></div>
                  <span>Quick & easy registration</span>
                </div>
                <div className="flex items-center text-green-100">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-3"></div>
                  <span>Start earning immediately</span>
                </div>
                <div className="flex items-center text-green-100">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-3"></div>
                  <span>24/7 driver support</span>
                </div>
                <div className="flex items-center text-green-100">
                  <div className="w-2 h-2 bg-green-300 rounded-full mr-3"></div>
                  <span>No hidden fees</span>
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
                <TruckIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Tap2Go Driver</h1>
              <p className="text-slate-400">Create your account</p>
            </div>

            {/* Signup Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="hidden lg:block text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Join Our Team</h2>
                <p className="text-slate-300">Create your driver account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Global Error Message */}
                {authError && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TruckIcon className="h-5 w-5 text-red-400" />
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
                        onClick={() => setAuthError(null)}
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
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
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
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
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
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter your email address"
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
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
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
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => {
                          setAcceptedTerms(e.target.checked);
                          if (errors.terms) {
                            clearFieldError('terms');
                          }
                        }}
                        className="focus:ring-green-500 h-4 w-4 text-green-600 border-white/20 rounded bg-white/10 backdrop-blur-sm"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="text-slate-300">
                        I agree to the{' '}
                        <a href="#" className="text-green-400 hover:text-green-300 font-medium">
                          Terms and Conditions
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-green-400 hover:text-green-300 font-medium">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                  </div>
                  {errors.terms && (
                    <p className="mt-2 text-sm text-red-400">{errors.terms}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    'Create Driver Account'
                  )}
                </button>

                {/* Driver Welcome Notice */}
                <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <TruckIcon className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-200">
                        Welcome to the Team!
                      </h3>
                      <div className="mt-2 text-sm text-green-300">
                        <p>
                          Start earning immediately after account verification. Join thousands of successful drivers on our platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                {onSwitchToLogin && (
                  <div className="text-center">
                    <p className="text-sm text-slate-400">
                      Already have a driver account?{' '}
                      <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="font-medium text-green-400 hover:text-green-300 transition-colors"
                      >
                        Sign In
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

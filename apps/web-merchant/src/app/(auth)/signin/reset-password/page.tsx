'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, AlertCircle, Loader2, CheckCircle, Eye, EyeOff, Lock } from '@/components/ui/IconWrapper';
import { PublicRoute } from '@/components/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const minLen = 8;
  const maxLen = 40;

  const checks = useMemo(() => {
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    const lenOk = newPassword.length >= minLen && newPassword.length <= maxLen;
    const match = newPassword.length > 0 && newPassword === confirmPassword;
    return { hasUpper, hasNumber, hasSpecial, lenOk, match };
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('token') || '';
      setToken(t);
    } catch {
      setToken('');
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('Invalid or expired reset link.');
      return;
    }
    if (!(checks.lenOk && checks.hasUpper && checks.hasNumber && checks.hasSpecial && checks.match)) {
      setError('Password must be 8-40 chars, include uppercase, number, special, and match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setMessage('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        try {
          const txt = await res.text();
          const data = txt ? JSON.parse(txt) : {};
          if (data?.errorCode === 'TOKEN_EXPIRED') {
            setError('Reset link expired. Please request a new link.');
          } else if (data?.errorCode === 'TOKEN_INVALID') {
            setError('Invalid reset link. Please request a new link.');
          } else if (data?.errorCode === 'PASSWORD_POLICY_FAILED') {
            setError('Password must be 8-40 chars, include uppercase, number, and special.');
          } else if (typeof data?.error === 'string') {
            setError(data.error);
          } else {
            setError('Invalid or expired reset link.');
          }
        } catch {
          setError('Invalid or expired reset link.');
        }
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicRoute redirectTo="/dashboard">
      <div className="min-h-screen w-full flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 flex flex-col justify-start pt-16 px-12 text-white">
            <div className="mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-xl border border-white/20">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold mb-5 leading-tight">
                Encreasl
              </h1>
              <p className="text-2xl text-red-100 mb-8">
                Learning Management System
              </p>
              <p className="text-lg text-red-200/80 leading-relaxed max-w-md">
                Access your learning dashboard and track your progress through our comprehensive training programs.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Reset Password Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4 shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Reset Password
              </h1>
              <p className="text-gray-600">
                Choose a new password for your account
              </p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
              <button
                type="button"
                onClick={() => router.push('/signin')}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Reset Password
              </h2>
              <p className="text-gray-600">
                Choose a new password for your account
              </p>
            </div>

            {/* Reset Password Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              {isSuccess ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-700">
                      Your password has been reset successfully. You can now sign in with your new password.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/signin')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-6">
                  {error && (
                    <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      <input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-500"
                        placeholder="Enter new password"
                        required
                        disabled={isSubmitting}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                        disabled={isSubmitting}
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

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-500"
                        placeholder="Confirm new password"
                        required
                        disabled={isSubmitting}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Password must:</p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li className={checks.lenOk ? 'text-green-600' : ''}>
                        Be between {minLen} and {maxLen} characters
                      </li>
                      <li className={checks.hasUpper ? 'text-green-600' : ''}>
                        Include at least one uppercase letter
                      </li>
                      <li className={checks.hasNumber ? 'text-green-600' : ''}>
                        Include at least one number
                      </li>
                      <li className={checks.hasSpecial ? 'text-green-600' : ''}>
                        Include at least one special character
                      </li>
                      <li className={checks.match ? 'text-green-600' : ''}>
                        Match the confirmation field
                      </li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
                © 2024 Encreasl Admin. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
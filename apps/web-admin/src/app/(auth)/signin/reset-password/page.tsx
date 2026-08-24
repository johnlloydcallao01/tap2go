'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/components/ui/ImageWrapper';
import { ArrowLeft, AlertCircle, Loader2, CheckCircle, Eye, EyeOff, Lock } from '@/components/ui/IconWrapper';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
        <div className="min-h-screen flex">
          {/* Left Side - Admin Branding (hidden on mobile) */}
          <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #111827 0%, #1e293b 50%, #0f172a 100%)' }}>
            <div className="absolute inset-0 opacity-[0.04]">
              <div className="absolute inset-0" style={{
                backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')`,
              }}></div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col px-12 py-5 text-white w-full">
              <div className="max-w-md">
                <div className="mb-10">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                    <Image src="/logo.png" alt="Tap2Go Logo" width={64} height={64} style={{ objectFit: 'contain' }} />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">Tap2Go</h1>
                  <p className="text-indigo-300 text-lg">Admin Panel</p>
                </div>
                <p className="text-gray-300 text-base leading-relaxed max-w-sm">
                  Full platform control — manage users, monitor operations, and ensure everything runs smoothly.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Reset Password Form */}
          <div className="w-full lg:w-3/5 flex items-center justify-center px-4 py-8 lg:p-8">
            <div className="w-full max-w-lg md:max-w-xl">
              {/* Mobile Header */}
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => router.push('/signin')}
                  className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Form Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                {/* Desktop Header */}
                <div className="hidden lg:block mb-8">
                  <button
                    type="button"
                    onClick={() => router.push('/signin')}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Reset Password
                  </h2>
                  <p className="text-gray-500">
                    Choose a new password for your account
                  </p>
                </div>

                {/* Mobile Header */}
                <div className="lg:hidden text-center mb-6">
                  <Image src="/logo.png" alt="Tap2Go Logo" width={56} height={56} className="mx-auto mb-3" style={{ objectFit: 'contain' }} />
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Reset Password
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Choose a new password for your account
                  </p>
                </div>

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
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReset} className="space-y-5">
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
                          className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400"
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
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                          className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400"
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
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-xs font-medium text-gray-600 mb-2">Password must:</p>
                      <ul className="space-y-1 text-xs text-gray-500">
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
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:scale-[1.01] flex items-center justify-center space-x-2"
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

              <div className="mt-8 text-center">
                <p className="text-xs text-gray-400">
                  &copy; 2025 Tap2Go. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}

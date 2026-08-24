'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from '@/components/ui/ImageWrapper';
import { ArrowLeft, AlertCircle, Loader2, CheckCircle, Mail } from '@/components/ui/IconWrapper';
import { PublicRoute } from '@/components/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.tap2goph.com/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setMessage('If an account exists, a password reset email has been sent.');
        setEmail('');
      } else {
        setMessage('If an account exists, a password reset email has been sent.');
      }
    } catch {
      setMessage('If an account exists, a password reset email has been sent.');
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

          {/* Right Side - Forgot Password Form */}
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
                    Forgot Password
                  </h2>
                  <p className="text-gray-500">
                    Enter your email to receive a password reset link
                  </p>
                </div>

                {/* Mobile Header */}
                <div className="lg:hidden text-center mb-6">
                  <Image src="/logo.png" alt="Tap2Go Logo" width={56} height={56} className="mx-auto mb-3" style={{ objectFit: 'contain' }} />
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Forgot Password
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Enter your email to receive a reset link
                  </p>
                </div>

                <form onSubmit={handleSend} className="space-y-5">
                  {error && (
                    <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {message && (
                    <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <p className="text-sm text-green-700">{message}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400"
                        placeholder="admin@tap2go.com"
                        required
                        disabled={isSubmitting}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:scale-[1.01] flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/signin')}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Remembered your password? Sign in
                  </button>
                </div>
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

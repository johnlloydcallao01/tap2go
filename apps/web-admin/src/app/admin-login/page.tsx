'use client';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function AdminLogin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Pre-filled with your admin credentials
  const [credentials, setCredentials] = useState({
    email: 'admin-1749452680368@tap2go.com',
    password: '123456'
  });

  // Redirect if already logged in as admin
  React.useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        // Already logged in as admin, redirect to admin panel
        router.replace('/admin');
      } else {
        // Logged in but not admin, redirect to home
        router.replace('/');
      }
    }
  }, [user, authLoading, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting admin login...');
      console.log(`Attempting login with: ${credentials.email}`);

      let userCredential;
      try {
        // Try to sign in with existing credentials
        userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
        console.log(`✅ Login successful with existing user: ${credentials.email}`);
      } catch (authError: unknown) {
        const errorCode = authError && typeof authError === 'object' && 'code' in authError ? authError.code : 'unknown';
        console.log(`❌ Firebase Auth failed with code:`, errorCode);

        // Handle specific error cases with clear messages
        if (errorCode === 'auth/user-not-found') {
          throw new Error('Admin account not found. Please contact system administrator.');
        } else if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
          throw new Error('Incorrect password. Please check your password and try again.');
        } else if (errorCode === 'auth/too-many-requests') {
          throw new Error('Too many failed login attempts. Please try again later or reset your password.');
        } else if (errorCode === 'auth/network-request-failed') {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else if (errorCode === 'auth/user-disabled') {
          throw new Error('This account has been disabled. Please contact support.');
        } else {
          throw new Error(`Authentication failed: ${authError instanceof Error ? authError.message : 'Unknown error'}`);
        }
      }

      const user = userCredential.user;
      console.log('👤 Authenticated user UID:', user.uid);
      console.log('👤 Authenticated user email:', user.email);

      // Check if user document exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      let userDoc;

      try {
        userDoc = await getDoc(userDocRef);
        console.log('📄 User document fetch result:', userDoc.exists());
      } catch (firestoreError) {
        console.error('❌ Error fetching user document:', firestoreError);
        throw new Error('Failed to access user database. Please try again.');
      }

      if (!userDoc.exists()) {
        console.log('📝 Creating user document in Firestore...');
        try {
          // Create user document with admin role
          const userData = {
            uid: user.uid,
            email: credentials.email,
            name: 'John Lloyd Callao',
            role: 'admin',
            isActive: true,
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date()
          };

          await setDoc(userDocRef, userData);
          console.log('✅ Created user document successfully');
        } catch (createDocError) {
          console.error('❌ Error creating user document:', createDocError);
          throw new Error('Failed to create user profile. Please try again.');
        }
      } else {
        console.log('📄 User document exists, checking role...');
        const userData = userDoc.data();
        console.log('👤 Current user role:', userData?.role);

        // Ensure user has admin role
        if (userData?.role !== 'admin') {
          console.log('🔄 Updating user role to admin...');
          try {
            await setDoc(userDocRef, {
              role: 'admin',
              email: credentials.email,
              name: 'John Lloyd Callao',
              isActive: true,
              isVerified: true,
              updatedAt: new Date(),
              lastLoginAt: new Date()
            }, { merge: true });
            console.log('✅ Updated user role to admin');
          } catch (updateError) {
            console.error('❌ Error updating user role:', updateError);
            throw new Error('Failed to update user permissions. Please try again.');
          }
        } else {
          // Update last login time
          try {
            await setDoc(userDocRef, {
              lastLoginAt: new Date(),
              updatedAt: new Date()
            }, { merge: true });
            console.log('✅ Updated last login time');
          } catch (updateError) {
            console.warn('⚠️ Could not update last login time:', updateError);
            // Don't throw error for this non-critical operation
          }
        }
      }

      // Check admin document
      const adminDocRef = doc(db, 'admins', user.uid);
      let adminDoc;

      try {
        adminDoc = await getDoc(adminDocRef);
        console.log('👑 Admin document fetch result:', adminDoc.exists());
      } catch (adminFetchError) {
        console.error('❌ Error fetching admin document:', adminFetchError);
        throw new Error('Failed to access admin database. Please try again.');
      }

      if (!adminDoc.exists()) {
        console.log('👑 Creating admin document...');
        try {
          const adminData = {
            userRef: `users/${user.uid}`,
            employeeId: 'ADMIN-001',
            fullName: 'John Lloyd Callao',
            department: 'technical',
            accessLevel: 'super_admin',
            permissions: [
              'manage_vendors',
              'handle_disputes',
              'view_analytics',
              'driver_verification',
              'system_config',
              'manage_admins',
              'manage_customers'
            ],
            assignedRegions: ['US', 'CA'],
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await setDoc(adminDocRef, adminData);
          console.log('✅ Created admin document successfully');
        } catch (createAdminError) {
          console.error('❌ Error creating admin document:', createAdminError);
          throw new Error('Failed to create admin profile. Please try again.');
        }
      } else {
        console.log('👑 Admin document already exists');
        // Update last access time
        try {
          await setDoc(adminDocRef, {
            updatedAt: new Date()
          }, { merge: true });
          console.log('✅ Updated admin last access time');
        } catch (updateAdminError) {
          console.warn('⚠️ Could not update admin last access time:', updateAdminError);
          // Don't throw error for this non-critical operation
        }
      }

      console.log('🎉 Admin login successful! Redirecting to admin panel...');

      // Small delay to ensure all Firestore operations complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force a page refresh to update auth context
      window.location.href = '/admin';

    } catch (error: unknown) {
      console.error('❌ Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to login as admin';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is already authenticated (will redirect)
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to bottom right, #fef3e2, #fed7aa)' }}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f3a823' }}>
            <ShieldCheckIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Tap2Go Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Super Admin Access Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleAdminLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Login Failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <UserIcon className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Admin Credentials Pre-filled
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    Your super admin credentials are ready to use.
                  </div>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter admin email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#f3a823',
                '--tw-ring-color': '#f3a823'
              } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ef7b06'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3a823'}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Login as Super Admin'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This is your dedicated super admin login portal.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              After login, you&apos;ll have full administrative access to Tap2Go.
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            🔒 Secure admin access • Change password after first login
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Pre-filled with your admin credentials
  const [credentials, setCredentials] = useState({
    email: 'johnlloydcallao@gmail.com',
    password: '123456'
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting admin login...');
      
      // Try multiple possible email variations
      const emailsToTry = [
        credentials.email,
        'admin-1748557049871@tap2go.com', // The temporary email created
        'admin@tap2go.com'
      ];
      
      let userCredential = null;
      let usedEmail = '';
      
      for (const email of emailsToTry) {
        try {
          console.log(`Trying email: ${email}`);
          userCredential = await signInWithEmailAndPassword(auth, email, credentials.password);
          usedEmail = email;
          console.log(`✅ Login successful with: ${email}`);
          break;
        } catch (authError: any) {
          console.log(`❌ Failed with ${email}:`, authError.code);
          continue;
        }
      }
      
      if (!userCredential) {
        throw new Error('Unable to login with any known admin credentials');
      }
      
      const user = userCredential.user;
      console.log('👤 User UID:', user.uid);
      
      // Check if user document exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log('📝 Creating user document...');
        // Create user document with admin role
        const userData = {
          uid: user.uid,
          email: credentials.email, // Use the desired email
          name: 'John Lloyd Callao',
          role: 'admin',
          isActive: true,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(userDocRef, userData);
        console.log('✅ Created user document');
      } else {
        console.log('📄 User document exists');
        const userData = userDoc.data();
        
        // Ensure user has admin role
        if (userData.role !== 'admin') {
          console.log('🔄 Updating user role to admin...');
          await setDoc(userDocRef, { 
            role: 'admin',
            email: credentials.email,
            name: 'John Lloyd Callao',
            isActive: true,
            isVerified: true,
            updatedAt: new Date()
          }, { merge: true });
          console.log('✅ Updated user role');
        }
      }
      
      // Check admin document
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminDoc = await getDoc(adminDocRef);
      
      if (!adminDoc.exists()) {
        console.log('👑 Creating admin document...');
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
        console.log('✅ Created admin document');
      }
      
      console.log('🎉 Admin login successful! Redirecting to dashboard...');
      
      // Force a page refresh to update auth context
      window.location.href = '/admin/dashboard';
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Failed to login as admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center">
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              After login, you'll have full administrative access to Tap2Go.
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

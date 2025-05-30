'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser, getAdmin } from '@/lib/database/users';
import { useRouter } from 'next/navigation';

export default function TestAdminPage() {
  const [email, setEmail] = useState('admin@tap2go.com');
  const [password, setPassword] = useState('TempPassword123!');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    authUser: {
      uid: string;
      email: string | null;
      emailVerified: boolean;
    };
    userData: unknown;
    adminData: unknown;
  } | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const testAdminLogin = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userData = await getUser(user.uid);

      // Get admin data from Firestore
      const adminData = await getAdmin(user.uid);

      setResult({
        authUser: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        },
        userData,
        adminData
      });

      console.log('Login successful!', { userData, adminData });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Admin Login</h1>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="admin@tap2go.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="TempPassword123!"
              />
            </div>
          </div>

          <button
            onClick={testAdminLogin}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing Login...' : 'Test Admin Login'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-semibold text-green-700">✅ Login Successful!</h2>

              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="font-medium text-green-800 mb-2">Firebase Auth User:</h3>
                <pre className="text-xs text-green-700 overflow-x-auto">
                  {JSON.stringify(result.authUser, null, 2)}
                </pre>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-800 mb-2">User Document (users collection):</h3>
                <pre className="text-xs text-blue-700 overflow-x-auto">
                  {JSON.stringify(result.userData, null, 2)}
                </pre>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <h3 className="font-medium text-purple-800 mb-2">Admin Document (admins collection):</h3>
                <pre className="text-xs text-purple-700 overflow-x-auto">
                  {JSON.stringify(result.adminData, null, 2)}
                </pre>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Go to Admin Dashboard
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                >
                  Back to Homepage
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-800 mb-2">Test Information:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• This page tests the admin login functionality</li>
              <li>• Default admin email: admin@tap2go.com</li>
              <li>• Default password: TempPassword123!</li>
              <li>• Tests both Firebase Auth and Firestore data retrieval</li>
              <li>• Shows user and admin documents from the database</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

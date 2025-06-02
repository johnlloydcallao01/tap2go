'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSSRSafeAuthState } from '@/hooks/useSSRSafeAuth';
import { useLoading } from '@/components/loading/LoadingProvider';
import { LoadingWrapper } from '@/components/loading/LoadingProvider';
import Header from '@/components/Header';
import MobileFooterNav from '@/components/MobileFooterNav';

export default function TestAuthPage() {
  const { signIn, signOut } = useAuth();
  const ssrSafeAuth = useSSRSafeAuthState();
  const { user, loading, isHydrated, canShowAuthContent } = ssrSafeAuth;
  const { withAuthLoading, isAuthLoading } = useLoading();

  const [testCredentials, setTestCredentials] = useState({
    email: 'johnlloydcallao@gmail.com',
    password: '123456'
  });
  const [error, setError] = useState('');

  const handleTestSignIn = async () => {
    setError('');

    try {
      await withAuthLoading(async () => {
        await signIn(testCredentials.email, testCredentials.password);
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    }
  };

  const handleSignOut = async () => {
    try {
      await withAuthLoading(async () => {
        await signOut();
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      
      <div className="container-custom py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test Page</h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Auth State</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Hydrated:</span>
                <span className={`px-2 py-1 rounded text-sm ${isHydrated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {isHydrated ? 'True' : 'False'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Loading:</span>
                <span className={`px-2 py-1 rounded text-sm ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {loading ? 'True' : 'False'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">User:</span>
                <span className={`px-2 py-1 rounded text-sm ${user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Can Show Auth Content:</span>
                <span className={`px-2 py-1 rounded text-sm ${canShowAuthContent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {canShowAuthContent ? 'True' : 'False'}
                </span>
              </div>
              
              {user && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Role:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'vendor' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'driver' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">User ID:</span>
                    <span className="text-gray-900 font-mono text-sm">{user.id}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {!user && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Sign In</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={testCredentials.email}
                    onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={testCredentials.password}
                    onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <LoadingWrapper isLoading={isAuthLoading} variant="overlay">
                  <button
                    onClick={handleTestSignIn}
                    disabled={isAuthLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    {isAuthLoading ? 'Signing In...' : 'Test Sign In'}
                  </button>
                </LoadingWrapper>
              </div>
            </div>
          )}

          {user && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              
              <div className="space-y-3">
                <LoadingWrapper isLoading={isAuthLoading} variant="overlay">
                  <button
                    onClick={handleSignOut}
                    disabled={isAuthLoading}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                  >
                    {isAuthLoading ? 'Signing Out...' : 'Sign Out'}
                  </button>
                </LoadingWrapper>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  Test Page Refresh (Should NOT show layout shift)
                </button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">SSR & Hydration Testing</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li>• ✅ Sign in with the admin credentials</li>
              <li>• ✅ Refresh the page - should NOT see any layout shift or hydration errors</li>
              <li>• ✅ Open a new tab to this page - should show authenticated state immediately</li>
              <li>• ✅ Navigate to different pages - header should show correct auth state</li>
              <li>• ✅ Sign out and verify the state updates immediately across all tabs</li>
              <li>• ✅ Check browser console - should be NO hydration mismatch errors</li>
              <li>• ✅ Test with disabled JavaScript - should show loading state gracefully</li>
            </ul>

            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded">
              <p className="text-green-800 text-sm font-medium">
                🎉 Hydration Fixed: Server and client now render identical content!
              </p>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">🎨 Facebook-Style Splash Screen</h3>
            <div className="text-orange-800 space-y-2 text-sm">
              <p>• 🛡️ <strong>No Layout Shifts</strong>: Splash screen prevents any layout shifts</p>
              <p>• 🎨 <strong>Facebook-Style</strong>: Dark gradient background with centered Tap2Go logo</p>
              <p>• ⚡ <strong>Smart Timing</strong>: Shows until auth state is fully resolved</p>
              <p>• 💎 <strong>Professional</strong>: Branded experience with smooth fade animations</p>
              <p>• 🎯 <strong>Universal</strong>: Works for both logged in and logged out users</p>
              <p>• 🔄 <strong>Seamless</strong>: Smooth transition to correct auth state</p>
            </div>

            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded">
              <p className="text-green-800 text-sm font-medium">
                ✅ Layout Shift Fixed: Splash screen acts as visual buffer like Facebook!
              </p>
            </div>

            <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded">
              <p className="text-blue-800 text-sm">
                <strong>How it works:</strong> Splash screen shows until authentication is resolved,
                then smoothly transitions to the correct authenticated/non-authenticated state.
              </p>
            </div>
          </div>
        </div>
      </div>

      <MobileFooterNav />
    </div>
  );
}

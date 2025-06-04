'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSSRSafeAuthState } from '@/hooks/useSSRSafeAuth';
import Header from '@/components/Header';
import MobileFooterNav from '@/components/MobileFooterNav';

export default function TestAuthFlowPage() {
  const auth = useAuth();
  const ssrSafeAuth = useSSRSafeAuthState();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testSignIn = async () => {
    try {
      addTestResult('🔄 Starting sign in test...');
      await auth.signIn('johnlloydcallao@gmail.com', '123456');
      addTestResult('✅ Sign in successful!');
    } catch (error) {
      addTestResult(`❌ Sign in failed: ${error}`);
    }
  };

  const testSignOut = async () => {
    try {
      addTestResult('🔄 Starting sign out test...');
      await auth.signOut();
      addTestResult('✅ Sign out successful!');
    } catch (error) {
      addTestResult(`❌ Sign out failed: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              🧪 Authentication Flow Test
            </h1>
            
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                ✅ Authentication Fixes Applied:
              </h2>
              <ul className="text-green-700 space-y-2">
                <li>✅ <strong>Splash Screen</strong> - Now waits for actual auth resolution, not arbitrary timing</li>
                <li>✅ <strong>SSR-Safe Auth</strong> - Fixed to prevent layout shifts during hydration</li>
                <li>✅ <strong>Header Component</strong> - Shows loading state instead of flashing login/signup buttons</li>
                <li>✅ <strong>Professional Loading</strong> - Consistent loading states across all components</li>
                <li>✅ <strong>No Layout Shifts</strong> - Users won't see login buttons if they're already authenticated</li>
              </ul>
            </div>

            {/* Current Auth State */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Current Authentication State:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Raw Auth Context:</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>User:</strong> {auth.user ? auth.user.email : 'null'}</p>
                    <p><strong>Loading:</strong> {auth.loading ? 'true' : 'false'}</p>
                    <p><strong>Is Initialized:</strong> {(auth as any).isInitialized ? 'true' : 'false'}</p>
                  </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">SSR-Safe Auth State:</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>User:</strong> {ssrSafeAuth.user ? ssrSafeAuth.user.email : 'null'}</p>
                    <p><strong>Loading:</strong> {ssrSafeAuth.loading ? 'true' : 'false'}</p>
                    <p><strong>Is Hydrated:</strong> {ssrSafeAuth.isHydrated ? 'true' : 'false'}</p>
                    <p><strong>Is Initialized:</strong> {ssrSafeAuth.isInitialized ? 'true' : 'false'}</p>
                    <p><strong>Can Show User Content:</strong> {ssrSafeAuth.canShowUserContent ? 'true' : 'false'}</p>
                    <p><strong>Can Show Guest Content:</strong> {ssrSafeAuth.canShowGuestContent ? 'true' : 'false'}</p>
                    <p><strong>Should Wait For Auth:</strong> {ssrSafeAuth.shouldWaitForAuth ? 'true' : 'false'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Controls */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Test Authentication Flow:</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={testSignIn}
                  disabled={auth.loading}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                >
                  {auth.loading ? 'Processing...' : 'Test Sign In (Super Admin)'}
                </button>
                <button
                  onClick={testSignOut}
                  disabled={auth.loading}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                >
                  {auth.loading ? 'Processing...' : 'Test Sign Out'}
                </button>
                <button
                  onClick={clearResults}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Clear Results
                </button>
              </div>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Test Results:</h3>
                <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm mb-1 font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-800 mb-2">🧪 How to Test:</h4>
              <ol className="text-blue-700 list-decimal list-inside space-y-1">
                <li>Refresh this page and observe - no layout shifts should occur</li>
                <li>The splash screen should wait for auth resolution, not disappear after arbitrary time</li>
                <li>Header should show loading state, not flash login/signup buttons</li>
                <li>Test sign in/out to verify smooth transitions</li>
                <li>Open in new tab while logged in - should show authenticated state immediately</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <MobileFooterNav />
    </div>
  );
}

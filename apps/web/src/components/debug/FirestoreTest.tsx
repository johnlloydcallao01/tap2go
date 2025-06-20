'use client';

import React, { useState } from 'react';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function FirestoreTest() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testFirestoreAccess = async () => {
    setLoading(true);
    setTestResult('Testing Firestore access...\n');

    try {
      // Test 1: Read restaurants (public access)
      setTestResult(prev => prev + '✅ Testing public read (restaurants)...\n');
      const restaurantsRef = collection(db, 'restaurants');
      const restaurantsSnap = await getDocs(restaurantsRef);
      setTestResult(prev => prev + `✅ Public read successful: ${restaurantsSnap.size} restaurants found\n`);

      if (user) {
        // Test 2: Read user document
        setTestResult(prev => prev + '✅ Testing user document read...\n');
        const userRef = doc(db, 'users', user.id);
        const userSnap = await getDoc(userRef);
        setTestResult(prev => prev + `✅ User document read: ${userSnap.exists() ? 'exists' : 'not found'}\n`);

        // Test 3: Write test document
        setTestResult(prev => prev + '✅ Testing write access...\n');
        const testRef = collection(db, 'test');
        await addDoc(testRef, {
          message: 'Test from authenticated user',
          userId: user.id,
          timestamp: new Date()
        });
        setTestResult(prev => prev + '✅ Write test successful\n');

        setTestResult(prev => prev + '\n🎉 All Firestore tests passed! Permissions are working correctly.\n');
      } else {
        setTestResult(prev => prev + '\n⚠️ User not authenticated. Sign in to test write operations.\n');
      }

    } catch (error: unknown) {
      setTestResult(prev => prev + `\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      console.error('Firestore test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg p-4 max-w-md shadow-lg z-50">
      <h3 className="font-bold text-gray-800 mb-2">🔥 Firestore Test</h3>
      
      <button
        onClick={testFirestoreAccess}
        disabled={loading}
        className="mb-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Firestore Access'}
      </button>

      {testResult && (
        <div className="bg-gray-100 p-3 rounded text-sm font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
          {testResult}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-600">
        <strong>Status:</strong> {user ? `Signed in as ${user.email}` : 'Not signed in'}
      </div>
    </div>
  );
}

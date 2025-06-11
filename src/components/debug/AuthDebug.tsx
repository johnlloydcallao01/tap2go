'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { getIdToken, User } from 'firebase/auth';

export default function AuthDebug() {
  const { user, loading } = useAuth();
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [tokenClaims, setTokenClaims] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        try {
          const token = await getIdToken(user);
          setIdToken(token);
          
          // Decode token to see claims
          const payload = JSON.parse(atob(token.split('.')[1]));
          setTokenClaims(payload);
        } catch (error) {
          console.error('Error getting token:', error);
        }
      } else {
        setIdToken(null);
        setTokenClaims(null);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4 max-w-sm">
        <h3 className="font-bold text-yellow-800">🔍 Auth Debug</h3>
        <p className="text-yellow-700">Loading authentication...</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 max-w-sm shadow-lg z-50">
      <h3 className="font-bold text-gray-800 mb-2">🔍 Auth Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Context User:</strong> {user ? '✅ Logged in' : '❌ Not logged in'}
        </div>
        
        <div>
          <strong>Firebase User:</strong> {firebaseUser ? '✅ Authenticated' : '❌ Not authenticated'}
        </div>
        
        {user && (
          <div>
            <strong>Role:</strong> {user.role}
          </div>
        )}
        
        {firebaseUser && (
          <div>
            <strong>UID:</strong> {firebaseUser.uid.substring(0, 8)}...
          </div>
        )}
        
        <div>
          <strong>ID Token:</strong> {idToken ? '✅ Present' : '❌ Missing'}
        </div>
        
        {tokenClaims && (
          <div>
            <strong>Token Role:</strong> {(tokenClaims as { role?: string })?.role || 'No role claim'}
          </div>
        )}
        
        <div className="mt-2 pt-2 border-t border-gray-200">
          <strong>Firestore Access:</strong>
          <div className="text-xs text-gray-600">
            {firebaseUser && user ? '✅ Should work' : '❌ Will fail'}
          </div>
        </div>
      </div>
    </div>
  );
}

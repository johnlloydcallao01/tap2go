'use client';

import { useState, useEffect } from 'react';
import { MessagePayload } from 'firebase/messaging';
import { useFCM, useNotifications } from '@/hooks/useFCM';
import { useAuth } from '@/hooks/useAuth';

export default function TestNotificationsPage() {
  const { user } = useAuth();
  const {
    token,
    permission,
    isSupported,
    isLoading,
    error,
    requestPermission,
    generateToken,
    setupForegroundListener,
  } = useFCM();
  
  const {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  } = useNotifications();

  const [testResult, setTestResult] = useState<any>(null);

  // Setup foreground listener
  useEffect(() => {
    if (token) {
      setupForegroundListener((payload: MessagePayload) => {
        console.log('Foreground notification received:', payload);
        addNotification(payload);
        
        // Show browser notification if permission granted
        if (permission === 'granted') {
          new Notification(payload.notification?.title || 'Tap2Go Notification', {
            body: payload.notification?.body || 'You have a new notification',
            icon: '/favicon.ico',
            tag: 'tap2go-foreground',
          });
        }
      });
    }
  }, [token, permission, setupForegroundListener, addNotification]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted && user) {
      await generateToken();
    }
  };

  const sendTestNotification = async () => {
    if (!token) {
      setTestResult({ error: 'No FCM token generated yet' });
      return;
    }

    try {
      const userId = user?.uid || 'test_user_123';
      const response = await fetch('/api/test-fcm-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          type: 'test_notification',
        }),
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: 'Failed to send test notification' });
    }
  };

  // For testing, we'll show the interface even without authentication

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔔 Firebase Cloud Messaging Test
          </h1>

          {!user && (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Test Mode:</strong> Running without authentication. Using mock user ID: test_user_123
              </p>
            </div>
          )}

          {/* FCM Status */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">FCM Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-600">Browser Support:</p>
                <p className="font-semibold">{isSupported ? '✅ Supported' : '❌ Not Supported'}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Permission:</p>
                <p className="font-semibold">
                  {permission === 'granted' ? '✅ Granted' : 
                   permission === 'denied' ? '❌ Denied' : 
                   '⏳ Default'}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-600">FCM Token:</p>
                <p className="font-semibold">{token ? '✅ Generated' : '❌ Not Generated'}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Status:</p>
                <p className="font-semibold">
                  {isLoading ? '⏳ Loading...' : 
                   error ? '❌ Error' : 
                   '✅ Ready'}
                </p>
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mb-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Actions</h2>
            
            {permission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Requesting...' : 'Request Notification Permission'}
              </button>
            )}

            {permission === 'granted' && !token && (
              <button
                onClick={() => generateToken()}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate FCM Token'}
              </button>
            )}

            {token && (
              <button
                onClick={sendTestNotification}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg"
              >
                Send Test Notification
              </button>
            )}
          </div>

          {/* FCM Token Display */}
          {token && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">FCM Token:</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <code className="text-xs break-all">{token}</code>
              </div>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Test Result:</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm">{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Received Notifications */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Received Notifications ({notifications.length})</h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearNotifications}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <p className="text-gray-500 italic">No notifications received yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div key={index} className="bg-gray-50 border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {notification.notification?.title || 'No Title'}
                        </h4>
                        <p className="text-gray-600 mt-1">
                          {notification.notification?.body || 'No Body'}
                        </p>
                        {notification.data && (
                          <div className="mt-2 text-xs text-gray-500">
                            <strong>Data:</strong> {JSON.stringify(notification.data)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeNotification(index)}
                        className="text-gray-400 hover:text-gray-600 ml-4"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="font-semibold text-yellow-800 mb-2">📋 Testing Instructions:</h4>
            <ol className="text-yellow-700 text-sm space-y-1 list-decimal list-inside">
              <li>Click "Request Notification Permission" and allow notifications</li>
              <li>Generate FCM token (happens automatically after permission)</li>
              <li>Click "Send Test Notification" to test the complete flow</li>
              <li>Check both foreground and background notifications</li>
              <li>Test payment flow to see real notifications from webhooks</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

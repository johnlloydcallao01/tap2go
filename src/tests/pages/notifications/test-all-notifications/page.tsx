'use client';

import { useState } from 'react';
import { useFCM } from '@/hooks/useFCM';
import Link from 'next/link';

const notificationTypes = [
  {
    type: 'payment_success',
    title: '💰 Payment Success',
    description: 'Simulates successful payment notification',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    type: 'payment_failed',
    title: '❌ Payment Failed',
    description: 'Simulates failed payment notification',
    color: 'bg-red-500 hover:bg-red-600',
  },
  {
    type: 'order_confirmed',
    title: '✅ Order Confirmed',
    description: 'Simulates order confirmation notification',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    type: 'order_preparing',
    title: '👨‍🍳 Order Preparing',
    description: 'Simulates order being prepared notification',
    color: 'bg-yellow-500 hover:bg-yellow-600',
  },
  {
    type: 'order_ready',
    title: '🍽️ Order Ready',
    description: 'Simulates order ready notification',
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    type: 'driver_assigned',
    title: '🚗 Driver Assigned',
    description: 'Simulates driver assignment notification',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    type: 'order_delivered',
    title: '🎉 Order Delivered',
    description: 'Simulates order delivery notification',
    color: 'bg-green-600 hover:bg-green-700',
  },
  {
    type: 'test_notification',
    title: '🔔 General Test',
    description: 'Simulates general test notification',
    color: 'bg-gray-500 hover:bg-gray-600',
  },
];

export default function TestAllNotificationsPage() {
  const { token, permission, requestPermission, generateToken } = useFCM();
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const sendNotification = async (type: string) => {
    if (!token) {
      alert('Please generate FCM token first!');
      return;
    }

    setLoading(type);
    try {
      const response = await fetch('/api/test-fcm-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test_user_123',
          type: type,
        }),
      });

      const result = await response.json();
      setResults(prev => ({ ...prev, [type]: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, [type]: { error: 'Failed to send notification' } }));
    } finally {
      setLoading(null);
    }
  };

  const setupFCM = async () => {
    const granted = await requestPermission();
    if (granted) {
      await generateToken();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link 
              href="/tests/dashboard" 
              className="text-orange-500 hover:text-orange-600 text-sm font-medium"
            >
              ← Back to Test Dashboard
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📱 Complete FCM Notification Testing
          </h1>

          {/* Test Category Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <div>
                <h3 className="text-red-900 font-semibold">Critical Test - HIGH Priority</h3>
                <p className="text-red-700 text-sm">
                  FCM notifications are essential for customer experience. Never disable in production.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              💸 Free Testing - No Payment Required!
            </h2>
            <p className="text-blue-700 mb-4">
              Test all notification types without spending any money. This simulates the complete 
              Tap2Go notification flow including payment success, order updates, and delivery notifications.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold text-blue-800">Permission:</p>
                <p>{permission === 'granted' ? '✅ Granted' : '❌ Not Granted'}</p>
              </div>
              <div>
                <p className="font-semibold text-blue-800">FCM Token:</p>
                <p>{token ? '✅ Generated' : '❌ Not Generated'}</p>
              </div>
              <div>
                <p className="font-semibold text-blue-800">Ready to Test:</p>
                <p>{token && permission === 'granted' ? '✅ Yes' : '❌ Setup Required'}</p>
              </div>
            </div>
          </div>

          {/* Setup Section */}
          {(!token || permission !== 'granted') && (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                🔧 Setup Required
              </h3>
              <p className="text-yellow-700 mb-4">
                Please set up FCM notifications before testing:
              </p>
              <button
                onClick={setupFCM}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg"
              >
                🔔 Setup FCM Notifications
              </button>
            </div>
          )}

          {/* Notification Tests Grid */}
          {token && permission === 'granted' && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                🎯 Test All Notification Types
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notificationTypes.map((notif) => (
                  <div key={notif.type} className="bg-gray-50 rounded-lg p-6 border">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {notif.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      {notif.description}
                    </p>
                    <button
                      onClick={() => sendNotification(notif.type)}
                      disabled={loading === notif.type}
                      className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors ${notif.color} disabled:opacity-50`}
                    >
                      {loading === notif.type ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </span>
                      ) : (
                        `Send ${notif.title}`
                      )}
                    </button>
                    
                    {/* Result Display */}
                    {results[notif.type] && (
                      <div className="mt-3 p-3 bg-white rounded border text-xs">
                        <pre className="text-gray-600 overflow-auto">
                          {JSON.stringify(results[notif.type], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-semibold text-green-800 mb-3">
              📋 Testing Instructions:
            </h4>
            <ol className="text-green-700 text-sm space-y-2 list-decimal list-inside">
              <li>Click "Setup FCM Notifications" and allow browser notifications</li>
              <li>Test different notification types by clicking the buttons above</li>
              <li>Check your browser for notification popups</li>
              <li>Each notification simulates a real Tap2Go event</li>
              <li>No payment required - all tests are free!</li>
            </ol>
            
            <div className="mt-4 p-3 bg-green-100 rounded">
              <p className="text-green-800 text-sm font-semibold">
                💡 Pro Tip: Keep this tab open and test notifications from different scenarios 
                to see how they would appear to customers, vendors, and drivers in real usage!
              </p>
            </div>
          </div>

          {/* FCM Token Display */}
          {token && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                🔑 Your FCM Token:
              </h4>
              <div className="bg-gray-100 p-4 rounded-lg">
                <code className="text-xs break-all text-gray-700">{token}</code>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                This token identifies your browser for push notifications. In production, 
                this would be stored securely in Firestore.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import Header from '@/components/Header';
import MobileFooterNav from '@/components/MobileFooterNav';
import { BellIcon, CheckCircleIcon, XCircleIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useFCM, useNotifications } from '@/hooks/useFCM';
import { MessagePayload } from 'firebase/messaging';

export default function NotificationsPage() {
  const { token, permission, generateToken, setupForegroundListener } = useFCM();
  const { notifications, addNotification, removeNotification, clearNotifications } = useNotifications();

  // Setup FCM when permission is granted
  useEffect(() => {
    if (permission === 'granted' && !token) {
      generateToken();
    }
  }, [permission, token, generateToken]);

  // Setup foreground listener
  useEffect(() => {
    if (token) {
      setupForegroundListener((payload: MessagePayload) => {
        console.log('Foreground notification received:', payload);
        addNotification(payload);
        
        // Show browser notification
        if (permission === 'granted' && 'Notification' in window) {
          new Notification(payload.notification?.title || 'Tap2Go', {
            body: payload.notification?.body || 'You have a new notification',
            icon: '/favicon.ico',
            tag: 'tap2go-notification',
          });
        }
      });
    }
  }, [token, permission, setupForegroundListener, addNotification]);

  const handleNotificationClick = (notification: MessagePayload, index: number) => {
    // Mark as read by removing from unread list
    removeNotification(index);
    
    // Handle different notification types
    if (notification.data?.type === 'payment_success') {
      // Could navigate to order details
      console.log('Payment success notification clicked');
    } else if (notification.data?.type === 'order_update') {
      // Could navigate to order tracking
      console.log('Order update notification clicked');
    }
  };

  const getNotificationIcon = (notification: MessagePayload) => {
    const type = notification.data?.type;
    
    switch (type) {
      case 'payment_success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'payment_failed':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'order_confirmed':
        return <CheckCircleIcon className="h-6 w-6 text-blue-500" />;
      case 'order_preparing':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'order_ready':
        return <BellSolidIcon className="h-6 w-6 text-orange-500" />;
      case 'order_out_for_delivery':
        return <TruckIcon className="h-6 w-6 text-purple-500" />;
      case 'order_delivered':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatNotificationTime = () => {
    // Since we don't have timestamp in the payload, we'll use current time
    // In a real app, you'd include timestamp in the notification data
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container-custom py-8 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h2>
              <p className="text-gray-600 mb-6">
                You&apos;ll see payment and order updates here when they arrive.
              </p>
              <Link
                href="/"
                className="btn-primary inline-block"
              >
                Browse Restaurants
              </Link>
            </div>
          ) : (
            /* Notifications List */
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  onClick={() => handleNotificationClick(notification, index)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification)}
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {notification.notification?.title || 'Notification'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.notification?.body || 'You have a new notification'}
                      </p>
                      
                      {/* Additional Data */}
                      {notification.data && Object.keys(notification.data).length > 0 && (
                        <div className="text-xs text-gray-500">
                          {notification.data.orderId && (
                            <span className="mr-4">Order: #{notification.data.orderId}</span>
                          )}
                          {notification.data.amount && (
                            <span className="mr-4">Amount: ₱{notification.data.amount}</span>
                          )}
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      <div className="text-xs text-gray-400 mt-2">
                        {formatNotificationTime()}
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(index);
                      }}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Permission Request */}
          {permission !== 'granted' && (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <BellIcon className="h-6 w-6 text-orange-600" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-orange-900">Enable Notifications</h3>
                  <p className="text-sm text-orange-700">
                    Allow notifications to stay updated on your orders and payments.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if ('Notification' in window) {
                      Notification.requestPermission();
                    }
                  }}
                  className="btn-primary text-sm"
                >
                  Enable
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <MobileFooterNav />
    </div>
  );
}

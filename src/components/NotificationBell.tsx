'use client';

import { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { MessagePayload } from 'firebase/messaging';
import { useFCM, useNotifications } from '@/hooks/useFCM';

export default function NotificationBell() {
  // const { user } = useAuth(); // Commented out as not currently used
  const { token, permission, generateToken, setupForegroundListener } = useFCM();
  const { notifications, addNotification, removeNotification, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

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
        setHasNewNotifications(true);
        
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

  // Reset new notification indicator when opened
  useEffect(() => {
    if (isOpen) {
      setHasNewNotifications(false);
    }
  }, [isOpen]);

  const handleNotificationClick = (notification: MessagePayload, index: number) => {
    // Handle notification click - navigate to relevant page
    const data = notification.data;
    if (data?.url) {
      window.location.href = data.url;
    }
    
    // Remove notification after click
    removeNotification(index);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // For testing, we'll show the notification bell even without authentication
  // In production, you might want to require authentication

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full"
      >
        {hasNewNotifications || notifications.length > 0 ? (
          <BellSolidIcon className="h-6 w-6 text-orange-500" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {/* Notification Count Badge */}
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
        
        {/* New Notification Indicator */}
        {hasNewNotifications && (
          <span className="absolute top-0 right-0 block h-2 w-2 bg-red-400 rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-sm text-orange-600 hover:text-orange-800"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-sm">You&apos;ll see payment and order updates here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    onClick={() => handleNotificationClick(notification, index)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Notification Icon */}
                      <div className="flex-shrink-0">
                        {notification.data?.type === 'payment_success' && (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm">💰</span>
                          </div>
                        )}
                        {notification.data?.type === 'order_confirmed' && (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm">✅</span>
                          </div>
                        )}
                        {notification.data?.type === 'order_ready' && (
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-sm">🍽️</span>
                          </div>
                        )}
                        {!notification.data?.type && (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <BellIcon className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.notification?.title || 'Notification'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.notification?.body || 'No message'}
                        </p>
                        {notification.data?.timestamp && (
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(notification.data.timestamp)}
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(index);
                        }}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                      >
                        <span className="sr-only">Remove notification</span>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/notifications';
                }}
                className="w-full text-center text-sm text-orange-600 hover:text-orange-800"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

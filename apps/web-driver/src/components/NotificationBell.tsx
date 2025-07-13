'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { MessagePayload } from 'firebase/messaging';
import { useFCM, useNotifications } from '@/hooks/useFCM';

interface NotificationBellProps {
  className?: string;
  iconSize?: string;
  textColor?: string;
  hoverColor?: string;
}

export default function NotificationBell({
  className = '',
  iconSize = 'h-6 w-6',
  textColor = 'text-gray-600',
  hoverColor = 'hover:text-gray-900'
}: NotificationBellProps) {
  const router = useRouter();
  // const { user } = useAuth(); // Commented out as not currently used
  const { token, permission, generateToken, setupForegroundListener } = useFCM();
  const { notifications, addNotification } = useNotifications();
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

  const handleBellClick = () => {
    // Reset new notification indicator when navigating to notifications page
    setHasNewNotifications(false);
    // Navigate to notifications page
    router.push('/notifications');
  };

  // For testing, we'll show the notification bell even without authentication
  // In production, you might want to require authentication

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={handleBellClick}
        className={`relative p-2 ${textColor} ${hoverColor} focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full ${className}`}
      >
        {hasNewNotifications || notifications.length > 0 ? (
          <BellSolidIcon className={`${iconSize} text-orange-500`} />
        ) : (
          <BellIcon className={iconSize} />
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

    </div>
  );
}

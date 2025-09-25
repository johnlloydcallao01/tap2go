/**
 * React Hook for Push Notifications
 * Handles notification permissions and management without Firebase
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface NotificationPayload {
  title?: string;
  body?: string;
  icon?: string;
  data?: Record<string, any>;
}

export interface NotificationState {
  token: string | null;
  permission: NotificationPermission;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationActions {
  requestPermission: () => Promise<boolean>;
  generateToken: () => Promise<string | null>;
  setupForegroundListener: (callback: (payload: NotificationPayload) => void) => void;
}

/**
 * Custom hook for Push Notifications (Non-Firebase)
 */
export const useFCM = (): NotificationState & NotificationActions => {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationState>({
    token: null,
    permission: 'default',
    isSupported: false,
    isLoading: true,
    error: null,
  });

  // Initialize notification system
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Check if notifications are supported
        const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
        
        // Get current permission status
        const permission = isSupported ? Notification.permission : 'denied';

        setState(prev => ({
          ...prev,
          isSupported,
          permission,
          isLoading: false,
        }));

        // If user is logged in and permission is granted, try to get existing token
        if (user && permission === 'granted') {
          const existingToken = localStorage.getItem(`notification_token_${user.uid}`);
          if (existingToken) {
            setState(prev => ({ ...prev, token: existingToken }));
          }
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize notifications',
        }));
      }
    };

    initializeNotifications();
  }, [user]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications');
      }

      const permission = await Notification.requestPermission();
      
      setState(prev => ({ ...prev, permission, isLoading: false }));

      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to request permission',
      }));
      return false;
    }
  }, []);

  // Generate notification token (mock implementation)
  const generateToken = useCallback(async (): Promise<string | null> => {
    const userId = user?.uid || 'anonymous_user';

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Generate a mock token for demonstration
      const token = `notification_token_${userId}_${Date.now()}`;
      
      setState(prev => ({ ...prev, token, isLoading: false }));

      // Store token locally for quick access
      localStorage.setItem(`notification_token_${userId}`, token);

      // In a real implementation, you would register this token with your backend
      try {
        await fetch('/api/notifications/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ token, userId })
        });
      } catch (apiError) {
        console.warn('Failed to register token with backend:', apiError);
      }

      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate token',
      }));
      return null;
    }
  }, [user]);

  // Setup foreground message listener (mock implementation)
  const setupForegroundListener = useCallback((callback: (payload: NotificationPayload) => void) => {
    // In a real implementation, this would set up a service worker listener
    // For now, we'll just set up a basic event listener
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'notification') {
        callback(event.data.payload);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      // Return cleanup function
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  return {
    ...state,
    requestPermission,
    generateToken,
    setupForegroundListener,
  };
};

/**
 * Hook for notification display
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  const addNotification = useCallback((payload: NotificationPayload) => {
    setNotifications(prev => [payload, ...prev.slice(0, 9)]); // Keep last 10 notifications
  }, []);

  const removeNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showNotification = useCallback((payload: NotificationPayload) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.title || 'Notification', {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        data: payload.data
      });
    }
    addNotification(payload);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showNotification,
  };
};

export default useFCM;

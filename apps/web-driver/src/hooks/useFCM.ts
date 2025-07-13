/**
 * React Hook for Firebase Cloud Messaging
 * Handles FCM token generation, permission requests, and notification management
 */

import { useState, useEffect, useCallback } from 'react';
import { MessagePayload } from 'firebase/messaging';
import FCMService from '@/lib/fcm';
import { useAuth } from '@/hooks/useAuth';

export interface FCMState {
  token: string | null;
  permission: NotificationPermission;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface FCMActions {
  requestPermission: () => Promise<boolean>;
  generateToken: () => Promise<string | null>;
  setupForegroundListener: (callback: (payload: MessagePayload) => void) => void;
}

/**
 * Custom hook for Firebase Cloud Messaging
 */
export const useFCM = (): FCMState & FCMActions => {
  const { user } = useAuth();
  const [state, setState] = useState<FCMState>({
    token: null,
    permission: 'default',
    isSupported: false,
    isLoading: true,
    error: null,
  });

  // Initialize FCM
  useEffect(() => {
    const initializeFCM = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Check if FCM is supported
        const isSupported = await FCMService.initialize();
        
        // Get current permission status
        const permission = 'Notification' in window ? Notification.permission : 'denied';

        setState(prev => ({
          ...prev,
          isSupported,
          permission,
          isLoading: false,
        }));

        // If user is logged in and permission is granted, try to get existing token
        if (user && permission === 'granted') {
          const existingToken = await FCMService.getStoredToken(user.uid);
          if (existingToken) {
            setState(prev => ({ ...prev, token: existingToken }));
          }
        }
      } catch (error) {
        console.error('Error initializing FCM:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize FCM',
        }));
      }
    };

    initializeFCM();
  }, [user]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const permission = await FCMService.requestPermission();
      
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

  // Generate FCM token
  const generateToken = useCallback(async (): Promise<string | null> => {
    // For testing, we'll use a mock user ID if no user is authenticated
    const userId = user?.uid || 'test_user_123';

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const token = await FCMService.generateToken(userId);
      
      setState(prev => ({ ...prev, token, isLoading: false }));

      // Store token locally for quick access
      if (token) {
        localStorage.setItem(`fcm_token_${userId}`, token);
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

  // Setup foreground message listener
  const setupForegroundListener = useCallback((callback: (payload: MessagePayload) => void) => {
    FCMService.setupForegroundListener(callback);
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
  const [notifications, setNotifications] = useState<MessagePayload[]>([]);

  const addNotification = useCallback((payload: MessagePayload) => {
    setNotifications(prev => [payload, ...prev.slice(0, 9)]); // Keep last 10 notifications
  }, []);

  const removeNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};

export default useFCM;

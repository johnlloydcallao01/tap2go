/**
 * Firebase Cloud Messaging Service
 * Handles FCM token generation, storage, and notification management
 */

import { getToken, onMessage, MessagePayload, Messaging } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeMessaging } from './firebase';
import { db } from './firebase';

// FCM Configuration
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Types
export interface FCMToken {
  token: string;
  userId: string;
  deviceType: 'web' | 'mobile';
  userAgent: string;
  createdAt: unknown;
  updatedAt: unknown;
  isActive: boolean;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * FCM Service Class
 */
export class FCMService {
  private static messaging: Messaging | null = null;

  /**
   * Initialize FCM
   */
  static async initialize(): Promise<boolean> {
    try {
      const messagingInstance = await initializeMessaging();
      this.messaging = messagingInstance as Messaging | null;
      return !!this.messaging;
    } catch (error) {
      console.error('Failed to initialize FCM:', error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Request permission
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  /**
   * Generate FCM token
   */
  static async generateToken(userId: string): Promise<string | null> {
    try {
      if (!this.messaging) {
        await this.initialize();
      }

      if (!this.messaging) {
        throw new Error('FCM not initialized');
      }

      if (!VAPID_KEY) {
        throw new Error('VAPID key not configured');
      }

      // Request permission first
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Generate token
      const token = await getToken(this.messaging as Messaging, {
        vapidKey: VAPID_KEY,
      });

      if (token) {
        console.log('FCM token generated:', token);
        
        // Store token in Firestore
        await this.storeToken(token, userId);
        
        return token;
      } else {
        throw new Error('Failed to generate FCM token');
      }
    } catch (error) {
      console.error('Error generating FCM token:', error);
      return null;
    }
  }

  /**
   * Store FCM token in Firestore
   */
  static async storeToken(token: string, userId: string): Promise<void> {
    try {
      const tokenData: FCMToken = {
        token,
        userId,
        deviceType: 'web',
        userAgent: navigator.userAgent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      };

      // Store in user's FCM tokens subcollection
      const tokenRef = doc(db, `users/${userId}/fcmTokens`, token);
      await setDoc(tokenRef, tokenData, { merge: true });

      console.log('FCM token stored successfully');
    } catch (error) {
      console.error('Error storing FCM token:', error);
      throw error;
    }
  }

  /**
   * Get stored FCM token for user
   */
  static async getStoredToken(userId: string): Promise<string | null> {
    try {
      // This would typically get the most recent active token
      // For now, we'll implement a simple approach
      return localStorage.getItem(`fcm_token_${userId}`);
    } catch (error) {
      console.error('Error getting stored FCM token:', error);
      return null;
    }
  }

  /**
   * Set up foreground message listener
   */
  static setupForegroundListener(callback: (payload: MessagePayload) => void): void {
    if (!this.messaging) {
      console.warn('FCM not initialized, cannot set up foreground listener');
      return;
    }

    onMessage(this.messaging as Messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });
  }

  /**
   * Show notification
   */
  static async showNotification(payload: NotificationPayload): Promise<void> {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }

      const registration = await navigator.serviceWorker.ready;
      
      const notificationOptions: NotificationOptions & {
        image?: string;
        actions?: Array<{
          action: string;
          title: string;
          icon?: string;
        }>;
      } = {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge || '/favicon.ico',
        data: payload.data,
        tag: 'tap2go-notification',
        requireInteraction: true,
        // Note: 'image' and 'actions' are not part of standard NotificationOptions in all browsers
        ...(payload.image && { image: payload.image }),
        ...(payload.actions && { actions: payload.actions }),
      };

      await registration.showNotification(payload.title, notificationOptions);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Handle notification click (for service worker context)
   * Note: This method is intended to be used in a service worker context
   */
  static handleNotificationClick(event: Event & {
    notification: Notification;
    waitUntil: (promise: Promise<unknown>) => void
  }): void {
    console.log('Notification clicked:', event.notification);

    event.notification.close();

    // Handle different notification types
    const data = event.notification.data;
    if (data?.url && typeof self !== 'undefined' && 'clients' in self) {
      event.waitUntil(
        (self as { clients: { openWindow: (url: string) => Promise<unknown> } }).clients.openWindow(data.url)
      );
    }
  }
}

// Export for convenience
export default FCMService;

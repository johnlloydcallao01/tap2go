# 🔔 Firebase Cloud Messaging Integration Guide

## Overview
This guide explains how Firebase Cloud Messaging (FCM) is integrated into the Tap2Go platform for real-time push notifications.

## 🏗️ FCM Architecture

```
Frontend (React) → FCM Service → Firebase → Cloud Function → User Notifications
                      ↓
              [Token Generation]
                      ↓
              [Permission Request]
                      ↓
              [Service Worker]
                      ↓
              [Notification Display]
```

## 🔧 Implementation Components

### 1. FCM Service (`src/lib/fcm.ts`)

**Purpose**: Core FCM functionality and token management

```typescript
export class FCMService {
  // Initialize FCM
  static async initialize(): Promise<boolean>
  
  // Request notification permission
  static async requestPermission(): Promise<NotificationPermission>
  
  // Generate FCM token
  static async generateToken(userId: string): Promise<string | null>
  
  // Store token in Firestore
  static async storeToken(token: string, userId: string): Promise<void>
  
  // Setup foreground message listener
  static setupForegroundListener(callback: Function): void
  
  // Show notification
  static async showNotification(payload: NotificationPayload): Promise<void>
}
```

### 2. React Hook (`src/hooks/useFCM.ts`)

**Purpose**: React integration for FCM functionality

```typescript
export const useFCM = (): FCMState & FCMActions => {
  // State management
  const [state, setState] = useState<FCMState>({
    token: null,
    permission: 'default',
    isSupported: false,
    isLoading: true,
    error: null,
  });

  // Actions
  return {
    ...state,
    requestPermission,
    generateToken,
    setupForegroundListener,
  };
};
```

### 3. Service Worker (`public/firebase-messaging-sw.js`)

**Purpose**: Handle background notifications when app is not active

```javascript
// Background message handler
messaging.onBackgroundMessage((payload) => {
  // Customize notification based on type
  const notificationOptions = {
    body: payload.notification.body,
    icon: getIconForType(payload.data.type),
    badge: '/favicon.ico',
    tag: 'tap2go-notification',
    data: payload.data,
    actions: [
      { action: 'view', title: 'View Order' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    requireInteraction: true
  };

  self.registration.showNotification(
    payload.notification.title,
    notificationOptions
  );
});
```

## 🔑 Configuration Setup

### 1. VAPID Key Configuration

```bash
# Get VAPID key from Firebase Console
# Project Settings → Cloud Messaging → Web configuration

NEXT_PUBLIC_FIREBASE_VAPID_KEY=BIZ720hEPOJI1onp93mfqutx5ceyFakOJPRM8R-Oa8eJibI5jsntq4PH-erjRy502Ac823zPQ63BTV5_qWxQUoQ
```

### 2. Firebase Configuration

```typescript
// src/lib/firebase.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

## 📱 Notification Types and Templates

### Payment Notifications

```typescript
// Payment Success
{
  title: "💰 Payment Successful!",
  body: "Your payment of ₱20.00 has been processed successfully.",
  data: {
    type: "payment_success",
    orderId: "order_123",
    customerId: "customer_456",
    amount: "2000",
    url: "/orders/order_123"
  }
}

// Payment Failed
{
  title: "❌ Payment Failed",
  body: "Your payment could not be processed. Please try again.",
  data: {
    type: "payment_failed",
    orderId: "order_123",
    customerId: "customer_456",
    url: "/orders/order_123"
  }
}
```

### Order Status Notifications

```typescript
// Order Confirmed
{
  title: "✅ Order Confirmed",
  body: "Your order has been confirmed and is being prepared.",
  data: {
    type: "order_confirmed",
    orderId: "order_123",
    vendorId: "vendor_789",
    url: "/vendor/orders/order_123"
  }
}

// Order Ready
{
  title: "🍽️ Order Ready",
  body: "Your order is ready for pickup or delivery!",
  data: {
    type: "order_ready",
    orderId: "order_123",
    customerId: "customer_456",
    url: "/orders/order_123"
  }
}
```

## 🔄 Token Management

### Token Storage Structure

```typescript
// Firestore: users/{userId}/fcmTokens/{tokenId}
interface FCMToken {
  token: string;
  userId: string;
  deviceType: 'web' | 'mobile';
  userAgent: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}
```

### Token Lifecycle

```typescript
1. User grants notification permission
2. Generate FCM token using VAPID key
3. Store token in Firestore with user metadata
4. Use token for sending notifications
5. Handle token refresh automatically
6. Clean up invalid/expired tokens
```

## 🎯 Usage Examples

### Basic Setup in React Component

```typescript
import { useFCM } from '@/hooks/useFCM';

export default function MyComponent() {
  const { 
    token, 
    permission, 
    requestPermission, 
    generateToken,
    setupForegroundListener 
  } = useFCM();

  useEffect(() => {
    // Setup FCM when component mounts
    if (permission === 'granted' && !token) {
      generateToken();
    }

    // Setup foreground listener
    if (token) {
      setupForegroundListener((payload) => {
        console.log('Notification received:', payload);
        // Handle foreground notification
      });
    }
  }, [permission, token]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      await generateToken();
    }
  };

  return (
    <div>
      {permission !== 'granted' && (
        <button onClick={handleRequestPermission}>
          Enable Notifications
        </button>
      )}
      {token && <p>Notifications enabled!</p>}
    </div>
  );
}
```

### Sending Notifications from Cloud Function

```typescript
// functions/src/index.ts
async function sendFCMNotification(userId: string, notification: FCMNotification) {
  const db = admin.firestore();
  
  // Get user's FCM tokens
  const tokensSnapshot = await db.collection(`users/${userId}/fcmTokens`)
    .where("isActive", "==", true)
    .get();

  const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

  // Send notification
  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: notification.data,
    tokens: tokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message);
  
  // Handle failed tokens
  if (response.failureCount > 0) {
    await cleanupInvalidTokens(userId, failedTokens);
  }
}
```

## 🧪 Testing

### Test Notification Types

```bash
# Test all notification types
curl -X POST http://localhost:3001/api/test-fcm-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "type": "payment_success"
  }'
```

### Test Pages

- **Basic FCM Test**: `/test-notifications`
- **Complete Flow Test**: `/test-all-notifications`
- **Notification Bell**: Available in header component

## 🔍 Troubleshooting

### Common Issues

1. **VAPID Key Not Configured**
   ```
   Error: VAPID key not configured
   Solution: Add NEXT_PUBLIC_FIREBASE_VAPID_KEY to .env.local
   ```

2. **Permission Denied**
   ```
   Error: Notification permission denied
   Solution: Clear browser data and request permission again
   ```

3. **Service Worker Not Registered**
   ```
   Error: Service worker registration failed
   Solution: Check firebase-messaging-sw.js is in public folder
   ```

4. **Token Generation Failed**
   ```
   Error: Failed to generate FCM token
   Solution: Check VAPID key and Firebase configuration
   ```

### Debug Commands

```javascript
// Check notification permission
console.log('Permission:', Notification.permission);

// Check service worker registration
navigator.serviceWorker.getRegistrations().then(console.log);

// Check FCM token
console.log('FCM Token:', localStorage.getItem('fcm_token_test_user_123'));

// Test notification
new Notification('Test', { body: 'Test notification' });
```

## 📊 Performance Considerations

### Optimization Tips

1. **Token Caching**: Store tokens locally for quick access
2. **Batch Notifications**: Send multiple notifications efficiently
3. **Error Handling**: Gracefully handle failed deliveries
4. **Token Cleanup**: Remove invalid tokens regularly

### Monitoring

- **Delivery Rate**: Monitor successful vs failed deliveries
- **Token Validity**: Track token refresh rates
- **User Engagement**: Measure notification click-through rates
- **Performance**: Monitor notification delivery times

---

**Last Updated**: June 2025  
**Version**: 1.0  
**Maintainer**: John Lloyd Callao (johnlloydcallao@gmail.com)

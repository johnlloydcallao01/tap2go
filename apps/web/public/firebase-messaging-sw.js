// Firebase Cloud Messaging Service Worker
// This file is required for Firebase Cloud Messaging to work in the browser

// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyDWWpv5PBQFpfIkHmtOnHTGktHv5o36Cnw",
  authDomain: "tap2go-kuucn.firebaseapp.com",
  projectId: "tap2go-kuucn",
  storageBucket: "tap2go-kuucn.firebasestorage.app",
  messagingSenderId: "191284661715922",
  appId: "1:191284661715922:web:8b8c8b8c8b8c8b8c8b8c8b"
});

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Extract notification data
  const notification = payload.notification || {};
  const data = payload.data || {};

  // Customize notification based on type
  let notificationTitle = notification.title || 'Tap2Go Notification';
  let notificationBody = notification.body || 'You have a new notification';
  let notificationIcon = '/favicon.ico';

  // Customize based on notification type
  switch (data.type) {
    case 'payment_success':
      notificationTitle = '💰 Payment Successful';
      notificationIcon = '/icons/payment-success.png';
      break;
    case 'order_confirmed':
      notificationTitle = '✅ Order Confirmed';
      notificationIcon = '/icons/order-confirmed.png';
      break;
    case 'order_preparing':
      notificationTitle = '👨‍🍳 Order Being Prepared';
      notificationIcon = '/icons/cooking.png';
      break;
    case 'order_ready':
      notificationTitle = '🍽️ Order Ready for Pickup';
      notificationIcon = '/icons/ready.png';
      break;
    case 'driver_assigned':
      notificationTitle = '🚗 Driver Assigned';
      notificationIcon = '/icons/driver.png';
      break;
    case 'order_delivered':
      notificationTitle = '🎉 Order Delivered';
      notificationIcon = '/icons/delivered.png';
      break;
    default:
      notificationIcon = '/favicon.ico';
  }

  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    badge: '/favicon.ico',
    tag: 'tap2go-notification',
    data: {
      ...data,
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View Order',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/close.png'
      }
    ],
    requireInteraction: true,
    silent: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  console.log('Action:', event.action);
  console.log('Notification data:', event.notification.data);

  event.notification.close();

  // Handle different actions
  if (event.action === 'dismiss') {
    // Just close the notification
    return;
  }

  // Default action or 'view' action
  const data = event.notification.data || {};
  let targetUrl = '/';

  // Determine target URL based on notification type
  switch (data.type) {
    case 'payment_success':
    case 'order_confirmed':
    case 'order_preparing':
    case 'order_ready':
    case 'driver_assigned':
    case 'order_delivered':
      targetUrl = data.orderId ? `/orders/${data.orderId}` : '/orders';
      break;
    default:
      targetUrl = data.url || '/';
  }

  // Open the target URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }

      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

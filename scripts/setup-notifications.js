#!/usr/bin/env node

/**
 * Setup Notifications Collection for Tap2Go
 * 
 * This script sets up the notifications collection with sample notifications
 * following the same pattern as other collections.
 * 
 * Usage: node scripts/setup-notifications.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, Timestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6ALvnN6aX0DMVhePhkUow9VrPauBCqgQ",
  authDomain: "tap2go-kuucn.firebaseapp.com",
  projectId: "tap2go-kuucn",
  storageBucket: "tap2go-kuucn.firebasestorage.app",
  messagingSenderId: "828629511294",
  appId: "1:828629511294:web:fae32760ca3c3afcb87c2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupNotificationsCollection() {
  console.log('🚀 Setting up notifications collection...');

  try {
    // Sample Notification 1 - Order Update for Customer
    const notification1Data = {
      recipientRef: "users/customer_001",
      recipientRole: "customer",
      type: "order_update",
      title: "Order Confirmed! 🎉",
      message: "Your order #ORD-123456 has been confirmed and is being prepared.",
      data: {
        orderId: "order_001",
        orderNumber: "ORD-123456",
        restaurantName: "Burger Palace",
        estimatedTime: "25-30 minutes"
      },
      isRead: false,
      priority: "medium",
      deliveryMethod: ["push", "email"],
      sentAt: Timestamp.fromDate(new Date('2024-01-15T18:45:00')),
      readAt: null,
      createdAt: Timestamp.fromDate(new Date('2024-01-15T18:45:00'))
    };

    await setDoc(doc(db, 'notifications', 'notification_001'), notification1Data);
    console.log('   ✅ Created order update notification: notification_001');

    // Sample Notification 2 - Promotional for Customer
    const notification2Data = {
      recipientRef: "users/customer_002",
      recipientRole: "customer",
      type: "promotional",
      title: "Special Offer! 🎁",
      message: "Get 20% off your next order with code SAVE20. Valid until midnight!",
      data: {
        promoCode: "SAVE20",
        discountPercent: 20,
        expiryDate: "2024-01-16T23:59:59",
        minOrderValue: 15.00
      },
      isRead: true,
      priority: "low",
      deliveryMethod: ["push", "email"],
      sentAt: Timestamp.fromDate(new Date('2024-01-15T10:00:00')),
      readAt: Timestamp.fromDate(new Date('2024-01-15T10:15:00')),
      createdAt: Timestamp.fromDate(new Date('2024-01-15T10:00:00'))
    };

    await setDoc(doc(db, 'notifications', 'notification_002'), notification2Data);
    console.log('   ✅ Created promotional notification: notification_002');

    // Sample Notification 3 - System Alert for Admin
    const notification3Data = {
      recipientRef: "users/admin_001",
      recipientRole: "admin",
      type: "system",
      title: "High Order Volume Alert ⚠️",
      message: "Order volume has increased by 150% in the last hour. Consider activating more drivers.",
      data: {
        currentOrders: 45,
        normalAverage: 18,
        increasePercent: 150,
        activeDrivers: 8,
        recommendedDrivers: 15
      },
      isRead: false,
      priority: "high",
      deliveryMethod: ["push", "email"],
      sentAt: Timestamp.fromDate(new Date('2024-01-15T19:30:00')),
      readAt: null,
      createdAt: Timestamp.fromDate(new Date('2024-01-15T19:30:00'))
    };

    await setDoc(doc(db, 'notifications', 'notification_003'), notification3Data);
    console.log('   ✅ Created system alert notification: notification_003');

    // Sample Notification 4 - Payment Issue for Vendor
    const notification4Data = {
      recipientRef: "users/vendor_001",
      recipientRole: "vendor",
      type: "payment",
      title: "Payment Processing Issue 💳",
      message: "There was an issue processing payment for order #ORD-789012. Please review.",
      data: {
        orderId: "order_002",
        orderNumber: "ORD-789012",
        paymentAmount: 26.58,
        errorCode: "CARD_DECLINED",
        customerRef: "users/customer_002"
      },
      isRead: false,
      priority: "urgent",
      deliveryMethod: ["push", "email", "sms"],
      sentAt: Timestamp.fromDate(new Date('2024-01-15T20:00:00')),
      readAt: null,
      createdAt: Timestamp.fromDate(new Date('2024-01-15T20:00:00'))
    };

    await setDoc(doc(db, 'notifications', 'notification_004'), notification4Data);
    console.log('   ✅ Created payment issue notification: notification_004');

    // Sample Notification 5 - Rating Request for Customer
    const notification5Data = {
      recipientRef: "users/customer_001",
      recipientRole: "customer",
      type: "rating_request",
      title: "Rate Your Recent Order ⭐",
      message: "How was your experience with Burger Palace? Your feedback helps us improve!",
      data: {
        orderId: "order_001",
        orderNumber: "ORD-123456",
        restaurantName: "Burger Palace",
        driverName: "Mike Johnson",
        deliveredAt: "2024-01-15T19:25:00"
      },
      isRead: false,
      priority: "low",
      deliveryMethod: ["push"],
      sentAt: Timestamp.fromDate(new Date('2024-01-15T20:30:00')),
      readAt: null,
      createdAt: Timestamp.fromDate(new Date('2024-01-15T20:30:00'))
    };

    await setDoc(doc(db, 'notifications', 'notification_005'), notification5Data);
    console.log('   ✅ Created rating request notification: notification_005');

    // Sample Notification 6 - Driver Assignment for Driver
    const notification6Data = {
      recipientRef: "users/driver_001",
      recipientRole: "driver",
      type: "order_update",
      title: "New Delivery Assignment 🚗",
      message: "You have been assigned a new delivery. Pickup from Burger Palace in 10 minutes.",
      data: {
        orderId: "order_003",
        orderNumber: "ORD-345678",
        restaurantName: "Burger Palace",
        restaurantAddress: "123 Main St, New York, NY",
        customerAddress: "456 Oak Ave, Brooklyn, NY",
        estimatedEarnings: 8.50,
        distance: "2.3 miles"
      },
      isRead: true,
      priority: "high",
      deliveryMethod: ["push", "sms"],
      sentAt: Timestamp.fromDate(new Date('2024-01-15T21:00:00')),
      readAt: Timestamp.fromDate(new Date('2024-01-15T21:01:00')),
      createdAt: Timestamp.fromDate(new Date('2024-01-15T21:00:00'))
    };

    await setDoc(doc(db, 'notifications', 'notification_006'), notification6Data);
    console.log('   ✅ Created driver assignment notification: notification_006');

    console.log('\n🎉 Notifications collection setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ notifications collection created');
    console.log('- ✅ 6 sample notifications added');
    console.log('- ✅ All notification types covered (order_update, promotional, system, payment, rating_request)');
    console.log('- ✅ All user roles covered (admin, vendor, driver, customer)');
    console.log('- ✅ All priority levels included (low, medium, high, urgent)');
    console.log('- ✅ Multiple delivery methods configured (push, email, sms)');
    console.log('- ✅ Rich data payloads for enhanced functionality');

  } catch (error) {
    console.error('❌ Error setting up notifications collection:', error);
    throw error;
  }
}

// Update system documentation
async function updateSystemDocumentation() {
  console.log('📊 Updating system documentation...');

  const notificationsStructureDoc = {
    notifications: {
      purpose: "System-wide notifications and messaging",
      docIdFormat: "Auto-generated notification ID",
      fields: {
        recipientRef: "string - path to user document",
        recipientRole: "admin | vendor | driver | customer",
        type: "order_update | promotional | system | payment | rating_request",
        title: "string - notification title",
        message: "string - notification message body",
        data: "map (optional) - additional payload data",
        isRead: "boolean - read status",
        priority: "low | medium | high | urgent",
        deliveryMethod: "array<string> - delivery channels (push, email, sms)",
        sentAt: "timestamp (optional) - when notification was sent",
        readAt: "timestamp (optional) - when notification was read",
        createdAt: "timestamp - creation time"
      },
      subcollections: {}
    },
    setupDate: Timestamp.now(),
    version: "1.0.0"
  };

  await setDoc(doc(db, '_system', 'notifications_structure'), notificationsStructureDoc);
  console.log('   ✅ Notifications structure documented in _system');
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting notifications collection setup...\n');
    
    await setupNotificationsCollection();
    await updateSystemDocumentation();
    
    console.log('\n✅ Notifications collection setup completed successfully!');
    console.log('\n📊 Database now includes:');
    console.log('- 9 Top-level collections: users, admins, vendors, customers, drivers, restaurants, orders, platformConfig, notifications');
    console.log('- Comprehensive notification system');
    console.log('- Multi-channel delivery (push, email, sms)');
    console.log('- Priority-based notification handling');
    console.log('- Rich data payloads for enhanced functionality');
    console.log('- Read/unread status tracking');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
main();

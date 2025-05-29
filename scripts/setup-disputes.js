#!/usr/bin/env node

/**
 * Setup Disputes Collection for Tap2Go
 * 
 * This script sets up the disputes collection with sample disputes
 * following the same pattern as other collections.
 * 
 * Usage: node scripts/setup-disputes.js
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

async function setupDisputesCollection() {
  console.log('🚀 Setting up disputes collection...');

  try {
    // Sample Dispute 1 - Order Issue (Resolved)
    const dispute1Data = {
      orderRef: "orders/order_001",
      customerRef: "customers/customer_001",
      restaurantRef: "restaurants/restaurant_001",
      driverRef: "drivers/driver_001",
      type: "order_issue",
      description: "Order was missing items. I ordered 2 burgers and large fries but only received 1 burger. The restaurant forgot to include the second burger and fries.",
      attachments: [
        "https://storage.googleapis.com/tap2go-kuucn.appspot.com/disputes/dispute_001_photo1.jpg",
        "https://storage.googleapis.com/tap2go-kuucn.appspot.com/disputes/dispute_001_receipt.jpg"
      ],
      status: "resolved",
      priority: "medium",
      assignedTo: "admin_001",
      resolution: {
        action: "refund",
        amount: 18.98,
        notes: "Customer was refunded for the missing items (1 burger + large fries). Restaurant has been notified to improve order accuracy.",
        resolvedBy: "admin_001",
        resolvedAt: Timestamp.fromDate(new Date('2024-01-16T10:30:00'))
      },
      customerSatisfied: true,
      createdAt: Timestamp.fromDate(new Date('2024-01-15T20:45:00')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-16T10:30:00'))
    };

    await setDoc(doc(db, 'disputes', 'dispute_001'), dispute1Data);
    console.log('   ✅ Created resolved order issue dispute: dispute_001');

    // Sample Dispute 2 - Delivery Issue (Investigating)
    const dispute2Data = {
      orderRef: "orders/order_002",
      customerRef: "customers/customer_002",
      restaurantRef: "restaurants/restaurant_002",
      driverRef: "drivers/driver_002",
      type: "delivery_issue",
      description: "Driver marked order as delivered but I never received it. I was home all evening and no one came to my door. The driver may have delivered to wrong address.",
      attachments: [],
      status: "investigating",
      priority: "high",
      assignedTo: "admin_002",
      resolution: null,
      customerSatisfied: null,
      createdAt: Timestamp.fromDate(new Date('2024-01-15T21:15:00')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-15T21:30:00'))
    };

    await setDoc(doc(db, 'disputes', 'dispute_002'), dispute2Data);
    console.log('   ✅ Created investigating delivery issue dispute: dispute_002');

    // Sample Dispute 3 - Payment Issue (Open)
    const dispute3Data = {
      orderRef: "orders/order_003",
      customerRef: "customers/customer_003",
      restaurantRef: "restaurants/restaurant_001",
      driverRef: null,
      type: "payment_issue",
      description: "I was charged twice for the same order. My credit card shows two charges of $21.35 for order #ORD-345678 but I only placed one order.",
      attachments: [
        "https://storage.googleapis.com/tap2go-kuucn.appspot.com/disputes/dispute_003_statement.pdf"
      ],
      status: "open",
      priority: "urgent",
      assignedTo: null,
      resolution: null,
      customerSatisfied: null,
      createdAt: Timestamp.fromDate(new Date('2024-01-16T08:20:00')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-16T08:20:00'))
    };

    await setDoc(doc(db, 'disputes', 'dispute_003'), dispute3Data);
    console.log('   ✅ Created open payment issue dispute: dispute_003');

    // Sample Dispute 4 - Quality Issue (Resolved)
    const dispute4Data = {
      orderRef: "orders/order_001",
      customerRef: "customers/customer_001",
      restaurantRef: "restaurants/restaurant_001",
      driverRef: "drivers/driver_001",
      type: "quality_issue",
      description: "The food was cold when it arrived and the burger was overcooked. The fries were soggy and inedible. Very disappointed with the quality.",
      attachments: [
        "https://storage.googleapis.com/tap2go-kuucn.appspot.com/disputes/dispute_004_food_photo.jpg"
      ],
      status: "resolved",
      priority: "medium",
      assignedTo: "admin_001",
      resolution: {
        action: "credit",
        amount: 25.00,
        notes: "Customer provided with $25 credit for future orders. Restaurant has been contacted about food quality standards and delivery timing.",
        resolvedBy: "admin_001",
        resolvedAt: Timestamp.fromDate(new Date('2024-01-16T14:15:00'))
      },
      customerSatisfied: true,
      createdAt: Timestamp.fromDate(new Date('2024-01-15T19:45:00')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-16T14:15:00'))
    };

    await setDoc(doc(db, 'disputes', 'dispute_004'), dispute4Data);
    console.log('   ✅ Created resolved quality issue dispute: dispute_004');

    // Sample Dispute 5 - Service Issue (Open)
    const dispute5Data = {
      orderRef: "orders/order_002",
      customerRef: "customers/customer_002",
      restaurantRef: "restaurants/restaurant_002",
      driverRef: "drivers/driver_002",
      type: "service_issue",
      description: "Driver was very rude and unprofessional. He was impatient when I took a moment to get my wallet and made inappropriate comments. This is unacceptable behavior.",
      attachments: [],
      status: "open",
      priority: "high",
      assignedTo: "admin_003",
      resolution: null,
      customerSatisfied: null,
      createdAt: Timestamp.fromDate(new Date('2024-01-16T12:30:00')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-16T12:30:00'))
    };

    await setDoc(doc(db, 'disputes', 'dispute_005'), dispute5Data);
    console.log('   ✅ Created open service issue dispute: dispute_005');

    // Sample Dispute 6 - Order Issue (Closed)
    const dispute6Data = {
      orderRef: "orders/order_003",
      customerRef: "customers/customer_003",
      restaurantRef: "restaurants/restaurant_001",
      driverRef: null,
      type: "order_issue",
      description: "Wrong order delivered. I ordered Caesar salad but received a burger instead. However, I decided to keep the burger as it looked good.",
      attachments: [],
      status: "closed",
      priority: "low",
      assignedTo: "admin_001",
      resolution: {
        action: "reorder",
        amount: 0,
        notes: "Customer decided to keep the wrong order. No refund needed. Restaurant reminded about order accuracy.",
        resolvedBy: "admin_001",
        resolvedAt: Timestamp.fromDate(new Date('2024-01-16T11:00:00'))
      },
      customerSatisfied: true,
      createdAt: Timestamp.fromDate(new Date('2024-01-15T20:15:00')),
      updatedAt: Timestamp.fromDate(new Date('2024-01-16T11:00:00'))
    };

    await setDoc(doc(db, 'disputes', 'dispute_006'), dispute6Data);
    console.log('   ✅ Created closed order issue dispute: dispute_006');

    console.log('\n🎉 Disputes collection setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ disputes collection created');
    console.log('- ✅ 6 sample disputes added');
    console.log('- ✅ All dispute types covered (order_issue, payment_issue, delivery_issue, quality_issue, service_issue)');
    console.log('- ✅ All status types included (open, investigating, resolved, closed)');
    console.log('- ✅ All priority levels included (low, medium, high, urgent)');
    console.log('- ✅ Resolution examples with different actions (refund, credit, reorder)');
    console.log('- ✅ Customer satisfaction tracking included');
    console.log('- ✅ Admin assignment and resolution tracking');

  } catch (error) {
    console.error('❌ Error setting up disputes collection:', error);
    throw error;
  }
}

// Update system documentation
async function updateSystemDocumentation() {
  console.log('📊 Updating system documentation...');

  const disputesStructureDoc = {
    disputes: {
      purpose: "Handle customer complaints and disputes",
      docIdFormat: "Auto-generated dispute ID",
      fields: {
        orderRef: "string - path to orders/{orderId}",
        customerRef: "string - path to customers/{customerId}",
        restaurantRef: "string (optional) - path to restaurants/{restId}",
        driverRef: "string (optional) - path to drivers/{driverId}",
        type: "order_issue | payment_issue | delivery_issue | quality_issue | service_issue",
        description: "string - detailed description of the dispute",
        attachments: "array<string> (optional) - URLs to uploaded evidence",
        status: "open | investigating | resolved | closed",
        priority: "low | medium | high | urgent",
        assignedTo: "string (optional) - admin UID",
        resolution: "map (optional) - resolution details with action, amount, notes, resolvedBy, resolvedAt",
        customerSatisfied: "boolean (optional) - customer satisfaction with resolution",
        createdAt: "timestamp - creation time",
        updatedAt: "timestamp - last update time"
      },
      subcollections: {}
    },
    setupDate: Timestamp.now(),
    version: "1.0.0"
  };

  await setDoc(doc(db, '_system', 'disputes_structure'), disputesStructureDoc);
  console.log('   ✅ Disputes structure documented in _system');
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting disputes collection setup...\n');
    
    await setupDisputesCollection();
    await updateSystemDocumentation();
    
    console.log('\n✅ Disputes collection setup completed successfully!');
    console.log('\n📊 Database now includes:');
    console.log('- 10 Top-level collections: users, admins, vendors, customers, drivers, restaurants, orders, platformConfig, notifications, disputes');
    console.log('- Comprehensive dispute management system');
    console.log('- Multi-type dispute handling (order, payment, delivery, quality, service)');
    console.log('- Priority-based dispute resolution');
    console.log('- Admin assignment and tracking');
    console.log('- Customer satisfaction monitoring');
    console.log('- Evidence attachment support');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
main();

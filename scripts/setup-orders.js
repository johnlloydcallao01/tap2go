#!/usr/bin/env node

/**
 * Setup Orders Collection for Tap2Go
 * 
 * This script sets up the orders collection with sample data
 * following the same pattern as other collections.
 * 
 * Usage: node scripts/setup-orders.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, Timestamp, GeoPoint } = require('firebase/firestore');

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

// Generate order number
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp.slice(-6)}${random}`;
}

async function setupOrdersCollection() {
  console.log('🚀 Setting up orders collection...');

  try {
    // Sample Order 1 - Delivered Order
    const order1Data = {
      orderNumber: generateOrderNumber(),
      customerRef: "customers/customer_001",
      restaurantRef: "restaurants/restaurant_001", 
      vendorRef: "vendors/vendor_001",
      driverRef: "drivers/driver_001",

      // Order Status Management
      status: "delivered",
      paymentStatus: "paid",
      cancellationReason: null,
      cancelledBy: null,

      // Items and Pricing
      items: [
        {
          menuItemRef: "restaurants/restaurant_001/menuItems/burger_classic",
          name: "Classic Burger",
          quantity: 2,
          unitPrice: 12.99,
          selectedModifiers: [
            {
              groupId: "burger_toppings",
              groupName: "Burger Toppings",
              selectedOptions: [
                {
                  optionId: "cheese",
                  name: "Extra Cheese",
                  priceAdjustment: 1.50
                }
              ]
            }
          ],
          specialInstructions: "No onions please",
          totalPrice: 28.98
        },
        {
          menuItemRef: "restaurants/restaurant_001/menuItems/fries_large",
          name: "Large Fries",
          quantity: 1,
          unitPrice: 4.99,
          selectedModifiers: [],
          specialInstructions: null,
          totalPrice: 4.99
        }
      ],

      // Pricing Breakdown
      subtotal: 33.97,
      taxes: 2.72,
      deliveryFee: 3.99,
      serviceFee: 1.50,
      discount: 0,
      tip: 5.00,
      totalAmount: 47.18,

      // Applied Promotions
      appliedPromotions: [],

      // Delivery Information
      deliveryAddress: {
        recipientName: "John Doe",
        recipientPhone: "+1-555-0123",
        formattedAddress: "123 Main St, New York, NY 10001",
        location: new GeoPoint(40.7128, -74.0060),
        deliveryInstructions: "Ring doorbell twice"
      },
      estimatedDeliveryTime: Timestamp.fromDate(new Date('2024-01-15T19:30:00')),
      actualDeliveryTime: Timestamp.fromDate(new Date('2024-01-15T19:25:00')),
      deliveryMethod: "delivery",

      // Payment Information
      paymentMethodRef: "customers/customer_001/paymentMethods/card_001",
      paymentProvider: "stripe",
      paymentTransactionId: "pi_1234567890",

      // Tracking and Communication
      preparationTime: 25,
      trackingUpdates: [
        {
          status: "confirmed",
          timestamp: Timestamp.fromDate(new Date('2024-01-15T18:45:00')),
          message: "Order confirmed by restaurant",
          location: null
        },
        {
          status: "preparing",
          timestamp: Timestamp.fromDate(new Date('2024-01-15T18:50:00')),
          message: "Your order is being prepared",
          location: null
        },
        {
          status: "ready_for_pickup",
          timestamp: Timestamp.fromDate(new Date('2024-01-15T19:10:00')),
          message: "Order ready for pickup",
          location: null
        },
        {
          status: "picked_up",
          timestamp: Timestamp.fromDate(new Date('2024-01-15T19:15:00')),
          message: "Driver has picked up your order",
          location: new GeoPoint(40.7589, -73.9851)
        },
        {
          status: "delivered",
          timestamp: Timestamp.fromDate(new Date('2024-01-15T19:25:00')),
          message: "Order delivered successfully",
          location: new GeoPoint(40.7128, -74.0060)
        }
      ],

      // Special Instructions and Notes
      customerNotes: "Please call when you arrive",
      restaurantNotes: "Customer requested no onions",
      driverNotes: "Customer was very friendly",

      // Timestamps
      placedAt: Timestamp.fromDate(new Date('2024-01-15T18:40:00')),
      confirmedAt: Timestamp.fromDate(new Date('2024-01-15T18:45:00')),
      readyAt: Timestamp.fromDate(new Date('2024-01-15T19:10:00')),
      pickedUpAt: Timestamp.fromDate(new Date('2024-01-15T19:15:00')),
      deliveredAt: Timestamp.fromDate(new Date('2024-01-15T19:25:00')),
      cancelledAt: null,

      // Ratings and Reviews
      customerRating: 5,
      driverRating: 5,
      restaurantRating: 4,
      reviewSubmitted: true,

      // Commission and Earnings
      platformCommission: 4.72,
      restaurantEarnings: 28.47,
      driverEarnings: 8.99,

      createdAt: Timestamp.fromDate(new Date('2024-01-15T18:40:00')),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'orders', 'order_001'), order1Data);
    console.log('   ✅ Created delivered order: order_001');

    // Sample Order 2 - Active Order (picked up)
    const order2Data = {
      orderNumber: generateOrderNumber(),
      customerRef: "customers/customer_002",
      restaurantRef: "restaurants/restaurant_002",
      vendorRef: "vendors/vendor_002",
      driverRef: "drivers/driver_002",

      status: "picked_up",
      paymentStatus: "paid",
      cancellationReason: null,
      cancelledBy: null,

      items: [
        {
          menuItemRef: "restaurants/restaurant_002/menuItems/pizza_margherita",
          name: "Margherita Pizza",
          quantity: 1,
          unitPrice: 16.99,
          selectedModifiers: [
            {
              groupId: "pizza_size",
              groupName: "Pizza Size",
              selectedOptions: [
                {
                  optionId: "large",
                  name: "Large",
                  priceAdjustment: 3.00
                }
              ]
            }
          ],
          specialInstructions: null,
          totalPrice: 19.99
        }
      ],

      subtotal: 19.99,
      taxes: 1.60,
      deliveryFee: 2.99,
      serviceFee: 1.00,
      discount: 2.00,
      tip: 3.00,
      totalAmount: 26.58,

      appliedPromotions: [
        {
          promoId: "SAVE2",
          promoTitle: "$2 off your order",
          discountAmount: 2.00
        }
      ],

      deliveryAddress: {
        recipientName: "Jane Smith",
        recipientPhone: "+1-555-0456",
        formattedAddress: "456 Oak Ave, Brooklyn, NY 11201",
        location: new GeoPoint(40.6892, -73.9442),
        deliveryInstructions: "Leave at door"
      },
      estimatedDeliveryTime: Timestamp.fromDate(new Date('2024-01-15T20:15:00')),
      actualDeliveryTime: null,
      deliveryMethod: "delivery",

      paymentMethodRef: "customers/customer_002/paymentMethods/card_002",
      paymentProvider: "stripe",
      paymentTransactionId: "pi_0987654321",

      preparationTime: 20,
      trackingUpdates: [
        {
          status: "confirmed",
          timestamp: Timestamp.fromDate(new Date('2024-01-15T19:30:00')),
          message: "Order confirmed by restaurant",
          location: null
        },
        {
          status: "preparing",
          timestamp: Timestamp.fromDate(new Date('2024-01-15T19:35:00')),
          message: "Your pizza is being prepared",
          location: null
        },
        {
          status: "ready_for_pickup",
          timestamp: Timestamp.fromDate(new Date('2024-01-15T19:50:00')),
          message: "Order ready for pickup",
          location: null
        },
        {
          status: "picked_up",
          timestamp: Timestamp.fromDate(new Date('2024-01-15T19:55:00')),
          message: "Driver has picked up your order",
          location: new GeoPoint(40.6782, -73.9442)
        }
      ],

      customerNotes: "Extra napkins please",
      restaurantNotes: "Large pizza as requested",
      driverNotes: null,

      placedAt: Timestamp.fromDate(new Date('2024-01-15T19:25:00')),
      confirmedAt: Timestamp.fromDate(new Date('2024-01-15T19:30:00')),
      readyAt: Timestamp.fromDate(new Date('2024-01-15T19:50:00')),
      pickedUpAt: Timestamp.fromDate(new Date('2024-01-15T19:55:00')),
      deliveredAt: null,
      cancelledAt: null,

      customerRating: null,
      driverRating: null,
      restaurantRating: null,
      reviewSubmitted: false,

      platformCommission: 2.66,
      restaurantEarnings: 17.33,
      driverEarnings: 5.99,

      createdAt: Timestamp.fromDate(new Date('2024-01-15T19:25:00')),
      updatedAt: Timestamp.now()
    };

    await setDoc(doc(db, 'orders', 'order_002'), order2Data);
    console.log('   ✅ Created active order: order_002');

    console.log('\n🎉 Orders collection setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ orders collection created');
    console.log('- ✅ 2 sample orders added');
    console.log('- ✅ Complete order lifecycle examples');
    console.log('- ✅ Real-time tracking data included');
    console.log('- ✅ Payment and commission data included');

  } catch (error) {
    console.error('❌ Error setting up orders collection:', error);
    throw error;
  }
}

// Update system documentation
async function updateSystemDocumentation() {
  console.log('📊 Updating system documentation...');

  const ordersStructureDoc = {
    orders: {
      purpose: "Order transactions and tracking",
      docIdFormat: "Auto-generated order ID",
      fields: {
        orderNumber: "string - user-friendly order number",
        customerRef: "string - path to customers/{customerId}",
        restaurantRef: "string - path to restaurants/{restId}",
        vendorRef: "string - path to vendors/{vendorUid}",
        driverRef: "string (optional) - path to drivers/{driverId}",
        status: "pending | confirmed | preparing | ready_for_pickup | picked_up | delivered | cancelled",
        paymentStatus: "pending | paid | failed | refunded | partially_refunded",
        items: "array<map> - order items with modifiers and pricing",
        subtotal: "number", taxes: "number", deliveryFee: "number",
        serviceFee: "number", discount: "number", tip: "number (optional)",
        totalAmount: "number", deliveryAddress: "map - delivery address with GeoPoint",
        estimatedDeliveryTime: "timestamp", actualDeliveryTime: "timestamp (optional)",
        deliveryMethod: "delivery | pickup", paymentProvider: "string",
        preparationTime: "number - estimated minutes",
        trackingUpdates: "array<map> - status updates with timestamps and locations",
        placedAt: "timestamp", confirmedAt: "timestamp (optional)",
        readyAt: "timestamp (optional)", pickedUpAt: "timestamp (optional)",
        deliveredAt: "timestamp (optional)", cancelledAt: "timestamp (optional)",
        customerRating: "number (optional)", driverRating: "number (optional)",
        restaurantRating: "number (optional)", reviewSubmitted: "boolean",
        platformCommission: "number", restaurantEarnings: "number",
        driverEarnings: "number (optional)",
        createdAt: "timestamp", updatedAt: "timestamp"
      },
      subcollections: {}
    },
    setupDate: Timestamp.now(),
    version: "1.0.0"
  };

  await setDoc(doc(db, '_system', 'orders_structure'), ordersStructureDoc);
  console.log('   ✅ Orders structure documented in _system');
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting orders collection setup...\n');
    
    await setupOrdersCollection();
    await updateSystemDocumentation();
    
    console.log('\n✅ Orders collection setup completed successfully!');
    console.log('\n📊 Database now includes:');
    console.log('- 7 Top-level collections: users, admins, vendors, customers, drivers, restaurants, orders');
    console.log('- Complete order lifecycle management');
    console.log('- Real-time order tracking');
    console.log('- Payment and commission tracking');
    console.log('- Customer rating and review system');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
main();

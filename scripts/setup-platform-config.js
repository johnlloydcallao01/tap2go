#!/usr/bin/env node

/**
 * Setup Platform Config Collection for Tap2Go
 * 
 * This script sets up the platformConfig collection with platform-wide settings
 * following the same pattern as other collections.
 * 
 * Usage: node scripts/setup-platform-config.js
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

async function setupPlatformConfigCollection() {
  console.log('🚀 Setting up platformConfig collection...');

  try {
    // Platform Configuration Document
    const platformConfigData = {
      // Commission Rates
      defaultCommissionRates: {
        restaurant: 15.0,              // 15% commission for restaurants
        delivery: 10.0,                // 10% commission for delivery
        payment_processing: 2.9        // 2.9% payment processing fee
      },

      // Delivery Settings
      deliverySettings: {
        maxDeliveryRadius: 15,         // 15 km maximum delivery radius
        avgDeliveryTime: 35,           // 35 minutes average delivery time
        peakHoursMultiplier: 1.5,      // 1.5x multiplier during peak hours
        minimumOrderValue: 10.0        // $10 minimum order value
      },

      // Platform Features
      features: {
        liveTracking: true,
        scheduleOrders: true,
        loyaltyProgram: true,
        multiplePaymentMethods: true,
        promotionsEnabled: true
      },

      // Operational Hours
      platformOperatingHours: {
        monday: [{ open: "06:00", close: "23:00" }],
        tuesday: [{ open: "06:00", close: "23:00" }],
        wednesday: [{ open: "06:00", close: "23:00" }],
        thursday: [{ open: "06:00", close: "23:00" }],
        friday: [{ open: "06:00", close: "24:00" }],
        saturday: [{ open: "07:00", close: "24:00" }],
        sunday: [{ open: "07:00", close: "22:00" }]
      },

      // Supported Regions
      supportedRegions: [
        "New York, NY",
        "Los Angeles, CA", 
        "Chicago, IL",
        "Houston, TX",
        "Phoenix, AZ",
        "Philadelphia, PA",
        "San Antonio, TX",
        "San Diego, CA",
        "Dallas, TX",
        "San Jose, CA"
      ],

      supportedCurrencies: [
        "USD",
        "CAD",
        "EUR",
        "GBP"
      ],

      supportedLanguages: [
        "en",
        "es", 
        "fr",
        "de",
        "it",
        "pt"
      ],

      // App Configuration
      mobileAppConfig: {
        minimumVersion: "1.0.0",
        forceUpdate: false,
        maintenanceMode: false,
        maintenanceMessage: null
      },

      // Notification Templates
      notificationTemplates: {
        orderConfirmed: {
          title: "Order Confirmed! 🎉",
          body: "Your order has been confirmed and is being prepared."
        },
        orderReady: {
          title: "Order Ready for Pickup! 📦",
          body: "Your order is ready and waiting for pickup."
        },
        orderDelivered: {
          title: "Order Delivered! ✅",
          body: "Your order has been successfully delivered. Enjoy your meal!"
        },
        orderCancelled: {
          title: "Order Cancelled ❌",
          body: "Your order has been cancelled. You will receive a full refund."
        },
        driverAssigned: {
          title: "Driver Assigned! 🚗",
          body: "A driver has been assigned to deliver your order."
        },
        orderPicked: {
          title: "Order Picked Up! 🛵",
          body: "Your driver has picked up your order and is on the way."
        },
        promotionAvailable: {
          title: "Special Offer! 🎁",
          body: "You have a new promotion available. Check it out!"
        },
        loyaltyReward: {
          title: "Loyalty Reward Earned! ⭐",
          body: "Congratulations! You've earned loyalty points."
        },
        paymentFailed: {
          title: "Payment Failed ⚠️",
          body: "There was an issue with your payment. Please update your payment method."
        },
        restaurantClosed: {
          title: "Restaurant Closed 🏪",
          body: "The restaurant is currently closed. Please try again later."
        }
      },

      updatedAt: Timestamp.now(),
      updatedBy: "system_setup_script"
    };

    await setDoc(doc(db, 'platformConfig', 'config'), platformConfigData);
    console.log('   ✅ Created platform configuration: config');

    console.log('\n🎉 Platform config collection setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ platformConfig collection created');
    console.log('- ✅ Commission rates configured (15% restaurant, 10% delivery, 2.9% payment)');
    console.log('- ✅ Delivery settings configured (15km radius, 35min avg time)');
    console.log('- ✅ Platform features enabled (live tracking, loyalty, promotions)');
    console.log('- ✅ Operating hours set for all days');
    console.log('- ✅ 10 supported regions configured');
    console.log('- ✅ Multi-currency and multi-language support');
    console.log('- ✅ Mobile app configuration set');
    console.log('- ✅ 10 notification templates configured');

  } catch (error) {
    console.error('❌ Error setting up platform config collection:', error);
    throw error;
  }
}

// Update system documentation
async function updateSystemDocumentation() {
  console.log('📊 Updating system documentation...');

  const platformConfigStructureDoc = {
    platformConfig: {
      purpose: "Platform-wide settings and configurations",
      docIdFormat: "Fixed ID: 'config'",
      fields: {
        defaultCommissionRates: "map - commission percentages for restaurant, delivery, payment processing",
        deliverySettings: "map - max radius, avg time, peak multiplier, minimum order value",
        features: "map - boolean flags for platform features",
        platformOperatingHours: "map - operating hours for each day of the week",
        supportedRegions: "array<string> - list of supported regions",
        supportedCurrencies: "array<string> - list of supported currencies",
        supportedLanguages: "array<string> - list of supported languages",
        mobileAppConfig: "map - app version, maintenance mode, force update settings",
        notificationTemplates: "map - notification templates for various events",
        updatedAt: "timestamp - last update time",
        updatedBy: "string - who updated the configuration"
      },
      subcollections: {}
    },
    setupDate: Timestamp.now(),
    version: "1.0.0"
  };

  await setDoc(doc(db, '_system', 'platformConfig_structure'), platformConfigStructureDoc);
  console.log('   ✅ Platform config structure documented in _system');
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting platform config collection setup...\n');
    
    await setupPlatformConfigCollection();
    await updateSystemDocumentation();
    
    console.log('\n✅ Platform config collection setup completed successfully!');
    console.log('\n📊 Database now includes:');
    console.log('- 8 Top-level collections: users, admins, vendors, customers, drivers, restaurants, orders, platformConfig');
    console.log('- Platform-wide configuration management');
    console.log('- Commission rate settings');
    console.log('- Delivery and operational settings');
    console.log('- Multi-region and multi-language support');
    console.log('- Comprehensive notification system');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
main();

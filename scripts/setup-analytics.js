#!/usr/bin/env node

/**
 * Setup Analytics Collection for Tap2Go
 * 
 * This script sets up the analytics collection with sample analytics data
 * following the same pattern as other collections.
 * 
 * Usage: node scripts/setup-analytics.js
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

async function setupAnalyticsCollection() {
  console.log('🚀 Setting up analytics collection...');

  try {
    // Sample Analytics 1 - Daily Analytics
    const dailyAnalyticsData = {
      period: "daily",
      date: "2024-01-15",
      totalOrders: 127,
      totalRevenue: 3456.78,
      totalCustomers: 89,
      newCustomers: 12,
      activeDrivers: 15,
      activeRestaurants: 8,
      avgOrderValue: 27.22,
      avgDeliveryTime: 32.5,
      topPerformingRestaurants: [
        {
          restaurantId: "restaurant_001",
          name: "Burger Palace",
          orders: 45,
          revenue: 1234.56,
          rating: 4.8
        },
        {
          restaurantId: "restaurant_002",
          name: "Pizza Corner",
          orders: 38,
          revenue: 987.65,
          rating: 4.6
        },
        {
          restaurantId: "restaurant_003",
          name: "Sushi Express",
          orders: 22,
          revenue: 756.43,
          rating: 4.9
        }
      ],
      topPerformingDrivers: [
        {
          driverId: "driver_001",
          name: "Mike Johnson",
          deliveries: 18,
          earnings: 156.78,
          rating: 4.9,
          avgDeliveryTime: 28.5
        },
        {
          driverId: "driver_002",
          name: "Sarah Wilson",
          deliveries: 16,
          earnings: 142.34,
          rating: 4.8,
          avgDeliveryTime: 30.2
        },
        {
          driverId: "driver_003",
          name: "David Brown",
          deliveries: 14,
          earnings: 128.90,
          rating: 4.7,
          avgDeliveryTime: 31.8
        }
      ],
      popularCuisines: [
        { cuisine: "American", orders: 45, percentage: 35.4 },
        { cuisine: "Italian", orders: 38, percentage: 29.9 },
        { cuisine: "Asian", orders: 22, percentage: 17.3 },
        { cuisine: "Mexican", orders: 15, percentage: 11.8 },
        { cuisine: "Indian", orders: 7, percentage: 5.5 }
      ],
      peakHours: [
        { hour: "12:00", orders: 23, percentage: 18.1 },
        { hour: "13:00", orders: 28, percentage: 22.0 },
        { hour: "18:00", orders: 19, percentage: 15.0 },
        { hour: "19:00", orders: 25, percentage: 19.7 },
        { hour: "20:00", orders: 18, percentage: 14.2 }
      ],
      conversionRate: 68.5,
      customerRetentionRate: 72.3,
      driverUtilizationRate: 85.7,
      platformCommissionEarned: 518.52,
      generatedAt: Timestamp.fromDate(new Date('2024-01-16T00:30:00')),
      generatedBy: "system_analytics_job"
    };

    await setDoc(doc(db, 'analytics', 'daily_2024-01-15'), dailyAnalyticsData);
    console.log('   ✅ Created daily analytics: daily_2024-01-15');

    // Sample Analytics 2 - Weekly Analytics
    const weeklyAnalyticsData = {
      period: "weekly",
      date: "2024-02",
      totalOrders: 856,
      totalRevenue: 23456.89,
      totalCustomers: 234,
      newCustomers: 67,
      activeDrivers: 18,
      activeRestaurants: 12,
      avgOrderValue: 27.41,
      avgDeliveryTime: 33.2,
      topPerformingRestaurants: [
        {
          restaurantId: "restaurant_001",
          name: "Burger Palace",
          orders: 298,
          revenue: 8234.56,
          rating: 4.8
        },
        {
          restaurantId: "restaurant_002",
          name: "Pizza Corner",
          orders: 245,
          revenue: 6987.65,
          rating: 4.6
        },
        {
          restaurantId: "restaurant_004",
          name: "Taco Fiesta",
          orders: 178,
          revenue: 4756.43,
          rating: 4.7
        }
      ],
      topPerformingDrivers: [
        {
          driverId: "driver_001",
          name: "Mike Johnson",
          deliveries: 124,
          earnings: 1156.78,
          rating: 4.9,
          avgDeliveryTime: 29.1
        },
        {
          driverId: "driver_002",
          name: "Sarah Wilson",
          deliveries: 118,
          earnings: 1089.34,
          rating: 4.8,
          avgDeliveryTime: 31.5
        },
        {
          driverId: "driver_004",
          name: "Lisa Garcia",
          deliveries: 102,
          earnings: 945.67,
          rating: 4.9,
          avgDeliveryTime: 28.8
        }
      ],
      popularCuisines: [
        { cuisine: "American", orders: 298, percentage: 34.8 },
        { cuisine: "Italian", orders: 245, percentage: 28.6 },
        { cuisine: "Mexican", orders: 178, percentage: 20.8 },
        { cuisine: "Asian", orders: 89, percentage: 10.4 },
        { cuisine: "Indian", orders: 46, percentage: 5.4 }
      ],
      peakHours: [
        { hour: "12:00", orders: 145, percentage: 16.9 },
        { hour: "13:00", orders: 167, percentage: 19.5 },
        { hour: "18:00", orders: 134, percentage: 15.7 },
        { hour: "19:00", orders: 156, percentage: 18.2 },
        { hour: "20:00", orders: 123, percentage: 14.4 }
      ],
      conversionRate: 71.2,
      customerRetentionRate: 74.8,
      driverUtilizationRate: 87.3,
      platformCommissionEarned: 3518.53,
      generatedAt: Timestamp.fromDate(new Date('2024-02-05T01:00:00')),
      generatedBy: "system_analytics_job"
    };

    await setDoc(doc(db, 'analytics', 'weekly_2024-02'), weeklyAnalyticsData);
    console.log('   ✅ Created weekly analytics: weekly_2024-02');

    // Sample Analytics 3 - Monthly Analytics
    const monthlyAnalyticsData = {
      period: "monthly",
      date: "2024-01",
      totalOrders: 3567,
      totalRevenue: 97834.56,
      totalCustomers: 789,
      newCustomers: 234,
      activeDrivers: 25,
      activeRestaurants: 15,
      avgOrderValue: 27.43,
      avgDeliveryTime: 32.8,
      topPerformingRestaurants: [
        {
          restaurantId: "restaurant_001",
          name: "Burger Palace",
          orders: 1245,
          revenue: 34234.56,
          rating: 4.8
        },
        {
          restaurantId: "restaurant_002",
          name: "Pizza Corner",
          orders: 987,
          revenue: 27987.65,
          rating: 4.6
        },
        {
          restaurantId: "restaurant_004",
          name: "Taco Fiesta",
          orders: 678,
          revenue: 18756.43,
          rating: 4.7
        },
        {
          restaurantId: "restaurant_003",
          name: "Sushi Express",
          orders: 456,
          revenue: 12345.67,
          rating: 4.9
        },
        {
          restaurantId: "restaurant_005",
          name: "Curry House",
          orders: 201,
          revenue: 4510.25,
          rating: 4.5
        }
      ],
      topPerformingDrivers: [
        {
          driverId: "driver_001",
          name: "Mike Johnson",
          deliveries: 456,
          earnings: 4234.78,
          rating: 4.9,
          avgDeliveryTime: 29.5
        },
        {
          driverId: "driver_002",
          name: "Sarah Wilson",
          deliveries: 423,
          earnings: 3987.34,
          rating: 4.8,
          avgDeliveryTime: 31.2
        },
        {
          driverId: "driver_004",
          name: "Lisa Garcia",
          deliveries: 389,
          earnings: 3654.67,
          rating: 4.9,
          avgDeliveryTime: 28.9
        },
        {
          driverId: "driver_003",
          name: "David Brown",
          deliveries: 345,
          earnings: 3234.90,
          rating: 4.7,
          avgDeliveryTime: 32.1
        },
        {
          driverId: "driver_005",
          name: "John Smith",
          deliveries: 298,
          earnings: 2789.45,
          rating: 4.6,
          avgDeliveryTime: 33.4
        }
      ],
      popularCuisines: [
        { cuisine: "American", orders: 1245, percentage: 34.9 },
        { cuisine: "Italian", orders: 987, percentage: 27.7 },
        { cuisine: "Mexican", orders: 678, percentage: 19.0 },
        { cuisine: "Asian", orders: 456, percentage: 12.8 },
        { cuisine: "Indian", orders: 201, percentage: 5.6 }
      ],
      peakHours: [
        { hour: "12:00", orders: 567, percentage: 15.9 },
        { hour: "13:00", orders: 678, percentage: 19.0 },
        { hour: "18:00", orders: 534, percentage: 15.0 },
        { hour: "19:00", orders: 645, percentage: 18.1 },
        { hour: "20:00", orders: 489, percentage: 13.7 }
      ],
      conversionRate: 69.8,
      customerRetentionRate: 76.2,
      driverUtilizationRate: 84.6,
      platformCommissionEarned: 14675.18,
      generatedAt: Timestamp.fromDate(new Date('2024-02-01T02:00:00')),
      generatedBy: "system_analytics_job"
    };

    await setDoc(doc(db, 'analytics', 'monthly_2024-01'), monthlyAnalyticsData);
    console.log('   ✅ Created monthly analytics: monthly_2024-01');

    console.log('\n🎉 Analytics collection setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ analytics collection created');
    console.log('- ✅ 3 sample analytics documents added (daily, weekly, monthly)');
    console.log('- ✅ Complete performance metrics included');
    console.log('- ✅ Top performing restaurants and drivers tracked');
    console.log('- ✅ Popular cuisines and peak hours analytics');
    console.log('- ✅ Conversion and retention rates included');
    console.log('- ✅ Platform commission tracking');
    console.log('- ✅ Driver utilization metrics');

  } catch (error) {
    console.error('❌ Error setting up analytics collection:', error);
    throw error;
  }
}

// Update system documentation
async function updateSystemDocumentation() {
  console.log('📊 Updating system documentation...');

  const analyticsStructureDoc = {
    analytics: {
      purpose: "Platform-wide analytics and reporting",
      docIdFormat: "daily_YYYY-MM-DD | weekly_YYYY-WW | monthly_YYYY-MM",
      fields: {
        period: "daily | weekly | monthly",
        date: "string - date identifier",
        totalOrders: "number - total orders in period",
        totalRevenue: "number - total revenue generated",
        totalCustomers: "number - total customers served",
        newCustomers: "number - new customers acquired",
        activeDrivers: "number - active drivers in period",
        activeRestaurants: "number - active restaurants in period",
        avgOrderValue: "number - average order value",
        avgDeliveryTime: "number - average delivery time in minutes",
        topPerformingRestaurants: "array<map> - top restaurants with metrics",
        topPerformingDrivers: "array<map> - top drivers with metrics",
        popularCuisines: "array<map> - cuisine popularity statistics",
        peakHours: "array<map> - peak hour analytics",
        conversionRate: "number - conversion rate percentage",
        customerRetentionRate: "number - customer retention percentage",
        driverUtilizationRate: "number - driver utilization percentage",
        platformCommissionEarned: "number - total commission earned",
        generatedAt: "timestamp - when analytics were generated",
        generatedBy: "string (optional) - who/what generated the analytics"
      },
      subcollections: {}
    },
    setupDate: Timestamp.now(),
    version: "1.0.0"
  };

  await setDoc(doc(db, '_system', 'analytics_structure'), analyticsStructureDoc);
  console.log('   ✅ Analytics structure documented in _system');
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting analytics collection setup...\n');
    
    await setupAnalyticsCollection();
    await updateSystemDocumentation();
    
    console.log('\n✅ Analytics collection setup completed successfully!');
    console.log('\n📊 Database now includes:');
    console.log('- 11 Top-level collections: users, admins, vendors, customers, drivers, restaurants, orders, platformConfig, notifications, disputes, analytics');
    console.log('- Comprehensive analytics and reporting system');
    console.log('- Daily, weekly, and monthly analytics tracking');
    console.log('- Performance metrics for restaurants and drivers');
    console.log('- Customer behavior and retention analytics');
    console.log('- Platform revenue and commission tracking');
    console.log('- Business intelligence and insights');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
main();

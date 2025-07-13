/**
 * Demo Data Generator for Tap2Go Analytics
 * Generates realistic sample data for all analytics components
 */

import {
  RevenueAnalytics,
  OrderAnalytics,
  VendorSalesAnalytics,
  DriverEarningsAnalytics,
  DriverDeliveryAnalytics,
  CustomerOrderHistory,
  CustomerSpendingAnalytics,
  CustomerPreferences,
} from './types';

// Helper function to generate dates
const generateDates = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// Helper function to generate random numbers
const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Generate Admin Revenue Analytics Data
export const generateAdminRevenueData = (): RevenueAnalytics => {
  const dates = generateDates(30);
  
  return {
    totalRevenue: 2847650,
    platformRevenue: 427148,
    vendorRevenue: 1988755,
    driverRevenue: 431747,
    revenueByPeriod: dates.map(date => ({
      date,
      value: randomFloat(80000, 120000),
    })),
    revenueBreakdown: {
      platformFees: 427148,
      commissions: 284765,
      deliveryFees: 142383,
    },
  };
};

// Generate Admin Order Analytics Data
export const generateAdminOrderData = (): OrderAnalytics => {
  const dates = generateDates(30);
  
  return {
    totalOrders: 15847,
    completedOrders: 13428,
    cancelledOrders: 1267,
    pendingOrders: 1152,
    ordersByHour: Array.from({ length: 24 }, (_, i) => ({
      x: i,
      y: i >= 6 && i <= 22 ? randomBetween(200, 800) : randomBetween(50, 200),
    })),
    orderStatusDistribution: [
      { status: 'Delivered', count: 13428, percentage: 84.7 },
      { status: 'Cancelled', count: 1267, percentage: 8.0 },
      { status: 'Pending', count: 1152, percentage: 7.3 },
    ],
    averageOrderValue: 485.50,
    orderTrends: dates.map(date => ({
      date,
      value: randomBetween(400, 700),
    })),
  };
};

// Generate Vendor Sales Analytics Data
export const generateVendorSalesData = (): VendorSalesAnalytics => {
  const dates = generateDates(30);
  
  return {
    dailySales: dates.map(date => ({
      date,
      value: randomFloat(15000, 35000),
    })),
    topSellingItems: [
      { itemId: '1', itemName: 'Chicken Burger Deluxe', quantity: 245, revenue: 73500 },
      { itemId: '2', itemName: 'Beef Sisig Rice Bowl', quantity: 198, revenue: 59400 },
      { itemId: '3', itemName: 'Crispy Pork Belly', quantity: 167, revenue: 50100 },
      { itemId: '4', itemName: 'Seafood Pasta', quantity: 134, revenue: 40200 },
      { itemId: '5', itemName: 'Grilled Chicken', quantity: 123, revenue: 36900 },
    ],
    salesByTimeOfDay: Array.from({ length: 24 }, (_, i) => ({
      x: i,
      y: i >= 6 && i <= 22 ? randomFloat(2000, 8000) : randomFloat(500, 2000),
    })),
    averageOrderValue: 425.75,
    totalRevenue: 687500,
    orderCount: 1615,
  };
};

// Generate Driver Earnings Analytics Data
export const generateDriverEarningsData = (): DriverEarningsAnalytics => {
  const dates = generateDates(30);
  
  return {
    dailyEarnings: dates.map(date => ({
      date,
      value: randomFloat(800, 1500),
    })),
    earningsBreakdown: {
      basePay: 18500,
      tips: 4200,
      bonuses: 2800,
      incentives: 1500,
    },
    averageEarningsPerDelivery: 185.50,
    totalEarnings: 27000,
    earningsByTimeOfDay: Array.from({ length: 24 }, (_, i) => ({
      x: i,
      y: i >= 6 && i <= 22 ? randomFloat(100, 300) : randomFloat(20, 100),
    })),
  };
};

// Generate Driver Delivery Analytics Data
export const generateDriverDeliveryData = (): DriverDeliveryAnalytics => {
  const dates = generateDates(30);
  
  return {
    deliveryMetrics: {
      totalDeliveries: 145,
      averageDeliveryTime: 28.5,
      averageDistance: 4.2,
      completionRate: 0.96,
    },
    deliveryTrends: dates.map(date => ({
      date,
      value: randomBetween(3, 8),
    })),
    performanceRating: 4.8,
    deliveryZonePerformance: [
      { zone: 'Makati CBD', deliveries: 45, averageTime: 25.2, earnings: 8100 },
      { zone: 'BGC', deliveries: 38, averageTime: 30.1, earnings: 6840 },
      { zone: 'Ortigas', deliveries: 32, averageTime: 28.8, earnings: 5760 },
      { zone: 'Quezon City', deliveries: 30, averageTime: 32.5, earnings: 5400 },
    ],
  };
};

// Generate Customer Order History Data
export const generateCustomerOrderHistory = (): CustomerOrderHistory => {
  const dates = generateDates(90);
  
  return {
    orderHistory: [
      {
        orderId: 'ORD-2024-001234',
        restaurantName: 'Jollibee - SM Mall of Asia',
        orderDate: '2024-01-15',
        totalAmount: 485,
        status: 'delivered',
        deliveryTime: 28,
      },
      {
        orderId: 'ORD-2024-001235',
        restaurantName: 'McDonald\'s - Greenbelt',
        orderDate: '2024-01-14',
        totalAmount: 320,
        status: 'delivered',
        deliveryTime: 25,
      },
      {
        orderId: 'ORD-2024-001236',
        restaurantName: 'KFC - Ayala Triangle',
        orderDate: '2024-01-12',
        totalAmount: 275,
        status: 'cancelled',
        deliveryTime: 0,
      },
    ],
    orderPatterns: dates.filter((_, i) => i % 3 === 0).map(date => ({
      date,
      value: randomBetween(0, 3),
    })),
    favoriteRestaurants: [
      { restaurantId: '1', restaurantName: 'Jollibee - SM Mall of Asia', orderCount: 12, totalSpent: 5820 },
      { restaurantId: '2', restaurantName: 'McDonald\'s - Greenbelt', orderCount: 8, totalSpent: 2560 },
      { restaurantId: '3', restaurantName: 'KFC - Ayala Triangle', orderCount: 6, totalSpent: 1650 },
      { restaurantId: '4', restaurantName: 'Chowking - Robinson\'s', orderCount: 5, totalSpent: 1375 },
      { restaurantId: '5', restaurantName: 'Mang Inasal - Gateway', orderCount: 4, totalSpent: 1200 },
    ],
  };
};

// Generate Customer Spending Analytics Data
export const generateCustomerSpendingData = (): CustomerSpendingAnalytics => {
  const months = ['2023-09', '2023-10', '2023-11', '2023-12', '2024-01'];
  
  return {
    monthlySpending: months.map(date => ({
      date,
      value: randomFloat(2000, 4500),
    })),
    spendingBreakdown: {
      food: 12850,
      deliveryFees: 1285,
      tips: 642,
      taxes: 385,
    },
    averageOrderValue: 385.50,
    totalSpent: 15162,
    savingsFromPromotions: 1850,
  };
};

// Generate Customer Preferences Data
export const generateCustomerPreferences = (): CustomerPreferences => {
  return {
    cuisinePreferences: [
      { cuisine: 'Filipino', orderCount: 18, percentage: 45.0 },
      { cuisine: 'American', orderCount: 8, percentage: 20.0 },
      { cuisine: 'Chinese', orderCount: 6, percentage: 15.0 },
      { cuisine: 'Italian', orderCount: 4, percentage: 10.0 },
      { cuisine: 'Japanese', orderCount: 4, percentage: 10.0 },
    ],
    orderingPatterns: [
      { dayOfWeek: 'Monday', orderCount: 3 },
      { dayOfWeek: 'Tuesday', orderCount: 2 },
      { dayOfWeek: 'Wednesday', orderCount: 4 },
      { dayOfWeek: 'Thursday', orderCount: 5 },
      { dayOfWeek: 'Friday', orderCount: 8 },
      { dayOfWeek: 'Saturday', orderCount: 12 },
      { dayOfWeek: 'Sunday', orderCount: 6 },
    ],
    timePreferences: Array.from({ length: 24 }, (_, i) => ({
      x: i,
      y: i >= 11 && i <= 13 ? randomBetween(3, 8) : 
          i >= 18 && i <= 20 ? randomBetween(4, 10) : 
          randomBetween(0, 3),
    })),
    deliveryTimePreferences: [
      { timeSlot: '11:00-13:00', frequency: 15 },
      { timeSlot: '18:00-20:00', frequency: 20 },
      { timeSlot: '20:00-22:00', frequency: 8 },
      { timeSlot: '13:00-15:00', frequency: 5 },
    ],
  };
};

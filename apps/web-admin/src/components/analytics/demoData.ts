/**
 * Admin Analytics Demo Data
 * Demo data generators for admin analytics charts and dashboards
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import type {
  RevenueAnalytics,
  OrderAnalytics,
  TimeSeriesData, // Used in RevenueAnalytics and OrderAnalytics
  ChartDataPoint // Used in OrderAnalytics
} from './types';

// Helper functions
const randomBetween = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number): number => 
  Math.random() * (max - min) + min;

const generateDates = (days: number): string[] => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
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

// Generate Vendor Sales Data (for admin vendor analytics)
export const generateVendorSalesData = () => {
  const dates = generateDates(30);
  
  return {
    totalSales: 1245680,
    totalOrders: 8934,
    averageOrderValue: 139.45,
    salesByPeriod: dates.map(date => ({
      date,
      value: randomFloat(35000, 55000),
    })),
    topMenuItems: [
      { name: 'Margherita Pizza', sales: 1247, revenue: 18705 },
      { name: 'Chicken Burger', sales: 1089, revenue: 16335 },
      { name: 'Caesar Salad', sales: 967, revenue: 12571 },
      { name: 'Pasta Carbonara', sales: 834, revenue: 14178 },
      { name: 'Fish & Chips', sales: 723, revenue: 13614 },
    ],
    peakHours: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders: i >= 11 && i <= 14 || i >= 18 && i <= 21 
        ? randomBetween(80, 150) 
        : randomBetween(10, 40),
    })),
  };
};

// Generate Driver Performance Data (for admin driver analytics)
export const generateDriverPerformanceData = () => {
  return {
    totalDrivers: 156,
    activeDrivers: 89,
    averageDeliveryTime: 28.5,
    completionRate: 94.2,
    topPerformers: [
      { name: 'John Smith', deliveries: 234, rating: 4.9, earnings: 3456 },
      { name: 'Maria Garcia', deliveries: 198, rating: 4.8, earnings: 2987 },
      { name: 'David Chen', deliveries: 187, rating: 4.7, earnings: 2834 },
      { name: 'Sarah Johnson', deliveries: 176, rating: 4.8, earnings: 2756 },
      { name: 'Ahmed Hassan', deliveries: 165, rating: 4.6, earnings: 2543 },
    ],
    deliveryTimes: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      avgTime: i >= 11 && i <= 14 || i >= 18 && i <= 21 
        ? randomBetween(35, 45) 
        : randomBetween(20, 30),
    })),
  };
};

// Generate Customer Analytics Data
export const generateCustomerAnalyticsData = () => {
  const dates = generateDates(30);
  
  return {
    totalCustomers: 12847,
    activeCustomers: 8934,
    newCustomers: 234,
    customerGrowth: dates.map(date => ({
      date,
      value: randomBetween(15, 45),
    })),
    customerSegments: [
      { segment: 'Regular', count: 5678, percentage: 44.2 },
      { segment: 'Occasional', count: 4321, percentage: 33.6 },
      { segment: 'New', count: 1987, percentage: 15.5 },
      { segment: 'VIP', count: 861, percentage: 6.7 },
    ],
    retentionRate: 78.5,
    averageOrderFrequency: 2.3,
  };
};

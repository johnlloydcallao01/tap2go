/**
 * Analytics Types for Tap2Go Platform
 * Comprehensive type definitions for all analytics data structures
 */

// Base chart data interfaces
export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}



export interface VendorPerformance {
  vendorId: string;
  vendorName: string;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
  averagePreparationTime: number;
}

export interface DriverPerformance {
  driverId: string;
  driverName: string;
  totalDeliveries: number;
  totalEarnings: number;
  averageRating: number;
  averageDeliveryTime: number;
  completionRate: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  customerLifetimeValue: number;
  customersByLocation: {
    location: string;
    count: number;
  }[];
}

// Vendor Panel Analytics Types
export interface VendorSalesAnalytics {
  dailySales: TimeSeriesData[];
  topSellingItems: {
    itemId: string;
    itemName: string;
    quantity: number;
    revenue: number;
  }[];
  salesByTimeOfDay: ChartDataPoint[];
  averageOrderValue: number;
  totalRevenue: number;
  orderCount: number;
}

export interface VendorOrderAnalytics {
  orderVolume: TimeSeriesData[];
  orderStatusBreakdown: {
    status: string;
    count: number;
    percentage: number;
  }[];
  averagePreparationTime: number;
  peakHours: ChartDataPoint[];
  rejectionRate: number;
}

export interface VendorCustomerFeedback {
  averageRating: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  reviewSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  customerRetentionRate: number;
}

// Driver Panel Analytics Types
export interface DriverEarningsAnalytics {
  dailyEarnings: TimeSeriesData[];
  earningsBreakdown: {
    basePay: number;
    tips: number;
    bonuses: number;
    incentives: number;
  };
  averageEarningsPerDelivery: number;
  totalEarnings: number;
  earningsByTimeOfDay: ChartDataPoint[];
}

export interface DriverDeliveryAnalytics {
  deliveryMetrics: {
    totalDeliveries: number;
    averageDeliveryTime: number;
    averageDistance: number;
    completionRate: number;
  };
  deliveryTrends: TimeSeriesData[];
  performanceRating: number;
  deliveryZonePerformance: {
    zone: string;
    deliveries: number;
    averageTime: number;
    earnings: number;
  }[];
}

// Customer Panel Analytics Types
export interface CustomerOrderHistory {
  orderHistory: {
    orderId: string;
    restaurantName: string;
    orderDate: string;
    totalAmount: number;
    status: string;
    deliveryTime: number;
  }[];
  orderPatterns: TimeSeriesData[];
  favoriteRestaurants: {
    restaurantId: string;
    restaurantName: string;
    orderCount: number;
    totalSpent: number;
  }[];
}

export interface CustomerSpendingAnalytics {
  monthlySpending: TimeSeriesData[];
  spendingBreakdown: {
    food: number;
    deliveryFees: number;
    tips: number;
    taxes: number;
  };
  averageOrderValue: number;
  totalSpent: number;
  savingsFromPromotions: number;
}

export interface CustomerPreferences {
  cuisinePreferences: {
    cuisine: string;
    orderCount: number;
    percentage: number;
  }[];
  orderingPatterns: {
    dayOfWeek: string;
    orderCount: number;
  }[];
  timePreferences: ChartDataPoint[];
  deliveryTimePreferences: {
    timeSlot: string;
    frequency: number;
  }[];
}

// Geographic Analytics Types
export interface GeographicData {
  latitude: number;
  longitude: number;
  value: number;
  label?: string;
  color?: string;
}

export interface DeliveryHeatmapData {
  coordinates: GeographicData[];
  zones: {
    zoneName: string;
    orderDensity: number;
    averageDeliveryTime: number;
    driverCount: number;
  }[];
}

// Re-export ECharts types for convenience
export type { CallbackDataParams } from 'echarts/types/dist/shared';
export type { ECharts } from 'echarts';

// Chart Configuration Types
export interface ChartConfig {
  title?: string;
  subtitle?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  showLegend?: boolean;
  height?: number;
  width?: number;
  colors?: string[];
  responsive?: boolean;
}

// API Response Types
export interface AnalyticsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// Filter Types
export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export interface AnalyticsFilters {
  dateRange?: DateRangeFilter;
  vendorId?: string;
  driverId?: string;
  customerId?: string;
  location?: string;
  orderStatus?: string;
}

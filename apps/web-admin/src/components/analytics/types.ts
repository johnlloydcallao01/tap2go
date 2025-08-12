/**
 * Analytics Types for Tap2Go Admin
 */

import type { ECharts as EChartsInstance } from 'echarts';

export type ECharts = EChartsInstance;

export interface ChartConfig {
  title?: string;
  subtitle?: string;
  height?: number;
  showLegend?: boolean;
  responsive?: boolean;
}

export interface AnalyticsData {
  period: string;
  revenue: number;
  orders: number;
  users: number;
  averageOrderValue: number;
  conversionRate: number;
  pageViews: number;
  sessionDuration: number;
  bounceRate: number;
}

// Time series data interface
export interface TimeSeriesData {
  date: string;
  value: number;
}

// Chart data point interface
export interface ChartDataPoint {
  x: number;
  y: number;
}

// Admin Panel Analytics Types
export interface RevenueAnalytics {
  totalRevenue: number;
  platformRevenue: number;
  vendorRevenue: number;
  driverRevenue: number;
  revenueByPeriod: TimeSeriesData[];
  revenueBreakdown: {
    platformFees: number;
    commissions: number;
    deliveryFees: number;
  };
}

export interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  ordersByHour: ChartDataPoint[];
  orderStatusDistribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  averageOrderValue: number;
  orderTrends: TimeSeriesData[];
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  commission: number;
  refunds: number;
  netRevenue: number;
}

export interface UserData {
  date: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  retentionRate: number;
  churnRate: number;
}

export interface OrderData {
  date: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
}

export interface PerformanceData {
  date: string;
  orderFulfillmentRate: number;
  averageDeliveryTime: number;
  customerSatisfactionScore: number;
  restaurantResponseTime: number;
  driverUtilizationRate: number;
  systemUptime: number;
  apiResponseTime: number;
  errorRate: number;
}

export interface TopPerformer {
  id: string;
  name: string;
  type: 'restaurant' | 'category' | 'item';
  revenue: number;
  orders: number;
  growthRate: number;
}

export interface UserSegment {
  id: string;
  name: string;
  userCount: number;
  percentage: number;
  averageSpend: number;
  retentionRate: number;
  growthRate: number;
}

export interface SystemHealth {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastIncident?: string;
}

export interface KPITarget {
  metric: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'chart' | 'table' | 'dashboard' | 'export';
  category: 'sales' | 'users' | 'operations' | 'financial' | 'marketing';
  status: 'active' | 'draft' | 'scheduled';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  filters: {
    dateRange: string;
    restaurants?: string[];
    categories?: string[];
    userSegments?: string[];
  };
  metrics: string[];
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  createdBy: string;
  runCount: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  metrics: string[];
  defaultFilters: Record<string, unknown>;
  usageCount: number;
}

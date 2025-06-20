import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from './collections';
import { AnalyticsDocument } from './schema';

// ===== ANALYTICS OPERATIONS =====

export const createAnalytics = async (
  analyticsData: Omit<AnalyticsDocument, 'generatedAt'>,
  analyticsId: string
): Promise<void> => {
  const analyticsDoc: AnalyticsDocument = {
    ...analyticsData,
    generatedAt: serverTimestamp() as Timestamp,
  };

  await setDoc(doc(db, COLLECTIONS.ANALYTICS, analyticsId), analyticsDoc);
};

export const getAnalytics = async (analyticsId: string): Promise<AnalyticsDocument | null> => {
  const analyticsRef = doc(db, COLLECTIONS.ANALYTICS, analyticsId);
  const analyticsSnap = await getDoc(analyticsRef);

  if (analyticsSnap.exists()) {
    return analyticsSnap.data() as AnalyticsDocument;
  }
  return null;
};

export const updateAnalytics = async (
  analyticsId: string,
  updates: Partial<AnalyticsDocument>
): Promise<void> => {
  const analyticsRef = doc(db, COLLECTIONS.ANALYTICS, analyticsId);
  await updateDoc(analyticsRef, updates);
};

// ===== ANALYTICS QUERIES =====

export const getAnalyticsByPeriod = async (
  period: AnalyticsDocument['period'],
  limitCount = 30
): Promise<AnalyticsDocument[]> => {
  const analyticsRef = collection(db, COLLECTIONS.ANALYTICS);
  const q = query(
    analyticsRef,
    where('period', '==', period),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => doc.data() as AnalyticsDocument);
};

export const getDailyAnalytics = async (limitCount = 30): Promise<AnalyticsDocument[]> => {
  return getAnalyticsByPeriod('daily', limitCount);
};

export const getWeeklyAnalytics = async (limitCount = 12): Promise<AnalyticsDocument[]> => {
  return getAnalyticsByPeriod('weekly', limitCount);
};

export const getMonthlyAnalytics = async (limitCount = 12): Promise<AnalyticsDocument[]> => {
  return getAnalyticsByPeriod('monthly', limitCount);
};

export const getAnalyticsForDate = async (
  period: AnalyticsDocument['period'],
  date: string
): Promise<AnalyticsDocument | null> => {
  const analyticsId = `${period}_${date}`;
  return getAnalytics(analyticsId);
};

export const getLatestAnalytics = async (
  period: AnalyticsDocument['period']
): Promise<AnalyticsDocument | null> => {
  const analytics = await getAnalyticsByPeriod(period, 1);
  return analytics.length > 0 ? analytics[0] : null;
};

// ===== ANALYTICS GENERATION HELPERS =====

export const generateDailyAnalyticsId = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `daily_${year}-${month}-${day}`;
};

export const generateWeeklyAnalyticsId = (date: Date): string => {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `weekly_${year}-${String(week).padStart(2, '0')}`;
};

export const generateMonthlyAnalyticsId = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `monthly_${year}-${month}`;
};

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// ===== ANALYTICS AGGREGATION =====

export const calculateTotalRevenue = async (
  period: AnalyticsDocument['period'],
  startDate?: string,
  endDate?: string
): Promise<number> => {
  const analytics = await getAnalyticsByPeriod(period, 100);

  let filteredAnalytics = analytics;
  if (startDate && endDate) {
    filteredAnalytics = analytics.filter(a => a.date >= startDate && a.date <= endDate);
  }

  return filteredAnalytics.reduce((total, a) => total + a.totalRevenue, 0);
};

export const calculateTotalOrders = async (
  period: AnalyticsDocument['period'],
  startDate?: string,
  endDate?: string
): Promise<number> => {
  const analytics = await getAnalyticsByPeriod(period, 100);

  let filteredAnalytics = analytics;
  if (startDate && endDate) {
    filteredAnalytics = analytics.filter(a => a.date >= startDate && a.date <= endDate);
  }

  return filteredAnalytics.reduce((total, a) => total + a.totalOrders, 0);
};

export const getAverageOrderValue = async (
  period: AnalyticsDocument['period'],
  startDate?: string,
  endDate?: string
): Promise<number> => {
  const analytics = await getAnalyticsByPeriod(period, 100);

  let filteredAnalytics = analytics;
  if (startDate && endDate) {
    filteredAnalytics = analytics.filter(a => a.date >= startDate && a.date <= endDate);
  }

  if (filteredAnalytics.length === 0) return 0;

  const avgSum = filteredAnalytics.reduce((total, a) => total + a.avgOrderValue, 0);
  return avgSum / filteredAnalytics.length;
};

export const getAverageDeliveryTime = async (
  period: AnalyticsDocument['period'],
  startDate?: string,
  endDate?: string
): Promise<number> => {
  const analytics = await getAnalyticsByPeriod(period, 100);

  let filteredAnalytics = analytics;
  if (startDate && endDate) {
    filteredAnalytics = analytics.filter(a => a.date >= startDate && a.date <= endDate);
  }

  if (filteredAnalytics.length === 0) return 0;

  const avgSum = filteredAnalytics.reduce((total, a) => total + a.avgDeliveryTime, 0);
  return avgSum / filteredAnalytics.length;
};

// ===== PERFORMANCE ANALYTICS =====

export const getTopPerformingRestaurants = async (
  period: AnalyticsDocument['period'],
  limit = 10
): Promise<{ restaurantId: string; name: string; totalOrders: number; totalRevenue: number; avgRating: number }[]> => {
  const analytics = await getAnalyticsByPeriod(period, 30);

  const restaurantPerformance = new Map();

  analytics.forEach(analytic => {
    analytic.topPerformingRestaurants.forEach(restaurant => {
      const existing = restaurantPerformance.get(restaurant.restaurantId) || {
        restaurantId: restaurant.restaurantId,
        name: restaurant.name,
        totalOrders: 0,
        totalRevenue: 0,
        ratings: []
      };

      existing.totalOrders += restaurant.orders;
      existing.totalRevenue += restaurant.revenue;
      existing.ratings.push(restaurant.rating);

      restaurantPerformance.set(restaurant.restaurantId, existing);
    });
  });

  return Array.from(restaurantPerformance.values())
    .map(restaurant => ({
      ...restaurant,
      avgRating: restaurant.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / restaurant.ratings.length
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
};

export const getTopPerformingDrivers = async (
  period: AnalyticsDocument['period'],
  limit = 10
): Promise<{ driverId: string; name: string; totalDeliveries: number; totalEarnings: number; avgRating: number }[]> => {
  const analytics = await getAnalyticsByPeriod(period, 30);

  const driverPerformance = new Map();

  analytics.forEach(analytic => {
    analytic.topPerformingDrivers.forEach(driver => {
      const existing = driverPerformance.get(driver.driverId) || {
        driverId: driver.driverId,
        name: driver.name,
        totalDeliveries: 0,
        totalEarnings: 0,
        ratings: []
      };

      existing.totalDeliveries += driver.deliveries;
      existing.totalEarnings += driver.earnings;
      existing.ratings.push(driver.rating);

      driverPerformance.set(driver.driverId, existing);
    });
  });

  return Array.from(driverPerformance.values())
    .map(driver => ({
      ...driver,
      avgRating: driver.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / driver.ratings.length
    }))
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, limit);
};

export const getPopularCuisines = async (
  period: AnalyticsDocument['period']
): Promise<{ cuisine: string; totalOrders: number; percentage: number }[]> => {
  const analytics = await getAnalyticsByPeriod(period, 30);

  const cuisineStats = new Map();
  let totalOrders = 0;

  analytics.forEach(analytic => {
    analytic.popularCuisines.forEach(cuisine => {
      const existing = cuisineStats.get(cuisine.cuisine) || 0;
      cuisineStats.set(cuisine.cuisine, existing + cuisine.orders);
      totalOrders += cuisine.orders;
    });
  });

  return Array.from(cuisineStats.entries())
    .map(([cuisine, orders]) => ({
      cuisine,
      totalOrders: orders,
      percentage: Math.round((orders / totalOrders) * 100 * 100) / 100
    }))
    .sort((a, b) => b.totalOrders - a.totalOrders);
};

// ===== UTILITY FUNCTIONS =====

export const checkAnalyticsExists = async (analyticsId: string): Promise<boolean> => {
  const analytics = await getAnalytics(analyticsId);
  return analytics !== null;
};

export const getAnalyticsDateRange = async (
  period: AnalyticsDocument['period']
): Promise<{ startDate: string; endDate: string } | null> => {
  const analytics = await getAnalyticsByPeriod(period, 100);

  if (analytics.length === 0) return null;

  const dates = analytics.map(a => a.date).sort();
  return {
    startDate: dates[0],
    endDate: dates[dates.length - 1]
  };
};

export const getGrowthRate = async (
  period: AnalyticsDocument['period'],
  metric: 'totalOrders' | 'totalRevenue' | 'totalCustomers'
): Promise<number> => {
  const analytics = await getAnalyticsByPeriod(period, 2);

  if (analytics.length < 2) return 0;

  const latest = analytics[0];
  const previous = analytics[1];

  const latestValue = latest[metric];
  const previousValue = previous[metric];

  if (previousValue === 0) return 0;

  return Math.round(((latestValue - previousValue) / previousValue) * 100 * 100) / 100;
};

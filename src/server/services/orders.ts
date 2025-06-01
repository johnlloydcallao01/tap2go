import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Order interface for type safety
interface OrderData {
  id: string;
  customerId: string;
  vendorId: string;
  driverId?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  pricing?: {
    subtotal: number;
    tax: number;
    deliveryFee: number;
    platformFee: number;
    total: number;
  };
  earnings?: {
    vendorEarnings: number;
    driverEarnings: number;
    platformCommission: number;
  };
  createdAt: Date;
  [key: string]: unknown;
}

// Admin-specific order operations with elevated privileges

export interface AdminOrderDocument {
  id: string;
  customerId: string;
  vendorId: string;
  driverId?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    customizations?: string[];
  }>;
  pricing: {
    subtotal: number;
    tax: number;
    deliveryFee: number;
    platformFee: number;
    total: number;
  };
  earnings: {
    vendorEarnings: number;
    driverEarnings: number;
    platformCommission: number;
  };
  addresses: {
    pickup: {
      street: string;
      city: string;
      coordinates: { latitude: number; longitude: number };
    };
    delivery: {
      street: string;
      city: string;
      coordinates: { latitude: number; longitude: number };
    };
  };
  timeline: {
    ordered: Date;
    confirmed?: Date;
    preparing?: Date;
    ready?: Date;
    pickedUp?: Date;
    delivered?: Date;
    cancelled?: Date;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

// Admin function to get order analytics
export const adminGetOrderAnalytics = async (dateRange?: { start: Date; end: Date }): Promise<{
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  platformRevenue: number;
  averageOrderValue: number;
  completionRate: number;
  cancellationRate: number;
}> => {
  const ordersRef = adminDb.collection('orders');
  let ordersSnapshot;

  if (dateRange) {
    ordersSnapshot = await ordersRef
      .where('createdAt', '>=', dateRange.start)
      .where('createdAt', '<=', dateRange.end)
      .get();
  } else {
    ordersSnapshot = await ordersRef.get();
  }
  const orders: OrderData[] = ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  } as OrderData));

  const analytics = {
    totalOrders: orders.length,
    completedOrders: orders.filter(order => order.status === 'delivered').length,
    cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
    pendingOrders: orders.filter(order => ['pending', 'confirmed', 'preparing', 'ready', 'picked_up'].includes(order.status)).length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0),
    platformRevenue: orders.reduce((sum, order) => sum + (order.earnings?.platformCommission || 0), 0),
    averageOrderValue: 0,
    completionRate: 0,
    cancellationRate: 0
  };

  if (analytics.totalOrders > 0) {
    analytics.averageOrderValue = analytics.totalRevenue / analytics.totalOrders;
    analytics.completionRate = (analytics.completedOrders / analytics.totalOrders) * 100;
    analytics.cancellationRate = (analytics.cancelledOrders / analytics.totalOrders) * 100;
  }

  return analytics;
};

// Admin function to get orders by status
export const adminGetOrdersByStatus = async (status: string, limit: number = 50): Promise<AdminOrderDocument[]> => {
  const snapshot = await adminDb.collection('orders')
    .where('status', '==', status)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  } as AdminOrderDocument));
};

// Admin function to force cancel an order
export const adminCancelOrder = async (orderId: string, adminUid: string, reason: string): Promise<void> => {
  const orderRef = adminDb.collection('orders').doc(orderId);
  
  await orderRef.update({
    status: 'cancelled',
    cancelledBy: adminUid,
    cancellationReason: reason,
    'timeline.cancelled': FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
};

// Admin function to reassign order to different driver
export const adminReassignOrder = async (orderId: string, newDriverId: string, adminUid: string): Promise<void> => {
  const orderRef = adminDb.collection('orders').doc(orderId);
  
  await orderRef.update({
    driverId: newDriverId,
    reassignedBy: adminUid,
    reassignedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
};

// Admin function to process refund
export const adminProcessRefund = async (orderId: string, refundAmount: number, adminUid: string, reason: string): Promise<void> => {
  const orderRef = adminDb.collection('orders').doc(orderId);
  
  await orderRef.update({
    paymentStatus: 'refunded',
    refund: {
      amount: refundAmount,
      processedBy: adminUid,
      reason: reason,
      processedAt: FieldValue.serverTimestamp(),
    },
    updatedAt: FieldValue.serverTimestamp(),
  });
};

// Admin function to get revenue analytics
export const adminGetRevenueAnalytics = async (period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<Array<{
  period: string;
  totalRevenue: number;
  platformRevenue: number;
  vendorRevenue: number;
  driverRevenue: number;
  orderCount: number;
}>> => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      break;
    case 'weekly':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (7 * 12));
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
  }

  const ordersSnapshot = await adminDb.collection('orders')
    .where('status', '==', 'delivered')
    .where('createdAt', '>=', startDate)
    .orderBy('createdAt', 'asc')
    .get();

  const orders: OrderData[] = ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  } as OrderData));

  // Group orders by time period
  const revenueData = orders.reduce((acc, order) => {
    const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
    let periodKey: string;

    switch (period) {
      case 'daily':
        periodKey = orderDate.toISOString().split('T')[0];
        break;
      case 'weekly':
        const weekStart = new Date(orderDate);
        weekStart.setDate(orderDate.getDate() - orderDate.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
        break;
      case 'monthly':
        periodKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        periodKey = orderDate.toISOString().split('T')[0];
    }

    if (!acc[periodKey]) {
      acc[periodKey] = {
        period: periodKey,
        totalRevenue: 0,
        platformRevenue: 0,
        vendorRevenue: 0,
        driverRevenue: 0,
        orderCount: 0
      };
    }

    acc[periodKey].totalRevenue += order.pricing?.total || 0;
    acc[periodKey].platformRevenue += order.earnings?.platformCommission || 0;
    acc[periodKey].vendorRevenue += order.earnings?.vendorEarnings || 0;
    acc[periodKey].driverRevenue += order.earnings?.driverEarnings || 0;
    acc[periodKey].orderCount += 1;

    return acc;
  }, {} as Record<string, {
    period: string;
    totalRevenue: number;
    platformRevenue: number;
    vendorRevenue: number;
    driverRevenue: number;
    orderCount: number;
  }>);

  return Object.values(revenueData).sort((a, b) => a.period.localeCompare(b.period));
};

// Admin function to get top performing vendors
export const adminGetTopVendors = async (limit: number = 10): Promise<Array<{
  vendorId: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  vendorName: string;
  vendorEmail: string;
}>> => {
  const ordersSnapshot = await adminDb.collection('orders')
    .where('status', '==', 'delivered')
    .get();

  const orders: OrderData[] = ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  } as OrderData));

  // Group by vendor and calculate metrics
  const vendorMetrics = orders.reduce((acc, order) => {
    const vendorId = order.vendorId;
    
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendorId,
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      };
    }

    acc[vendorId].totalOrders += 1;
    acc[vendorId].totalRevenue += order.pricing?.total || 0;

    return acc;
  }, {} as Record<string, {
    vendorId: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  }>);

  // Calculate average order value and sort
  const topVendors = Object.values(vendorMetrics)
    .map(vendor => ({
      ...vendor,
      averageOrderValue: vendor.totalRevenue / vendor.totalOrders
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);

  // Get vendor details
  const vendorDetails = await Promise.all(
    topVendors.map(async (vendor) => {
      const vendorDoc = await adminDb.collection('vendors').doc(vendor.vendorId).get();
      return {
        ...vendor,
        vendorName: vendorDoc.data()?.businessName || 'Unknown',
        vendorEmail: vendorDoc.data()?.email || 'Unknown'
      };
    })
  );

  return vendorDetails;
};

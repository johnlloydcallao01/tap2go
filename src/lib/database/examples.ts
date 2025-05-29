/**
 * Database Usage Examples for Tap2Go
 *
 * This file demonstrates how to use the database functions
 * in your React components and API routes.
 */

import React from 'react';
import { doc, setDoc, onSnapshot, collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  createUser,
  getUser,
  updateUser,
  getUsersByRole
} from './users';

import {
  createVendor,
  getVendor,
  updateVendor,
  approveVendor,
  getPendingVendors,
  uploadVendorDocument
} from './vendors';

import {
  createDriver,
  getDriver,
  approveDriver,
  getPendingDrivers,
  getAvailableDrivers,
  updateDriverLocation,
  setDriverOnlineStatus,
  addDriverEarnings,
  addDriverReview,
  getDriverStats
} from './drivers';

import {
  createOrder,
  getOrder,
  updateOrderStatus,
  addTrackingUpdate,
  assignDriverToOrder,
  cancelOrder,
  getOrdersByCustomer,
  getOrdersByRestaurant,
  getOrdersByDriver,
  getActiveOrders,
  generateOrderNumber,
  calculateOrderTotal
} from './orders';

import {
  getPlatformConfig,
  updatePlatformConfig,
  updateCommissionRates,
  updateFeatureFlags,
  setMaintenanceMode,
  updateNotificationTemplate,
  isFeatureEnabled,
  isPlatformOpen,
  getMinimumOrderValue
} from './platformConfig';

import {
  createNotification,
  getNotificationsByUser,
  getUnreadNotificationsByUser,
  markNotificationAsRead,
  markAllAsRead,
  createOrderUpdateNotification,
  createPromotionalNotification,
  getUnreadCount,
  getNotificationStats
} from './notifications';

import {
  createDispute,
  getDispute,
  updateDisputeStatus,
  assignDisputeToAdmin,
  resolveDispute,
  closeDispute,
  getDisputesByCustomer,
  getDisputesByStatus,
  getOpenDisputes,
  getUrgentDisputes,
  getDisputeStats
} from './disputes';

import {
  createAnalytics,
  getAnalytics,
  getDailyAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getLatestAnalytics,
  generateDailyAnalyticsId,
  generateWeeklyAnalyticsId,
  generateMonthlyAnalyticsId,
  getTopPerformingRestaurants,
  getTopPerformingDrivers,
  getPopularCuisines,
  calculateTotalRevenue,
  getGrowthRate
} from './analytics';

// ===== USER MANAGEMENT EXAMPLES =====

// Example: Create a new user during signup
export const handleUserSignup = async (
  uid: string,
  email: string,
  role: 'customer' | 'vendor' | 'driver' | 'admin'
) => {
  try {
    await createUser(uid, {
      email,
      role,
      isActive: true,
      isVerified: false,
    });

    console.log('User created successfully');
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Example: Get user profile
export const getUserProfile = async (uid: string) => {
  try {
    const user = await getUser(uid);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Example: Update user profile
export const updateUserProfile = async (
  uid: string,
  updates: { name?: string; phoneNumber?: string }
) => {
  try {
    await updateUser(uid, updates);
    console.log('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Example: Get all vendors for admin dashboard
export const getAllVendors = async () => {
  try {
    const vendors = await getUsersByRole('vendor');
    return vendors;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
};

// ===== VENDOR MANAGEMENT EXAMPLES =====

// Example: Vendor onboarding
export const completeVendorOnboarding = async (
  uid: string,
  businessData: {
    businessName: string;
    businessType: 'restaurant' | 'cafe' | 'bakery' | 'food_truck' | 'catering' | 'grocery' | 'other';
    businessLicense: string;
    taxId: string;
    businessAddress: any;
    contactInfo: any;
    operatingHours: any;
    deliverySettings: any;
  }
) => {
  try {
    await createVendor(uid, {
      userRef: `users/${uid}`,
      ...businessData,
      status: 'pending',
      commissionRate: 15.0, // Default commission rate
      totalEarnings: 0,
      totalOrders: 0,
      averageRating: 0,
      totalReviews: 0,
      bankAccount: {
        accountNumber: '',
        routingNumber: '',
        accountHolderName: '',
        bankName: ''
      }
    });

    console.log('Vendor profile created successfully');
  } catch (error) {
    console.error('Error creating vendor profile:', error);
    throw error;
  }
};

// Example: Admin approving a vendor
export const approveVendorApplication = async (
  vendorUid: string,
  adminUid: string
) => {
  try {
    await approveVendor(vendorUid, adminUid);
    console.log('Vendor approved successfully');
  } catch (error) {
    console.error('Error approving vendor:', error);
    throw error;
  }
};

// Example: Get pending vendor applications for admin
export const getPendingApplications = async () => {
  try {
    const pendingVendors = await getPendingVendors();
    return pendingVendors;
  } catch (error) {
    console.error('Error fetching pending vendors:', error);
    throw error;
  }
};

// Example: Upload vendor document
export const uploadBusinessDocument = async (
  vendorUid: string,
  documentType: 'business_license' | 'tax_certificate' | 'food_permit' | 'insurance' | 'identity_proof',
  documentUrl: string
) => {
  try {
    const documentId = await uploadVendorDocument(vendorUid, {
      documentType,
      documentUrl,
      status: 'pending'
    });

    console.log('Document uploaded successfully:', documentId);
    return documentId;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// ===== REACT COMPONENT EXAMPLES =====

// Example: Custom hook for user data
export const useUserData = (uid: string) => {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser(uid);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchUser();
    }
  }, [uid]);

  return { user, loading, error };
};

// Example: Custom hook for vendor data
export const useVendorData = (uid: string) => {
  const [vendor, setVendor] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchVendor = async () => {
      try {
        const vendorData = await getVendor(uid);
        setVendor(vendorData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchVendor();
    }
  }, [uid]);

  return { vendor, loading, error };
};

// ===== API ROUTE EXAMPLES =====

// Example: API route for user profile update
export const apiUpdateProfile = async (req: any, res: any) => {
  try {
    const { uid } = req.user; // From authentication middleware
    const updates = req.body;

    await updateUser(uid, updates);

    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// Example: API route for vendor approval
export const apiApproveVendor = async (req: any, res: any) => {
  try {
    const { vendorUid } = req.params;
    const { uid: adminUid } = req.user; // From authentication middleware

    await approveVendor(vendorUid, adminUid);

    res.status(200).json({ success: true, message: 'Vendor approved successfully' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// ===== BATCH OPERATIONS EXAMPLES =====

// Example: Batch create multiple categories
export const createMultipleCategories = async (categories: any[]) => {
  try {
    const promises = categories.map(category =>
      setDoc(doc(db, 'categories', category.id), category)
    );

    await Promise.all(promises);
    console.log('All categories created successfully');
  } catch (error) {
    console.error('Error creating categories:', error);
    throw error;
  }
};

// Example: Batch update vendor statuses
export const batchUpdateVendorStatuses = async (
  vendorUpdates: { uid: string; status: 'pending' | 'approved' | 'rejected' | 'active' | 'suspended' }[]
) => {
  try {
    const promises = vendorUpdates.map(({ uid, status }) =>
      updateVendor(uid, { status })
    );

    await Promise.all(promises);
    console.log('Vendor statuses updated successfully');
  } catch (error) {
    console.error('Error updating vendor statuses:', error);
    throw error;
  }
};

// ===== REAL-TIME LISTENERS EXAMPLES =====

// Example: Listen to user changes
export const listenToUserChanges = (uid: string, callback: (user: any) => void) => {
  const userRef = doc(db, 'users', uid);

  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

// Example: Listen to vendor orders
export const listenToVendorOrders = (vendorUid: string, callback: (orders: any[]) => void) => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('restaurantOwnerId', '==', vendorUid));

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
};

// ===== DRIVER MANAGEMENT EXAMPLES =====

// Example: Create a new driver during registration
export const exampleCreateDriver = async () => {
  try {
    const driverData = {
      userRef: 'users/driver_new_001',
      firstName: 'Alex',
      lastName: 'Rodriguez',
      dateOfBirth: Timestamp.fromDate(new Date('1995-03-20')),
      gender: 'male' as const,
      nationalId: 'ID789123456',
      driverLicenseNumber: 'DL789123456',
      vehicleType: 'scooter' as const,
      vehicleDetails: {
        make: 'Yamaha',
        model: 'NMAX',
        year: 2021,
        licensePlate: 'DEF-9876',
        color: 'Black',
        insuranceExpiry: Timestamp.fromDate(new Date('2024-11-30'))
      },
      status: 'pending_approval' as const,
      verificationStatus: 'pending' as const,
      verificationDocuments: {
        driverLicense: 'https://example.com/docs/dl_alex_rodriguez.pdf',
        vehicleRegistration: 'https://example.com/docs/vr_alex_rodriguez.pdf',
        insurance: 'https://example.com/docs/ins_alex_rodriguez.pdf',
        nationalId: 'https://example.com/docs/nid_alex_rodriguez.pdf',
        profilePhoto: 'https://example.com/photos/alex_rodriguez.jpg'
      },
      isOnline: false,
      isAvailable: false,
      deliveryRadius: 8,
      totalDeliveries: 0,
      totalEarnings: 0,
      joinedAt: Timestamp.now(),
      bankDetails: {
        accountHolderName: 'Alex Rodriguez',
        accountNumber: '1111222233',
        bankName: 'Citibank',
        routingNumber: '021000089'
      },
      emergencyContact: {
        name: 'Maria Rodriguez',
        relationship: 'Mother',
        phone: '+1-555-0999'
      }
    };

    await createDriver('driver_new_001', driverData);
    console.log('Driver created successfully');
  } catch (error) {
    console.error('Error creating driver:', error);
  }
};

// Example: Admin approving a driver
export const exampleApproveDriver = async () => {
  try {
    await approveDriver('driver_new_001', 'admin_001');
    console.log('Driver approved successfully');
  } catch (error) {
    console.error('Error approving driver:', error);
  }
};

// Example: Driver going online and updating location
export const exampleDriverGoOnline = async () => {
  try {
    const driverUid = 'driver_001';

    // Update location
    await updateDriverLocation(driverUid, {
      latitude: 40.7128,
      longitude: -74.0060
    });

    // Set online status
    await setDriverOnlineStatus(driverUid, true);

    console.log('Driver is now online');
  } catch (error) {
    console.error('Error setting driver online:', error);
  }
};

// Example: Recording driver earnings
export const exampleRecordDriverEarnings = async () => {
  try {
    const earningsData = {
      totalEarnings: 145.75,
      deliveryFees: 120.00,
      tips: 25.75,
      bonuses: 0,
      penalties: 0,
      totalDeliveries: 10,
      avgDeliveryTime: 26,
      fuelCosts: 18.50
    };

    await addDriverEarnings('driver_001', earningsData);
    console.log('Driver earnings recorded successfully');
  } catch (error) {
    console.error('Error recording driver earnings:', error);
  }
};

// Example: Adding a driver review
export const exampleAddDriverReview = async () => {
  try {
    const reviewData = {
      customerRef: 'customers/customer_004',
      orderRef: 'orders/order_004',
      rating: 5,
      comment: 'Excellent delivery service! Very professional.',
      punctualityRating: 5,
      politenessRating: 5,
      conditionRating: 5,
      isVerifiedDelivery: true
    };

    const reviewId = await addDriverReview('driver_001', reviewData);
    console.log('Driver review added successfully:', reviewId);
  } catch (error) {
    console.error('Error adding driver review:', error);
  }
};

// Example: Custom hook for driver data
export const useDriverData = (uid: string) => {
  const [driver, setDriver] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchDriver = async () => {
      try {
        const driverData = await getDriver(uid);
        setDriver(driverData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchDriver();
    }
  }, [uid]);

  return { driver, loading, error };
};

// Example: Custom hook for driver stats
export const useDriverStats = (uid: string) => {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getDriverStats(uid);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchStats();
    }
  }, [uid]);

  return { stats, loading, error };
};

// Example: API route for driver approval
export const apiApproveDriver = async (req: any, res: any) => {
  try {
    const { driverUid } = req.params;
    const { uid: adminUid } = req.user; // From authentication middleware

    await approveDriver(driverUid, adminUid);

    res.status(200).json({ success: true, message: 'Driver approved successfully' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// Example: API route for getting available drivers
export const apiGetAvailableDrivers = async (req: any, res: any) => {
  try {
    const drivers = await getAvailableDrivers();

    res.status(200).json({ success: true, data: drivers });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// Example: Listen to driver location updates
export const listenToDriverLocation = (driverUid: string, callback: (location: any) => void) => {
  const driverRef = doc(db, 'drivers', driverUid);

  return onSnapshot(driverRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      if (data.currentLocation) {
        callback(data.currentLocation);
      }
    }
  });
};

// ===== ORDER MANAGEMENT EXAMPLES =====

// Example: Create a new order
export const exampleCreateOrder = async () => {
  try {
    const orderData = {
      orderNumber: generateOrderNumber(),
      customerRef: 'customers/customer_001',
      restaurantRef: 'restaurants/restaurant_001',
      vendorRef: 'vendors/vendor_001',

      status: 'pending' as const,
      paymentStatus: 'pending' as const,

      items: [
        {
          menuItemRef: 'restaurants/restaurant_001/menuItems/burger_classic',
          name: 'Classic Burger',
          quantity: 2,
          unitPrice: 12.99,
          selectedModifiers: [
            {
              groupId: 'burger_toppings',
              groupName: 'Burger Toppings',
              selectedOptions: [
                {
                  optionId: 'cheese',
                  name: 'Extra Cheese',
                  priceAdjustment: 1.50
                }
              ]
            }
          ],
          specialInstructions: 'No onions please',
          totalPrice: 28.98
        }
      ],

      subtotal: 28.98,
      taxes: 2.32,
      deliveryFee: 3.99,
      serviceFee: 1.50,
      discount: 0,
      totalAmount: 36.79,

      deliveryAddress: {
        recipientName: 'John Doe',
        recipientPhone: '+1-555-0123',
        formattedAddress: '123 Main St, New York, NY 10001',
        location: { latitude: 40.7128, longitude: -74.0060 },
        deliveryInstructions: 'Ring doorbell twice'
      },

      estimatedDeliveryTime: Timestamp.fromDate(new Date(Date.now() + 45 * 60 * 1000)), // 45 minutes from now
      deliveryMethod: 'delivery' as const,
      paymentProvider: 'stripe',
      preparationTime: 25,
      trackingUpdates: [],

      placedAt: Timestamp.now(),
      reviewSubmitted: false,
      platformCommission: 3.68,
      restaurantEarnings: 25.30
    };

    const orderId = await createOrder(orderData);
    console.log('Order created successfully:', orderId);
    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
  }
};

// Example: Update order status with tracking
export const exampleUpdateOrderStatus = async (orderId: string) => {
  try {
    // Confirm order
    await updateOrderStatus(orderId, 'confirmed');
    await addTrackingUpdate(orderId, {
      status: 'confirmed',
      message: 'Order confirmed by restaurant'
    });

    // Start preparing
    setTimeout(async () => {
      await updateOrderStatus(orderId, 'preparing');
      await addTrackingUpdate(orderId, {
        status: 'preparing',
        message: 'Your order is being prepared'
      });
    }, 5000);

    console.log('Order status updated successfully');
  } catch (error) {
    console.error('Error updating order status:', error);
  }
};

// Example: Assign driver to order
export const exampleAssignDriver = async (orderId: string, driverUid: string) => {
  try {
    await assignDriverToOrder(orderId, driverUid);
    console.log('Driver assigned to order successfully');
  } catch (error) {
    console.error('Error assigning driver:', error);
  }
};

// Example: Cancel order
export const exampleCancelOrder = async (orderId: string) => {
  try {
    await cancelOrder(orderId, 'customer', 'Changed my mind');
    console.log('Order cancelled successfully');
  } catch (error) {
    console.error('Error cancelling order:', error);
  }
};

// Example: Get customer order history
export const exampleGetCustomerOrders = async (customerUid: string) => {
  try {
    const orders = await getOrdersByCustomer(customerUid);
    console.log('Customer orders:', orders);
    return orders;
  } catch (error) {
    console.error('Error fetching customer orders:', error);
  }
};

// Example: Get restaurant orders
export const exampleGetRestaurantOrders = async (restaurantId: string) => {
  try {
    const orders = await getOrdersByRestaurant(restaurantId);
    console.log('Restaurant orders:', orders);
    return orders;
  } catch (error) {
    console.error('Error fetching restaurant orders:', error);
  }
};

// Example: Get driver orders
export const exampleGetDriverOrders = async (driverUid: string) => {
  try {
    const orders = await getOrdersByDriver(driverUid);
    console.log('Driver orders:', orders);
    return orders;
  } catch (error) {
    console.error('Error fetching driver orders:', error);
  }
};

// Example: Calculate order total
export const exampleCalculateTotal = () => {
  const subtotal = 28.98;
  const taxes = 2.32;
  const deliveryFee = 3.99;
  const serviceFee = 1.50;
  const discount = 0;
  const tip = 5.00;

  const total = calculateOrderTotal(subtotal, taxes, deliveryFee, serviceFee, discount, tip);
  console.log('Order total:', total); // 41.79
  return total;
};

// Example: Custom hook for order data
export const useOrderData = (orderId: string) => {
  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await getOrder(orderId);
        setOrder(orderData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  return { order, loading, error };
};

// Example: Custom hook for customer orders
export const useCustomerOrders = (customerUid: string) => {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orderData = await getOrdersByCustomer(customerUid);
        setOrders(orderData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    if (customerUid) {
      fetchOrders();
    }
  }, [customerUid]);

  return { orders, loading, error };
};

// Example: API route for creating order
export const apiCreateOrder = async (req: any, res: any) => {
  try {
    const { uid: customerUid } = req.user; // From authentication middleware
    const orderData = req.body;

    // Add customer reference
    orderData.customerRef = `customers/${customerUid}`;
    orderData.orderNumber = generateOrderNumber();

    const orderId = await createOrder(orderData);

    res.status(200).json({
      success: true,
      message: 'Order created successfully',
      orderId,
      orderNumber: orderData.orderNumber
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// Example: API route for updating order status
export const apiUpdateOrderStatus = async (req: any, res: any) => {
  try {
    const { orderId } = req.params;
    const { status, message } = req.body;

    await updateOrderStatus(orderId, status);

    if (message) {
      await addTrackingUpdate(orderId, {
        status,
        message
      });
    }

    res.status(200).json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// Example: Listen to order updates
export const listenToOrderUpdates = (orderId: string, callback: (order: any) => void) => {
  const orderRef = doc(db, 'orders', orderId);

  return onSnapshot(orderRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

// Example: Listen to restaurant orders
export const listenToRestaurantOrders = (restaurantId: string, callback: (orders: any[]) => void) => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('restaurantRef', '==', `restaurants/${restaurantId}`));

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
};

// ===== PLATFORM CONFIG MANAGEMENT EXAMPLES =====

// Example: Get platform configuration
export const exampleGetPlatformConfig = async () => {
  try {
    const config = await getPlatformConfig();
    console.log('Platform configuration:', config);
    return config;
  } catch (error) {
    console.error('Error fetching platform config:', error);
  }
};

// Example: Update commission rates
export const exampleUpdateCommissionRates = async () => {
  try {
    await updateCommissionRates({
      restaurant: 16.0,  // Update restaurant commission to 16%
      delivery: 12.0     // Update delivery commission to 12%
    }, 'admin_001');

    console.log('Commission rates updated successfully');
  } catch (error) {
    console.error('Error updating commission rates:', error);
  }
};

// Example: Toggle feature flags
export const exampleToggleFeatures = async () => {
  try {
    await updateFeatureFlags({
      liveTracking: true,
      loyaltyProgram: true,
      promotionsEnabled: false  // Disable promotions temporarily
    }, 'admin_001');

    console.log('Feature flags updated successfully');
  } catch (error) {
    console.error('Error updating feature flags:', error);
  }
};

// Example: Set maintenance mode
export const exampleSetMaintenanceMode = async (enabled: boolean) => {
  try {
    const message = enabled ?
      'We are currently performing maintenance. Please try again later.' :
      null;

    await setMaintenanceMode(enabled, message, 'admin_001');
    console.log(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error setting maintenance mode:', error);
  }
};

// Example: Update notification template
export const exampleUpdateNotificationTemplate = async () => {
  try {
    await updateNotificationTemplate(
      'orderConfirmed',
      {
        title: 'Order Confirmed! 🎉',
        body: 'Your delicious order has been confirmed and will be prepared shortly!'
      },
      'admin_001'
    );

    console.log('Notification template updated successfully');
  } catch (error) {
    console.error('Error updating notification template:', error);
  }
};

// Example: Check if feature is enabled
export const exampleCheckFeature = async (featureName: string) => {
  try {
    const isEnabled = await isFeatureEnabled(featureName as any);
    console.log(`Feature ${featureName} is ${isEnabled ? 'enabled' : 'disabled'}`);
    return isEnabled;
  } catch (error) {
    console.error('Error checking feature:', error);
    return false;
  }
};

// Example: Check if platform is open
export const exampleCheckPlatformOpen = async () => {
  try {
    const isOpen = await isPlatformOpen();
    console.log(`Platform is currently ${isOpen ? 'open' : 'closed'}`);
    return isOpen;
  } catch (error) {
    console.error('Error checking platform status:', error);
    return false;
  }
};

// Example: Get minimum order value
export const exampleGetMinimumOrder = async () => {
  try {
    const minValue = await getMinimumOrderValue();
    console.log(`Minimum order value: $${minValue}`);
    return minValue;
  } catch (error) {
    console.error('Error getting minimum order value:', error);
    return 10.0;
  }
};

// Example: Custom hook for platform config
export const usePlatformConfig = () => {
  const [config, setConfig] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configData = await getPlatformConfig();
        setConfig(configData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error };
};

// Example: API route for updating platform config
export const apiUpdatePlatformConfig = async (req: any, res: any) => {
  try {
    const { uid: adminUid } = req.user; // From authentication middleware
    const updates = req.body;

    // Only allow admins to update platform config
    const user = await getUser(adminUid);
    if (user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await updatePlatformConfig(updates, adminUid);

    res.status(200).json({
      success: true,
      message: 'Platform configuration updated successfully'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// Example: API route for getting platform config
export const apiGetPlatformConfig = async (req: any, res: any) => {
  try {
    const config = await getPlatformConfig();

    if (!config) {
      return res.status(404).json({ success: false, error: 'Platform config not found' });
    }

    res.status(200).json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// ===== NOTIFICATION MANAGEMENT EXAMPLES =====

// Example: Create a custom notification
export const exampleCreateNotification = async () => {
  try {
    const notificationId = await createNotification({
      recipientRef: 'users/customer_001',
      recipientRole: 'customer',
      type: 'promotional',
      title: 'Welcome to Tap2Go! 🎉',
      message: 'Thank you for joining us! Enjoy 15% off your first order with code WELCOME15.',
      data: {
        promoCode: 'WELCOME15',
        discountPercent: 15,
        expiryDays: 7
      },
      isRead: false,
      priority: 'medium',
      deliveryMethod: ['push', 'email']
    });

    console.log('Notification created successfully:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Example: Create order update notification
export const exampleCreateOrderNotification = async (customerUid: string, orderId: string) => {
  try {
    const notificationId = await createOrderUpdateNotification(
      customerUid,
      'customer',
      'Order Confirmed! 🎉',
      'Your order has been confirmed and is being prepared.',
      {
        orderId,
        orderNumber: 'ORD-123456',
        restaurantName: 'Burger Palace',
        estimatedTime: '25-30 minutes'
      },
      'medium'
    );

    console.log('Order notification created:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error creating order notification:', error);
  }
};

// Example: Create promotional notification
export const exampleCreatePromoNotification = async (customerUid: string) => {
  try {
    const notificationId = await createPromotionalNotification(
      customerUid,
      'Special Weekend Deal! 🎁',
      'Get 25% off all orders this weekend. Use code WEEKEND25!',
      {
        promoCode: 'WEEKEND25',
        discountPercent: 25,
        validDays: ['saturday', 'sunday'],
        minOrderValue: 20.00
      }
    );

    console.log('Promotional notification created:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error creating promotional notification:', error);
  }
};

// Example: Get user notifications
export const exampleGetUserNotifications = async (userUid: string) => {
  try {
    const notifications = await getNotificationsByUser(userUid);
    console.log(`Found ${notifications.length} notifications for user:`, notifications);
    return notifications;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
  }
};

// Example: Get unread notifications
export const exampleGetUnreadNotifications = async (userUid: string) => {
  try {
    const unreadNotifications = await getUnreadNotificationsByUser(userUid);
    console.log(`Found ${unreadNotifications.length} unread notifications:`, unreadNotifications);
    return unreadNotifications;
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
  }
};

// Example: Mark notification as read
export const exampleMarkAsRead = async (notificationId: string) => {
  try {
    await markNotificationAsRead(notificationId);
    console.log('Notification marked as read:', notificationId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Example: Mark all notifications as read
export const exampleMarkAllAsRead = async (userUid: string) => {
  try {
    await markAllAsRead(userUid);
    console.log('All notifications marked as read for user:', userUid);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
};

// Example: Get notification statistics
export const exampleGetNotificationStats = async (userUid: string) => {
  try {
    const stats = await getNotificationStats(userUid);
    console.log('Notification statistics:', stats);
    return stats;
  } catch (error) {
    console.error('Error getting notification stats:', error);
  }
};

// Example: Get unread count
export const exampleGetUnreadCount = async (userUid: string) => {
  try {
    const count = await getUnreadCount(userUid);
    console.log(`Unread notifications count: ${count}`);
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Example: Custom hook for user notifications
export const useUserNotifications = (userUid: string) => {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [notificationData, unreadCountData] = await Promise.all([
          getNotificationsByUser(userUid),
          getUnreadCount(userUid)
        ]);

        setNotifications(notificationData);
        setUnreadCount(unreadCountData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    if (userUid) {
      fetchNotifications();
    }
  }, [userUid]);

  return { notifications, unreadCount, loading, error };
};

// Example: Custom hook for unread notifications
export const useUnreadNotifications = (userUid: string) => {
  const [unreadNotifications, setUnreadNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const unreadData = await getUnreadNotificationsByUser(userUid);
        setUnreadNotifications(unreadData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    if (userUid) {
      fetchUnreadNotifications();
    }
  }, [userUid]);

  return { unreadNotifications, loading, error };
};

// Example: API route for creating notification
export const apiCreateNotification = async (req: any, res: any) => {
  try {
    const { uid: senderUid } = req.user; // From authentication middleware
    const notificationData = req.body;

    const notificationId = await createNotification(notificationData);

    res.status(200).json({
      success: true,
      message: 'Notification created successfully',
      notificationId
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// Example: API route for getting user notifications
export const apiGetUserNotifications = async (req: any, res: any) => {
  try {
    const { uid: userUid } = req.user; // From authentication middleware
    const { limit = 50 } = req.query;

    const notifications = await getNotificationsByUser(userUid, parseInt(limit));

    res.status(200).json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// Example: API route for marking notification as read
export const apiMarkNotificationAsRead = async (req: any, res: any) => {
  try {
    const { notificationId } = req.params;

    await markNotificationAsRead(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// Example: Listen to user notifications
export const listenToUserNotifications = (userUid: string, callback: (notifications: any[]) => void) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('recipientRef', '==', `users/${userUid}`),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notifications);
  });
};

// ===== DISPUTE MANAGEMENT EXAMPLES =====

// Example: Create a new dispute
export const exampleCreateDispute = async (customerUid: string, orderId: string) => {
  try {
    const disputeId = await createDispute({
      orderRef: `orders/${orderId}`,
      customerRef: `customers/${customerUid}`,
      restaurantRef: 'restaurants/restaurant_001',
      driverRef: 'drivers/driver_001',
      type: 'order_issue',
      description: 'Order was missing items. I ordered 2 burgers but only received 1.',
      attachments: [
        'https://storage.googleapis.com/tap2go-kuucn.appspot.com/disputes/evidence_photo.jpg'
      ],
      status: 'open',
      priority: 'medium'
    });

    console.log('Dispute created successfully:', disputeId);
    return disputeId;
  } catch (error) {
    console.error('Error creating dispute:', error);
  }
};

// Example: Assign dispute to admin
export const exampleAssignDispute = async (disputeId: string, adminUid: string) => {
  try {
    await assignDisputeToAdmin(disputeId, adminUid);
    console.log('Dispute assigned to admin:', adminUid);
  } catch (error) {
    console.error('Error assigning dispute:', error);
  }
};

// Example: Resolve dispute with refund
export const exampleResolveDispute = async (disputeId: string, adminUid: string) => {
  try {
    await resolveDispute(disputeId, {
      action: 'refund',
      amount: 15.99,
      notes: 'Customer was refunded for missing items. Restaurant has been notified.',
      resolvedBy: adminUid,
      resolvedAt: Timestamp.now()
    }, true);

    console.log('Dispute resolved successfully');
  } catch (error) {
    console.error('Error resolving dispute:', error);
  }
};

// Example: Get customer disputes
export const exampleGetCustomerDisputes = async (customerUid: string) => {
  try {
    const disputes = await getDisputesByCustomer(customerUid);
    console.log(`Found ${disputes.length} disputes for customer:`, disputes);
    return disputes;
  } catch (error) {
    console.error('Error fetching customer disputes:', error);
  }
};

// Example: Get open disputes for admin dashboard
export const exampleGetOpenDisputes = async () => {
  try {
    const openDisputes = await getOpenDisputes();
    console.log(`Found ${openDisputes.length} open disputes:`, openDisputes);
    return openDisputes;
  } catch (error) {
    console.error('Error fetching open disputes:', error);
  }
};

// Example: Get urgent disputes
export const exampleGetUrgentDisputes = async () => {
  try {
    const urgentDisputes = await getUrgentDisputes();
    console.log(`Found ${urgentDisputes.length} urgent disputes:`, urgentDisputes);
    return urgentDisputes;
  } catch (error) {
    console.error('Error fetching urgent disputes:', error);
  }
};

// Example: Get dispute statistics
export const exampleGetDisputeStats = async () => {
  try {
    const stats = await getDisputeStats();
    console.log('Dispute statistics:', stats);
    return stats;
  } catch (error) {
    console.error('Error getting dispute stats:', error);
  }
};

// Example: Update dispute status
export const exampleUpdateDisputeStatus = async (disputeId: string, status: string) => {
  try {
    await updateDisputeStatus(disputeId, status as any);
    console.log(`Dispute status updated to: ${status}`);
  } catch (error) {
    console.error('Error updating dispute status:', error);
  }
};

// Example: Close dispute
export const exampleCloseDispute = async (disputeId: string, satisfied: boolean) => {
  try {
    await closeDispute(disputeId, satisfied);
    console.log(`Dispute closed. Customer satisfied: ${satisfied}`);
  } catch (error) {
    console.error('Error closing dispute:', error);
  }
};

// Example: Custom hook for customer disputes
export const useCustomerDisputes = (customerUid: string) => {
  const [disputes, setDisputes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const disputeData = await getDisputesByCustomer(customerUid);
        setDisputes(disputeData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    if (customerUid) {
      fetchDisputes();
    }
  }, [customerUid]);

  return { disputes, loading, error };
};

// Example: Custom hook for admin dispute management
export const useAdminDisputes = () => {
  const [openDisputes, setOpenDisputes] = React.useState<any[]>([]);
  const [urgentDisputes, setUrgentDisputes] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchDisputeData = async () => {
      try {
        const [openData, urgentData, statsData] = await Promise.all([
          getOpenDisputes(),
          getUrgentDisputes(),
          getDisputeStats()
        ]);

        setOpenDisputes(openData);
        setUrgentDisputes(urgentData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchDisputeData();
  }, []);

  return { openDisputes, urgentDisputes, stats, loading, error };
};

// Example: API route for creating dispute
export const apiCreateDispute = async (req: any, res: any) => {
  try {
    const { uid: customerUid } = req.user; // From authentication middleware
    const disputeData = req.body;

    // Add customer reference
    disputeData.customerRef = `customers/${customerUid}`;

    const disputeId = await createDispute(disputeData);

    res.status(200).json({
      success: true,
      message: 'Dispute created successfully',
      disputeId
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// Example: API route for admin dispute management
export const apiAssignDispute = async (req: any, res: any) => {
  try {
    const { uid: adminUid } = req.user; // From authentication middleware
    const { disputeId } = req.params;

    // Verify admin role
    const user = await getUser(adminUid);
    if (user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    await assignDisputeToAdmin(disputeId, adminUid);

    res.status(200).json({
      success: true,
      message: 'Dispute assigned successfully'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// Example: API route for resolving dispute
export const apiResolveDispute = async (req: any, res: any) => {
  try {
    const { uid: adminUid } = req.user; // From authentication middleware
    const { disputeId } = req.params;
    const { resolution, customerSatisfied } = req.body;

    // Verify admin role
    const user = await getUser(adminUid);
    if (user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Add admin info to resolution
    resolution.resolvedBy = adminUid;

    await resolveDispute(disputeId, resolution, customerSatisfied);

    res.status(200).json({
      success: true,
      message: 'Dispute resolved successfully'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
};

// ===== ANALYTICS MANAGEMENT EXAMPLES =====

// Example: Create daily analytics
export const exampleCreateDailyAnalytics = async () => {
  try {
    const today = new Date();
    const analyticsId = generateDailyAnalyticsId(today);

    await createAnalytics({
      period: 'daily',
      date: today.toISOString().split('T')[0],
      totalOrders: 85,
      totalRevenue: 2345.67,
      totalCustomers: 67,
      newCustomers: 8,
      activeDrivers: 12,
      activeRestaurants: 6,
      avgOrderValue: 27.60,
      avgDeliveryTime: 31.5,
      topPerformingRestaurants: [
        {
          restaurantId: 'restaurant_001',
          name: 'Burger Palace',
          orders: 32,
          revenue: 876.54,
          rating: 4.8
        }
      ],
      topPerformingDrivers: [
        {
          driverId: 'driver_001',
          name: 'Mike Johnson',
          deliveries: 15,
          earnings: 134.50,
          rating: 4.9,
          avgDeliveryTime: 28.5
        }
      ],
      popularCuisines: [
        { cuisine: 'American', orders: 32, percentage: 37.6 },
        { cuisine: 'Italian', orders: 25, percentage: 29.4 }
      ],
      peakHours: [
        { hour: '12:00', orders: 18, percentage: 21.2 },
        { hour: '19:00', orders: 22, percentage: 25.9 }
      ],
      conversionRate: 72.5,
      customerRetentionRate: 68.3,
      driverUtilizationRate: 89.2,
      platformCommissionEarned: 351.85,
      generatedBy: 'analytics_system'
    }, analyticsId);

    console.log('Daily analytics created:', analyticsId);
    return analyticsId;
  } catch (error) {
    console.error('Error creating daily analytics:', error);
  }
};

// Example: Get latest analytics
export const exampleGetLatestAnalytics = async (period: string) => {
  try {
    const analytics = await getLatestAnalytics(period as any);
    console.log(`Latest ${period} analytics:`, analytics);
    return analytics;
  } catch (error) {
    console.error('Error fetching latest analytics:', error);
  }
};

// Example: Get top performing restaurants
export const exampleGetTopRestaurants = async () => {
  try {
    const topRestaurants = await getTopPerformingRestaurants('monthly', 5);
    console.log('Top 5 performing restaurants:', topRestaurants);
    return topRestaurants;
  } catch (error) {
    console.error('Error fetching top restaurants:', error);
  }
};

// Example: Calculate total revenue
export const exampleCalculateTotalRevenue = async () => {
  try {
    const totalRevenue = await calculateTotalRevenue('daily', '2024-01-01', '2024-01-31');
    console.log('Total revenue for January 2024:', totalRevenue);
    return totalRevenue;
  } catch (error) {
    console.error('Error calculating total revenue:', error);
  }
};

// Example: Get growth rate
export const exampleGetGrowthRate = async () => {
  try {
    const orderGrowth = await getGrowthRate('monthly', 'totalOrders');
    const revenueGrowth = await getGrowthRate('monthly', 'totalRevenue');

    console.log(`Order growth rate: ${orderGrowth}%`);
    console.log(`Revenue growth rate: ${revenueGrowth}%`);

    return { orderGrowth, revenueGrowth };
  } catch (error) {
    console.error('Error calculating growth rate:', error);
  }
};

// Example: Custom hook for analytics dashboard
export const useAnalyticsDashboard = () => {
  const [dailyAnalytics, setDailyAnalytics] = React.useState<any[]>([]);
  const [monthlyAnalytics, setMonthlyAnalytics] = React.useState<any[]>([]);
  const [topRestaurants, setTopRestaurants] = React.useState<any[]>([]);
  const [topDrivers, setTopDrivers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [daily, monthly, restaurants, drivers] = await Promise.all([
          getDailyAnalytics(7),
          getMonthlyAnalytics(6),
          getTopPerformingRestaurants('monthly', 5),
          getTopPerformingDrivers('monthly', 5)
        ]);

        setDailyAnalytics(daily);
        setMonthlyAnalytics(monthly);
        setTopRestaurants(restaurants);
        setTopDrivers(drivers);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  return { dailyAnalytics, monthlyAnalytics, topRestaurants, topDrivers, loading, error };
};
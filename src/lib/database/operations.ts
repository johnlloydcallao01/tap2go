/**
 * Database Operations for Tap2Go
 * High-level business logic operations using the hybrid database client
 */

import { db } from './hybrid-client';
import type { 
  User, 
  Restaurant, 
  MenuItem, 
  Order, 
  CustomerProfile,
  VendorProfile,
  DriverProfile 
} from '@prisma/client';

// ===== USER OPERATIONS =====
export class UserOperations {
  /**
   * Create a new user with profile (uses Prisma for transaction safety)
   */
  static async createUser(userData: {
    email: string;
    phoneNumber?: string;
    role: 'CUSTOMER' | 'VENDOR' | 'DRIVER';
    profileData: any;
  }) {
    return db.orm.$transaction(async (prisma) => {
      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
        }
      });

      // Create role-specific profile
      let profile;
      switch (userData.role) {
        case 'CUSTOMER':
          profile = await prisma.customerProfile.create({
            data: {
              userId: user.id,
              ...userData.profileData
            }
          });
          break;
        case 'VENDOR':
          profile = await prisma.vendorProfile.create({
            data: {
              userId: user.id,
              ...userData.profileData
            }
          });
          break;
        case 'DRIVER':
          profile = await prisma.driverProfile.create({
            data: {
              userId: user.id,
              ...userData.profileData
            }
          });
          break;
      }

      return { user, profile };
    });
  }

  /**
   * Get user with profile (uses Prisma for type safety)
   */
  static async getUserWithProfile(userId: string) {
    return db.orm.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: {
          include: {
            addresses: true
          }
        },
        vendorProfile: {
          include: {
            restaurants: true
          }
        },
        driverProfile: true
      }
    });
  }

  /**
   * Update user FCM tokens for notifications
   */
  static async updateFCMTokens(userId: string, tokens: string[]) {
    return db.orm.user.update({
      where: { id: userId },
      data: { fcmTokens: tokens }
    });
  }
}

// ===== RESTAURANT OPERATIONS =====
export class RestaurantOperations {
  /**
   * Create restaurant with menu structure (uses Prisma transaction)
   */
  static async createRestaurant(restaurantData: {
    vendorId: string;
    name: string;
    slug: string;
    description?: string;
    cuisineType: string[];
    address: any;
    coordinates?: any;
    operatingHours: any;
    deliverySettings: any;
  }) {
    return db.orm.restaurant.create({
      data: restaurantData,
      include: {
        vendor: true
      }
    });
  }

  /**
   * Get restaurant with full menu (uses Prisma for relations)
   */
  static async getRestaurantWithMenu(restaurantId: string) {
    return db.orm.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        vendor: true,
        menuCategories: {
          include: {
            menuItems: {
              include: {
                customizations: true
              }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
  }

  /**
   * Get popular restaurants (uses direct SQL for performance)
   */
  static async getPopularRestaurants(limit: number = 20, offset: number = 0) {
    return db.getPopularRestaurants(limit, offset);
  }

  /**
   * Search restaurants with complex filters (uses direct SQL)
   */
  static async searchRestaurants(searchParams: {
    query?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    cuisineTypes?: string[];
    minRating?: number;
    maxDeliveryFee?: number;
    limit?: number;
    offset?: number;
  }) {
    return db.searchRestaurants(searchParams);
  }

  /**
   * Update restaurant rating (uses direct SQL for performance)
   */
  static async updateRestaurantRating(restaurantId: string) {
    return db.sql(`
      UPDATE tap2go_restaurants 
      SET 
        rating = (
          SELECT AVG(rating) 
          FROM tap2go_reviews 
          WHERE "restaurantId" = $1 AND "isVisible" = true
        ),
        "totalReviews" = (
          SELECT COUNT(*) 
          FROM tap2go_reviews 
          WHERE "restaurantId" = $1 AND "isVisible" = true
        ),
        "updatedAt" = NOW()
      WHERE id = $1
      RETURNING *
    `, [restaurantId]);
  }

  /**
   * Get restaurant analytics (uses direct SQL for complex queries)
   */
  static async getRestaurantAnalytics(restaurantId: string, days: number = 30) {
    return db.getRestaurantAnalytics(restaurantId, days);
  }
}

// ===== MENU OPERATIONS =====
export class MenuOperations {
  /**
   * Create menu category with items (uses Prisma transaction)
   */
  static async createMenuCategory(categoryData: {
    restaurantId: string;
    name: string;
    description?: string;
    imageUrl?: string;
    sortOrder?: number;
    menuItems?: any[];
  }) {
    return db.orm.$transaction(async (prisma) => {
      const category = await prisma.menuCategory.create({
        data: {
          restaurantId: categoryData.restaurantId,
          name: categoryData.name,
          description: categoryData.description,
          imageUrl: categoryData.imageUrl,
          sortOrder: categoryData.sortOrder || 0
        }
      });

      if (categoryData.menuItems && categoryData.menuItems.length > 0) {
        const menuItems = await prisma.menuItem.createMany({
          data: categoryData.menuItems.map(item => ({
            ...item,
            restaurantId: categoryData.restaurantId,
            categoryId: category.id
          }))
        });

        return { category, menuItems };
      }

      return { category };
    });
  }

  /**
   * Get menu items with customizations (uses Prisma for relations)
   */
  static async getMenuItemsWithCustomizations(restaurantId: string) {
    return db.orm.menuItem.findMany({
      where: { 
        restaurantId,
        isAvailable: true 
      },
      include: {
        category: true,
        customizations: true
      },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { sortOrder: 'asc' }
      ]
    });
  }

  /**
   * Update menu item availability in bulk (uses direct SQL for performance)
   */
  static async updateMenuItemsAvailability(
    restaurantId: string, 
    updates: { itemId: string; isAvailable: boolean }[]
  ) {
    const updateCases = updates.map((update, index) => 
      `WHEN id = $${index * 2 + 2} THEN $${index * 2 + 3}`
    ).join(' ');
    
    const itemIds = updates.map(u => u.itemId);
    const availabilityValues = updates.map(u => u.isAvailable);
    
    const params = [restaurantId, ...itemIds.flatMap((id, i) => [id, availabilityValues[i]])];

    return db.sql(`
      UPDATE tap2go_menu_items 
      SET 
        "isAvailable" = CASE ${updateCases} END,
        "updatedAt" = NOW()
      WHERE "restaurantId" = $1 
        AND id IN (${itemIds.map((_, i) => `$${i * 2 + 2}`).join(', ')})
      RETURNING *
    `, params);
  }
}

// ===== ORDER OPERATIONS =====
export class OrderOperations {
  /**
   * Create order with items (uses Prisma transaction for data integrity)
   */
  static async createOrder(orderData: {
    customerId: string;
    restaurantId: string;
    deliveryAddressId?: string;
    orderItems: any[];
    pricing: {
      subtotal: number;
      deliveryFee: number;
      serviceFee: number;
      tax: number;
      discount: number;
      total: number;
    };
    paymentMethod: string;
    customerNotes?: string;
    scheduledFor?: Date;
  }) {
    return db.orm.$transaction(async (prisma) => {
      // Generate unique order number
      const orderNumber = `TAP${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId: orderData.customerId,
          restaurantId: orderData.restaurantId,
          deliveryAddressId: orderData.deliveryAddressId,
          paymentMethod: orderData.paymentMethod,
          customerNotes: orderData.customerNotes,
          scheduledFor: orderData.scheduledFor,
          ...orderData.pricing
        }
      });

      // Create order items
      const orderItems = await prisma.orderItem.createMany({
        data: orderData.orderItems.map(item => ({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          customizations: item.customizations,
          specialInstructions: item.specialInstructions
        }))
      });

      // Create initial tracking entry
      await prisma.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          message: 'Order placed successfully'
        }
      });

      return { order, orderItems };
    });
  }

  /**
   * Get order with full details (uses Prisma for relations)
   */
  static async getOrderWithDetails(orderId: string) {
    return db.orm.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          include: {
            customerProfile: true
          }
        },
        restaurant: {
          include: {
            vendor: true
          }
        },
        deliveryAddress: true,
        driver: true,
        orderItems: {
          include: {
            menuItem: true
          }
        },
        orderTracking: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });
  }

  /**
   * Update order status with tracking (uses Prisma transaction)
   */
  static async updateOrderStatus(
    orderId: string, 
    status: string, 
    message?: string,
    location?: { latitude: number; longitude: number },
    driverId?: string
  ) {
    return db.orm.$transaction(async (prisma) => {
      // Update order
      const updateData: any = { 
        status,
        updatedAt: new Date()
      };

      // Set timestamp fields based on status
      switch (status) {
        case 'CONFIRMED':
          updateData.confirmedAt = new Date();
          break;
        case 'READY':
          updateData.readyAt = new Date();
          break;
        case 'PICKED_UP':
          updateData.pickedUpAt = new Date();
          if (driverId) updateData.driverId = driverId;
          break;
        case 'DELIVERED':
          updateData.deliveredAt = new Date();
          break;
        case 'CANCELLED':
          updateData.cancelledAt = new Date();
          break;
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: updateData
      });

      // Add tracking entry
      await prisma.orderTracking.create({
        data: {
          orderId,
          status,
          message,
          location: location ? JSON.stringify(location) : null
        }
      });

      return order;
    });
  }

  /**
   * Get orders for restaurant dashboard (uses direct SQL for performance)
   */
  static async getRestaurantOrders(
    restaurantId: string, 
    status?: string,
    limit: number = 50,
    offset: number = 0
  ) {
    let whereClause = 'WHERE o."restaurantId" = $1';
    const params: any[] = [restaurantId];
    
    if (status) {
      whereClause += ' AND o.status = $2';
      params.push(status);
      params.push(limit, offset);
    } else {
      params.push(limit, offset);
    }

    return db.sql(`
      SELECT 
        o.*,
        json_build_object(
          'id', c.id,
          'email', c.email,
          'firstName', cp."firstName",
          'lastName', cp."lastName",
          'phoneNumber', c."phoneNumber"
        ) as customer,
        json_build_object(
          'id', da.id,
          'label', da.label,
          'street', da.street,
          'city', da.city
        ) as delivery_address,
        (
          SELECT json_agg(
            json_build_object(
              'id', oi.id,
              'quantity', oi.quantity,
              'unitPrice', oi."unitPrice",
              'totalPrice', oi."totalPrice",
              'menuItem', json_build_object(
                'id', mi.id,
                'name', mi.name,
                'imageUrl', mi."imageUrl"
              )
            )
          )
          FROM tap2go_order_items oi
          JOIN tap2go_menu_items mi ON oi."menuItemId" = mi.id
          WHERE oi."orderId" = o.id
        ) as order_items
      FROM tap2go_orders o
      JOIN tap2go_users c ON o."customerId" = c.id
      LEFT JOIN tap2go_customer_profiles cp ON c.id = cp."userId"
      LEFT JOIN tap2go_customer_addresses da ON o."deliveryAddressId" = da.id
      ${whereClause}
      ORDER BY o."createdAt" DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);
  }
}

// Export all operations
export {
  UserOperations,
  RestaurantOperations,
  MenuOperations,
  OrderOperations
};

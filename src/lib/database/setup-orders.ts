import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from './collections';
import { OrderDocument } from './schema';
import { generateOrderNumber } from './orders';

// Sample orders data
const sampleOrders: (OrderDocument & { id: string })[] = [
  {
    id: 'order_001',
    orderNumber: generateOrderNumber(),
    customerRef: 'customers/customer_001',
    restaurantRef: 'restaurants/restaurant_001',
    vendorRef: 'vendors/vendor_001',
    driverRef: 'drivers/driver_001',

    // Order Status Management
    status: 'delivered',
    paymentStatus: 'paid',
    cancellationReason: undefined,
    cancelledBy: undefined,

    // Items and Pricing
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
      },
      {
        menuItemRef: 'restaurants/restaurant_001/menuItems/fries_large',
        name: 'Large Fries',
        quantity: 1,
        unitPrice: 4.99,
        selectedModifiers: [],
        specialInstructions: undefined,
        totalPrice: 4.99
      }
    ],

    // Pricing Breakdown
    subtotal: 33.97,
    taxes: 2.72,
    deliveryFee: 3.99,
    serviceFee: 1.50,
    discount: 0,
    tip: 5.00,
    totalAmount: 47.18,

    // Applied Promotions
    appliedPromotions: [],

    // Delivery Information
    deliveryAddress: {
      recipientName: 'John Doe',
      recipientPhone: '+1-555-0123',
      formattedAddress: '123 Main St, New York, NY 10001',
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      deliveryInstructions: 'Ring doorbell twice'
    },
    estimatedDeliveryTime: Timestamp.fromDate(new Date('2024-01-15T19:30:00')),
    actualDeliveryTime: Timestamp.fromDate(new Date('2024-01-15T19:25:00')),
    deliveryMethod: 'delivery',

    // Payment Information
    paymentMethodRef: 'customers/customer_001/paymentMethods/card_001',
    paymentProvider: 'stripe',
    paymentTransactionId: 'pi_1234567890',

    // Tracking and Communication
    preparationTime: 25,
    trackingUpdates: [
      {
        status: 'confirmed',
        timestamp: Timestamp.fromDate(new Date('2024-01-15T18:45:00')),
        message: 'Order confirmed by restaurant'
      },
      {
        status: 'preparing',
        timestamp: Timestamp.fromDate(new Date('2024-01-15T18:50:00')),
        message: 'Your order is being prepared'
      },
      {
        status: 'ready_for_pickup',
        timestamp: Timestamp.fromDate(new Date('2024-01-15T19:10:00')),
        message: 'Order ready for pickup'
      },
      {
        status: 'picked_up',
        timestamp: Timestamp.fromDate(new Date('2024-01-15T19:15:00')),
        message: 'Driver has picked up your order',
        location: { latitude: 40.7589, longitude: -73.9851 }
      },
      {
        status: 'delivered',
        timestamp: Timestamp.fromDate(new Date('2024-01-15T19:25:00')),
        message: 'Order delivered successfully',
        location: { latitude: 40.7128, longitude: -74.0060 }
      }
    ],

    // Special Instructions and Notes
    customerNotes: 'Please call when you arrive',
    restaurantNotes: 'Customer requested no onions',
    driverNotes: 'Customer was very friendly',

    // Timestamps
    placedAt: Timestamp.fromDate(new Date('2024-01-15T18:40:00')),
    confirmedAt: Timestamp.fromDate(new Date('2024-01-15T18:45:00')),
    readyAt: Timestamp.fromDate(new Date('2024-01-15T19:10:00')),
    pickedUpAt: Timestamp.fromDate(new Date('2024-01-15T19:15:00')),
    deliveredAt: Timestamp.fromDate(new Date('2024-01-15T19:25:00')),
    cancelledAt: undefined,

    // Ratings and Reviews
    customerRating: 5,
    driverRating: 5,
    restaurantRating: 4,
    reviewSubmitted: true,

    // Commission and Earnings
    platformCommission: 4.72,
    restaurantEarnings: 28.47,
    driverEarnings: 8.99,

    createdAt: Timestamp.fromDate(new Date('2024-01-15T18:40:00')),
    updatedAt: Timestamp.now()
  },
  {
    id: 'order_002',
    orderNumber: generateOrderNumber(),
    customerRef: 'customers/customer_002',
    restaurantRef: 'restaurants/restaurant_002',
    vendorRef: 'vendors/vendor_002',
    driverRef: 'drivers/driver_002',

    // Order Status Management
    status: 'picked_up',
    paymentStatus: 'paid',

    // Items and Pricing
    items: [
      {
        menuItemRef: 'restaurants/restaurant_002/menuItems/pizza_margherita',
        name: 'Margherita Pizza',
        quantity: 1,
        unitPrice: 16.99,
        selectedModifiers: [
          {
            groupId: 'pizza_size',
            groupName: 'Pizza Size',
            selectedOptions: [
              {
                optionId: 'large',
                name: 'Large',
                priceAdjustment: 3.00
              }
            ]
          }
        ],
        totalPrice: 19.99
      }
    ],

    // Pricing Breakdown
    subtotal: 19.99,
    taxes: 1.60,
    deliveryFee: 2.99,
    serviceFee: 1.00,
    discount: 2.00,
    tip: 3.00,
    totalAmount: 26.58,

    // Applied Promotions
    appliedPromotions: [
      {
        promoId: 'SAVE2',
        promoTitle: '$2 off your order',
        discountAmount: 2.00
      }
    ],

    // Delivery Information
    deliveryAddress: {
      recipientName: 'Jane Smith',
      recipientPhone: '+1-555-0456',
      formattedAddress: '456 Oak Ave, Brooklyn, NY 11201',
      location: {
        latitude: 40.6892,
        longitude: -73.9442
      },
      deliveryInstructions: 'Leave at door'
    },
    estimatedDeliveryTime: Timestamp.fromDate(new Date('2024-01-15T20:15:00')),
    actualDeliveryTime: undefined,
    deliveryMethod: 'delivery',

    // Payment Information
    paymentMethodRef: 'customers/customer_002/paymentMethods/card_002',
    paymentProvider: 'stripe',
    paymentTransactionId: 'pi_0987654321',

    // Tracking and Communication
    preparationTime: 20,
    trackingUpdates: [
      {
        status: 'confirmed',
        timestamp: Timestamp.fromDate(new Date('2024-01-15T19:30:00')),
        message: 'Order confirmed by restaurant'
      },
      {
        status: 'preparing',
        timestamp: Timestamp.fromDate(new Date('2024-01-15T19:35:00')),
        message: 'Your pizza is being prepared'
      },
      {
        status: 'ready_for_pickup',
        timestamp: Timestamp.fromDate(new Date('2024-01-15T19:50:00')),
        message: 'Order ready for pickup'
      },
      {
        status: 'picked_up',
        timestamp: Timestamp.fromDate(new Date('2024-01-15T19:55:00')),
        message: 'Driver has picked up your order',
        location: { latitude: 40.6782, longitude: -73.9442 }
      }
    ],

    // Special Instructions and Notes
    customerNotes: 'Extra napkins please',
    restaurantNotes: 'Large pizza as requested',
    driverNotes: undefined,

    // Timestamps
    placedAt: Timestamp.fromDate(new Date('2024-01-15T19:25:00')),
    confirmedAt: Timestamp.fromDate(new Date('2024-01-15T19:30:00')),
    readyAt: Timestamp.fromDate(new Date('2024-01-15T19:50:00')),
    pickedUpAt: Timestamp.fromDate(new Date('2024-01-15T19:55:00')),
    deliveredAt: undefined,
    cancelledAt: undefined,

    // Ratings and Reviews
    customerRating: undefined,
    driverRating: undefined,
    restaurantRating: undefined,
    reviewSubmitted: false,

    // Commission and Earnings
    platformCommission: 2.66,
    restaurantEarnings: 17.33,
    driverEarnings: 5.99,

    createdAt: Timestamp.fromDate(new Date('2024-01-15T19:25:00')),
    updatedAt: Timestamp.now()
  },
  {
    id: 'order_003',
    orderNumber: generateOrderNumber(),
    customerRef: 'customers/customer_003',
    restaurantRef: 'restaurants/restaurant_001',
    vendorRef: 'vendors/vendor_001',
    driverRef: undefined,

    // Order Status Management
    status: 'preparing',
    paymentStatus: 'paid',

    // Items and Pricing
    items: [
      {
        menuItemRef: 'restaurants/restaurant_001/menuItems/salad_caesar',
        name: 'Caesar Salad',
        quantity: 1,
        unitPrice: 9.99,
        selectedModifiers: [
          {
            groupId: 'salad_extras',
            groupName: 'Salad Extras',
            selectedOptions: [
              {
                optionId: 'chicken',
                name: 'Grilled Chicken',
                priceAdjustment: 4.00
              }
            ]
          }
        ],
        specialInstructions: 'Dressing on the side',
        totalPrice: 13.99
      }
    ],

    // Pricing Breakdown
    subtotal: 13.99,
    taxes: 1.12,
    deliveryFee: 2.99,
    serviceFee: 0.75,
    discount: 0,
    tip: 2.50,
    totalAmount: 21.35,

    // Applied Promotions
    appliedPromotions: [],

    // Delivery Information
    deliveryAddress: {
      recipientName: 'Mike Johnson',
      recipientPhone: '+1-555-0789',
      formattedAddress: '789 Pine St, Manhattan, NY 10002',
      location: {
        latitude: 40.7282,
        longitude: -73.9942
      },
      deliveryInstructions: 'Apartment 4B, buzz 4B'
    },
    estimatedDeliveryTime: Timestamp.fromDate(new Date('2024-01-15T20:45:00')),
    actualDeliveryTime: undefined,
    deliveryMethod: 'delivery',

    // Payment Information
    paymentMethodRef: 'customers/customer_003/paymentMethods/card_003',
    paymentProvider: 'stripe',
    paymentTransactionId: 'pi_1122334455',

    // Tracking and Communication
    preparationTime: 15,
    trackingUpdates: [
      {
        status: 'confirmed',
        timestamp: Timestamp.fromDate(new Date('2024-01-15T20:15:00')),
        message: 'Order confirmed by restaurant'
      },
      {
        status: 'preparing',
        timestamp: Timestamp.fromDate(new Date('2024-01-15T20:20:00')),
        message: 'Your salad is being prepared'
      }
    ],

    // Special Instructions and Notes
    customerNotes: 'Please ensure dressing is on the side',
    restaurantNotes: 'Customer wants dressing separate',
    driverNotes: undefined,

    // Timestamps
    placedAt: Timestamp.fromDate(new Date('2024-01-15T20:10:00')),
    confirmedAt: Timestamp.fromDate(new Date('2024-01-15T20:15:00')),
    readyAt: undefined,
    pickedUpAt: undefined,
    deliveredAt: undefined,
    cancelledAt: undefined,

    // Ratings and Reviews
    customerRating: undefined,
    driverRating: undefined,
    restaurantRating: undefined,
    reviewSubmitted: false,

    // Commission and Earnings
    platformCommission: 2.14,
    restaurantEarnings: 11.85,
    driverEarnings: undefined,

    createdAt: Timestamp.fromDate(new Date('2024-01-15T20:10:00')),
    updatedAt: Timestamp.now()
  }
];

// Function to setup orders collection
export const setupOrdersCollection = async () => {
  console.log('Setting up orders collection...');

  try {
    // Add sample orders
    for (const order of sampleOrders) {
      const { id, ...orderData } = order;
      await setDoc(doc(db, COLLECTIONS.ORDERS, id), orderData);
      console.log(`Added order: ${order.orderNumber} (${order.status})`);
    }

    console.log('Orders collection setup completed successfully!');
  } catch (error) {
    console.error('Error setting up orders collection:', error);
    throw error;
  }
};

// Main setup function
export const setupOrdersDatabase = async () => {
  console.log('Starting orders database setup...');
  
  try {
    await setupOrdersCollection();
    console.log('Orders database setup completed successfully!');
  } catch (error) {
    console.error('Error in orders database setup:', error);
    throw error;
  }
};

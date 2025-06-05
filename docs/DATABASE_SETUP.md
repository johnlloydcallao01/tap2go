# 🔥 Tap2Go Firebase Database Setup Guide

This guide will help you set up the complete Firestore database structure for your Tap2Go food delivery platform.

## 📋 Database Structure Overview

### Top-Level Collections (Implemented)

1. **`users`** - Universal user authentication and role management
2. **`admins`** - Platform administrators and staff
3. **`vendors`** - Corporate restaurant accounts
4. **`customers`** - End users who place orders
5. **`drivers`** - Delivery personnel and vehicle management
6. **`restaurants`** - Individual restaurant outlets/branches
7. **`_system`** - Database documentation and structure

### Subcollections (Implemented)

Each main collection has relevant subcollections for detailed data:

**Admin Subcollections:**
- `adminActions` - Admin activity logs

**Vendor Subcollections:**
- `modifierGroups` - Menu item modifier groups
- `masterMenuItems` - Master menu items
- `masterMenuAssignments` - Menu assignments to restaurants
- `auditLogs` - Vendor action audit trail
- `analytics` - Vendor performance metrics

**Restaurant Subcollections:**
- `menuCategories` - Menu organization categories
- `menuItems` - Restaurant-specific menu items
- `promotions` - Restaurant promotions and offers
- `reviews` - Customer reviews for restaurants

**Customer Subcollections:**
- `addresses` - Customer delivery addresses
- `paymentMethods` - Customer payment methods
- `favorites` - Favorite restaurants and items
- `cart` - Shopping cart items

**Driver Subcollections:**
- `earnings` - Daily earnings and performance tracking
- `reviews` - Customer reviews and ratings for drivers
- `deliveryHistory` - Complete delivery history and analytics

## 🚀 Quick Setup

### Prerequisites

1. **Firebase Project**: Create a project at [Firebase Console](https://console.firebase.google.com)
2. **Firestore Database**: Enable Firestore in your Firebase project
3. **Authentication**: Enable Email/Password authentication

### Step 1: Configure Firebase

Update your Firebase configuration in `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Step 2: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
```

### Step 3: Deploy Security Rules

```bash
npm run deploy-rules
```

### Step 4: Initialize Database

```bash
# Basic setup
npm run setup-db

# With initial admin user
npm run setup-db -- --admin-email admin@yourdomain.com --admin-name "Admin User"

# Setup drivers collection (optional)
# Visit http://localhost:3000/setup-drivers in your browser
# Or use the API endpoint directly
curl -X POST http://localhost:3000/api/setup-drivers
```

## 🔐 Security Rules

The included `firestore.rules` file provides comprehensive security:

- **Role-based access control**
- **Document ownership validation**
- **Admin permission checks**
- **Data integrity enforcement**

Key security features:
- Users can only access their own data
- Admins have elevated permissions
- Vendors can manage their restaurants
- Drivers can update their location and status
- Customers can place and track orders

## 📊 User Roles & Permissions

### 👑 Admin
- Manage all users and data
- Approve vendors and drivers
- View system analytics
- Handle disputes and support
- Configure platform settings

### 🏪 Vendor
- Manage restaurant information
- Create and update menu items
- Process incoming orders
- View sales analytics
- Manage business documents

### 🚚 Driver
- Update availability status
- Accept delivery requests
- Update location and delivery status
- View earnings and analytics
- Manage vehicle information

### 👤 Customer
- Browse restaurants and menus
- Place and track orders
- Manage addresses and payment methods
- Leave reviews and ratings
- View order history

## 🗂️ Collection Details

### Users Collection
```typescript
{
  uid: string,
  email: string,
  phoneNumber?: string,
  role: "admin" | "vendor" | "driver" | "customer",
  profileImageUrl?: string,
  isActive: boolean,
  isVerified: boolean,
  fcmTokens?: string[],
  preferredLanguage?: string,
  timezone?: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLoginAt?: timestamp
}
```

### Vendors Collection
```typescript
{
  userRef: string,
  businessName: string,
  businessType: string,
  businessLicense: string,
  taxId: string,
  status: "pending" | "approved" | "active" | "suspended" | "rejected",
  commissionRate: number,
  totalEarnings: number,
  bankAccount: object,
  businessAddress: object,
  operatingHours: object,
  deliverySettings: object,
  // ... more fields
}
```

### Customers Collection
```typescript
{
  userRef: string,
  firstName: string,
  lastName: string,
  dateOfBirth?: timestamp,
  gender?: "male" | "female" | "other" | "prefer_not_to_say",
  loyaltyPoints: number,
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum",
  totalOrders: number,
  totalSpent: number,
  avgOrderValue: number,
  preferredCuisines?: string[],
  dietaryRestrictions?: string[],
  allergies?: string[],
  marketingConsent: boolean,
  smsConsent: boolean,
  emailConsent: boolean,
  referralCode: string,
  referredBy?: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  lastOrderAt?: timestamp
}
```

#### Customer Subcollections

**Addresses** (`customers/{uid}/addresses/{addressId}`)
```typescript
{
  addressId: string,
  label: string, // "Home", "Office", "Other"
  recipientName: string,
  recipientPhone: string,
  address: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    apartmentNumber?: string,
    floor?: string,
    landmark?: string,
    deliveryInstructions?: string
  },
  location: GeoPoint,
  formattedAddress: string,
  isDefault: boolean,
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Payment Methods** (`customers/{uid}/paymentMethods/{paymentMethodId}`)
```typescript
{
  paymentMethodId: string,
  type: "card" | "wallet" | "bank_account" | "cod",
  provider: string, // "stripe", "paypal", "cash"
  last4?: string,
  cardBrand?: string, // "visa", "mastercard", etc.
  expiryMonth?: number,
  expiryYear?: number,
  walletProvider?: string, // "apple_pay", "google_pay"
  isDefault: boolean,
  isActive: boolean,
  createdAt: timestamp
}
```

**Favorites** (`customers/{uid}/favorites/{favoriteId}`)
```typescript
{
  favoriteId: string,
  type: "restaurant" | "item",
  restaurantRef?: string, // path to restaurants/{restId}
  menuItemRef?: string, // path to restaurants/{restId}/menuItems/{itemId}
  createdAt: timestamp
}
```

**Cart** (`customers/{uid}/cart/{cartItemId}`)
```typescript
{
  cartItemId: string,
  restaurantRef: string, // path to restaurants/{restId}
  menuItemRef: string, // path to menuItems/{itemId}
  quantity: number,
  specialInstructions?: string,
  selectedModifiers?: {
    groupId: string,
    selectedOptions: string[] // optionIds
  }[],
  itemPrice: number, // snapshot at time of adding
  totalPrice: number, // including modifiers
  addedAt: timestamp
}
```

### Drivers Collection
```typescript
{
  userRef: string,
  firstName: string,
  lastName: string,
  dateOfBirth: timestamp,
  gender?: "male" | "female" | "other" | "prefer_not_to_say",
  nationalId: string,
  driverLicenseNumber: string,
  vehicleType: "bicycle" | "motorcycle" | "car" | "scooter",
  vehicleDetails: {
    make?: string,
    model?: string,
    year?: number,
    licensePlate: string,
    color: string,
    insuranceExpiry?: timestamp
  },
  status: "pending_approval" | "active" | "suspended" | "rejected" | "inactive",
  verificationStatus: "pending" | "verified" | "rejected",
  verificationDocuments: {
    driverLicense: string,
    vehicleRegistration: string,
    insurance: string,
    nationalId: string,
    profilePhoto: string,
    backgroundCheck?: string
  },
  currentLocation?: GeoPoint,
  isOnline: boolean,
  isAvailable: boolean,
  deliveryRadius: number,
  avgRating?: number,
  totalDeliveries: number,
  totalEarnings: number,
  joinedAt: timestamp,
  approvedBy?: string,
  approvedAt?: timestamp,
  bankDetails: {
    accountHolderName: string,
    accountNumber: string,
    bankName: string,
    routingNumber?: string,
    swiftCode?: string
  },
  emergencyContact: {
    name: string,
    relationship: string,
    phone: string
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  lastActiveAt?: timestamp
}
```

#### Driver Subcollections

**Earnings** (`drivers/{uid}/earnings/{date}`)
```typescript
{
  date: string, // YYYY-MM-DD format
  totalEarnings: number,
  deliveryFees: number,
  tips: number,
  bonuses: number,
  penalties: number,
  totalDeliveries: number,
  avgDeliveryTime: number,
  fuelCosts?: number
}
```

**Reviews** (`drivers/{uid}/reviews/{reviewId}`)
```typescript
{
  reviewId: string,
  customerRef: string,
  orderRef: string,
  rating: number, // 1-5
  comment?: string,
  punctualityRating: number,
  politenessRating: number,
  conditionRating: number,
  isVerifiedDelivery: boolean,
  createdAt: timestamp
}
```

**Delivery History** (`drivers/{uid}/deliveryHistory/{deliveryId}`)
```typescript
{
  deliveryId: string,
  orderRef: string,
  restaurantRef: string,
  customerRef: string,
  pickupLocation: GeoPoint,
  deliveryLocation: GeoPoint,
  distance: number, // km
  estimatedTime: number, // minutes
  actualTime: number, // minutes
  status: "assigned" | "picked_up" | "delivered" | "cancelled",
  earnings: number,
  tips: number,
  deliveredAt?: timestamp
}
```

### Orders Collection
```typescript
{
  customerId: string,
  restaurantId: string,
  driverId?: string,
  items: array,
  status: OrderStatus,
  subtotal: number,
  deliveryFee: number,
  tax: number,
  total: number,
  deliveryAddress: object,
  paymentMethod: object,
  trackingUpdates: array,
  // ... more fields
}
```

## 🔧 Database Operations

### Creating Users
```typescript
import { createUser } from '@/lib/database/users';

await createUser(uid, {
  email: 'user@example.com',
  role: 'customer',
  isActive: true,
  isVerified: false
});
```

### Managing Vendors
```typescript
import { createVendor, approveVendor } from '@/lib/database/vendors';

// Create vendor
await createVendor(uid, vendorData);

// Approve vendor
await approveVendor(vendorUid, adminUid);
```

### Managing Drivers
```typescript
import {
  createDriver,
  approveDriver,
  updateDriverLocation,
  setDriverOnlineStatus,
  addDriverEarnings,
  addDriverReview
} from '@/lib/database/drivers';

// Create driver
await createDriver(uid, {
  userRef: `users/${uid}`,
  firstName: 'John',
  lastName: 'Smith',
  dateOfBirth: Timestamp.fromDate(new Date('1990-05-15')),
  nationalId: 'ID123456789',
  driverLicenseNumber: 'DL987654321',
  vehicleType: 'motorcycle',
  vehicleDetails: {
    make: 'Honda',
    model: 'CBR150R',
    licensePlate: 'ABC-1234',
    color: 'Red'
  },
  status: 'pending_approval',
  verificationStatus: 'pending',
  verificationDocuments: {
    driverLicense: 'https://example.com/docs/dl.pdf',
    vehicleRegistration: 'https://example.com/docs/vr.pdf',
    insurance: 'https://example.com/docs/ins.pdf',
    nationalId: 'https://example.com/docs/nid.pdf',
    profilePhoto: 'https://example.com/photos/profile.jpg'
  },
  isOnline: false,
  isAvailable: false,
  deliveryRadius: 10,
  totalDeliveries: 0,
  totalEarnings: 0,
  joinedAt: Timestamp.now(),
  bankDetails: {
    accountHolderName: 'John Smith',
    accountNumber: '1234567890',
    bankName: 'Chase Bank'
  },
  emergencyContact: {
    name: 'Jane Smith',
    relationship: 'Spouse',
    phone: '+1-555-0123'
  }
});

// Approve driver
await approveDriver(driverUid, adminUid);

// Update driver location
await updateDriverLocation(driverUid, {
  latitude: 40.7128,
  longitude: -74.0060
});

// Set driver online
await setDriverOnlineStatus(driverUid, true);

// Record earnings
await addDriverEarnings(driverUid, {
  totalEarnings: 125.50,
  deliveryFees: 95.00,
  tips: 25.50,
  bonuses: 5.00,
  penalties: 0,
  totalDeliveries: 8,
  avgDeliveryTime: 28,
  fuelCosts: 15.00
});

// Add review
await addDriverReview(driverUid, {
  customerRef: 'customers/customer123',
  orderRef: 'orders/order456',
  rating: 5,
  comment: 'Excellent service!',
  punctualityRating: 5,
  politenessRating: 5,
  conditionRating: 5,
  isVerifiedDelivery: true
});
```

### Managing Customers
```typescript
import {
  createCustomer,
  addCustomerAddress,
  addToCart,
  addCustomerFavorite
} from '@/lib/database/customers';

// Create customer
await createCustomer(uid, {
  userRef: `users/${uid}`,
  firstName: 'John',
  lastName: 'Doe',
  loyaltyPoints: 0,
  loyaltyTier: 'bronze',
  totalOrders: 0,
  totalSpent: 0,
  avgOrderValue: 0,
  marketingConsent: true,
  smsConsent: true,
  emailConsent: true,
  referralCode: 'JOHN123'
});

// Add address
await addCustomerAddress(uid, {
  label: 'Home',
  recipientName: 'John Doe',
  recipientPhone: '+1234567890',
  address: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  location: { latitude: 40.7128, longitude: -74.0060 },
  formattedAddress: '123 Main St, New York, NY 10001',
  isDefault: true,
  isActive: true
});

// Add to cart
await addToCart(uid, {
  restaurantRef: 'restaurants/rest123',
  menuItemRef: 'menuItems/item456',
  quantity: 2,
  itemPrice: 12.99,
  totalPrice: 25.98
});
```

### Order Management
```typescript
import { createOrder, updateOrderStatus } from '@/lib/database/orders';

// Create order
const orderId = await createOrder(orderData);

// Update status
await updateOrderStatus(orderId, 'confirmed');
```

## 📈 Analytics & Reporting

The database structure supports comprehensive analytics:

- **Vendor Analytics**: Sales, orders, ratings, top items
- **Driver Analytics**: Deliveries, earnings, performance
- **Platform Analytics**: Overall metrics and trends
- **Real-time Tracking**: Order status and location updates

## 🔄 Data Migration

For existing data migration:

1. Export existing data
2. Transform to new schema
3. Use batch operations for import
4. Validate data integrity

## 🛠️ Maintenance

### Regular Tasks
- Monitor database usage and costs
- Update security rules as needed
- Archive old orders and analytics
- Backup critical data
- Monitor performance metrics

### Scaling Considerations
- Use composite indexes for complex queries
- Implement pagination for large datasets
- Consider data partitioning for high volume
- Monitor read/write operations

## 🆘 Troubleshooting

### Common Issues

1. **Permission Denied**: Check security rules and user roles
2. **Missing Data**: Verify collection names and document structure
3. **Slow Queries**: Add appropriate indexes
4. **High Costs**: Optimize queries and implement caching

### Debug Tools
- Firebase Console for data inspection
- Firestore emulator for local testing
- Security rules simulator
- Performance monitoring

## 📞 Support

For issues with the database setup:

1. Check the Firebase Console for errors
2. Review security rules in the simulator
3. Verify user roles and permissions
4. Check network connectivity and authentication

## 🔗 Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firestore Pricing](https://firebase.google.com/pricing)

---

**Note**: This database structure is designed to scale with your business. Start with the basic setup and expand as needed based on your specific requirements.

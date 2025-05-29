import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from './collections';
import { DriverDocument, DriverEarningsDocument, DriverReviewDocument, DriverDeliveryHistoryDocument } from './schema';

// Sample driver data
const sampleDrivers: (DriverDocument & { uid: string })[] = [
  {
    uid: 'driver_001',
    userRef: 'users/driver_001',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: Timestamp.fromDate(new Date('1990-05-15')),
    gender: 'male',
    nationalId: 'ID123456789',
    driverLicenseNumber: 'DL987654321',
    vehicleType: 'motorcycle',
    vehicleDetails: {
      make: 'Honda',
      model: 'CBR150R',
      year: 2020,
      licensePlate: 'ABC-1234',
      color: 'Red',
      insuranceExpiry: Timestamp.fromDate(new Date('2024-12-31'))
    },
    status: 'active',
    verificationStatus: 'verified',
    verificationDocuments: {
      driverLicense: 'https://example.com/docs/dl_john_smith.pdf',
      vehicleRegistration: 'https://example.com/docs/vr_john_smith.pdf',
      insurance: 'https://example.com/docs/ins_john_smith.pdf',
      nationalId: 'https://example.com/docs/nid_john_smith.pdf',
      profilePhoto: 'https://example.com/photos/john_smith.jpg',
      backgroundCheck: 'https://example.com/docs/bg_john_smith.pdf'
    },
    currentLocation: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    isOnline: true,
    isAvailable: true,
    deliveryRadius: 10,
    avgRating: 4.8,
    totalDeliveries: 245,
    totalEarnings: 3250.75,
    joinedAt: Timestamp.fromDate(new Date('2023-01-15')),
    approvedBy: 'admin_001',
    approvedAt: Timestamp.fromDate(new Date('2023-01-20')),
    bankDetails: {
      accountHolderName: 'John Smith',
      accountNumber: '1234567890',
      bankName: 'Chase Bank',
      routingNumber: '021000021',
      swiftCode: 'CHASUS33'
    },
    emergencyContact: {
      name: 'Jane Smith',
      relationship: 'Spouse',
      phone: '+1-555-0123'
    },
    createdAt: Timestamp.fromDate(new Date('2023-01-15')),
    updatedAt: Timestamp.now(),
    lastActiveAt: Timestamp.now()
  },
  {
    uid: 'driver_002',
    userRef: 'users/driver_002',
    firstName: 'Maria',
    lastName: 'Garcia',
    dateOfBirth: Timestamp.fromDate(new Date('1988-08-22')),
    gender: 'female',
    nationalId: 'ID987654321',
    driverLicenseNumber: 'DL123456789',
    vehicleType: 'bicycle',
    vehicleDetails: {
      licensePlate: 'N/A',
      color: 'Blue'
    },
    status: 'active',
    verificationStatus: 'verified',
    verificationDocuments: {
      driverLicense: 'https://example.com/docs/dl_maria_garcia.pdf',
      vehicleRegistration: 'https://example.com/docs/vr_maria_garcia.pdf',
      insurance: 'https://example.com/docs/ins_maria_garcia.pdf',
      nationalId: 'https://example.com/docs/nid_maria_garcia.pdf',
      profilePhoto: 'https://example.com/photos/maria_garcia.jpg'
    },
    currentLocation: {
      latitude: 40.7589,
      longitude: -73.9851
    },
    isOnline: true,
    isAvailable: false,
    deliveryRadius: 5,
    avgRating: 4.9,
    totalDeliveries: 189,
    totalEarnings: 2180.50,
    joinedAt: Timestamp.fromDate(new Date('2023-03-10')),
    approvedBy: 'admin_001',
    approvedAt: Timestamp.fromDate(new Date('2023-03-15')),
    bankDetails: {
      accountHolderName: 'Maria Garcia',
      accountNumber: '9876543210',
      bankName: 'Bank of America',
      routingNumber: '026009593'
    },
    emergencyContact: {
      name: 'Carlos Garcia',
      relationship: 'Brother',
      phone: '+1-555-0456'
    },
    createdAt: Timestamp.fromDate(new Date('2023-03-10')),
    updatedAt: Timestamp.now(),
    lastActiveAt: Timestamp.now()
  },
  {
    uid: 'driver_003',
    userRef: 'users/driver_003',
    firstName: 'David',
    lastName: 'Johnson',
    dateOfBirth: Timestamp.fromDate(new Date('1992-12-03')),
    gender: 'male',
    nationalId: 'ID456789123',
    driverLicenseNumber: 'DL456789123',
    vehicleType: 'car',
    vehicleDetails: {
      make: 'Toyota',
      model: 'Camry',
      year: 2019,
      licensePlate: 'XYZ-5678',
      color: 'Silver',
      insuranceExpiry: Timestamp.fromDate(new Date('2024-10-15'))
    },
    status: 'pending_approval',
    verificationStatus: 'pending',
    verificationDocuments: {
      driverLicense: 'https://example.com/docs/dl_david_johnson.pdf',
      vehicleRegistration: 'https://example.com/docs/vr_david_johnson.pdf',
      insurance: 'https://example.com/docs/ins_david_johnson.pdf',
      nationalId: 'https://example.com/docs/nid_david_johnson.pdf',
      profilePhoto: 'https://example.com/photos/david_johnson.jpg'
    },
    isOnline: false,
    isAvailable: false,
    deliveryRadius: 15,
    totalDeliveries: 0,
    totalEarnings: 0,
    joinedAt: Timestamp.fromDate(new Date('2024-01-05')),
    bankDetails: {
      accountHolderName: 'David Johnson',
      accountNumber: '5555666677',
      bankName: 'Wells Fargo',
      routingNumber: '121000248'
    },
    emergencyContact: {
      name: 'Sarah Johnson',
      relationship: 'Wife',
      phone: '+1-555-0789'
    },
    createdAt: Timestamp.fromDate(new Date('2024-01-05')),
    updatedAt: Timestamp.now()
  }
];

// Sample earnings data for active drivers
const sampleEarnings: { driverUid: string; earnings: DriverEarningsDocument[] }[] = [
  {
    driverUid: 'driver_001',
    earnings: [
      {
        date: '2024-01-15',
        totalEarnings: 125.50,
        deliveryFees: 95.00,
        tips: 25.50,
        bonuses: 5.00,
        penalties: 0,
        totalDeliveries: 8,
        avgDeliveryTime: 28,
        fuelCosts: 15.00
      },
      {
        date: '2024-01-14',
        totalEarnings: 98.75,
        deliveryFees: 78.00,
        tips: 20.75,
        bonuses: 0,
        penalties: 0,
        totalDeliveries: 6,
        avgDeliveryTime: 32,
        fuelCosts: 12.50
      }
    ]
  },
  {
    driverUid: 'driver_002',
    earnings: [
      {
        date: '2024-01-15',
        totalEarnings: 89.25,
        deliveryFees: 72.00,
        tips: 17.25,
        bonuses: 0,
        penalties: 0,
        totalDeliveries: 9,
        avgDeliveryTime: 22,
        fuelCosts: 0 // Bicycle
      },
      {
        date: '2024-01-14',
        totalEarnings: 76.50,
        deliveryFees: 65.00,
        tips: 11.50,
        bonuses: 0,
        penalties: 0,
        totalDeliveries: 7,
        avgDeliveryTime: 25,
        fuelCosts: 0 // Bicycle
      }
    ]
  }
];

// Sample reviews for active drivers
const sampleReviews: { driverUid: string; reviews: (DriverReviewDocument & { id: string })[] }[] = [
  {
    driverUid: 'driver_001',
    reviews: [
      {
        id: 'review_001',
        reviewId: 'review_001',
        customerRef: 'customers/customer_001',
        orderRef: 'orders/order_001',
        rating: 5,
        comment: 'Excellent service! Food arrived hot and on time.',
        punctualityRating: 5,
        politenessRating: 5,
        conditionRating: 5,
        isVerifiedDelivery: true,
        createdAt: Timestamp.fromDate(new Date('2024-01-15'))
      },
      {
        id: 'review_002',
        reviewId: 'review_002',
        customerRef: 'customers/customer_002',
        orderRef: 'orders/order_002',
        rating: 4,
        comment: 'Good delivery, but took a bit longer than expected.',
        punctualityRating: 3,
        politenessRating: 5,
        conditionRating: 5,
        isVerifiedDelivery: true,
        createdAt: Timestamp.fromDate(new Date('2024-01-14'))
      }
    ]
  },
  {
    driverUid: 'driver_002',
    reviews: [
      {
        id: 'review_003',
        reviewId: 'review_003',
        customerRef: 'customers/customer_003',
        orderRef: 'orders/order_003',
        rating: 5,
        comment: 'Super fast delivery! Very friendly driver.',
        punctualityRating: 5,
        politenessRating: 5,
        conditionRating: 5,
        isVerifiedDelivery: true,
        createdAt: Timestamp.fromDate(new Date('2024-01-15'))
      }
    ]
  }
];

// Function to setup drivers collection
export const setupDriversCollection = async () => {
  console.log('Setting up drivers collection...');

  try {
    // Add sample drivers
    for (const driver of sampleDrivers) {
      const { uid, ...driverData } = driver;
      await setDoc(doc(db, COLLECTIONS.DRIVERS, uid), driverData);
      console.log(`Added driver: ${driver.firstName} ${driver.lastName}`);
    }

    // Add sample earnings
    for (const driverEarnings of sampleEarnings) {
      for (const earning of driverEarnings.earnings) {
        await setDoc(
          doc(db, COLLECTIONS.DRIVERS, driverEarnings.driverUid, COLLECTIONS.DRIVER_EARNINGS, earning.date),
          earning
        );
      }
      console.log(`Added earnings for driver: ${driverEarnings.driverUid}`);
    }

    // Add sample reviews
    for (const driverReviews of sampleReviews) {
      for (const review of driverReviews.reviews) {
        const { id, ...reviewData } = review;
        await setDoc(
          doc(db, COLLECTIONS.DRIVERS, driverReviews.driverUid, COLLECTIONS.DRIVER_REVIEWS, id),
          reviewData
        );
      }
      console.log(`Added reviews for driver: ${driverReviews.driverUid}`);
    }

    console.log('Drivers collection setup completed successfully!');
  } catch (error) {
    console.error('Error setting up drivers collection:', error);
    throw error;
  }
};

// Function to create corresponding user documents for drivers
export const createDriverUsers = async () => {
  console.log('Creating user documents for drivers...');

  const driverUsers = [
    {
      uid: 'driver_001',
      email: 'john.smith@tap2go.com',
      phoneNumber: '+1-555-0123',
      role: 'driver' as const,
      profileImageUrl: 'https://example.com/photos/john_smith.jpg',
      isActive: true,
      isVerified: true,
      fcmTokens: [],
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      createdAt: Timestamp.fromDate(new Date('2023-01-15')),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now()
    },
    {
      uid: 'driver_002',
      email: 'maria.garcia@tap2go.com',
      phoneNumber: '+1-555-0456',
      role: 'driver' as const,
      profileImageUrl: 'https://example.com/photos/maria_garcia.jpg',
      isActive: true,
      isVerified: true,
      fcmTokens: [],
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      createdAt: Timestamp.fromDate(new Date('2023-03-10')),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now()
    },
    {
      uid: 'driver_003',
      email: 'david.johnson@tap2go.com',
      phoneNumber: '+1-555-0789',
      role: 'driver' as const,
      profileImageUrl: 'https://example.com/photos/david_johnson.jpg',
      isActive: true,
      isVerified: false,
      fcmTokens: [],
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      createdAt: Timestamp.fromDate(new Date('2024-01-05')),
      updatedAt: Timestamp.now()
    }
  ];

  try {
    for (const user of driverUsers) {
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), user);
      console.log(`Created user document for: ${user.email}`);
    }
    console.log('Driver user documents created successfully!');
  } catch (error) {
    console.error('Error creating driver user documents:', error);
    throw error;
  }
};

// Main setup function
export const setupDriversDatabase = async () => {
  console.log('Starting drivers database setup...');
  
  try {
    await createDriverUsers();
    await setupDriversCollection();
    console.log('Drivers database setup completed successfully!');
  } catch (error) {
    console.error('Error in drivers database setup:', error);
    throw error;
  }
};

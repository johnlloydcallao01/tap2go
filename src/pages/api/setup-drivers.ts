import { NextApiRequest, NextApiResponse } from 'next';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Driver data to add to Firestore
const driversData = [
  {
    uid: 'driver_001',
    userData: {
      uid: 'driver_001',
      email: 'john.smith@tap2go.com',
      phoneNumber: '+1-555-0123',
      role: 'driver',
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isActive: true,
      isVerified: true,
      fcmTokens: [],
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      createdAt: Timestamp.fromDate(new Date('2023-01-15')),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now()
    },
    driverData: {
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
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
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
    }
  },
  {
    uid: 'driver_002',
    userData: {
      uid: 'driver_002',
      email: 'maria.garcia@tap2go.com',
      phoneNumber: '+1-555-0456',
      role: 'driver',
      profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      isActive: true,
      isVerified: true,
      fcmTokens: [],
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      createdAt: Timestamp.fromDate(new Date('2023-03-10')),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now()
    },
    driverData: {
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
        profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
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
    }
  },
  {
    uid: 'driver_003',
    userData: {
      uid: 'driver_003',
      email: 'david.johnson@tap2go.com',
      phoneNumber: '+1-555-0789',
      role: 'driver',
      profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      isActive: true,
      isVerified: false,
      fcmTokens: [],
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      createdAt: Timestamp.fromDate(new Date('2024-01-05')),
      updatedAt: Timestamp.now()
    },
    driverData: {
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
        profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
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
  }
];

// Sample earnings data
const earningsData = [
  {
    driverUid: 'driver_001',
    date: '2024-01-15',
    data: {
      date: '2024-01-15',
      totalEarnings: 125.50,
      deliveryFees: 95.00,
      tips: 25.50,
      bonuses: 5.00,
      penalties: 0,
      totalDeliveries: 8,
      avgDeliveryTime: 28,
      fuelCosts: 15.00
    }
  },
  {
    driverUid: 'driver_002',
    date: '2024-01-15',
    data: {
      date: '2024-01-15',
      totalEarnings: 89.25,
      deliveryFees: 72.00,
      tips: 17.25,
      bonuses: 0,
      penalties: 0,
      totalDeliveries: 9,
      avgDeliveryTime: 22,
      fuelCosts: 0
    }
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🚀 Adding drivers to Firestore database...');
    
    const results = [];
    
    // Add users and drivers
    for (const driver of driversData) {
      // Add user document
      await setDoc(doc(db, 'users', driver.uid), driver.userData);
      results.push(`Added user: ${driver.userData.email}`);
      
      // Add driver document
      await setDoc(doc(db, 'drivers', driver.uid), driver.driverData);
      results.push(`Added driver: ${driver.driverData.firstName} ${driver.driverData.lastName}`);
    }
    
    // Add earnings data
    for (const earning of earningsData) {
      await setDoc(
        doc(db, 'drivers', earning.driverUid, 'earnings', earning.date),
        earning.data
      );
      results.push(`Added earnings for ${earning.driverUid} on ${earning.date}`);
    }
    
    console.log('🎉 Successfully added all driver data to Firestore!');
    
    res.status(200).json({
      success: true,
      message: 'Successfully added all driver data to Firestore!',
      results,
      summary: {
        drivers: 3,
        users: 3,
        earnings: 2
      }
    });
    
  } catch (error) {
    console.error('❌ Error adding drivers to Firestore:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

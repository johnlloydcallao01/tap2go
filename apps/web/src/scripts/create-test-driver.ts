import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Script to create a test driver user
export const createTestDriver = async () => {
  const driverEmail = 'johndriver@tap2goph.com';
  const driverPassword = '12345678';
  const firstName = 'John';
  const lastName = 'Driver';

  try {
    // Check if Firebase Admin is initialized
    if (!adminAuth || !adminDb) {
      throw new Error('Firebase Admin not initialized. Please check your environment variables.');
    }

    console.log('🚗 Creating test driver user...');

    // Check if driver user already exists
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(driverEmail);
      console.log('Driver user already exists:', userRecord.uid);
      
      // Update existing user to ensure they have driver role
      await adminAuth.setCustomUserClaims(userRecord.uid, { 
        role: 'driver',
        status: 'approved' 
      });
      
      console.log('✅ Updated existing user with driver role');
      
    } catch (error) {
      // User doesn't exist, create new one
      console.log('Creating new driver user...');
      userRecord = await adminAuth.createUser({
        email: driverEmail,
        password: driverPassword,
        emailVerified: true,
        displayName: `${firstName} ${lastName}`,
      });
      console.log('Driver user created:', userRecord.uid);

      // Set driver custom claims
      await adminAuth.setCustomUserClaims(userRecord.uid, { 
        role: 'driver',
        status: 'approved' 
      });

      console.log('✅ Set driver custom claims');
    }

    // Create/Update user document in Firestore
    const userDocData = {
      uid: userRecord.uid,
      email: driverEmail,
      firstName,
      lastName,
      role: 'driver',
      status: 'active',
      isActive: true,
      isVerified: true,
      profile: {
        preferences: {
          notifications: true,
          marketing: false
        }
      },
      addresses: [],
      orderHistory: {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0
      },
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Check if user document exists
    const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
    if (userDoc.exists) {
      await adminDb.collection('users').doc(userRecord.uid).update(userDocData);
      console.log('✅ Updated user document');
    } else {
      await adminDb.collection('users').doc(userRecord.uid).set({
        ...userDocData,
        createdAt: FieldValue.serverTimestamp(),
      });
      console.log('✅ Created user document');
    }

    // Create/Update driver profile document
    const driverProfileData = {
      uid: userRecord.uid,
      email: driverEmail,
      firstName,
      lastName,
      status: 'approved',
      vehicle: {
        type: 'motorcycle',
        model: 'Honda CB300R',
        plateNumber: 'ABC-1234',
        color: 'Red',
        year: 2023
      },
      documents: {
        license: {
          status: 'verified',
          expiryDate: new Date('2025-12-31'),
          documentUrl: ''
        },
        insurance: {
          status: 'verified',
          expiryDate: new Date('2025-12-31'),
          documentUrl: ''
        },
        registration: {
          status: 'verified',
          expiryDate: new Date('2025-12-31'),
          documentUrl: ''
        }
      },
      earnings: {
        totalEarnings: 0,
        todayEarnings: 0,
        weekEarnings: 0,
        monthEarnings: 0
      },
      stats: {
        totalDeliveries: 0,
        completedDeliveries: 0,
        cancelledDeliveries: 0,
        averageRating: 5.0,
        totalRatings: 0
      },
      location: {
        latitude: 14.5995,
        longitude: 120.9842,
        address: 'Makati City, Metro Manila',
        lastUpdated: FieldValue.serverTimestamp()
      },
      availability: {
        isOnline: false,
        isAvailable: true,
        workingHours: {
          start: '08:00',
          end: '20:00'
        }
      },
      updatedAt: FieldValue.serverTimestamp(),
      approvedAt: FieldValue.serverTimestamp(),
      approvedBy: 'system'
    };

    // Check if driver profile exists
    const driverDoc = await adminDb.collection('drivers').doc(userRecord.uid).get();
    if (driverDoc.exists) {
      await adminDb.collection('drivers').doc(userRecord.uid).update(driverProfileData);
      console.log('✅ Updated driver profile');
    } else {
      await adminDb.collection('drivers').doc(userRecord.uid).set({
        ...driverProfileData,
        createdAt: FieldValue.serverTimestamp(),
      });
      console.log('✅ Created driver profile');
    }

    console.log('\n🎉 Test driver user setup completed successfully!');
    console.log('📧 Email:', driverEmail);
    console.log('🔑 Password:', driverPassword);
    console.log('👤 UID:', userRecord.uid);
    console.log('🚗 Role: driver');
    console.log('✅ Status: approved');
    
    return userRecord.uid;

  } catch (error) {
    console.error('❌ Error creating test driver user:', error);
    throw error;
  }
};

// Function to verify driver setup
export const verifyTestDriver = async () => {
  try {
    if (!adminAuth || !adminDb) {
      throw new Error('Firebase Admin not initialized');
    }

    const driverEmail = 'johndriver@tap2goph.com';

    // Get user from Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(driverEmail);
    
    // Get custom claims
    const customClaims = userRecord.customClaims;
    
    // Get user document from Firestore
    const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
    
    // Get driver profile document
    const driverDoc = await adminDb.collection('drivers').doc(userRecord.uid).get();
    
    console.log('\n🔍 Driver verification:');
    console.log('- UID:', userRecord.uid);
    console.log('- Email:', userRecord.email);
    console.log('- Email Verified:', userRecord.emailVerified);
    console.log('- Custom Claims:', customClaims);
    console.log('- User Document Exists:', userDoc.exists);
    console.log('- Driver Profile Exists:', driverDoc.exists);
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('- User Role:', userData?.role);
      console.log('- User Status:', userData?.status);
      console.log('- Is Active:', userData?.isActive);
    }
    
    if (driverDoc.exists) {
      const driverData = driverDoc.data();
      console.log('- Driver Status:', driverData?.status);
      console.log('- Vehicle Type:', driverData?.vehicle?.type);
      console.log('- Total Deliveries:', driverData?.stats?.totalDeliveries);
    }

    return {
      userRecord,
      userDoc: userDoc.exists ? userDoc.data() : null,
      driverDoc: driverDoc.exists ? driverDoc.data() : null
    };

  } catch (error) {
    console.error('❌ Error verifying driver setup:', error);
    throw error;
  }
};

// Run the script if called directly
if (require.main === module) {
  createTestDriver()
    .then(() => {
      console.log('\n🔍 Verifying setup...');
      return verifyTestDriver();
    })
    .then(() => {
      console.log('\n✅ All verification checks passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

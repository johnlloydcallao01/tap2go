import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6ALvnN6aX0DMVhePhkUow9VrPauBCqgQ",
  authDomain: "tap2go-kuucn.firebaseapp.com",
  projectId: "tap2go-kuucn",
  storageBucket: "tap2go-kuucn.firebasestorage.app",
  messagingSenderId: "828629511294",
  appId: "1:828629511294:web:fae32760ca3c3afcb87c2f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Driver user details
const driverEmail = 'johndriver@tap2goph.com';
const driverPassword = '12345678';
const firstName = 'John';
const lastName = 'Driver';

// Function to create driver user
export const createDriverUser = async () => {
  try {
    console.log('🚗 Creating driver user with client SDK...');

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, driverEmail, driverPassword);
    const user = userCredential.user;

    console.log('✅ Driver user created:', user.uid);

    // Update user profile
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });

    console.log('✅ Updated user profile');

    // Create user document in Firestore
    const userDocData = {
      uid: user.uid,
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
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'users', user.uid), userDocData);
    console.log('✅ Created user document in Firestore');

    // Create driver profile document
    const driverProfileData = {
      uid: user.uid,
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
          expiryDate: Timestamp.fromDate(new Date('2025-12-31')),
          documentUrl: ''
        },
        insurance: {
          status: 'verified',
          expiryDate: Timestamp.fromDate(new Date('2025-12-31')),
          documentUrl: ''
        },
        registration: {
          status: 'verified',
          expiryDate: Timestamp.fromDate(new Date('2025-12-31')),
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
        lastUpdated: Timestamp.now()
      },
      availability: {
        isOnline: false,
        isAvailable: true,
        workingHours: {
          start: '08:00',
          end: '20:00'
        }
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      approvedAt: Timestamp.now(),
      approvedBy: 'system'
    };

    await setDoc(doc(db, 'drivers', user.uid), driverProfileData);
    console.log('✅ Created driver profile in Firestore');

    console.log('\n🎉 Driver user created successfully!');
    console.log('📧 Email:', driverEmail);
    console.log('🔑 Password:', driverPassword);
    console.log('👤 UID:', user.uid);
    console.log('🚗 Role: driver');
    console.log('\n⚠️  IMPORTANT: You need to manually set custom claims in Firebase Console:');
    console.log('   1. Go to Firebase Console > Authentication > Users');
    console.log('   2. Find user:', driverEmail);
    console.log('   3. Set custom claims: {"role": "driver", "status": "approved"}');

    return user.uid;

  } catch (error) {
    console.error('❌ Error creating driver user:', error);
    throw error;
  }
};

// Function to test sign in
export const testDriverSignIn = async () => {
  try {
    console.log('\n🔐 Testing driver sign in...');

    const userCredential = await signInWithEmailAndPassword(auth, driverEmail, driverPassword);
    const user = userCredential.user;

    console.log('✅ Sign in successful!');
    console.log('👤 UID:', user.uid);
    console.log('📧 Email:', user.email);
    console.log('✅ Email Verified:', user.emailVerified);

    // Get ID token to check custom claims
    const idTokenResult = await user.getIdTokenResult();
    console.log('🎫 Custom Claims:', idTokenResult.claims);

    return user;

  } catch (error) {
    console.error('❌ Error signing in:', error);
    throw error;
  }
};

// Run the script
if (require.main === module) {
  createDriverUser()
    .then(() => {
      console.log('\n🔍 Testing sign in...');
      return testDriverSignIn();
    })
    .then(() => {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

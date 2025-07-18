/**
 * Create Sample Driver User Script
 * Creates a sample driver user for testing authentication
 */

const admin = require('firebase-admin');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_ADMIN_PROJECT_ID || "tap2go-kuucn",
    private_key_id: "key_id",
    private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    client_id: "client_id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_ADMIN_CLIENT_EMAIL}`
  };

  console.log('🔧 Initializing Firebase Admin with project:', serviceAccount.project_id);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function createSampleDriver() {
  const email = 'sampledriver@tap2goph.com';
  const password = '@Iamachessgrandmaster23';
  const firstName = 'Sample';
  const lastName = 'Driver';

  try {
    console.log('🚀 Creating sample driver user...\n');

    // Step 1: Create Firebase Auth user
    console.log('📝 Step 1: Creating Firebase Auth user...');
    let firebaseUser;
    
    try {
      // Try to get existing user first
      firebaseUser = await auth.getUserByEmail(email);
      console.log('✅ Firebase Auth user already exists:', firebaseUser.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        firebaseUser = await auth.createUser({
          email: email,
          password: password,
          displayName: `${firstName} ${lastName}`,
          emailVerified: true
        });
        console.log('✅ Firebase Auth user created:', firebaseUser.uid);
      } else {
        throw error;
      }
    }

    const uid = firebaseUser.uid;

    // Step 2: Create user document
    console.log('📝 Step 2: Creating user document...');
    const userRef = db.collection('users').doc(uid);
    const userData = {
      email: email,
      role: 'driver',
      isActive: true,
      isVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: null,
      fcmTokens: [],
      preferredLanguage: 'en',
      timezone: 'Asia/Manila'
    };

    await userRef.set(userData, { merge: true });
    console.log('✅ User document created/updated');

    // Step 3: Create driver profile document
    console.log('📝 Step 3: Creating driver profile document...');
    const driverRef = db.collection('drivers').doc(uid);
    const driverData = {
      userRef: `users/${uid}`,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: '+639123456789',
      profileImageUrl: null,
      status: 'approved', // Set to approved so they can login
      verificationStatus: 'verified',
      isOnline: false,
      isAvailable: false,
      currentLocation: null,
      vehicleType: 'motorcycle',
      vehicleDetails: null,
      totalDeliveries: 0,
      totalEarnings: 0,
      rating: 5.0,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await driverRef.set(driverData, { merge: true });
    console.log('✅ Driver profile document created/updated');

    console.log('\n🎉 Sample driver user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', `${firstName} ${lastName}`);
    console.log('🆔 UID:', uid);
    console.log('✅ Status: Approved and ready to login');
    
    console.log('\n🔗 Test the login at: http://localhost:3008/auth');

  } catch (error) {
    console.error('❌ Error creating sample driver:', error);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('💡 User already exists. Updating profile data...');
      // Continue with profile creation even if auth user exists
    } else {
      process.exit(1);
    }
  }
}

// Run the script
createSampleDriver()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });

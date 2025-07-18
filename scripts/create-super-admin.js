/**
 * Create Super Admin User Script
 * Creates the super admin user for accessing apps/web-admin
 * 
 * Email: johnlloydcallao@gmail.com
 * Password: @Iamachessgrandmaster23
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

async function createSuperAdmin() {
  const email = 'johnlloydcallao@gmail.com';
  const password = '@Iamachessgrandmaster23';
  const firstName = 'John Lloyd';
  const lastName = 'Callao';

  try {
    console.log('🚀 Creating Super Admin User...\n');
    console.log('👑 Email:', email);
    console.log('🔐 Password:', password);
    console.log('');

    // Step 1: Create Firebase Auth user
    console.log('📝 Step 1: Creating Firebase Auth user...');
    let firebaseUser;
    
    try {
      // Try to get existing user first
      firebaseUser = await auth.getUserByEmail(email);
      console.log('✅ Firebase Auth user already exists:', firebaseUser.uid);
      
      // Update password if user exists
      await auth.updateUser(firebaseUser.uid, {
        password: password,
        emailVerified: true,
        displayName: `${firstName} ${lastName}`
      });
      console.log('✅ Password and profile updated');
      
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

    // Step 2: Set Custom Claims
    console.log('📝 Step 2: Setting custom claims...');
    await auth.setCustomUserClaims(uid, { 
      role: 'admin',
      isSuperAdmin: true,
      permissions: [
        'manage_vendors',
        'handle_disputes', 
        'view_analytics',
        'driver_verification',
        'system_config',
        'manage_admins',
        'manage_customers',
        'manage_orders',
        'manage_restaurants',
        'manage_drivers',
        'view_reports',
        'system_settings'
      ]
    });
    console.log('✅ Custom claims set (role: admin, isSuperAdmin: true)');

    // Step 3: Create user document
    console.log('📝 Step 3: Creating user document...');
    const userRef = db.collection('users').doc(uid);
    const userData = {
      email: email,
      role: 'admin',
      isActive: true,
      isVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: null,
      fcmTokens: [],
      preferredLanguage: 'en',
      timezone: 'UTC'
    };

    await userRef.set(userData, { merge: true });
    console.log('✅ User document created/updated');

    // Step 4: Create admin profile document
    console.log('📝 Step 4: Creating admin profile document...');
    const adminRef = db.collection('admins').doc(uid);
    const adminData = {
      userRef: `users/${uid}`,
      firstName: firstName,
      lastName: lastName,
      displayName: `${firstName} ${lastName}`,
      phoneNumber: null,
      profileImageUrl: null,
      department: 'technical',
      permissions: [
        'manage_vendors',
        'handle_disputes',
        'view_analytics', 
        'driver_verification',
        'system_config',
        'manage_admins',
        'manage_customers',
        'manage_orders',
        'manage_restaurants',
        'manage_drivers',
        'view_reports',
        'system_settings'
      ],
      accessLevel: 'super_admin',
      assignedRegions: ['US', 'CA', 'PH'],
      isSuperAdmin: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await adminRef.set(adminData, { merge: true });
    console.log('✅ Admin profile document created/updated');

    // Step 5: Verify creation
    console.log('📝 Step 5: Verifying admin user...');
    
    // Check Firebase Auth
    const authUser = await auth.getUser(uid);
    console.log('✅ Firebase Auth verified:', authUser.email);
    
    // Check custom claims
    const customClaims = authUser.customClaims || {};
    console.log('✅ Custom claims verified:', customClaims);
    
    // Check user document
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      console.log('✅ User document verified:', userDoc.data().role);
    }
    
    // Check admin document
    const adminDoc = await adminRef.get();
    if (adminDoc.exists) {
      console.log('✅ Admin document verified:', adminDoc.data().accessLevel);
    }

    console.log('\n🎉 SUCCESS! Super Admin User Created Successfully!');
    console.log('');
    console.log('📋 Admin Details:');
    console.log('   UID:', uid);
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Name:', `${firstName} ${lastName}`);
    console.log('   Role: Super Admin');
    console.log('   Access Level: super_admin');
    console.log('   Department: technical');
    console.log('');
    console.log('🚀 You can now login to apps/web-admin with these credentials!');
    console.log('   URL: http://localhost:3004/login');
    console.log('');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    if (error.message) {
      console.error('Error Message:', error.message);
    }
    
    process.exit(1);
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

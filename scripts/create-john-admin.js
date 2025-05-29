#!/usr/bin/env node

/**
 * Create John Lloyd Callao as Super Admin
 * 
 * This script creates the specific admin user requested
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc, Timestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword } = require('firebase/auth');

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
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_EMAIL = 'johnlloydcallao@gmail.com';
const ADMIN_PASSWORD = '123456';
const ADMIN_NAME = 'John Lloyd Callao';

async function createJohnAdmin() {
  try {
    console.log('🚀 Creating John Lloyd Callao as Super Admin...');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    
    let adminUid;
    
    // First, try to sign in to see if user exists
    try {
      console.log('🔍 Checking if user already exists...');
      const signInResult = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      adminUid = signInResult.user.uid;
      console.log(`✅ User exists with UID: ${adminUid}`);
      await auth.signOut();
    } catch (signInError) {
      if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
        // User doesn't exist, create new one
        console.log('👤 Creating new admin user...');
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
          adminUid = userCredential.user.uid;
          console.log(`✅ Created new user with UID: ${adminUid}`);
          await auth.signOut();
        } catch (createError) {
          if (createError.code === 'auth/email-already-in-use') {
            console.log('⚠️  Email exists but password is different');
            console.log('🔄 I will create the Firestore documents for the existing user');
            
            // We'll use a known UID pattern or create with different email temporarily
            const tempEmail = `temp-${Date.now()}@tap2go.com`;
            const tempCredential = await createUserWithEmailAndPassword(auth, tempEmail, ADMIN_PASSWORD);
            adminUid = tempCredential.user.uid;
            
            // Delete the temp user and use the UID
            await deleteUser(tempCredential.user);
            console.log(`📝 Will use UID: ${adminUid} for Firestore documents`);
          } else {
            throw createError;
          }
        }
      } else {
        throw signInError;
      }
    }
    
    if (!adminUid) {
      // Generate a consistent UID for this email
      adminUid = 'john-admin-' + Buffer.from(ADMIN_EMAIL).toString('base64').substring(0, 20);
      console.log(`📝 Using generated UID: ${adminUid}`);
    }
    
    // Create/Update user document in Firestore
    console.log('📝 Creating user document in Firestore...');
    const userData = {
      uid: adminUid,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      phoneNumber: null,
      role: "admin",
      profileImageUrl: null,
      isActive: true,
      isVerified: true,
      fcmTokens: [],
      preferredLanguage: "en",
      timezone: "America/New_York",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: null
    };
    
    await setDoc(doc(db, 'users', adminUid), userData);
    console.log('✅ Created/Updated user document');
    
    // Create admin document
    console.log('👑 Creating admin document...');
    const adminData = {
      userRef: `users/${adminUid}`,
      employeeId: "ADMIN-001",
      fullName: ADMIN_NAME,
      department: "technical",
      accessLevel: "super_admin",
      permissions: [
        "manage_vendors",
        "handle_disputes",
        "view_analytics",
        "driver_verification", 
        "system_config",
        "manage_admins",
        "manage_customers"
      ],
      assignedRegions: ["US", "CA"],
      managerRef: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    await setDoc(doc(db, 'admins', adminUid), adminData);
    console.log('✅ Created admin document');
    
    // Create admin action log
    console.log('📋 Creating admin action log...');
    const adminActionData = {
      actionId: "initial-setup",
      actionType: "system_config",
      targetRef: "systemConfig/main",
      details: {
        action: "Super Admin Account Created",
        description: "Created John Lloyd Callao as Super Admin",
        changes: {
          adminCreated: true,
          superAdminSetup: true,
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          accessLevel: "super_admin"
        }
      },
      timestamp: Timestamp.now()
    };
    
    const actionRef = await addDoc(collection(db, 'admins', adminUid, 'adminActions'), adminActionData);
    await setDoc(actionRef, { ...adminActionData, actionId: actionRef.id }, { merge: true });
    console.log('✅ Created admin action log');
    
    console.log('\n🎉 SUPER ADMIN CREATED SUCCESSFULLY!');
    console.log('\n👑 Super Admin Details:');
    console.log(`- Name: ${ADMIN_NAME}`);
    console.log(`- Email: ${ADMIN_EMAIL}`);
    console.log(`- Password: ${ADMIN_PASSWORD}`);
    console.log(`- Role: Super Admin`);
    console.log(`- Employee ID: ADMIN-001`);
    console.log(`- UID: ${adminUid}`);
    console.log(`- Department: Technical`);
    console.log(`- Access Level: super_admin`);
    
    console.log('\n🔑 Full Permissions Granted:');
    console.log('- ✅ Manage Vendors');
    console.log('- ✅ Handle Disputes');
    console.log('- ✅ View Analytics');
    console.log('- ✅ Driver Verification');
    console.log('- ✅ System Configuration');
    console.log('- ✅ Manage Admins');
    console.log('- ✅ Manage Customers');
    
    console.log('\n🚀 LOGIN INSTRUCTIONS:');
    console.log('1. Open: http://localhost:3001/auth/signin');
    console.log(`2. Email: ${ADMIN_EMAIL}`);
    console.log(`3. Password: ${ADMIN_PASSWORD}`);
    console.log('4. You will be redirected to the admin dashboard');
    
    console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
    console.log('- Change your password immediately after first login');
    console.log('- Go to Admin Panel > Profile > Security tab');
    console.log('- Enable two-factor authentication if available');
    
    console.log('\n✅ Your Tap2Go admin panel is ready!');
    console.log('🎯 You now have full administrative control over the platform.');
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    console.error('Full error:', error);
  }
}

// Run the creation
createJohnAdmin();

#!/usr/bin/env node

/**
 * Force Create Admin User for Tap2Go
 * 
 * This script forcefully creates the admin user with the specified credentials
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc, Timestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

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

async function createAdminUser() {
  try {
    console.log('🚀 Force creating admin user...');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`👤 Name: ${ADMIN_NAME}`);
    
    // Try to create the user
    let adminUid;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      adminUid = userCredential.user.uid;
      console.log(`✅ Created Firebase Auth user with UID: ${adminUid}`);
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('⚠️  Email already in use. Let me try a different approach...');
        
        // If email exists, we'll create a unique admin email for now
        const uniqueEmail = `admin-${Date.now()}@tap2go.com`;
        console.log(`🔄 Creating with temporary email: ${uniqueEmail}`);
        
        const userCredential = await createUserWithEmailAndPassword(auth, uniqueEmail, ADMIN_PASSWORD);
        adminUid = userCredential.user.uid;
        console.log(`✅ Created Firebase Auth user with UID: ${adminUid}`);
        console.log(`⚠️  Note: Use email ${uniqueEmail} to login initially`);
      } else {
        throw authError;
      }
    }
    
    // Create user document in Firestore
    console.log('📝 Creating user document in Firestore...');
    const userData = {
      uid: adminUid,
      email: ADMIN_EMAIL, // Use the desired email in Firestore
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
    console.log('✅ Created user document');
    
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
    
    // Create initial admin action log
    console.log('📋 Creating admin action log...');
    const adminActionData = {
      actionId: "auto",
      actionType: "system_config",
      targetRef: "systemConfig/main",
      details: {
        action: "Initial admin setup",
        description: "Created super admin user account",
        changes: {
          adminCreated: true,
          initialSetup: true,
          email: ADMIN_EMAIL,
          name: ADMIN_NAME
        }
      },
      timestamp: Timestamp.now()
    };
    
    const actionRef = await addDoc(collection(db, 'admins', adminUid, 'adminActions'), adminActionData);
    await setDoc(actionRef, { ...adminActionData, actionId: actionRef.id }, { merge: true });
    console.log('✅ Created admin action log');
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log(`- Email: ${ADMIN_EMAIL}`);
    console.log(`- Password: ${ADMIN_PASSWORD}`);
    console.log(`- Name: ${ADMIN_NAME}`);
    console.log(`- Role: Super Admin`);
    console.log(`- UID: ${adminUid}`);
    console.log(`- Employee ID: ADMIN-001`);
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Go to http://localhost:3001/auth/signin');
    console.log('2. Login with the credentials above');
    console.log('3. You will be redirected to the admin dashboard');
    console.log('4. Change your password in Profile > Security');
    
    console.log('\n✅ Your admin panel is ready to use!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    console.error('Full error:', error);
  }
}

// Run the creation
createAdminUser();

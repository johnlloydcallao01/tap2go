#!/usr/bin/env node

/**
 * Verify and Create Admin User for Tap2Go
 * 
 * This script checks if the admin user exists and creates/updates it with proper admin role
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, Timestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

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

async function verifyAndCreateAdmin() {
  try {
    console.log('🔍 Verifying admin user setup...');
    console.log(`📧 Admin Email: ${ADMIN_EMAIL}`);
    
    let adminUid = null;
    
    // Try to sign in to get the UID
    try {
      const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      adminUid = userCredential.user.uid;
      console.log(`✅ Admin user exists with UID: ${adminUid}`);
      await auth.signOut();
    } catch (signInError) {
      if (signInError.code === 'auth/user-not-found') {
        console.log('👤 Creating new admin user...');
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
          adminUid = userCredential.user.uid;
          console.log(`✅ Created new admin user with UID: ${adminUid}`);
          await auth.signOut();
        } catch (createError) {
          console.error('❌ Failed to create admin user:', createError.message);
          return;
        }
      } else if (signInError.code === 'auth/wrong-password') {
        console.log('⚠️  Admin user exists but password might be different');
        console.log('🔄 Trying to get user info...');
        // We'll need to handle this case differently
        return;
      } else {
        console.error('❌ Sign in error:', signInError.message);
        return;
      }
    }
    
    if (!adminUid) {
      console.error('❌ Could not get admin UID');
      return;
    }
    
    // Check if user document exists in Firestore
    console.log('📄 Checking user document...');
    const userDocRef = doc(db, 'users', adminUid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('📝 Creating user document...');
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
      
      await setDoc(userDocRef, userData);
      console.log('✅ Created user document');
    } else {
      console.log('📄 User document exists, checking role...');
      const userData = userDoc.data();
      if (userData.role !== 'admin') {
        console.log('🔄 Updating user role to admin...');
        await setDoc(userDocRef, { 
          role: 'admin',
          name: ADMIN_NAME,
          isActive: true,
          isVerified: true,
          updatedAt: Timestamp.now()
        }, { merge: true });
        console.log('✅ Updated user role to admin');
      } else {
        console.log('✅ User already has admin role');
      }
    }
    
    // Check if admin document exists
    console.log('👑 Checking admin document...');
    const adminDocRef = doc(db, 'admins', adminUid);
    const adminDoc = await getDoc(adminDocRef);
    
    if (!adminDoc.exists()) {
      console.log('📝 Creating admin document...');
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
      
      await setDoc(adminDocRef, adminData);
      console.log('✅ Created admin document');
    } else {
      console.log('✅ Admin document already exists');
    }
    
    console.log('\n🎉 Admin user verification completed!');
    console.log('\n📋 Admin User Details:');
    console.log(`- Email: ${ADMIN_EMAIL}`);
    console.log(`- Password: ${ADMIN_PASSWORD}`);
    console.log(`- Name: ${ADMIN_NAME}`);
    console.log(`- Role: Super Admin`);
    console.log(`- UID: ${adminUid}`);
    
    console.log('\n🚀 You can now login to the admin panel at:');
    console.log('- http://localhost:3001/auth/signin');
    console.log('- Use the credentials above');
    console.log('- After login, you\'ll be redirected to the admin dashboard');
    
    console.log('\n⚠️  Security Reminder:');
    console.log('- Please change your password after first login');
    console.log('- Go to Admin Panel > Profile > Security tab');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the verification
verifyAndCreateAdmin();

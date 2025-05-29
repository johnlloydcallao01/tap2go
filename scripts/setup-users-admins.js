#!/usr/bin/env node

/**
 * Setup Users and Admins Collections for Tap2Go
 * 
 * This script sets up ONLY the users and admins collections
 * as specified - no other data will be added.
 * 
 * Collections to create:
 * 1. users (top-level) - Universal user authentication and role management
 * 2. admins (top-level) - Platform administrators and staff
 * 3. adminActions (subcollection) - Admin activity logs
 * 
 * Usage: node scripts/setup-users-admins.js
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

// Function to create initial admin user
async function createInitialAdmin(adminEmail, adminPassword, adminName) {
  try {
    console.log('👤 Creating initial admin user...');
    
    // Create Firebase Auth user
    const { user } = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const adminUid = user.uid;
    
    // Create user document in users collection
    const userData = {
      uid: adminUid,
      email: adminEmail,
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
    console.log(`   ✅ Created user document for admin: ${adminEmail}`);
    
    // Create admin document in admins collection
    const adminData = {
      userRef: `users/${adminUid}`,
      employeeId: "ADMIN-001",
      fullName: adminName,
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
    console.log(`   ✅ Created admin document for: ${adminName}`);
    
    // Create a sample admin action in the subcollection
    const adminActionData = {
      actionId: "auto", // Will be set to document ID
      actionType: "system_config",
      targetRef: "systemConfig/main",
      details: {
        action: "Initial system setup",
        description: "Created initial admin user and configured basic system settings",
        changes: {
          adminCreated: true,
          initialSetup: true
        }
      },
      timestamp: Timestamp.now()
    };
    
    const actionRef = await addDoc(collection(db, 'admins', adminUid, 'adminActions'), adminActionData);
    
    // Update the action document with its own ID
    await setDoc(actionRef, { ...adminActionData, actionId: actionRef.id }, { merge: true });
    console.log(`   ✅ Created initial admin action log`);
    
    return adminUid;
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('   ⚠️  Admin email already exists, skipping user creation');
      return null;
    } else {
      throw error;
    }
  }
}

// Function to setup collection structure documentation
async function setupCollectionStructure() {
  console.log('📋 Setting up collection structure documentation...');
  
  // Create a system document to document the collection structure
  const structureDoc = {
    collections: {
      users: {
        purpose: "Universal user authentication and role management",
        docIdFormat: "User's Auth UID",
        fields: {
          uid: "string",
          email: "string", 
          phoneNumber: "string (optional)",
          role: "admin | vendor | driver | customer",
          profileImageUrl: "string (optional)",
          isActive: "boolean",
          isVerified: "boolean",
          fcmTokens: "string[] (optional) - for push notifications",
          preferredLanguage: "string (optional)",
          timezone: "string (optional)",
          createdAt: "timestamp",
          updatedAt: "timestamp",
          lastLoginAt: "timestamp (optional)"
        }
      },
      admins: {
        purpose: "Platform administrators and staff",
        docIdFormat: "Admin's Auth UID",
        fields: {
          userRef: "string - path to users/{uid}",
          employeeId: "string",
          fullName: "string",
          department: "operations | finance | customer_support | technical | marketing",
          accessLevel: "super_admin | regional_admin | support_agent | analyst",
          permissions: "string[] - [manage_vendors, handle_disputes, view_analytics]",
          assignedRegions: "string[] (optional)",
          managerRef: "string (optional) - path to admins/{managerId}",
          createdAt: "timestamp",
          updatedAt: "timestamp"
        },
        subcollections: {
          adminActions: {
            path: "admins/{adminUid}/adminActions/{actionId}",
            fields: {
              actionId: "auto",
              actionType: "vendor_approval | dispute_resolution | driver_verification | system_config",
              targetRef: "string - path to affected document",
              details: "map - action-specific data",
              timestamp: "timestamp"
            }
          }
        }
      }
    },
    setupDate: Timestamp.now(),
    version: "1.0.0"
  };
  
  await setDoc(doc(db, '_system', 'collections_structure'), structureDoc);
  console.log('   ✅ Collection structure documented');
}

// Main setup function
async function setupUsersAndAdmins() {
  try {
    console.log('🚀 Setting up Users and Admins collections for Tap2Go...\n');

    // Parse command line arguments for admin creation
    const args = process.argv.slice(2);
    const adminEmailIndex = args.indexOf('--admin-email');
    const adminNameIndex = args.indexOf('--admin-name');
    const adminPasswordIndex = args.indexOf('--admin-password');

    const adminEmail = adminEmailIndex !== -1 ? args[adminEmailIndex + 1] : null;
    const adminName = adminNameIndex !== -1 ? args[adminNameIndex + 1] : null;
    const adminPassword = adminPasswordIndex !== -1 ? args[adminPasswordIndex + 1] : 'TempPassword123!';

    // Setup collection structure documentation
    await setupCollectionStructure();

    // Create initial admin user if requested
    let adminCreated = false;
    if (adminEmail && adminName) {
      const adminUid = await createInitialAdmin(adminEmail, adminPassword, adminName);
      if (adminUid) {
        adminCreated = true;
        console.log(`   🔑 Admin credentials: ${adminEmail} / ${adminPassword}`);
        console.log('   ⚠️  Please change the password after first login');
      }
    }

    console.log('\n🎉 Users and Admins collections setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ users collection structure ready');
    console.log('- ✅ admins collection structure ready');
    console.log('- ✅ adminActions subcollection structure ready');
    console.log('- ✅ Collection structure documented in _system/collections_structure');
    
    if (adminCreated) {
      console.log(`- ✅ Initial admin user created: ${adminEmail}`);
      console.log('- ✅ Sample admin action logged');
    }

    console.log('\n🔧 Collections Ready For:');
    console.log('- User registration (customers, vendors, drivers)');
    console.log('- Admin management and permissions');
    console.log('- Admin action logging and audit trails');
    console.log('- Role-based access control');

    console.log('\n📝 Next Steps:');
    console.log('1. Check Firebase Console to see the new collections');
    console.log('2. Test user registration on your website');
    if (adminCreated) {
      console.log(`3. Login as admin with: ${adminEmail}`);
    }
    console.log('4. Collections are ready for your specific data when you\'re ready');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Display usage information
function showUsage() {
  console.log('📖 Usage:');
  console.log('  node scripts/setup-users-admins.js');
  console.log('  node scripts/setup-users-admins.js --admin-email admin@tap2go.com --admin-name "Admin User"');
  console.log('  node scripts/setup-users-admins.js --admin-email admin@tap2go.com --admin-name "Admin User" --admin-password "SecurePassword123!"');
  console.log('\n📝 Options:');
  console.log('  --admin-email    Email for the initial admin user');
  console.log('  --admin-name     Full name for the initial admin user');
  console.log('  --admin-password Password for the initial admin user (optional, default: TempPassword123!)');
  console.log('\n⚠️  Note: This script only sets up users and admins collections - no other data.');
}

// Check if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run the setup
setupUsersAndAdmins();

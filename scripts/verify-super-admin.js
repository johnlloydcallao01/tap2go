/**
 * Verify Super Admin User Script
 * Verifies that the super admin user was created correctly
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

async function verifySuperAdmin() {
  const email = 'johnlloydcallao@gmail.com';

  try {
    console.log('🔍 Verifying Super Admin User...\n');
    console.log('👑 Email:', email);
    console.log('');

    // Step 1: Check Firebase Auth user
    console.log('📝 Step 1: Checking Firebase Auth user...');
    let firebaseUser;
    
    try {
      firebaseUser = await auth.getUserByEmail(email);
      console.log('✅ Firebase Auth user found:', firebaseUser.uid);
      console.log('   Email Verified:', firebaseUser.emailVerified);
      console.log('   Display Name:', firebaseUser.displayName);
      console.log('   Created:', new Date(firebaseUser.metadata.creationTime).toLocaleString());
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('❌ Firebase Auth user not found');
        console.log('   Run: node scripts/create-super-admin.js');
        return;
      } else {
        throw error;
      }
    }

    const uid = firebaseUser.uid;

    // Step 2: Check Custom Claims
    console.log('\n📝 Step 2: Checking custom claims...');
    const customClaims = firebaseUser.customClaims || {};
    console.log('✅ Custom Claims:', JSON.stringify(customClaims, null, 2));
    
    if (customClaims.role === 'admin') {
      console.log('✅ Role: admin ✓');
    } else {
      console.log('❌ Role: missing or incorrect');
    }
    
    if (customClaims.isSuperAdmin === true) {
      console.log('✅ Super Admin: true ✓');
    } else {
      console.log('❌ Super Admin: missing or false');
    }

    // Step 3: Check user document
    console.log('\n📝 Step 3: Checking user document...');
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('✅ User document found');
      console.log('   Role:', userData.role);
      console.log('   Active:', userData.isActive);
      console.log('   Verified:', userData.isVerified);
      console.log('   Email:', userData.email);
      console.log('   Created:', userData.createdAt?.toDate().toLocaleString());
      
      if (userData.role === 'admin') {
        console.log('✅ User role: admin ✓');
      } else {
        console.log('❌ User role: incorrect');
      }
    } else {
      console.log('❌ User document not found');
    }

    // Step 4: Check admin profile document
    console.log('\n📝 Step 4: Checking admin profile document...');
    const adminRef = db.collection('admins').doc(uid);
    const adminDoc = await adminRef.get();
    
    if (adminDoc.exists) {
      const adminData = adminDoc.data();
      console.log('✅ Admin document found');
      console.log('   Name:', `${adminData.firstName} ${adminData.lastName}`);
      console.log('   Department:', adminData.department);
      console.log('   Access Level:', adminData.accessLevel);
      console.log('   Super Admin:', adminData.isSuperAdmin);
      console.log('   Permissions:', adminData.permissions?.length || 0, 'permissions');
      console.log('   Regions:', adminData.assignedRegions?.join(', '));
      console.log('   Created:', adminData.createdAt?.toDate().toLocaleString());
      
      if (adminData.accessLevel === 'super_admin') {
        console.log('✅ Access level: super_admin ✓');
      } else {
        console.log('❌ Access level: incorrect');
      }
    } else {
      console.log('❌ Admin document not found');
    }

    // Step 5: Summary
    console.log('\n📋 VERIFICATION SUMMARY:');
    console.log('========================');
    
    const checks = [
      { name: 'Firebase Auth User', status: firebaseUser ? '✅' : '❌' },
      { name: 'Email Verified', status: firebaseUser?.emailVerified ? '✅' : '❌' },
      { name: 'Admin Role Claim', status: customClaims.role === 'admin' ? '✅' : '❌' },
      { name: 'Super Admin Claim', status: customClaims.isSuperAdmin === true ? '✅' : '❌' },
      { name: 'User Document', status: userDoc.exists ? '✅' : '❌' },
      { name: 'Admin Document', status: adminDoc.exists ? '✅' : '❌' },
    ];
    
    checks.forEach(check => {
      console.log(`${check.status} ${check.name}`);
    });
    
    const allPassed = checks.every(check => check.status === '✅');
    
    if (allPassed) {
      console.log('\n🎉 SUCCESS! Super Admin is properly configured!');
      console.log('');
      console.log('🚀 Login Details:');
      console.log('   URL: http://localhost:3004/login');
      console.log('   Email:', email);
      console.log('   Password: @Iamachessgrandmaster23');
      console.log('');
    } else {
      console.log('\n❌ ISSUES FOUND! Some checks failed.');
      console.log('   Run: node scripts/create-super-admin.js');
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error verifying super admin:', error);
    
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
verifySuperAdmin()
  .then(() => {
    console.log('✅ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });

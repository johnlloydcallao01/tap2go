import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Script to create the initial super admin user
export const setupSuperAdmin = async () => {
  const adminEmail = 'johnlloydcallao@gmail.com';
  const adminPassword = '123456';
  const firstName = 'John Lloyd';
  const lastName = 'Callao';

  try {
    console.log('Setting up super admin user...');

    // Check if admin user already exists
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(adminEmail);
      console.log('Admin user already exists:', userRecord.uid);
    } catch {
      // User doesn't exist, create new one
      console.log('Creating new admin user...');
      userRecord = await adminAuth.createUser({
        email: adminEmail,
        password: adminPassword,
        emailVerified: true,
        displayName: `${firstName} ${lastName}`,
      });
      console.log('Admin user created:', userRecord.uid);
    }

    // Set admin custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, { 
      role: 'admin',
      isSuperAdmin: true 
    });
    console.log('Admin custom claims set');

    // Create or update user document in Firestore
    const userDoc = {
      email: adminEmail,
      firstName,
      lastName,
      role: 'admin',
      status: 'active',
      isSuperAdmin: true,
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
    const userDocRef = adminDb.collection('users').doc(userRecord.uid);
    const userDocSnapshot = await userDocRef.get();

    if (userDocSnapshot.exists) {
      // Update existing document
      await userDocRef.update(userDoc);
      console.log('Admin user document updated');
    } else {
      // Create new document
      await userDocRef.set({
        ...userDoc,
        createdAt: FieldValue.serverTimestamp(),
      });
      console.log('Admin user document created');
    }

    console.log('✅ Super admin setup completed successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`UID: ${userRecord.uid}`);

    return {
      success: true,
      uid: userRecord.uid,
      email: adminEmail
    };

  } catch (error) {
    console.error('❌ Error setting up super admin:', error);
    throw error;
  }
};

// Function to verify admin setup
export const verifyAdminSetup = async () => {
  try {
    const adminEmail = 'johnlloydcallao@gmail.com';
    
    // Get user from Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(adminEmail);
    
    // Get custom claims
    const customClaims = userRecord.customClaims;
    
    // Get user document from Firestore
    const userDoc = await adminDb.collection('users').doc(userRecord.uid).get();
    
    console.log('Admin verification:');
    console.log('- UID:', userRecord.uid);
    console.log('- Email:', userRecord.email);
    console.log('- Email Verified:', userRecord.emailVerified);
    console.log('- Custom Claims:', customClaims);
    console.log('- Firestore Document Exists:', userDoc.exists);
    
    if (userDoc.exists) {
      console.log('- Document Data:', userDoc.data());
    }

    const isValidAdmin = customClaims?.role === 'admin' && userDoc.exists;
    console.log('- Is Valid Admin:', isValidAdmin);

    return {
      isValid: isValidAdmin,
      userRecord,
      customClaims,
      firestoreData: userDoc.exists ? userDoc.data() : null
    };

  } catch (error) {
    console.error('Error verifying admin setup:', error);
    return { isValid: false, error };
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupSuperAdmin()
    .then(() => {
      console.log('Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

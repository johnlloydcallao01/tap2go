import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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

// Driver credentials
const driverEmail = 'johndriver@tap2goph.com';
const driverPassword = '12345678';

// Function to test driver authentication
export const testDriverAuth = async () => {
  try {
    console.log('🔐 Testing driver authentication...');

    const userCredential = await signInWithEmailAndPassword(auth, driverEmail, driverPassword);
    const user = userCredential.user;

    console.log('✅ Sign in successful!');
    console.log('👤 UID:', user.uid);
    console.log('📧 Email:', user.email);
    console.log('✅ Email Verified:', user.emailVerified);

    // Get fresh ID token to check updated custom claims
    const idTokenResult = await user.getIdTokenResult(true); // Force refresh
    console.log('\n🎫 Updated Custom Claims:');
    console.log('- Role:', idTokenResult.claims.role);
    console.log('- Status:', idTokenResult.claims.status);
    console.log('- All Claims:', idTokenResult.claims);

    if (idTokenResult.claims.role === 'driver') {
      console.log('\n🎉 SUCCESS: Driver role is properly set!');
      console.log('✅ The user can now access the driver panel');
    } else {
      console.log('\n❌ WARNING: Driver role is not set properly');
      console.log('⚠️  Expected role: "driver", Got:', idTokenResult.claims.role);
    }

    return user;

  } catch (error) {
    console.error('❌ Error testing driver auth:', error);
    throw error;
  }
};

// Run the test
if (require.main === module) {
  testDriverAuth()
    .then(() => {
      console.log('\n✅ Authentication test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Authentication test failed:', error);
      process.exit(1);
    });
}

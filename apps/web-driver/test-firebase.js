/**
 * Firebase Authentication Test Script
 * Tests if Firebase SDK instances are properly unified
 */

const { getFirebaseAuth, getFirebaseDb } = require('firebase-config');

async function testFirebaseIntegration() {
  console.log('🧪 Testing Firebase SDK Integration...\n');

  try {
    // Test 1: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.log('❌ Test 1 Failed: Not in browser environment');
      console.log('   This test needs to run in a browser context\n');
      return;
    }

    console.log('✅ Test 1 Passed: Browser environment detected\n');

    // Test 2: Initialize Firebase Auth
    console.log('🔄 Test 2: Initializing Firebase Auth...');
    const auth = await getFirebaseAuth();
    
    if (auth) {
      console.log('✅ Test 2 Passed: Firebase Auth initialized successfully');
      console.log(`   Auth instance: ${auth.constructor.name}`);
      console.log(`   Project ID: ${auth.app.options.projectId}\n`);
    } else {
      console.log('❌ Test 2 Failed: Firebase Auth is null\n');
      return;
    }

    // Test 3: Initialize Firebase Firestore
    console.log('🔄 Test 3: Initializing Firebase Firestore...');
    const db = await getFirebaseDb();
    
    if (db) {
      console.log('✅ Test 3 Passed: Firebase Firestore initialized successfully');
      console.log(`   Firestore instance: ${db.constructor.name}`);
      console.log(`   Project ID: ${db.app.options.projectId}\n`);
    } else {
      console.log('❌ Test 3 Failed: Firebase Firestore is null\n');
      return;
    }

    // Test 4: Check if Auth and Firestore use the same app instance
    console.log('🔄 Test 4: Checking Firebase app instance consistency...');
    if (auth.app === db.app) {
      console.log('✅ Test 4 Passed: Auth and Firestore use the same Firebase app instance');
      console.log(`   App name: ${auth.app.name}`);
      console.log(`   App options: ${JSON.stringify(auth.app.options, null, 2)}\n`);
    } else {
      console.log('❌ Test 4 Failed: Auth and Firestore use different Firebase app instances');
      console.log(`   Auth app: ${auth.app.name}`);
      console.log(`   Firestore app: ${db.app.name}\n`);
      return;
    }

    console.log('🎉 All tests passed! Firebase SDK integration is working correctly.');
    console.log('   The "Type does not match the expected instance" error should be resolved.\n');

  } catch (error) {
    console.error('❌ Firebase integration test failed:', error);
    console.error('   Error details:', error.message);
    
    if (error.message.includes('Type does not match the expected instance')) {
      console.error('\n🔍 This is the exact error you were experiencing!');
      console.error('   The fix should resolve this issue.');
    }
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testFirebaseIntegration = testFirebaseIntegration;
  console.log('🔧 Firebase test function loaded. Run testFirebaseIntegration() in browser console.');
}

module.exports = { testFirebaseIntegration };

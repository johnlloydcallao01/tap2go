/**
 * Driver Database Setup Script
 * 
 * This script sets up the drivers collection in Firestore with sample data.
 * Run this script to populate your database with driver data.
 * 
 * Usage:
 * node scripts/setup-drivers.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Import the setup function
const { setupDriversDatabase } = require('../src/lib/database/setup-drivers.ts');

async function main() {
  try {
    console.log('🚀 Starting driver database setup...');
    console.log('📊 This will add sample drivers, earnings, and reviews to your Firestore database.');
    
    await setupDriversDatabase();
    
    console.log('✅ Driver database setup completed successfully!');
    console.log('📋 Added:');
    console.log('   - 3 sample drivers (2 active, 1 pending approval)');
    console.log('   - Sample earnings data for active drivers');
    console.log('   - Sample reviews for active drivers');
    console.log('   - Corresponding user documents');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up driver database:', error);
    process.exit(1);
  }
}

// Run the script
main();

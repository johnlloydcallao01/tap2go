#!/usr/bin/env node

/**
 * Verify Restaurant Images Script for Tap2Go
 *
 * This script checks all restaurants in the database and reports their image URLs
 *
 * Usage: node verify-restaurant-images.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function verifyRestaurantImages() {
  try {
    console.log('🔍 Checking restaurant images in database...\n');

    // Get all restaurants
    const restaurantsRef = collection(db, 'restaurants');
    const snapshot = await getDocs(restaurantsRef);

    console.log(`Found ${snapshot.docs.length} restaurants in database\n`);

    if (snapshot.docs.length === 0) {
      console.log('❌ No restaurants found in database');
      console.log('💡 Run: node scripts/add-sample-restaurants.js');
      process.exit(1);
    }

    let hasExampleImages = false;
    let hasValidImages = 0;

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const name = data.outletName || data.name || docSnap.id;
      const image = data.image || data.coverImageUrl;

      console.log(`📋 Restaurant: ${name}`);
      console.log(`   ID: ${docSnap.id}`);
      console.log(`   Image: ${image || 'No image'}`);

      if (image) {
        if (image.includes('images.example.com')) {
          console.log('   ❌ Uses example.com (will cause Next.js error)');
          hasExampleImages = true;
        } else if (image.includes('images.unsplash.com')) {
          console.log('   ✅ Uses Unsplash (should work fine)');
          hasValidImages++;
        } else {
          console.log('   ⚠️  Uses other domain (check Next.js config)');
        }
      } else {
        console.log('   ⚠️  No image URL found');
      }
      console.log('');
    });

    console.log('📊 Summary:');
    console.log(`   Total restaurants: ${snapshot.docs.length}`);
    console.log(`   Valid images: ${hasValidImages}`);
    console.log(`   Example.com images: ${hasExampleImages ? 'YES (problematic)' : 'NO'}`);

    if (hasExampleImages) {
      console.log('\n❌ Found restaurants with example.com images!');
      console.log('💡 Run: node scripts/fix-restaurant-images.js');
      process.exit(1);
    } else {
      console.log('\n✅ All restaurant images should work correctly!');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Failed to verify restaurant images:', error);
    process.exit(1);
  }
}

// Run the script
verifyRestaurantImages();

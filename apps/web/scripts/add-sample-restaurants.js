#!/usr/bin/env node

/**
 * Add Sample Restaurants Script for Tap2Go
 * 
 * This script adds sample restaurants to your Firestore database
 * so you can see real data on your homepage.
 * 
 * Usage: node scripts/add-sample-restaurants.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, Timestamp } = require('firebase/firestore');

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

// Sample restaurants data
const sampleRestaurants = [
  {
    id: 'pizza-palace',
    name: 'Pizza Palace',
    description: 'Authentic Italian pizza with fresh ingredients and traditional recipes passed down through generations.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=300&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop',
    cuisine: ['Italian', 'Pizza'],
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    phone: '+1-555-0123',
    email: 'info@pizzapalace.com',
    ownerId: 'owner1',
    rating: 4.5,
    reviewCount: 128,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    minimumOrder: 15.00,
    isOpen: true,
    openingHours: {
      monday: { open: '11:00', close: '22:00', isClosed: false },
      tuesday: { open: '11:00', close: '22:00', isClosed: false },
      wednesday: { open: '11:00', close: '22:00', isClosed: false },
      thursday: { open: '11:00', close: '22:00', isClosed: false },
      friday: { open: '11:00', close: '23:00', isClosed: false },
      saturday: { open: '11:00', close: '23:00', isClosed: false },
      sunday: { open: '12:00', close: '21:00', isClosed: false }
    },
    featured: true,
    status: 'approved',
    commissionRate: 15.0,
    totalOrders: 1250,
    totalRevenue: 45000,
    averagePreparationTime: 20,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'burger-barn',
    name: 'Burger Barn',
    description: 'Gourmet burgers made with premium beef and fresh ingredients. Home of the best burgers in town!',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=400&fit=crop',
    cuisine: ['American', 'Burgers'],
    address: {
      street: '456 Oak Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'USA'
    },
    phone: '+1-555-0124',
    email: 'info@burgerbarn.com',
    ownerId: 'owner2',
    rating: 4.2,
    reviewCount: 89,
    deliveryTime: '20-30 min',
    deliveryFee: 3.49,
    minimumOrder: 12.00,
    isOpen: true,
    openingHours: {
      monday: { open: '11:00', close: '22:00', isClosed: false },
      tuesday: { open: '11:00', close: '22:00', isClosed: false },
      wednesday: { open: '11:00', close: '22:00', isClosed: false },
      thursday: { open: '11:00', close: '22:00', isClosed: false },
      friday: { open: '11:00', close: '23:00', isClosed: false },
      saturday: { open: '11:00', close: '23:00', isClosed: false },
      sunday: { open: '12:00', close: '21:00', isClosed: false }
    },
    featured: false,
    status: 'approved',
    commissionRate: 15.0,
    totalOrders: 890,
    totalRevenue: 32000,
    averagePreparationTime: 18,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'sushi-zen',
    name: 'Sushi Zen',
    description: 'Fresh sushi and Japanese cuisine prepared by master chefs with authentic techniques and premium ingredients.',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&h=300&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=400&fit=crop',
    cuisine: ['Japanese', 'Sushi'],
    address: {
      street: '789 Pine St',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      country: 'USA'
    },
    phone: '+1-555-0125',
    email: 'info@sushizen.com',
    ownerId: 'owner3',
    rating: 4.7,
    reviewCount: 156,
    deliveryTime: '30-40 min',
    deliveryFee: 4.99,
    minimumOrder: 20.00,
    isOpen: true,
    openingHours: {
      monday: { open: '17:00', close: '22:00', isClosed: false },
      tuesday: { open: '17:00', close: '22:00', isClosed: false },
      wednesday: { open: '17:00', close: '22:00', isClosed: false },
      thursday: { open: '17:00', close: '22:00', isClosed: false },
      friday: { open: '17:00', close: '23:00', isClosed: false },
      saturday: { open: '17:00', close: '23:00', isClosed: false },
      sunday: { open: '17:00', close: '21:00', isClosed: false }
    },
    featured: true,
    status: 'approved',
    commissionRate: 15.0,
    totalOrders: 2100,
    totalRevenue: 78000,
    averagePreparationTime: 25,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'taco-fiesta',
    name: 'Taco Fiesta',
    description: 'Authentic Mexican tacos and burritos with traditional flavors and fresh ingredients.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1200&h=400&fit=crop',
    cuisine: ['Mexican', 'Tacos'],
    address: {
      street: '321 Elm Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10004',
      country: 'USA'
    },
    phone: '+1-555-0126',
    email: 'info@tacofiesta.com',
    ownerId: 'owner4',
    rating: 4.3,
    reviewCount: 203,
    deliveryTime: '15-25 min',
    deliveryFee: 2.49,
    minimumOrder: 10.00,
    isOpen: true,
    openingHours: {
      monday: { open: '10:00', close: '23:00', isClosed: false },
      tuesday: { open: '10:00', close: '23:00', isClosed: false },
      wednesday: { open: '10:00', close: '23:00', isClosed: false },
      thursday: { open: '10:00', close: '23:00', isClosed: false },
      friday: { open: '10:00', close: '24:00', isClosed: false },
      saturday: { open: '10:00', close: '24:00', isClosed: false },
      sunday: { open: '11:00', close: '22:00', isClosed: false }
    },
    featured: false,
    status: 'approved',
    commissionRate: 15.0,
    totalOrders: 1580,
    totalRevenue: 42000,
    averagePreparationTime: 15,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Add sample restaurants to Firestore
async function addSampleRestaurants() {
  try {
    console.log('🍕 Adding sample restaurants to Firestore...\n');

    for (const restaurant of sampleRestaurants) {
      await setDoc(doc(db, 'restaurants', restaurant.id), restaurant);
      console.log(`✅ Added restaurant: ${restaurant.name}`);
    }

    console.log('\n🎉 Sample restaurants added successfully!');
    console.log('\n📋 Added Restaurants:');
    sampleRestaurants.forEach(restaurant => {
      console.log(`- ${restaurant.name} (${restaurant.cuisine.join(', ')})`);
    });

    console.log('\n🔧 Next Steps:');
    console.log('1. Refresh your website to see the new restaurants');
    console.log('2. The homepage will now show real restaurant data from Firestore');
    console.log('3. You can browse restaurants by category');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add sample restaurants:', error);
    process.exit(1);
  }
}

// Run the script
addSampleRestaurants();

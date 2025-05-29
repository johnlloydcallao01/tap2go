#!/usr/bin/env node

/**
 * Setup Customers Collection for Tap2Go
 * 
 * This script sets up ONLY the customers collection with all its subcollections
 * as specified - no other data will be added.
 * 
 * Collections to create:
 * 1. customers (top-level) - End users who place orders
 * 2. addresses (subcollection) - Customer delivery addresses
 * 3. paymentMethods (subcollection) - Customer payment methods
 * 4. favorites (subcollection) - Favorite restaurants and items
 * 5. cart (subcollection) - Shopping cart items
 * 
 * Usage: node scripts/setup-customers.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc, Timestamp, GeoPoint } = require('firebase/firestore');

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

// Function to generate unique referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Function to setup customers collection structure documentation
async function setupCustomersCollectionStructure() {
  console.log('📋 Setting up customers collection structure documentation...');
  
  const customersStructureDoc = {
    customers: {
      purpose: "End users who place orders",
      docIdFormat: "Customer's Auth UID",
      collectionPath: "customers/{customerUid}",
      fields: {
        userRef: "string - path to users/{uid}",
        firstName: "string",
        lastName: "string",
        dateOfBirth: "timestamp (optional)",
        gender: "male | female | other | prefer_not_to_say (optional)",
        loyaltyPoints: "number",
        loyaltyTier: "bronze | silver | gold | platinum",
        totalOrders: "number",
        totalSpent: "number",
        avgOrderValue: "number",
        preferredCuisines: "string[] (optional)",
        dietaryRestrictions: "string[] (optional)",
        allergies: "string[] (optional)",
        marketingConsent: "boolean",
        smsConsent: "boolean",
        emailConsent: "boolean",
        referralCode: "string - unique referral code",
        referredBy: "string (optional) - customer UID who referred",
        createdAt: "timestamp",
        updatedAt: "timestamp",
        lastOrderAt: "timestamp (optional)"
      },
      subcollections: {
        addresses: {
          path: "customers/{customerUid}/addresses/{addressId}",
          purpose: "Customer delivery addresses",
          fields: {
            addressId: "string - auto-generated",
            label: "string - Home, Office, Other",
            recipientName: "string",
            recipientPhone: "string",
            address: "map{street, city, state, zipCode, country, apartmentNumber?, floor?, landmark?, deliveryInstructions?}",
            location: "GeoPoint",
            formattedAddress: "string",
            isDefault: "boolean",
            isActive: "boolean",
            createdAt: "timestamp",
            updatedAt: "timestamp"
          }
        },
        paymentMethods: {
          path: "customers/{customerUid}/paymentMethods/{paymentMethodId}",
          purpose: "Customer payment methods",
          fields: {
            paymentMethodId: "string - auto-generated",
            type: "card | wallet | bank_account | cod",
            provider: "string - stripe, paypal, cash",
            last4: "string (optional) - for cards",
            cardBrand: "string (optional) - visa, mastercard, etc.",
            expiryMonth: "number (optional)",
            expiryYear: "number (optional)",
            walletProvider: "string (optional) - apple_pay, google_pay",
            isDefault: "boolean",
            isActive: "boolean",
            createdAt: "timestamp"
          }
        },
        favorites: {
          path: "customers/{customerUid}/favorites/{favoriteId}",
          purpose: "Favorite restaurants and menu items",
          fields: {
            favoriteId: "string - auto-generated",
            type: "restaurant | item",
            restaurantRef: "string (optional) - path to restaurants/{restId}",
            menuItemRef: "string (optional) - path to restaurants/{restId}/menuItems/{itemId}",
            createdAt: "timestamp"
          }
        },
        cart: {
          path: "customers/{customerUid}/cart/{cartItemId}",
          purpose: "Shopping cart items",
          fields: {
            cartItemId: "string - auto-generated",
            restaurantRef: "string - path to restaurants/{restId}",
            menuItemRef: "string - path to menuItems/{itemId}",
            quantity: "number",
            specialInstructions: "string (optional)",
            selectedModifiers: "map{groupId: string, selectedOptions: string[]}[] (optional)",
            itemPrice: "number - snapshot at time of adding",
            totalPrice: "number - including modifiers",
            addedAt: "timestamp"
          }
        }
      }
    },
    setupDate: Timestamp.now(),
    version: "1.4.0"
  };
  
  await setDoc(doc(db, '_system', 'customers_structure'), customersStructureDoc);
  console.log('   ✅ Customers collection structure documented');
}

// Function to create sample customer structure
async function createCustomerStructureExample() {
  console.log('📝 Creating customer structure example for documentation...');
  
  const sampleCustomerId = '_example_customer_structure';
  
  const sampleCustomerData = {
    userRef: "users/{customerUid}",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: new Timestamp(631152000, 0), // January 1, 1990
    gender: "male",
    loyaltyPoints: 250,
    loyaltyTier: "silver",
    totalOrders: 15,
    totalSpent: 387.50,
    avgOrderValue: 25.83,
    preferredCuisines: ["Italian", "Mexican", "Chinese"],
    dietaryRestrictions: ["vegetarian"],
    allergies: ["nuts"],
    marketingConsent: true,
    smsConsent: true,
    emailConsent: true,
    referralCode: generateReferralCode(),
    referredBy: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    lastOrderAt: Timestamp.now(),
    _isExample: true
  };
  
  await setDoc(doc(db, 'customers', sampleCustomerId), sampleCustomerData);
  console.log(`   ✅ Sample customer created with referral code: ${sampleCustomerData.referralCode}`);
  
  // Create sample subcollections
  
  // 1. Sample address
  const sampleAddress = {
    addressId: "home_address",
    label: "Home",
    recipientName: "John Doe",
    recipientPhone: "+1-555-0123",
    address: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      apartmentNumber: "Apt 4B",
      floor: "4th Floor",
      landmark: "Near Central Park",
      deliveryInstructions: "Ring doorbell twice"
    },
    location: new GeoPoint(40.7128, -74.0060),
    formattedAddress: "123 Main Street, Apt 4B, New York, NY 10001, USA",
    isDefault: true,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    _isExample: true
  };
  
  await setDoc(doc(db, 'customers', sampleCustomerId, 'addresses', 'home_address'), sampleAddress);
  console.log('   ✅ Sample address created');
  
  // 2. Sample payment method
  const samplePaymentMethod = {
    paymentMethodId: "card_001",
    type: "card",
    provider: "stripe",
    last4: "4242",
    cardBrand: "visa",
    expiryMonth: 12,
    expiryYear: 2027,
    walletProvider: null,
    isDefault: true,
    isActive: true,
    createdAt: Timestamp.now(),
    _isExample: true
  };
  
  const paymentRef = await addDoc(collection(db, 'customers', sampleCustomerId, 'paymentMethods'), samplePaymentMethod);
  await setDoc(paymentRef, { ...samplePaymentMethod, paymentMethodId: paymentRef.id }, { merge: true });
  console.log('   ✅ Sample payment method created');
  
  // 3. Sample favorites
  const sampleFavoriteRestaurant = {
    favoriteId: "fav_restaurant_001",
    type: "restaurant",
    restaurantRef: "restaurants/{restaurantId}",
    menuItemRef: null,
    createdAt: Timestamp.now(),
    _isExample: true
  };
  
  const favRestaurantRef = await addDoc(collection(db, 'customers', sampleCustomerId, 'favorites'), sampleFavoriteRestaurant);
  await setDoc(favRestaurantRef, { ...sampleFavoriteRestaurant, favoriteId: favRestaurantRef.id }, { merge: true });
  console.log('   ✅ Sample favorite restaurant created');
  
  // 4. Sample cart item
  const sampleCartItem = {
    cartItemId: "cart_001",
    restaurantRef: "restaurants/{restaurantId}",
    menuItemRef: "restaurants/{restaurantId}/menuItems/margherita_pizza",
    quantity: 2,
    specialInstructions: "Extra cheese, no onions",
    selectedModifiers: [
      {
        groupId: "pizza_size",
        selectedOptions: ["large"]
      },
      {
        groupId: "toppings",
        selectedOptions: ["extra_cheese", "mushrooms"]
      }
    ],
    itemPrice: 16.99,
    totalPrice: 37.98,
    addedAt: Timestamp.now(),
    _isExample: true
  };
  
  const cartRef = await addDoc(collection(db, 'customers', sampleCustomerId, 'cart'), sampleCartItem);
  await setDoc(cartRef, { ...sampleCartItem, cartItemId: cartRef.id }, { merge: true });
  console.log('   ✅ Sample cart item created');
  
  return sampleCustomerId;
}

// Main setup function
async function setupCustomers() {
  try {
    console.log('🚀 Setting up Customers collection for Tap2Go...\n');

    await setupCustomersCollectionStructure();
    const customerId = await createCustomerStructureExample();

    console.log('\n🎉 Customers collection setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ customers collection structure ready');
    console.log('- ✅ addresses subcollection structure ready');
    console.log('- ✅ paymentMethods subcollection structure ready');
    console.log('- ✅ favorites subcollection structure ready');
    console.log('- ✅ cart subcollection structure ready');
    console.log('- ✅ Collection structure documented in _system/customers_structure');
    console.log(`- ✅ Example customer structure created (ID: ${customerId})`);

    console.log('\n🔧 Collections Ready For:');
    console.log('- Customer registration and profile management');
    console.log('- Multiple delivery addresses with GeoPoint');
    console.log('- Payment method management (cards, wallets, COD)');
    console.log('- Favorites system (restaurants and menu items)');
    console.log('- Shopping cart with modifiers and pricing');
    console.log('- Loyalty points and tier system');
    console.log('- Referral program tracking');
    console.log('- Marketing consent management');

    console.log('\n📝 Next Steps:');
    console.log('1. Check Firebase Console to see the new customers collection');
    console.log('2. Test customer registration on your website');
    console.log('3. Customers can now create accounts and manage profiles');
    console.log('4. Address and payment management ready');
    console.log('5. Shopping cart and favorites system active');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupCustomers();

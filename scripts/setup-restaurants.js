#!/usr/bin/env node

/**
 * Setup Restaurants Collection for Tap2Go
 * 
 * This script sets up ONLY the restaurants collection with all its subcollections
 * as specified - no other data will be added.
 * 
 * Collections to create:
 * 1. restaurants (top-level) - Individual restaurant outlets/branches
 * 2. menuCategories (subcollection) - Menu categories for organization
 * 3. menuItems (subcollection) - Restaurant-specific menu items
 * 4. promotions (subcollection) - Restaurant promotions and offers
 * 5. reviews (subcollection) - Customer reviews for restaurants
 * 
 * Usage: node scripts/setup-restaurants.js
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

// Function to setup restaurants collection structure documentation
async function setupRestaurantsCollectionStructure() {
  console.log('📋 Setting up restaurants collection structure documentation...');
  
  // Update the system document to include restaurants collection structure
  const restaurantsStructureDoc = {
    restaurants: {
      purpose: "Individual restaurant outlets/branches",
      docIdFormat: "Auto ID",
      fields: {
        vendorRef: "string - path to vendors/{vendorUid}",
        outletName: "string",
        brandName: "string",
        address: "map{street: string, city: string, state: string, zipCode: string, country: string, apartmentNumber?: string, landmark?: string}",
        location: "GeoPoint - for geoqueries and distance calculation",
        formattedAddress: "string",
        outletPhone: "string",
        coverImageUrl: "string",
        galleryImageUrls: "string[] (optional)",
        cuisineTags: "string[]",
        priceRange: "$ | $$ | $$$ | $$$$ (optional)",
        avgRating: "number (optional)",
        totalReviews: "number (optional)",
        estimatedDeliveryRange: "string - e.g. '20–30 min'",
        deliveryFees: "map{base: number, perKm: number, smallOrderFee?: number, peakTimeSurcharge?: number}",
        minOrderValue: "number (optional)",
        maxOrderValue: "number (optional)",
        deliveryRadius: "number - km",
        operatingHours: "map{monday: [{open: string, close: string}], tuesday: [...], ...}",
        specialHours: "map{date: string, hours: [{open: string, close: string}]}[] (optional)",
        isAcceptingOrders: "boolean",
        platformStatus: "active | closed_by_admin | temporarily_closed | permanently_closed",
        temporaryClosureReason: "string (optional)",
        preparationTime: "map{average: number, current: number}",
        staffContact: "map{managerName: string, managerPhone: string, managerEmail?: string}",
        integrations: "map{posSystemId?: string, kitchenDisplaySystem?: boolean, inventoryManagement?: boolean} (optional)",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      subcollections: {
        menuCategories: {
          path: "restaurants/{restId}/menuCategories/{categoryId}",
          fields: {
            categoryId: "auto or custom",
            name: "string",
            description: "string (optional)",
            displayOrder: "number (optional)",
            imageUrl: "string (optional)",
            isActive: "boolean"
          }
        },
        menuItems: {
          path: "restaurants/{restId}/menuItems/{itemId}",
          fields: {
            itemId: "auto or same-as-master",
            masterItemRef: "string (optional) - path to vendors/.../masterMenuItems",
            name: "string",
            description: "string",
            basePrice: "number",
            overridePrice: "number (optional) - outlet-specific pricing",
            masterVersion: "number (optional) - snapshot of master version",
            imageUrl: "string",
            extraImageUrls: "string[] (optional)",
            isAvailable: "boolean - stock toggle",
            isHidden: "boolean (optional) - soft-hide from menu",
            archivedAt: "timestamp (optional)",
            tags: "string[] (optional)",
            dietaryInfo: "string[] (optional)",
            allergens: "string[] (optional)",
            nutritionalInfo: "map (optional)",
            ingredients: "string[] (optional)",
            prepTimeMinutes: "number (optional)",
            displayOrder: "number (optional)",
            categoryId: "string - link to menuCategories/{categoryId}",
            dataAiHint: "string (optional)",
            popularityScore: "number (optional) - for sorting/ranking",
            aiCategoryHint: "string (optional) - e.g. 'Combo', 'Best Seller'",
            soldCount: "number - track sales for analytics",
            lastOrderedAt: "timestamp (optional)",
            modifierGroups: "array of modifier group objects"
          }
        },
        promotions: {
          path: "restaurants/{restId}/promotions/{promoId}",
          fields: {
            promoId: "auto",
            title: "string",
            description: "string (optional)",
            type: "percentage | flat | free_item | buy_x_get_y | free_delivery",
            value: "number",
            freeItemRef: "string (optional) - for free_item type",
            buyQuantity: "number (optional) - for buy_x_get_y",
            getQuantity: "number (optional) - for buy_x_get_y",
            validFrom: "timestamp",
            validTo: "timestamp",
            minOrderValue: "number (optional)",
            maxDiscount: "number (optional) - for percentage discounts",
            applicableMasterItemRefs: "string[] (optional)",
            applicableCategoryRefs: "string[] (optional)",
            usageLimit: "number (optional)",
            usedCount: "number",
            isActive: "boolean",
            stackingRules: "string[] (optional) - can combine with platform promos",
            customerSegmentation: "string[] (optional) - new, returning, premium",
            deliveryZoneRestrictions: "string[] (optional)",
            createdAt: "timestamp",
            updatedAt: "timestamp"
          }
        },
        reviews: {
          path: "restaurants/{restId}/reviews/{reviewId}",
          fields: {
            reviewId: "auto",
            customerRef: "string - path to customers/{customerId}",
            orderRef: "string - path to orders/{orderId}",
            rating: "number - 1-5",
            comment: "string (optional)",
            reviewImages: "string[] (optional)",
            foodRating: "number",
            deliveryRating: "number",
            serviceRating: "number",
            isVerifiedPurchase: "boolean",
            createdAt: "timestamp",
            vendorResponse: "map{response: string, respondedAt: timestamp, respondedBy: string} (optional)",
            reportedBy: "string[] (optional) - customer UIDs who reported",
            isHidden: "boolean"
          }
        }
      }
    },
    setupDate: Timestamp.now(),
    version: "1.2.0"
  };
  
  await setDoc(doc(db, '_system', 'restaurants_structure'), restaurantsStructureDoc);
  console.log('   ✅ Restaurants collection structure documented');
}

// Function to create sample restaurant structure (for documentation purposes only)
async function createRestaurantStructureExample() {
  console.log('📝 Creating restaurant structure example for documentation...');
  
  // Create a sample restaurant document structure (not a real restaurant)
  const sampleRestaurantData = {
    vendorRef: "vendors/{vendorUid}",
    outletName: "Downtown Pizza Palace",
    brandName: "Pizza Palace",
    address: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      apartmentNumber: "Suite 100",
      landmark: "Near Central Park"
    },
    location: new GeoPoint(40.7128, -74.0060), // NYC coordinates
    formattedAddress: "123 Main Street, Suite 100, New York, NY 10001, USA",
    outletPhone: "+1-555-0123",
    coverImageUrl: "https://images.example.com/restaurant_cover.jpg",
    galleryImageUrls: [
      "https://images.example.com/gallery1.jpg",
      "https://images.example.com/gallery2.jpg"
    ],
    cuisineTags: ["Italian", "Pizza", "Pasta"],
    priceRange: "$$",
    avgRating: 4.2,
    totalReviews: 156,
    estimatedDeliveryRange: "25–35 min",
    deliveryFees: {
      base: 2.99,
      perKm: 0.50,
      smallOrderFee: 1.99,
      peakTimeSurcharge: 1.00
    },
    minOrderValue: 15.00,
    maxOrderValue: 500.00,
    deliveryRadius: 8.5,
    operatingHours: {
      monday: [{ open: "11:00", close: "22:00" }],
      tuesday: [{ open: "11:00", close: "22:00" }],
      wednesday: [{ open: "11:00", close: "22:00" }],
      thursday: [{ open: "11:00", close: "22:00" }],
      friday: [{ open: "11:00", close: "23:00" }],
      saturday: [{ open: "11:00", close: "23:00" }],
      sunday: [{ open: "12:00", close: "21:00" }]
    },
    specialHours: [
      {
        date: "2024-12-25",
        hours: [{ open: "16:00", close: "20:00" }]
      }
    ],
    isAcceptingOrders: true,
    platformStatus: "active",
    temporaryClosureReason: null,
    preparationTime: {
      average: 20,
      current: 18
    },
    staffContact: {
      managerName: "John Smith",
      managerPhone: "+1-555-0124",
      managerEmail: "manager@pizzapalace.com"
    },
    integrations: {
      posSystemId: "POS123456",
      kitchenDisplaySystem: true,
      inventoryManagement: false
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    _isExample: true // Mark as example document
  };
  
  const restaurantRef = await addDoc(collection(db, 'restaurants'), sampleRestaurantData);
  const restaurantId = restaurantRef.id;
  console.log(`   ✅ Sample restaurant structure created with ID: ${restaurantId}`);
  
  // Create sample subcollection documents
  
  // 1. Sample menu category
  const sampleMenuCategory = {
    categoryId: "pizzas",
    name: "Pizzas",
    description: "Our signature wood-fired pizzas",
    displayOrder: 1,
    imageUrl: "https://images.example.com/pizza_category.jpg",
    isActive: true,
    _isExample: true
  };
  
  await setDoc(doc(db, 'restaurants', restaurantId, 'menuCategories', 'pizzas'), sampleMenuCategory);
  console.log('   ✅ Sample menu category created');
  
  // 2. Sample menu item
  const sampleMenuItem = {
    itemId: "margherita_pizza",
    masterItemRef: "vendors/{vendorUid}/masterMenuItems/margherita",
    name: "Margherita Pizza",
    description: "Classic pizza with fresh mozzarella, tomato sauce, and basil",
    basePrice: 16.99,
    overridePrice: 15.99,
    masterVersion: 1,
    imageUrl: "https://images.example.com/margherita.jpg",
    extraImageUrls: ["https://images.example.com/margherita_2.jpg"],
    isAvailable: true,
    isHidden: false,
    archivedAt: null,
    tags: ["popular", "vegetarian"],
    dietaryInfo: ["vegetarian"],
    allergens: ["gluten", "dairy"],
    nutritionalInfo: {
      calories: 280,
      protein: 12,
      carbs: 35,
      fat: 10
    },
    ingredients: ["pizza dough", "tomato sauce", "mozzarella", "basil"],
    prepTimeMinutes: 15,
    displayOrder: 1,
    categoryId: "pizzas",
    dataAiHint: "Classic Italian pizza",
    popularityScore: 95,
    aiCategoryHint: "Best Seller",
    soldCount: 245,
    lastOrderedAt: Timestamp.now(),
    modifierGroups: [
      {
        groupId: "pizza_size",
        groupName: "Size",
        selectionType: "single",
        minSelections: 1,
        maxSelections: 1,
        isRequired: true,
        displayOrder: 1,
        options: [
          {
            optionId: "small",
            name: "Small (10\")",
            priceAdjustment: 0,
            overridePriceAdjustment: 0,
            isAvailable: true,
            isDefault: true,
            allergens: []
          },
          {
            optionId: "large",
            name: "Large (14\")",
            priceAdjustment: 4.00,
            overridePriceAdjustment: 3.50,
            isAvailable: true,
            isDefault: false,
            allergens: []
          }
        ]
      }
    ],
    _isExample: true
  };
  
  await setDoc(doc(db, 'restaurants', restaurantId, 'menuItems', 'margherita_pizza'), sampleMenuItem);
  console.log('   ✅ Sample menu item created');
  
  // 3. Sample promotion
  const samplePromotion = {
    promoId: "weekend_special",
    title: "Weekend Special - 20% Off",
    description: "Get 20% off on all pizzas during weekends",
    type: "percentage",
    value: 20,
    freeItemRef: null,
    buyQuantity: null,
    getQuantity: null,
    validFrom: Timestamp.now(),
    validTo: new Timestamp(Timestamp.now().seconds + (30 * 24 * 60 * 60), 0), // 30 days from now
    minOrderValue: 25.00,
    maxDiscount: 10.00,
    applicableMasterItemRefs: [],
    applicableCategoryRefs: ["pizzas"],
    usageLimit: 1000,
    usedCount: 45,
    isActive: true,
    stackingRules: ["platform_discount"],
    customerSegmentation: ["returning", "premium"],
    deliveryZoneRestrictions: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    _isExample: true
  };
  
  const promoRef = await addDoc(collection(db, 'restaurants', restaurantId, 'promotions'), samplePromotion);
  await setDoc(promoRef, { ...samplePromotion, promoId: promoRef.id }, { merge: true });
  console.log('   ✅ Sample promotion created');
  
  // 4. Sample review
  const sampleReview = {
    reviewId: "review_001",
    customerRef: "customers/{customerId}",
    orderRef: "orders/{orderId}",
    rating: 4,
    comment: "Great pizza! Fast delivery and hot food.",
    reviewImages: ["https://images.example.com/review1.jpg"],
    foodRating: 5,
    deliveryRating: 4,
    serviceRating: 4,
    isVerifiedPurchase: true,
    createdAt: Timestamp.now(),
    vendorResponse: {
      response: "Thank you for your feedback! We're glad you enjoyed your meal.",
      respondedAt: Timestamp.now(),
      respondedBy: "manager_uid"
    },
    reportedBy: [],
    isHidden: false,
    _isExample: true
  };
  
  const reviewRef = await addDoc(collection(db, 'restaurants', restaurantId, 'reviews'), sampleReview);
  await setDoc(reviewRef, { ...sampleReview, reviewId: reviewRef.id }, { merge: true });
  console.log('   ✅ Sample review created');
  
  return restaurantId;
}

// Main setup function
async function setupRestaurants() {
  try {
    console.log('🚀 Setting up Restaurants collection for Tap2Go...\n');

    // Setup collection structure documentation
    await setupRestaurantsCollectionStructure();

    // Create example restaurant structure for documentation
    const restaurantId = await createRestaurantStructureExample();

    console.log('\n🎉 Restaurants collection setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ restaurants collection structure ready');
    console.log('- ✅ menuCategories subcollection structure ready');
    console.log('- ✅ menuItems subcollection structure ready');
    console.log('- ✅ promotions subcollection structure ready');
    console.log('- ✅ reviews subcollection structure ready');
    console.log('- ✅ Collection structure documented in _system/restaurants_structure');
    console.log(`- ✅ Example restaurant structure created (ID: ${restaurantId})`);

    console.log('\n🔧 Collections Ready For:');
    console.log('- Restaurant outlet management');
    console.log('- Menu categories and items');
    console.log('- Location-based services (GeoPoint)');
    console.log('- Operating hours and delivery settings');
    console.log('- Promotions and offers');
    console.log('- Customer reviews and ratings');
    console.log('- Staff contact management');
    console.log('- POS system integrations');

    console.log('\n📝 Next Steps:');
    console.log('1. Check Firebase Console to see the new restaurants collection');
    console.log('2. Vendors can now create restaurant outlets');
    console.log('3. Menu management system is ready');
    console.log('4. Location-based delivery calculations ready');
    console.log('5. Review and promotion systems active');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Display usage information
function showUsage() {
  console.log('📖 Usage:');
  console.log('  node scripts/setup-restaurants.js');
  console.log('\n📝 Note:');
  console.log('  This script only sets up restaurants collection structure - no real restaurant data.');
  console.log('  An example restaurant document is created for reference only.');
}

// Check if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run the setup
setupRestaurants();

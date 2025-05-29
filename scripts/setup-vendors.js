#!/usr/bin/env node

/**
 * Setup Vendors Collection for Tap2Go
 * 
 * This script sets up ONLY the vendors collection with all its subcollections
 * as specified - no other data will be added.
 * 
 * Collections to create:
 * 1. vendors (top-level) - Corporate restaurant accounts
 * 2. modifierGroups (subcollection) - Menu item modifiers
 * 3. masterMenuItems (subcollection) - Master menu items
 * 4. masterMenuAssignments (subcollection) - Menu assignments to restaurants
 * 5. auditLogs (subcollection) - Vendor activity logs
 * 6. analytics (subcollection) - Vendor analytics data
 * 
 * Usage: node scripts/setup-vendors.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addDoc, Timestamp } = require('firebase/firestore');

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

// Function to setup vendors collection structure documentation
async function setupVendorsCollectionStructure() {
  console.log('📋 Setting up vendors collection structure documentation...');
  
  // Update the system document to include vendors collection structure
  const vendorsStructureDoc = {
    vendors: {
      purpose: "Corporate restaurant accounts",
      docIdFormat: "Vendor's Auth UID",
      fields: {
        userRef: "string - path to users/{uid}",
        businessName: "string",
        businessType: "restaurant | grocery | pharmacy | convenience",
        contactPerson: "string",
        contactPhone: "string",
        businessEmail: "string",
        businessRegistrationNumber: "string",
        taxId: "string",
        status: "pending_approval | active | suspended | rejected",
        verificationStatus: "pending | verified | rejected",
        verificationDocuments: "map{businessLicense: string, taxCertificate: string, ownerIdCard: string, bankStatement: string}",
        commissionRate: "number - platform commission percentage",
        payoutDetailsRef: "string - reference to secure payout collection",
        onboardingCompletedAt: "timestamp (optional)",
        approvedBy: "string (optional) - admin UID who approved",
        approvedAt: "timestamp (optional)",
        createdAt: "timestamp",
        updatedAt: "timestamp"
      },
      subcollections: {
        modifierGroups: {
          path: "vendors/{vendorUid}/modifierGroups/{modifierGroupId}",
          fields: {
            modifierGroupId: "auto or custom",
            groupName: "string - e.g. 'Burger Toppings'",
            selectionType: "single | multiple",
            minSelections: "number (optional)",
            maxSelections: "number (optional)",
            isRequired: "boolean",
            displayOrder: "number (optional)",
            options: "array of {optionId: string, name: string, priceAdjustment: number, isDefault?: boolean, isAvailable: boolean, allergens?: string[]}"
          }
        },
        masterMenuItems: {
          path: "vendors/{vendorUid}/masterMenuItems/{masterItemId}",
          fields: {
            masterItemId: "auto or custom",
            name: "string",
            description: "string",
            basePrice: "number",
            version: "number - increment on each edit",
            imageUrl: "string",
            extraImageUrls: "string[] (optional)",
            tags: "string[] (optional)",
            dietaryInfo: "string[] (optional)",
            allergens: "string[] (optional)",
            nutritionalInfo: "map{calories: number, protein: number, carbs: number, fat: number} (optional)",
            ingredients: "string[] (optional)",
            dataAiHint: "string (optional)",
            modifierGroupRefs: "string[] - references to modifierGroups",
            isActive: "boolean",
            createdAt: "timestamp",
            updatedAt: "timestamp"
          }
        },
        masterMenuAssignments: {
          path: "vendors/{vendorUid}/masterMenuAssignments/{assignmentId}",
          fields: {
            assignmentId: "auto",
            masterItemRef: "string - full path to masterMenuItems doc",
            restaurantRef: "string - full path to restaurants/{restId}",
            isEnabled: "boolean",
            assignedAt: "timestamp",
            assignedBy: "string - admin or vendor UID"
          }
        },
        auditLogs: {
          path: "vendors/{vendorUid}/auditLogs/{logId}",
          fields: {
            logId: "auto",
            action: "string - e.g. 'update_master_menu_item'",
            actorUid: "string",
            actorRole: "admin | vendor",
            targetRef: "string - path to affected document",
            timestamp: "timestamp",
            diff: "map (optional) - what changed",
            ipAddress: "string (optional)"
          }
        },
        analytics: {
          path: "vendors/{vendorUid}/analytics/{date}",
          fields: {
            date: "string - YYYY-MM-DD format",
            totalOrders: "number",
            totalRevenue: "number",
            avgOrderValue: "number",
            cancelledOrders: "number",
            topSellingItems: "map[]",
            peakHours: "map{hour: number, orderCount: number}[]",
            customerRatings: "map{averageRating: number, totalReviews: number, ratingDistribution: map}"
          }
        }
      }
    },
    setupDate: Timestamp.now(),
    version: "1.1.0"
  };
  
  await setDoc(doc(db, '_system', 'vendors_structure'), vendorsStructureDoc);
  console.log('   ✅ Vendors collection structure documented');
}

// Function to create sample vendor structure (for documentation purposes only)
async function createVendorStructureExample() {
  console.log('📝 Creating vendor structure example for documentation...');
  
  // Create a sample vendor document structure (not a real vendor)
  const sampleVendorId = '_example_vendor_structure';
  
  const sampleVendorData = {
    userRef: "users/{vendorUid}",
    businessName: "Example Restaurant Corp",
    businessType: "restaurant",
    contactPerson: "John Doe",
    contactPhone: "+1-555-0123",
    businessEmail: "business@example.com",
    businessRegistrationNumber: "REG123456789",
    taxId: "TAX987654321",
    status: "pending_approval",
    verificationStatus: "pending",
    verificationDocuments: {
      businessLicense: "https://storage.example.com/docs/business_license.pdf",
      taxCertificate: "https://storage.example.com/docs/tax_cert.pdf",
      ownerIdCard: "https://storage.example.com/docs/owner_id.pdf",
      bankStatement: "https://storage.example.com/docs/bank_statement.pdf"
    },
    commissionRate: 15.0,
    payoutDetailsRef: "payouts/{vendorUid}",
    onboardingCompletedAt: null,
    approvedBy: null,
    approvedAt: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    _isExample: true // Mark as example document
  };
  
  await setDoc(doc(db, 'vendors', sampleVendorId), sampleVendorData);
  console.log('   ✅ Sample vendor structure created');
  
  // Create sample subcollection documents
  
  // 1. Sample modifier group
  const sampleModifierGroup = {
    modifierGroupId: "burger_toppings",
    groupName: "Burger Toppings",
    selectionType: "multiple",
    minSelections: 0,
    maxSelections: 5,
    isRequired: false,
    displayOrder: 1,
    options: [
      {
        optionId: "lettuce",
        name: "Lettuce",
        priceAdjustment: 0,
        isDefault: true,
        isAvailable: true,
        allergens: []
      },
      {
        optionId: "cheese",
        name: "Extra Cheese",
        priceAdjustment: 1.50,
        isDefault: false,
        isAvailable: true,
        allergens: ["dairy"]
      }
    ],
    _isExample: true
  };
  
  await setDoc(doc(db, 'vendors', sampleVendorId, 'modifierGroups', 'burger_toppings'), sampleModifierGroup);
  console.log('   ✅ Sample modifier group created');
  
  // 2. Sample master menu item
  const sampleMasterMenuItem = {
    masterItemId: "classic_burger",
    name: "Classic Burger",
    description: "Juicy beef patty with fresh vegetables",
    basePrice: 12.99,
    version: 1,
    imageUrl: "https://images.example.com/classic_burger.jpg",
    extraImageUrls: ["https://images.example.com/burger_2.jpg"],
    tags: ["popular", "beef"],
    dietaryInfo: ["gluten"],
    allergens: ["gluten", "dairy"],
    nutritionalInfo: {
      calories: 650,
      protein: 35,
      carbs: 45,
      fat: 28
    },
    ingredients: ["beef patty", "bun", "lettuce", "tomato", "onion"],
    dataAiHint: "Classic American-style burger",
    modifierGroupRefs: ["modifierGroups/burger_toppings"],
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    _isExample: true
  };
  
  await setDoc(doc(db, 'vendors', sampleVendorId, 'masterMenuItems', 'classic_burger'), sampleMasterMenuItem);
  console.log('   ✅ Sample master menu item created');
  
  // 3. Sample menu assignment
  const sampleMenuAssignment = {
    assignmentId: "assignment_001",
    masterItemRef: `vendors/${sampleVendorId}/masterMenuItems/classic_burger`,
    restaurantRef: "restaurants/{restaurantId}",
    isEnabled: true,
    assignedAt: Timestamp.now(),
    assignedBy: "admin_uid",
    _isExample: true
  };
  
  const assignmentRef = await addDoc(collection(db, 'vendors', sampleVendorId, 'masterMenuAssignments'), sampleMenuAssignment);
  await setDoc(assignmentRef, { ...sampleMenuAssignment, assignmentId: assignmentRef.id }, { merge: true });
  console.log('   ✅ Sample menu assignment created');
  
  // 4. Sample audit log
  const sampleAuditLog = {
    logId: "log_001",
    action: "create_master_menu_item",
    actorUid: "vendor_uid",
    actorRole: "vendor",
    targetRef: `vendors/${sampleVendorId}/masterMenuItems/classic_burger`,
    timestamp: Timestamp.now(),
    diff: {
      action: "created",
      itemName: "Classic Burger"
    },
    ipAddress: "192.168.1.1",
    _isExample: true
  };
  
  const auditRef = await addDoc(collection(db, 'vendors', sampleVendorId, 'auditLogs'), sampleAuditLog);
  await setDoc(auditRef, { ...sampleAuditLog, logId: auditRef.id }, { merge: true });
  console.log('   ✅ Sample audit log created');
  
  // 5. Sample analytics
  const sampleAnalytics = {
    date: "2024-01-15",
    totalOrders: 45,
    totalRevenue: 1250.75,
    avgOrderValue: 27.79,
    cancelledOrders: 3,
    topSellingItems: [
      { itemId: "classic_burger", name: "Classic Burger", quantity: 15 },
      { itemId: "fries", name: "French Fries", quantity: 12 }
    ],
    peakHours: [
      { hour: 12, orderCount: 8 },
      { hour: 13, orderCount: 12 },
      { hour: 18, orderCount: 15 },
      { hour: 19, orderCount: 10 }
    ],
    customerRatings: {
      averageRating: 4.2,
      totalReviews: 28,
      ratingDistribution: {
        "5": 12,
        "4": 10,
        "3": 4,
        "2": 1,
        "1": 1
      }
    },
    _isExample: true
  };
  
  await setDoc(doc(db, 'vendors', sampleVendorId, 'analytics', '2024-01-15'), sampleAnalytics);
  console.log('   ✅ Sample analytics created');
}

// Main setup function
async function setupVendors() {
  try {
    console.log('🚀 Setting up Vendors collection for Tap2Go...\n');

    // Setup collection structure documentation
    await setupVendorsCollectionStructure();

    // Create example vendor structure for documentation
    await createVendorStructureExample();

    console.log('\n🎉 Vendors collection setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('- ✅ vendors collection structure ready');
    console.log('- ✅ modifierGroups subcollection structure ready');
    console.log('- ✅ masterMenuItems subcollection structure ready');
    console.log('- ✅ masterMenuAssignments subcollection structure ready');
    console.log('- ✅ auditLogs subcollection structure ready');
    console.log('- ✅ analytics subcollection structure ready');
    console.log('- ✅ Collection structure documented in _system/vendors_structure');
    console.log('- ✅ Example vendor structure created for reference');

    console.log('\n🔧 Collections Ready For:');
    console.log('- Vendor registration and onboarding');
    console.log('- Business verification and approval');
    console.log('- Master menu item management');
    console.log('- Menu modifier groups');
    console.log('- Restaurant menu assignments');
    console.log('- Vendor activity audit logging');
    console.log('- Vendor analytics and reporting');

    console.log('\n📝 Next Steps:');
    console.log('1. Check Firebase Console to see the new vendors collection');
    console.log('2. Test vendor registration on your website');
    console.log('3. Vendors can now create accounts and manage menus');
    console.log('4. Admin can approve/reject vendor applications');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Display usage information
function showUsage() {
  console.log('📖 Usage:');
  console.log('  node scripts/setup-vendors.js');
  console.log('\n📝 Note:');
  console.log('  This script only sets up vendors collection structure - no real vendor data.');
  console.log('  An example vendor document is created for reference only.');
}

// Check if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run the setup
setupVendors();

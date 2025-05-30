import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

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

// FoodPanda-style restaurants with location-specific names
const foodPandaStyleRestaurants = [
  {
    id: 'jollibee-sm-moa',
    outletName: 'Jollibee - SM Mall of Asia',
    brandName: 'Jollibee',
    description: 'Home of the world-famous Chickenjoy and Yumburger. Langhap-sarap!',
    coverImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=300&fit=crop',
    cuisineTags: ['Filipino', 'Fast Food', 'Chicken'],
    avgRating: 4.6,
    totalReviews: 1247,
    estimatedDeliveryRange: '20-30 min',
    deliveryFees: { base: 2.99 },
    minOrderValue: 12,
    isAcceptingOrders: true,
    featured: true,
    platformStatus: 'active',
    address: {
      street: 'SM Mall of Asia Complex',
      city: 'Pasay',
      state: 'Metro Manila',
      zipCode: '1300',
      country: 'Philippines'
    },
    outletPhone: '+63-2-8123-4567'
  },
  {
    id: 'mcdonalds-ayala-triangle',
    outletName: 'McDonald\'s - Ayala Triangle',
    brandName: 'McDonald\'s',
    description: 'World-famous burgers, fries, and breakfast all day. I\'m lovin\' it!',
    coverImageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=300&fit=crop',
    cuisineTags: ['American', 'Fast Food', 'Burgers'],
    avgRating: 4.3,
    totalReviews: 892,
    estimatedDeliveryRange: '15-25 min',
    deliveryFees: { base: 2.49 },
    minOrderValue: 10,
    isAcceptingOrders: true,
    featured: false,
    platformStatus: 'active',
    address: {
      street: 'Ayala Triangle Gardens',
      city: 'Makati',
      state: 'Metro Manila',
      zipCode: '1226',
      country: 'Philippines'
    },
    outletPhone: '+63-2-8234-5678'
  },
  {
    id: 'burger-king-bgc',
    outletName: 'Burger King - BGC Central Square',
    brandName: 'Burger King',
    description: 'Home of the Whopper and flame-grilled burgers. Have it your way!',
    coverImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=300&fit=crop',
    cuisineTags: ['American', 'Fast Food', 'Burgers'],
    avgRating: 4.4,
    totalReviews: 634,
    estimatedDeliveryRange: '20-30 min',
    deliveryFees: { base: 2.99 },
    minOrderValue: 15,
    isAcceptingOrders: true,
    featured: false,
    platformStatus: 'active',
    address: {
      street: 'BGC Central Square',
      city: 'Taguig',
      state: 'Metro Manila',
      zipCode: '1634',
      country: 'Philippines'
    },
    outletPhone: '+63-2-8345-6789'
  },
  {
    id: 'pizza-hut-greenbelt',
    outletName: 'Pizza Hut - Greenbelt',
    brandName: 'Pizza Hut',
    description: 'America\'s favorite pizza with stuffed crust and delicious toppings.',
    coverImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=300&fit=crop',
    cuisineTags: ['Italian', 'Pizza', 'American'],
    avgRating: 4.2,
    totalReviews: 756,
    estimatedDeliveryRange: '25-35 min',
    deliveryFees: { base: 3.49 },
    minOrderValue: 18,
    isAcceptingOrders: true,
    featured: true,
    platformStatus: 'active',
    address: {
      street: 'Greenbelt Mall',
      city: 'Makati',
      state: 'Metro Manila',
      zipCode: '1224',
      country: 'Philippines'
    },
    outletPhone: '+63-2-8456-7890'
  },
  {
    id: 'kfc-robinsons-manila',
    outletName: 'KFC - Robinson\'s Manila',
    brandName: 'KFC',
    description: 'Finger lickin\' good fried chicken and sides with the Colonel\'s secret recipe.',
    coverImageUrl: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&h=300&fit=crop',
    cuisineTags: ['American', 'Fast Food', 'Chicken'],
    avgRating: 4.1,
    totalReviews: 543,
    estimatedDeliveryRange: '20-30 min',
    deliveryFees: { base: 2.99 },
    minOrderValue: 12,
    isAcceptingOrders: false,
    featured: false,
    platformStatus: 'active',
    address: {
      street: 'Robinson\'s Place Manila',
      city: 'Manila',
      state: 'Metro Manila',
      zipCode: '1000',
      country: 'Philippines'
    },
    outletPhone: '+63-2-8567-8901'
  },
  {
    id: 'chowking-eastwood',
    outletName: 'Chowking - Eastwood Mall',
    brandName: 'Chowking',
    description: 'Chinese-Filipino cuisine with lauriat meals and authentic flavors.',
    coverImageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&h=300&fit=crop',
    cuisineTags: ['Chinese', 'Filipino', 'Asian'],
    avgRating: 4.0,
    totalReviews: 421,
    estimatedDeliveryRange: '25-35 min',
    deliveryFees: { base: 2.49 },
    minOrderValue: 15,
    isAcceptingOrders: true,
    featured: false,
    platformStatus: 'active',
    address: {
      street: 'Eastwood City Mall',
      city: 'Quezon City',
      state: 'Metro Manila',
      zipCode: '1110',
      country: 'Philippines'
    },
    outletPhone: '+63-2-8678-9012'
  },
  {
    id: 'mang-inasal-trinoma',
    outletName: 'Mang Inasal - TriNoma',
    brandName: 'Mang Inasal',
    description: 'Authentic Filipino grilled chicken and unlimited rice. Nuot sa ihaw sarap!',
    coverImageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500&h=300&fit=crop',
    cuisineTags: ['Filipino', 'Grilled', 'Chicken'],
    avgRating: 4.5,
    totalReviews: 689,
    estimatedDeliveryRange: '20-30 min',
    deliveryFees: { base: 2.99 },
    minOrderValue: 10,
    isAcceptingOrders: true,
    featured: true,
    platformStatus: 'active',
    address: {
      street: 'TriNoma Mall',
      city: 'Quezon City',
      state: 'Metro Manila',
      zipCode: '1104',
      country: 'Philippines'
    },
    outletPhone: '+63-2-8789-0123'
  },
  {
    id: 'shakeys-megamall',
    outletName: 'Shakey\'s - SM Megamall',
    brandName: 'Shakey\'s',
    description: 'World-famous thin crust pizza and crispy chicken. Barkada moments made better!',
    coverImageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=300&fit=crop',
    cuisineTags: ['Italian', 'Pizza', 'American'],
    avgRating: 4.3,
    totalReviews: 834,
    estimatedDeliveryRange: '25-35 min',
    deliveryFees: { base: 3.49 },
    minOrderValue: 20,
    isAcceptingOrders: true,
    featured: false,
    platformStatus: 'active',
    address: {
      street: 'SM Megamall',
      city: 'Mandaluyong',
      state: 'Metro Manila',
      zipCode: '1550',
      country: 'Philippines'
    },
    outletPhone: '+63-2-8890-1234'
  }
];

async function updateRestaurantsToFoodPandaStyle() {
  console.log('🔄 Updating restaurants to FoodPanda-style naming...');

  try {
    // 1. Delete existing restaurants
    console.log('\n🗑️  Removing old restaurants...');
    const restaurantsRef = collection(db, 'restaurants');
    const snapshot = await getDocs(restaurantsRef);

    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'restaurants', docSnap.id));
      console.log(`   ❌ Deleted: ${docSnap.data().outletName || docSnap.data().name || docSnap.id}`);
    }

    // 2. Add new FoodPanda-style restaurants
    console.log('\n✅ Adding FoodPanda-style restaurants...');
    for (const restaurant of foodPandaStyleRestaurants) {
      await setDoc(doc(db, 'restaurants', restaurant.id), {
        ...restaurant,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`   ✅ Added: ${restaurant.outletName}`);
    }

    console.log('\n🎉 Successfully updated restaurants to FoodPanda-style!');
    console.log('\n📋 Current Restaurants:');
    foodPandaStyleRestaurants.forEach(restaurant => {
      console.log(`   - ${restaurant.outletName} (${restaurant.cuisineTags.join(', ')})`);
    });

  } catch (error) {
    console.error('❌ Error updating restaurants:', error);
    process.exit(1);
  }
}

// Run the script
updateRestaurantsToFoodPandaStyle();
